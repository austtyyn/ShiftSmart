"use client";

import { useState } from "react";
import { CheckCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HandoffNote } from "@/lib/supabase/types";

interface HandoffCardProps {
  handoffId: string;
  outgoingName: string;
  incomingName: string | null;
  shiftLabel: string | null;
  notes: HandoffNote[];
  tasksCarriedOver: number;
  crewTonight: string[];
  acceptedAt: string | null;
  currentUserId: string;
  incomingUserId: string | null;
  onAccept: (handoffId: string) => Promise<void>;
}

const NOTE_ICONS: Record<HandoffNote["type"], string> = {
  warning: "⚠️",
  check: "✅",
  info: "📋",
};

export function HandoffCard({
  handoffId,
  outgoingName,
  incomingName,
  shiftLabel,
  notes,
  tasksCarriedOver,
  crewTonight,
  acceptedAt,
  currentUserId,
  incomingUserId,
  onAccept,
}: HandoffCardProps) {
  const [accepting, setAccepting] = useState(false);
  const isIncoming = !incomingUserId || incomingUserId === currentUserId;
  const canAccept = isIncoming && !acceptedAt;

  const handleAccept = async () => {
    setAccepting(true);
    await onAccept(handoffId);
    setAccepting(false);
  };

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414] overflow-hidden w-full max-w-md">
      {/* Header */}
      <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center gap-2">
        <span className="text-base">🔄</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold tracking-widest uppercase font-[var(--font-display)] text-[#888]">
            Shift Handoff
          </p>
          <p className="text-sm font-bold text-[#F5F5F5] truncate">
            {outgoingName} → {incomingName ?? "Next Lead"}
            {shiftLabel && (
              <span className="text-[#555] font-normal ml-1">| {shiftLabel}</span>
            )}
          </p>
        </div>
        {acceptedAt ? (
          <span className="flex items-center gap-1 text-xs text-[#22C55E] font-bold font-[var(--font-display)] tracking-wide uppercase flex-shrink-0">
            <CheckCheck size={14} />
            Accepted
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-[#F59E0B] font-bold font-[var(--font-display)] tracking-wide uppercase flex-shrink-0">
            <Clock size={14} />
            Pending
          </span>
        )}
      </div>

      {/* Notes */}
      {notes.length > 0 && (
        <div className="px-4 py-3 space-y-2">
          {notes.map((note, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 text-sm">{NOTE_ICONS[note.type]}</span>
              <span className="text-sm text-[#CCC] leading-snug">{note.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer info */}
      <div className="px-4 pb-3 space-y-1.5">
        {tasksCarriedOver > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#888]">
            <span>📋</span>
            <span>{tasksCarriedOver} open task{tasksCarriedOver !== 1 ? "s" : ""} carried over</span>
          </div>
        )}
        {crewTonight.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#888]">
            <span>👥</span>
            <span>Crew tonight: {crewTonight.join(", ")}</span>
          </div>
        )}
      </div>

      {/* Accept button */}
      {canAccept && (
        <div className="px-4 pb-4">
          <button
            onClick={handleAccept}
            disabled={accepting}
            className={cn(
              "w-full py-2.5 rounded-xl text-sm font-bold tracking-wide font-[var(--font-display)] uppercase transition-all",
              "bg-[#22C55E] text-white hover:bg-[#16A34A] active:scale-95",
              accepting && "opacity-60 cursor-not-allowed"
            )}
          >
            {accepting ? "Accepting…" : "✓ Accept Handoff"}
          </button>
        </div>
      )}
    </div>
  );
}
