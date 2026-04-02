import { create } from "zustand";
import type { Profile, Membership, Location } from "@/lib/supabase/types";

interface AuthState {
  profile: Profile | null;
  membership: Membership | null;
  location: Location | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setMembership: (membership: Membership | null) => void;
  setLocation: (location: Location | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  membership: null,
  location: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setMembership: (membership) => set({ membership }),
  setLocation: (location) => set({ location }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () =>
    set({ profile: null, membership: null, location: null, isLoading: false }),
}));
