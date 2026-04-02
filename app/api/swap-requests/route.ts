import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// POST /api/swap-requests — post a shift swap request
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { location_id, shift_id, note } = await req.json();
  if (!location_id || !shift_id) {
    return NextResponse.json({ error: "location_id and shift_id required" }, { status: 400 });
  }

  const serviceSupabase = createServiceClient();

  // Get shift details
  const { data: shift } = await supabase
    .from("shifts")
    .select("*")
    .eq("id", shift_id)
    .single();

  if (!shift) return NextResponse.json({ error: "Shift not found" }, { status: 404 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const shiftDate = new Date(shift.start_time);
  const dateStr = shiftDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const startStr = new Date(shift.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endStr = new Date(shift.end_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const content = `🔁 SWAP REQUEST — ${profile?.name ?? "Someone"} needs coverage\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📅  ${dateStr} · ${startStr}–${endStr}${note ? `\n💬  "${note}"` : ""}`;

  const { data: message, error: msgError } = await serviceSupabase
    .from("messages")
    .insert({
      location_id,
      sender_id: user.id,
      content,
      message_type: "swap_request",
    })
    .select()
    .single();

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });

  const { data: swapRequest, error } = await serviceSupabase
    .from("swap_requests")
    .insert({
      location_id,
      shift_id,
      message_id: message.id,
      requested_by: user.id,
      note: note ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ swap_request: swapRequest, message });
}

// GET /api/swap-requests?location_id=xxx
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const location_id = req.nextUrl.searchParams.get("location_id");
  if (!location_id) return NextResponse.json({ error: "location_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("swap_requests")
    .select("*, shift:shifts(*)")
    .eq("location_id", location_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ swap_requests: data });
}
