import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type MembershipRow = { location_id: string | null; role: string; user_id: string | null };

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch the target membership
    const { data: targetMembership } = await supabase
      .from("memberships")
      .select("location_id, role, user_id")
      .eq("id", id)
      .single();

    if (!targetMembership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    const target = targetMembership as unknown as MembershipRow;

    // Check requester is manager/owner of same location
    const { data: requesterMembership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id as string)
      .eq("location_id", target.location_id ?? "")
      .eq("is_active", true)
      .single();

    const requester = requesterMembership as unknown as { role: string } | null;

    if (!requester || !["manager", "owner"].includes(requester.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Can't remove owners
    if (target.role === "owner") {
      return NextResponse.json({ error: "Cannot remove the owner" }, { status: 403 });
    }

    // Soft delete
    const { error } = await supabase
      .from("memberships")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
