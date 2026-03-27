// contexts/AuthContext.js
// Provides: user, session, plan, loading, signOut()
// Wrap _app.js with <AuthProvider> to make these available everywhere.

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({
  user:    null,
  session: null,
  plan:    "free",
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [session, setSession] = useState(null);
  const [plan,    setPlan]    = useState("free");
  const [loading, setLoading] = useState(true);

  function extractPlan(u) {
    return u?.user_metadata?.plan || "free";
  }

  useEffect(() => {
    // 1. Get current session on mount — handles refresh/persistence
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setPlan(extractPlan(session?.user));
      setLoading(false);
    });

    // 2. Listen for login, logout, token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setPlan(extractPlan(session?.user));
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    // State cleared automatically by onAuthStateChange above
  }

  return (
    <AuthContext.Provider value={{ user, session, plan, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook — use this in any component: const { user, plan, signOut } = useAuth()
export function useAuth() {
  return useContext(AuthContext);
}
