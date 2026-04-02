import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PresenceStatus } from "@/lib/supabase/types";

// PATCH /api/presence — update own presence status
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { presence, location_id } = await req.json() as { presence: PresenceStatus; location_id: string };

  if (!presence || !location_id) {
    return NextResponse.json({ error: "presence and location_id required" }, { status: 400 });
  }

  const validStatuses: PresenceStatus[] = ["on_shift", "off_shift", "starting_soon", "unavailable"];
  if (!validStatuses.includes(presence)) {
    return NextResponse.json({ error: "Invalid presence status" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("memberships")
    .update({ presence, presence_updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("location_id", location_id)
    .eq("is_active", true)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ membership: data });
}
