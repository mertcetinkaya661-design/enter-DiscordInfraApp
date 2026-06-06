import type { ServerMember, UserStatus } from '../../types/discord';
import UserAvatar from './UserAvatar';

interface MembersSidebarProps {
  members: ServerMember[];
}

const statusLabel: Record<UserStatus, string> = {
  online: 'Çevrimiçi',
  idle: 'Boşta',
  dnd: 'Rahatsız Etme',
  offline: 'Çevrimdışı',
};

const roleLabel: Record<string, string> = {
  owner: 'Sunucu Sahibi',
  admin: 'Yönetici',
  mod: 'Moderatör',
  member: 'Üye',
};

export default function MembersSidebar({ members }: MembersSidebarProps) {
  const grouped: Record<string, ServerMember[]> = {
    owner: [],
    admin: [],
    mod: [],
    online: [],
    offline: [],
  };

  for (const m of members) {
    if (m.role === 'owner') grouped.owner.push(m);
    else if (m.role === 'admin') grouped.admin.push(m);
    else if (m.role === 'mod') grouped.mod.push(m);
    else if (m.user.status !== 'offline') grouped.online.push(m);
    else grouped.offline.push(m);
  }

  const sections = [
    { key: 'owner', label: 'Sunucu Sahibi', members: grouped.owner },
    { key: 'admin', label: 'Yöneticiler', members: grouped.admin },
    { key: 'mod', label: 'Moderatörler', members: grouped.mod },
    { key: 'online', label: 'Çevrimiçi', members: grouped.online },
    { key: 'offline', label: 'Çevrimdışı', members: grouped.offline },
  ].filter((s) => s.members.length > 0);

  return (
    <div className="flex h-full w-60 flex-col overflow-y-auto bg-dc-sidebar px-2 py-4 scrollbar-thin scrollbar-thumb-dc-surface">
      <div className="mb-3 px-2 text-[11px] font-bold uppercase tracking-wider text-dc-muted-fg">
        Üyeler — {members.length}
      </div>
      {sections.map((section) => (
        <div key={section.key} className="mb-4">
          <div className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wider text-dc-muted-fg">
            {section.label} — {section.members.length}
          </div>
          {section.members.map((member) => (
            <button
              key={member.user.id}
              className="group flex w-full items-center gap-3 rounded px-2 py-1.5 transition-colors hover:bg-dc-channel-hover"
            >
              <UserAvatar user={member.user} size="sm" showStatus />
              <div className="flex min-w-0 flex-col text-left">
                <span className={`truncate text-sm font-medium ${member.user.status === 'offline' ? 'text-dc-muted-fg' : 'text-dc-text-secondary group-hover:text-dc-text-primary'}`}>
                  {member.nickname ?? member.user.displayName}
                </span>
                {member.user.customStatus && (
                  <span className="truncate text-[11px] text-dc-muted-fg">{member.user.customStatus}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
