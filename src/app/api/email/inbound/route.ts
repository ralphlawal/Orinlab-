import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Resend inbound webhook — fires whenever an email arrives at info@orinlabi.com
export async function POST(req: NextRequest) {
  // Optional secret check: set INBOUND_WEBHOOK_SECRET in Vercel env vars
  // and add ?secret=xxx to the webhook URL in the Resend dashboard
  const secret = process.env.INBOUND_WEBHOOK_SECRET;
  if (secret) {
    const qs = req.nextUrl.searchParams.get("secret");
    if (qs !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Resend inbound sends the email fields at the top level
  const from       = String(payload.from ?? "");
  const toField    = payload.to;
  const to         = Array.isArray(toField) ? toField.join(", ") : String(toField ?? "");
  const subject    = String(payload.subject ?? "(no subject)");
  const html       = String(payload.html ?? "");
  const text       = String(payload.text ?? "");
  const messageId  = String(payload.message_id ?? payload.messageId ?? crypto.randomUUID());
  const date       = String(payload.date ?? new Date().toISOString());

  if (!from) {
    return NextResponse.json({ error: "Missing from" }, { status: 400 });
  }

  const { error } = await db.from("received_emails").upsert(
    {
      message_id:   messageId,
      from_address: from,
      to_address:   to,
      subject,
      html_body:    html,
      text_body:    text,
      received_at:  date,
    },
    { onConflict: "message_id" }
  );

  if (error) {
    console.error("received_emails insert:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
