import type { User, UserStatus } from '../../types/discord';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

const statusColors: Record<UserStatus, string> = {
  online: 'bg-dc-green',
  idle: 'bg-dc-yellow',
  dnd: 'bg-dc-red',
  offline: 'bg-dc-muted-fg',
};

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-10 h-10 text-sm',
};

const statusSizes = {
  sm: 'w-2.5 h-2.5 border-[1.5px]',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
};

export default function UserAvatar({ user, size = 'md', showStatus = false }: AvatarProps) {
  const initials = user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const colors = [
    'from-fox-500 to-fox-700',
    'from-amber-500 to-orange-600',
    'from-red-500 to-rose-700',
    'from-fox-400 to-amber-600',
    'from-orange-400 to-red-600',
  ];
  const colorIndex = user.id.charCodeAt(user.id.length - 1) % colors.length;

  return (
    <div className="relative inline-flex flex-shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center font-bold text-white`}
      >
        {initials}
      </div>
      {showStatus && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full ${statusColors[user.status]} ${statusSizes[size]} border-dc-surface`}
        />
      )}
    </div>
  );
}
