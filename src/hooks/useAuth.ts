import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
  custom_status: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    // Retry profile fetch – trigger may take a moment after signup
    const fetchProfile = async (userId: string): Promise<Profile | null> => {
      for (let i = 0; i < 4; i++) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (data) return data as Profile;
        if (i < 3) await new Promise(r => setTimeout(r, 700 * (i + 1)));
      }
      return null;
    };

    // Listen first, then check session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(async () => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({ user: session.user, session, profile, loading: false });
        } else {
          setState({ user: null, session: null, profile: null, loading: false });
        }
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    try {
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'user';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { username: cleanUsername, display_name: displayName },
        },
      });
      if (error) return { error };

      // Explicitly upsert profile so we get proper error messages
      if (data.user) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert(
            { id: data.user.id, username: cleanUsername, display_name: displayName },
            { onConflict: 'id', ignoreDuplicates: false }
          );

        if (profileErr) {
          // Username taken → return friendly error
          if (profileErr.message?.includes('unique') || profileErr.message?.includes('duplicate')) {
            return { error: new Error('Bu kullanıcı adı zaten alınmış. Başka bir ad deneyin.') };
          }
          // Other profile errors are non-fatal (trigger may have created it already)
          console.warn('Profile upsert warning:', profileErr.message);
        }
      }

      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateStatus = async (status: string) => {
    if (!state.user) return;
    await supabase.from('profiles').update({ status }).eq('id', state.user.id);
  };

  return { ...state, signIn, signUp, signOut, updateStatus };
}
