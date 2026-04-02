import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createServiceClient();

  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .order("created_at", { ascending: false });

  if (!locations) return NextResponse.json({ companies: [] });

  // For each location, get member count and message count
  const companies = await Promise.all(
    locations.map(async (loc) => {
      const [{ count: memberCount }, { count: messageCount }, { count: shiftCount }] =
        await Promise.all([
          supabase
            .from("memberships")
            .select("*", { count: "exact", head: true })
            .eq("location_id", loc.id)
            .eq("is_active", true),
          supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("location_id", loc.id),
          supabase
            .from("shifts")
            .select("*", { count: "exact", head: true })
            .eq("location_id", loc.id),
        ]);

      return {
        ...loc,
        member_count: memberCount ?? 0,
        message_count: messageCount ?? 0,
        shift_count: shiftCount ?? 0,
      };
    })
  );

  return NextResponse.json({ companies });
}
