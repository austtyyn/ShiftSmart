"use client";

import { cn } from "@/lib/utils";
import type { PresenceStatus } from "@/lib/supabase/types";

interface PresenceBadgeProps {
  status: PresenceStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const PRESENCE_CONFIG: Record<PresenceStatus, { dot: string; label: string; icon: string }> = {
  on_shift: { dot: "bg-[#22C55E]", label: "On Shift", icon: "🟢" },
  off_shift: { dot: "bg-[#555]", label: "Off Shift", icon: "🌙" },
  starting_soon: { dot: "bg-[#F59E0B] animate-pulse", label: "Starting Soon", icon: "⏰" },
  unavailable: { dot: "bg-[#EF4444]", label: "Unavailable", icon: "📵" },
};

export function PresenceBadge({ status, showLabel = false, size = "sm" }: PresenceBadgeProps) {
  const config = PRESENCE_CONFIG[status] ?? PRESENCE_CONFIG.off_shift;
  const dotSize = size === "md" ? "w-3 h-3" : "w-2 h-2";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("rounded-full flex-shrink-0", dotSize, config.dot)} />
      {showLabel && (
        <span className="text-xs text-[#888] font-[var(--font-display)] tracking-wide uppercase">
          {config.label}
        </span>
      )}
    </span>
  );
}

export function PresenceIcon({ status }: { status: PresenceStatus }) {
  return <span>{PRESENCE_CONFIG[status]?.icon ?? "🌙"}</span>;
}
