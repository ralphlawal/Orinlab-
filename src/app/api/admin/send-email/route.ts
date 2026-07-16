import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { rateLimitResponse } from "@/lib/rateLimit";

const FROM = "OrinlabÍ <info@orinlabi.com>";
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, 50, 60_000);
  if (limited) return limited;

  // Verify caller is an admin
  const callerEmail = req.headers.get("x-admin-email")?.toLowerCase() ?? "";
  if (!ADMIN_EMAILS.includes(callerEmail)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { to, subject, body, cc, replyTo } = await req.json();

  if (!to?.trim() || !subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "to, subject, and body are required." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: FROM,
    to: to.split(",").map((e: string) => e.trim()).filter(Boolean),
    ...(cc ? { cc: cc.split(",").map((e: string) => e.trim()).filter(Boolean) } : {}),
    ...(replyTo ? { replyTo } : {}),
    subject,
    html: body
      .split("\n\n")
      .map((p: string) => `<p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">${p.replace(/\n/g, "<br/>")}</p>`)
      .join(""),
  });

  if (error) {
    console.error("send-email error:", error);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  // Log to Supabase (best-effort — table may not exist yet)
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await db.from("sent_emails").insert({
    from_address: FROM,
    to_address: to,
    cc_address: cc ?? null,
    subject,
    body,
    sent_by: callerEmail,
    sent_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
