import { NextResponse } from "next/server";

// Deprecated — using email/password auth now
export async function POST() {
  return NextResponse.json({ error: "Not available" }, { status: 410 });
}
