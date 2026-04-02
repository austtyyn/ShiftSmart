"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberWithProfile, TaskUrgency } from "@/lib/supabase/types";

interface TaskFormProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    assigned_to: string | null;
    urgency: TaskUrgency;
    due_at: string | null;
  }) => Promise<void>;
  members: MemberWithProfile[];
  sourceContent?: string;
}

export function TaskForm({ onClose, onSubmit, members, sourceContent }: TaskFormProps) {
  const [title, setTitle] = useState(sourceContent ?? "");
  const [assignedTo, setAssignedTo] = useState("");
  const [urgency, setUrgency] = useState<TaskUrgency>("medium");
  const [dueTime, setDueTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);

    let due_at: string | null = null;
    if (dueTime) {
      const today = new Date();
      const [hours, minutes] = dueTime.split(":").map(Number);
      today.setHours(hours, minutes, 0, 0);
      due_at = today.toISOString();
    }

    await onSubmit({
      title: title.trim(),
      assigned_to: assignedTo || null,
      urgency,
      due_at,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-[#0F0F0F] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1A1A1A]">
          <span className="text-lg">📋</span>
          <h2 className="font-bold text-sm tracking-widest uppercase font-[var(--font-display)] text-[#F5F5F5] flex-1">
            New Task
          </h2>
          <button onClick={onClose} className="p-2 text-[#555] hover:text-[#888]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">
              Task
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              rows={2}
              className="w-full resize-none bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">
                Assign To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
              >
                <option value="">Anyone</option>
                {members.map((m) => (
                  <option key={m.profile.id} value={m.profile.id}>
                    {m.profile.avatar_emoji} {m.profile.name ?? "Unnamed"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as TaskUrgency)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">
              Due Time (Today)
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
            />
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-bold tracking-widest uppercase font-[var(--font-display)] transition-all",
              title.trim()
                ? "bg-[#FF6B35] text-white hover:bg-[#FF8555] active:scale-[0.99]"
                : "bg-[#1A1A1A] text-[#444] border border-[#2A2A2A] cursor-not-allowed",
              submitting && "opacity-60 cursor-not-allowed"
            )}
          >
            {submitting ? "Creating…" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
