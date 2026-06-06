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

export type BannedMember = {
  id: string;
  server_id: string;
  user_id: string;
  reason: string | null;
  banned_at: string;
  profile: { id: string; username: string; display_name: string; avatar_url: string | null };
};

export function useServers(userId: string | undefined) {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServers = useCallback(async () => {
    if (!userId) { setServers([]); setLoading(false); return; }
    setLoading(true);
    try {
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
    try {
      const { data: server, error: serverErr } = await supabase
        .from('servers')
        .insert({ name, color, owner_id: userId })
        .select()
        .single();

      if (serverErr) return { error: serverErr };
      if (!server) return { error: new Error('Sunucu oluşturulamadı.') };

      const { error: memberErr } = await supabase
        .from('server_members')
        .insert({ server_id: server.id, user_id: userId, role: 'owner' });
      if (memberErr) console.warn('server_members insert error:', memberErr.message);

      const [catRes1, catRes2] = await Promise.all([
        supabase.from('channel_categories').insert({ server_id: server.id, name: 'GENEL', position: 0 }).select().single(),
        supabase.from('channel_categories').insert({ server_id: server.id, name: 'SES', position: 1 }).select().single(),
      ]);

      const channelsToInsert = [];
      if (catRes1.data) {
        channelsToInsert.push(
          { server_id: server.id, category_id: catRes1.data.id, name: 'genel', type: 'text', position: 0 },
          { server_id: server.id, category_id: catRes1.data.id, name: 'duyurular', type: 'announcement', position: 1 },
        );
      }
      if (catRes2.data) {
        channelsToInsert.push(
          { server_id: server.id, category_id: catRes2.data.id, name: 'genel-ses', type: 'voice', position: 0 },
        );
      }
      if (channelsToInsert.length) {
        const { error: chErr } = await supabase.from('channels').insert(channelsToInsert);
        if (chErr) console.warn('channels insert error:', chErr.message);
      }

      await fetchServers();
      return { error: null, serverId: server.id };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Sunucu oluşturulamadı.') };
    }
  };

  const joinServerByInvite = async (inviteCode: string, userId: string) => {
    if (!inviteCode.trim()) return { error: new Error('Davet kodu boş olamaz') };
    const { data: server } = await supabase
      .from('servers')
      .select('id')
      .eq('invite_code', inviteCode.trim().toLowerCase())
      .maybeSingle();
    if (!server) return { error: new Error('Geçersiz davet kodu. Kodu kontrol edip tekrar deneyin.') };
    const { error: upsertErr } = await supabase
      .from('server_members')
      .upsert({ server_id: server.id, user_id: userId, role: 'member' });
    if (upsertErr) return { error: new Error('Sunucuya katılırken hata oluştu.') };
    await fetchServers();
    return { error: null, serverId: server.id };
  };

  const kickMember = async (serverId: string, userId: string) => {
    const { error } = await supabase
      .from('server_members')
      .delete()
      .eq('server_id', serverId)
      .eq('user_id', userId);
    if (!error) await fetchServers();
    return { error };
  };

  const banMember = async (serverId: string, userId: string, reason = '') => {
    await supabase.from('server_bans').upsert({ server_id: serverId, user_id: userId, reason });
    await supabase.from('server_members').delete().eq('server_id', serverId).eq('user_id', userId);
    await fetchServers();
  };

  const unbanMember = async (serverId: string, userId: string) => {
    await supabase.from('server_bans').delete().eq('server_id', serverId).eq('user_id', userId);
  };

  const updateServer = async (serverId: string, updates: { name?: string; color?: string }) => {
    const { error } = await supabase.from('servers').update(updates).eq('id', serverId);
    if (!error) await fetchServers();
    return { error };
  };

  const updateMemberRole = async (serverId: string, userId: string, role: 'admin' | 'member') => {
    const { error } = await supabase
      .from('server_members')
      .update({ role })
      .eq('server_id', serverId)
      .eq('user_id', userId);
    if (!error) await fetchServers();
    return { error };
  };

  const getBannedMembers = async (serverId: string): Promise<BannedMember[]> => {
    const { data } = await supabase
      .from('server_bans')
      .select('*, profile:profiles(id, username, display_name, avatar_url)')
      .eq('server_id', serverId);
    return (data ?? []) as BannedMember[];
  };

  const deleteServer = async (serverId: string) => {
    const { error } = await supabase.from('servers').delete().eq('id', serverId);
    if (!error) await fetchServers();
    return { error };
  };

  const leaveServer = async (serverId: string, userId: string) => {
    const { error } = await supabase
      .from('server_members')
      .delete()
      .eq('server_id', serverId)
      .eq('user_id', userId);
    if (!error) await fetchServers();
    return { error };
  };

  return {
    servers,
    loading,
    refetch: fetchServers,
    createServer,
    joinServerByInvite,
    kickMember,
    banMember,
    unbanMember,
    updateServer,
    updateMemberRole,
    getBannedMembers,
    deleteServer,
    leaveServer,
  };
}
