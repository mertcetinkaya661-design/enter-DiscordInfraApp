import { useState, useRef, useEffect } from 'react';
import {
  Hash, Volume2, Megaphone, Bell, Pin, Users, Search, Sparkles,
  ChevronDown, ChevronRight, Settings, Plus, Paperclip, Smile,
  Mic, MicOff, Send, LogOut, Headphones, VolumeX, PhoneOff,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useServers } from '../hooks/useServers';
import { useMessages, type Message } from '../hooks/useMessages';
import { useVoiceChannel, type VoiceParticipant } from '../hooks/useVoiceChannel';
import FoxLogo from '../components/discord/FoxLogo';
import AuthPage from './AuthPage';
import CreateServerModal from '../components/discord/CreateServerModal';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return `Dün ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function Avatar({ name, size = 'md', color }: { name: string; size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-9 h-9 text-sm';
  const bg = color ?? 'from-fox-500 to-fox-700';
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${bg} flex flex-shrink-0 items-center justify-center font-bold text-white`}>
      {initials}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, isOwn, showHeader, onDelete }: {
  message: Message;
  isOwn: boolean;
  showHeader: boolean;
  onDelete?: () => void;
}) {
  const name = message.author?.display_name ?? 'Bilinmeyen';

  if (isOwn) {
    return (
      <div className={`group flex flex-col items-end px-4 ${showHeader ? 'mt-4' : 'mt-0.5'}`}>
        {showHeader && <span className="mb-1 mr-1 text-[11px] text-dc-muted-fg">{formatTime(message.created_at)}</span>}
        <div className="flex max-w-[72%] flex-col items-end gap-1">
          <div className="relative rounded-2xl rounded-tr-sm bg-fox-600 px-4 py-2 text-sm leading-relaxed text-white shadow-sm">
            {message.content}
            {message.edited_at && <span className="ml-1 text-[10px] text-fox-200">(düzenlendi)</span>}
            {onDelete && (
              <button
                onClick={onDelete}
                className="absolute -left-8 top-1/2 -translate-y-1/2 hidden rounded bg-dc-surface px-1 py-0.5 text-[10px] text-dc-muted-fg hover:text-red-400 group-hover:flex"
              >
                sil
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex gap-3 px-4 py-0.5 hover:bg-white/[0.02] ${showHeader ? 'mt-4' : ''}`}>
      {showHeader ? (
        <Avatar name={name} size="md" />
      ) : (
        <div className="w-9 flex-shrink-0" />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {showHeader && (
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-dc-text-primary">{name}</span>
            <span className="text-[11px] text-dc-muted-fg">{formatTime(message.created_at)}</span>
          </div>
        )}
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-dc-sidebar px-4 py-2 text-sm leading-relaxed text-dc-text-secondary">
          {message.content}
          {message.edited_at && <span className="ml-1 text-[10px] text-dc-muted-fg">(düzenlendi)</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({ channelId, channelName, channelType, channelTopic, userId, showMembers, onToggleMembers }: {
  channelId: string;
  channelName: string;
  channelType: string;
  channelTopic: string | null;
  userId: string;
  showMembers: boolean;
  onToggleMembers: () => void;
}) {
  const { messages, loading, sendMessage, deleteMessage } = useMessages(channelId);
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [messages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    setInput('');
    await sendMessage(channelId, userId, content);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-dc-bg">
      {/* Header */}
      <div className="relative flex h-14 flex-shrink-0 items-center gap-3 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fox-500/15 text-fox-400">
          {channelType === 'announcement' ? <Megaphone className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-bold leading-tight text-dc-text-primary">{channelName}</h3>
          {channelTopic && <span className="text-[11px] text-dc-muted-fg truncate max-w-xs">{channelTopic}</span>}
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-dc-muted-fg hover:bg-dc-channel-hover hover:text-dc-text-primary transition-all"><Bell className="h-4 w-4" /></button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-dc-muted-fg hover:bg-dc-channel-hover hover:text-dc-text-primary transition-all"><Pin className="h-4 w-4" /></button>
          <button onClick={onToggleMembers} className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-dc-channel-hover ${showMembers ? 'bg-fox-500/20 text-fox-400' : 'text-dc-muted-fg hover:text-dc-text-primary'}`}><Users className="h-4 w-4" /></button>
          <div className="mx-1 h-4 w-px bg-dc-surface" />
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-dc-muted-fg hover:bg-dc-channel-hover hover:text-dc-text-primary transition-all"><Search className="h-4 w-4" /></button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-dc-muted-fg hover:bg-dc-channel-hover hover:text-dc-text-primary transition-all"><Sparkles className="h-4 w-4" /></button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-dc-surface" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-dc-surface">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-dc-muted-fg text-sm">Yükleniyor...</div>
        ) : (
          <>
            <div className="mb-6 px-4">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fox-500 to-fox-700 shadow-lg shadow-fox-500/20">
                <Hash className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-dc-text-primary">#{channelName}</h2>
              {channelTopic && <p className="mt-1 text-sm text-dc-muted-fg">{channelTopic}</p>}
              <p className="mt-2 text-xs text-dc-muted-fg">Bu kanalın başlangıcı.</p>
            </div>
            <div className="mx-4 mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-dc-surface" />
              <span className="rounded-full bg-dc-surface px-3 py-0.5 text-[10px] font-medium text-dc-muted-fg">Bugün</span>
              <div className="h-px flex-1 bg-dc-surface" />
            </div>
            {messages.map((msg, idx) => {
              const prev = messages[idx - 1];
              const showHeader = !prev || prev.author_id !== msg.author_id ||
                new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() > 300000;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.author_id === userId}
                  showHeader={showHeader}
                  onDelete={msg.author_id === userId ? () => deleteMessage(msg.id) : undefined}
                />
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-5 pt-2">
        <div className={`flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${focused ? 'bg-dc-input ring-1 ring-fox-500/40 shadow-lg shadow-fox-500/10' : 'bg-dc-input'}`}>
          <button className="mb-0.5 text-dc-muted-fg hover:text-fox-400 transition-colors"><Paperclip className="h-5 w-5" /></button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`${channelName} kanalına yaz...`}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-dc-text-primary placeholder:text-dc-muted-fg/60 focus:outline-none"
            style={{ maxHeight: '120px', minHeight: '22px' }}
          />
          <div className="mb-0.5 flex items-center gap-1.5">
            <button className="text-dc-muted-fg hover:text-fox-400 transition-colors"><Smile className="h-5 w-5" /></button>
            {input.trim() ? (
              <button onClick={handleSend} className="flex h-8 w-8 items-center justify-center rounded-xl bg-fox-500 text-white shadow-md shadow-fox-500/30 hover:bg-fox-600 active:scale-95 transition-all">
                <Send className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button className="text-dc-muted-fg hover:text-fox-400 transition-colors"><Mic className="h-5 w-5" /></button>
            )}
          </div>
        </div>
        <p className="mt-1.5 px-2 text-[10px] text-dc-muted-fg/40">Enter ile gönder · Shift+Enter ile yeni satır</p>
      </div>
    </div>
  );
}

// ─── Voice Panel ──────────────────────────────────────────────────────────────

function ParticipantCard({ p }: { p: VoiceParticipant }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-fox-500 to-fox-700 text-xl font-bold text-white transition-all duration-150
        ${p.isSpeaking ? 'ring-4 ring-fox-400 shadow-[0_0_24px_rgba(232,114,42,0.55)]' : 'ring-4 ring-dc-surface'}`}
      >
        {p.displayName.slice(0, 2).toUpperCase()}
        {p.isMuted && (
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-dc-bg ring-2 ring-dc-sidebar">
            <MicOff className="h-3 w-3 text-red-400" />
          </div>
        )}
        {p.isSpeaking && !p.isMuted && (
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-fox-500 ring-2 ring-dc-sidebar">
            <Mic className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
      <span className="max-w-[88px] truncate text-center text-xs font-semibold text-dc-text-secondary">
        {p.displayName}
      </span>
    </div>
  );
}

function VoicePanel({ channelId, channelName, voice }: {
  channelId: string;
  channelName: string;
  voice: ReturnType<typeof useVoiceChannel>;
}) {
  const { participants, isConnected, isMuted, isDeafened, error, joinChannel, leaveChannel, toggleMute, toggleDeafen } = voice;

  if (!isConnected) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-dc-bg">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-dc-sidebar ring-2 ring-fox-500/20">
          <Volume2 className="h-10 w-10 text-fox-400" />
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-fox-500 shadow-lg">
            <span className="text-[10px] font-bold text-white">SES</span>
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dc-text-primary">{channelName}</h2>
          <p className="mt-1.5 text-sm text-dc-muted-fg">Ses kanalı — bağlanmaya hazır</p>
        </div>
        {error && (
          <div className="max-w-xs rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}
        <button
          onClick={() => joinChannel(channelId)}
          className="rounded-xl bg-fox-500 px-10 py-3.5 text-sm font-bold text-white shadow-lg shadow-fox-500/30 hover:bg-fox-600 active:scale-95 transition-all"
        >
          Kanala Katıl
        </button>
        <p className="text-[11px] text-dc-muted-fg/50">Mikrofon izni gereklidir</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-dc-bg">
      {/* Header */}
      <div className="relative flex h-14 flex-shrink-0 items-center gap-3 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/15">
          <Volume2 className="h-4 w-4 text-green-400" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-bold leading-tight text-dc-text-primary">{channelName}</h3>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            <span className="text-[11px] text-green-400">{participants.length} kişi bağlı</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-dc-surface" />
      </div>

      {/* Participants grid */}
      <div className="flex flex-1 flex-col items-center justify-center p-10">
        {participants.length === 0 ? (
          <div className="text-center text-dc-muted-fg text-sm">Bağlanıyor...</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {participants.map(p => (
              <ParticipantCard key={p.userId} p={p} />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 pb-8 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              onClick={toggleMute}
              className={`flex h-13 w-13 h-12 w-12 items-center justify-center rounded-2xl transition-all
                ${isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/30' : 'bg-dc-sidebar text-dc-text-primary hover:bg-dc-channel-hover'}`}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{isMuted ? 'Mikrofon Aç' : 'Mikrofonu Kapat'}</TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              onClick={toggleDeafen}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all
                ${isDeafened ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/30' : 'bg-dc-sidebar text-dc-text-primary hover:bg-dc-channel-hover'}`}
            >
              {isDeafened ? <VolumeX className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{isDeafened ? 'Sesi Aç' : 'Sesi Kapat'}</TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button
              onClick={leaveChannel}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 ring-1 ring-red-500/30 hover:bg-red-500/30 transition-all"
            >
              <PhoneOff className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Kanaldan Ayrıl</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function DiscordApp() {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();
  const { servers, loading: serversLoading, createServer, joinServerByInvite } = useServers(user?.id);
  const voice = useVoiceChannel(user?.id ?? null, profile?.display_name ?? null);

  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  // Auto-select first server/channel
  useEffect(() => {
    if (servers.length > 0 && !activeServerId) {
      const server = servers[0];
      setActiveServerId(server.id);
      const firstText = server.categories.flatMap(c => c.channels).find(ch => ch.type === 'text');
      if (firstText) setActiveChannelId(firstText.id);
    }
  }, [servers, activeServerId]);

  const handleSelectServer = (id: string) => {
    setActiveServerId(id);
    const server = servers.find(s => s.id === id);
    const firstText = server?.categories.flatMap(c => c.channels).find(ch => ch.type === 'text');
    setActiveChannelId(firstText?.id ?? null);
  };

  if (loading || (user && !profile)) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-dc-surface">
        <div className="flex flex-col items-center gap-4">
          <FoxLogo size={48} />
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-fox-500/30 border-t-fox-500" />
          {user && !profile && (
            <p className="text-xs text-dc-muted-fg">Profil hazırlanıyor...</p>
          )}
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <AuthPage onSignIn={signIn} onSignUp={signUp} />;
  }

  const activeServer = servers.find(s => s.id === activeServerId);
  const activeChannel = activeServer?.categories.flatMap(c => c.channels).find(ch => ch.id === activeChannelId);
  const connectedVoiceChannel = voice.connectedChannelId
    ? activeServer?.categories.flatMap(c => c.channels).find(ch => ch.id === voice.connectedChannelId)
    : null;

  const toggleCat = (id: string) => setCollapsedCats(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div className="flex h-full w-full overflow-hidden font-dc">
      {/* Server sidebar */}
      <div className="flex h-full w-[76px] flex-col items-center overflow-y-auto bg-dc-surface py-3 scrollbar-none">
        {/* FIX Logo */}
        <Tooltip delayDuration={80}>
          <TooltipTrigger asChild>
            <button className="group relative flex flex-col items-center gap-1 pb-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-[50%] bg-dc-bg transition-all duration-300 group-hover:rounded-2xl group-hover:bg-fox-500">
                <FoxLogo size={30} />
              </div>
              <span className="text-[9px] font-black tracking-widest text-fox-400">FIX</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="border-none bg-dc-surface font-semibold text-dc-text-primary shadow-xl">FIX</TooltipContent>
        </Tooltip>

        <div className="my-2 h-px w-9 rounded-full bg-dc-sidebar" />

        {/* Server icons */}
        <div className="flex flex-col items-center gap-2">
          {serversLoading ? (
            <div className="h-12 w-12 animate-pulse rounded-full bg-dc-sidebar" />
          ) : (
            servers.map(server => (
              <Tooltip key={server.id} delayDuration={80}>
                <TooltipTrigger asChild>
                  <button onClick={() => handleSelectServer(server.id)} className="group relative flex items-center">
                    <span className={`absolute -left-3 rounded-r-full transition-all duration-300 ${activeServerId === server.id ? 'h-8 w-1.5 bg-fox-400 shadow-[0_0_8px_2px_rgba(232,114,42,0.5)]' : 'h-2 w-1 bg-dc-text-primary opacity-0 group-hover:opacity-100'}`} />
                    <div
                      className={`flex h-12 w-12 items-center justify-center text-sm font-bold text-white transition-all duration-300 ${activeServerId === server.id ? 'rounded-2xl' : 'rounded-[50%] group-hover:rounded-2xl'}`}
                      style={{ backgroundColor: server.color, boxShadow: activeServerId === server.id ? `0 4px 16px ${server.color}66` : undefined }}
                    >
                      {server.name.slice(0, 2).toUpperCase()}
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12} className="border-none bg-dc-surface font-semibold text-dc-text-primary shadow-xl">{server.name}</TooltipContent>
              </Tooltip>
            ))
          )}
        </div>

        <div className="my-2 h-px w-9 rounded-full bg-dc-sidebar" />

        {/* Add server */}
        <Tooltip delayDuration={80}>
          <TooltipTrigger asChild>
            <button onClick={() => setShowCreateModal(true)} className="group flex h-12 w-12 items-center justify-center rounded-[50%] bg-dc-bg text-dc-green transition-all duration-300 hover:rounded-2xl hover:bg-dc-green hover:text-white">
              <Plus className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="border-none bg-dc-surface font-semibold text-dc-text-primary shadow-xl">Sunucu Ekle</TooltipContent>
        </Tooltip>

        {/* Sign out at bottom */}
        <div className="mt-auto flex flex-col items-center gap-2 pt-2">
          <Tooltip delayDuration={80}>
            <TooltipTrigger asChild>
              <button onClick={signOut} className="group flex h-12 w-12 items-center justify-center rounded-[50%] bg-dc-bg text-dc-muted-fg transition-all duration-300 hover:rounded-2xl hover:bg-dc-red hover:text-white">
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12} className="border-none bg-dc-surface font-semibold text-dc-text-primary shadow-xl">Çıkış Yap</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Channel sidebar */}
      {activeServer && (
        <div className="flex h-full w-64 flex-col bg-dc-sidebar">
          {/* Server header */}
          <div
            className="relative flex h-14 flex-shrink-0 items-center justify-between px-4"
            style={{ background: `linear-gradient(135deg, ${activeServer.color}33 0%, transparent 70%)`, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex flex-col">
              <h2 className="truncate text-sm font-bold text-dc-text-primary leading-tight">{activeServer.name}</h2>
              <span className="text-[10px] text-dc-muted-fg">{activeServer.members.length} üye</span>
            </div>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-dc-muted-fg transition-all hover:bg-white/10 hover:text-dc-text-primary">
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2">
            <div className="flex h-8 items-center gap-2 rounded-xl bg-dc-surface/80 px-3 text-[12px] text-dc-muted-fg cursor-text">
              <Hash className="h-3 w-3 flex-shrink-0" />
              <span>Kanal ara...</span>
            </div>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin scrollbar-thumb-dc-surface">
            {activeServer.categories.map(cat => (
              <div key={cat.id} className="mb-2">
                <button onClick={() => toggleCat(cat.id)} className="flex w-full items-center gap-1 px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-dc-muted-fg/70 hover:text-dc-muted-fg transition-colors">
                  {collapsedCats.has(cat.id) ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {cat.name}
                </button>
                {!collapsedCats.has(cat.id) && (
                  <div className="flex flex-col gap-0.5 px-1">
                    {cat.channels.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChannelId(ch.id)}
                        className={`group relative flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-150 font-medium
                          ${activeChannelId === ch.id ? 'bg-fox-500/15 text-fox-300 font-semibold' : 'text-dc-muted-fg hover:bg-dc-channel-hover/60 hover:text-dc-text-secondary'}
                        `}
                      >
                        {activeChannelId === ch.id && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-fox-400 shadow-[0_0_6px_1px_rgba(232,114,42,0.6)]" />}
                        {ch.type === 'voice'
                          ? <Volume2 className="h-4 w-4 flex-shrink-0" />
                          : ch.type === 'announcement'
                            ? <Megaphone className="h-4 w-4 flex-shrink-0" />
                            : <Hash className="h-4 w-4 flex-shrink-0" />}
                        <span className="flex-1 truncate text-left">{ch.name}</span>
                        {/* Voice connected indicator */}
                        {ch.type === 'voice' && voice.connectedChannelId === ch.id && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Voice connected bar */}
          {voice.isConnected && connectedVoiceChannel && (
            <div className="mx-2 mb-1 rounded-xl bg-green-500/10 px-3 py-2.5" style={{ border: '1px solid rgba(34,197,94,0.15)' }}>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                  <span className="text-[11px] font-semibold text-green-400">Ses Aktif</span>
                </div>
                <button
                  onClick={voice.leaveChannel}
                  className="flex h-5 w-5 items-center justify-center rounded text-dc-muted-fg hover:text-red-400 transition-colors"
                >
                  <PhoneOff className="h-3 w-3" />
                </button>
              </div>
              <p className="truncate text-[10px] text-dc-muted-fg">{connectedVoiceChannel.name}</p>
              <div className="mt-2 flex items-center gap-1">
                <button
                  onClick={voice.toggleMute}
                  className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${voice.isMuted ? 'text-red-400' : 'text-dc-muted-fg hover:text-dc-text-primary'}`}
                >
                  {voice.isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={voice.toggleDeafen}
                  className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${voice.isDeafened ? 'text-red-400' : 'text-dc-muted-fg hover:text-dc-text-primary'}`}
                >
                  {voice.isDeafened ? <VolumeX className="h-3.5 w-3.5" /> : <Headphones className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* User panel */}
          <div className="flex flex-shrink-0 items-center gap-2 p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex flex-1 items-center gap-2 rounded-xl p-1.5 hover:bg-white/5 cursor-pointer transition-all">
              <Avatar name={profile.display_name} size="sm" />
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold text-dc-text-primary leading-tight">{profile.display_name}</span>
                <span className="truncate text-[10px] text-dc-muted-fg">@{profile.username}</span>
              </div>
            </div>
            <button onClick={signOut} className="flex h-7 w-7 items-center justify-center rounded-lg text-dc-muted-fg hover:bg-white/10 hover:text-red-400 transition-all">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      {activeServer && activeChannel && user ? (
        activeChannel.type === 'voice' ? (
          <VoicePanel
            channelId={activeChannel.id}
            channelName={activeChannel.name}
            voice={voice}
          />
        ) : (
          <ChatPanel
            channelId={activeChannel.id}
            channelName={activeChannel.name}
            channelType={activeChannel.type}
            channelTopic={activeChannel.topic}
            userId={user.id}
            showMembers={showMembers}
            onToggleMembers={() => setShowMembers(v => !v)}
          />
        )
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center bg-dc-bg gap-4">
          {!serversLoading && servers.length === 0 ? (
            <>
              <FoxLogo size={72} />
              <h2 className="text-xl font-bold text-dc-text-primary">Hoş geldiniz, {profile.display_name}!</h2>
              <p className="text-dc-muted-fg text-sm">İlk sunucunuzu oluşturun veya bir sunucuya katılın.</p>
              <button onClick={() => setShowCreateModal(true)} className="mt-2 rounded-xl bg-fox-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-fox-500/30 hover:bg-fox-600 transition-all">
                Sunucu Oluştur
              </button>
            </>
          ) : (
            <>
              <FoxLogo size={56} />
              <p className="text-dc-muted-fg text-sm">Bir kanal seçin</p>
            </>
          )}
        </div>
      )}

      {/* Members sidebar */}
      {activeServer && showMembers && activeChannel?.type !== 'voice' && (
        <div className="flex h-full w-56 flex-col bg-dc-sidebar">
          <div className="flex h-14 flex-shrink-0 items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-dc-text-primary leading-tight">Üyeler</span>
              <span className="text-[10px] text-dc-muted-fg">{activeServer.members.length} toplam</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-dc-surface">
            {activeServer.members.map(member => (
              <div key={member.id} className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-dc-channel-hover/60 transition-all cursor-pointer">
                <Avatar name={member.profile.display_name} size="sm" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-xs font-semibold text-dc-text-secondary">{member.nickname ?? member.profile.display_name}</span>
                  <span className="text-[10px] text-dc-muted-fg/60 capitalize">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create server modal */}
      {showCreateModal && user && (
        <CreateServerModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (name, color) => { await createServer(name, color, user.id); }}
          onJoin={async (code) => { await joinServerByInvite(code, user.id); }}
        />
      )}
    </div>
  );
}
