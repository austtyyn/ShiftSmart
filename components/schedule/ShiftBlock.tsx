"use client";

import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { ShiftWithProfile } from "@/lib/supabase/types";

interface ShiftBlockProps {
  shift: ShiftWithProfile;
  isOwn?: boolean;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}

export function ShiftBlock({ shift, isOwn, canDelete, onDelete }: ShiftBlockProps) {
  return (
    <div
      className={`group relative rounded-lg p-2 text-xs overflow-hidden cursor-default ${
        isOwn
          ? "bg-[#FF6B35]/15 border border-[#FF6B35]/30"
          : "bg-[#242424] border border-[#2A2A2A]"
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p
            className={`font-bold font-[var(--font-display)] tracking-wide truncate ${
              isOwn ? "text-[#FF6B35]" : "text-[#F5F5F5]"
            }`}
          >
            {shift.profile?.avatar_emoji ?? "👤"} {shift.profile?.name ?? "Unknown"}
          </p>
          <p className="text-[#888] mt-0.5">
            {format(new Date(shift.start_time), "h:mm a")} –{" "}
            {format(new Date(shift.end_time), "h:mm a")}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete?.(shift.id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#555] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all flex-shrink-0"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
