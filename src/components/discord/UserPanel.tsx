import { Mic, Headphones, Settings } from 'lucide-react';
import type { User } from '../../types/discord';
import UserAvatar from './UserAvatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface UserPanelProps {
  user: User;
}

const statusDot: Record<string, string> = {
  online: 'bg-dc-green shadow-[0_0_4px_1px_rgba(59,165,92,0.6)]',
  idle: 'bg-dc-yellow',
  dnd: 'bg-dc-red',
  offline: 'bg-dc-muted-fg',
};

const statusText: Record<string, string> = {
  online: 'Çevrimiçi',
  idle: 'Boşta',
  dnd: 'Rahatsız Etme',
  offline: 'Görünmez',
};

export default function UserPanel({ user }: UserPanelProps) {
  return (
    <div className="flex flex-shrink-0 items-center gap-2 p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      {/* User info */}
      <button className="flex flex-1 items-center gap-2.5 rounded-xl p-1.5 transition-all hover:bg-white/5 active:bg-white/10">
        <UserAvatar user={user} size="sm" showStatus />
        <div className="flex min-w-0 flex-col text-left">
          <span className="truncate text-sm font-bold text-dc-text-primary leading-tight">{user.displayName}</span>
          <div className="flex items-center gap-1">
            <span className={`inline-block h-1.5 w-1.5 rounded-full flex-shrink-0 ${statusDot[user.status]}`} />
            <span className="truncate text-[10px] text-dc-muted-fg">{statusText[user.status]}</span>
          </div>
        </div>
      </button>

      {/* Controls */}
      <div className="flex items-center gap-0.5">
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-dc-muted-fg transition-all hover:bg-white/10 hover:text-dc-text-primary">
              <Mic className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-dc-surface border-none text-dc-text-primary text-xs">Mikrofon</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-dc-muted-fg transition-all hover:bg-white/10 hover:text-dc-text-primary">
              <Headphones className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-dc-surface border-none text-dc-text-primary text-xs">Ses</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg text-dc-muted-fg transition-all hover:bg-white/10 hover:text-fox-400">
              <Settings className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-dc-surface border-none text-dc-text-primary text-xs">Ayarlar</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
