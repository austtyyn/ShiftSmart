"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const EMOJIS = [
  "😊", "😎", "🤠", "😏", "🙂", "😄", "🥳", "😇",
  "👷", "👩‍🍳", "🧑‍🍳", "👨‍💼", "👩‍💼", "🧑‍💼", "💪", "🔥",
  "⚡", "🌟", "🎯", "🏆", "🚀", "💯", "✅", "🎉",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"invite" | "profile">("invite");
  const [inviteCode, setInviteCode] = useState("");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("😊");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPreview, setLocationPreview] = useState<string | null>(null);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate invite code
    const res = await fetch("/api/onboarding/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: inviteCode.toUpperCase() }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Invalid invite code");
      setIsLoading(false);
      return;
    }

    setLocationPreview(data.location_name);
    setStep("profile");
    setIsLoading(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/onboarding/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: inviteCode.toUpperCase(),
        name: name.trim(),
        avatar_emoji: emoji,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to join. Please try again.");
      setIsLoading(false);
      return;
    }

    router.push("/chat");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0F0F0F]">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B35]/20">
            <MessageSquare size={24} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-wider font-[var(--font-display)] text-[#F5F5F5] uppercase">
            ShiftSmart
          </h1>
        </div>
      </div>

      <div className="w-full max-w-sm bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${step === "profile" ? "bg-[#FF6B35]" : "bg-[#FF6B35]/40"}`} />
          <div className={`flex-1 h-1 rounded-full ${step === "profile" ? "bg-[#FF6B35]" : "bg-[#2A2A2A]"}`} />
        </div>

        {step === "invite" ? (
          <>
            <h2 className="text-xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5] mb-2">
              Enter Invite Code
            </h2>
            <p className="text-sm text-[#888] mb-6">
              Your manager shared a 6-character code with you (e.g. TB-4821)
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-sm text-[#EF4444]">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-widest uppercase text-[#888] font-[var(--font-display)]">
                  Invite Code
                </label>
                <input
                  type="text"
                  placeholder="TB-4821"
                  value={inviteCode}
                  onChange={(e) =>
                    setInviteCode(e.target.value.toUpperCase())
                  }
                  maxLength={7}
                  autoFocus
                  className="h-14 w-full rounded-xl bg-[#0F0F0F] border border-[#2A2A2A] px-4 text-center text-2xl font-bold font-[var(--font-display)] tracking-[0.2em] text-[#F5F5F5] placeholder:text-[#333] focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-colors uppercase"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={inviteCode.length < 6 || isLoading}
              >
                {isLoading ? "Checking…" : "Continue →"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-5 p-3 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl">
              <p className="text-xs text-[#22C55E] font-bold font-[var(--font-display)] tracking-wide uppercase">
                ✓ Joined {locationPreview}
              </p>
            </div>

            <h2 className="text-xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5] mb-2">
              Set Up Your Profile
            </h2>
            <p className="text-sm text-[#888] mb-6">
              Your teammates will see your name and emoji in the chat.
            </p>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-sm text-[#EF4444]">
                  {error}
                </div>
              )}

              <Input
                label="Your Name"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />

              {/* Emoji picker */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-widest uppercase text-[#888] font-[var(--font-display)]">
                  Pick an Emoji
                </label>
                <div className="grid grid-cols-8 gap-1.5">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`h-10 rounded-lg text-xl transition-all hover:scale-110 ${
                        emoji === e
                          ? "bg-[#FF6B35]/20 ring-2 ring-[#FF6B35] scale-110"
                          : "bg-[#242424] hover:bg-[#2A2A2A]"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!name.trim() || isLoading}
              >
                {isLoading ? "Joining…" : "Join the Team →"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
