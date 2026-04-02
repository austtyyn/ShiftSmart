"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  RefreshCw,
  MessageSquare,
  BarChart2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfWeek, endOfWeek, addDays } from "date-fns";
import type { ShiftWithProfile } from "@/lib/supabase/types";

interface InsightData {
  totalShiftsThisWeek: number;
  coveredShifts: number;
  coverageGaps: { date: string; shiftCount: number; neededCount: number }[];
  overtimeRisks: { name: string; emoji: string; hours: number }[];
  swapStats: { total: number; approved: number; open: number };
  memberActivity: { name: string; emoji: string; role: string; shiftsThisWeek: number; shiftsLastWeek: number }[];
}

export default function InsightsPage() {
  const { membership, profile } = useAuthStore();
  const supabase = createClient();
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  const isManager = membership?.role === "manager" || membership?.role === "owner";

  useEffect(() => {
    if (!membership?.location_id) return;
    fetchInsights();
  }, [membership?.location_id]);

  const fetchInsights = async () => {
    if (!membership?.location_id) return;
    setLoading(true);

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = subDays(weekStart, 7);
    const lastWeekEnd = subDays(weekEnd, 7);

    // Fetch this week's shifts
    const { data: thisWeekShifts } = await supabase
      .from("shifts")
      .select("*, profile:profiles!shifts_user_id_fkey(*)")
      .eq("location_id", membership.location_id)
      .gte("start_time", weekStart.toISOString())
      .lte("start_time", weekEnd.toISOString());

    // Fetch last week's shifts
    const { data: lastWeekShifts } = await supabase
      .from("shifts")
      .select("*, profile:profiles!shifts_user_id_fkey(*)")
      .eq("location_id", membership.location_id)
      .gte("start_time", lastWeekStart.toISOString())
      .lte("start_time", lastWeekEnd.toISOString());

    // Fetch members
    const { data: members } = await supabase
      .from("memberships")
      .select("*, profile:profiles!memberships_user_id_fkey(*)")
      .eq("location_id", membership.location_id)
      .eq("is_active", true);

    // Fetch swap requests
    const { data: swaps } = await supabase
      .from("swap_requests")
      .select("status")
      .eq("location_id", membership.location_id)
      .gte("created_at", weekStart.toISOString());

    const shifts = (thisWeekShifts ?? []) as ShiftWithProfile[];
    const lastShifts = (lastWeekShifts ?? []) as ShiftWithProfile[];
    // Supabase join returns flat rows: top-level membership fields + joined `profile` object
    type FlatMember = {
      id: string;
      user_id: string | null;
      location_id: string | null;
      role: string;
      is_active: boolean;
      profile: { name: string | null; avatar_emoji: string | null } | null;
    };
    const memberList = (members ?? []) as FlatMember[];

    // Coverage gaps: days with fewer than 2 workers
    const coverageGaps: InsightData["coverageGaps"] = [];
    for (let d = 0; d < 7; d++) {
      const day = addDays(weekStart, d);
      const dayStr = format(day, "yyyy-MM-dd");
      const dayShifts = shifts.filter((s) => s.start_time.startsWith(dayStr));
      if (dayShifts.length < 2) {
        coverageGaps.push({
          date: format(day, "EEE MMM d"),
          shiftCount: dayShifts.length,
          neededCount: 2,
        });
      }
    }

    // Overtime risks: anyone with 35+ hrs this week
    const hoursPerUser: Record<string, { hours: number; name: string; emoji: string }> = {};
    for (const shift of shifts) {
      if (!shift.user_id) continue;
      const hrs = (new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / 3600000;
      if (!hoursPerUser[shift.user_id]) {
        hoursPerUser[shift.user_id] = {
          hours: 0,
          name: (shift as ShiftWithProfile).profile?.name ?? "Unknown",
          emoji: (shift as ShiftWithProfile).profile?.avatar_emoji ?? "👤",
        };
      }
      hoursPerUser[shift.user_id].hours += hrs;
    }
    const overtimeRisks = Object.values(hoursPerUser)
      .filter((u) => u.hours >= 35)
      .sort((a, b) => b.hours - a.hours);

    // Member activity: shifts this week vs last week
    const memberActivity = memberList.map((m) => {
      const thisWeekCount = shifts.filter((s) => s.user_id === m.user_id).length;
      const lastWeekCount = lastShifts.filter((s) => s.user_id === m.user_id).length;
      return {
        name: m.profile?.name ?? "Unknown",
        emoji: m.profile?.avatar_emoji ?? "👤",
        role: m.role,
        shiftsThisWeek: thisWeekCount,
        shiftsLastWeek: lastWeekCount,
      };
    });

    // Swap stats
    const swapList = swaps ?? [];
    const swapStats = {
      total: swapList.length,
      approved: swapList.filter((s) => s.status === "approved").length,
      open: swapList.filter((s) => s.status === "open").length,
    };

    setData({
      totalShiftsThisWeek: shifts.length,
      coveredShifts: shifts.length - coverageGaps.reduce((a, g) => a + (g.neededCount - g.shiftCount), 0),
      coverageGaps,
      overtimeRisks,
      swapStats,
      memberActivity,
    });
    setLoading(false);
  };

  if (!isManager) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <BarChart2 size={48} className="text-[#333] mx-auto mb-4" />
          <p className="text-[#555] text-sm">Manager access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0F0F0F] border-b border-[#1A1A1A] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5]">
              Labor Insights
            </h1>
            <p className="text-sm text-[#555] mt-0.5">
              Week of {format(startOfWeek(new Date(), { weekStartsOn: 1 }), "MMM d")} · Live data
            </p>
          </div>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="p-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-[#555] hover:text-[#888] transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="text-[#555] animate-spin" />
        </div>
      ) : data ? (
        <div className="p-6 space-y-6 max-w-4xl">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={<Clock size={18} />}
              label="Shifts This Week"
              value={data.totalShiftsThisWeek}
              color="text-[#60A5FA]"
            />
            <StatCard
              icon={<AlertTriangle size={18} />}
              label="Coverage Gaps"
              value={data.coverageGaps.length}
              color={data.coverageGaps.length > 0 ? "text-[#F59E0B]" : "text-[#22C55E]"}
              alert={data.coverageGaps.length > 0}
            />
            <StatCard
              icon={<TrendingUp size={18} />}
              label="Overtime Risks"
              value={data.overtimeRisks.length}
              color={data.overtimeRisks.length > 0 ? "text-[#EF4444]" : "text-[#22C55E]"}
              alert={data.overtimeRisks.length > 0}
            />
            <StatCard
              icon={<RefreshCw size={18} />}
              label="Open Swaps"
              value={data.swapStats.open}
              color={data.swapStats.open > 0 ? "text-[#A78BFA]" : "text-[#22C55E]"}
            />
          </div>

          {/* Coverage gaps */}
          {data.coverageGaps.length > 0 && (
            <Section title="Coverage Gaps" icon={<AlertTriangle size={16} className="text-[#F59E0B]" />}>
              <div className="space-y-2">
                {data.coverageGaps.map((gap) => (
                  <div
                    key={gap.date}
                    className="flex items-center justify-between px-4 py-3 bg-[#F59E0B]/8 border border-[#F59E0B]/20 rounded-xl"
                  >
                    <span className="text-sm text-[#F5F5F5]">{gap.date}</span>
                    <span className="text-sm text-[#F59E0B] font-bold">
                      {gap.shiftCount} / {gap.neededCount} covered
                      {gap.shiftCount === 0 && " — Uncovered!"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#555] mt-2">
                Tip: Add shifts or find coverage before the week starts.
              </p>
            </Section>
          )}

          {/* Overtime risks */}
          {data.overtimeRisks.length > 0 && (
            <Section title="Overtime Alerts" icon={<Clock size={16} className="text-[#EF4444]" />}>
              <div className="space-y-2">
                {data.overtimeRisks.map((person) => (
                  <div
                    key={person.name}
                    className="flex items-center gap-3 px-4 py-3 bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-xl"
                  >
                    <span className="text-2xl">{person.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#F5F5F5]">{person.name}</p>
                      <p className="text-xs text-[#555]">Scheduled hours this week</p>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-bold font-[var(--font-display)]",
                        person.hours >= 40 ? "text-[#EF4444]" : "text-[#F59E0B]"
                      )}
                    >
                      {person.hours.toFixed(1)}h
                      {person.hours >= 40 && " ⚠️"}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Swap activity */}
          {data.swapStats.total > 0 && (
            <Section title="Swap Activity This Week" icon={<RefreshCw size={16} className="text-[#A78BFA]" />}>
              <div className="grid grid-cols-3 gap-3">
                <div className="px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-center">
                  <p className="text-2xl font-bold text-[#F5F5F5]">{data.swapStats.total}</p>
                  <p className="text-xs text-[#555] mt-1">Total Requests</p>
                </div>
                <div className="px-4 py-3 bg-[#22C55E]/8 border border-[#22C55E]/20 rounded-xl text-center">
                  <p className="text-2xl font-bold text-[#22C55E]">{data.swapStats.approved}</p>
                  <p className="text-xs text-[#555] mt-1">Approved</p>
                </div>
                <div className="px-4 py-3 bg-[#F59E0B]/8 border border-[#F59E0B]/20 rounded-xl text-center">
                  <p className="text-2xl font-bold text-[#F59E0B]">{data.swapStats.open}</p>
                  <p className="text-xs text-[#555] mt-1">Still Open</p>
                </div>
              </div>
            </Section>
          )}

          {/* Member activity */}
          <Section title="Team Activity" icon={<Users size={16} className="text-[#60A5FA]" />}>
            <div className="space-y-2">
              {data.memberActivity
                .sort((a, b) => b.shiftsThisWeek - a.shiftsThisWeek)
                .map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-3 px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl"
                  >
                    <span className="text-2xl">{member.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#F5F5F5] truncate">{member.name}</p>
                      <p className="text-xs text-[#555] capitalize">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <p className="text-sm font-bold text-[#F5F5F5]">{member.shiftsThisWeek}</p>
                        <p className="text-[10px] text-[#444]">this week</p>
                      </div>
                      {member.shiftsLastWeek > 0 && (
                        <div className="text-[#444]">
                          <p className="text-xs">{member.shiftsLastWeek}</p>
                          <p className="text-[10px]">last wk</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              {data.memberActivity.length === 0 && (
                <p className="text-sm text-[#555] text-center py-4">No team members found.</p>
              )}
            </div>
          </Section>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  alert?: boolean;
}) {
  return (
    <div
      className={cn(
        "px-4 py-4 bg-[#1A1A1A] border rounded-2xl",
        alert ? "border-[#F59E0B]/30" : "border-[#2A2A2A]"
      )}
    >
      <div className={cn("mb-2", color)}>{icon}</div>
      <p className={cn("text-2xl font-bold font-[var(--font-display)]", color)}>{value}</p>
      <p className="text-xs text-[#555] mt-0.5 leading-snug">{label}</p>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-bold tracking-widest uppercase font-[var(--font-display)] text-[#888]">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
