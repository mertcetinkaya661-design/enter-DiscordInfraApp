# FIX Ultimate — Full Feature Implementation Plan

## Already Working
- JWT auth, signup, session auto-refresh (Supabase handles)
- Password hashing (Supabase built-in)
- Server creation, invite codes
- Text/voice/announcement channels
- Real-time messages, message delete
- WebRTC voice, mic on/off
- editMessage() exists in useMessages.ts but has NO UI

## Features to Implement

---

### 1. Message Editing UI
**File:** `src/pages/DiscordApp.tsx` — `MessageBubble` component
- Add pencil icon on hover (own messages only)
- Click pencil → inline textarea replaces bubble text
- Enter saves, Escape cancels
- Calls existing `editMessage(id, content)` from useMessages

---

### 2. Emoji Reactions
**DB Migration:**
```sql
CREATE TABLE message_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  UNIQUE(message_id, user_id, emoji)
);
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
-- RLS: anyone in channel's server can read, user manages their own
```

**Files:**
- `src/hooks/useMessages.ts` — add `addReaction(msgId, emoji)`, `removeReaction(msgId, emoji)`, fetch reactions per message
- `src/pages/DiscordApp.tsx` — Add emoji picker (6 preset emojis: 👍❤️😂😮😢🔥), reaction counter pills on messages

---

### 3. Server Deletion + Member Management
**Files:**
- `src/hooks/useServers.ts` — add `deleteServer(serverId)`, `kickMember(serverId, userId)`, `changeMemberRole(serverId, userId, role)`
- `src/pages/DiscordApp.tsx` — Server settings panel (gear icon → modal)
  - "Sunucuyu Sil" button (owner only, confirm dialog)
  - Member list with kick button (owner/admin only)

---

### 4. Camera + Screen Sharing in Voice
**File:** `src/hooks/useVoiceChannel.ts`
- Add `localVideoStream` ref for camera
- Add `screenStream` ref for screen share
- Add `isCameraOn`, `isScreenSharing` state
- `toggleCamera()` — getUserMedia({video:true}), add/remove video track from peer connections
- `toggleScreenShare()` — getDisplayMedia(), replace video track
- Return camera/screen state + controls

**File:** `src/pages/DiscordApp.tsx` — `VoicePanel`
- Show local video preview (small box, bottom-right)
- Show remote video feeds in participant cards
- Add Camera button + ScreenShare button to controls bar
- `<video>` elements instead of just `<audio>`

---

### 5. File/Image Upload
**Supabase Storage:** Create `attachments` bucket (public)

**File:** `src/pages/DiscordApp.tsx` — `ChatPanel`
- Paperclip button opens file input
- On file select: upload to Supabase Storage → get public URL
- Send as message content with [image:URL] or [file:URL:name] syntax
- MessageBubble detects `[image:...]` → renders `<img>`
- MessageBubble detects `[file:...]` → renders download link

---

## Files Modified
- `src/hooks/useMessages.ts` — reactions
- `src/hooks/useServers.ts` — delete server, kick member
- `src/hooks/useVoiceChannel.ts` — camera + screen share
- `src/pages/DiscordApp.tsx` — all UI changes

## DB Migrations
- `message_reactions` table with RLS
- Supabase Storage `attachments` bucket
