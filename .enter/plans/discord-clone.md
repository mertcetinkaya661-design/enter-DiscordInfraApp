# FIX Ultimate — Full Feature Plan

## Already Done
- JWT auth, signup, profile system
- Server CRUD (create, invite codes)
- Text/voice channels + real-time messaging
- WebRTC voice (mic on/off, speaking detection)
- Message delete, editMessage() hook exists

## What to Build

### 1. User System — profile page, status, avatar color
- Profile settings panel (click username in user panel)
- Change display name, custom status
- Online/Away/DND/Offline status selector

### 2. Server System — deletion + member management
- `deleteServer(serverId)` in useServers.ts
- Server settings modal (gear on header): rename, delete server, member list with kick button

### 3. Channel System — message editing UI + permissions label
- Inline edit on hover (pencil → textarea → Enter saves)
- Channel type badge in header (text/announcement/voice)

### 4. Voice Chat — camera + screen sharing
- `toggleCamera()` in useVoiceChannel.ts (getUserMedia video)
- `toggleScreenShare()` (getDisplayMedia)
- Video feeds in VoicePanel (`<video>` elements for camera-on participants)
- Camera + ScreenShare buttons in controls bar

### 5. File Upload
- Supabase Storage bucket `attachments` (public)
- Paperclip → file input → upload → send URL as message
- Images render inline; other files render as download card

### 6. Roles System
- DB: role already exists on server_members (owner/admin/member)
- UI: Role badge next to name in member sidebar
- Server settings: change member role (owner can set admin/member)
- Channel access: announcement channels = read-only for non-admins

### 7. Notification System
- `useNotifications` hook — tracks unread channel counts via Supabase Realtime
- Red badge on server icons when there are unread messages
- Channel name bold + dot indicator for unread channels
- Browser Notification API for @mentions (future: detect @username in messages)

---

## DB Migration
```sql
-- File attachments
CREATE TABLE message_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL, file_name TEXT, file_size BIGINT, file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications (last read per channel)
CREATE TABLE channel_reads (
  user_id UUID, channel_id UUID,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, channel_id)
);
```
Supabase Storage bucket: `attachments` (public)

## Files to Create/Modify
- `src/hooks/useServers.ts` — deleteServer, kickMember, changeMemberRole
- `src/hooks/useMessages.ts` — file attachment support
- `src/hooks/useVoiceChannel.ts` — camera, screen share
- `src/hooks/useNotifications.ts` — NEW: unread tracking
- `src/pages/DiscordApp.tsx` — all UI: edit messages, server settings modal, file upload, video feeds, role badges, unread indicators
