"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Plus, Trash2, Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Availability, AvailabilityType } from "@/lib/supabase/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TYPE_CONFIG: Record<AvailabilityType, { label: string; icon: React.ElementType; color: string; description: string }> = {
  recurring: {
    label: "Recurring Availability",
    icon: Clock,
    color: "text-[#60A5FA]",
    description: "Set which hours you can work on specific days",
  },
  block_out: {
    label: "Block Out Dates",
    icon: Calendar,
    color: "text-[#F59E0B]",
    description: "Mark specific dates you can't work",
  },
  constraint: {
    label: "Constraint / Note",
    icon: AlertCircle,
    color: "text-[#A78BFA]",
    description: "e.g. No more than 5hrs, school schedule",
  },
};

export default function AvailabilityPage() {
  const { membership, profile } = useAuthStore();
  const [rules, setRules] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [addType, setAddType] = useState<AvailabilityType | null>(null);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!membership?.location_id || !profile?.id) return;
    fetchRules();
  }, [membership?.location_id, profile?.id]);

  const fetchRules = async () => {
    setLoading(true);
    const res = await fetch(
      `/api/availability?location_id=${membership?.location_id}&user_id=${profile?.id}`
    );
    const data = await res.json();
    setRules(data.availability ?? []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!addType || !membership?.location_id) return;
    setSaving(true);

    const body: Record<string, unknown> = {
      location_id: membership.location_id,
      type: addType,
    };

    if (addType === "recurring") {
      body.day_of_week = dayOfWeek;
      body.start_time = startTime;
      body.end_time = endTime;
    } else if (addType === "block_out") {
      body.start_date = startDate;
      body.end_date = endDate || startDate;
    } else if (addType === "constraint") {
      body.note = note;
    }

    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (data.availability) {
      setRules((prev) => [...prev, data.availability]);
    }

    setSaving(false);
    setAddType(null);
    setNote("");
    setStartDate("");
    setEndDate("");
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/availability?id=${id}`, { method: "DELETE" });
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const recurringRules = rules.filter((r) => r.type === "recurring");
  const blockOutRules = rules.filter((r) => r.type === "block_out");
  const constraintRules = rules.filter((r) => r.type === "constraint");

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0F0F0F] border-b border-[#1A1A1A] px-6 py-4">
        <h1 className="text-2xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5]">
          My Availability
        </h1>
        <p className="text-sm text-[#555] mt-0.5">
          Managers see conflicts in red before publishing the schedule
        </p>
      </div>

      <div className="p-6 max-w-2xl space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="text-[#555] animate-spin" />
          </div>
        ) : (
          <>
            {/* Add buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(TYPE_CONFIG) as AvailabilityType[]).map((type) => {
                const config = TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setAddType(type)}
                    className="flex items-start gap-3 px-4 py-4 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] rounded-2xl text-left transition-colors"
                  >
                    <config.icon size={18} className={cn("mt-0.5 flex-shrink-0", config.color)} />
                    <div>
                      <p className="text-sm font-bold text-[#F5F5F5]">{config.label}</p>
                      <p className="text-xs text-[#555] mt-0.5">{config.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Add form */}
            {addType && (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  {(() => { const C = TYPE_CONFIG[addType].icon; return <C size={16} className={TYPE_CONFIG[addType].color} />; })()}
                  <h3 className="text-sm font-bold tracking-wide font-[var(--font-display)] uppercase text-[#888]">
                    {TYPE_CONFIG[addType].label}
                  </h3>
                </div>

                {addType === "recurring" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">Day</label>
                      <select
                        value={dayOfWeek}
                        onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
                      >
                        {DAYS.map((day, i) => (
                          <option key={i} value={i}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">From</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">Until</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {addType === "block_out" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">From Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">To Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
                      />
                    </div>
                  </div>
                )}

                {addType === "constraint" && (
                  <div>
                    <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">Note</label>
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. No more than 5hrs — school schedule"
                      className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={saving}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 bg-[#FF6B35] text-white rounded-xl text-sm font-bold font-[var(--font-display)] tracking-wide uppercase transition-all hover:bg-[#FF8555] active:scale-95",
                      saving && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <Plus size={14} />
                    {saving ? "Saving…" : "Add Rule"}
                  </button>
                  <button
                    onClick={() => setAddType(null)}
                    className="px-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] text-[#555] rounded-xl text-sm font-bold font-[var(--font-display)] uppercase hover:text-[#888] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Rules list */}
            {recurringRules.length > 0 && (
              <RuleSection title="Recurring Availability" color="text-[#60A5FA]">
                {recurringRules.map((rule) => (
                  <RuleItem
                    key={rule.id}
                    label={`${DAYS[rule.day_of_week ?? 0]} — ${rule.start_time ?? ""} to ${rule.end_time ?? ""}`}
                    onDelete={() => handleDelete(rule.id)}
                  />
                ))}
              </RuleSection>
            )}

            {blockOutRules.length > 0 && (
              <RuleSection title="Block Out Dates" color="text-[#F59E0B]">
                {blockOutRules.map((rule) => (
                  <RuleItem
                    key={rule.id}
                    label={
                      rule.start_date === rule.end_date || !rule.end_date
                        ? rule.start_date ?? ""
                        : `${rule.start_date} → ${rule.end_date}`
                    }
                    onDelete={() => handleDelete(rule.id)}
                  />
                ))}
              </RuleSection>
            )}

            {constraintRules.length > 0 && (
              <RuleSection title="Constraints" color="text-[#A78BFA]">
                {constraintRules.map((rule) => (
                  <RuleItem
                    key={rule.id}
                    label={rule.note ?? ""}
                    onDelete={() => handleDelete(rule.id)}
                  />
                ))}
              </RuleSection>
            )}

            {rules.length === 0 && !addType && (
              <div className="text-center py-16">
                <Calendar size={48} className="text-[#333] mx-auto mb-4" />
                <p className="text-[#555] text-sm">No availability rules set.</p>
                <p className="text-xs text-[#444] mt-1">Add rules above and managers will see conflicts before scheduling.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RuleSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className={cn("text-xs font-bold tracking-widest uppercase font-[var(--font-display)] mb-2", color)}>
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function RuleItem({ label, onDelete }: { label: string; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl">
      <span className="text-sm text-[#CCC] flex-1">{label}</span>
      <button
        onClick={onDelete}
        className="p-1.5 text-[#555] hover:text-[#EF4444] transition-colors"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
