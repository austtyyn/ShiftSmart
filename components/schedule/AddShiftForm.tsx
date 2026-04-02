"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MemberWithProfile } from "@/lib/supabase/types";
import { format } from "date-fns";

interface AddShiftFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: MemberWithProfile[];
  defaultDate?: Date;
  onAdd: (params: {
    user_id: string;
    start_time: string;
    end_time: string;
  }) => Promise<{ error: unknown }>;
}

export function AddShiftForm({
  open,
  onOpenChange,
  members,
  defaultDate,
  onAdd,
}: AddShiftFormProps) {
  const today = format(defaultDate ?? new Date(), "yyyy-MM-dd");
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("Please select a team member");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    if (endDateTime <= startDateTime) {
      setError("End time must be after start time");
      setIsSubmitting(false);
      return;
    }

    const { error: err } = await onAdd({
      user_id: userId,
      start_time: startDateTime,
      end_time: endDateTime,
    });

    if (err) {
      setError(typeof err === "string" ? err : "Failed to add shift. Please try again.");
    } else {
      onOpenChange(false);
      setUserId("");
    }
    setIsSubmitting(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Shift"
      description="Schedule a shift for a team member."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-sm text-[#EF4444]">
            {error}
          </div>
        )}

        {/* Team member */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold tracking-widest uppercase text-[#888] font-[var(--font-display)]">
            Team Member
          </label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="h-12 w-full rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-4 text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-colors"
          >
            <option value="" className="bg-[#1A1A1A]">Select member…</option>
            {members.map((m) => (
              <option key={m.membership.user_id} value={m.membership.user_id ?? ""} className="bg-[#1A1A1A]">
                {m.profile.avatar_emoji} {m.profile.name ?? "Unknown"}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="[color-scheme:dark]"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="[color-scheme:dark]"
          />
          <Input
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="[color-scheme:dark]"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add Shift"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
