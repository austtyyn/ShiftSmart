import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createServiceClient();

  const [
    { count: totalCompanies },
    { count: totalUsers },
    { count: totalMessages },
    { count: totalShifts },
    { data: recentCompanies },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("locations").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("shifts").select("*", { count: "exact", head: true }),
    supabase
      .from("locations")
      .select("id, name, brand, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("profiles")
      .select("id, name, avatar_emoji, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return NextResponse.json({
    totals: {
      companies: totalCompanies ?? 0,
      users: totalUsers ?? 0,
      messages: totalMessages ?? 0,
      shifts: totalShifts ?? 0,
    },
    recentCompanies: recentCompanies ?? [],
    recentUsers: recentUsers ?? [],
  });
}
