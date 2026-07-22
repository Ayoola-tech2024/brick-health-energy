"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";

interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  avatarUrl?: string | null;
  raw: any;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setSession: (rawUser: any) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  setSession: () => {},
  clearSession: () => {},
});

function mapUser(raw: any): AuthUser | null {
  if (!raw) return null;
  const profile = raw.profile as { name?: string; avatar_url?: string } | null;
  const metadata = raw.user_metadata as Record<string, any> | null;
  return {
    id: raw.id,
    email: raw.email ?? "",
    emailVerified: raw.emailVerified ?? false,
    name:
      profile?.name ||
      metadata?.name ||
      metadata?.full_name ||
      raw.name ||
      null,
    avatarUrl:
      profile?.avatar_url ||
      metadata?.avatar_url ||
      metadata?.picture ||
      raw.picture ||
      null,
    raw,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(user);
  userRef.current = user;

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const { data } = await res.json();
      if (data?.user) {
        const mapped = mapUser(data.user);
        setUser(mapped);
        const prevId = userRef.current?.id;
        if (prevId !== mapped?.id && mapped?.id) {
          const { useCartStore } = await import("@/lib/cart-store");
          const cartStore = useCartStore.getState();
          await cartStore.loadFromServer(mapped.id);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const setSession = useCallback((rawUser: any) => {
    if (rawUser) setUser(mapUser(rawUser));
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubCart: (() => void) | null = null;

    async function init() {
      await refreshUser();
      if (!cancelled) setLoading(false);
    }

    init();

    import("@/lib/cart-store").then(({ useCartStore }) => {
      unsubCart = useCartStore.subscribe(
        (state, prevState) => {
          const currentUser = userRef.current;
          if (currentUser?.id && state.items !== prevState.items) {
            useCartStore.getState().syncToServer(currentUser.id);
          }
        }
      );
    });

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("code") || params.has("insforge_code")) {
        window.location.replace("/api/auth/callback" + window.location.search);
      }
    }

    return () => {
      cancelled = true;
      if (unsubCart) unsubCart();
    };
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, setSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
