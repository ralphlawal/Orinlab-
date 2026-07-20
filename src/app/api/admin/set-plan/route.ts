import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

// POST /api/admin/set-plan
// body: { email, plan, plan_status }
// header: x-admin-email
export async function POST(req: NextRequest) {
  const callerEmail = req.headers.get("x-admin-email")?.toLowerCase() ?? "";
  if (!callerEmail || !ADMIN_EMAILS.includes(callerEmail)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let email: string, plan: string | null, plan_status: string;
  try {
    const body = await req.json();
    email       = body.email?.trim() ?? "";
    plan        = body.plan ?? null;
    plan_status = body.plan_status ?? "active";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  try {
    const { error } = await serviceClient().from("artist_profiles").upsert(
      { email, plan, plan_status },
      { onConflict: "email" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
