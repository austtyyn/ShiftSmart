"use client";

import * as Progress from "@radix-ui/react-progress";

interface AckProgressProps {
  acknowledged: number;
  total: number;
}

export function AckProgress({ acknowledged, total }: AckProgressProps) {
  const pct = total > 0 ? Math.round((acknowledged / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#888]">
          {acknowledged} of {total} confirmed
        </span>
        <span
          className={`text-xs font-bold font-[var(--font-display)] tracking-wide ${
            pct === 100 ? "text-[#22C55E]" : pct >= 50 ? "text-[#F59E0B]" : "text-[#EF4444]"
          }`}
        >
          {pct}%
        </span>
      </div>
      <Progress.Root
        className="relative h-2 overflow-hidden rounded-full bg-[#2A2A2A]"
        value={pct}
      >
        <Progress.Indicator
          className={`h-full rounded-full transition-all duration-500 ${
            pct === 100
              ? "bg-[#22C55E]"
              : pct >= 50
              ? "bg-[#F59E0B]"
              : "bg-[#EF4444]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </Progress.Root>
    </div>
  );
}
