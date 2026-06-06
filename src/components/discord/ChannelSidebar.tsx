import { useState } from 'react';
import { Hash, Volume2, Megaphone, ChevronDown, ChevronRight } from 'lucide-react';
import type { Channel, ChannelCategory, ChannelType } from '../../types/discord';
import UserPanel from './UserPanel';
import { currentUser } from '../../data/mock';

interface ChannelSidebarProps {
  serverName: string;
  categories: ChannelCategory[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
}

function ChannelIcon({ type }: { type: ChannelType }) {
  if (type === 'voice') return <Volume2 className="h-4 w-4 flex-shrink-0" />;
  if (type === 'announcement') return <Megaphone className="h-4 w-4 flex-shrink-0" />;
  return <Hash className="h-4 w-4 flex-shrink-0" />;
}

function ChannelItem({
  channel,
  isActive,
  onClick,
}: {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-1.5 rounded px-2 py-1 text-sm transition-colors duration-100
        ${isActive
          ? 'bg-dc-channel-hover text-dc-text-primary'
          : 'text-dc-muted-fg hover:bg-dc-channel-hover hover:text-dc-text-secondary'
        }
      `}
    >
      <ChannelIcon type={channel.type} />
      <span className="flex-1 truncate text-left font-medium">{channel.name}</span>
      {channel.mention ? (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-dc-red px-1 text-[9px] font-bold text-white">
          {channel.mention}
        </span>
      ) : channel.unread ? (
        <span className="h-2 w-2 rounded-full bg-dc-text-primary" />
      ) : null}
    </button>
  );
}

function CategoryGroup({
  category,
  activeChannelId,
  onSelectChannel,
}: {
  category: ChannelCategory;
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-1">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="group flex w-full items-center gap-0.5 px-1 py-1 text-[11px] font-bold uppercase tracking-wider text-dc-muted-fg transition-colors hover:text-dc-text-secondary"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        {category.name}
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-0.5">
          {category.channels.map((ch) => (
            <ChannelItem
              key={ch.id}
              channel={ch}
              isActive={activeChannelId === ch.id}
              onClick={() => onSelectChannel(ch.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChannelSidebar({
  serverName,
  categories,
  activeChannelId,
  onSelectChannel,
}: ChannelSidebarProps) {
  return (
    <div className="flex h-full w-60 flex-col bg-dc-sidebar">
      {/* Server header */}
      <div className="flex h-12 items-center border-b border-dc-surface px-4 shadow-sm">
        <h2 className="flex-1 truncate font-semibold text-dc-text-primary text-sm">{serverName}</h2>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-dc-muted-fg" />
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-dc-surface">
        {categories.map((cat) => (
          <CategoryGroup
            key={cat.id}
            category={cat}
            activeChannelId={activeChannelId}
            onSelectChannel={onSelectChannel}
          />
        ))}
      </div>

      {/* User panel */}
      <UserPanel user={currentUser} />
    </div>
  );
}
