"use client";

import { useState } from "react";
import { Megaphone, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { formatMessageTime } from "@/lib/utils";
import { AckProgress } from "./AckProgress";
import { Button } from "@/components/ui/button";
import type { MessageWithSender, Acknowledgement } from "@/lib/supabase/types";

interface AnnouncementCardProps {
  announcement: MessageWithSender;
  currentUserId: string;
  totalMembers?: number;
  isManager?: boolean;
  onAcknowledge: (id: string) => Promise<void>;
}

export function AnnouncementCard({
  announcement,
  currentUserId,
  totalMembers = 0,
  isManager,
  onAcknowledge,
}: AnnouncementCardProps) {
  const [acknowledging, setAcknowledging] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const acks = announcement.acknowledgements ?? [];
  const hasAcked = acks.some((a: Acknowledgement) => a.user_id === currentUserId);

  const handleAck = async () => {
    if (hasAcked) return;
    setAcknowledging(true);
    await onAcknowledge(announcement.id);
    setAcknowledging(false);
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden">
      {/* Amber top strip */}
      <div className="h-1 bg-gradient-to-r from-[#F59E0B] to-[#F59E0B]/40" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
              <Megaphone size={14} className="text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#F59E0B] font-[var(--font-display)]">
                Announcement
              </p>
              <p className="text-xs text-[#555]">
                {announcement.sender?.name ?? "Former Team Member"} ·{" "}
                {formatMessageTime(announcement.created_at)}
              </p>
            </div>
          </div>

          {hasAcked && (
            <div className="flex items-center gap-1 text-xs text-[#22C55E]">
              <CheckCircle2 size={14} />
              <span className="font-bold font-[var(--font-display)] tracking-wide hidden sm:block">
                Acknowledged
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-[#F5F5F5] leading-relaxed mb-4">
          {announcement.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!hasAcked && (
            <Button
              size="sm"
              variant="warning"
              onClick={handleAck}
              disabled={acknowledging}
            >
              <CheckCircle2 size={12} />
              {acknowledging ? "Confirming…" : "Acknowledge"}
            </Button>
          )}

          {isManager && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-auto flex items-center gap-1.5 text-xs text-[#555] hover:text-[#888] transition-colors"
            >
              View responses
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        {/* Expanded ack status */}
        {isManager && expanded && (
          <div className="mt-4 pt-4 border-t border-[#2A2A2A] space-y-3">
            <AckProgress acknowledged={acks.length} total={totalMembers} />
            <div className="space-y-1">
              {acks.map((ack: Acknowledgement) => (
                <div key={ack.id} className="flex items-center gap-2 text-xs text-[#888]">
                  <CheckCircle2 size={12} className="text-[#22C55E]" />
                  <span>{formatMessageTime(ack.acknowledged_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
