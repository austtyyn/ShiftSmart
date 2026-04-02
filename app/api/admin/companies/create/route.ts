import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/utils";
import type { UserRole } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const { name, brand, invite_role = "owner" } = await req.json() as {
    name: string;
    brand?: string;
    invite_role?: UserRole;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Create the location
  const { data: location, error: locationError } = await supabase
    .from("locations")
    .insert({
      name: name.trim(),
      brand: brand?.trim() || null,
      owner_id: user!.id,
    })
    .select()
    .single();

  if (locationError) {
    return NextResponse.json({ error: locationError.message }, { status: 500 });
  }

  // Generate a unique invite code
  let code = generateInviteCode();
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase
      .from("invite_codes")
      .select("id")
      .eq("code", code)
      .single();
    if (!existing) break;
    code = generateInviteCode();
  }

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  const { data: invite, error: inviteError } = await supabase
    .from("invite_codes")
    .insert({
      code,
      location_id: location.id,
      created_by: user!.id,
      role: invite_role,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (inviteError) {
    // Company was created — still return it, just without a code
    return NextResponse.json({ location, invite: null });
  }

  return NextResponse.json({ location, invite });
}
