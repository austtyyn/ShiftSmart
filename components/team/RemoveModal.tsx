"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { MemberWithProfile } from "@/lib/supabase/types";

interface RemoveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberWithProfile | null;
  onConfirm: (member: MemberWithProfile) => Promise<void>;
}

export function RemoveModal({ open, onOpenChange, member, onConfirm }: RemoveModalProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleConfirm = async () => {
    if (!member) return;
    setIsRemoving(true);
    await onConfirm(member);
    setIsRemoving(false);
    onOpenChange(false);
  };

  if (!member) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Remove Member"
    >
      <div className="space-y-5">
        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-xl">
          <AlertTriangle size={18} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[#F5F5F5] font-bold font-[var(--font-display)] tracking-wide">
              Remove {member.profile.name ?? "this member"}?
            </p>
            <p className="text-sm text-[#888] mt-1">
              They'll lose access immediately. Their past messages stay in the channel, shown as{" "}
              <span className="text-[#555] italic">"Former Team Member"</span>.
            </p>
          </div>
        </div>

        {/* Member preview */}
        <div className="flex items-center gap-3 p-3 bg-[#242424] rounded-xl">
          <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-xl">
            {member.profile.avatar_emoji ?? "👤"}
          </div>
          <div>
            <p className="font-bold text-[#F5F5F5] font-[var(--font-display)] tracking-wide">
              {member.profile.name ?? "Unknown"}
            </p>
            <p className="text-xs text-[#555] capitalize">{member.membership.role}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleConfirm}
            disabled={isRemoving}
          >
            {isRemoving ? "Removing…" : "Remove Member"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
