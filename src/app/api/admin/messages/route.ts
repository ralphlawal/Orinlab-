import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const ADMIN_PIN = process.env.ADMIN_PIN ?? "";

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

function isAuthorized(req: NextRequest): boolean {
  const email = req.headers.get("x-admin-email")?.toLowerCase() ?? "";
  const pin   = req.headers.get("x-admin-pin") ?? "";
  return (ADMIN_EMAILS.includes(email) && !!email) || (!!ADMIN_PIN && pin === ADMIN_PIN);
}

// DELETE /api/admin/messages?id=<uuid>
export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await serviceClient().from("messages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/messages?id=<uuid>  body: { content: string }
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  let content: string;
  try {
    const body = await req.json();
    content = body?.content ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!content.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

  try {
    const { error } = await serviceClient().from("messages").update({ content: content.trim() }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
