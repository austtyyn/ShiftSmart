"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Calendar,
  Megaphone,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  BarChart2,
  CalendarCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { PresenceBadge } from "@/components/chat/PresenceBadge";
import type { PresenceStatus } from "@/lib/supabase/types";

const PRESENCE_OPTIONS: { value: PresenceStatus; label: string; icon: string; desc: string }[] = [
  { value: "on_shift", label: "On Shift", icon: "🟢", desc: "Clocked in, working" },
  { value: "starting_soon", label: "Starting Soon", icon: "⏰", desc: "Within 30 min of start" },
  { value: "off_shift", label: "Off Shift", icon: "🌙", desc: "Notifications paused" },
  { value: "unavailable", label: "Unavailable", icon: "📵", desc: "Do not disturb" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { profile, membership, location, setProfile, setMembership, setLocation, setLoading, clear } =
    useAuthStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [presenceMenuOpen, setPresenceMenuOpen] = useState(false);
  const [presence, setPresence] = useState<PresenceStatus>("off_shift");
  const [updatingPresence, setUpdatingPresence] = useState(false);

  const isManager = membership?.role === "manager" || membership?.role === "owner";

  const NAV_ITEMS = [
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/announcements", icon: Megaphone, label: "Announcements" },
    { href: "/schedule", icon: Calendar, label: "Schedule" },
    { href: "/team", icon: Users, label: "Team" },
    ...(isManager ? [{ href: "/insights", icon: BarChart2, label: "Insights" }] : []),
    { href: "/availability", icon: CalendarCheck, label: "Availability" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData) {
        router.replace("/onboarding");
        return;
      }

      const { data: membershipData } = await supabase
        .from("memberships")
        .select("*")
        .eq("user_id", user.id as string)
        .eq("is_active", true)
        .order("joined_at", { ascending: false })
        .limit(1)
        .single();

      if (!membershipData) {
        const adminRes = await fetch("/api/admin/me");
        const { isAdmin } = await adminRes.json();
        if (isAdmin) {
          router.replace("/admin");
        } else {
          router.replace("/onboarding");
        }
        return;
      }

      const { data: locationData } = await supabase
        .from("locations")
        .select("*")
        .eq("id", membershipData.location_id ?? "")
        .single();

      setProfile(profileData);
      setMembership(membershipData);
      setLocation(locationData);
      setLoading(false);
      setIsInitializing(false);

      // Set initial presence from membership
      if (membershipData.presence) {
        setPresence(membershipData.presence as PresenceStatus);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clear();
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handlePresenceChange = async (newPresence: PresenceStatus) => {
    if (!membership?.location_id || updatingPresence) return;
    setPresence(newPresence);
    setPresenceMenuOpen(false);
    setUpdatingPresence(true);
    await fetch("/api/presence", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presence: newPresence, location_id: membership.location_id }),
    });
    setUpdatingPresence(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-[#FF6B35] rounded-xl flex items-center justify-center animate-pulse">
            <MessageSquare size={20} className="text-white" />
          </div>
          <p className="text-sm text-[#555] font-[var(--font-display)] tracking-widest uppercase">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  const presenceConfig = PRESENCE_OPTIONS.find((p) => p.value === presence) ?? PRESENCE_OPTIONS[2];

  return (
    <div className="h-full flex flex-col bg-[#0F0F0F]">
      {/* Top nav */}
      <header className="flex-shrink-0 h-14 bg-[#0F0F0F] border-b border-[#1A1A1A] flex items-center px-4 gap-4 z-40">
        {/* Mobile menu */}
        <button
          className="lg:hidden p-2 text-[#555] hover:text-[#F5F5F5] transition-colors"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
            <MessageSquare size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-widest font-[var(--font-display)] uppercase text-[#F5F5F5] hidden sm:block">
            ShiftSmart
          </span>
        </div>

        {/* Store name */}
        {location && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
            <span className="text-xs font-bold text-[#888] font-[var(--font-display)] tracking-wide uppercase truncate max-w-[140px]">
              {location.brand ? `${location.brand} — ` : ""}{location.name}
            </span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Notification bell */}
          <button className="relative p-2.5 rounded-lg text-[#555] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors">
            <Bell size={18} />
          </button>

          {/* Presence selector */}
          <div className="relative">
            <button
              onClick={() => setPresenceMenuOpen(!presenceMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#1A1A1A] transition-colors"
              title="Set your presence"
            >
              <PresenceBadge status={presence} size="md" />
              <span className="text-xs text-[#555] hidden md:block font-[var(--font-display)] tracking-wide uppercase">
                {presenceConfig.label}
              </span>
            </button>

            {presenceMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setPresenceMenuOpen(false)} />
                <div className="absolute top-full right-0 mt-2 z-50 w-56 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-[#2A2A2A]">
                    <p className="text-xs font-bold tracking-widest uppercase font-[var(--font-display)] text-[#555] px-2 py-1">
                      Set Presence
                    </p>
                  </div>
                  {PRESENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handlePresenceChange(opt.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#242424] transition-colors",
                        presence === opt.value && "bg-[#242424]"
                      )}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <div>
                        <p className={cn("text-sm font-bold", presence === opt.value ? "text-[#FF6B35]" : "text-[#F5F5F5]")}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-[#555]">{opt.desc}</p>
                      </div>
                      {presence === opt.value && (
                        <span className="ml-auto text-[#FF6B35] text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Avatar */}
          <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1A1A1A] transition-colors">
            <div className="w-7 h-7 rounded-full bg-[#242424] border border-[#2A2A2A] flex items-center justify-center text-base">
              {profile?.avatar_emoji ?? "👤"}
            </div>
            <span className="text-xs font-bold text-[#888] font-[var(--font-display)] tracking-wide hidden md:block">
              {profile?.name ?? ""}
            </span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-52 bg-[#0F0F0F] border-r border-[#1A1A1A] flex-shrink-0">
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold tracking-wide font-[var(--font-display)] uppercase transition-all",
                    isActive
                      ? "bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/20"
                      : "text-[#555] hover:text-[#888] hover:bg-[#1A1A1A]"
                  )}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-[#1A1A1A]">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-bold tracking-wide font-[var(--font-display)] uppercase text-[#555] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile nav overlay */}
        {mobileNavOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative w-64 bg-[#0F0F0F] border-r border-[#1A1A1A] flex flex-col z-10">
              <div className="flex items-center gap-3 p-4 border-b border-[#1A1A1A]">
                <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                  <MessageSquare size={16} className="text-white" />
                </div>
                <span className="text-lg font-bold tracking-widest font-[var(--font-display)] uppercase">
                  ShiftSmart
                </span>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileNavOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold tracking-wide font-[var(--font-display)] uppercase transition-all",
                        isActive
                          ? "bg-[#FF6B35]/15 text-[#FF6B35]"
                          : "text-[#555] hover:text-[#888]"
                      )}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-3 border-t border-[#1A1A1A]">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-bold text-[#555] hover:text-[#EF4444]"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Mobile bottom bar */}
      <nav className="lg:hidden flex-shrink-0 flex border-t border-[#1A1A1A] bg-[#0F0F0F]">
        {NAV_ITEMS.slice(0, 4).map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-bold tracking-wide font-[var(--font-display)] uppercase transition-colors",
                isActive ? "text-[#FF6B35]" : "text-[#444]"
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
