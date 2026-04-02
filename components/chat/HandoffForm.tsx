"use client";

import { useState } from "react";
import { Plus, X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberWithProfile, HandoffNote } from "@/lib/supabase/types";

interface HandoffFormProps {
  onClose: () => void;
  onSubmit: (data: {
    incoming_user_id: string | null;
    shift_label: string;
    notes: HandoffNote[];
    crew_tonight: string[];
    tasks_carried_over: number;
  }) => Promise<void>;
  members: MemberWithProfile[];
  currentUserId: string;
}

const NOTE_TYPE_CONFIG = {
  warning: { label: "Warning", icon: AlertTriangle, color: "text-[#F59E0B]" },
  check: { label: "Done", icon: CheckCircle, color: "text-[#22C55E]" },
  info: { label: "Note", icon: Info, color: "text-[#60A5FA]" },
};

export function HandoffForm({ onClose, onSubmit, members, currentUserId }: HandoffFormProps) {
  const [incomingId, setIncomingId] = useState<string>("");
  const [shiftLabel, setShiftLabel] = useState("");
  const [notes, setNotes] = useState<HandoffNote[]>([
    { type: "info", text: "" },
  ]);
  const [crewInput, setCrewInput] = useState("");
  const [crew, setCrew] = useState<string[]>([]);
  const [tasksCarriedOver, setTasksCarriedOver] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const otherMembers = members.filter((m) => m.profile.id !== currentUserId);

  const addNote = (type: HandoffNote["type"]) => {
    setNotes([...notes, { type, text: "" }]);
  };

  const updateNote = (i: number, text: string) => {
    setNotes(notes.map((n, idx) => (idx === i ? { ...n, text } : n)));
  };

  const changeNoteType = (i: number, type: HandoffNote["type"]) => {
    setNotes(notes.map((n, idx) => (idx === i ? { ...n, type } : n)));
  };

  const removeNote = (i: number) => {
    setNotes(notes.filter((_, idx) => idx !== i));
  };

  const addCrewMember = () => {
    const trimmed = crewInput.trim();
    if (trimmed && !crew.includes(trimmed)) {
      setCrew([...crew, trimmed]);
      setCrewInput("");
    }
  };

  const handleSubmit = async () => {
    const validNotes = notes.filter((n) => n.text.trim());
    setSubmitting(true);
    await onSubmit({
      incoming_user_id: incomingId || null,
      shift_label: shiftLabel,
      notes: validNotes,
      crew_tonight: crew,
      tasks_carried_over: tasksCarriedOver,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg bg-[#0F0F0F] border border-[#2A2A2A] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1A1A1A] flex-shrink-0">
          <span className="text-xl">🔄</span>
          <div>
            <h2 className="font-bold text-sm tracking-widest uppercase font-[var(--font-display)] text-[#F5F5F5]">
              Start Handoff
            </h2>
            <p className="text-xs text-[#555]">Fill out for the incoming lead</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 text-[#555] hover:text-[#888] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Shift label */}
          <div>
            <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">
              Shift Time
            </label>
            <input
              value={shiftLabel}
              onChange={(e) => setShiftLabel(e.target.value)}
              placeholder="e.g. 3pm → 11pm"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          {/* Incoming lead */}
          <div>
            <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">
              Incoming Lead
            </label>
            <select
              value={incomingId}
              onChange={(e) => setIncomingId(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
            >
              <option value="">Anyone / TBD</option>
              {otherMembers.map((m) => (
                <option key={m.profile.id} value={m.profile.id}>
                  {m.profile.avatar_emoji} {m.profile.name ?? "Unnamed"}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-2">
              Handoff Notes
            </label>
            <div className="space-y-2">
              {notes.map((note, i) => {
                const config = NOTE_TYPE_CONFIG[note.type];
                return (
                  <div key={i} className="flex items-start gap-2">
                    <select
                      value={note.type}
                      onChange={(e) => changeNoteType(i, e.target.value as HandoffNote["type"])}
                      className="flex-shrink-0 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2 py-2 text-xs text-[#888] focus:outline-none"
                    >
                      <option value="warning">⚠️ Warning</option>
                      <option value="check">✅ Done</option>
                      <option value="info">📋 Note</option>
                    </select>
                    <input
                      value={note.text}
                      onChange={(e) => updateNote(i, e.target.value)}
                      placeholder={
                        note.type === "warning"
                          ? "e.g. Ice machine is down"
                          : note.type === "check"
                          ? "e.g. Drive-thru restocked"
                          : "Add a note…"
                      }
                      className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35]"
                    />
                    <button
                      onClick={() => removeNote(i)}
                      className="flex-shrink-0 p-2 text-[#555] hover:text-[#EF4444] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-2">
              {(["warning", "check", "info"] as HandoffNote["type"][]).map((type) => {
                const c = NOTE_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => addNote(type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs text-[#555] hover:text-[#888] transition-colors"
                  >
                    <Plus size={10} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tasks carried over */}
          <div>
            <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">
              Open Tasks Carried Over
            </label>
            <input
              type="number"
              min={0}
              value={tasksCarriedOver}
              onChange={(e) => setTasksCarriedOver(parseInt(e.target.value) || 0)}
              className="w-24 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          {/* Crew tonight */}
          <div>
            <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">
              Crew Tonight
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={crewInput}
                onChange={(e) => setCrewInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCrewMember())}
                placeholder="Name, then Enter"
                className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35]"
              />
              <button
                onClick={addCrewMember}
                className="px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-[#555] hover:text-[#888] transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            {crew.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {crew.map((name) => (
                  <span
                    key={name}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full text-xs text-[#888]"
                  >
                    {name}
                    <button onClick={() => setCrew(crew.filter((c) => c !== name))}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="px-5 pb-5 pt-3 border-t border-[#1A1A1A] flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-bold tracking-widest uppercase font-[var(--font-display)] transition-all",
              "bg-[#FF6B35] text-white hover:bg-[#FF8555] active:scale-[0.99]",
              submitting && "opacity-60 cursor-not-allowed"
            )}
          >
            {submitting ? "Posting Handoff…" : "🔄 Post Handoff Card"}
          </button>
        </div>
      </div>
    </div>
  );
}
