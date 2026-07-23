import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimitResponse } from "@/lib/rateLimit";

const FROM  = process.env.EMAIL_FROM ?? "OrinlabÍ <onboarding@resend.dev>";
const ADMIN = process.env.ADMIN_EMAIL ?? "ralphlawal2003@gmail.com";

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, 20, 60_000);
  if (limited) return limited;

  let releaseId: string, email: string, artistName: string, songTitle: string;
  try {
    const b = await req.json();
    releaseId = b.releaseId; email = b.email; artistName = b.artistName; songTitle = b.songTitle;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!releaseId || !email) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Notify admin
    await resend.emails.send({
      from: FROM,
      to: ADMIN,
      subject: `Pre-save signup — ${artistName ?? "Unknown"} · ${songTitle ?? releaseId}`,
      html: `<p style="font-family:Arial,sans-serif;color:#ffffff;background:#111;padding:24px;border-radius:10px;">
        <strong style="color:#1db954;">New pre-save signup</strong><br/><br/>
        <b>Email:</b> ${email}<br/>
        <b>Release:</b> ${songTitle ?? "—"} by ${artistName ?? "—"}<br/>
        <b>Release ID:</b> ${releaseId}
      </p>`,
    });

    // Confirmation to fan
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `You're on the list — ${songTitle ?? "this release"} drops soon`,
      html: `<p style="font-family:Arial,sans-serif;color:#ffffff;background:#111;padding:24px;border-radius:10px;">
        <strong style="color:#1db954;">You're on the list!</strong><br/><br/>
        We'll send you a notification the moment <b>${songTitle ?? "this release"}</b>${artistName ? ` by <b>${artistName}</b>` : ""} goes live on streaming platforms.<br/><br/>
        <span style="color:#666;">— The OrinlabÍ team</span>
      </p>`,
    });
  } catch (err) {
    console.error("Presave email error:", err);
    return NextResponse.json({ error: "Failed to send confirmation emails" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
