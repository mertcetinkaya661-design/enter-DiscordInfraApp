import { MessageCircle, Plus, Compass, Bell } from 'lucide-react';
import type { Server } from '../../types/discord';
import FoxLogo from './FoxLogo';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface ServerSidebarProps {
  servers: Server[];
  activeServerId: string | 'dm';
  onSelectServer: (id: string | 'dm') => void;
}

function ServerPill({ server, isActive, onClick }: { server: Server; isActive: boolean; onClick: () => void }) {
  return (
    <Tooltip delayDuration={80}>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="group relative flex items-center"
        >
          {/* Active glow pill */}
          <span
            className={`absolute -left-3 rounded-r-full transition-all duration-300 ${
              isActive
                ? 'h-8 w-1.5 bg-fox-400 shadow-[0_0_8px_2px_rgba(232,114,42,0.5)]'
                : 'h-2 w-1 bg-dc-text-primary opacity-0 group-hover:opacity-100'
            }`}
          />
          {/* Server icon */}
          <div
            className={`relative flex h-12 w-12 items-center justify-center overflow-hidden text-sm font-bold text-white transition-all duration-300
              ${isActive
                ? 'rounded-2xl shadow-lg'
                : 'rounded-[50%] group-hover:rounded-2xl'
              }
            `}
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${server.color}, ${server.color}cc)`
                : server.color,
              boxShadow: isActive ? `0 4px 16px ${server.color}66` : undefined,
            }}
          >
            {server.acronym}
            {/* Shine */}
            <span className="absolute inset-0 rounded-inherit bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          {/* Badge */}
          {(server.mention || server.unread) && !isActive && (
            <span className={`absolute -bottom-1 -right-1 flex items-center justify-center rounded-full text-[9px] font-bold text-white
              ${server.mention ? 'h-4 min-w-4 bg-red-500 px-1' : 'h-2.5 w-2.5 bg-fox-400'}
            `}>
              {server.mention || ''}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={12} className="border-none bg-dc-surface font-semibold text-dc-text-primary shadow-xl">
        {server.name}
        {server.mention ? <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] text-white">{server.mention}</span> : null}
      </TooltipContent>
    </Tooltip>
  );
}

export default function ServerSidebar({ servers, activeServerId, onSelectServer }: ServerSidebarProps) {
  return (
    <div className="flex h-full w-[76px] flex-col items-center overflow-y-auto bg-dc-surface py-3 scrollbar-none">
      {/* FIX Brand */}
      <Tooltip delayDuration={80}>
        <TooltipTrigger asChild>
          <button
            onClick={() => onSelectServer('dm')}
            className="group relative flex flex-col items-center gap-1 pb-1"
          >
            <span className={`absolute -left-3 rounded-r-full transition-all duration-300 ${
              activeServerId === 'dm'
                ? 'h-8 w-1.5 bg-fox-400 shadow-[0_0_8px_2px_rgba(232,114,42,0.5)]'
                : 'h-2 w-1 bg-dc-text-primary opacity-0 group-hover:opacity-100'
            }`} />
            <div className={`flex h-12 w-12 items-center justify-center rounded-[50%] transition-all duration-300
              ${activeServerId === 'dm' ? 'rounded-2xl bg-fox-600' : 'bg-dc-bg group-hover:rounded-2xl group-hover:bg-fox-500'}
            `}>
              <FoxLogo size={30} />
            </div>
            <span className="text-[9px] font-black tracking-widest text-fox-400">FIX</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="border-none bg-dc-surface font-semibold text-dc-text-primary shadow-xl">
          Direkt Mesajlar
        </TooltipContent>
      </Tooltip>

      {/* Separator */}
      <div className="my-2 h-px w-9 rounded-full bg-dc-sidebar" />

      {/* Server list */}
      <div className="flex flex-col items-center gap-2">
        {servers.map((server) => (
          <ServerPill
            key={server.id}
            server={server}
            isActive={activeServerId === server.id}
            onClick={() => onSelectServer(server.id)}
          />
        ))}
      </div>

      {/* Separator */}
      <div className="my-2 h-px w-9 rounded-full bg-dc-sidebar" />

      {/* Add / discover */}
      <div className="flex flex-col items-center gap-2">
        <Tooltip delayDuration={80}>
          <TooltipTrigger asChild>
            <button className="group flex h-12 w-12 items-center justify-center rounded-[50%] bg-dc-bg text-dc-green transition-all duration-300 hover:rounded-2xl hover:bg-dc-green hover:text-white">
              <Plus className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="border-none bg-dc-surface font-semibold text-dc-text-primary shadow-xl">
            Yeni Sunucu
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={80}>
          <TooltipTrigger asChild>
            <button className="group flex h-12 w-12 items-center justify-center rounded-[50%] bg-dc-bg text-dc-green transition-all duration-300 hover:rounded-2xl hover:bg-dc-green hover:text-white">
              <Compass className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="border-none bg-dc-surface font-semibold text-dc-text-primary shadow-xl">
            Keşfet
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Notifications at bottom */}
      <div className="mt-auto flex flex-col items-center gap-2 pt-2">
        <Tooltip delayDuration={80}>
          <TooltipTrigger asChild>
            <button className="group flex h-12 w-12 items-center justify-center rounded-[50%] bg-dc-bg text-dc-muted-fg transition-all duration-300 hover:rounded-2xl hover:bg-fox-500 hover:text-white">
              <Bell className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="border-none bg-dc-surface font-semibold text-dc-text-primary shadow-xl">
            Bildirimler
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={80}>
          <TooltipTrigger asChild>
            <button className="group flex h-12 w-12 items-center justify-center rounded-[50%] bg-dc-bg text-dc-muted-fg transition-all duration-300 hover:rounded-2xl hover:bg-fox-500 hover:text-white">
              <MessageCircle className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="border-none bg-dc-surface font-semibold text-dc-text-primary shadow-xl">
            Mesajlar
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
