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

  const { artist_name, subject, category, description } = body;
  if (!subject || !description) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error } = await db.from("support_tickets").insert({
    email: user.email,
    artist_name: artist_name ?? "",
    subject: String(subject).trim(),
    category: category ?? "Other",
    description: String(description).trim(),
    status: "open",
  });

  if (error) {
    console.error("support ticket insert:", error.message);
    return NextResponse.json({ error: "Failed to submit ticket" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
