"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import type { MessageWithSender } from "@/lib/supabase/types";

export function useAnnouncements() {
  const supabase = createClient();
  const { membership } = useAuthStore();
  const [announcements, setAnnouncements] = useState<MessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    if (!membership?.location_id) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select(
        `*, sender:profiles(*), acknowledgements(id, user_id, acknowledged_at)`
      )
      .eq("location_id", membership.location_id)
      .eq("is_announcement", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAnnouncements(data as MessageWithSender[]);
    }
    setIsLoading(false);
  }, [membership?.location_id, supabase]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const acknowledge = async (messageId: string) => {
    if (!membership?.user_id) return { error: "Not authenticated" };

    const { error } = await supabase.from("acknowledgements").insert({
      message_id: messageId,
      user_id: membership.user_id!,
    });

    if (!error) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === messageId
            ? {
                ...a,
                acknowledgements: [
                  ...(a.acknowledgements ?? []),
                  {
                    id: crypto.randomUUID(),
                    message_id: messageId,
                    user_id: membership.user_id!,
                    acknowledged_at: new Date().toISOString(),
                  },
                ],
              }
            : a
        )
      );
    }
    return { error };
  };

  return { announcements, isLoading, refetch: fetchAnnouncements, acknowledge };
}
