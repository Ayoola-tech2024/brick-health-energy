"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { createBrowserClient } from "@insforge/sdk/ssr";

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
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
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
      const client = createBrowserClient();
      const { data } = await client.auth.getCurrentUser();
      if (data?.user) {
        const profileData = await client.auth.getProfile(data.user.id);
        const enriched = {
          ...data.user,
          profile: profileData?.data ?? data.user.profile,
        };
        setUser(mapUser(enriched));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    refreshUser().finally(() => {
      if (!cancelled) setLoading(false);
    });

    if (typeof window !== "undefined" && window.location.search.includes("insforge_code")) {
      const interval = setInterval(() => {
        if (userRef.current) {
          clearInterval(interval);
          return;
        }
        refreshUser();
      }, 300);
      setTimeout(() => clearInterval(interval), 5000);
    }

    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
