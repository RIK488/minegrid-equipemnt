import { useState, useEffect, useRef } from 'react';
import supabaseClient from '../utils/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    supabaseClient.auth.getSession()
      .then(({ data }: { data: any }) => {
        if (mountedRef.current) {
          setUser(data.session?.user ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) setLoading(false);
      });

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event: any, session: any) => {
        if (mountedRef.current) {
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
