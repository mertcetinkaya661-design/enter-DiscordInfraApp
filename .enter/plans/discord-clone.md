# FIX — 8 New Feature Plan

## Context
Adding 8 major features to the existing FIX Discord-clone. Codebase is React+TypeScript+Tailwind
with Supabase (auth, DB, Realtime, Storage). Core hooks: useAuth, useServers, useMessages, useVoiceChannel.

---

## 1. Push Bildirimleri (Browser Notifications)
**Where:** `useMessages.ts`
- `Notification.requestPermission()` on first render
- On Realtime `INSERT`, if `document.hidden && permission === 'granted'` → `new Notification(...)`
- Shows: server name + channel + message preview

---

## 2. Arkadaş Sistemi (Friend System)
**DB Migration:**
```sql
CREATE TABLE friendships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- pending | accepted | blocked
  created_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);
-- RLS: users can only see rows where they are sender or receiver
```
**New hook:** `src/hooks/useFriends.ts`
- `friends` (accepted), `pendingIncoming`, `pendingOutgoing`
- `sendFriendRequest(username)`, `acceptRequest(id)`, `rejectRequest(id)`, `blockUser(id)`

**UI in `DiscordApp.tsx`:**
- Friends icon button in server sidebar (below FIX logo, above servers)
- When clicked: `activeServerId = null` → shows `FriendsPanel` instead of channel sidebar
- **`FriendsPanel.tsx`:** Tabs (Tüm / Bekliyor), add-friend input (search by username)

---

## 3. Profil Resmi Yükleme (Avatar Upload)
**Storage:** Create `avatars` bucket (public) via migration
**Update `Avatar` component:** Show `<img src={avatar_url}>` when present, fallback to initials

**New `ProfileSettingsModal.tsx`:**
- Opened by clicking user avatar in the bottom-left user panel
- File input → `supabase.storage.from('avatars').upload(userId, file)` → getPublicUrl → update profiles
- Change display name, custom status
- Status picker: Çevrimiçi / Meşgul / Rahatsız Etme / Görünmez

---

## 4. Çevrimiçi Durumu (Online Status)
**`useAuth.ts`:**
- After session: `updateStatus('online')`
- On `window.beforeunload` + signOut: `updateStatus('offline')`

**Members sidebar in `DiscordApp.tsx`:**
- Fetch member profiles via Realtime subscription on `profiles` table changes
- Status dot on each avatar: green=online, yellow=idle (not in schema yet - keep simple), red=dnd, gray=offline

---

## 5. Yazıyor Göstergesi (Typing Indicator)
**New hook:** `src/hooks/useTyping.ts`
- Subscribe to Supabase Realtime broadcast channel `typing:{channelId}`
- `startTyping()`: broadcast `{ userId, displayName }`, auto-cancel after 3s
- Returns: `typingUsers: { userId, displayName }[]`

**`ChatPanel` update:**
- Attach to textarea `onInput` → call `startTyping()`
- Show below messages: "Ali yazıyor...", "Ali ve Veli yazıyor...", "Birkaç kişi yazıyor..."
- Animated dots (`animate-bounce`)

---

## 6. Mesaj Arama (Message Search)
**`useMessages.ts`:** Add `searchMessages(query, channelId)` → `.ilike('content', '%q%')`

**`ChatPanel` update:**
- Search button (already in header) → toggles `showSearch` state
- Search overlay slides in from right (replaces member sidebar)
- Debounced input → show result list with author + timestamp + snippet

---

## 7. Bot Desteği (Slash Commands)
**Simple frontend-only command processor in `ChatPanel`:**
- Detect messages starting with `/`
- Commands: `/help`, `/roll [max]`, `/coin`, `/shrug`, `/serverinfo`
- Responses injected into local message list as fake "FIX Bot" messages (not saved to DB)
- Bot messages styled with a robot icon and different bubble color

**DB:** Add `is_bot boolean DEFAULT false` to profiles (for future real bots)

---

## 8. Moderasyon Araçları (Moderation Tools)
**DB Migration:**
```sql
CREATE TABLE server_bans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id uuid REFERENCES servers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by uuid REFERENCES profiles(id),
  reason text,
  banned_at timestamptz DEFAULT now(),
  UNIQUE(server_id, user_id)
);
-- RLS: server admins/owners can manage bans
```
**Update messages RLS:** Allow owner/admin to delete any message in their server

**`useServers.ts` additions:** `kickMember(serverId, userId)`, `banMember(serverId, userId, reason)`, `unbanMember(serverId, userId)`

**UI in `DiscordApp.tsx`:**
- Right-click / "..." menu on member in Members sidebar → Kick / Ban (admin+owner only)
- Message hover → "sil" button visible to admins (not just own messages)
- Server settings gear icon → opens `ServerSettingsModal` with Yasaklılar tab

---

## Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useFriends.ts` | Friend requests + list |
| `src/hooks/useTyping.ts` | Typing indicator |
| `src/components/discord/ProfileSettingsModal.tsx` | Avatar + profile edit |
| `src/components/discord/FriendsPanel.tsx` | Friends UI |

## Files to Modify
| File | Changes |
|------|---------|
| `src/hooks/useAuth.ts` | Online status on login/logout |
| `src/hooks/useMessages.ts` | Push notifications + searchMessages |
| `src/hooks/useServers.ts` | kickMember, banMember, unban |
| `src/pages/DiscordApp.tsx` | Typing indicator, search, bot cmds, moderation menus, profile modal |
| `src/pages/DiscordApp.tsx` > `Avatar` | Show avatar_url image |

## DB Migrations (1 combined script)
1. `friendships` table + RLS
2. `server_bans` table + RLS
3. `profiles.is_bot` column
4. `avatars` Storage bucket (public)
5. Updated `messages_delete` RLS → allow server owner/admin to delete

## Verification
- Push: open 2 tabs, send message in tab 2, tab 1 shows browser notification
- Friends: search username → request sent → other user sees "Bekliyor" tab
- Avatar: upload image → immediately shown in sidebar + members list
- Online: log out → other users see gray dot
- Typing: type in input → other users see "X yazıyor..."
- Search: type keyword → results list updates in <300ms
- Bot: `/roll` returns 1-6 instantly
- Moderation: admin right-clicks member → Kick option visible
