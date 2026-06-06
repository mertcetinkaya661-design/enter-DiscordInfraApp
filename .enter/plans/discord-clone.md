# Voice Chat Implementation Plan

## Context
Currently voice channels show a static placeholder with a non-functional "Kanala Katıl" button.
The goal is to implement real WebRTC voice chat using Supabase Realtime as the signaling server.

## Files to Create
- `src/hooks/useVoiceChannel.ts` — WebRTC + Supabase Realtime signaling hook

## Files to Modify
- `src/pages/DiscordApp.tsx` — Add VoicePanel component, integrate voice state at top level

---

## Implementation

### 1. `useVoiceChannel.ts` hook
- Request microphone via `navigator.mediaDevices.getUserMedia({ audio: true })`
- Create `supabase.channel("voice:{channelId}")` with **presence** (tracks who is in channel)
- **Signaling flow** (Supabase Realtime broadcasts):
  - When existing user detects a `presence join` → sends WebRTC **offer** to the newcomer
  - Newcomer receives offer → creates **answer** → sends back
  - Both sides exchange **ICE candidates** (queued if remote description not yet set)
- **Audio**: `peer.ontrack` → `new Audio()` element with `autoplay`
- **Speaking detection**: `AudioContext + AnalyserNode` → polling via `requestAnimationFrame`
- Exposes: `participants, isConnected, isMuted, isDeafened, connectedChannelId, error, joinChannel, leaveChannel, toggleMute, toggleDeafen`

### 2. VoicePanel component (in DiscordApp.tsx)
**Not connected view:**
- Large Volume2 icon, channel name, optional error message
- "Kanala Katıl" button that calls `joinChannel(channelId)`

**Connected view:**
- Header: channel name + green "X bağlı" indicator
- Participant grid: avatar circles, speaking ring (fox-orange glow), muted icon overlay
- Controls bar: Mic toggle, Headphones/Deafen toggle, PhoneOff (leave) button

### 3. DiscordApp.tsx changes
- Import `useVoiceChannel` and new icons: `MicOff, Headphones, VolumeX, PhoneOff`
- Call `useVoiceChannel` at top level (persists while navigating between channels)
- Main content: render `VoicePanel` when `activeChannel.type === 'voice'`, else `ChatPanel`
- Remove voice handling from `ChatPanel` (the static placeholder block)
- Channel sidebar: show a "voice connected" mini-bar above the user panel when `voice.isConnected`
  - Shows channel name, mic toggle, leave button

## Verification
1. Two users open the app → join the same voice channel → hear each other
2. Speaking indicator pulses orange when audio level > threshold
3. Mute/Deafen buttons work and update presence
4. Leave disconnects WebRTC and removes from participant list
5. Navigating to a text channel while in voice keeps the connection alive (mini-bar visible)
