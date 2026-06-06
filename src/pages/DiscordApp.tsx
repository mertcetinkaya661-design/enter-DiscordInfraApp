import { useState } from 'react';
import type { Channel } from '../types/discord';
import { servers, directMessages, channelMessages } from '../data/mock';
import ServerSidebar from '../components/discord/ServerSidebar';
import ChannelSidebar from '../components/discord/ChannelSidebar';
import ChatArea from '../components/discord/ChatArea';
import MembersSidebar from '../components/discord/MembersSidebar';
import DMSidebar from '../components/discord/DMSidebar';
import FoxLogo from '../components/discord/FoxLogo';

export default function DiscordApp() {
  const [activeServerId, setActiveServerId] = useState<string | 'dm'>(servers[0].id);
  const [activeChannelId, setActiveChannelId] = useState<string>(servers[0].categories[0].channels[2].id);
  const [activeDmId, setActiveDmId] = useState<string>(directMessages[0].id);
  const [showMembers, setShowMembers] = useState(true);

  const activeServer = servers.find((s) => s.id === activeServerId);
  const isDM = activeServerId === 'dm';

  // Find active channel across all categories
  const activeChannel: Channel | undefined = activeServer?.categories
    .flatMap((c) => c.channels)
    .find((ch) => ch.id === activeChannelId);

  const activeDm = directMessages.find((dm) => dm.id === activeDmId);

  const handleSelectServer = (id: string | 'dm') => {
    setActiveServerId(id);
    if (id !== 'dm') {
      const server = servers.find((s) => s.id === id);
      const firstTextChannel = server?.categories
        .flatMap((c) => c.channels)
        .find((ch) => ch.type === 'text');
      if (firstTextChannel) setActiveChannelId(firstTextChannel.id);
    }
  };

  const messages = isDM
    ? (activeDm?.messages ?? [])
    : (activeChannel ? (channelMessages[activeChannel.id] ?? []) : []);

  return (
    <div className="flex h-full w-full overflow-hidden font-dc">
      {/* Server sidebar */}
      <ServerSidebar
        servers={servers}
        activeServerId={activeServerId}
        onSelectServer={handleSelectServer}
      />

      {/* Channel / DM sidebar */}
      {isDM ? (
        <DMSidebar
          dms={directMessages}
          activeDmId={activeDmId}
          onSelectDm={setActiveDmId}
        />
      ) : activeServer ? (
        <ChannelSidebar
          serverName={activeServer.name}
          serverColor={activeServer.color}
          categories={activeServer.categories}
          activeChannelId={activeChannelId}
          onSelectChannel={setActiveChannelId}
        />
      ) : null}

      {/* Chat area */}
      {isDM && activeDm ? (
        <div className="flex flex-1 flex-col overflow-hidden bg-dc-bg">
          {/* DM header */}
          <div className="flex h-12 flex-shrink-0 items-center gap-3 border-b border-dc-surface px-4 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fox-500 text-xs font-bold text-white">
              {activeDm.user.displayName[0]}
            </div>
            <h3 className="font-semibold text-dc-text-primary text-sm">{activeDm.user.displayName}</h3>
          </div>
          <div className="flex-1 overflow-y-auto py-4 px-4 scrollbar-thin scrollbar-thumb-dc-surface">
            <div className="text-sm text-dc-muted-fg">
              {activeDm.messages.map((msg) => (
                <div key={msg.id} className="mb-3 flex gap-3 hover:bg-dc-message-hover rounded p-1">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-fox-600 text-xs font-bold text-white">
                    {msg.author.displayName[0]}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-dc-text-primary">{msg.author.displayName}</span>
                      <span className="text-[11px] text-dc-muted-fg">
                        {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-dc-text-secondary">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 pb-6 pt-2">
            <div className="flex items-center gap-3 rounded-lg bg-dc-input px-4 py-2.5 text-sm text-dc-muted-fg">
              <span>{activeDm.user.displayName}'a mesaj gönder</span>
            </div>
          </div>
        </div>
      ) : activeChannel ? (
        <ChatArea
          channel={activeChannel}
          messages={messages}
          onSendMessage={() => {}}
          onToggleMembers={() => setShowMembers((v) => !v)}
          showMembers={showMembers}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center bg-dc-bg gap-4">
          <FoxLogo size={72} />
          <p className="text-dc-muted-fg text-sm">Bir kanal seçin</p>
        </div>
      )}

      {/* Members sidebar */}
      {!isDM && activeServer && showMembers && (
        <MembersSidebar members={activeServer.members} />
      )}
    </div>
  );
}
