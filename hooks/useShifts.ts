"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useScheduleStore } from "@/stores/scheduleStore";
import { format, addDays } from "date-fns";
import type { Profile, Shift, ShiftWithProfile } from "@/lib/supabase/types";

type ShiftWithProfileRaw = Shift & { profile: Profile | null };

export function useShifts() {
  const supabase = createClient();
  const { membership } = useAuthStore();
  const { weekStart, setShifts, addShift, removeShift, setLoading } =
    useScheduleStore();

  const fetchShifts = useCallback(async () => {
    if (!membership?.location_id) return;
    setLoading(true);

    const weekEnd = addDays(weekStart, 7);

    const { data, error } = await supabase
      .from("shifts")
      .select(`*, profile:profiles!shifts_user_id_fkey(*)`)
      .eq("location_id", membership.location_id)
      .gte("start_time", format(weekStart, "yyyy-MM-dd'T'HH:mm:ss"))
      .lt("start_time", format(weekEnd, "yyyy-MM-dd'T'HH:mm:ss"))
      .order("start_time", { ascending: true });

    if (!error && data) {
      setShifts((data as ShiftWithProfileRaw[]).map((row) => ({ ...row })));
    }
    setLoading(false);
  }, [membership?.location_id, weekStart, supabase, setShifts, setLoading]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const createShift = async (params: {
    user_id: string;
    start_time: string;
    end_time: string;
  }) => {
    const res = await fetch("/api/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const json = await res.json();

    if (!res.ok) {
      return { data: null, error: json.error ?? "Failed to create shift" };
    }

    addShift(json.shift as ShiftWithProfile);
    return { data: json.shift, error: null };
  };

  const deleteShift = async (id: string) => {
    const res = await fetch("/api/shifts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const json = await res.json();

    if (!res.ok) {
      return { error: json.error ?? "Failed to delete shift" };
    }

    removeShift(id);
    return { error: null };
  };

  return { fetchShifts, createShift, deleteShift };
}
