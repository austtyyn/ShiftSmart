"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ReactionGroup } from "@/lib/supabase/types";

const QUICK_REACTIONS = ["✅", "👀", "🔁", "💪", "❓", "👍", "😂", "🔥"];

interface ReactionBarProps {
  messageId: string;
  reactions: ReactionGroup[];
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => Promise<void>;
}

export function ReactionBar({ messageId, reactions, currentUserId, onReact }: ReactionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const handleReact = async (emoji: string) => {
    setPending(emoji);
    setPickerOpen(false);
    await onReact(messageId, emoji);
    setPending(null);
  };

  const hasReactions = reactions.length > 0;

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      {/* Existing reaction counts */}
      {reactions.map((r) => {
        const isOwn = r.user_ids.includes(currentUserId);
        return (
          <button
            key={r.emoji}
            onClick={() => handleReact(r.emoji)}
            disabled={pending === r.emoji}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all border",
              isOwn
                ? "bg-[#FF6B35]/20 border-[#FF6B35]/40 text-[#FF6B35]"
                : "bg-[#1A1A1A] border-[#2A2A2A] text-[#888] hover:border-[#FF6B35]/40 hover:text-[#F5F5F5]",
              pending === r.emoji && "opacity-50"
            )}
          >
            <span>{r.emoji}</span>
            <span className="font-bold font-[var(--font-display)]">{r.count}</span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full text-sm transition-all border",
            hasReactions
              ? "bg-[#1A1A1A] border-[#2A2A2A] text-[#555] hover:text-[#888]"
              : "bg-transparent border-transparent text-[#444] hover:text-[#888] opacity-0 group-hover:opacity-100"
          )}
          title="Add reaction"
        >
          <span className="text-xs leading-none">+</span>
        </button>

        {pickerOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setPickerOpen(false)}
            />
            <div className="absolute bottom-8 left-0 z-20 flex gap-1 p-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-xl">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="text-lg hover:scale-125 transition-transform p-0.5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
