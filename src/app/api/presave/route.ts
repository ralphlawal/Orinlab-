import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, 20, 60_000);
  if (limited) return limited;

  const { releaseId, email, name } = await req.json();

  if (!releaseId || !email) {
    return NextResponse.json({ error: "Missing releaseId or email." }, { status: 400 });
  }

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase.from("presave_signups").upsert(
    {
      release_id: releaseId,
      email: email.trim().toLowerCase(),
      name: name?.trim() || null,
      signed_up_at: new Date().toISOString(),
    },
    { onConflict: "release_id,email" }
  );

  if (error) {
    console.error("presave_signups insert:", error);
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
