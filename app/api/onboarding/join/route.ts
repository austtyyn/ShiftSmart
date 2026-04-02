import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { code, name, avatar_emoji } = await req.json();

    if (!code || !name) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate invite code
    const { data: invite, error: inviteError } = await supabase
      .from("invite_codes")
      .select("*")
      .eq("code", code)
      .is("used_by", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: "Invalid or expired invite code" },
        { status: 400 }
      );
    }

    // Upsert profile
    await supabase.from("profiles").upsert({
      id: user.id,
      name,
      avatar_emoji: avatar_emoji ?? "😊",
    });

    // Create membership
    const { error: membershipError } = await supabase
      .from("memberships")
      .insert({
        user_id: user.id,
        location_id: invite.location_id,
        role: invite.role,
        is_active: true,
      });

    if (membershipError) {
      return NextResponse.json(
        { error: "Failed to create membership" },
        { status: 500 }
      );
    }

    // Mark invite as used
    await supabase
      .from("invite_codes")
      .update({ used_by: user.id, used_at: new Date().toISOString() })
      .eq("id", invite.id);

    // Post welcome message
    await supabase.from("messages").insert({
      location_id: invite.location_id,
      sender_id: user.id,
      content: `👋 ${name} just joined the team!`,
      is_announcement: false,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
