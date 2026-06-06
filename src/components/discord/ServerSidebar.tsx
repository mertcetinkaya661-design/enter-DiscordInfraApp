import { MessageCircle, Plus, Compass } from 'lucide-react';
import type { Server } from '../../types/discord';
import FoxLogo from './FoxLogo';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface ServerSidebarProps {
  servers: Server[];
  activeServerId: string | 'dm';
  onSelectServer: (id: string | 'dm') => void;
}

function ServerIcon({ server, isActive, onClick }: { server: Server; isActive: boolean; onClick: () => void }) {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="group relative flex items-center"
        >
          {/* Active indicator */}
          <span
            className={`absolute -left-3 rounded-r-full bg-dc-text-primary transition-all duration-200 ${
              isActive ? 'h-10 w-1' : 'h-2 w-1 opacity-0 group-hover:opacity-100'
            }`}
          />
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-[50%] transition-all duration-200 font-bold text-sm text-white
              ${isActive ? 'rounded-[30%]' : 'group-hover:rounded-[30%]'}
            `}
            style={{ backgroundColor: server.color }}
          >
            {server.acronym}
          </div>
          {/* Unread dot */}
          {(server.unread || server.mention) && !isActive && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-dc-red text-[9px] font-bold text-white">
              {server.mention || ''}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-dc-surface border-none text-dc-text-primary font-semibold">
        {server.name}
      </TooltipContent>
    </Tooltip>
  );
}

export default function ServerSidebar({ servers, activeServerId, onSelectServer }: ServerSidebarProps) {
  return (
    <div className="flex h-full w-[72px] flex-col items-center gap-2 overflow-y-auto bg-dc-surface py-3 scrollbar-none">
      {/* FIX Logo / DM Button */}
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            onClick={() => onSelectServer('dm')}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-[50%] transition-all duration-200
              ${activeServerId === 'dm' ? 'rounded-[30%] bg-fox-600' : 'bg-dc-sidebar hover:rounded-[30%] hover:bg-fox-500'}
            `}
          >
            <span className={`absolute -left-3 rounded-r-full bg-dc-text-primary transition-all duration-200 ${activeServerId === 'dm' ? 'h-10 w-1' : 'h-2 w-1 opacity-0 group-hover:opacity-100'}`} />
            <FoxLogo size={28} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-dc-surface border-none text-dc-text-primary font-semibold">
          Direkt Mesajlar
        </TooltipContent>
      </Tooltip>

      {/* Divider */}
      <div className="h-px w-8 rounded-full bg-dc-sidebar" />

      {/* Servers */}
      {servers.map((server) => (
        <ServerIcon
          key={server.id}
          server={server}
          isActive={activeServerId === server.id}
          onClick={() => onSelectServer(server.id)}
        />
      ))}

      {/* Divider */}
      <div className="h-px w-8 rounded-full bg-dc-sidebar" />

      {/* Add server */}
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button className="group flex h-12 w-12 items-center justify-center rounded-[50%] bg-dc-sidebar transition-all duration-200 hover:rounded-[30%] hover:bg-dc-green">
            <Plus className="h-5 w-5 text-dc-green transition-colors group-hover:text-white" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-dc-surface border-none text-dc-text-primary font-semibold">
          Sunucu Ekle
        </TooltipContent>
      </Tooltip>

      {/* Discover */}
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button className="group flex h-12 w-12 items-center justify-center rounded-[50%] bg-dc-sidebar transition-all duration-200 hover:rounded-[30%] hover:bg-dc-green">
            <Compass className="h-5 w-5 text-dc-green transition-colors group-hover:text-white" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-dc-surface border-none text-dc-text-primary font-semibold">
          Sunucuları Keşfet
        </TooltipContent>
      </Tooltip>

      {/* DM fallback icon */}
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button className="group mt-auto flex h-12 w-12 items-center justify-center rounded-[50%] bg-dc-sidebar transition-all duration-200 hover:rounded-[30%] hover:bg-fox-500">
            <MessageCircle className="h-5 w-5 text-dc-muted-fg transition-colors group-hover:text-white" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-dc-surface border-none text-dc-text-primary font-semibold">
          Mesajlar
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
