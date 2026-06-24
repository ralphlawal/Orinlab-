import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_PIN = process.env.ADMIN_PIN ?? "";

export async function POST(req: NextRequest) {
  const { pin, type } = await req.json();

  if (!ADMIN_PIN || pin !== ADMIN_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const origin = req.headers.get("origin") || "https://orinlabi.com";
  const sent: string[] = [];
  const failed: { email: string; reason: string }[] = [];

  if (!type || type === "artists") {
    const { data: artists } = await supabase
      .from("artist_profiles")
      .select("email")
      .not("email", "is", null);

    for (const a of artists ?? []) {
      if (!a.email) continue;
      const { error } = await supabase.auth.resetPasswordForEmail(a.email, {
        redirectTo: `${origin}/portal/set-password`,
      });
      if (error) failed.push({ email: a.email, reason: error.message });
      else sent.push(a.email);
      // small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  if (!type || type === "labels") {
    const { data: labels } = await supabase
      .from("label_profiles")
      .select("email")
      .not("email", "is", null);

    for (const l of labels ?? []) {
      if (!l.email) continue;
      const { error } = await supabase.auth.resetPasswordForEmail(l.email, {
        redirectTo: `${origin}/labels/portal/set-password`,
      });
      if (error) failed.push({ email: l.email, reason: error.message });
      else sent.push(l.email);
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  return NextResponse.json({ sent: sent.length, failed, total: sent.length + failed.length });
}
