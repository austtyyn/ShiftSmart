"use client";

import { useCallback, useState, useEffect } from "react";
import { MessageFeed } from "@/components/chat/MessageFeed";
import { MessageInput } from "@/components/chat/MessageInput";
import { WhoIsWorking } from "@/components/chat/WhoIsWorking";
import { HandoffForm } from "@/components/chat/HandoffForm";
import { TaskForm } from "@/components/chat/TaskForm";
import { SwapRequestForm } from "@/components/chat/SwapRequestForm";
import { QuickReplyForm } from "@/components/chat/QuickReplyForm";
import { QuickActions } from "@/components/chat/QuickActions";
import { MyTasksWidget } from "@/components/chat/TaskCard";
import { useMessages } from "@/hooks/useMessages";
import { useMembers } from "@/hooks/useMembers";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { createClient } from "@/lib/supabase/client";
import type { MessageUrgency, TaskWithProfiles, ShiftWithProfile, QuickReplyOption, Json } from "@/lib/supabase/types";
import { useScheduleStore } from "@/stores/scheduleStore";
import { useShifts } from "@/hooks/useShifts";

export default function ChatPage() {
  const supabase = createClient();
  const { profile, membership, location } = useAuthStore();
  const { appendMessage, updateMessage } = useChatStore();
  const { fetchMessages } = useMessages();
  const { members } = useMembers();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modal states
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskSourceContent, setTaskSourceContent] = useState<string | undefined>(undefined);
  const [swapFormOpen, setSwapFormOpen] = useState(false);
  const [quickReplyFormOpen, setQuickReplyFormOpen] = useState(false);

  // Tasks for My Tasks widget
  const [myTasks, setMyTasks] = useState<TaskWithProfiles[]>([]);

  // Shifts for swap requests
  const { shifts } = useScheduleStore();
  useShifts();

  const isManager = membership?.role === "manager" || membership?.role === "owner";

  useEffect(() => {
    if (!profile?.id || !membership?.location_id) return;
    fetch(`/api/tasks?location_id=${membership.location_id}&assigned_to=${profile.id}`)
      .then((r) => r.json())
      .then((data) => setMyTasks(data.tasks ?? []));
  }, [profile?.id, membership?.location_id]);

  const handleLoadMore = useCallback(async () => {
    const { messages } = useChatStore.getState();
    if (messages.length === 0) return;
    const oldest = messages[0];
    await fetchMessages(oldest.created_at);
  }, [fetchMessages]);

  const handleSend = async (content: string, isAnnouncement: boolean, urgency: MessageUrgency) => {
    if (!membership?.location_id || !profile) return;

    const tempId = `temp-${Date.now()}`;

    appendMessage({
      id: tempId,
      tempId,
      location_id: membership.location_id,
      sender_id: profile.id,
      content,
      is_announcement: isAnnouncement,
      urgency,
      message_type: "message",
      thread_parent_id: null,
      thread_reply_count: 0,
      metadata: null,
      created_at: new Date().toISOString(),
      sender: profile,
      acknowledgements: [],
      reactions: [],
      status: "sending",
    });

    const { data, error } = await supabase
      .from("messages")
      .insert({
        location_id: membership.location_id,
        sender_id: profile.id,
        content,
        is_announcement: isAnnouncement,
        urgency,
        message_type: "message",
      })
      .select(`*, sender:profiles(*), acknowledgements(id, user_id, acknowledged_at)`)
      .single();

    if (error) {
      updateMessage(tempId, { status: "failed" });
    } else if (data) {
      updateMessage(tempId, { ...(data as object), status: undefined, reactions: [] } as Parameters<typeof updateMessage>[1]);
    }
  };

  const handleAcknowledge = async (messageId: string) => {
    if (!profile) return;
    await supabase.from("acknowledgements").insert({
      message_id: messageId,
      user_id: profile.id,
    });
    updateMessage(messageId, {
      acknowledgements: [
        ...(useChatStore.getState().messages.find((m) => m.id === messageId)?.acknowledgements ?? []),
        {
          id: crypto.randomUUID(),
          message_id: messageId,
          user_id: profile.id,
          acknowledged_at: new Date().toISOString(),
        },
      ],
    });
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!profile) return;
    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_id: messageId, emoji }),
    });
    const data = await res.json();

    // Update optimistically
    const currentMsg = useChatStore.getState().messages.find((m) => m.id === messageId);
    if (!currentMsg) return;
    const currentReactions = [...(currentMsg.reactions ?? [])];
    const existing = currentReactions.find((r) => r.emoji === emoji);

    if (data.action === "removed") {
      if (existing) {
        const newUids = existing.user_ids.filter((id) => id !== profile.id);
        if (newUids.length === 0) {
          updateMessage(messageId, { reactions: currentReactions.filter((r) => r.emoji !== emoji) });
        } else {
          updateMessage(messageId, {
            reactions: currentReactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count - 1, user_ids: newUids } : r
            ),
          });
        }
      }
    } else {
      if (existing) {
        updateMessage(messageId, {
          reactions: currentReactions.map((r) =>
            r.emoji === emoji
              ? { ...r, count: r.count + 1, user_ids: [...r.user_ids, profile.id] }
              : r
          ),
        });
      } else {
        updateMessage(messageId, {
          reactions: [...currentReactions, { emoji, count: 1, user_ids: [profile.id] }],
        });
      }
    }
  };

  const handleAcceptHandoff = async (handoffId: string) => {
    await fetch(`/api/handoffs/${handoffId}/accept`, { method: "POST" });
  };

  const handleHandoffSubmit = async (data: {
    incoming_user_id: string | null;
    shift_label: string;
    notes: { type: "warning" | "check" | "info"; text: string }[];
    crew_tonight: string[];
    tasks_carried_over: number;
  }) => {
    if (!membership?.location_id || !profile) return;
    const res = await fetch("/api/handoffs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location_id: membership.location_id, ...data }),
    });
    const json = await res.json();
    if (json.message) {
      // Add to chat feed
      appendMessage({
        ...json.message,
        sender: profile,
        acknowledgements: [],
        reactions: [],
        metadata: {
          handoff_id: json.handoff.id,
          outgoing_name: profile.name,
          incoming_name: members.find((m) => m.profile.id === data.incoming_user_id)?.profile.name ?? null,
          incoming_user_id: data.incoming_user_id,
          shift_label: data.shift_label,
          notes: data.notes,
          crew_tonight: data.crew_tonight,
          tasks_carried_over: data.tasks_carried_over,
          accepted_at: null,
        },
      });
    }
    setHandoffOpen(false);
  };

  const handleTaskSubmit = async (taskData: {
    title: string;
    assigned_to: string | null;
    urgency: "low" | "medium" | "high";
    due_at: string | null;
  }) => {
    if (!membership?.location_id) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location_id: membership.location_id, ...taskData }),
    });
    const json = await res.json();
    if (json.task) {
      setMyTasks((prev) => [json.task, ...prev]);
    }
    setTaskFormOpen(false);
    setTaskSourceContent(undefined);
  };

  const handleCompleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complete: true }),
    });
    setMyTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed_at: new Date().toISOString() } : t))
    );
  };

  const handleSwapSubmit = async (data: { shift_id: string; note: string }) => {
    if (!membership?.location_id) return;
    await fetch("/api/swap-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location_id: membership.location_id, ...data }),
    });
    setSwapFormOpen(false);
    // Reload messages to show the card
    await fetchMessages();
  };

  const handleCoverSwap = async (swapId: string) => {
    await fetch(`/api/swap-requests/${swapId}/cover`, { method: "POST" });
  };

  const handleApproveSwap = async (swapId: string) => {
    await fetch(`/api/swap-requests/${swapId}/approve`, { method: "POST" });
  };

  const handleQuickReplySubmit = async (data: {
    question: string;
    options: QuickReplyOption[];
  }) => {
    if (!membership?.location_id || !profile) return;
    const metadata = { question: data.question, options: data.options, responses: [] } as unknown as Json;
    const tempId = `temp-${Date.now()}`;
    appendMessage({
      id: tempId,
      tempId,
      location_id: membership.location_id,
      sender_id: profile.id,
      content: data.question,
      is_announcement: false,
      urgency: "normal",
      message_type: "quick_reply",
      thread_parent_id: null,
      thread_reply_count: 0,
      metadata,
      created_at: new Date().toISOString(),
      sender: profile,
      acknowledgements: [],
      reactions: [],
      status: "sending",
    });

    const { data: msg, error } = await supabase
      .from("messages")
      .insert({
        location_id: membership.location_id,
        sender_id: profile.id,
        content: data.question,
        message_type: "quick_reply",
        metadata,
      })
      .select(`*, sender:profiles(*)`)
      .single();

    if (error) {
      updateMessage(tempId, { status: "failed" });
    } else {
      updateMessage(tempId, { ...(msg as object), status: undefined, reactions: [] } as Parameters<typeof updateMessage>[1]);
    }
    setQuickReplyFormOpen(false);
  };

  const handleQuickReplyRespond = async (messageId: string, optionId: string) => {
    if (!profile) return;
    const msg = useChatStore.getState().messages.find((m) => m.id === messageId);
    if (!msg?.metadata) return;

    const meta = msg.metadata as unknown as { question?: string; options: QuickReplyOption[]; responses: { user_id: string; option_id: string; name: string }[] };
    const newResponse = { user_id: profile.id, option_id: optionId, name: profile.name ?? "" };
    const updatedMeta = {
      ...meta,
      responses: [...(meta.responses ?? []).filter((r) => r.user_id !== profile.id), newResponse],
    };

    updateMessage(messageId, { metadata: updatedMeta as unknown as Json });

    await supabase.from("messages").update({ metadata: updatedMeta as unknown as Json }).eq("id", messageId);
  };

  const handleSendThreadReply = async (parentId: string, content: string) => {
    if (!membership?.location_id || !profile) return;
    await fetch("/api/messages/thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parent_id: parentId, content, location_id: membership.location_id }),
    });
    updateMessage(parentId, {
      thread_reply_count: (useChatStore.getState().messages.find((m) => m.id === parentId)?.thread_reply_count ?? 0) + 1,
    });
  };

  const myUpcomingShifts = shifts.filter(
    (s) => s.user_id === profile?.id && new Date(s.start_time) > new Date()
  ) as ShiftWithProfile[];

  return (
    <div className="h-full flex">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex-shrink-0 h-12 border-b border-[#1A1A1A] flex items-center px-4 gap-3">
          <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <h1 className="font-bold text-sm tracking-widest uppercase font-[var(--font-display)] text-[#F5F5F5]">
            {location?.name ?? "Team Channel"}
          </h1>
          <span className="text-xs text-[#444]">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </span>

          {/* Mobile: Who's working chip */}
          <div className="ml-auto lg:hidden">
            <WhoIsWorking
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
        </div>

        {/* My Tasks widget */}
        <MyTasksWidget
          tasks={myTasks}
          currentUserId={profile?.id ?? ""}
          isManager={isManager}
          onComplete={handleCompleteTask}
        />

        {/* Messages */}
        <MessageFeed
          onLoadMore={handleLoadMore}
          onAcknowledge={handleAcknowledge}
          onReact={handleReact}
          onAcceptHandoff={handleAcceptHandoff}
          onCoverSwap={handleCoverSwap}
          onApproveSwap={handleApproveSwap}
          onQuickReplyRespond={handleQuickReplyRespond}
          onSendThreadReply={handleSendThreadReply}
          onMakeTask={(content) => {
            setTaskSourceContent(content);
            setTaskFormOpen(true);
          }}
          totalMembers={members.length}
        />

        {/* Input + Quick Actions */}
        <div className="relative">
          {/* Floating Quick Actions above input */}
          <div className="absolute right-4 bottom-full mb-2 z-30">
            <QuickActions
              isManager={isManager}
              onNewTask={() => setTaskFormOpen(true)}
              onSwapRequest={() => setSwapFormOpen(true)}
              on911={() => {
                // Focus input with 911 mode — handled inside MessageInput
              }}
              onHandoff={() => setHandoffOpen(true)}
              onQuickReply={() => setQuickReplyFormOpen(true)}
            />
          </div>
          <MessageInput onSend={handleSend} />
        </div>
      </div>

      {/* Desktop: Who's Working sidebar */}
      <div className="hidden lg:flex">
        <WhoIsWorking />
      </div>

      {/* Modals */}
      {handoffOpen && (
        <HandoffForm
          onClose={() => setHandoffOpen(false)}
          onSubmit={handleHandoffSubmit}
          members={members}
          currentUserId={profile?.id ?? ""}
        />
      )}

      {taskFormOpen && (
        <TaskForm
          onClose={() => { setTaskFormOpen(false); setTaskSourceContent(undefined); }}
          onSubmit={handleTaskSubmit}
          members={members}
          sourceContent={taskSourceContent}
        />
      )}

      {swapFormOpen && (
        <SwapRequestForm
          onClose={() => setSwapFormOpen(false)}
          onSubmit={handleSwapSubmit}
          myShifts={myUpcomingShifts}
        />
      )}

      {quickReplyFormOpen && (
        <QuickReplyForm
          onClose={() => setQuickReplyFormOpen(false)}
          onSubmit={handleQuickReplySubmit}
        />
      )}
    </div>
  );
}
