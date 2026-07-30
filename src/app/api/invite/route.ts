import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { rateLimitResponse } from "@/lib/rateLimit";

const ADMIN_TO  = "ralphlawal2003@gmail.com";
const FROM      = process.env.EMAIL_FROM ?? "OrinlabÍ Records <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, 5, 60_000);
  if (limited) return limited;

  let body: { name?: string; email?: string; genre?: string; message?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { name, email, genre, message } = body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Persist to Supabase — soft fail if the table hasn't been created yet
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.from("invite_requests").insert({ name, email, genre: genre ?? null, message });
  } catch { /* table may not exist yet — emails are the reliable path */ }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Admin notification
  await resend.emails.send({
    from: FROM,
    to:   ADMIN_TO,
    replyTo: email,
    subject: `New access request — ${name}`,
    html: `
      <div style="font-family:sans-serif;background:#050505;color:#fff;padding:40px 32px;max-width:560px;margin:0 auto;border-radius:16px;border:1px solid #ffffff12;">
        <p style="color:#007bff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 24px">OrinlabÍ Records · Access Request</p>
        <h1 style="font-size:22px;font-weight:800;margin:0 0 20px;color:#fff;">New artist access application</h1>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
          <tr><td style="color:#ffffff60;padding:8px 0;border-bottom:1px solid #ffffff10;width:110px">Name</td><td style="color:#fff;padding:8px 0;border-bottom:1px solid #ffffff10;font-weight:600">${name}</td></tr>
          <tr><td style="color:#ffffff60;padding:8px 0;border-bottom:1px solid #ffffff10">Email</td><td style="color:#fff;padding:8px 0;border-bottom:1px solid #ffffff10"><a href="mailto:${email}" style="color:#007bff">${email}</a></td></tr>
          <tr><td style="color:#ffffff60;padding:8px 0;border-bottom:1px solid #ffffff10">Genre</td><td style="color:#fff;padding:8px 0;border-bottom:1px solid #ffffff10">${genre || "—"}</td></tr>
        </table>
        <p style="color:#ffffff60;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;font-weight:600">Their message</p>
        <div style="background:#ffffff08;border-left:3px solid #007bff;border-radius:4px;padding:16px 20px;color:#ffffffcc;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</div>
        <p style="color:#ffffff30;font-size:12px;margin:28px 0 0">Reply directly to this email to respond to ${name}.</p>
      </div>
    `,
  });

  // Confirmation to artist
  await resend.emails.send({
    from: FROM,
    to:   email,
    subject: "We've received your application — OrinlabÍ Records",
    html: `
      <div style="font-family:sans-serif;background:#050505;color:#fff;padding:40px 32px;max-width:560px;margin:0 auto;border-radius:16px;border:1px solid #ffffff12;">
        <p style="color:#007bff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin:0 0 24px">OrinlabÍ Records</p>
        <h1 style="font-size:24px;font-weight:800;margin:0 0 12px;color:#fff;">Application received, ${name}.</h1>
        <p style="color:#ffffff70;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Thank you for reaching out. We review every application personally — this isn't an automated filter.
          We'll get back to you at <strong style="color:#fff">${email}</strong> within 5 business days.
        </p>
        <p style="color:#ffffff70;font-size:15px;line-height:1.7;margin:0 0 32px;">
          In the meantime, feel free to explore our platform and see what's possible once you're in.
        </p>
        <a href="https://orinlabi.com" style="display:inline-block;background:#007bff;color:#fff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:50px;text-decoration:none;">
          Explore OrinlabÍ Records →
        </a>
        <p style="color:#ffffff25;font-size:12px;margin:32px 0 0;line-height:1.6;">
          OrinlabÍ Records · Global Music Distribution for Independent African Artists<br>
          <a href="https://orinlabi.com" style="color:#007bff">orinlabi.com</a>
        </p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
