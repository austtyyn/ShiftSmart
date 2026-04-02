import { create } from "zustand";
import type { ShiftWithProfile } from "@/lib/supabase/types";

interface ScheduleState {
  shifts: ShiftWithProfile[];
  weekStart: Date;
  isLoading: boolean;
  setShifts: (shifts: ShiftWithProfile[]) => void;
  addShift: (shift: ShiftWithProfile) => void;
  removeShift: (id: string) => void;
  setWeekStart: (date: Date) => void;
  setLoading: (loading: boolean) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  shifts: [],
  weekStart: getMonday(new Date()),
  isLoading: false,
  setShifts: (shifts) => set({ shifts }),
  addShift: (shift) =>
    set((state) => ({ shifts: [...state.shifts, shift] })),
  removeShift: (id) =>
    set((state) => ({ shifts: state.shifts.filter((s) => s.id !== id) })),
  setWeekStart: (weekStart) => set({ weekStart }),
  setLoading: (isLoading) => set({ isLoading }),
}));

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
