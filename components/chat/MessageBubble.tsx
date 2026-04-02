"use client";

import { useState } from "react";
import { formatMessageTime } from "@/lib/utils";
import type { MessageWithSender } from "@/lib/supabase/types";
import { AlertCircle, RotateCcw, MessageSquare, ClipboardList } from "lucide-react";
import { ReactionBar } from "./ReactionBar";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: MessageWithSender & { status?: "sending" | "failed"; tempId?: string };
  isOwn: boolean;
  currentUserId: string;
  onRetry?: () => void;
  onReact: (messageId: string, emoji: string) => Promise<void>;
  onReply?: (message: MessageWithSender) => void;
  onMakeTask?: (content: string) => void;
}

const URGENCY_STYLES = {
  normal: { bubble: "", banner: null },
  heads_up: {
    bubble: "ring-1 ring-[#F59E0B]/40",
    banner: "bg-[#F59E0B]/10 border-b border-[#F59E0B]/20 px-4 py-1 flex items-center gap-1.5",
  },
  "911": {
    bubble: "ring-2 ring-[#EF4444]/60 shadow-[0_0_16px_rgba(239,68,68,0.2)]",
    banner: "bg-[#EF4444]/15 border-b border-[#EF4444]/30 px-4 py-1.5 flex items-center gap-1.5",
  },
};

export function MessageBubble({
  message,
  isOwn,
  currentUserId,
  onRetry,
  onReact,
  onReply,
  onMakeTask,
}: MessageBubbleProps) {
  const [hovered, setHovered] = useState(false);
  const senderName = message.sender?.name ?? "Former Team Member";
  const senderEmoji = message.sender?.avatar_emoji ?? "👤";
  const isFormer = !message.sender;
  const urgency = message.urgency ?? "normal";
  const urgencyStyle = URGENCY_STYLES[urgency] ?? URGENCY_STYLES.normal;

  return (
    <div
      className={`flex gap-3 group relative ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center text-lg select-none self-start mt-0.5">
        {senderEmoji}
      </div>

      <div className={cn("flex flex-col max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        {/* Sender name + time */}
        <div className={cn("flex items-baseline gap-2 mb-1", isOwn ? "flex-row-reverse" : "flex-row")}>
          <span
            className={`text-xs font-bold tracking-wide font-[var(--font-display)] uppercase ${
              isFormer ? "text-[#555]" : isOwn ? "text-[#FF6B35]" : "text-[#888]"
            }`}
          >
            {isOwn ? "You" : senderName}
            {isFormer && " (Former)"}
          </span>
          <span className="text-[10px] text-[#555] opacity-0 group-hover:opacity-100 transition-opacity">
            {formatMessageTime(message.created_at)}
          </span>
          {urgency === "heads_up" && (
            <span className="text-[10px] font-bold text-[#F59E0B] font-[var(--font-display)] tracking-widest uppercase">
              Heads Up
            </span>
          )}
          {urgency === "911" && (
            <span className="text-[10px] font-bold text-[#EF4444] font-[var(--font-display)] tracking-widest uppercase animate-pulse">
              🚨 911
            </span>
          )}
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            "relative rounded-2xl text-sm leading-relaxed overflow-hidden",
            isOwn
              ? "bg-[#FF6B35] text-white rounded-tr-sm"
              : "bg-[#242424] text-[#F5F5F5] rounded-tl-sm",
            message.status === "sending" && "opacity-60",
            message.status === "failed" && "!border !border-[#EF4444]/50 !bg-[#EF4444]/10 !text-[#EF4444]",
            urgencyStyle.bubble
          )}
        >
          {/* 911 / Heads Up banner */}
          {urgency === "911" && urgencyStyle.banner && (
            <div className={urgencyStyle.banner}>
              <span className="text-xs">🚨</span>
              <span className="text-xs font-bold text-[#EF4444] font-[var(--font-display)] tracking-widest uppercase">
                911 — Critical Alert
              </span>
            </div>
          )}
          {urgency === "heads_up" && urgencyStyle.banner && (
            <div className={urgencyStyle.banner}>
              <span className="text-xs">⚠️</span>
              <span className="text-xs font-bold text-[#F59E0B] font-[var(--font-display)] tracking-widest uppercase">
                Heads Up
              </span>
            </div>
          )}

          <div className="px-4 py-2.5">
            {message.content}

            {message.status === "failed" && (
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-[#EF4444]/30">
                <AlertCircle size={12} />
                <span className="text-xs">Failed to send</span>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="ml-auto flex items-center gap-1 text-xs hover:text-white transition-colors"
                  >
                    <RotateCcw size={10} />
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        {message.status === "sending" && (
          <span className="text-[10px] text-[#555] mt-0.5">Sending…</span>
        )}

        {/* Thread reply count */}
        {(message.thread_reply_count ?? 0) > 0 && (
          <button
            onClick={() => onReply?.(message)}
            className="mt-1 flex items-center gap-1.5 text-xs text-[#60A5FA] hover:text-[#93C5FD] transition-colors"
          >
            <MessageSquare size={11} />
            {message.thread_reply_count} repl{message.thread_reply_count === 1 ? "y" : "ies"}
          </button>
        )}

        {/* Reactions */}
        {(message.reactions?.length ?? 0) > 0 && (
          <ReactionBar
            messageId={message.id}
            reactions={message.reactions ?? []}
            currentUserId={currentUserId}
            onReact={onReact}
          />
        )}
      </div>

      {/* Hover action toolbar */}
      {hovered && message.status !== "sending" && message.status !== "failed" && (
        <div
          className={cn(
            "absolute top-0 flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity",
            isOwn ? "left-12" : "right-12"
          )}
        >
          {/* React */}
          <ReactionBar
            messageId={message.id}
            reactions={message.reactions ?? []}
            currentUserId={currentUserId}
            onReact={onReact}
          />

          {/* Reply in thread */}
          {onReply && (
            <button
              onClick={() => onReply(message)}
              className="p-1.5 text-[#555] hover:text-[#F5F5F5] transition-colors"
              title="Reply in thread"
            >
              <MessageSquare size={14} />
            </button>
          )}

          {/* Make task */}
          {onMakeTask && (
            <button
              onClick={() => onMakeTask(message.content)}
              className="p-1.5 text-[#555] hover:text-[#F5F5F5] transition-colors"
              title="Create task from message"
            >
              <ClipboardList size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
