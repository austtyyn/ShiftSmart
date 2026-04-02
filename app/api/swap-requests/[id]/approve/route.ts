import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// POST /api/swap-requests/[id]/approve — manager approves, shifts reassigned
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
    .select("*, shift:shifts(*)")
    .eq("id", id)
    .single();

  if (!swap) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (swap.status !== "pending_approval") {
    return NextResponse.json({ error: "No volunteer to approve" }, { status: 409 });
  }
  if (!swap.covered_by) {
    return NextResponse.json({ error: "No volunteer yet" }, { status: 400 });
  }

  // Verify manager role
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("location_id", swap.location_id ?? "")
    .eq("is_active", true)
    .single();

  if (!membership || !["manager", "owner"].includes(membership.role)) {
    return NextResponse.json({ error: "Manager role required" }, { status: 403 });
  }

  const serviceSupabase = createServiceClient();

  // Reassign the shift to the covering user
  await serviceSupabase
    .from("shifts")
    .update({ user_id: swap.covered_by })
    .eq("id", swap.shift_id ?? "");

  // Update swap request
  const { data, error } = await serviceSupabase
    .from("swap_requests")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ swap_request: data });
}
