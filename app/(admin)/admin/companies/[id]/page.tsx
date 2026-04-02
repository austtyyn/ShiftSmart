"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  MessageSquare,
  Calendar,
  Trash2,
  Crown,
  ShieldCheck,
  User,
} from "lucide-react";
import { formatMessageTime, formatRelativeTime, formatShiftTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import type { Location, Profile, Membership, Message, Shift } from "@/lib/supabase/types";

interface CompanyDetail {
  location: Location;
  memberships: (Membership & { profile: Profile | null })[];
  recentMessages: (Message & { sender: { name: string | null; avatar_emoji: string | null } | null })[];
  shifts: (Shift & { profile: { name: string | null; avatar_emoji: string | null } | null })[];
}

const ROLE_ICONS = { owner: Crown, manager: ShieldCheck, crew: User };
const ROLE_COLORS = { owner: "accent" as const, manager: "warning" as const, crew: "muted" as const };

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"members" | "messages" | "shifts">("members");

  useEffect(() => {
    fetch(`/api/admin/companies/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await fetch(`/api/admin/companies/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/companies");
    }
    setIsDeleting(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl">
        <div className="h-8 w-48 bg-[#1A1A1A] rounded-lg animate-pulse mb-6" />
        <div className="h-40 bg-[#1A1A1A] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <p className="text-[#555]">Company not found.</p>
      </div>
    );
  }

  const { location, memberships, recentMessages, shifts } = data;
  const activeMembers = memberships.filter((m) => m.is_active);
  const inactiveMembers = memberships.filter((m) => !m.is_active);

  const TABS = [
    { id: "members" as const, label: "Members", count: activeMembers.length },
    { id: "messages" as const, label: "Recent Messages", count: recentMessages.length },
    { id: "shifts" as const, label: "Shifts", count: shifts.length },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Back */}
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-2 text-xs text-[#555] hover:text-[#888] transition-colors mb-6 font-[var(--font-display)] font-bold tracking-wide uppercase"
      >
        <ArrowLeft size={14} />
        All Companies
      </Link>

      {/* Header card */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#242424] border border-[#2A2A2A] rounded-2xl flex items-center justify-center">
              <Building2 size={24} className="text-[#555]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5]">
                {location.name}
              </h1>
              {location.brand && (
                <p className="text-sm text-[#555] mt-0.5">{location.brand}</p>
              )}
              <p className="text-xs text-[#444] mt-1">
                Created {formatRelativeTime(location.created_at)} · ID: <span className="font-mono">{location.id.slice(0, 8)}…</span>
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[#2A2A2A]">
          {[
            { icon: Users, label: "Active Members", value: activeMembers.length, color: "text-[#22C55E]" },
            { icon: MessageSquare, label: "Messages", value: recentMessages.length, color: "text-[#3B82F6]" },
            { icon: Calendar, label: "Shifts", value: shifts.length, color: "text-[#F59E0B]" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center">
              <Icon size={16} className={`${color} mx-auto mb-1`} />
              <p className="text-xl font-bold font-[var(--font-display)] text-[#F5F5F5]">{value}</p>
              <p className="text-[10px] text-[#444] font-[var(--font-display)] tracking-wider uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold tracking-wide font-[var(--font-display)] uppercase transition-all ${
              activeTab === tab.id
                ? "bg-[#FF6B35] text-white"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab.id ? "bg-white/20" : "bg-[#2A2A2A]"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        {activeTab === "members" && (
          <div className="divide-y divide-[#2A2A2A]">
            {activeMembers.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#444]">No active members</div>
            ) : (
              activeMembers.map((m) => {
                const RoleIcon = ROLE_ICONS[m.role];
                return (
                  <div key={m.id} className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-full bg-[#242424] border border-[#2A2A2A] flex items-center justify-center text-xl flex-shrink-0">
                      {m.profile?.avatar_emoji ?? "👤"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#F5F5F5] font-[var(--font-display)] tracking-wide">
                        {m.profile?.name ?? "Unnamed"}
                      </p>
                      <p className="text-xs text-[#555]">Joined {formatRelativeTime(m.joined_at)}</p>
                    </div>
                    <Badge variant={ROLE_COLORS[m.role]}>
                      <RoleIcon size={10} className="mr-1" />
                      {m.role}
                    </Badge>
                  </div>
                );
              })
            )}
            {inactiveMembers.length > 0 && (
              <div className="p-4">
                <p className="text-xs text-[#444] font-[var(--font-display)] tracking-widest uppercase font-bold mb-3">
                  Removed ({inactiveMembers.length})
                </p>
                {inactiveMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 py-2 opacity-40">
                    <div className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center text-base flex-shrink-0">
                      {m.profile?.avatar_emoji ?? "👤"}
                    </div>
                    <p className="text-sm text-[#555] font-[var(--font-display)] tracking-wide">
                      {m.profile?.name ?? "Former Member"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="divide-y divide-[#2A2A2A]">
            {recentMessages.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#444]">No messages</div>
            ) : (
              recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                    {msg.sender?.avatar_emoji ?? "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-[#888] font-[var(--font-display)] tracking-wide">
                        {msg.sender?.name ?? "Former Member"}
                      </span>
                      {msg.is_announcement && (
                        <Badge variant="warning">Announcement</Badge>
                      )}
                      <span className="text-[10px] text-[#444] ml-auto">
                        {formatMessageTime(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-[#F5F5F5] leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "shifts" && (
          <div className="divide-y divide-[#2A2A2A]">
            {shifts.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#444]">No shifts scheduled</div>
            ) : (
              shifts.map((shift) => (
                <div key={shift.id} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-full bg-[#242424] flex items-center justify-center text-lg flex-shrink-0">
                    {shift.profile?.avatar_emoji ?? "👤"}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#F5F5F5] font-[var(--font-display)] tracking-wide">
                      {shift.profile?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-[#555]">
                      {formatShiftTime(shift.start_time, shift.end_time)}
                    </p>
                  </div>
                  <span className="text-xs text-[#444]">
                    {formatMessageTime(shift.start_time)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete modal */}
      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Company"
        description="This action cannot be undone."
      >
        <div className="space-y-4">
          <div className="p-4 bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-xl text-sm text-[#F5F5F5]">
            Deleting <strong>{location.name}</strong> will deactivate all memberships and remove all data. Messages will be deleted.
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting…" : "Delete Company"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
