import { useState } from 'react';
import { UserPlus, Check, X, Users, Clock, UserMinus } from 'lucide-react';
import type { Friendship } from '../../hooks/useFriends';

interface FriendsPanelProps {
  friends: Friendship[];
  pendingIncoming: Friendship[];
  pendingOutgoing: Friendship[];
  onSendRequest: (username: string) => Promise<{ error: Error | null }>;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRemove: (id: string) => void;
}

const STATUS_DOT: Record<string, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  dnd: 'bg-red-500',
  offline: 'bg-dc-muted-fg',
};

function FriendAvatar({ name, avatarUrl, status }: { name: string; avatarUrl: string | null; status: string }) {
  return (
    <div className="relative flex-shrink-0">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} crossOrigin="anonymous" className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fox-500 to-fox-700 text-xs font-bold text-white">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-dc-sidebar ${STATUS_DOT[status] ?? 'bg-dc-muted-fg'}`} />
    </div>
  );
}

export default function FriendsPanel({ friends, pendingIncoming, pendingOutgoing, onSendRequest, onAccept, onReject, onRemove }: FriendsPanelProps) {
  const [tab, setTab] = useState<'all' | 'pending' | 'add'>('all');
  const [addUsername, setAddUsername] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!addUsername.trim()) return;
    setSending(true);
    setAddError('');
    setAddSuccess('');
    const { error } = await onSendRequest(addUsername.trim());
    setSending(false);
    if (error) { setAddError(error.message); }
    else { setAddSuccess(`${addUsername} kullanıcısına istek gönderildi!`); setAddUsername(''); }
  };

  const pendingCount = pendingIncoming.length;

  return (
    <div className="flex h-full flex-col bg-dc-bg">
      {/* Header */}
      <div className="flex h-14 flex-shrink-0 items-center gap-2 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Users className="h-5 w-5 text-fox-400" />
        <span className="text-sm font-bold text-dc-text-primary">Arkadaşlar</span>

        <div className="ml-4 flex items-center gap-1">
          {[
            { key: 'all' as const, label: `Tümü${friends.length > 0 ? ` ${friends.length}` : ''}` },
            { key: 'pending' as const, label: `Bekliyor${pendingCount > 0 ? ` ${pendingCount}` : ''}` },
            { key: 'add' as const, label: 'Arkadaş Ekle' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-all ${tab === t.key ? 'bg-fox-500/20 text-fox-300' : 'text-dc-muted-fg hover:bg-dc-channel-hover hover:text-dc-text-secondary'}`}
            >
              {t.label}
              {t.key === 'pending' && pendingCount > 0 && (
                <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-dc-surface">
        {tab === 'all' && (
          <>
            {friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-16 w-16 text-dc-muted-fg/30 mb-4" />
                <p className="text-dc-muted-fg">Henüz arkadaşın yok.</p>
                <button onClick={() => setTab('add')} className="mt-3 text-sm text-fox-400 hover:text-fox-300 transition-colors">Arkadaş ekle</button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-dc-muted-fg/70">Tüm Arkadaşlar — {friends.length}</p>
                {friends.map(f => (
                  <div key={f.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-dc-channel-hover/60 group transition-all">
                    <FriendAvatar name={f.friend.display_name} avatarUrl={f.friend.avatar_url} status={f.friend.status} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-semibold text-dc-text-primary truncate">{f.friend.display_name}</span>
                      <span className="text-xs text-dc-muted-fg capitalize">{f.friend.status === 'online' ? 'Çevrimiçi' : f.friend.status === 'idle' ? 'Uzakta' : f.friend.status === 'dnd' ? 'Rahatsız Etme' : 'Çevrimdışı'}</span>
                    </div>
                    <button
                      onClick={() => onRemove(f.id)}
                      className="hidden group-hover:flex h-7 w-7 items-center justify-center rounded-lg text-dc-muted-fg hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Arkadaşlıktan çıkar"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'pending' && (
          <div className="flex flex-col gap-4">
            {pendingIncoming.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-dc-muted-fg/70">Gelen İstekler — {pendingIncoming.length}</p>
                <div className="flex flex-col gap-1">
                  {pendingIncoming.map(f => (
                    <div key={f.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-dc-channel-hover/60 transition-all">
                      <FriendAvatar name={f.friend.display_name} avatarUrl={f.friend.avatar_url} status={f.friend.status} />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-semibold text-dc-text-primary truncate">{f.friend.display_name}</span>
                        <span className="text-xs text-dc-muted-fg">Arkadaşlık isteği gönderdi</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => onAccept(f.id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-all">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => onReject(f.id)} className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pendingOutgoing.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-dc-muted-fg/70">Giden İstekler — {pendingOutgoing.length}</p>
                <div className="flex flex-col gap-1">
                  {pendingOutgoing.map(f => (
                    <div key={f.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-dc-channel-hover/60 transition-all">
                      <FriendAvatar name={f.friend.display_name} avatarUrl={f.friend.avatar_url} status={f.friend.status} />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-semibold text-dc-text-primary truncate">{f.friend.display_name}</span>
                        <span className="text-xs text-dc-muted-fg">İstek gönderildi</span>
                      </div>
                      <Clock className="h-4 w-4 text-dc-muted-fg/60" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pendingIncoming.length === 0 && pendingOutgoing.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Clock className="h-16 w-16 text-dc-muted-fg/30 mb-4" />
                <p className="text-dc-muted-fg">Bekleyen arkadaşlık isteği yok.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'add' && (
          <div className="flex flex-col gap-4 max-w-md">
            <div>
              <h3 className="text-base font-bold text-dc-text-primary">Arkadaş Ekle</h3>
              <p className="mt-1 text-sm text-dc-muted-fg">Kullanıcı adıyla arkadaşlık isteği gönder.</p>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-dc-surface px-3 py-2.5 ring-1 ring-transparent focus-within:ring-fox-500/50 transition-all">
                <span className="text-sm text-dc-muted-fg">@</span>
                <input
                  value={addUsername}
                  onChange={e => setAddUsername(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  placeholder="kullanıcı_adı"
                  className="flex-1 bg-transparent text-sm text-dc-text-primary outline-none placeholder:text-dc-muted-fg/50"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={sending || !addUsername.trim()}
                className="flex items-center gap-2 rounded-xl bg-fox-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-fox-600 disabled:opacity-50 transition-all"
              >
                <UserPlus className="h-4 w-4" />
                {sending ? '...' : 'Gönder'}
              </button>
            </div>
            {addError && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400">{addError}</p>}
            {addSuccess && <p className="rounded-xl bg-green-500/10 px-3 py-2 text-sm text-green-400">{addSuccess}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
