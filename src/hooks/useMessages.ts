import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface MessageAuthor {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export interface Message {
  id: string;
  channel_id: string;
  author_id: string | null;
  content: string;
  edited_at: string | null;
  created_at: string;
  author: MessageAuthor | null;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
  attachment_size: number | null;
}

export interface MessageSearchResult {
  id: string;
  content: string;
  created_at: string;
  author: MessageAuthor | null;
}

export function useMessages(channelId: string | null, channelName?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const channelNameRef = useRef(channelName);

  const fetchMessages = useCallback(async (chId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*, author:profiles(id, username, display_name, avatar_url)')
      .eq('channel_id', chId)
      .order('created_at', { ascending: true })
      .limit(100);
    setMessages((data as Message[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { channelNameRef.current = channelName; }, [channelName]);

  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!channelId) { setMessages([]); return; }

    fetchMessages(channelId);

    // Subscribe to realtime
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`,
      }, async (payload) => {
        // Fetch full message with author
        const { data } = await supabase
          .from('messages')
          .select('*, author:profiles(id, username, display_name, avatar_url)')
          .eq('id', payload.new.id)
          .single();
        if (data) {
          setMessages(prev => {
            if (prev.some(m => m.id === data.id)) return prev;
            return [...prev, data as Message];
          });
          // Push notification when tab is hidden
          if (document.hidden && Notification.permission === 'granted') {
            const author = (data as Message).author?.display_name ?? 'Bilinmeyen';
            new Notification(`#${channelNameRef.current ?? 'kanal'} — ${author}`, {
              body: (data as Message).content,
              icon: '/favicon.ico',
            });
          }
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`,
      }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`,
      }, (payload) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [channelId, fetchMessages]);

  const sendMessage = async (
    channelId: string,
    authorId: string,
    content: string,
    attachment?: { url: string; type: string; name: string; size: number },
  ) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        author_id: authorId,
        content,
        attachment_url: attachment?.url ?? null,
        attachment_type: attachment?.type ?? null,
        attachment_name: attachment?.name ?? null,
        attachment_size: attachment?.size ?? null,
      });
    return { error };
  };

  const deleteMessage = async (messageId: string) => {
    await supabase.from('messages').delete().eq('id', messageId);
  };

  const editMessage = async (messageId: string, content: string) => {
    await supabase.from('messages').update({ content, edited_at: new Date().toISOString() }).eq('id', messageId);
  };

  const searchMessages = async (query: string): Promise<MessageSearchResult[]> => {
    if (!channelId || !query.trim()) return [];
    const { data } = await supabase
      .from('messages')
      .select('id, content, created_at, author:profiles(id, username, display_name, avatar_url)')
      .eq('channel_id', channelId)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(30);
    return (data as MessageSearchResult[]) ?? [];
  };

  return { messages, loading, sendMessage, deleteMessage, editMessage, searchMessages };
}
