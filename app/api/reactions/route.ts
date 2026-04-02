import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/reactions — toggle a reaction (add if not exists, remove if exists)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message_id, emoji } = await req.json();
  if (!message_id || !emoji) {
    return NextResponse.json({ error: "message_id and emoji required" }, { status: 400 });
  }

  // Check if already reacted
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("message_id", message_id)
    .eq("user_id", user.id)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
    return NextResponse.json({ action: "removed" });
  } else {
    const { data, error } = await supabase
      .from("reactions")
      .insert({ message_id, user_id: user.id, emoji })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ action: "added", reaction: data });
  }
}

// GET /api/reactions?message_id=xxx — get grouped reactions for a message
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const message_id = req.nextUrl.searchParams.get("message_id");
  if (!message_id) return NextResponse.json({ error: "message_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("reactions")
    .select("emoji, user_id")
    .eq("message_id", message_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const grouped: Record<string, { count: number; user_ids: string[] }> = {};
  for (const r of data ?? []) {
    if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, user_ids: [] };
    grouped[r.emoji].count++;
    grouped[r.emoji].user_ids.push(r.user_id ?? "");
  }

  return NextResponse.json({ reactions: grouped });
}
