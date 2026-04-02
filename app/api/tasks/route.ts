import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/tasks — create a task (optionally from a message)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { location_id, title, assigned_to, urgency, due_at, source_message_id } =
    await req.json();

  if (!location_id || !title) {
    return NextResponse.json({ error: "location_id and title required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      location_id,
      title,
      assigned_to: assigned_to ?? null,
      created_by: user.id,
      urgency: urgency ?? "medium",
      due_at: due_at ?? null,
      source_message_id: source_message_id ?? null,
    })
    .select("*, assigned_profile:profiles!tasks_assigned_to_fkey(*), created_profile:profiles!tasks_created_by_fkey(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}

// GET /api/tasks?location_id=xxx&user_id=xxx — list tasks
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const location_id = req.nextUrl.searchParams.get("location_id");
  const assigned_to = req.nextUrl.searchParams.get("assigned_to");
  const include_completed = req.nextUrl.searchParams.get("include_completed") === "true";

  if (!location_id) return NextResponse.json({ error: "location_id required" }, { status: 400 });

  let query = supabase
    .from("tasks")
    .select("*, assigned_profile:profiles!tasks_assigned_to_fkey(*), created_profile:profiles!tasks_created_by_fkey(*)")
    .eq("location_id", location_id)
    .order("created_at", { ascending: false });

  if (assigned_to) query = query.eq("assigned_to", assigned_to);
  if (!include_completed) query = query.is("completed_at", null);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: data });
}
