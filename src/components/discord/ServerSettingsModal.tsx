import { useState, useEffect } from 'react';
import {
  X, Copy, Check, Trash2, LogOut, Shield, ShieldOff, UserX, Crown,
  RefreshCw, Ban,
} from 'lucide-react';
import type { Server, ServerMember, BannedMember } from '../../hooks/useServers';

const COLORS = [
  '#E8721A', '#5865F2', '#57F287', '#FEE75C', '#EB459E',
  '#ED4245', '#3BA55D', '#FAA61A', '#9C84EC', '#00B0F4',
];

type Tab = 'general' | 'invite' | 'members' | 'bans';

interface ServerSettingsModalProps {
  server: Server;
  currentUserId: string;
  onClose: () => void;
  onUpdateServer: (serverId: string, updates: { name?: string; color?: string }) => Promise<{ error: unknown }>;
  onUpdateMemberRole: (serverId: string, userId: string, role: 'admin' | 'member') => Promise<{ error: unknown }>;
  onKickMember: (serverId: string, userId: string) => Promise<{ error: unknown }>;
  onBanMember: (serverId: string, userId: string, reason?: string) => Promise<void>;
  onUnbanMember: (serverId: string, userId: string) => Promise<void>;
  onGetBannedMembers: (serverId: string) => Promise<BannedMember[]>;
  onDeleteServer: (serverId: string) => Promise<{ error: unknown }>;
  onLeaveServer: (serverId: string, userId: string) => Promise<{ error: unknown }>;
}

function MemberAvatar({ member }: { member: ServerMember }) {
  if (member.profile.avatar_url) {
    return (
      <img
        src={member.profile.avatar_url}
        crossOrigin="anonymous"
        alt={member.profile.display_name}
        className="h-9 w-9 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fox-500 to-fox-700 text-xs font-bold text-white">
      {member.profile.display_name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function ServerSettingsModal({
  server,
  currentUserId,
  onClose,
  onUpdateServer,
  onUpdateMemberRole,
  onKickMember,
  onBanMember,
  onUnbanMember,
  onGetBannedMembers,
  onDeleteServer,
  onLeaveServer,
}: ServerSettingsModalProps) {
  const [tab, setTab] = useState<Tab>('general');
  const [serverName, setServerName] = useState(server.name);
  const [serverColor, setServerColor] = useState(server.color);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bannedMembers, setBannedMembers] = useState<BannedMember[]>([]);
  const [loadingBans, setLoadingBans] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isOwner = server.owner_id === currentUserId;
  const isAdmin = server.members.find(m => m.user_id === currentUserId)?.role === 'admin' || isOwner;

  useEffect(() => {
    if (tab === 'bans') {
      setLoadingBans(true);
      onGetBannedMembers(server.id).then(bans => {
        setBannedMembers(bans);
        setLoadingBans(false);
      });
    }
  }, [tab, server.id, onGetBannedMembers]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    await onUpdateServer(server.id, { name: serverName.trim() || server.name, color: serverColor });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(server.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRoleChange = async (member: ServerMember, newRole: 'admin' | 'member') => {
    setActionLoading(member.id);
    await onUpdateMemberRole(server.id, member.user_id, newRole);
    setActionLoading(null);
  };

  const handleKick = async (member: ServerMember) => {
    setActionLoading('kick-' + member.id);
    await onKickMember(server.id, member.user_id);
    setActionLoading(null);
  };

  const handleBan = async (member: ServerMember) => {
    setActionLoading('ban-' + member.id);
    await onBanMember(server.id, member.user_id);
    setActionLoading(null);
  };

  const handleUnban = async (ban: BannedMember) => {
    setActionLoading('unban-' + ban.id);
    await onUnbanMember(server.id, ban.user_id);
    setBannedMembers(prev => prev.filter(b => b.id !== ban.id));
    setActionLoading(null);
  };

  const handleDelete = async () => {
    if (confirmDeleteInput !== server.name) return;
    await onDeleteServer(server.id);
    onClose();
  };

  const handleLeave = async () => {
    await onLeaveServer(server.id, currentUserId);
    onClose();
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'general', label: 'Genel' },
    { id: 'invite', label: 'Davet' },
    { id: 'members', label: `Üyeler (${server.members.length})` },
    { id: 'bans', label: 'Yasaklılar' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex w-full max-w-2xl overflow-hidden rounded-2xl bg-dc-bg shadow-2xl"
        style={{ maxHeight: '85vh', border: '1px solid rgba(255,255,255,0.07)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Left nav */}
        <div className="flex w-48 flex-shrink-0 flex-col bg-dc-sidebar px-2 py-4">
          {/* Server name header */}
          <div className="mb-3 flex items-center gap-2 px-3">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: server.color }}
            >
              {server.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="truncate text-xs font-bold text-dc-text-primary leading-tight">{server.name}</span>
          </div>
          <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-dc-muted-fg">Sunucu Ayarları</p>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-fox-500/15 text-fox-300'
                  : 'text-dc-text-secondary hover:bg-dc-channel-hover/60 hover:text-dc-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
          <div className="mt-auto border-t border-dc-surface/40 pt-2">
            {!isOwner ? (
              <button
                onClick={handleLeave}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sunucudan Ayrıl
              </button>
            ) : (
              <button
                onClick={() => { setTab('general'); setConfirmDelete(true); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Sunucuyu Sil
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex h-14 flex-shrink-0 items-center justify-between px-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-base font-bold text-dc-text-primary">
              {TABS.find(t => t.id === tab)?.label}
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-dc-muted-fg hover:bg-white/10 hover:text-dc-text-primary transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin scrollbar-thumb-dc-surface">

            {/* ── GENEL ── */}
            {tab === 'general' && (
              <div className="flex flex-col gap-5">
                {/* Server color preview */}
                <div
                  className="flex h-24 items-end rounded-2xl px-5 pb-4"
                  style={{ background: `linear-gradient(135deg, ${serverColor}66, ${serverColor}22)`, border: `1px solid ${serverColor}44` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg"
                    style={{ background: serverColor }}>
                    {serverName.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                {/* Server name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-dc-muted-fg">Sunucu Adı</label>
                  <input
                    value={serverName}
                    onChange={e => setServerName(e.target.value)}
                    maxLength={64}
                    disabled={!isOwner}
                    className="rounded-xl bg-dc-surface px-4 py-2.5 text-sm text-dc-text-primary outline-none ring-1 ring-transparent focus:ring-fox-500/50 disabled:opacity-60 transition-all"
                  />
                </div>

                {/* Color */}
                {isOwner && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-dc-muted-fg">Sunucu Rengi</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setServerColor(c)}
                          className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                          style={{ background: c }}
                        >
                          {serverColor === c && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isOwner && (
                  <button
                    onClick={handleSaveGeneral}
                    disabled={saving || saved}
                    className="flex items-center justify-center gap-2 rounded-xl bg-fox-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-fox-500/25 hover:bg-fox-600 disabled:opacity-70 transition-all"
                  >
                    {saved ? <><Check className="h-4 w-4" /> Kaydedildi</> : saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                )}

                {/* Delete confirm */}
                {isOwner && confirmDelete && (
                  <div className="flex flex-col gap-3 rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30">
                    <p className="text-sm font-semibold text-red-400">Sunucuyu silmek istediğinize emin misiniz?</p>
                    <p className="text-xs text-dc-muted-fg">Bu işlem geri alınamaz. Onaylamak için sunucu adını yazın:</p>
                    <input
                      value={confirmDeleteInput}
                      onChange={e => setConfirmDeleteInput(e.target.value)}
                      placeholder={server.name}
                      className="rounded-xl bg-dc-surface px-3 py-2 text-sm text-dc-text-primary outline-none ring-1 ring-red-500/30 focus:ring-red-500/60"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => { setConfirmDelete(false); setConfirmDeleteInput(''); }} className="flex-1 rounded-xl bg-dc-surface py-2 text-sm text-dc-text-secondary hover:bg-dc-channel-hover transition-all">İptal</button>
                      <button
                        onClick={handleDelete}
                        disabled={confirmDeleteInput !== server.name}
                        className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40 transition-all"
                      >
                        Sunucuyu Sil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── DAVET ── */}
            {tab === 'invite' && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-dc-text-secondary">Bu kodu arkadaşlarınla paylaşarak sunucuna davet et.</p>
                <div className="flex items-center gap-3 rounded-xl bg-dc-surface px-4 py-3 ring-1 ring-dc-surface/60">
                  <code className="flex-1 font-mono text-sm font-bold tracking-widest text-fox-300">{server.invite_code}</code>
                  <button
                    onClick={handleCopyInvite}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-dc-muted-fg hover:text-fox-400 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={handleCopyInvite}
                  className="flex items-center justify-center gap-2 rounded-xl bg-fox-500/15 py-2.5 text-sm font-semibold text-fox-300 hover:bg-fox-500/25 transition-all ring-1 ring-fox-500/30"
                >
                  {copied ? <><Check className="h-4 w-4" /> Kopyalandı!</> : <><Copy className="h-4 w-4" /> Davet Kodunu Kopyala</>}
                </button>
              </div>
            )}

            {/* ── ÜYELER ── */}
            {tab === 'members' && (
              <div className="flex flex-col gap-2">
                {server.members.map(member => {
                  const isSelf = member.user_id === currentUserId;
                  const isServerOwner = member.user_id === server.owner_id;
                  const canManage = isAdmin && !isSelf && !isServerOwner;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-xl bg-dc-surface/50 px-4 py-3 hover:bg-dc-surface transition-colors"
                    >
                      <MemberAvatar member={member} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-dc-text-primary">{member.profile.display_name}</span>
                          {isServerOwner && <Crown className="h-3.5 w-3.5 flex-shrink-0 text-yellow-400" />}
                          {member.role === 'admin' && !isServerOwner && <Shield className="h-3.5 w-3.5 flex-shrink-0 text-fox-400" />}
                          {isSelf && <span className="rounded bg-fox-500/20 px-1.5 py-0.5 text-[9px] font-bold text-fox-400">Sen</span>}
                        </div>
                        <span className="text-xs text-dc-muted-fg">@{member.profile.username}</span>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          {/* Role toggle */}
                          {member.role === 'member' ? (
                            <button
                              onClick={() => handleRoleChange(member, 'admin')}
                              disabled={actionLoading === member.id}
                              title="Admin yap"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-dc-muted-fg hover:bg-fox-500/15 hover:text-fox-400 transition-all disabled:opacity-50"
                            >
                              {actionLoading === member.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
                            </button>
                          ) : member.role === 'admin' ? (
                            <button
                              onClick={() => handleRoleChange(member, 'member')}
                              disabled={actionLoading === member.id}
                              title="Admin'den indir"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-fox-400 hover:bg-fox-500/15 transition-all disabled:opacity-50"
                            >
                              {actionLoading === member.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />}
                            </button>
                          ) : null}
                          {/* Kick */}
                          <button
                            onClick={() => handleKick(member)}
                            disabled={actionLoading === 'kick-' + member.id}
                            title="At"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-dc-muted-fg hover:bg-yellow-500/15 hover:text-yellow-400 transition-all disabled:opacity-50"
                          >
                            {actionLoading === 'kick-' + member.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                          </button>
                          {/* Ban */}
                          <button
                            onClick={() => handleBan(member)}
                            disabled={actionLoading === 'ban-' + member.id}
                            title="Yasakla"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-dc-muted-fg hover:bg-red-500/15 hover:text-red-400 transition-all disabled:opacity-50"
                          >
                            {actionLoading === 'ban-' + member.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── YASAKLILAR ── */}
            {tab === 'bans' && (
              <div className="flex flex-col gap-3">
                {loadingBans ? (
                  <div className="py-8 text-center text-sm text-dc-muted-fg">Yükleniyor...</div>
                ) : bannedMembers.length === 0 ? (
                  <div className="py-12 text-center">
                    <Ban className="mx-auto mb-3 h-10 w-10 text-dc-muted-fg/30" />
                    <p className="text-sm text-dc-muted-fg">Yasaklı kullanıcı yok.</p>
                  </div>
                ) : (
                  bannedMembers.map(ban => (
                    <div key={ban.id} className="flex items-center gap-3 rounded-xl bg-dc-surface/50 px-4 py-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 ring-1 ring-red-500/30">
                        {ban.profile.avatar_url ? (
                          <img src={ban.profile.avatar_url} crossOrigin="anonymous" className="h-9 w-9 rounded-full object-cover" alt={ban.profile.display_name} />
                        ) : (
                          <span className="text-xs font-bold text-red-400">{ban.profile.display_name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-dc-text-primary">{ban.profile.display_name}</p>
                        {ban.reason && <p className="truncate text-[11px] text-dc-muted-fg">Neden: {ban.reason}</p>}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleUnban(ban)}
                          disabled={actionLoading === 'unban-' + ban.id}
                          className="flex items-center gap-1.5 rounded-xl bg-green-500/15 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/25 transition-all disabled:opacity-50"
                        >
                          {actionLoading === 'unban-' + ban.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Yasağı Kaldır'}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
