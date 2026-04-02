import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user_id, start_time, end_time } = await req.json();

  if (!user_id || !start_time || !end_time) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify the caller has a manager/owner membership for the shift's location
  const { data: callerMembership } = await supabase
    .from("memberships")
    .select("location_id, role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .in("role", ["manager", "owner"])
    .single();

  if (!callerMembership) {
    return NextResponse.json(
      { error: "Only managers and owners can add shifts" },
      { status: 403 }
    );
  }

  // Use the service client to insert, bypassing RLS
  const service = createServiceClient();

  const { data: shift, error } = await service
    .from("shifts")
    .insert({
      user_id,
      location_id: callerMembership.location_id,
      start_time,
      end_time,
      created_by: user.id,
    })
    .select(`*, profile:profiles!shifts_user_id_fkey(*)`)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ shift });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing shift id" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service.from("shifts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
