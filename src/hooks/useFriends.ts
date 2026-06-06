import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface FriendProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
}

export interface Friendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  friend: FriendProfile;
}

export function useFriends(myUserId: string | null) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingIncoming, setPendingIncoming] = useState<Friendship[]>([]);
  const [pendingOutgoing, setPendingOutgoing] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = useCallback(async () => {
    if (!myUserId) return;
    setLoading(true);
    const { data } = await supabase
      .from('friendships')
      .select('*, sender:profiles!friendships_sender_id_fkey(id,username,display_name,avatar_url,status), receiver:profiles!friendships_receiver_id_fkey(id,username,display_name,avatar_url,status)')
      .or(`sender_id.eq.${myUserId},receiver_id.eq.${myUserId}`);

    if (data) {
      const mapped = data.map((f: Record<string, unknown>) => {
        const isSender = f.sender_id === myUserId;
        const friend = (isSender ? f.receiver : f.sender) as FriendProfile;
        return { id: f.id as string, sender_id: f.sender_id as string, receiver_id: f.receiver_id as string, status: f.status as string, created_at: f.created_at as string, friend };
      });
      setFriends(mapped.filter(f => f.status === 'accepted'));
      setPendingIncoming(mapped.filter(f => f.status === 'pending' && f.receiver_id === myUserId));
      setPendingOutgoing(mapped.filter(f => f.status === 'pending' && f.sender_id === myUserId));
    }
    setLoading(false);
  }, [myUserId]);

  useEffect(() => {
    if (!myUserId) return;
    fetchFriends();
    const ch = supabase
      .channel(`friendships:${myUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => fetchFriends())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [myUserId, fetchFriends]);

  const sendFriendRequest = async (username: string) => {
    if (!myUserId) return { error: new Error('Giriş gerekli') };
    const { data: target } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    if (!target) return { error: new Error('Kullanıcı bulunamadı') };
    if (target.id === myUserId) return { error: new Error('Kendinize istek gönderemezsiniz') };
    const { error } = await supabase.from('friendships').insert({ sender_id: myUserId, receiver_id: target.id });
    if (error) {
      if (error.message.includes('unique')) return { error: new Error('İstek zaten gönderildi') };
      return { error };
    }
    await fetchFriends();
    return { error: null };
  };

  const acceptRequest = async (friendshipId: string) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
    await fetchFriends();
  };

  const rejectRequest = async (friendshipId: string) => {
    await supabase.from('friendships').delete().eq('id', friendshipId);
    await fetchFriends();
  };

  const removeFriend = async (friendshipId: string) => {
    await supabase.from('friendships').delete().eq('id', friendshipId);
    await fetchFriends();
  };

  return { friends, pendingIncoming, pendingOutgoing, loading, sendFriendRequest, acceptRequest, rejectRequest, removeFriend };
}
