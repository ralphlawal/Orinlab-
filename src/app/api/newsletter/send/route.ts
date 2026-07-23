import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const FROM = process.env.EMAIL_FROM ?? "OrinlabÍ Records <onboarding@resend.dev>";

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function POST(req: NextRequest) {
  const callerEmail = req.headers.get("x-admin-email")?.toLowerCase() ?? "";
  if (!callerEmail || !ADMIN_EMAILS.includes(callerEmail)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let subject: string, body: string;
  try {
    const parsed = await req.json();
    subject = parsed.subject;
    body = parsed.body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });
  }

  const { data: subscribers, error } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .eq("active", true);

  if (error || !subscribers?.length) {
    return NextResponse.json({ error: "No active subscribers found." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const paragraphs = body
    .trim()
    .split(/\n\n+/)
    .map((para: string) =>
      `<p style="margin:0 0 16px;color:#555555;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">${esc(para.replace(/\n/g, "<br/>"))}</p>`
    )
    .join("");

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    const unsubUrl = `https://orinlabi.com/unsubscribe?email=${encodeURIComponent(sub.email)}`;
    const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><meta name="color-scheme" content="light"/><meta name="supported-color-schemes" content="light"/><title>OrinlabÍ Records</title></head>
<body style="margin:0;padding:0;background:#f0f0f0;" bgcolor="#f0f0f0">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0" style="background:#f0f0f0;padding:0;">
    <tr><td align="center" bgcolor="#f0f0f0" style="background:#f0f0f0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td bgcolor="#050505" style="background:#050505;padding:24px 32px;border-radius:16px 16px 0 0;" align="left">
            <img src="https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png"
              alt="OrinlabÍ Records" width="130" height="35" style="display:block;border:0;outline:none;" />
          </td>
        </tr>
        <tr><td bgcolor="#007bff" style="background:#007bff;height:3px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
        <tr>
          <td bgcolor="#ffffff" style="background:#ffffff;padding:36px 32px;border-radius:0 0 16px 16px;">
            ${paragraphs}
            <hr style="border:none;border-top:1px solid #eeeeee;margin:28px 0;" />
            <p style="margin:0;color:#999999;font-size:12px;font-family:Arial,sans-serif;line-height:1.6;">
              You received this because you subscribed to the OrinlabÍ Records Blog.<br/>
              <a href="${unsubUrl}" style="color:#007bff;text-decoration:none;">Unsubscribe</a>
              &nbsp;·&nbsp;
              <a href="https://orinlabi.com" style="color:#999999;text-decoration:none;">orinlabi.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td bgcolor="#f0f0f0" style="background:#f0f0f0;padding:20px 32px;text-align:center;color:#999999;font-size:12px;font-family:Arial,sans-serif;">
            ℗ 2026 OrinlabÍ Records &nbsp;·&nbsp; A Ralph Lawal Group Company
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
      await resend.emails.send({ from: FROM, to: sub.email, subject, html });
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ success: true, sent, failed });
}
