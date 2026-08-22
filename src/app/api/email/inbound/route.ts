import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function db() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

function str(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Buffer.isBuffer(v)) return v.toString("utf-8");
  if (v instanceof Uint8Array) return Buffer.from(v).toString("utf-8");
  return String(v);
}

function extractBody(obj: Record<string, unknown>): { html: string; text: string } {
  // Direct string fields — most common (Resend, SendGrid, Mailgun variants)
  let html =
    str(obj.html) ||
    str(obj.html_body) ||
    str(obj.htmlBody) ||
    str(obj.body_html) ||
    str(obj.Html) ||
    "";
  let text =
    str(obj.text) ||
    str(obj.text_body) ||
    str(obj.textBody) ||
    str(obj.body_text) ||
    str(obj.plain) ||
    str(obj.Text) ||
    "";

  // Nested { body: { html, text } }
  if (!html && !text && obj.body && typeof obj.body === "object" && !Array.isArray(obj.body)) {
    const b = obj.body as Record<string, unknown>;
    html = str(b.html) || str(b.htmlBody) || str(b.value) || "";
    text = str(b.text) || str(b.plain) || str(b.value) || "";
  }

  // Nested { payload: { html, text } } — some Resend versions
  if (!html && !text && obj.payload && typeof obj.payload === "object") {
    const p = obj.payload as Record<string, unknown>;
    html = str(p.html) || "";
    text = str(p.text) || str(p.plain) || "";
  }

  // content: [{ type: "text/html", value/body/data: "..." }]
  if (!html && !text && Array.isArray(obj.content)) {
    for (const part of obj.content as Array<Record<string, unknown>>) {
      const t = str(part.type || part.mimeType || part.contentType).toLowerCase();
      const v = str(part.value || part.body || part.data || part.content);
      if (t.includes("html")) html = html || v;
      else if (t.includes("plain") || t === "text") text = text || v;
    }
  }

  // parts: [{ mimeType: "text/html", body: "..." }]
  if (!html && !text && Array.isArray(obj.parts)) {
    for (const part of obj.parts as Array<Record<string, unknown>>) {
      const t = str(part.mimeType || part.type || part.contentType).toLowerCase();
      const v = str(part.body || part.data || part.value || part.content);
      if (t.includes("html")) html = html || v;
      else if (t.includes("plain") || t === "text") text = text || v;
    }
  }

  // attachments used as body (mimeType text/html or text/plain, no filename)
  if (!html && !text && Array.isArray(obj.attachments)) {
    for (const att of obj.attachments as Array<Record<string, unknown>>) {
      if (att.filename) continue; // real attachment, skip
      const t = str(att.mimeType || att.contentType || att.type).toLowerCase();
      const v = str(att.content || att.data || att.body || att.value);
      if (t.includes("html")) html = html || v;
      else if (t.includes("plain") || t === "text") text = text || v;
    }
  }

  return { html, text };
}

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Search "INBOUND PAYLOAD" in Vercel logs to see the full structure
  console.log("INBOUND PAYLOAD:", JSON.stringify(payload, null, 2));

  // Resend wraps fields: { type, created_at, data: { from, to, subject, html, text, ... } }
  const email = (payload.data && typeof payload.data === "object")
    ? payload.data as Record<string, unknown>
    : payload;

  const from    = str(email.from);
  const toField = email.to;
  const to      = Array.isArray(toField) ? toField.join(", ") : str(toField);
  const subject = str(email.subject) || "(no subject)";

  const { html, text } = extractBody(email);

  // Key diagnostic: tells you exactly which fields held content
  console.log(
    "INBOUND PARSED —",
    `from="${from}"`,
    `subject="${subject}"`,
    `html_chars=${html.length}`,
    `text_chars=${text.length}`,
    `keys=[${Object.keys(email).join(",")}]`,
  );

  if (!html && !text) {
    // Last-resort: log all string fields >10 chars that might be body
    const candidates = Object.entries(email)
      .filter(([, v]) => typeof v === "string" && (v as string).length > 10)
      .map(([k, v]) => `${k}(${(v as string).length})`);
    console.warn("INBOUND: no body found. String fields:", candidates.join(", "));
  }

  const messageId = str(email.message_id || email.messageId || email["message-id"] || payload.id) || crypto.randomUUID();
  const date      = str(email.date || email.created_at || payload.created_at) || new Date().toISOString();

  if (!from) {
    console.warn("INBOUND: no 'from' field in keys:", Object.keys(email));
    return NextResponse.json({ received: true, warning: "No from field" });
  }

  const { error } = await db().from("received_emails").upsert(
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
    console.error("INBOUND DB error:", error.message);
    return NextResponse.json({ error: "DB error", detail: error.message }, { status: 500 });
  }

  console.log("INBOUND saved — html:", html.length > 0 ? "yes" : "NO", "text:", text.length > 0 ? "yes" : "NO");
  return NextResponse.json({ success: true });
}
