import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "warmly:auth:v1";

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  provider: "email" | "google" | "apple";
}

interface AuthState {
  hasOnboarded: boolean;
  user: User | null;
}

const DEFAULT: AuthState = { hasOnboarded: false, user: null };

async function loadState(): Promise<AuthState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<AuthState>) };
  } catch {
    return DEFAULT;
  }
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>(DEFAULT);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const query = useQuery<AuthState>({
    queryKey: ["auth"],
    queryFn: loadState,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.data && !hydrated) {
      setState(query.data);
      setHydrated(true);
    }
  }, [query.data, hydrated]);

  const persist = useCallback(async (next: AuthState) => {
    setState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.log("[Warmly] failed to persist auth", e);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    void persist({ ...state, hasOnboarded: true });
  }, [state, persist]);

  const signIn = useCallback(
    (provider: User["provider"], overrides?: Partial<User>) => {
      const user: User = {
        id: `u_${Date.now()}`,
        name: overrides?.name ?? "Alex Morgan",
        email: overrides?.email ?? "alex@socialcapital.app",
        photo: overrides?.photo,
        provider,
      };
      void persist({ hasOnboarded: true, user });
    },
    [persist]
  );

  const signOut = useCallback(() => {
    void persist({ hasOnboarded: state.hasOnboarded, user: null });
  }, [state.hasOnboarded, persist]);

  return {
    isLoading: query.isLoading || !hydrated,
    hasOnboarded: state.hasOnboarded,
    user: state.user,
    completeOnboarding,
    signIn,
    signOut,
  };
});
