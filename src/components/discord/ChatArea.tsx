import { useEffect, useRef, useState } from 'react';
import { Hash, Volume2, Megaphone, Bell, Pin, Users, Search, HelpCircle } from 'lucide-react';
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
  if (days === 0) return `Bugün saat ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  if (days === 1) return `Dün saat ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ChannelIcon({ type }: { type: ChannelType }) {
  if (type === 'voice') return <Volume2 className="h-5 w-5 text-dc-muted-fg" />;
  if (type === 'announcement') return <Megaphone className="h-5 w-5 text-dc-muted-fg" />;
  return <Hash className="h-5 w-5 text-dc-muted-fg" />;
}

function MessageItem({ message, showHeader }: { message: Message; showHeader: boolean }) {
  return (
    <div className="group relative flex gap-4 px-4 py-0.5 hover:bg-dc-message-hover">
      {showHeader ? (
        <div className="mt-0.5 flex-shrink-0">
          <UserAvatar user={message.author} size="md" />
        </div>
      ) : (
        <div className="w-9 flex-shrink-0" />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {showHeader && (
          <div className="mb-0.5 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-dc-text-primary hover:underline cursor-pointer">
              {message.author.displayName}
            </span>
            <span className="text-[11px] text-dc-muted-fg">{formatTimestamp(message.timestamp)}</span>
          </div>
        )}
        <p className="text-sm leading-relaxed text-dc-text-secondary">
          {message.content}
          {message.edited && (
            <span className="ml-1 text-[10px] text-dc-muted-fg">(düzenlendi)</span>
          )}
        </p>
        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                className="flex items-center gap-1 rounded-full border border-dc-channel-hover bg-dc-channel-hover px-2 py-0.5 text-xs transition-colors hover:border-fox-500/50 hover:bg-fox-500/10"
              >
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
      <div className="flex flex-1 flex-col items-center justify-center bg-dc-bg">
        <Volume2 className="mb-4 h-16 w-16 text-dc-muted-fg" />
        <h2 className="text-xl font-bold text-dc-text-primary">{channel.name}</h2>
        <p className="mt-2 text-dc-muted-fg">Ses kanalı — bağlanmak için tıklayın</p>
        <button className="mt-6 rounded-lg bg-fox-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-fox-600">
          Kanala Katıl
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-dc-bg">
      {/* Channel header */}
      <div className="flex h-12 flex-shrink-0 items-center gap-3 border-b border-dc-surface px-4 shadow-sm">
        <ChannelIcon type={channel.type} />
        <h3 className="font-semibold text-dc-text-primary text-sm">{channel.name}</h3>
        {channel.topic && (
          <>
            <div className="h-4 w-px bg-dc-muted-fg/30" />
            <span className="text-xs text-dc-muted-fg truncate flex-1">{channel.topic}</span>
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button className="flex h-8 w-8 items-center justify-center rounded text-dc-muted-fg transition-colors hover:bg-dc-channel-hover hover:text-dc-text-primary">
            <Bell className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded text-dc-muted-fg transition-colors hover:bg-dc-channel-hover hover:text-dc-text-primary">
            <Pin className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleMembers}
            className={`flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-dc-channel-hover
              ${showMembers ? 'bg-dc-channel-hover text-dc-text-primary' : 'text-dc-muted-fg hover:text-dc-text-primary'}
            `}
          >
            <Users className="h-4 w-4" />
          </button>
          <div className="mx-1 h-4 w-px bg-dc-muted-fg/30" />
          <button className="flex h-8 w-8 items-center justify-center rounded text-dc-muted-fg transition-colors hover:bg-dc-channel-hover hover:text-dc-text-primary">
            <Search className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded text-dc-muted-fg transition-colors hover:bg-dc-channel-hover hover:text-dc-text-primary">
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-dc-surface">
        {/* Welcome header */}
        <div className="mb-4 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dc-channel-hover mb-3">
            <ChannelIcon type={channel.type} />
          </div>
          <h2 className="text-2xl font-bold text-dc-text-primary">#{channel.name}'a hoş geldiniz!</h2>
          {channel.topic && <p className="mt-1 text-dc-muted-fg text-sm">{channel.topic}</p>}
        </div>

        {/* Divider */}
        <div className="mx-4 mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-dc-surface" />
          <span className="text-[11px] text-dc-muted-fg">Bugün</span>
          <div className="h-px flex-1 bg-dc-surface" />
        </div>

        {/* Message list */}
        <div className="flex flex-col gap-0">
          {messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const showHeader =
              !prev ||
              prev.author.id !== msg.author.id ||
              msg.timestamp.getTime() - prev.timestamp.getTime() > 300000;
            return (
              <div key={msg.id} className={showHeader ? 'mt-4' : ''}>
                <MessageItem message={msg} showHeader={showHeader} />
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <MessageInput channelName={channel.name} onSend={handleSend} />
    </div>
  );
}
