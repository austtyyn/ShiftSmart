import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/handoffs/[id]/accept — incoming lead accepts the handoff
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: handoff, error: fetchError } = await supabase
    .from("handoffs")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !handoff) {
    return NextResponse.json({ error: "Handoff not found" }, { status: 404 });
  }

  if (handoff.accepted_at) {
    return NextResponse.json({ error: "Already accepted" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("handoffs")
    .update({
      accepted_at: new Date().toISOString(),
      incoming_user_id: user.id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ handoff: data });
}
