import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
const ADMIN_PIN = process.env.ADMIN_PIN ?? "";

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

function isAuthorized(req: NextRequest): boolean {
  const email = req.headers.get("x-admin-email")?.toLowerCase() ?? "";
  const pin   = req.headers.get("x-admin-pin") ?? "";
  return (ADMIN_EMAILS.includes(email) && !!email) || (!!ADMIN_PIN && pin === ADMIN_PIN);
}

// GET /api/admin/pitches — returns all pitches (admin only)
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await serviceClient()
    .from("playlist_pitches")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pitches: data ?? [] });
}

// PATCH /api/admin/pitches?id=<uuid> — update status and/or admin_notes
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const update: Record<string, unknown> = {};
  if ("status" in body) update.status = body.status;
  if ("admin_notes" in body) update.admin_notes = body.admin_notes;

  if (Object.keys(update).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const { error } = await serviceClient().from("playlist_pitches").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
