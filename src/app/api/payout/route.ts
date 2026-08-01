import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, 5, 60_000);
  if (limited) return limited;

  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { user } } = await anonClient.auth.getUser(token);
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const {
    artist_name, song_title, release_id, amount_usd,
    payout_method, bank_name, bank_account_name, bank_account_number,
    bank_country, paypal_email, mobile_money_provider, mobile_money_number,
  } = body;

  if (!release_id || amount_usd == null) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error } = await db.from("payout_requests").insert({
    email: user.email,
    artist_name: artist_name ?? "",
    song_title: song_title ?? "",
    release_id,
    amount_usd: Number(amount_usd),
    payout_method: payout_method ?? null,
    bank_name: bank_name ?? null,
    bank_account_name: bank_account_name ?? null,
    bank_account_number: bank_account_number ?? null,
    bank_country: bank_country ?? null,
    paypal_email: paypal_email ?? null,
    mobile_money_provider: mobile_money_provider ?? null,
    mobile_money_number: mobile_money_number ?? null,
    status: "pending",
  });

  if (error) {
    console.error("payout insert:", error.message);
    return NextResponse.json({ error: "Failed to submit payout request" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
