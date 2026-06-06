import { useState } from 'react';
import { Hash, Volume2, Megaphone, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import type { Channel, ChannelCategory, ChannelType } from '../../types/discord';
import UserPanel from './UserPanel';
import { currentUser } from '../../data/mock';

interface ChannelSidebarProps {
  serverName: string;
  serverColor?: string;
  categories: ChannelCategory[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
}

function ChannelIcon({ type, active }: { type: ChannelType; active?: boolean }) {
  const cls = `h-4 w-4 flex-shrink-0 transition-colors ${active ? 'text-fox-400' : ''}`;
  if (type === 'voice') return <Volume2 className={cls} />;
  if (type === 'announcement') return <Megaphone className={cls} />;
  return <Hash className={cls} />;
}

function ChannelItem({ channel, isActive, onClick }: { channel: Channel; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-150
        ${isActive
          ? 'bg-fox-500/15 text-fox-300 font-semibold'
          : 'text-dc-muted-fg hover:bg-dc-channel-hover/60 hover:text-dc-text-secondary font-medium'
        }
      `}
    >
      {/* Active left bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-fox-400 shadow-[0_0_6px_1px_rgba(232,114,42,0.6)]" />
      )}
      <ChannelIcon type={channel.type} active={isActive} />
      <span className="flex-1 truncate text-left">{channel.name}</span>
      {channel.mention ? (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
          {channel.mention}
        </span>
      ) : channel.unread ? (
        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-fox-400" />
      ) : null}
    </button>
  );
}

function CategoryGroup({ category, activeChannelId, onSelectChannel }: {
  category: ChannelCategory;
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mb-2">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="group flex w-full items-center gap-1 px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-dc-muted-fg/70 transition-colors hover:text-dc-muted-fg"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {category.name}
      </button>
      {!collapsed && (
        <div className="flex flex-col gap-0.5 px-1">
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

export default function ChannelSidebar({ serverName, serverColor, categories, activeChannelId, onSelectChannel }: ChannelSidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col bg-dc-sidebar">
      {/* Server header with gradient banner */}
      <div
        className="relative flex h-14 flex-shrink-0 items-center justify-between px-4"
        style={{
          background: serverColor
            ? `linear-gradient(135deg, ${serverColor}33 0%, transparent 70%)`
            : undefined,
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex flex-col">
          <h2 className="truncate text-sm font-bold text-dc-text-primary leading-tight">{serverName}</h2>
          <span className="text-[10px] text-dc-muted-fg">sunucu</span>
        </div>
        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-dc-muted-fg transition-all hover:bg-white/10 hover:text-dc-text-primary">
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2">
        <div className="flex h-8 items-center gap-2 rounded-xl bg-dc-surface/80 px-3 text-[12px] text-dc-muted-fg cursor-text">
          <Hash className="h-3 w-3 flex-shrink-0" />
          <span>Kanal ara...</span>
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin scrollbar-thumb-dc-surface">
        {categories.map((cat) => (
          <CategoryGroup
            key={cat.id}
            category={cat}
            activeChannelId={activeChannelId}
            onSelectChannel={onSelectChannel}
          />
        ))}
      </div>

      <UserPanel user={currentUser} />
    </div>
  );
}
