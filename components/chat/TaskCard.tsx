"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskWithProfiles, TaskUrgency } from "@/lib/supabase/types";

interface TaskCardProps {
  task: TaskWithProfiles;
  currentUserId: string;
  isManager: boolean;
  onComplete: (taskId: string) => Promise<void>;
  compact?: boolean;
}

const URGENCY_CONFIG: Record<TaskUrgency, { label: string; color: string; dot: string }> = {
  low: { label: "Low", color: "text-[#555]", dot: "bg-[#555]" },
  medium: { label: "Medium", color: "text-[#F59E0B]", dot: "bg-[#F59E0B]" },
  high: { label: "High", color: "text-[#EF4444]", dot: "bg-[#EF4444]" },
};

export function TaskCard({ task, currentUserId, isManager, onComplete, compact }: TaskCardProps) {
  const [completing, setCompleting] = useState(false);
  const isDone = !!task.completed_at;
  const isAssignedToMe = task.assigned_to === currentUserId;
  const canComplete = isAssignedToMe || isManager;
  const urgency = URGENCY_CONFIG[task.urgency ?? "medium"];

  const handleComplete = async () => {
    if (isDone || !canComplete) return;
    setCompleting(true);
    await onComplete(task.id);
    setCompleting(false);
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
          isDone
            ? "bg-[#1A1A1A]/50 border-[#1A1A1A] opacity-60"
            : "bg-[#1A1A1A] border-[#2A2A2A]"
        )}
      >
        <button
          onClick={handleComplete}
          disabled={isDone || !canComplete || completing}
          className={cn("flex-shrink-0 transition-colors", isDone ? "text-[#22C55E]" : "text-[#555] hover:text-[#22C55E]")}
        >
          {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </button>
        <span className={cn("text-sm flex-1 min-w-0 truncate", isDone && "line-through text-[#555]")}>
          {task.title}
        </span>
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", urgency.dot)} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border overflow-hidden w-full max-w-md",
        isDone ? "border-[#1A1A1A] bg-[#0F0F0F] opacity-75" : "border-[#2A2A2A] bg-[#141414]"
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <button
            onClick={handleComplete}
            disabled={isDone || !canComplete || completing}
            className={cn(
              "flex-shrink-0 mt-0.5 transition-colors",
              isDone ? "text-[#22C55E]" : canComplete ? "text-[#555] hover:text-[#22C55E]" : "text-[#333] cursor-default"
            )}
          >
            {completing ? (
              <div className="w-5 h-5 rounded-full border-2 border-[#22C55E]/30 border-t-[#22C55E] animate-spin" />
            ) : isDone ? (
              <CheckCircle2 size={20} />
            ) : (
              <Circle size={20} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-medium text-[#F5F5F5]", isDone && "line-through text-[#555]")}>
              {task.title}
            </p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* Urgency */}
              <span
                className={cn(
                  "flex items-center gap-1 text-xs font-bold font-[var(--font-display)] tracking-wide uppercase",
                  urgency.color
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", urgency.dot)} />
                {urgency.label}
              </span>

              {/* Assignee */}
              {task.assigned_profile && (
                <span className="text-xs text-[#555]">
                  → {task.assigned_profile.avatar_emoji} {task.assigned_profile.name}
                </span>
              )}

              {/* Due time */}
              {task.due_at && !isDone && (
                <span className="flex items-center gap-1 text-xs text-[#555]">
                  <Clock size={10} />
                  {new Date(task.due_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </span>
              )}

              {isDone && (
                <span className="text-xs text-[#22C55E] font-bold font-[var(--font-display)] uppercase tracking-wide">
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// My Tasks Widget
interface MyTasksWidgetProps {
  tasks: TaskWithProfiles[];
  currentUserId: string;
  isManager: boolean;
  onComplete: (taskId: string) => Promise<void>;
}

export function MyTasksWidget({ tasks, currentUserId, isManager, onComplete }: MyTasksWidgetProps) {
  const myTasks = tasks.filter((t) => t.assigned_to === currentUserId && !t.completed_at);

  if (myTasks.length === 0) return null;

  return (
    <div className="px-4 py-3 border-b border-[#1A1A1A] bg-[#0A0A0A]">
      <p className="text-xs font-bold tracking-widest uppercase font-[var(--font-display)] text-[#555] mb-2">
        My Tasks ({myTasks.length})
      </p>
      <div className="space-y-1.5">
        {myTasks.slice(0, 3).map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            currentUserId={currentUserId}
            isManager={isManager}
            onComplete={onComplete}
            compact
          />
        ))}
        {myTasks.length > 3 && (
          <p className="text-xs text-[#555] pl-1">+{myTasks.length - 3} more</p>
        )}
      </div>
    </div>
  );
}
