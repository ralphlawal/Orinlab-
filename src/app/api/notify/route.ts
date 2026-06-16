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
    `<tr><td style="padding:9px 0;color:#999999;font-size:13px;width:130px;vertical-align:top;border-bottom:1px solid #f0f0f0;">${esc(label)}</td><td style="padding:9px 0;color:#222222;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${esc(value)}</td></tr>`;

  try {
    let subject = "";
    let html = "";

    if (type === "new-submission") {
      subject = `🎵 New application — ${esc(data.artist_name)} · ${esc(data.song_title)}`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#f0f0f0;">
          <div style="background:#050505;padding:20px 28px;border-radius:12px 12px 0 0;">
            <img src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
              alt="Orinlabí" width="110" height="30" style="display:block;border:0;" />
          </div>
          <div style="background:#007bff;height:3px;font-size:1px;line-height:1px;">&nbsp;</div>
          <div style="background:#ffffff;padding:28px;border-radius:0 0 12px 12px;">
            <p style="color:#007bff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">Admin Alert</p>
            <h2 style="margin:0 0 4px;font-size:20px;color:#111111;">New Distribution Application</h2>
            <p style="color:#888888;font-size:13px;margin:0 0 24px">Someone applied to distribute with Orinlabí.</p>
            <table style="width:100%;border-collapse:collapse;border-top:1px solid #eeeeee;">
              ${row("Artist Name", data.artist_name)}
              ${row("Song Title", data.song_title)}
              ${row("Release Type", data.release_type)}
              ${row("Genre", data.genre)}
              ${row("Email", data.email)}
              ${row("Phone", data.phone)}
              ${row("Country", data.country)}
            </table>
            <div style="margin-top:24px">
              <a href="https://orinlabi.com/admin/releases" style="background:#007bff;color:#fff;text-decoration:none;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:700;display:inline-block">
                Review in Admin Panel →
              </a>
            </div>
          </div>
        </div>`;
    } else if (type === "new-contact") {
      subject = `💬 New message — ${esc(data.name)} · ${esc(data.subject)}`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#f0f0f0;">
          <div style="background:#050505;padding:20px 28px;border-radius:12px 12px 0 0;">
            <img src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
              alt="Orinlabí" width="110" height="30" style="display:block;border:0;" />
          </div>
          <div style="background:#007bff;height:3px;font-size:1px;line-height:1px;">&nbsp;</div>
          <div style="background:#ffffff;padding:28px;border-radius:0 0 12px 12px;">
            <p style="color:#007bff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">Admin Alert</p>
            <h2 style="margin:0 0 4px;font-size:20px;color:#111111;">New Contact Message</h2>
            <p style="color:#888888;font-size:13px;margin:0 0 24px">Someone sent a message via the contact form.</p>
            <table style="width:100%;border-collapse:collapse;border-top:1px solid #eeeeee;">
              ${row("From", data.name)}
              ${row("Email", data.email)}
              ${row("Subject", data.subject)}
              ${data.inquiry_type ? row("Inquiry Type", data.inquiry_type) : ""}
            </table>
            <div style="margin-top:16px;background:#f8f8f8;border-left:3px solid #007bff;border-radius:0 8px 8px 0;padding:14px 16px;">
              <p style="color:#444444;font-size:13px;white-space:pre-wrap;margin:0;line-height:1.6">${esc(data.message)}</p>
            </div>
            <div style="margin-top:24px">
              <a href="https://orinlabi.com/admin/messages" style="background:#007bff;color:#fff;text-decoration:none;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:700;display:inline-block">
                View in Admin Panel →
              </a>
            </div>
          </div>
        </div>`;
    } else if (type === "new-asset-request") {
      const types: string[] = Array.isArray(data.asset_types) ? data.asset_types : [];
      const typeList = types.join(", ") || "—";
      subject = `🎨 Asset request — ${esc(data.email)}`;
      html = `
        <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#f0f0f0;">
          <div style="background:#050505;padding:20px 28px;border-radius:12px 12px 0 0;">
            <img src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
              alt="Orinlabí" width="110" height="30" style="display:block;border:0;" />
          </div>
          <div style="background:#007bff;height:3px;font-size:1px;line-height:1px;">&nbsp;</div>
          <div style="background:#ffffff;padding:28px;border-radius:0 0 12px 12px;">
            <p style="color:#007bff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">Admin Alert</p>
            <h2 style="margin:0 0 4px;font-size:20px;color:#111111;">New Asset Request</h2>
            <p style="color:#888888;font-size:13px;margin:0 0 24px">An artist has requested creative assets.</p>
            <table style="width:100%;border-collapse:collapse;border-top:1px solid #eeeeee;">
              ${row("Artist", data.email)}
              ${row("Assets", typeList)}
              ${data.release_title ? row("Release", data.release_title) : ""}
            </table>
            ${data.vision ? `<div style="margin-top:16px;background:#f8f8f8;border-left:3px solid #007bff;border-radius:0 8px 8px 0;padding:14px 16px;"><p style="color:#444444;font-size:13px;white-space:pre-wrap;margin:0;line-height:1.6">${esc(data.vision)}</p></div>` : ""}
            <div style="margin-top:24px">
              <a href="https://orinlabi.com/admin/assets" style="background:#007bff;color:#fff;text-decoration:none;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:700;display:inline-block">
                Review in Admin Panel →
              </a>
            </div>
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
