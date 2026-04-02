"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (err) {
        setError(err.message);
        setIsLoading(false);
        return;
      }
    } else {
      // Register
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setIsLoading(false);
        return;
      }

      const { error: err } = await supabase.auth.signUp({
        email,
        password,
      });

      if (err) {
        setError(err.message);
        setIsLoading(false);
        return;
      }
    }

    // Check if admin first — admin never needs onboarding
    const adminRes = await fetch("/api/admin/me");
    const { isAdmin } = await adminRes.json();
    if (isAdmin) {
      router.push("/admin");
      return;
    }

    // Regular user: check for existing membership
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const { data: membership } = await supabase
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!membership) {
      router.push("/onboarding");
    } else {
      router.push("/chat");
    }

    setIsLoading(false);
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
        <p className="text-sm text-[#555]">
          Team communication that survives turnover
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl">
        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-[#0F0F0F] rounded-xl mb-6">
          <button
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold tracking-wide font-[var(--font-display)] uppercase transition-all ${
              mode === "login"
                ? "bg-[#FF6B35] text-white shadow-sm"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode("register"); setError(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold tracking-wide font-[var(--font-display)] uppercase transition-all ${
              mode === "register"
                ? "bg-[#FF6B35] text-white shadow-sm"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder={mode === "register" ? "Min. 6 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 bottom-3 text-[#555] hover:text-[#888] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!email || !password || isLoading}
          >
            {isLoading
              ? mode === "login" ? "Signing in…" : "Creating account…"
              : mode === "login" ? "Sign In →" : "Create Account →"}
          </Button>
        </form>

        {mode === "register" && (
          <p className="mt-5 text-center text-xs text-[#444]">
            Already have an account?{" "}
            <button
              onClick={() => { setMode("login"); setError(null); }}
              className="text-[#FF6B35] hover:text-[#FF8555] transition-colors"
            >
              Sign in
            </button>
          </p>
        )}

        {mode === "login" && (
          <p className="mt-5 text-center text-xs text-[#444]">
            New here? Ask your manager for an invite code, then{" "}
            <button
              onClick={() => { setMode("register"); setError(null); }}
              className="text-[#FF6B35] hover:text-[#FF8555] transition-colors"
            >
              create an account
            </button>
            .
          </p>
        )}
      </div>
    </div>
  );
}
