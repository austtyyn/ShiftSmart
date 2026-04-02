import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// POST /api/handoffs — create a handoff card and linked message
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { location_id, incoming_user_id, shift_label, notes, crew_tonight, tasks_carried_over } =
    await req.json();

  if (!location_id) return NextResponse.json({ error: "location_id required" }, { status: 400 });

  const serviceSupabase = createServiceClient();

  // Get outgoing user profile
  const { data: outProfile } = await supabase
    .from("profiles")
    .select("name, avatar_emoji")
    .eq("id", user.id)
    .single();

  let inProfile: { name: string | null; avatar_emoji: string | null } | null = null;
  if (incoming_user_id) {
    const { data } = await supabase
      .from("profiles")
      .select("name, avatar_emoji")
      .eq("id", incoming_user_id)
      .single();
    inProfile = data;
  }

  // Build the handoff message content summary
  const noteLines = (notes as { type: string; text: string }[])
    ?.map((n) => {
      const icon = n.type === "warning" ? "⚠️" : n.type === "check" ? "✅" : "📋";
      return `${icon}  ${n.text}`;
    })
    .join("\n") ?? "";

  const crewLine =
    crew_tonight?.length > 0 ? `👥  Crew tonight: ${crew_tonight.join(", ")}` : "";
  const taskLine =
    tasks_carried_over > 0 ? `📋  ${tasks_carried_over} open task${tasks_carried_over !== 1 ? "s" : ""} carried over` : "";

  const content = [
    `🔄 SHIFT HANDOFF — ${outProfile?.name ?? "Outgoing"} → ${inProfile?.name ?? (incoming_user_id ? "Incoming" : "Next Lead")} | ${shift_label ?? ""}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    noteLines,
    taskLine,
    crewLine,
  ]
    .filter(Boolean)
    .join("\n");

  // Insert message first
  const { data: message, error: msgError } = await serviceSupabase
    .from("messages")
    .insert({
      location_id,
      sender_id: user.id,
      content,
      is_announcement: false,
      message_type: "handoff",
    })
    .select()
    .single();

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });

  // Insert handoff record
  const { data: handoff, error: handoffError } = await serviceSupabase
    .from("handoffs")
    .insert({
      location_id,
      message_id: message.id,
      outgoing_user_id: user.id,
      incoming_user_id: incoming_user_id ?? null,
      shift_label: shift_label ?? null,
      notes: notes ?? [],
      crew_tonight: crew_tonight ?? [],
      tasks_carried_over: tasks_carried_over ?? 0,
    })
    .select()
    .single();

  if (handoffError) return NextResponse.json({ error: handoffError.message }, { status: 500 });

  return NextResponse.json({ handoff, message });
}

// GET /api/handoffs?location_id=xxx — list recent handoffs
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const location_id = req.nextUrl.searchParams.get("location_id");
  if (!location_id) return NextResponse.json({ error: "location_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("handoffs")
    .select("*")
    .eq("location_id", location_id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ handoffs: data });
}
