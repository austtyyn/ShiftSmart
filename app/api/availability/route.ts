import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/availability?location_id=xxx&user_id=xxx
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const location_id = req.nextUrl.searchParams.get("location_id");
  const user_id = req.nextUrl.searchParams.get("user_id") ?? user.id;

  if (!location_id) return NextResponse.json({ error: "location_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("availability")
    .select("*")
    .eq("location_id", location_id)
    .eq("user_id", user_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ availability: data });
}

// POST /api/availability — add an availability rule
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { location_id, type, day_of_week, start_time, end_time, start_date, end_date, note } = body;

  if (!location_id || !type) {
    return NextResponse.json({ error: "location_id and type required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("availability")
    .insert({
      user_id: user.id,
      location_id,
      type,
      day_of_week: day_of_week ?? null,
      start_time: start_time ?? null,
      end_time: end_time ?? null,
      start_date: start_date ?? null,
      end_date: end_date ?? null,
      note: note ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ availability: data });
}

// DELETE /api/availability?id=xxx
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("availability")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
