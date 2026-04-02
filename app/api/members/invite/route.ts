import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { location_id, role = "crew" } = await req.json();

    if (!location_id) {
      return NextResponse.json({ error: "location_id is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify user is a manager/owner of this location
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("location_id", location_id)
      .eq("is_active", true)
      .single();

    if (!membership || !["manager", "owner"].includes(membership.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Generate unique code
    let code = generateInviteCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("invite_codes")
        .select("id")
        .eq("code", code)
        .single();
      if (!existing) break;
      code = generateInviteCode();
      attempts++;
    }

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data: invite, error } = await supabase
      .from("invite_codes")
      .insert({
        code,
        location_id,
        created_by: user.id,
        role,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
    }

    return NextResponse.json({ code: invite.code, expires_at: invite.expires_at });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
