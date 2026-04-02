import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user is manager
    const { data: message } = await supabase
      .from("messages")
      .select("location_id")
      .eq("id", messageId)
      .single();

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id as string)
      .eq("location_id", message.location_id ?? "")
      .eq("is_active", true)
      .single();

    if (!membership || !["manager", "owner"].includes((membership as { role: string }).role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { data: acks } = await supabase
      .from("acknowledgements")
      .select(`*, profile:profiles(name, avatar_emoji)`)
      .eq("message_id", messageId)
      .order("acknowledged_at", { ascending: true });

    return NextResponse.json({ acknowledgements: acks ?? [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
