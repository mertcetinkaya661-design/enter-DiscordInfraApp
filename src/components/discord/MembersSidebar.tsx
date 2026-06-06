import type { ServerMember } from '../../types/discord';
import UserAvatar from './UserAvatar';

interface MembersSidebarProps {
  members: ServerMember[];
}

const roleColors: Record<string, string> = {
  owner: 'text-fox-400 bg-fox-500/15',
  admin: 'text-amber-400 bg-amber-500/15',
  mod: 'text-green-400 bg-green-500/15',
  member: '',
};

const roleLabels: Record<string, string> = {
  owner: 'Sahip',
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

  const total = members.length;
  const online = members.filter((m) => m.user.status !== 'offline').length;

  return (
    <div className="flex h-full w-56 flex-col bg-dc-sidebar">
      {/* Header */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-dc-text-primary leading-tight">Üyeler</span>
          <span className="text-[10px] text-dc-muted-fg">{online} çevrimiçi · {total} toplam</span>
        </div>
      </div>

      {/* Member list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-dc-surface">
        {sections.map((section) => (
          <div key={section.key} className="mb-5">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-dc-surface/60" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-dc-muted-fg/60">{section.label}</span>
              <div className="h-px flex-1 bg-dc-surface/60" />
            </div>
            <div className="flex flex-col gap-0.5">
              {section.members.map((member) => (
                <button
                  key={member.user.id}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-2 transition-all hover:bg-dc-channel-hover/60"
                >
                  <UserAvatar user={member.user} size="sm" showStatus />
                  <div className="flex min-w-0 flex-1 flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className={`truncate text-xs font-semibold ${member.user.status === 'offline' ? 'text-dc-muted-fg/50' : 'text-dc-text-secondary group-hover:text-dc-text-primary'}`}>
                        {member.nickname ?? member.user.displayName}
                      </span>
                      {member.role !== 'member' && (
                        <span className={`rounded-md px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide ${roleColors[member.role]}`}>
                          {roleLabels[member.role]}
                        </span>
                      )}
                    </div>
                    {member.user.customStatus && (
                      <span className="truncate text-[10px] text-dc-muted-fg/60">{member.user.customStatus}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
