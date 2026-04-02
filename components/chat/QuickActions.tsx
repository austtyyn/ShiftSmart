"use client";

import { useState } from "react";
import { Plus, X, ClipboardList, RefreshCw, AlertOctagon, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  isManager: boolean;
  onNewTask: () => void;
  onSwapRequest: () => void;
  on911: () => void;
  onHandoff: () => void;
  onQuickReply: () => void;
}

const ACTIONS = [
  {
    id: "task",
    label: "New Task",
    icon: ClipboardList,
    color: "bg-[#60A5FA] hover:bg-[#3B82F6]",
    managerOnly: false,
  },
  {
    id: "swap",
    label: "Swap Request",
    icon: ArrowLeftRight,
    color: "bg-[#A78BFA] hover:bg-[#7C3AED]",
    managerOnly: false,
  },
  {
    id: "911",
    label: "911 Alert",
    icon: AlertOctagon,
    color: "bg-[#EF4444] hover:bg-[#DC2626]",
    managerOnly: true,
  },
  {
    id: "handoff",
    label: "Handoff",
    icon: RefreshCw,
    color: "bg-[#22C55E] hover:bg-[#16A34A]",
    managerOnly: true,
  },
  {
    id: "quickreply",
    label: "Quick Reply",
    icon: ClipboardList,
    color: "bg-[#F59E0B] hover:bg-[#D97706]",
    managerOnly: true,
  },
];

export function QuickActions({
  isManager,
  onNewTask,
  onSwapRequest,
  on911,
  onHandoff,
  onQuickReply,
}: QuickActionsProps) {
  const [open, setOpen] = useState(false);

  const handlers: Record<string, () => void> = {
    task: onNewTask,
    swap: onSwapRequest,
    "911": on911,
    handoff: onHandoff,
    quickreply: onQuickReply,
  };

  const visibleActions = ACTIONS.filter((a) => isManager || !a.managerOnly);

  const handleAction = (id: string) => {
    setOpen(false);
    handlers[id]?.();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
      )}
      <div className="relative z-40">
        {/* Action buttons fan */}
        {open && (
          <div className="absolute bottom-14 right-0 flex flex-col items-end gap-2 pb-2">
            {visibleActions.map((action, i) => (
              <div
                key={action.id}
                className="flex items-center gap-2"
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(10px)",
                  transition: `all 0.15s ease ${i * 0.04}s`,
                }}
              >
                <span className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] bg-[#0F0F0F] border border-[#2A2A2A] px-2.5 py-1 rounded-lg whitespace-nowrap">
                  {action.label}
                </span>
                <button
                  onClick={() => handleAction(action.id)}
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg transition-all active:scale-90",
                    action.color
                  )}
                >
                  <action.icon size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* FAB */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all",
            open
              ? "bg-[#333] text-[#F5F5F5] rotate-45"
              : "bg-[#FF6B35] text-white hover:bg-[#FF8555] active:scale-90"
          )}
        >
          {open ? <X size={20} /> : <Plus size={22} />}
        </button>
      </div>
    </>
  );
}
