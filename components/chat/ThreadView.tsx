"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/utils";
import type { MessageWithSender } from "@/lib/supabase/types";

interface ThreadViewProps {
  parentMessage: MessageWithSender;
  currentUserId: string;
  locationId: string;
  onClose: () => void;
  onSendReply: (parentId: string, content: string) => Promise<void>;
}

export function ThreadView({
  parentMessage,
  currentUserId,
  locationId,
  onClose,
  onSendReply,
}: ThreadViewProps) {
  const [replies, setReplies] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReplies();
  }, [parentMessage.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  const fetchReplies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/thread?parent_id=${parentMessage.id}`);
      const data = await res.json();
      setReplies(data.replies ?? []);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setReplyText("");
    await onSendReply(parentMessage.id, trimmed);
    await fetchReplies();
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[#0F0F0F] border-l border-[#1A1A1A] flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1A1A1A] flex-shrink-0">
          <div className="flex-1">
            <h3 className="text-sm font-bold tracking-widest uppercase font-[var(--font-display)] text-[#F5F5F5]">
              Thread
            </h3>
            <p className="text-xs text-[#555]">
              {parentMessage.thread_reply_count ?? 0} repl{parentMessage.thread_reply_count === 1 ? "y" : "ies"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-[#555] hover:text-[#888]">
            <X size={18} />
          </button>
        </div>

        {/* Parent message */}
        <div className="px-4 py-3 border-b border-[#1A1A1A] bg-[#0A0A0A] flex-shrink-0">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-base flex-shrink-0">
              {parentMessage.sender?.avatar_emoji ?? "👤"}
            </div>
            <div>
              <p className="text-xs font-bold text-[#888] font-[var(--font-display)] tracking-wide uppercase">
                {parentMessage.sender?.name ?? "Unknown"}
              </p>
              <p className="text-sm text-[#CCC] mt-0.5">{parentMessage.content}</p>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 rounded-full border-2 border-[#555] border-t-[#FF6B35] animate-spin" />
            </div>
          )}
          {!loading && replies.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[#555]">No replies yet.</p>
              <p className="text-xs text-[#444] mt-1">Be the first to reply.</p>
            </div>
          )}
          {replies.map((reply) => {
            const isOwn = reply.sender_id === currentUserId;
            return (
              <div key={reply.id} className={cn("flex gap-2.5", isOwn && "flex-row-reverse")}>
                <div className="w-7 h-7 rounded-full bg-[#2A2A2A] flex items-center justify-center text-sm flex-shrink-0">
                  {reply.sender?.avatar_emoji ?? "👤"}
                </div>
                <div className={cn("max-w-[80%]", isOwn && "items-end flex flex-col")}>
                  <p className={cn("text-xs font-bold text-[#888] font-[var(--font-display)] tracking-wide mb-0.5", isOwn && "text-right")}>
                    {isOwn ? "You" : (reply.sender?.name ?? "Unknown")}
                  </p>
                  <div className={cn(
                    "px-3 py-2 rounded-2xl text-sm",
                    isOwn
                      ? "bg-[#FF6B35] text-white rounded-tr-sm"
                      : "bg-[#242424] text-[#F5F5F5] rounded-tl-sm"
                  )}>
                    {reply.content}
                  </div>
                  <p className="text-[10px] text-[#444] mt-0.5">{formatMessageTime(reply.created_at)}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Reply input */}
        <div className="px-4 pb-4 pt-3 border-t border-[#1A1A1A] flex-shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Reply in thread…"
              rows={1}
              className="flex-1 resize-none bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35] overflow-hidden"
            />
            <button
              onClick={handleSend}
              disabled={!replyText.trim() || sending}
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                replyText.trim()
                  ? "bg-[#FF6B35] text-white hover:bg-[#FF8555] active:scale-95"
                  : "bg-[#1A1A1A] text-[#333] border border-[#2A2A2A] cursor-not-allowed"
              )}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
