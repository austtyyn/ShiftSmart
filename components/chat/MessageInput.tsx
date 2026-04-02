"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Megaphone, AlertOctagon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { MessageUrgency } from "@/lib/supabase/types";

interface MessageInputProps {
  onSend: (content: string, isAnnouncement: boolean, urgency: MessageUrgency) => Promise<void>;
}

const URGENCY_OPTIONS: { value: MessageUrgency; label: string; icon: React.ElementType; color: string; activeColor: string }[] = [
  {
    value: "heads_up",
    label: "Heads Up",
    icon: AlertTriangle,
    color: "text-[#555] hover:text-[#F59E0B]",
    activeColor: "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40",
  },
  {
    value: "911",
    label: "911",
    icon: AlertOctagon,
    color: "text-[#555] hover:text-[#EF4444]",
    activeColor: "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40 animate-pulse",
  },
];

export function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [urgency, setUrgency] = useState<MessageUrgency>("normal");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { membership } = useAuthStore();

  const isManager = membership?.role === "manager" || membership?.role === "owner";

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setContent("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    await onSend(trimmed, isAnnouncement, urgency);
    setIsSending(false);
    if (isAnnouncement) setIsAnnouncement(false);
    if (urgency !== "normal") setUrgency("normal");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const toggleUrgency = (level: MessageUrgency) => {
    setUrgency(urgency === level ? "normal" : level);
    // 911 implies announcement
    if (level === "911" && urgency !== "911") setIsAnnouncement(true);
  };

  const borderColor =
    urgency === "911"
      ? "border-[#EF4444]"
      : urgency === "heads_up"
      ? "border-[#F59E0B]"
      : isAnnouncement
      ? "border-[#F59E0B]/40"
      : "border-[#2A2A2A] focus:border-[#FF6B35]";

  return (
    <div className="border-t border-[#1A1A1A] bg-[#0F0F0F] p-3">
      {/* Mode banners */}
      {urgency === "911" && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg">
          <AlertOctagon size={12} className="text-[#EF4444]" />
          <span className="text-xs text-[#EF4444] font-bold tracking-widest font-[var(--font-display)] uppercase">
            911 Mode — Full-screen alert, bypasses Do Not Disturb
          </span>
          <button onClick={() => setUrgency("normal")} className="ml-auto text-[#EF4444]/60 hover:text-[#EF4444] text-xs">✕</button>
        </div>
      )}
      {urgency === "heads_up" && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg">
          <AlertTriangle size={12} className="text-[#F59E0B]" />
          <span className="text-xs text-[#F59E0B] font-bold tracking-wide font-[var(--font-display)] uppercase">
            Heads Up — Bold banner in chat
          </span>
          <button onClick={() => setUrgency("normal")} className="ml-auto text-[#F59E0B]/60 hover:text-[#F59E0B] text-xs">✕</button>
        </div>
      )}
      {isAnnouncement && urgency === "normal" && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg">
          <Megaphone size={12} className="text-[#F59E0B]" />
          <span className="text-xs text-[#F59E0B] font-bold tracking-wide font-[var(--font-display)] uppercase">
            Announcement mode — all members will be prompted to acknowledge
          </span>
          <button onClick={() => setIsAnnouncement(false)} className="ml-auto text-[#F59E0B]/60 hover:text-[#F59E0B] text-xs">✕</button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Manager tools */}
        {isManager && (
          <div className="flex-shrink-0 flex flex-col gap-1">
            {/* Announcement toggle */}
            <button
              onClick={() => setIsAnnouncement(!isAnnouncement)}
              title="Post as announcement"
              className={cn(
                "h-5 w-9 rounded-md flex items-center justify-center transition-colors border text-[10px]",
                isAnnouncement && urgency === "normal"
                  ? "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40"
                  : "bg-[#1A1A1A] text-[#555] hover:text-[#888] border-[#2A2A2A]"
              )}
            >
              <Megaphone size={10} />
            </button>
            {/* Urgency buttons */}
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleUrgency(opt.value)}
                title={opt.label}
                className={cn(
                  "h-5 w-9 rounded-md flex items-center justify-center transition-colors border text-[10px]",
                  urgency === opt.value
                    ? opt.activeColor
                    : `bg-[#1A1A1A] border-[#2A2A2A] ${opt.color}`
                )}
              >
                <opt.icon size={10} />
              </button>
            ))}
          </div>
        )}

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              urgency === "911"
                ? "Describe the critical issue…"
                : urgency === "heads_up"
                ? "What do they need to know?"
                : isAnnouncement
                ? "Write an announcement…"
                : "Message the team…"
            }
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl bg-[#1A1A1A] border px-4 py-3 text-sm text-[#F5F5F5] placeholder:text-[#444]",
              "focus:outline-none transition-colors",
              borderColor,
              "leading-snug overflow-hidden",
              urgency === "911" && "placeholder:text-[#EF4444]/50"
            )}
            style={{ minHeight: "44px" }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className={cn(
            "flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center transition-all",
            content.trim()
              ? urgency === "911"
                ? "bg-[#EF4444] text-white hover:bg-[#DC2626] active:scale-95"
                : urgency === "heads_up" || isAnnouncement
                ? "bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90 active:scale-95"
                : "bg-[#FF6B35] text-white hover:bg-[#FF8555] active:scale-95"
              : "bg-[#1A1A1A] text-[#333] border border-[#2A2A2A] cursor-not-allowed"
          )}
        >
          <Send size={18} />
        </button>
      </div>

      <p className="mt-1.5 text-center text-[10px] text-[#333]">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
