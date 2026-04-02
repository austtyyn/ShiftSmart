"use client";

import { useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import type { MessageWithSender } from "@/lib/supabase/types";

export function useMessages() {
  const supabase = createClient();
  const { membership } = useAuthStore();
  const { setMessages, appendMessage, prependMessages, setHasMore, setLoading } =
    useChatStore();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchMessages = useCallback(
    async (before?: string) => {
      if (!membership?.location_id) return;
      setLoading(true);

      let query = supabase
        .from("messages")
        .select(
          `*, sender:profiles(*), acknowledgements(id, user_id, acknowledged_at)`
        )
        .eq("location_id", membership.location_id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (before) {
        query = query.lt("created_at", before);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Failed to fetch messages:", error);
        setLoading(false);
        return;
      }

      const messages = (data as MessageWithSender[]).reverse().map((m) => ({
        ...m,
        reactions: m.reactions ?? [],
      }));
      if (before) {
        prependMessages(messages);
      } else {
        setMessages(messages);
      }
      setHasMore(messages.length === 50);
      setLoading(false);
    },
    [membership?.location_id, supabase, setMessages, prependMessages, setHasMore, setLoading]
  );

  useEffect(() => {
    if (!membership?.location_id) return;

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${membership.location_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `location_id=eq.${membership.location_id}`,
        },
        async (payload) => {
          // Fetch full message with sender
          const { data } = await supabase
            .from("messages")
            .select(`*, sender:profiles(*), acknowledgements(id, user_id, acknowledged_at)`)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            appendMessage({ ...(data as MessageWithSender), reactions: [] });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [membership?.location_id]);

  return { fetchMessages };
}
