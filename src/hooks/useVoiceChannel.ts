import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface VoiceParticipant {
  userId: string;
  displayName: string;
  isMuted: boolean;
  isSpeaking: boolean;
  avatarUrl?: string | null;
  isScreenSharing?: boolean;
}

type VoicePresenceData = {
  userId: string;
  displayName: string;
  isMuted: boolean;
  avatarUrl?: string | null;
  isScreenSharing?: boolean;
};

const STUN: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export function useVoiceChannel(
  myUserId: string | null,
  myDisplayName: string | null,
  myAvatarUrl?: string | null,
) {
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [connectedChannelId, setConnectedChannelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listenOnly, setListenOnly] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStreams, setScreenStreams] = useState<Map<string, MediaStream>>(new Map());

  const rtCh = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const screenStream = useRef<MediaStream | null>(null);
  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const screenSenders = useRef<Map<string, RTCRtpSender>>(new Map());
  const audioEls = useRef<Map<string, HTMLAudioElement>>(new Map());
  const iceQueue = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const audioCtx = useRef<AudioContext | null>(null);
  const analysers = useRef<Map<string, AnalyserNode>>(new Map());
  const rafId = useRef(0);
  const isMutedRef = useRef(isMuted);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Speaking detection loop
  const startSpeakingLoop = useCallback(() => {
    const loop = () => {
      analysers.current.forEach((an, uid) => {
        const data = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setParticipants(prev =>
          prev.map(p => p.userId === uid ? { ...p, isSpeaking: avg > 12 } : p)
        );
      });
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);
  }, []);

  const flushIce = useCallback(async (peerId: string, peer: RTCPeerConnection) => {
    for (const c of iceQueue.current.get(peerId) ?? []) {
      try { await peer.addIceCandidate(c); } catch { /* ignore */ }
    }
    iceQueue.current.delete(peerId);
  }, []);

  const createPeer = useCallback((peerId: string): RTCPeerConnection => {
    // Close any existing peer for this ID
    peers.current.get(peerId)?.close();

    const peer = new RTCPeerConnection(STUN);

    // Add local audio track
    localStream.current?.getTracks().forEach(t => peer.addTrack(t, localStream.current!));

    // Add local screen track if currently sharing
    if (screenStream.current) {
      const videoTrack = screenStream.current.getVideoTracks()[0];
      if (videoTrack) {
        const sender = peer.addTrack(videoTrack, screenStream.current);
        screenSenders.current.set(peerId, sender);
      }
    }

    peer.ontrack = ({ track, streams }) => {
      const stream = streams[0];
      if (!stream) return;

      if (track.kind === 'audio') {
        let el = audioEls.current.get(peerId);
        if (!el) {
          el = new Audio();
          el.autoplay = true;
          el.dataset.voice = 'true';
          document.body.appendChild(el);
          audioEls.current.set(peerId, el);
        }
        el.srcObject = stream;

        // Speaking detection for remote
        try {
          if (!audioCtx.current) audioCtx.current = new AudioContext();
          const src = audioCtx.current.createMediaStreamSource(stream);
          const an = audioCtx.current.createAnalyser(); an.fftSize = 256;
          src.connect(an);
          analysers.current.set(peerId, an);
        } catch { /* ignore */ }
      } else if (track.kind === 'video') {
        // Remote screen share
        setScreenStreams(prev => new Map(prev).set(peerId, stream));
        // Update participant isScreenSharing state
        setParticipants(prev => prev.map(p => p.userId === peerId ? { ...p, isScreenSharing: true } : p));
        track.onended = () => {
          setScreenStreams(prev => {
            const next = new Map(prev); next.delete(peerId); return next;
          });
          setParticipants(prev => prev.map(p => p.userId === peerId ? { ...p, isScreenSharing: false } : p));
        };
      }
    };

    peer.onicecandidate = ({ candidate }) => {
      if (candidate) {
        rtCh.current?.send({
          type: 'broadcast', event: 'ice',
          payload: { from: myUserId, to: peerId, c: candidate.toJSON() },
        });
      }
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
        peers.current.delete(peerId);
        screenSenders.current.delete(peerId);
        const el = audioEls.current.get(peerId);
        if (el) { el.srcObject = null; el.parentNode?.removeChild(el); audioEls.current.delete(peerId); }
        analysers.current.delete(peerId);
        setScreenStreams(prev => { const next = new Map(prev); next.delete(peerId); return next; });
        setParticipants(prev => prev.filter(p => p.userId !== peerId));
      }
    };

    peers.current.set(peerId, peer);
    return peer;
  }, [myUserId]);

  const joinChannel = useCallback(async (channelId: string, silent = false) => {
    if (!myUserId || !myDisplayName || isConnected) return;
    setError(null);
    setListenOnly(false);

    if (!silent) {
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setError('MIC_DENIED');
        return;
      }
    } else {
      localStream.current = null;
      setListenOnly(true);
    }

    // Local speaking detection (only when mic is active)
    if (localStream.current) {
      try {
        if (!audioCtx.current) audioCtx.current = new AudioContext();
        const src = audioCtx.current.createMediaStreamSource(localStream.current);
        const an = audioCtx.current.createAnalyser(); an.fftSize = 256;
        src.connect(an);
        analysers.current.set(myUserId, an);
      } catch { /* ignore */ }
    }

    const ch = supabase.channel(`voice:${channelId}`, {
      config: { presence: { key: myUserId } },
    });
    rtCh.current = ch;

    // Presence sync — rebuild participant list
    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState<VoicePresenceData>();
      setParticipants(
        Object.values(state).flat().map(u => ({
          userId: u.userId,
          displayName: u.displayName,
          isMuted: u.isMuted,
          isSpeaking: false,
          avatarUrl: u.avatarUrl,
          isScreenSharing: u.isScreenSharing ?? false,
        }))
      );
    });

    // New user joins — use userId ordering to avoid duplicate offers
    ch.on('presence', { event: 'join' }, ({ newPresences }) => {
      newPresences.forEach(async p => {
        const np = p as VoicePresenceData;
        if (np.userId === myUserId) return;
        // Only the user with greater ID sends the offer to avoid duplicates
        if (myUserId > np.userId) {
          const peer = createPeer(np.userId);
          try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            ch.send({
              type: 'broadcast', event: 'offer',
              payload: { from: myUserId, to: np.userId, sdp: { type: offer.type, sdp: offer.sdp } },
            });
          } catch { /* ignore */ }
        }
      });
    });

    // User left
    ch.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      leftPresences.forEach(p => {
        const lp = p as VoicePresenceData;
        peers.current.get(lp.userId)?.close();
        peers.current.delete(lp.userId);
        screenSenders.current.delete(lp.userId);
        const el = audioEls.current.get(lp.userId);
        if (el) { el.srcObject = null; el.parentNode?.removeChild(el); audioEls.current.delete(lp.userId); }
        analysers.current.delete(lp.userId);
        setScreenStreams(prev => { const next = new Map(prev); next.delete(lp.userId); return next; });
        setParticipants(prev => prev.filter(x => x.userId !== lp.userId));
      });
    });

    // Receive offer — reuse existing peer for renegotiation
    ch.on('broadcast', { event: 'offer' }, async ({ payload }) => {
      if (payload.to !== myUserId) return;
      // Reuse existing peer connection for renegotiation (e.g. screen share)
      let peer = peers.current.get(payload.from);
      if (!peer || peer.connectionState === 'closed' || peer.connectionState === 'failed') {
        peer = createPeer(payload.from);
      }
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        await flushIce(payload.from, peer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        ch.send({
          type: 'broadcast', event: 'answer',
          payload: { from: myUserId, to: payload.from, sdp: { type: answer.type, sdp: answer.sdp } },
        });
      } catch { /* ignore */ }
    });

    // Receive answer
    ch.on('broadcast', { event: 'answer' }, async ({ payload }) => {
      if (payload.to !== myUserId) return;
      const peer = peers.current.get(payload.from);
      if (peer) {
        try {
          await peer.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          await flushIce(payload.from, peer);
        } catch { /* ignore */ }
      }
    });

    // ICE candidates
    ch.on('broadcast', { event: 'ice' }, async ({ payload }) => {
      if (payload.to !== myUserId) return;
      const peer = peers.current.get(payload.from);
      if (!peer) return;
      if (peer.remoteDescription) {
        try { await peer.addIceCandidate(payload.c); } catch { /* ignore */ }
      } else {
        const q = iceQueue.current.get(payload.from) ?? [];
        q.push(payload.c);
        iceQueue.current.set(payload.from, q);
      }
    });

    ch.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        await ch.track({
          userId: myUserId,
          displayName: myDisplayName,
          isMuted: silent,
          avatarUrl: myAvatarUrl ?? null,
          isScreenSharing: false,
        });
        setIsConnected(true);
        setConnectedChannelId(channelId);
        startSpeakingLoop();
      }
    });
  }, [myUserId, myDisplayName, myAvatarUrl, isConnected, createPeer, flushIce, startSpeakingLoop]);

  const leaveChannel = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    analysers.current.clear();
    peers.current.forEach(p => p.close());
    peers.current.clear();
    screenSenders.current.clear();
    audioEls.current.forEach(el => { el.srcObject = null; el.parentNode?.removeChild(el); });
    audioEls.current.clear();
    localStream.current?.getTracks().forEach(t => t.stop());
    localStream.current = null;
    screenStream.current?.getTracks().forEach(t => t.stop());
    screenStream.current = null;
    audioCtx.current?.close().catch(() => { /* ignore */ });
    audioCtx.current = null;
    if (rtCh.current) { supabase.removeChannel(rtCh.current); rtCh.current = null; }
    iceQueue.current.clear();
    setIsConnected(false);
    setConnectedChannelId(null);
    setParticipants([]);
    setIsMuted(false);
    setIsDeafened(false);
    setListenOnly(false);
    setIsScreenSharing(false);
    setScreenStreams(new Map());
  }, []);

  const toggleMute = useCallback(() => {
    if (!localStream.current) return;
    const track = localStream.current.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    const muted = !track.enabled;
    setIsMuted(muted);
    rtCh.current?.track({ userId: myUserId, displayName: myDisplayName, isMuted: muted, avatarUrl: myAvatarUrl ?? null, isScreenSharing: isScreenSharing });
  }, [myUserId, myDisplayName, myAvatarUrl, isScreenSharing]);

  const toggleDeafen = useCallback(() => {
    setIsDeafened(prev => {
      const nd = !prev;
      audioEls.current.forEach(el => { el.muted = nd; });
      if (nd) {
        localStream.current?.getAudioTracks().forEach(t => { t.enabled = false; });
        setIsMuted(true);
        rtCh.current?.track({ userId: myUserId, displayName: myDisplayName, isMuted: true, avatarUrl: myAvatarUrl ?? null, isScreenSharing: isScreenSharing });
      }
      return nd;
    });
  }, [myUserId, myDisplayName, myAvatarUrl, isScreenSharing]);

  const startScreenShare = useCallback(async () => {
    if (!isConnected || !myUserId || !rtCh.current) return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStream.current = stream;
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;

      setIsScreenSharing(true);

      // Add video track to all existing peer connections and renegotiate
      for (const [peerId, peer] of peers.current.entries()) {
        try {
          const sender = peer.addTrack(videoTrack, stream);
          screenSenders.current.set(peerId, sender);
          // Send re-offer so the remote side knows about the new video track
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          rtCh.current.send({
            type: 'broadcast', event: 'offer',
            payload: { from: myUserId, to: peerId, sdp: { type: offer.type, sdp: offer.sdp } },
          });
        } catch { /* ignore */ }
      }

      // Broadcast presence update
      rtCh.current.track({
        userId: myUserId, displayName: myDisplayName,
        isMuted: isMutedRef.current, avatarUrl: myAvatarUrl ?? null, isScreenSharing: true,
      });

      // Handle when user stops sharing via browser stop button
      videoTrack.onended = () => {
        screenStream.current?.getTracks().forEach(t => t.stop());
        screenStream.current = null;
        setIsScreenSharing(false);
        // Remove senders from peer connections
        screenSenders.current.forEach((sender, peerId) => {
          try { peers.current.get(peerId)?.removeTrack(sender); } catch { /* ignore */ }
        });
        screenSenders.current.clear();
        rtCh.current?.track({
          userId: myUserId, displayName: myDisplayName,
          isMuted: isMutedRef.current, avatarUrl: myAvatarUrl ?? null, isScreenSharing: false,
        });
      };
    } catch { /* user cancelled or browser denied */ }
  }, [isConnected, myUserId, myDisplayName, myAvatarUrl]);

  const stopScreenShare = useCallback(() => {
    screenStream.current?.getTracks().forEach(t => t.stop());
    screenStream.current = null;
    setIsScreenSharing(false);
    // Remove senders from peer connections
    screenSenders.current.forEach((sender, peerId) => {
      try { peers.current.get(peerId)?.removeTrack(sender); } catch { /* ignore */ }
    });
    screenSenders.current.clear();
    rtCh.current?.track({
      userId: myUserId, displayName: myDisplayName,
      isMuted: isMutedRef.current, avatarUrl: myAvatarUrl ?? null, isScreenSharing: false,
    });
  }, [myUserId, myDisplayName, myAvatarUrl]);

  // Cleanup on unmount
  useEffect(() => {
    const peersMap = peers.current;
    const streamRef = localStream;
    const screenRef = screenStream;
    const chRef = rtCh;
    const raf = rafId;
    const audioElsMap = audioEls;
    return () => {
      cancelAnimationFrame(raf.current);
      peersMap.forEach(p => p.close());
      streamRef.current?.getTracks().forEach(t => t.stop());
      screenRef.current?.getTracks().forEach(t => t.stop());
      audioElsMap.current.forEach(el => { el.srcObject = null; el.parentNode?.removeChild(el); });
      if (chRef.current) supabase.removeChannel(chRef.current);
    };
  }, []);

  return {
    participants,
    isConnected,
    isMuted,
    isDeafened,
    listenOnly,
    connectedChannelId,
    error,
    isScreenSharing,
    screenStreams,
    joinChannel,
    leaveChannel,
    toggleMute,
    toggleDeafen,
    startScreenShare,
    stopScreenShare,
  };
}
