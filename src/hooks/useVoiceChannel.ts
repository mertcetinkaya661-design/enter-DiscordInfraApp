import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface VoiceParticipant {
  userId: string;
  displayName: string;
  isMuted: boolean;
  isSpeaking: boolean;
  avatarUrl?: string | null;
}

type VoicePresenceData = {
  userId: string;
  displayName: string;
  isMuted: boolean;
  avatarUrl?: string | null;
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

  const rtCh = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioEls = useRef<Map<string, HTMLAudioElement>>(new Map());
  const iceQueue = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const audioCtx = useRef<AudioContext | null>(null);
  const analysers = useRef<Map<string, AnalyserNode>>(new Map());
  const rafId = useRef(0);

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

    localStream.current?.getTracks().forEach(t => peer.addTrack(t, localStream.current!));

    peer.ontrack = ({ streams: [stream] }) => {
      if (!stream) return;
      let el = audioEls.current.get(peerId);
      if (!el) { el = new Audio(); el.autoplay = true; audioEls.current.set(peerId, el); }
      el.srcObject = stream;

      // Speaking detection for remote
      try {
        if (!audioCtx.current) audioCtx.current = new AudioContext();
        const src = audioCtx.current.createMediaStreamSource(stream);
        const an = audioCtx.current.createAnalyser(); an.fftSize = 256;
        src.connect(an);
        analysers.current.set(peerId, an);
      } catch { /* ignore */ }
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
        const el = audioEls.current.get(peerId);
        if (el) { el.srcObject = null; audioEls.current.delete(peerId); }
        analysers.current.delete(peerId);
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
        }))
      );
    });

    // New user joins — existing users each send an offer
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
        const el = audioEls.current.get(lp.userId);
        if (el) { el.srcObject = null; audioEls.current.delete(lp.userId); }
        analysers.current.delete(lp.userId);
        setParticipants(prev => prev.filter(x => x.userId !== lp.userId));
      });
    });

    // Receive offer (the user with lower ID receives and answers)
    ch.on('broadcast', { event: 'offer' }, async ({ payload }) => {
      if (payload.to !== myUserId) return;
      const peer = createPeer(payload.from);
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
    audioEls.current.forEach(el => { el.srcObject = null; });
    audioEls.current.clear();
    localStream.current?.getTracks().forEach(t => t.stop());
    localStream.current = null;
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
  }, []);

  const toggleMute = useCallback(() => {
    if (!localStream.current) return;
    const track = localStream.current.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    const muted = !track.enabled;
    setIsMuted(muted);
    rtCh.current?.track({ userId: myUserId, displayName: myDisplayName, isMuted: muted, avatarUrl: myAvatarUrl ?? null });
  }, [myUserId, myDisplayName, myAvatarUrl]);

  const toggleDeafen = useCallback(() => {
    setIsDeafened(prev => {
      const nd = !prev;
      audioEls.current.forEach(el => { el.muted = nd; });
      if (nd) {
        localStream.current?.getAudioTracks().forEach(t => { t.enabled = false; });
        setIsMuted(true);
        rtCh.current?.track({ userId: myUserId, displayName: myDisplayName, isMuted: true, avatarUrl: myAvatarUrl ?? null });
      }
      return nd;
    });
  }, [myUserId, myDisplayName, myAvatarUrl]);

  // Cleanup on unmount
  useEffect(() => {
    const peersMap = peers.current;
    const streamRef = localStream;
    const chRef = rtCh;
    const raf = rafId;
    return () => {
      cancelAnimationFrame(raf.current);
      peersMap.forEach(p => p.close());
      streamRef.current?.getTracks().forEach(t => t.stop());
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
    joinChannel,
    leaveChannel,
    toggleMute,
    toggleDeafen,
  };
}


export function useVoiceChannel(myUserId: string | null, myDisplayName: string | null) {
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [connectedChannelId, setConnectedChannelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listenOnly, setListenOnly] = useState(false);

  const rtCh = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const peers = useRef<Map<string, RTCPeerConnection>>(new Map());
  const audioEls = useRef<Map<string, HTMLAudioElement>>(new Map());
  const iceQueue = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const audioCtx = useRef<AudioContext | null>(null);
  const analysers = useRef<Map<string, AnalyserNode>>(new Map());
  const rafId = useRef(0);

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
    const peer = new RTCPeerConnection(STUN);

    localStream.current?.getTracks().forEach(t => peer.addTrack(t, localStream.current!));

    peer.ontrack = ({ streams: [stream] }) => {
      let el = audioEls.current.get(peerId);
      if (!el) { el = new Audio(); el.autoplay = true; audioEls.current.set(peerId, el); }
      el.srcObject = stream;

      // Speaking detection for remote
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      try {
        const src = audioCtx.current.createMediaStreamSource(stream);
        const an = audioCtx.current.createAnalyser(); an.fftSize = 256;
        src.connect(an);
        analysers.current.set(peerId, an);
      } catch { /* ignore */ }
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
        const el = audioEls.current.get(peerId);
        if (el) { el.srcObject = null; audioEls.current.delete(peerId); }
        analysers.current.delete(peerId);
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
        // Mic denied — ask user if they want to join silently
        setError('MIC_DENIED');
        return;
      }
    } else {
      // Listen-only: no local stream
      localStream.current = null;
      setListenOnly(true);
    }

    // Local speaking detection
    if (!audioCtx.current) audioCtx.current = new AudioContext();
    try {
      const src = audioCtx.current.createMediaStreamSource(localStream.current);
      const an = audioCtx.current.createAnalyser(); an.fftSize = 256;
      src.connect(an);
      analysers.current.set(myUserId, an);
    } catch { /* ignore */ }

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
        }))
      );
    });

    // Existing user sends offer to new joiner
    ch.on('presence', { event: 'join' }, ({ newPresences }) => {
      newPresences.forEach(async p => {
        const np = p as VoicePresenceData;
        if (np.userId === myUserId) return;
        const peer = createPeer(np.userId);
        try {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          ch.send({
            type: 'broadcast', event: 'offer',
            payload: { from: myUserId, to: np.userId, sdp: { type: offer.type, sdp: offer.sdp } },
          });
        } catch { /* ignore */ }
      });
    });

    // User left
    ch.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      leftPresences.forEach(p => {
        const lp = p as VoicePresenceData;
        peers.current.get(lp.userId)?.close();
        peers.current.delete(lp.userId);
        const el = audioEls.current.get(lp.userId);
        if (el) { el.srcObject = null; audioEls.current.delete(lp.userId); }
        analysers.current.delete(lp.userId);
        setParticipants(prev => prev.filter(x => x.userId !== lp.userId));
      });
    });

    // Receive offer (new joiner)
    ch.on('broadcast', { event: 'offer' }, async ({ payload }) => {
      if (payload.to !== myUserId) return;
      const peer = createPeer(payload.from);
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

    // Receive answer (original offerer)
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
        await ch.track({ userId: myUserId, displayName: myDisplayName, isMuted: false });
        setIsConnected(true);
        setConnectedChannelId(channelId);
        startSpeakingLoop();
      }
    });
  }, [myUserId, myDisplayName, isConnected, createPeer, flushIce, startSpeakingLoop]);

  const leaveChannel = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    analysers.current.clear();
    peers.current.forEach(p => p.close());
    peers.current.clear();
    audioEls.current.forEach(el => { el.srcObject = null; });
    audioEls.current.clear();
    localStream.current?.getTracks().forEach(t => t.stop());
    localStream.current = null;
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
  }, []);

  const toggleMute = useCallback(() => {
    if (!localStream.current) return;
    const track = localStream.current.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    const muted = !track.enabled;
    setIsMuted(muted);
    rtCh.current?.track({ userId: myUserId, displayName: myDisplayName, isMuted: muted });
  }, [myUserId, myDisplayName]);

  const toggleDeafen = useCallback(() => {
    setIsDeafened(prev => {
      const nd = !prev;
      audioEls.current.forEach(el => { el.muted = nd; });
      if (nd) {
        localStream.current?.getAudioTracks().forEach(t => { t.enabled = false; });
        setIsMuted(true);
        rtCh.current?.track({ userId: myUserId, displayName: myDisplayName, isMuted: true });
      }
      return nd;
    });
  }, [myUserId, myDisplayName]);

  // Cleanup on unmount
  useEffect(() => {
    const peersMap = peers.current;
    const streamRef = localStream;
    const chRef = rtCh;
    const raf = rafId;
    return () => {
      cancelAnimationFrame(raf.current);
      peersMap.forEach(p => p.close());
      streamRef.current?.getTracks().forEach(t => t.stop());
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
    joinChannel,
    leaveChannel,
    toggleMute,
    toggleDeafen,
  };
}
