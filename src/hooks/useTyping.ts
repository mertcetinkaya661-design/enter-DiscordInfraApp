import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface TypingUser { userId: string; displayName: string; }

export function useTyping(channelId: string | null, myUserId: string | null, myDisplayName: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    setTypingUsers([]);
    if (!channelId || !myUserId) return;

    const ch = supabase.channel(`typing:${channelId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === myUserId) return;
        if (payload.typing) {
          setTypingUsers(prev => {
            if (prev.find(u => u.userId === payload.userId)) return prev;
            return [...prev, { userId: payload.userId, displayName: payload.displayName }];
          });
          // Auto-remove after 4s if no new event
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u.userId !== payload.userId));
          }, 4000);
        } else {
          setTypingUsers(prev => prev.filter(u => u.userId !== payload.userId));
        }
      })
      .subscribe();
    channelRef.current = ch;

    return () => { supabase.removeChannel(ch); channelRef.current = null; };
  }, [channelId, myUserId]);

  const startTyping = useCallback(() => {
    if (!channelRef.current || !myUserId) return;
    channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { userId: myUserId, displayName: myDisplayName, typing: true } });
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(() => {
      channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { userId: myUserId, displayName: myDisplayName, typing: false } });
    }, 3000);
  }, [myUserId, myDisplayName]);

  return { typingUsers, startTyping };
}
