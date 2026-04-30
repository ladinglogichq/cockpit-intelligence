import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";

type SupabaseAuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, loading, signInWithOtp, signOut }),
    [session, loading, signInWithOtp, signOut]
  );

  return (
    <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  return ctx;
}
