"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShiftWithProfile } from "@/lib/supabase/types";
import { format } from "date-fns";

interface SwapRequestFormProps {
  onClose: () => void;
  onSubmit: (data: { shift_id: string; note: string }) => Promise<void>;
  myShifts: ShiftWithProfile[];
}

export function SwapRequestForm({ onClose, onSubmit, myShifts }: SwapRequestFormProps) {
  const [shiftId, setShiftId] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const upcomingShifts = myShifts.filter(
    (s) => new Date(s.start_time) > new Date()
  );

  const handleSubmit = async () => {
    if (!shiftId) return;
    setSubmitting(true);
    await onSubmit({ shift_id: shiftId, note });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-[#0F0F0F] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1A1A1A]">
          <span className="text-lg">🔁</span>
          <h2 className="font-bold text-sm tracking-widest uppercase font-[var(--font-display)] text-[#F5F5F5] flex-1">
            Swap Request
          </h2>
          <button onClick={onClose} className="p-2 text-[#555] hover:text-[#888]">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">
              Which shift?
            </label>
            {upcomingShifts.length === 0 ? (
              <p className="text-sm text-[#555] py-2">No upcoming shifts found.</p>
            ) : (
              <select
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
              >
                <option value="">Select a shift…</option>
                {upcomingShifts.map((s) => {
                  const date = format(new Date(s.start_time), "EEE MMM d");
                  const start = format(new Date(s.start_time), "h:mma");
                  const end = format(new Date(s.end_time), "h:mma");
                  return (
                    <option key={s.id} value={s.id}>
                      {date} · {start}–{end}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div>
            <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">
              Note (optional)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Family thing, can't make it"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3">
            <p className="text-xs text-[#555] leading-relaxed">
              This will post a swap request in the team channel. Any crew member can volunteer, then a manager approves and the schedule updates automatically.
            </p>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={handleSubmit}
            disabled={!shiftId || submitting}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-bold tracking-widest uppercase font-[var(--font-display)] transition-all",
              shiftId
                ? "bg-[#FF6B35] text-white hover:bg-[#FF8555] active:scale-[0.99]"
                : "bg-[#1A1A1A] text-[#444] border border-[#2A2A2A] cursor-not-allowed",
              submitting && "opacity-60 cursor-not-allowed"
            )}
          >
            {submitting ? "Posting…" : "🔁 Post Swap Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
