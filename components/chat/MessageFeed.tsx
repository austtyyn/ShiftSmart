"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { MessageBubble } from "./MessageBubble";
import { AnnouncementBubble } from "./AnnouncementBubble";
import { HandoffCard } from "./HandoffCard";
import { SwapRequestCard } from "./SwapRequestCard";
import { QuickReplyCard } from "./QuickReplyCard";
import { ThreadView } from "./ThreadView";
import { Loader2 } from "lucide-react";
import type { MessageWithSender, HandoffNote, QuickReplyMetadata, SwapStatus } from "@/lib/supabase/types";

interface MessageFeedProps {
  onLoadMore: () => void;
  onAcknowledge: (messageId: string) => Promise<void>;
  onReact: (messageId: string, emoji: string) => Promise<void>;
  onAcceptHandoff: (handoffId: string) => Promise<void>;
  onCoverSwap: (swapId: string) => Promise<void>;
  onApproveSwap: (swapId: string) => Promise<void>;
  onQuickReplyRespond: (messageId: string, optionId: string) => Promise<void>;
  onSendThreadReply: (parentId: string, content: string) => Promise<void>;
  onMakeTask: (content: string) => void;
  totalMembers?: number;
}

export function MessageFeed({
  onLoadMore,
  onAcknowledge,
  onReact,
  onAcceptHandoff,
  onCoverSwap,
  onApproveSwap,
  onQuickReplyRespond,
  onSendThreadReply,
  onMakeTask,
  totalMembers,
}: MessageFeedProps) {
  const { messages, hasMore, isLoading } = useChatStore();
  const { profile, membership } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const [threadMessage, setThreadMessage] = useState<MessageWithSender | null>(null);

  useEffect(() => {
    if (messages.length > 0 && isFirstLoad.current) {
      bottomRef.current?.scrollIntoView();
      isFirstLoad.current = false;
    }
  }, [messages.length]);

  useEffect(() => {
    if (!containerRef.current || isFirstLoad.current) return;
    const container = containerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !hasMore || isLoading) return;
    if (containerRef.current.scrollTop < 100) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  const isManager = membership?.role === "manager" || membership?.role === "owner";

  const renderMessage = (message: MessageWithSender & { status?: "sending" | "failed"; tempId?: string }) => {
    const key = message.id ?? message.tempId;

    // Handoff card
    if (message.message_type === "handoff" && message.metadata) {
      const meta = message.metadata as {
        handoff_id?: string;
        outgoing_name?: string;
        incoming_name?: string;
        incoming_user_id?: string;
        shift_label?: string;
        notes?: HandoffNote[];
        crew_tonight?: string[];
        tasks_carried_over?: number;
        accepted_at?: string;
      };
      return (
        <div key={key} className="px-4 py-2">
          <HandoffCard
            handoffId={meta.handoff_id ?? message.id}
            outgoingName={meta.outgoing_name ?? message.sender?.name ?? "Outgoing"}
            incomingName={meta.incoming_name ?? null}
            shiftLabel={meta.shift_label ?? null}
            notes={meta.notes ?? []}
            tasksCarriedOver={meta.tasks_carried_over ?? 0}
            crewTonight={meta.crew_tonight ?? []}
            acceptedAt={meta.accepted_at ?? null}
            currentUserId={profile?.id ?? ""}
            incomingUserId={meta.incoming_user_id ?? null}
            onAccept={onAcceptHandoff}
          />
        </div>
      );
    }

    // Swap request card
    if (message.message_type === "swap_request" && message.metadata) {
      const meta = message.metadata as {
        swap_id?: string;
        requested_by_name?: string;
        requested_by_emoji?: string;
        requested_by_id?: string;
        covered_by_name?: string;
        covered_by_emoji?: string;
        covered_by_id?: string;
        shift_date?: string;
        shift_start?: string;
        shift_end?: string;
        status?: SwapStatus;
        note?: string;
      };
      return (
        <div key={key} className="px-4 py-2">
          <SwapRequestCard
            swapId={meta.swap_id ?? message.id}
            requestedByName={meta.requested_by_name ?? message.sender?.name ?? "Someone"}
            requestedByEmoji={meta.requested_by_emoji ?? message.sender?.avatar_emoji ?? "👤"}
            coveredByName={meta.covered_by_name ?? null}
            coveredByEmoji={meta.covered_by_emoji ?? null}
            shiftDate={meta.shift_date ?? ""}
            shiftStart={meta.shift_start ?? ""}
            shiftEnd={meta.shift_end ?? ""}
            status={meta.status ?? "open"}
            note={meta.note ?? message.content ?? null}
            currentUserId={profile?.id ?? ""}
            requestedById={meta.requested_by_id ?? message.sender_id}
            coveredById={meta.covered_by_id ?? null}
            isManager={isManager}
            onCover={onCoverSwap}
            onApprove={onApproveSwap}
          />
        </div>
      );
    }

    // Quick reply card
    if (message.message_type === "quick_reply" && message.metadata) {
      const meta = message.metadata as QuickReplyMetadata & { question?: string };
      return (
        <div key={key} className="px-4 py-2">
          <QuickReplyCard
            messageId={message.id}
            senderName={message.sender?.name ?? "Manager"}
            question={meta.question ?? message.content}
            metadata={{ options: meta.options ?? [], responses: meta.responses ?? [] }}
            currentUserId={profile?.id ?? ""}
            onRespond={onQuickReplyRespond}
          />
        </div>
      );
    }

    // Announcement
    if (message.is_announcement) {
      return (
        <AnnouncementBubble
          key={key}
          message={message}
          currentUserId={profile?.id ?? ""}
          totalMembers={totalMembers}
          onAcknowledge={onAcknowledge}
          isManager={isManager}
        />
      );
    }

    // Normal message
    return (
      <div key={key} className="py-0.5">
        <MessageBubble
          message={message}
          isOwn={message.sender_id === profile?.id}
          currentUserId={profile?.id ?? ""}
          onReact={onReact}
          onReply={(msg) => setThreadMessage(msg)}
          onMakeTask={onMakeTask}
        />
      </div>
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {/* Load more indicator */}
        <div ref={topRef} className="flex justify-center py-2">
          {isLoading && (
            <Loader2 size={16} className="text-[#555] animate-spin" />
          )}
          {!hasMore && messages.length > 0 && (
            <span className="text-xs text-[#444] font-[var(--font-display)] tracking-wider uppercase">
              Beginning of channel history
            </span>
          )}
        </div>

        {/* Messages */}
        {messages.map((message) => renderMessage(message))}

        <div ref={bottomRef} />
      </div>

      {/* Thread slideout */}
      {threadMessage && (
        <ThreadView
          parentMessage={threadMessage}
          currentUserId={profile?.id ?? ""}
          locationId={membership?.location_id ?? ""}
          onClose={() => setThreadMessage(null)}
          onSendReply={onSendThreadReply}
        />
      )}
    </>
  );
}
