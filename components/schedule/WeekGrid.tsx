"use client";

import { addDays, format, isSameDay, isToday } from "date-fns";
import { ShiftBlock } from "./ShiftBlock";
import { Plus } from "lucide-react";
import type { ShiftWithProfile } from "@/lib/supabase/types";

interface WeekGridProps {
  weekStart: Date;
  shifts: ShiftWithProfile[];
  currentUserId?: string;
  canEdit?: boolean;
  onAddShift?: (date: Date) => void;
  onDeleteShift?: (id: string) => void;
}

export function WeekGrid({
  weekStart,
  shifts,
  currentUserId,
  canEdit,
  onAddShift,
  onDeleteShift,
}: WeekGridProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getShiftsForDay = (date: Date) =>
    shifts.filter((s) => isSameDay(new Date(s.start_time), date));

  return (
    <div className="grid grid-cols-7 gap-1 min-h-0">
      {days.map((day) => {
        const dayShifts = getShiftsForDay(day);
        const isCurrentDay = isToday(day);

        return (
          <div
            key={day.toISOString()}
            className={`flex flex-col rounded-xl border min-h-[120px] overflow-hidden ${
              isCurrentDay
                ? "border-[#FF6B35]/40 bg-[#FF6B35]/5"
                : "border-[#2A2A2A] bg-[#1A1A1A]"
            }`}
          >
            {/* Day header */}
            <div
              className={`p-2 border-b text-center ${
                isCurrentDay
                  ? "border-[#FF6B35]/30 bg-[#FF6B35]/10"
                  : "border-[#2A2A2A]"
              }`}
            >
              <p
                className={`text-[10px] font-bold tracking-widest uppercase font-[var(--font-display)] ${
                  isCurrentDay ? "text-[#FF6B35]" : "text-[#555]"
                }`}
              >
                {format(day, "EEE")}
              </p>
              <p
                className={`text-lg font-bold font-[var(--font-display)] ${
                  isCurrentDay ? "text-[#FF6B35]" : "text-[#F5F5F5]"
                }`}
              >
                {format(day, "d")}
              </p>
            </div>

            {/* Shifts */}
            <div className="flex-1 p-1.5 space-y-1 overflow-y-auto">
              {dayShifts.map((shift) => (
                <ShiftBlock
                  key={shift.id}
                  shift={shift}
                  isOwn={shift.user_id === currentUserId}
                  canDelete={canEdit}
                  onDelete={onDeleteShift}
                />
              ))}
            </div>

            {/* Add button */}
            {canEdit && (
              <button
                onClick={() => onAddShift?.(day)}
                className="p-1.5 flex items-center justify-center text-[#333] hover:text-[#555] hover:bg-[#242424] transition-colors border-t border-[#2A2A2A]"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
