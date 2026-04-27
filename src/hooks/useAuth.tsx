import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ADMIN_EMAIL = "admin@keybot.com";

function isAdminEmail(user: User | null | undefined) {
  return user?.email?.toLowerCase() === ADMIN_EMAIL;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, sess) => {
      const nextUser = sess?.user ?? null;
      setSession(sess);
      setUser(nextUser);
      setIsAdmin(isAdminEmail(nextUser));
      if (nextUser) {
        setTimeout(() => checkAdmin(nextUser), 0);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      const nextUser = sess?.user ?? null;
      setSession(sess);
      setUser(nextUser);
      setIsAdmin(isAdminEmail(nextUser));
      if (nextUser) checkAdmin(nextUser);
      setLoading(false);
    });

    // Re-checa role quando a aba volta ao foco (cobre falhas temporárias 503)
    const onFocus = () => {
      supabase.auth.getSession().then(({ data: { session: sess } }) => {
        if (sess?.user) checkAdmin(sess.user);
      });
    };
    window.addEventListener("focus", onFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  async function checkAdmin(currentUser: User, attempt = 0) {
    if (isAdminEmail(currentUser)) {
      setIsAdmin(true);
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      // Backend temporariamente indisponível (503/PGRST001/PGRST002) — tenta de novo
      if (attempt < 5) {
        setTimeout(() => checkAdmin(currentUser, attempt + 1), 1500 * (attempt + 1));
      }
      return;
    }
    setIsAdmin(!!data || isAdminEmail(currentUser));
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
