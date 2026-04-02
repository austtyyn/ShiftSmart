import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/messages/thread?parent_id=xxx — get thread replies
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parent_id = req.nextUrl.searchParams.get("parent_id");
  if (!parent_id) return NextResponse.json({ error: "parent_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:profiles(*)")
    .eq("thread_parent_id", parent_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ replies: data });
}

// POST /api/messages/thread — post a thread reply
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { parent_id, content, location_id } = await req.json();
  if (!parent_id || !content || !location_id) {
    return NextResponse.json({ error: "parent_id, content, location_id required" }, { status: 400 });
  }

  const { data: reply, error } = await supabase
    .from("messages")
    .insert({
      location_id,
      sender_id: user.id,
      content,
      thread_parent_id: parent_id,
    })
    .select("*, sender:profiles(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get current reply count and increment
  const { data: parent } = await supabase
    .from("messages")
    .select("thread_reply_count")
    .eq("id", parent_id)
    .single();
  await supabase
    .from("messages")
    .update({ thread_reply_count: (parent?.thread_reply_count ?? 0) + 1 })
    .eq("id", parent_id);

  return NextResponse.json({ reply });
}
