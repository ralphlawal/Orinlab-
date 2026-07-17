import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Log the full payload so we can inspect it in Vercel logs
  console.log("INBOUND EMAIL PAYLOAD:", JSON.stringify(payload, null, 2));

  // Resend wraps email data under a "data" key for webhook events:
  // { type: "email.received", data: { from, to, subject, html, text, ... } }
  // But also supports flat format. Handle both.
  const email = (payload.data && typeof payload.data === "object")
    ? payload.data as Record<string, unknown>
    : payload;

  const from      = String(email.from ?? "");
  const toField   = email.to;
  const to        = Array.isArray(toField) ? toField.join(", ") : String(toField ?? "");
  const subject   = String(email.subject ?? "(no subject)");
  const html      = String(email.html ?? "");
  const text      = String(email.text ?? "");
  const messageId = String(email.message_id ?? email.messageId ?? (payload.id ?? crypto.randomUUID()));
  const date      = String(email.date ?? email.created_at ?? payload.created_at ?? new Date().toISOString());

  if (!from) {
    console.error("INBOUND: missing 'from' field. Full payload:", payload);
    // Return 200 so Resend doesn't keep retrying with bad data
    return NextResponse.json({ received: true, warning: "No from field" });
  }

  const { error } = await db.from("received_emails").upsert(
    {
      message_id:   messageId,
      from_address: from,
      to_address:   to || "info@orinlabi.com",
      subject,
      html_body:    html || null,
      text_body:    text || null,
      received_at:  date,
    },
    { onConflict: "message_id" }
  );

  if (error) {
    console.error("received_emails insert error:", error);
    return NextResponse.json({ error: "DB error", detail: error.message }, { status: 500 });
  }

  console.log("INBOUND: stored email from", from, "subject:", subject);
  return NextResponse.json({ success: true });
}
