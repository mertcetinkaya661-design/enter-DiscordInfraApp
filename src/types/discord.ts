export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: UserStatus;
  customStatus?: string;
}

export type ChannelType = 'text' | 'voice' | 'announcement';

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  topic?: string;
  unread?: boolean;
  mention?: number;
}

export interface ChannelCategory {
  id: string;
  name: string;
  channels: Channel[];
  collapsed?: boolean;
}

export interface Message {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
  edited?: boolean;
  reactions?: { emoji: string; count: number }[];
  pinned?: boolean;
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  acronym: string;
  color: string;
  categories: ChannelCategory[];
  members: ServerMember[];
  unread?: boolean;
  mention?: number;
}

export interface ServerMember {
  user: User;
  role: 'owner' | 'admin' | 'mod' | 'member';
  nickname?: string;
}

export interface DirectMessage {
  id: string;
  user: User;
  messages: Message[];
  unread?: number;
}
