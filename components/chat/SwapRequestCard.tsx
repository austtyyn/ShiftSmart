"use client";

import { useState } from "react";
import { Calendar, Clock, CheckCheck, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SwapStatus } from "@/lib/supabase/types";

interface SwapRequestCardProps {
  swapId: string;
  requestedByName: string;
  requestedByEmoji: string;
  coveredByName: string | null;
  coveredByEmoji: string | null;
  shiftDate: string;
  shiftStart: string;
  shiftEnd: string;
  status: SwapStatus;
  note: string | null;
  currentUserId: string;
  requestedById: string | null;
  coveredById: string | null;
  isManager: boolean;
  onCover: (swapId: string) => Promise<void>;
  onApprove: (swapId: string) => Promise<void>;
}

const STATUS_CONFIG: Record<SwapStatus, { label: string; color: string }> = {
  open: { label: "Open — Needs Coverage", color: "text-[#F59E0B]" },
  pending_approval: { label: "Pending Approval", color: "text-[#60A5FA]" },
  approved: { label: "Approved ✓", color: "text-[#22C55E]" },
  cancelled: { label: "Cancelled", color: "text-[#555]" },
};

export function SwapRequestCard({
  swapId,
  requestedByName,
  requestedByEmoji,
  coveredByName,
  coveredByEmoji,
  shiftDate,
  shiftStart,
  shiftEnd,
  status,
  note,
  currentUserId,
  requestedById,
  coveredById,
  isManager,
  onCover,
  onApprove,
}: SwapRequestCardProps) {
  const [loading, setLoading] = useState(false);
  const isRequester = requestedById === currentUserId;
  const isCoverer = coveredById === currentUserId;
  const canCover = !isRequester && status === "open";
  const canApprove = isManager && status === "pending_approval";
  const statusConfig = STATUS_CONFIG[status];

  const handleCover = async () => {
    setLoading(true);
    await onCover(swapId);
    setLoading(false);
  };

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(swapId);
    setLoading(false);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden w-full max-w-md",
        status === "approved"
          ? "border-[#22C55E]/30 bg-[#22C55E]/5"
          : status === "cancelled"
          ? "border-[#1A1A1A] bg-[#0F0F0F] opacity-60"
          : "border-[#2A2A2A] bg-[#141414]"
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1A1A1A]/50 flex items-center gap-2">
        <span className="text-base">🔁</span>
        <div className="flex-1">
          <p className="text-xs font-bold tracking-widest uppercase font-[var(--font-display)] text-[#888]">
            Swap Request
          </p>
          <p className={cn("text-xs font-bold font-[var(--font-display)] tracking-wide", statusConfig.color)}>
            {statusConfig.label}
          </p>
        </div>
        <div className="text-2xl flex-shrink-0">{requestedByEmoji}</div>
      </div>

      {/* Shift info */}
      <div className="px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-[#CCC]">
          <Calendar size={14} className="text-[#555] flex-shrink-0" />
          <span>{shiftDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#CCC]">
          <Clock size={14} className="text-[#555] flex-shrink-0" />
          <span>{shiftStart} – {shiftEnd}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#888]">
          <span>Posted by {requestedByName}</span>
        </div>
        {note && (
          <div className="text-xs text-[#555] italic mt-1">"{note}"</div>
        )}
      </div>

      {/* Volunteer info */}
      {coveredByName && (
        <div className="px-4 pb-3 flex items-center gap-2 text-sm">
          <UserCheck size={14} className="text-[#22C55E]" />
          <span className="text-[#888]">
            {coveredByEmoji} <span className="text-[#F5F5F5]">{coveredByName}</span> volunteered
          </span>
        </div>
      )}

      {/* Actions */}
      {(canCover || canApprove) && (
        <div className="px-4 pb-4 flex gap-2">
          {canCover && (
            <button
              onClick={handleCover}
              disabled={loading}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide font-[var(--font-display)] uppercase transition-all",
                "bg-[#FF6B35] text-white hover:bg-[#FF8555] active:scale-95",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              {loading ? "…" : "💪 I'll Cover It"}
            </button>
          )}
          {canApprove && (
            <button
              onClick={handleApprove}
              disabled={loading}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide font-[var(--font-display)] uppercase transition-all",
                "bg-[#22C55E] text-white hover:bg-[#16A34A] active:scale-95",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              <CheckCheck size={14} className="inline mr-1.5" />
              {loading ? "…" : "Approve Swap"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
