"use client";

import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { MemberTable } from "@/components/team/MemberTable";
import { InviteModal } from "@/components/team/InviteModal";
import { RemoveModal } from "@/components/team/RemoveModal";
import { useMembers } from "@/hooks/useMembers";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { MemberWithProfile, UserRole } from "@/lib/supabase/types";

export default function TeamPage() {
  const supabase = createClient();
  const { membership } = useAuthStore();
  const { members, isLoading, refetch } = useMembers();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<MemberWithProfile | null>(null);

  const isManager =
    membership?.role === "manager" || membership?.role === "owner";

  const handleRemove = async (member: MemberWithProfile) => {
    await fetch(`/api/members/${member.membership.id}/remove`, {
      method: "PATCH",
    });
    refetch();
  };

  const handlePromote = async (member: MemberWithProfile, role: UserRole) => {
    await supabase
      .from("memberships")
      .update({ role })
      .eq("id", member.membership.id);
    refetch();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5]">
              Team
            </h1>
            <p className="text-sm text-[#555] mt-1">
              {members.length} active member{members.length !== 1 ? "s" : ""}
            </p>
          </div>

          {isManager && (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus size={16} />
              Add Member
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mb-4">
              <Users size={28} className="text-[#333]" />
            </div>
            <p className="text-[#888] font-[var(--font-display)] tracking-wide uppercase text-sm font-bold">
              No Team Members
            </p>
            {isManager && (
              <Button
                className="mt-4"
                onClick={() => setInviteOpen(true)}
              >
                <UserPlus size={16} />
                Invite First Member
              </Button>
            )}
          </div>
        ) : (
          <MemberTable
            members={members}
            currentMembership={membership}
            onRemove={(m) => setRemoveTarget(m)}
            onPromote={handlePromote}
          />
        )}
      </div>

      {/* Modals */}
      <InviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        locationId={membership?.location_id ?? null}
      />

      <RemoveModal
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        member={removeTarget}
        onConfirm={handleRemove}
      />
    </div>
  );
}
