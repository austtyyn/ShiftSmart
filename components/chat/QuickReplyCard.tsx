"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { QuickReplyMetadata, QuickReplyOption } from "@/lib/supabase/types";

interface QuickReplyCardProps {
  messageId: string;
  senderName: string;
  question: string;
  metadata: QuickReplyMetadata;
  currentUserId: string;
  onRespond: (messageId: string, optionId: string) => Promise<void>;
}

export function QuickReplyCard({
  messageId,
  senderName,
  question,
  metadata,
  currentUserId,
  onRespond,
}: QuickReplyCardProps) {
  const [pending, setPending] = useState<string | null>(null);

  const myResponse = metadata.responses?.find((r) => r.user_id === currentUserId);
  const responseCounts: Record<string, number> = {};
  for (const r of metadata.responses ?? []) {
    responseCounts[r.option_id] = (responseCounts[r.option_id] ?? 0) + 1;
  }
  const totalResponses = metadata.responses?.length ?? 0;

  const handleRespond = async (optionId: string) => {
    if (myResponse) return;
    setPending(optionId);
    await onRespond(messageId, optionId);
    setPending(null);
  };

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414] overflow-hidden w-full max-w-md">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1A1A1A]">
        <p className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] mb-0.5">
          {senderName} asked
        </p>
        <p className="text-sm text-[#F5F5F5] font-medium">{question}</p>
      </div>

      {/* Options */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {metadata.options?.map((option: QuickReplyOption) => {
          const isSelected = myResponse?.option_id === option.id;
          const count = responseCounts[option.id] ?? 0;
          const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;

          return (
            <button
              key={option.id}
              onClick={() => handleRespond(option.id)}
              disabled={!!myResponse || pending === option.id}
              className={cn(
                "relative w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all overflow-hidden border",
                isSelected
                  ? "border-[#FF6B35]/50 bg-[#FF6B35]/15 text-[#FF6B35]"
                  : myResponse
                  ? "border-[#2A2A2A] bg-[#1A1A1A] text-[#555] cursor-default"
                  : "border-[#2A2A2A] bg-[#1A1A1A] text-[#CCC] hover:border-[#FF6B35]/40 hover:bg-[#FF6B35]/10 active:scale-[0.98]",
                pending === option.id && "opacity-60"
              )}
            >
              {/* Progress bar */}
              {myResponse && count > 0 && (
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-xl transition-all duration-500",
                    isSelected ? "bg-[#FF6B35]/20" : "bg-[#2A2A2A]"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <span>{option.emoji}</span>
                <span>{option.label}</span>
                {myResponse && count > 0 && (
                  <span className="ml-auto text-xs text-[#555] font-bold font-[var(--font-display)]">
                    {count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      {totalResponses > 0 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-[#555]">
            {totalResponses} response{totalResponses !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
