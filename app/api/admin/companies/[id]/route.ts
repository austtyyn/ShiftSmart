import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const supabase = createServiceClient();

  const [
    { data: location },
    { data: memberships },
    { data: recentMessages },
    { data: shifts },
  ] = await Promise.all([
    supabase.from("locations").select("*").eq("id", id).single(),
    supabase
      .from("memberships")
      .select("*, profile:profiles(*)")
      .eq("location_id", id)
      .order("joined_at", { ascending: false }),
    supabase
      .from("messages")
      .select("*, sender:profiles(name, avatar_emoji)")
      .eq("location_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("shifts")
      .select("*, profile:profiles(name, avatar_emoji)")
      .eq("location_id", id)
      .order("start_time", { ascending: false })
      .limit(20),
  ]);

  if (!location) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json({
    location,
    memberships: memberships ?? [],
    recentMessages: recentMessages ?? [],
    shifts: shifts ?? [],
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const supabase = createServiceClient();

  // Cascade: deactivate all memberships first
  await supabase.from("memberships").update({ is_active: false }).eq("location_id", id);
  const { error: deleteError } = await supabase.from("locations").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
