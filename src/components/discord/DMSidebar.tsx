import type { DirectMessage } from '../../types/discord';
import UserAvatar from './UserAvatar';
import UserPanel from './UserPanel';
import { currentUser } from '../../data/mock';
import { MessageCircle } from 'lucide-react';

interface DMSidebarProps {
  dms: DirectMessage[];
  activeDmId: string;
  onSelectDm: (id: string) => void;
}

export default function DMSidebar({ dms, activeDmId, onSelectDm }: DMSidebarProps) {
  return (
    <div className="flex h-full w-60 flex-col bg-dc-sidebar">
      {/* Header */}
      <div className="flex h-12 items-center border-b border-dc-surface px-4">
        <div className="flex h-7 flex-1 items-center gap-2 rounded bg-dc-surface px-2 text-xs text-dc-muted-fg cursor-text">
          Kullanıcı bul...
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-dc-surface">
        <button className="flex w-full items-center gap-3 rounded px-2 py-2 text-sm font-medium text-dc-muted-fg transition-colors hover:bg-dc-channel-hover hover:text-dc-text-primary">
          <MessageCircle className="h-5 w-5" />
          Direkt Mesajlar
        </button>

        <div className="mb-1 mt-4 px-2 text-[11px] font-bold uppercase tracking-wider text-dc-muted-fg">
          Direkt Mesajlar
        </div>

        {dms.map((dm) => (
          <button
            key={dm.id}
            onClick={() => onSelectDm(dm.id)}
            className={`group relative flex w-full items-center gap-3 rounded px-2 py-2 transition-colors
              ${activeDmId === dm.id ? 'bg-dc-channel-hover text-dc-text-primary' : 'text-dc-muted-fg hover:bg-dc-channel-hover hover:text-dc-text-secondary'}
            `}
          >
            <UserAvatar user={dm.user} size="sm" showStatus />
            <span className="flex-1 truncate text-left text-sm font-medium">{dm.user.displayName}</span>
            {dm.unread ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-dc-red px-1 text-[9px] font-bold text-white">
                {dm.unread}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <UserPanel user={currentUser} />
    </div>
  );
}
