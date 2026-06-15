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

  // Welcome email — fire and forget
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: "Welcome to the Orinlabí Blog",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:560px;width:100%;">
        <tr>
          <td style="background:#007bff;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Orinlabí</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">The Blog</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#fff;font-size:22px;font-weight:700;">You're subscribed!</h2>
            <p style="margin:0 0 20px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;">
              Thanks for subscribing to the Orinlabí Blog. You'll get the latest
              music industry news, artist tips, marketing guides, and distribution
              insights delivered straight to your inbox.
            </p>
            <p style="margin:0 0 32px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;">
              In the meantime, explore our latest posts on the blog.
            </p>
            <div style="text-align:center;">
              <a href="https://orinlabi.com/blog"
                style="background:#007bff;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:14px 32px;border-radius:100px;display:inline-block;">
                Visit the Blog
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.25);font-size:12px;">
              You subscribed with ${email}. To unsubscribe, reply to this email.
            </p>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.15);font-size:11px;">
              ℗ 2026 Orinlabí · A Ralph Lawal Group Company
            </p>
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
