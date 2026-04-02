import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !process.env.ADMIN_EMAIL) {
    return NextResponse.json({ isAdmin: false });
  }

  return NextResponse.json({ isAdmin: user.email === process.env.ADMIN_EMAIL });
}
