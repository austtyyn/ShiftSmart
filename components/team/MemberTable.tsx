"use client";

import { useState } from "react";
import { MoreVertical, ArrowUpDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { MemberWithProfile, UserRole } from "@/lib/supabase/types";

interface MemberTableProps {
  members: MemberWithProfile[];
  currentMembership: { role: UserRole; user_id: string | null } | null;
  onRemove: (member: MemberWithProfile) => void;
  onPromote: (member: MemberWithProfile, role: UserRole) => void;
}

type SortField = "name" | "role" | "joined";

export function MemberTable({
  members,
  currentMembership,
  onRemove,
  onPromote,
}: MemberTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const isManagerOrOwner =
    currentMembership?.role === "manager" ||
    currentMembership?.role === "owner";

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sorted = [...members].sort((a, b) => {
    let aVal: string, bVal: string;
    if (sortField === "name") {
      aVal = a.profile.name ?? "";
      bVal = b.profile.name ?? "";
    } else if (sortField === "role") {
      const roleOrder = { owner: 0, manager: 1, crew: 2 };
      aVal = String(roleOrder[a.membership.role]);
      bVal = String(roleOrder[b.membership.role]);
    } else {
      aVal = a.membership.joined_at;
      bVal = b.membership.joined_at;
    }
    return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-bold tracking-widest uppercase text-[#555] hover:text-[#888] transition-colors font-[var(--font-display)]"
    >
      {label}
      <ArrowUpDown size={10} className={sortField === field ? "text-[#FF6B35]" : ""} />
    </button>
  );

  const RoleBadge = ({ role }: { role: UserRole }) => {
    if (role === "owner") return <Badge variant="accent">Owner</Badge>;
    if (role === "manager") return <Badge variant="warning">Manager</Badge>;
    return <Badge variant="muted">Crew</Badge>;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[#2A2A2A]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2A2A2A] bg-[#1A1A1A]">
            <th className="text-left p-4">
              <SortButton field="name" label="Member" />
            </th>
            <th className="text-left p-4 hidden sm:table-cell">
              <SortButton field="role" label="Role" />
            </th>
            <th className="text-left p-4 hidden md:table-cell">
              <SortButton field="joined" label="Joined" />
            </th>
            <th className="text-left p-4 hidden lg:table-cell">
              <span className="text-xs font-bold tracking-widest uppercase text-[#555] font-[var(--font-display)]">
                Phone
              </span>
            </th>
            {isManagerOrOwner && <th className="p-4 w-12" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((member) => {
            const isSelf = member.membership.user_id === currentMembership?.user_id;
            const canManage = isManagerOrOwner && !isSelf && member.membership.role !== "owner";

            return (
              <tr
                key={member.membership.id}
                className="border-b border-[#2A2A2A] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#242424] flex items-center justify-center text-xl flex-shrink-0 border border-[#2A2A2A]">
                      {member.profile.avatar_emoji ?? "👤"}
                    </div>
                    <div>
                      <p className="font-bold text-[#F5F5F5] font-[var(--font-display)] tracking-wide text-base">
                        {member.profile.name ?? "Unknown"}
                        {isSelf && (
                          <span className="ml-2 text-xs text-[#555] font-normal">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-[#555] sm:hidden">
                        <RoleBadge role={member.membership.role} />
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden sm:table-cell">
                  <RoleBadge role={member.membership.role} />
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="text-sm text-[#888]">
                    {formatRelativeTime(member.membership.joined_at)}
                  </span>
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <span className="text-sm text-[#888]">
                    {member.profile.phone ?? "—"}
                  </span>
                </td>
                {isManagerOrOwner && (
                  <td className="p-4">
                    {canManage && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="p-2 rounded-lg text-[#555] hover:text-[#888] hover:bg-[#242424] transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-1.5 shadow-2xl z-50 min-w-[160px]"
                            align="end"
                          >
                            {member.membership.role === "crew" && (
                              <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-[#F5F5F5] rounded-lg cursor-pointer hover:bg-[#242424] outline-none"
                                onClick={() => onPromote(member, "manager")}
                              >
                                Promote to Manager
                              </DropdownMenu.Item>
                            )}
                            {member.membership.role === "manager" && currentMembership?.role === "owner" && (
                              <DropdownMenu.Item
                                className="flex items-center gap-2 px-3 py-2 text-sm text-[#F5F5F5] rounded-lg cursor-pointer hover:bg-[#242424] outline-none"
                                onClick={() => onPromote(member, "crew")}
                              >
                                Demote to Crew
                              </DropdownMenu.Item>
                            )}
                            <DropdownMenu.Separator className="my-1 h-px bg-[#2A2A2A]" />
                            <DropdownMenu.Item
                              className="flex items-center gap-2 px-3 py-2 text-sm text-[#EF4444] rounded-lg cursor-pointer hover:bg-[#EF4444]/10 outline-none"
                              onClick={() => onRemove(member)}
                            >
                              Remove Member
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
