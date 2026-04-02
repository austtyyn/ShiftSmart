"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import type { MemberWithProfile, Membership, Profile } from "@/lib/supabase/types";

type MembershipWithProfile = Membership & { profile: Profile };

export function useMembers() {
  const supabase = createClient();
  const { membership } = useAuthStore();
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!membership?.location_id) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("memberships")
      .select(`*, profile:profiles(*)`)
      .eq("location_id", membership.location_id)
      .eq("is_active", true)
      .order("joined_at", { ascending: true });

    if (!error && data) {
      setMembers(
        (data as MembershipWithProfile[]).map((row) => ({
          membership: {
            id: row.id,
            user_id: row.user_id,
            location_id: row.location_id,
            role: row.role,
            joined_at: row.joined_at,
            is_active: row.is_active,
          },
          profile: row.profile,
        }))
      );
    }
    setIsLoading(false);
  }, [membership?.location_id, supabase]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, isLoading, refetch: fetchMembers };
}
