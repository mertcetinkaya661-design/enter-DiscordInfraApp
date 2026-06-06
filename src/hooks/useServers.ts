import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
  custom_status: string | null;
}

export interface ServerMember {
  id: string;
  server_id: string;
  user_id: string;
  role: string;
  nickname: string | null;
  profile: Profile;
}

export interface Channel {
  id: string;
  server_id: string;
  category_id: string | null;
  name: string;
  type: string;
  topic: string | null;
  position: number;
}

export interface ChannelCategory {
  id: string;
  server_id: string;
  name: string;
  position: number;
  channels: Channel[];
}

export interface Server {
  id: string;
  name: string;
  icon_url: string | null;
  color: string;
  owner_id: string;
  invite_code: string;
  categories: ChannelCategory[];
  members: ServerMember[];
}

export function useServers(userId: string | undefined) {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServers = useCallback(async () => {
    if (!userId) { setServers([]); setLoading(false); return; }
    setLoading(true);
    try {
      // Get server IDs user belongs to
      const { data: memberships } = await supabase
        .from('server_members')
        .select('server_id')
        .eq('user_id', userId);

      if (!memberships?.length) { setServers([]); setLoading(false); return; }

      const serverIds = memberships.map(m => m.server_id);

      const [serversRes, categoriesRes, channelsRes, membersRes] = await Promise.all([
        supabase.from('servers').select('*').in('id', serverIds),
        supabase.from('channel_categories').select('*').in('server_id', serverIds).order('position'),
        supabase.from('channels').select('*').in('server_id', serverIds).order('position'),
        supabase.from('server_members').select('*, profile:profiles(*)').in('server_id', serverIds),
      ]);

      const servers: Server[] = (serversRes.data ?? []).map(s => {
        const cats = (categoriesRes.data ?? []).filter(c => c.server_id === s.id).map(cat => ({
          ...cat,
          channels: (channelsRes.data ?? []).filter(ch => ch.category_id === cat.id),
        }));
        // Channels without categories
        const uncategorized = (channelsRes.data ?? []).filter(
          ch => ch.server_id === s.id && !ch.category_id
        );
        if (uncategorized.length) {
          cats.push({ id: 'uncategorized-' + s.id, server_id: s.id, name: 'KANALLAR', position: 999, channels: uncategorized });
        }
        return {
          ...s,
          categories: cats,
          members: ((membersRes.data ?? []) as (ServerMember & { profile: Profile })[])
            .filter(m => m.server_id === s.id)
            .map(m => ({ ...m, profile: m.profile })),
        };
      });

      setServers(servers);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchServers(); }, [fetchServers]);

  const createServer = async (name: string, color: string, userId: string) => {
    const { data: server, error } = await supabase
      .from('servers')
      .insert({ name, color, owner_id: userId })
      .select()
      .single();
    if (error || !server) return { error };

    // Add owner as member
    await supabase.from('server_members').insert({ server_id: server.id, user_id: userId, role: 'owner' });

    // Create default categories and channels
    const { data: cat1 } = await supabase.from('channel_categories').insert({ server_id: server.id, name: 'GENEL', position: 0 }).select().single();
    const { data: cat2 } = await supabase.from('channel_categories').insert({ server_id: server.id, name: 'SES', position: 1 }).select().single();

    if (cat1) {
      await supabase.from('channels').insert([
        { server_id: server.id, category_id: cat1.id, name: 'genel', type: 'text', position: 0 },
        { server_id: server.id, category_id: cat1.id, name: 'kurallar', type: 'text', position: 1 },
      ]);
    }
    if (cat2) {
      await supabase.from('channels').insert({ server_id: server.id, category_id: cat2.id, name: 'Sesli Sohbet', type: 'voice', position: 0 });
    }

    await fetchServers();
    return { error: null, serverId: server.id };
  };

  const joinServerByInvite = async (inviteCode: string, userId: string) => {
    const { data: server } = await supabase.from('servers').select('id').eq('invite_code', inviteCode).maybeSingle();
    if (!server) return { error: new Error('Geçersiz davet kodu') };
    await supabase.from('server_members').upsert({ server_id: server.id, user_id: userId, role: 'member' });
    await fetchServers();
    return { error: null, serverId: server.id };
  };

  return { servers, loading, refetch: fetchServers, createServer, joinServerByInvite };
}
