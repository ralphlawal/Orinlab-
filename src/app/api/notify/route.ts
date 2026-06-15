import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Orinlabí <onboarding@resend.dev>";
const ADMIN = process.env.ADMIN_EMAIL ?? "ralphlawal2003@gmail.com";

function esc(s: unknown): string {
  return String(s ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await req.json();
  const { type, data } = body;

  if (!type || !data) {
    return NextResponse.json({ error: "Missing type or data" }, { status: 400 });
  }

  const row = (label: string, value: unknown) =>
    `<tr><td style="padding:8px 0;color:#666;font-size:13px;width:130px;vertical-align:top">${esc(label)}</td><td style="padding:8px 0;color:#eee;font-size:13px">${esc(value)}</td></tr>`;

  try {
    let subject = "";
    let html = "";

    if (type === "new-submission") {
      subject = `🎵 New application — ${esc(data.artist_name)} · ${esc(data.song_title)}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#080808;color:#eee;border-radius:16px">
          <p style="color:#007bff;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">Orinlabí Admin</p>
          <h2 style="margin:0 0 4px;font-size:22px;color:#fff">New Distribution Application</h2>
          <p style="color:#666;font-size:13px;margin:0 0 28px">Someone applied to distribute with Orinlabí.</p>
          <table style="width:100%;border-collapse:collapse;border-top:1px solid #1a1a1a;padding-top:16px">
            ${row("Artist Name", data.artist_name)}
            ${row("Song Title", data.song_title)}
            ${row("Release Type", data.release_type)}
            ${row("Genre", data.genre)}
            ${row("Email", data.email)}
            ${row("Phone", data.phone)}
            ${row("Country", data.country)}
          </table>
          <div style="margin-top:28px">
            <a href="https://orinlabi.com/admin/releases" style="background:#007bff;color:#fff;text-decoration:none;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:600;display:inline-block">
              Review in Admin Panel →
            </a>
          </div>
        </div>`;
    } else if (type === "new-contact") {
      subject = `💬 New message — ${esc(data.name)} · ${esc(data.subject)}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#080808;color:#eee;border-radius:16px">
          <p style="color:#007bff;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">Orinlabí Admin</p>
          <h2 style="margin:0 0 4px;font-size:22px;color:#fff">New Contact Message</h2>
          <p style="color:#666;font-size:13px;margin:0 0 28px">Someone sent a message via the contact form.</p>
          <table style="width:100%;border-collapse:collapse;border-top:1px solid #1a1a1a;padding-top:16px">
            ${row("From", data.name)}
            ${row("Email", data.email)}
            ${row("Subject", data.subject)}
            ${data.inquiry_type ? row("Inquiry Type", data.inquiry_type) : ""}
          </table>
          <div style="margin-top:20px;background:#111;border-radius:12px;padding:16px">
            <p style="color:#aaa;font-size:13px;white-space:pre-wrap;margin:0;line-height:1.6">${esc(data.message)}</p>
          </div>
          <div style="margin-top:28px">
            <a href="https://orinlabi.com/admin/messages" style="background:#007bff;color:#fff;text-decoration:none;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:600;display:inline-block">
              View in Admin Panel →
            </a>
          </div>
        </div>`;
    } else {
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    await resend.emails.send({ from: FROM, to: ADMIN, subject, html });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Notify error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
