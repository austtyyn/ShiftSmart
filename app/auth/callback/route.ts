import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/chat";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if the user needs onboarding
      const { data: membership } = await supabase
        .from("memberships")
        .select("id")
        .eq("user_id", data.user.id as string)
        .eq("is_active", true)
        .single();

      if (!membership) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect back to login
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
