"use client";

import { useState } from "react";
import { Megaphone, CheckCircle2, Users } from "lucide-react";
import { formatMessageTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { MessageWithSender, Acknowledgement } from "@/lib/supabase/types";

interface AnnouncementBubbleProps {
  message: MessageWithSender;
  currentUserId: string;
  totalMembers?: number;
  onAcknowledge?: (messageId: string) => Promise<void>;
  isManager?: boolean;
}

export function AnnouncementBubble({
  message,
  currentUserId,
  totalMembers,
  onAcknowledge,
  isManager,
}: AnnouncementBubbleProps) {
  const [acknowledging, setAcknowledging] = useState(false);

  const acks = message.acknowledgements ?? [];
  const hasAcked = acks.some((a: Acknowledgement) => a.user_id === currentUserId);
  const ackCount = acks.length;

  const handleAck = async () => {
    if (!onAcknowledge || hasAcked) return;
    setAcknowledging(true);
    await onAcknowledge(message.id);
    setAcknowledging(false);
  };

  return (
    <div className="w-full px-4 py-1">
      <div className="bg-[#F59E0B]/8 border border-[#F59E0B]/25 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-[#F59E0B]/15">
          <Megaphone size={14} className="text-[#F59E0B]" />
          <span className="text-xs font-bold tracking-widest uppercase text-[#F59E0B] font-[var(--font-display)]">
            Announcement
          </span>
          <span className="ml-auto text-[10px] text-[#555]">
            {formatMessageTime(message.created_at)}
          </span>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <p className="text-sm text-[#F5F5F5] leading-relaxed">{message.content}</p>
          <p className="mt-2 text-xs text-[#555]">
            — {message.sender?.name ?? "Former Team Member"}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 pb-3">
          {hasAcked ? (
            <div className="flex items-center gap-1.5 text-xs text-[#22C55E]">
              <CheckCircle2 size={14} />
              <span className="font-bold font-[var(--font-display)] tracking-wide uppercase">
                Acknowledged
              </span>
            </div>
          ) : (
            <Button
              size="sm"
              variant="warning"
              onClick={handleAck}
              disabled={acknowledging}
            >
              <CheckCircle2 size={12} />
              {acknowledging ? "Acknowledging…" : "Acknowledge"}
            </Button>
          )}

          {isManager && totalMembers !== undefined && (
            <div className="ml-auto flex items-center gap-1.5 text-xs text-[#555]">
              <Users size={12} />
              <span>
                {ackCount}/{totalMembers} confirmed
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
