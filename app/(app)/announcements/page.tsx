"use client";

import { Megaphone, RefreshCw } from "lucide-react";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useMembers } from "@/hooks/useMembers";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

export default function AnnouncementsPage() {
  const { profile, membership } = useAuthStore();
  const { announcements, isLoading, acknowledge, refetch } = useAnnouncements();
  const { members } = useMembers();

  const isManager =
    membership?.role === "manager" || membership?.role === "owner";

  const unackedCount = announcements.filter(
    (a) => !(a.acknowledgements ?? []).some((ack) => ack.user_id === profile?.id)
  ).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-wide font-[var(--font-display)] uppercase text-[#F5F5F5]">
              Announcements
            </h1>
            {unackedCount > 0 && (
              <p className="text-sm text-[#F59E0B] mt-1">
                {unackedCount} unacknowledged
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Announcements */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mb-4">
              <Megaphone size={28} className="text-[#333]" />
            </div>
            <p className="text-[#888] font-[var(--font-display)] tracking-wide uppercase text-sm font-bold">
              No Announcements Yet
            </p>
            <p className="text-xs text-[#444] mt-2">
              {isManager
                ? "Post an announcement from the chat — tap the megaphone icon."
                : "Managers post announcements here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                currentUserId={profile?.id ?? ""}
                totalMembers={members.length}
                isManager={isManager}
                onAcknowledge={async (id: string) => { await acknowledge(id); }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
