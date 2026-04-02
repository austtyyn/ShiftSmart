"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users, MessageSquare, Calendar, ArrowUpRight, Clock, Plus } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Stats {
  totals: {
    companies: number;
    users: number;
    messages: number;
    shifts: number;
  };
  recentCompanies: { id: string; name: string; brand: string | null; created_at: string }[];
  recentUsers: { id: string; name: string | null; avatar_emoji: string | null; created_at: string }[];
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] rounded-2xl p-5 transition-all hover:bg-[#1F1F1F]">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <ArrowUpRight size={16} className="text-[#333] group-hover:text-[#555] transition-colors" />
      </div>
      <p className="text-3xl font-bold font-[var(--font-display)] tracking-wide text-[#F5F5F5]">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-[#555] font-bold tracking-widest uppercase font-[var(--font-display)] mt-1">
        {label}
      </p>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5]">
          Dashboard
        </h1>
        <p className="text-sm text-[#555] mt-1">Platform-wide overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Building2}
          label="Companies"
          value={stats.totals.companies}
          color="bg-[#FF6B35]/15 text-[#FF6B35]"
          href="/admin/companies"
        />
        <StatCard
          icon={Users}
          label="Users"
          value={stats.totals.users}
          color="bg-[#22C55E]/15 text-[#22C55E]"
          href="/admin/users"
        />
        <StatCard
          icon={MessageSquare}
          label="Messages"
          value={stats.totals.messages}
          color="bg-[#3B82F6]/15 text-[#3B82F6]"
          href="/admin/companies"
        />
        <StatCard
          icon={Calendar}
          label="Shifts"
          value={stats.totals.shifts}
          color="bg-[#F59E0B]/15 text-[#F59E0B]"
          href="/admin/companies"
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent companies */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#888] font-[var(--font-display)]">
              Recent Companies
            </h2>
            <Link href="/admin/companies" className="text-xs text-[#FF6B35] hover:text-[#FF8555] font-[var(--font-display)] font-bold tracking-wide uppercase">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#2A2A2A]">
            {stats.recentCompanies.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-[#444] mb-3">No companies yet</p>
                <Link href="/admin/companies" className="inline-flex items-center gap-1.5 text-xs text-[#FF6B35] hover:text-[#FF8555] font-bold font-[var(--font-display)] tracking-wide uppercase transition-colors">
                  <Plus size={12} />
                  Create one →
                </Link>
              </div>
            ) : (
              stats.recentCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/admin/companies/${company.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-[#242424] transition-colors group"
                >
                  <div className="w-9 h-9 bg-[#242424] rounded-xl flex items-center justify-center flex-shrink-0 border border-[#2A2A2A] group-hover:border-[#FF6B35]/30 transition-colors">
                    <Building2 size={16} className="text-[#555]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#F5F5F5] font-[var(--font-display)] tracking-wide truncate">
                      {company.brand ? `${company.brand} — ` : ""}{company.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="text-[#444]" />
                      <p className="text-xs text-[#555]">{formatRelativeTime(company.created_at)}</p>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-[#333] group-hover:text-[#FF6B35] flex-shrink-0 transition-colors" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#888] font-[var(--font-display)]">
              Recent Users
            </h2>
            <Link href="/admin/users" className="text-xs text-[#FF6B35] hover:text-[#FF8555] font-[var(--font-display)] font-bold tracking-wide uppercase">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[#2A2A2A]">
            {stats.recentUsers.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#444]">No users yet</div>
            ) : (
              stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 bg-[#242424] rounded-full flex items-center justify-center text-lg flex-shrink-0">
                    {user.avatar_emoji ?? "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#F5F5F5] font-[var(--font-display)] tracking-wide truncate">
                      {user.name ?? "Unnamed User"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="text-[#444]" />
                      <p className="text-xs text-[#555]">{formatRelativeTime(user.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
