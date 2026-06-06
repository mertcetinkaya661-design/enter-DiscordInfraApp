import { Mic, Headphones, Settings } from 'lucide-react';
import type { User } from '../../types/discord';
import UserAvatar from './UserAvatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface UserPanelProps {
  user: User;
}

export default function UserPanel({ user }: UserPanelProps) {
  return (
    <div className="flex h-14 items-center gap-2 bg-dc-surface px-2">
      <div className="flex flex-1 items-center gap-2 rounded p-1 hover:bg-dc-channel-hover cursor-pointer transition-colors">
        <UserAvatar user={user} size="sm" showStatus />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-dc-text-primary">{user.displayName}</span>
          <span className="truncate text-[11px] text-dc-muted-fg">{user.customStatus ?? `#${user.username}`}</span>
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded text-dc-muted-fg transition-colors hover:bg-dc-channel-hover hover:text-dc-text-primary">
              <Mic className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-dc-surface border-none text-dc-text-primary text-xs">Sesi Kapat</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded text-dc-muted-fg transition-colors hover:bg-dc-channel-hover hover:text-dc-text-primary">
              <Headphones className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-dc-surface border-none text-dc-text-primary text-xs">Sağırsallık</TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded text-dc-muted-fg transition-colors hover:bg-dc-channel-hover hover:text-dc-text-primary">
              <Settings className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-dc-surface border-none text-dc-text-primary text-xs">Kullanıcı Ayarları</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
