import { useEffect, useRef, useState } from 'react';
import { Hash, Volume2, Megaphone, Bell, Pin, Users, Search, Sparkles } from 'lucide-react';
import type { Channel, Message } from '../../types/discord';
import type { ChannelType } from '../../types/discord';
import UserAvatar from './UserAvatar';
import MessageInput from './MessageInput';
import { currentUser } from '../../data/mock';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onToggleMembers: () => void;
  showMembers: boolean;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return `Dün ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function ChannelIcon({ type }: { type: ChannelType }) {
  if (type === 'voice') return <Volume2 className="h-4 w-4" />;
  if (type === 'announcement') return <Megaphone className="h-4 w-4" />;
  return <Hash className="h-4 w-4" />;
}

function MessageItem({ message, showHeader }: { message: Message; showHeader: boolean }) {
  const isOwn = message.author.id === currentUser.id;

  if (isOwn) {
    return (
      <div className={`flex flex-col items-end px-4 ${showHeader ? 'mt-4' : 'mt-0.5'}`}>
        {showHeader && (
          <span className="mb-1 mr-1 text-[11px] text-dc-muted-fg">{formatTimestamp(message.timestamp)}</span>
        )}
        <div className="group flex max-w-[72%] flex-col items-end gap-1">
          <div className="rounded-2xl rounded-tr-sm bg-fox-600 px-4 py-2 text-sm leading-relaxed text-white shadow-sm">
            {message.content}
            {message.edited && (
              <span className="ml-1 text-[10px] text-fox-200">(düzenlendi)</span>
            )}
          </div>
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1">
              {message.reactions.map((r) => (
                <button key={r.emoji} className="flex items-center gap-1 rounded-full border border-fox-500/30 bg-fox-500/10 px-2 py-0.5 text-xs">
                  <span>{r.emoji}</span>
                  <span className="text-dc-text-secondary">{r.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex gap-3 px-4 py-0.5 transition-colors duration-100 hover:bg-white/[0.02] ${showHeader ? 'mt-4' : ''}`}>
      {showHeader ? (
        <div className="mt-0.5 flex-shrink-0">
          <UserAvatar user={message.author} size="md" />
        </div>
      ) : (
        <div className="w-9 flex-shrink-0" />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {showHeader && (
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-dc-text-primary cursor-pointer hover:underline">
              {message.author.displayName}
            </span>
            <span className="text-[11px] text-dc-muted-fg">{formatTimestamp(message.timestamp)}</span>
          </div>
        )}
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-dc-sidebar px-4 py-2 text-sm leading-relaxed text-dc-text-secondary">
          {message.content}
          {message.edited && (
            <span className="ml-1 text-[10px] text-dc-muted-fg">(düzenlendi)</span>
          )}
        </div>
        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {message.reactions.map((r) => (
              <button key={r.emoji} className="flex items-center gap-1 rounded-full border border-dc-channel-hover bg-dc-channel-hover px-2 py-0.5 text-xs transition-colors hover:border-fox-500/40 hover:bg-fox-500/10">
                <span>{r.emoji}</span>
                <span className="text-dc-text-secondary">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatArea({ channel, messages: initialMessages, onSendMessage, onToggleMembers, showMembers }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [messages]);

  const handleSend = (content: string) => {
    const newMessage: Message = {
      id: `local-${Date.now()}`,
      author: currentUser,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    onSendMessage(content);
  };

  if (channel.type === 'voice') {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-dc-bg">
        <div className="absolute inset-0 bg-gradient-radial from-fox-900/20 via-transparent to-transparent" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-dc-sidebar ring-2 ring-fox-500/30">
            <Volume2 className="h-8 w-8 text-fox-400" />
          </div>
          <h2 className="text-2xl font-bold text-dc-text-primary">{channel.name}</h2>
          <p className="text-dc-muted-fg">Ses kanalı — bağlanmak için hazır</p>
          <button className="mt-2 rounded-xl bg-fox-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-fox-500/30 transition-all hover:bg-fox-600 hover:shadow-fox-600/40 active:scale-95">
            Kanala Katıl
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-dc-bg">
      {/* Channel header */}
      <div className="relative flex h-14 flex-shrink-0 items-center gap-3 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fox-500/15 text-fox-400">
          <ChannelIcon type={channel.type} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-bold leading-tight text-dc-text-primary">{channel.name}</h3>
          {channel.topic && (
            <span className="text-[11px] text-dc-muted-fg leading-tight truncate max-w-xs">{channel.topic}</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-dc-muted-fg transition-all hover:bg-dc-channel-hover hover:text-dc-text-primary">
            <Bell className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-dc-muted-fg transition-all hover:bg-dc-channel-hover hover:text-dc-text-primary">
            <Pin className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleMembers}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-dc-channel-hover
              ${showMembers ? 'bg-fox-500/20 text-fox-400' : 'text-dc-muted-fg hover:text-dc-text-primary'}
            `}
          >
            <Users className="h-4 w-4" />
          </button>
          <div className="mx-1 h-4 w-px bg-dc-surface" />
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-dc-muted-fg transition-all hover:bg-dc-channel-hover hover:text-dc-text-primary">
            <Search className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-dc-muted-fg transition-all hover:bg-dc-channel-hover hover:text-dc-text-primary">
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
        {/* Bottom border accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-dc-surface" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-dc-surface">
        {/* Welcome block */}
        <div className="mb-6 px-4">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fox-500 to-fox-700 shadow-lg shadow-fox-500/20">
            <ChannelIcon type={channel.type} />
          </div>
          <h2 className="text-2xl font-bold text-dc-text-primary">#{channel.name}</h2>
          {channel.topic && <p className="mt-1 text-sm text-dc-muted-fg">{channel.topic}</p>}
          <p className="mt-2 text-xs text-dc-muted-fg">Bu kanalın başlangıcı. Sohbete katılın!</p>
        </div>

        {/* Date divider */}
        <div className="mx-4 mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-dc-surface" />
          <span className="rounded-full bg-dc-surface px-3 py-0.5 text-[10px] font-medium text-dc-muted-fg">Bugün</span>
          <div className="h-px flex-1 bg-dc-surface" />
        </div>

        {/* Messages */}
        {messages.map((msg, idx) => {
          const prev = messages[idx - 1];
          const showHeader =
            !prev ||
            prev.author.id !== msg.author.id ||
            msg.timestamp.getTime() - prev.timestamp.getTime() > 300000;
          return <MessageItem key={msg.id} message={msg} showHeader={showHeader} />;
        })}
        <div ref={bottomRef} />
      </div>

      <MessageInput channelName={channel.name} onSend={handleSend} />
    </div>
  );
}
