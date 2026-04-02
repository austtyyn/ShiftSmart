"use client";

import { useEffect, useState } from "react";
import { Users, Search, Building2, Crown, ShieldCheck, User } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Profile, Membership, Location } from "@/lib/supabase/types";

type UserWithMemberships = Profile & {
  memberships: (Pick<Membership, "role" | "is_active"> & {
    location: Pick<Location, "name" | "brand"> | null;
  })[];
};

const ROLE_ICONS = { owner: Crown, manager: ShieldCheck, crew: User };
const ROLE_COLORS = { owner: "accent" as const, manager: "warning" as const, crew: "muted" as const };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithMemberships[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "manager" | "crew">("all");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users ?? []);
        setIsLoading(false);
      });
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (u.name ?? "").toLowerCase().includes(q) ||
      (u.phone ?? "").includes(q);

    const activeMemberships = u.memberships.filter((m) => m.is_active);
    const matchesRole =
      roleFilter === "all" ||
      activeMemberships.some((m) => m.role === roleFilter);

    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5]">
          Users
        </h1>
        <p className="text-sm text-[#555] mt-1">
          {users.length} total user{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-9 pr-4 text-sm text-[#F5F5F5] placeholder:text-[#444] focus:outline-none focus:border-[#FF6B35] transition-colors"
          />
        </div>

        {/* Role filter */}
        <div className="flex gap-1 p-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl">
          {(["all", "owner", "manager", "crew"] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide font-[var(--font-display)] uppercase transition-all ${
                roleFilter === role
                  ? "bg-[#FF6B35] text-white"
                  : "text-[#555] hover:text-[#888]"
              }`}
            >
              {role === "all" ? "All" : role}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[72px] animate-pulse border-b border-[#2A2A2A] bg-[#1A1A1A]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={28} className="text-[#333] mb-3" />
            <p className="text-sm text-[#555] font-[var(--font-display)] tracking-wide uppercase font-bold">
              {search || roleFilter !== "all" ? "No matches found" : "No users yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#2A2A2A]">
            {filtered.map((user) => {
              const activeMemberships = user.memberships.filter((m) => m.is_active);
              const primaryRole = activeMemberships[0]?.role ?? "crew";
              const RoleIcon = ROLE_ICONS[primaryRole];

              return (
                <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-[#242424] transition-colors">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-[#242424] border border-[#2A2A2A] flex items-center justify-center text-2xl flex-shrink-0">
                    {user.avatar_emoji ?? "👤"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-[#F5F5F5] font-[var(--font-display)] tracking-wide">
                        {user.name ?? "Unnamed User"}
                      </p>
                      {activeMemberships.length > 0 && (
                        <Badge variant={ROLE_COLORS[primaryRole]}>
                          <RoleIcon size={9} className="mr-1" />
                          {primaryRole}
                        </Badge>
                      )}
                    </div>

                    {/* Companies */}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {activeMemberships.length === 0 ? (
                        <span className="text-xs text-[#444]">No active memberships</span>
                      ) : (
                        activeMemberships.map((m, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <Building2 size={10} className="text-[#444]" />
                            <span className="text-xs text-[#555]">
                              {m.location?.brand ? `${m.location.brand} — ` : ""}{m.location?.name ?? "Unknown"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-xs text-[#444]">{formatRelativeTime(user.created_at)}</p>
                    <p className="text-[10px] text-[#333] mt-0.5 font-mono">
                      {user.id.slice(0, 8)}…
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
