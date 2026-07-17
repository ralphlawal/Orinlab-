import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function str(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return String(v);
}

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Full payload log — search "INBOUND PAYLOAD" in Vercel logs to see structure
  console.log("INBOUND PAYLOAD:", JSON.stringify(payload, null, 2));

  // Resend wraps fields under data: { type, created_at, data: { from, to, ... } }
  const email = (payload.data && typeof payload.data === "object")
    ? payload.data as Record<string, unknown>
    : payload;

  console.log("INBOUND EMAIL OBJECT:", JSON.stringify(email, null, 2));

  const from = str(email.from);
  const toField = email.to;
  const to = Array.isArray(toField) ? toField.join(", ") : str(toField);
  const subject = str(email.subject) || "(no subject)";

  // Log all available keys for debugging
  console.log("INBOUND EMAIL KEYS:", Object.keys(email));

  // Try every field name Resend might use for body content
  let html = str(email.html) || str(email.html_body) || str(email.htmlBody) || str(email.body_html) || "";
  let text = str(email.text) || str(email.text_body) || str(email.textBody) || str(email.body_text) || str(email.body) || "";

  // Nested body object: { body: { html, text } }
  if (!html && !text && email.body && typeof email.body === "object" && !Array.isArray(email.body)) {
    const b = email.body as Record<string, unknown>;
    html = str(b.html) || str(b.htmlBody) || "";
    text = str(b.text) || str(b.plain) || str(b.value) || "";
  }

  // Content array: [{ type: "text/html", value: "..." }, { type: "text/plain", value: "..." }]
  if (!html && !text && Array.isArray(email.content)) {
    for (const part of email.content as Array<Record<string, unknown>>) {
      const t = str(part.type || part.mimeType || part.contentType).toLowerCase();
      const v = str(part.value || part.body || part.data || part.content);
      if (t.includes("html")) html = v;
      else if (t.includes("plain") || t === "text") text = v;
    }
  }

  // Parts array: [{ mimeType: "text/html", body: "..." }, ...]
  if (!html && !text && Array.isArray(email.parts)) {
    for (const part of email.parts as Array<Record<string, unknown>>) {
      const t = str(part.mimeType || part.type || part.contentType).toLowerCase();
      const v = str(part.body || part.data || part.value || part.content);
      if (t.includes("html")) html = v;
      else if (t.includes("plain") || t === "text") text = v;
    }
  }

  const messageId = str(email.message_id || email.messageId || email["message-id"] || payload.id) || crypto.randomUUID();
  const date = str(email.date || email.created_at || payload.created_at) || new Date().toISOString();

  if (!from) {
    console.warn("INBOUND: no 'from' field. email keys:", Object.keys(email));
    return NextResponse.json({ received: true, warning: "No from field" });
  }

  console.log("INBOUND: from=", from, "subject=", subject, "html length=", html.length, "text length=", text.length);

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
    console.error("INBOUND DB error:", error.message, "code:", error.code);
    return NextResponse.json({ error: "DB error", detail: error.message }, { status: 500 });
  }

  console.log("INBOUND: saved. from=", from, "html=", html.length > 0 ? "yes" : "no", "text=", text.length > 0 ? "yes" : "no");
  return NextResponse.json({ success: true });
}
