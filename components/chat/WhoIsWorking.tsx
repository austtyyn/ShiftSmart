"use client";

import { useEffect, useState } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { formatShiftTime } from "@/lib/utils";
import type { ShiftWithProfile } from "@/lib/supabase/types";
import { format, startOfDay, endOfDay } from "date-fns";

interface WhoIsWorkingProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function WhoIsWorking({ collapsed, onToggle }: WhoIsWorkingProps) {
  const supabase = createClient();
  const { membership } = useAuthStore();
  const [todayShifts, setTodayShifts] = useState<ShiftWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!membership?.location_id) return;

    const today = new Date();
    const fetchTodayShifts = async () => {
      const { data } = await supabase
        .from("shifts")
        .select(`*, profile:profiles(*)`)
        .eq("location_id", membership.location_id as string)
        .gte("start_time", format(startOfDay(today), "yyyy-MM-dd'T'HH:mm:ss"))
        .lte("start_time", format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss"))
        .order("start_time", { ascending: true });

      if (data) {
        setTodayShifts(data as ShiftWithProfile[]);
      }
      setIsLoading(false);
    };

    fetchTodayShifts();
  }, [membership?.location_id]);

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 h-8 px-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full text-xs text-[#888] hover:text-[#F5F5F5] transition-colors"
      >
        <Clock size={12} className="text-[#22C55E]" />
        <span className="font-bold font-[var(--font-display)] tracking-wide uppercase">
          {todayShifts.length} Working Today
        </span>
        <ChevronDown size={12} />
      </button>
    );
  }

  return (
    <div className="bg-[#1A1A1A] border-l border-[#2A2A2A] w-56 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase text-[#F5F5F5] font-[var(--font-display)]">
            Working Today
          </span>
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            className="text-[#555] hover:text-[#888] transition-colors"
          >
            <ChevronUp size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-4 h-4 border-2 border-[#2A2A2A] border-t-[#22C55E] rounded-full animate-spin" />
          </div>
        ) : todayShifts.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-[#444]">No shifts scheduled today</p>
          </div>
        ) : (
          todayShifts.map((shift) => (
            <div
              key={shift.id}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#242424] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-base flex-shrink-0">
                {shift.profile?.avatar_emoji ?? "👤"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#F5F5F5] truncate font-[var(--font-display)] tracking-wide">
                  {shift.profile?.name ?? "Unknown"}
                </p>
                <p className="text-[10px] text-[#555]">
                  {formatShiftTime(shift.start_time, shift.end_time)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-[#2A2A2A]">
        <p className="text-[10px] text-[#444] text-center font-[var(--font-display)] tracking-widest uppercase">
          {format(new Date(), "EEEE, MMM d")}
        </p>
      </div>
    </div>
  );
}
