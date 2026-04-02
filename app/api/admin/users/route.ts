import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createServiceClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (!profiles) return NextResponse.json({ users: [] });

  // Enrich with membership info
  const users = await Promise.all(
    profiles.map(async (profile) => {
      const { data: memberships } = await supabase
        .from("memberships")
        .select("role, is_active, location:locations(name, brand)")
        .eq("user_id", profile.id)
        .order("joined_at", { ascending: false });

      return {
        ...profile,
        memberships: memberships ?? [],
      };
    })
  );

  return NextResponse.json({ users });
}
