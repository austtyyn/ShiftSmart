import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type InviteWithLocation = {
  id: string;
  code: string;
  location_id: string | null;
  location: { name: string; brand: string | null } | null;
};

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: invite, error } = await supabase
      .from("invite_codes")
      .select(`id, code, location_id, location:locations(name, brand)`)
      .eq("code", code)
      .is("used_by", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !invite) {
      return NextResponse.json(
        { error: "Invalid or expired invite code" },
        { status: 400 }
      );
    }

    const typedInvite = invite as unknown as InviteWithLocation;
    const location = typedInvite.location;
    const locationName = location
      ? location.brand
        ? `${location.brand} — ${location.name}`
        : location.name
      : "the team";

    return NextResponse.json({ valid: true, location_name: locationName });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
