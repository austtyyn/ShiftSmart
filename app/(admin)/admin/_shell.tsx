"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/companies", icon: Building2, label: "Companies" },
  { href: "/admin/users", icon: Users, label: "Users" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Verify admin status via API
      const res = await fetch("/api/admin/stats");
      if (res.status === 403) {
        router.replace("/chat");
        return;
      }

      setAdminEmail(user.email ?? null);
      setIsAuthorized(true);
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#2A2A2A] border-t-[#FF6B35] rounded-full animate-spin" />
          <p className="text-xs text-[#444] font-[var(--font-display)] tracking-widest uppercase">
            Verifying access…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0F0F0F] border-r border-[#1A1A1A] fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-5 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
              <MessageSquare size={16} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-wider font-[var(--font-display)] uppercase text-[#F5F5F5]">
              ShiftSmart
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-lg">
            <ShieldAlert size={12} className="text-[#FF6B35]" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#FF6B35] font-[var(--font-display)]">
              Super Admin
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
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

        {/* Footer */}
        <div className="p-3 border-t border-[#1A1A1A] space-y-2">
          <Link
            href="/chat"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tracking-wide font-[var(--font-display)] uppercase text-[#444] hover:text-[#888] transition-colors"
          >
            <MessageSquare size={14} />
            Back to App
          </Link>
          <div className="px-3 py-2">
            <p className="text-[10px] text-[#333] truncate">{adminEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-bold tracking-wide font-[var(--font-display)] uppercase text-[#555] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0F0F0F] border-b border-[#1A1A1A] flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#555] hover:text-[#F5F5F5]">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#FF6B35] rounded-lg flex items-center justify-center">
            <MessageSquare size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-widest font-[var(--font-display)] uppercase">
            Admin
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-lg">
          <ShieldAlert size={11} className="text-[#FF6B35]" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#FF6B35] font-[var(--font-display)]">
            Super Admin
          </span>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="relative w-60 bg-[#0F0F0F] border-r border-[#1A1A1A] flex flex-col z-10">
            <div className="p-4 border-b border-[#1A1A1A]">
              <p className="text-xs text-[#555] truncate">{adminEmail}</p>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold tracking-wide font-[var(--font-display)] uppercase transition-all",
                      isActive ? "bg-[#FF6B35]/15 text-[#FF6B35]" : "text-[#555] hover:text-[#888]"
                    )}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-60 flex-1 min-h-screen pt-0 lg:pt-0">
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
