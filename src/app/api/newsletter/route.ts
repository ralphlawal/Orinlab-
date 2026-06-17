import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const { error: dbError } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: email.toLowerCase().trim() });

  if (dbError) {
    if (dbError.code === "23505") {
      return NextResponse.json({ error: "You're already subscribed." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }

  // Notify Ralph — fire and forget
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://orinlabi.com"}/api/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "newsletter-signup", data: { email } }),
  }).catch(() => {});

  // Welcome email — fire and forget
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Welcome to the Orinlabí Blog",
      html: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><meta name="color-scheme" content="light"/><meta name="supported-color-schemes" content="light"/><title>Orinlabí</title></head>
<body style="margin:0;padding:0;background:#f0f0f0;" bgcolor="#f0f0f0">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0" style="background:#f0f0f0;padding:0;">
    <tr><td align="center" bgcolor="#f0f0f0" style="background:#f0f0f0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td bgcolor="#050505" style="background:#050505;padding:24px 32px;border-radius:16px 16px 0 0;" align="left">
            <img src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
              alt="Orinlabí" width="130" height="35" style="display:block;border:0;outline:none;" />
          </td>
        </tr>
        <tr><td bgcolor="#007bff" style="background:#007bff;height:3px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
        <tr>
          <td bgcolor="#ffffff" style="background:#ffffff;padding:36px 32px;border-radius:0 0 16px 16px;">
            <span style="display:inline-block;background:#e8f0fe;color:#007bff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:999px;margin-bottom:20px;font-family:Arial,sans-serif;">Subscribed ✓</span>
            <h2 style="margin:0 0 12px;color:#111111;font-size:22px;font-weight:700;font-family:Arial,sans-serif;">You're on the list!</h2>
            <p style="margin:0 0 16px;color:#555555;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
              Thanks for subscribing to the Orinlabí Blog. You'll get the latest music industry news, artist tips, marketing guides, and distribution insights — straight to your inbox.
            </p>
            <hr style="border:none;border-top:1px solid #eeeeee;margin:24px 0;"/>
            <p style="margin:0 0 24px;color:#555555;font-size:14px;line-height:1.7;font-family:Arial,sans-serif;">
              In the meantime, explore our latest posts on the blog.
            </p>
            <a href="https://orinlabi.com/blog"
              style="display:inline-block;background:#007bff;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:14px 30px;border-radius:999px;font-family:Arial,sans-serif;">
              Visit the Blog
            </a>
          </td>
        </tr>
        <tr>
          <td bgcolor="#f0f0f0" style="background:#f0f0f0;padding:20px 32px;text-align:center;color:#999999;font-size:12px;line-height:1.6;font-family:Arial,sans-serif;">
            You subscribed with ${email}.<br/>
            <a href="https://orinlabi.com/unsubscribe?email=${encodeURIComponent(email)}" style="color:#007bff;text-decoration:none;">Unsubscribe</a>
            &nbsp;·&nbsp;
            <a href="https://orinlabi.com" style="color:#999999;text-decoration:none;">orinlabi.com</a><br/>
            ℗ 2026 Orinlabí &nbsp;·&nbsp; A Ralph Lawal Group Company
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
  } catch {
    // Email failed but subscription succeeded — don't fail the request
  }

  return NextResponse.json({ success: true });
}
