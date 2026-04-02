import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/swap-requests/[id]/cover — volunteer to cover the shift
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: swap } = await supabase
    .from("swap_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!swap) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (swap.status !== "open") {
    return NextResponse.json({ error: "Request is no longer open" }, { status: 409 });
  }
  if (swap.requested_by === user.id) {
    return NextResponse.json({ error: "Cannot cover your own request" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("swap_requests")
    .update({ covered_by: user.id, status: "pending_approval" })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ swap_request: data });
}
