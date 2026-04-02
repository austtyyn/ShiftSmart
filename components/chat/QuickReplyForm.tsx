"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuickReplyOption } from "@/lib/supabase/types";

const PRESET_OPTIONS = [
  [
    { id: "yes", label: "Yes, I can", emoji: "✅" },
    { id: "no", label: "No", emoji: "❌" },
    { id: "maybe", label: "Maybe", emoji: "🕐" },
  ],
  [
    { id: "got_it", label: "Got it", emoji: "👍" },
    { id: "need_clarity", label: "Need clarity", emoji: "❓" },
  ],
  [
    { id: "on_my_way", label: "On my way", emoji: "🔁" },
    { id: "running_late", label: "Running late", emoji: "⏰" },
    { id: "not_coming", label: "Not coming", emoji: "❌" },
  ],
];

interface QuickReplyFormProps {
  onClose: () => void;
  onSubmit: (data: { question: string; options: QuickReplyOption[] }) => Promise<void>;
}

export function QuickReplyForm({ onClose, onSubmit }: QuickReplyFormProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<QuickReplyOption[]>([
    { id: "yes", label: "Yes, I can", emoji: "✅" },
    { id: "no", label: "No", emoji: "❌" },
    { id: "maybe", label: "Maybe, call me", emoji: "🕐" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const loadPreset = (preset: QuickReplyOption[]) => {
    setOptions(preset.map((o) => ({ ...o })));
  };

  const updateOption = (i: number, field: keyof QuickReplyOption, value: string) => {
    setOptions(options.map((o, idx) => idx === i ? { ...o, [field]: value } : o));
  };

  const removeOption = (i: number) => {
    setOptions(options.filter((_, idx) => idx !== i));
  };

  const addOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), label: "", emoji: "💬" }]);
  };

  const handleSubmit = async () => {
    if (!question.trim() || options.filter((o) => o.label.trim()).length < 2) return;
    setSubmitting(true);
    await onSubmit({
      question: question.trim(),
      options: options.filter((o) => o.label.trim()),
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-[#0F0F0F] border border-[#2A2A2A] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1A1A1A] flex-shrink-0">
          <span className="text-lg">⚡</span>
          <h2 className="font-bold text-sm tracking-widest uppercase font-[var(--font-display)] text-[#F5F5F5] flex-1">
            Quick Reply
          </h2>
          <button onClick={onClose} className="p-2 text-[#555] hover:text-[#888]">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Question */}
          <div>
            <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-1.5">
              Question
            </label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Can someone stay late tonight?"
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          {/* Presets */}
          <div>
            <p className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#555] mb-2">
              Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_OPTIONS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => loadPreset(preset)}
                  className="px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs text-[#555] hover:text-[#888] transition-colors"
                >
                  {preset.map((o) => o.emoji).join(" ")}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="text-xs font-bold tracking-wide uppercase font-[var(--font-display)] text-[#888] block mb-2">
              Reply Options
            </label>
            <div className="space-y-2">
              {options.map((option, i) => (
                <div key={option.id} className="flex items-center gap-2">
                  <input
                    value={option.emoji}
                    onChange={(e) => updateOption(i, "emoji", e.target.value)}
                    className="w-12 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2 py-2 text-sm text-center text-[#F5F5F5] focus:outline-none"
                  />
                  <input
                    value={option.label}
                    onChange={(e) => updateOption(i, "label", e.target.value)}
                    placeholder="Option label"
                    className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35]"
                  />
                  <button onClick={() => removeOption(i)} className="p-2 text-[#555] hover:text-[#EF4444]">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addOption}
              className="flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs text-[#555] hover:text-[#888]"
            >
              <Plus size={12} />
              Add Option
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-[#1A1A1A] flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!question.trim() || submitting}
            className={cn(
              "w-full py-3 rounded-xl text-sm font-bold tracking-widest uppercase font-[var(--font-display)] transition-all",
              question.trim()
                ? "bg-[#FF6B35] text-white hover:bg-[#FF8555] active:scale-[0.99]"
                : "bg-[#1A1A1A] text-[#444] border border-[#2A2A2A] cursor-not-allowed",
              submitting && "opacity-60 cursor-not-allowed"
            )}
          >
            {submitting ? "Posting…" : "⚡ Send Quick Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}
