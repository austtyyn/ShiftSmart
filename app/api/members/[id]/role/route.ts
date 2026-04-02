import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

type MembershipRow = { location_id: string | null; role: string };

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { role } = await req.json() as { role: UserRole };

    if (!role || !["manager", "crew"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: targetMembership } = await supabase
      .from("memberships")
      .select("location_id, role")
      .eq("id", id)
      .single();

    if (!targetMembership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    const target = targetMembership as unknown as MembershipRow;

    const { data: requesterMembership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id as string)
      .eq("location_id", target.location_id ?? "")
      .eq("is_active", true)
      .single();

    const requester = requesterMembership as unknown as { role: string } | null;

    if (!requester || requester.role !== "owner") {
      return NextResponse.json({ error: "Only owners can change roles" }, { status: 403 });
    }

    const { error } = await supabase
      .from("memberships")
      .update({ role })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
