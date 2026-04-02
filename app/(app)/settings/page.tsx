"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRoleLabel } from "@/lib/utils";
import { CheckCircle2, LogOut } from "lucide-react";

const EMOJIS = [
  "😊", "😎", "🤠", "😏", "🙂", "😄", "🥳", "😇",
  "👷", "👩‍🍳", "🧑‍🍳", "👨‍💼", "👩‍💼", "🧑‍💼", "💪", "🔥",
  "⚡", "🌟", "🎯", "🏆", "🚀", "💯", "✅", "🎉",
];

export default function SettingsPage() {
  const supabase = createClient();
  const { profile, membership, location, setProfile } = useAuthStore();
  const [name, setName] = useState(profile?.name ?? "");
  const [emoji, setEmoji] = useState(profile?.avatar_emoji ?? "😊");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Load email on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("profiles")
      .update({ name: name.trim(), avatar_emoji: emoji })
      .eq("id", profile.id)
      .select()
      .single();

    if (err) {
      setError("Failed to save profile.");
    } else if (data) {
      setProfile(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5]">
          Settings
        </h1>

        {/* Profile section */}
        <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#555] font-[var(--font-display)] mb-4">
            Your Profile
          </h2>

          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-[#0F0F0F] rounded-xl mb-5 border border-[#2A2A2A]">
            <div className="w-14 h-14 rounded-full bg-[#242424] border-2 border-[#2A2A2A] flex items-center justify-center text-3xl">
              {emoji}
            </div>
            <div>
              <p className="font-bold text-[#F5F5F5] font-[var(--font-display)] tracking-wide text-lg">
                {name || "Your Name"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {membership?.role && (
                  <Badge
                    variant={
                      membership.role === "owner"
                        ? "accent"
                        : membership.role === "manager"
                        ? "warning"
                        : "muted"
                    }
                  >
                    {getRoleLabel(membership.role)}
                  </Badge>
                )}
                {location && (
                  <span className="text-xs text-[#555]">{location.name}</span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            <Input
              label="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase text-[#888] font-[var(--font-display)]">
                Avatar Emoji
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
              className="w-full"
              disabled={isSaving}
            >
              {saved ? (
                <>
                  <CheckCircle2 size={16} />
                  Saved!
                </>
              ) : isSaving ? (
                "Saving…"
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </section>

        {/* Store info */}
        {location && (
          <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#555] font-[var(--font-display)] mb-3">
              Store
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Name</span>
                <span className="text-sm text-[#F5F5F5] font-bold">{location.name}</span>
              </div>
              {location.brand && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#888]">Brand</span>
                  <span className="text-sm text-[#F5F5F5]">{location.brand}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#888]">Your Role</span>
                <Badge
                  variant={
                    membership?.role === "owner"
                      ? "accent"
                      : membership?.role === "manager"
                      ? "warning"
                      : "muted"
                  }
                >
                  {getRoleLabel(membership?.role ?? "crew")}
                </Badge>
              </div>
            </div>
          </section>
        )}

        {/* Account */}
        <section className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-5">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#555] font-[var(--font-display)] mb-3">
            Account
          </h2>
          {userEmail && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#888]">Email</span>
              <span className="text-sm text-[#F5F5F5]">{userEmail}</span>
            </div>
          )}
          <Button
            variant="danger"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </section>
      </div>
    </div>
  );
}
