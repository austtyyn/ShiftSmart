"use client";

import { useState } from "react";
import { addWeeks, subWeeks, format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { WeekGrid } from "@/components/schedule/WeekGrid";
import { AddShiftForm } from "@/components/schedule/AddShiftForm";
import { useShifts } from "@/hooks/useShifts";
import { useMembers } from "@/hooks/useMembers";
import { useScheduleStore } from "@/stores/scheduleStore";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

export default function SchedulePage() {
  const { membership, profile } = useAuthStore();
  const { shifts, weekStart, setWeekStart } = useScheduleStore();
  const { createShift, deleteShift } = useShifts();
  const { members } = useMembers();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const isManager =
    membership?.role === "manager" || membership?.role === "owner";

  const handlePrevWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const handleNextWeek = () => setWeekStart(addWeeks(weekStart, 1));

  const handleAddForDay = (date: Date) => {
    setSelectedDate(date);
    setAddModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-[#1A1A1A]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5]">
              Schedule
            </h1>
            <p className="text-sm text-[#555] mt-0.5">
              Week of {format(weekStart, "MMM d, yyyy")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Week nav */}
            <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1">
              <button
                onClick={handlePrevWeek}
                className="p-2 rounded-lg text-[#555] hover:text-[#F5F5F5] hover:bg-[#242424] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setWeekStart(new Date())}
                className="px-3 py-1.5 text-xs font-bold tracking-widest uppercase font-[var(--font-display)] text-[#888] hover:text-[#F5F5F5] transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextWeek}
                className="p-2 rounded-lg text-[#555] hover:text-[#F5F5F5] hover:bg-[#242424] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {isManager && (
              <Button size="sm" onClick={() => setAddModalOpen(true)}>
                <Plus size={14} />
                Add Shift
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        <WeekGrid
          weekStart={weekStart}
          shifts={shifts}
          currentUserId={profile?.id}
          canEdit={isManager}
          onAddShift={handleAddForDay}
          onDeleteShift={async (id) => {
            await deleteShift(id);
          }}
        />
      </div>

      {/* Add shift modal */}
      <AddShiftForm
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        members={members}
        defaultDate={selectedDate}
        onAdd={createShift}
      />
    </div>
  );
}
