import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FROM   = process.env.EMAIL_FROM  ?? "Orinlabí <onboarding@resend.dev>";
const ADMIN  = process.env.ADMIN_EMAIL ?? "ralphlawal2003@gmail.com";
const LOGO   = "https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png";

function esc(s: unknown): string {
  return String(s ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Shared row helper */
function row(label: string, value: unknown) {
  return `
  <tr>
    <td style="padding:10px 0;color:#999999;font-size:13px;width:130px;vertical-align:top;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;">${esc(label)}</td>
    <td style="padding:10px 0;color:#111111;font-size:13px;font-weight:700;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;">${esc(value)}</td>
  </tr>`;
}

/* Quote block for message body */
function quote(text: string) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td width="3" bgcolor="#007bff" style="background:#007bff;border-radius:3px;">&nbsp;</td>
      <td width="12">&nbsp;</td>
      <td style="padding:12px 0;color:#444444;font-size:13px;line-height:1.7;font-family:Arial,sans-serif;white-space:pre-wrap;">${esc(text)}</td>
    </tr>
  </table>`;
}

/* CTA button */
function btn(label: string, url: string, color = "#007bff") {
  return `
  <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
    <tr>
      <td bgcolor="${color}" style="background:${color};border-radius:100px;">
        <a href="${url}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:0.2px;">${esc(label)} &rarr;</a>
      </td>
    </tr>
  </table>`;
}

/* Full email wrapper */
function wrap(accentColor: string, badge: string, heading: string, subheading: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>Orinlabí</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;" bgcolor="#f0f0f0">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0" style="background:#f0f0f0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo header -->
          <tr>
            <td bgcolor="#050505" style="background:#050505;padding:24px 32px;border-radius:14px 14px 0 0;" align="left">
              <img src="${LOGO}" alt="Orinlabí" width="120" height="33"
                style="display:block;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>

          <!-- Accent line -->
          <tr>
            <td bgcolor="${accentColor}" style="background:${accentColor};height:3px;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>

          <!-- White card -->
          <tr>
            <td bgcolor="#ffffff" style="background:#ffffff;padding:32px 32px 36px;border-radius:0 0 14px 14px;">

              <!-- Badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                <tr>
                  <td bgcolor="#f0f4ff" style="background:#f0f4ff;border-radius:100px;padding:5px 14px;">
                    <span style="color:${accentColor};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif;">${esc(badge)}</span>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h2 style="margin:0 0 6px;color:#0a0a0a;font-size:22px;font-weight:800;line-height:1.3;font-family:Arial,sans-serif;">${esc(heading)}</h2>
              <p style="margin:0 0 24px;color:#888888;font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">${esc(subheading)}</p>

              <!-- Dynamic body -->
              ${body}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f0f0f0" style="background:#f0f0f0;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#aaaaaa;font-size:12px;line-height:1.6;font-family:Arial,sans-serif;">
                ℗ 2026 Orinlabí &nbsp;·&nbsp; A Ralph Lawal Group Company<br/>
                <a href="https://orinlabi.com" style="color:#007bff;text-decoration:none;">orinlabi.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await req.json();
  const { type, data } = body;

  if (!type || !data) {
    return NextResponse.json({ error: "Missing type or data" }, { status: 400 });
  }

  try {
    let subject = "";
    let html    = "";

    if (type === "new-submission") {
      subject = `New application — ${esc(data.artist_name)} · ${esc(data.song_title)}`;
      html = wrap(
        "#007bff",
        "Admin Alert",
        "New Distribution Application",
        "An artist just applied to distribute with Orinlabí.",
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eeeeee;">
          ${row("Artist Name",   data.artist_name)}
          ${row("Song Title",    data.song_title)}
          ${row("Release Type",  data.release_type)}
          ${row("Genre",         data.genre)}
          ${row("Email",         data.email)}
          ${row("Phone",         data.phone)}
          ${row("Country",       data.country)}
        </table>
        ${btn("Review in Admin Panel", "https://orinlabi.com/admin/releases")}`
      );

    } else if (type === "new-contact") {
      subject = `New message — ${esc(data.name)} · ${esc(data.subject)}`;
      html = wrap(
        "#007bff",
        "Admin Alert",
        "New Contact Message",
        "Someone sent a message via the contact form.",
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eeeeee;">
          ${row("From",         data.name)}
          ${row("Email",        data.email)}
          ${row("Subject",      data.subject)}
          ${data.inquiry_type ? row("Inquiry Type", data.inquiry_type) : ""}
        </table>
        ${data.message ? quote(data.message) : ""}
        ${btn("View in Admin Panel", "https://orinlabi.com/admin/messages")}`
      );

    } else if (type === "new-asset-request") {
      const types: string[] = Array.isArray(data.asset_types) ? data.asset_types : [];
      subject = `Asset request — ${esc(data.email)}`;
      html = wrap(
        "#7c3aed",
        "Asset Request",
        "New Creative Asset Request",
        "An artist is requesting design work.",
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eeeeee;">
          ${row("Artist",  data.email)}
          ${row("Assets",  types.join(", ") || "—")}
          ${data.release_title ? row("Release", data.release_title) : ""}
        </table>
        ${data.vision ? quote(data.vision) : ""}
        ${btn("Review in Admin Panel", "https://orinlabi.com/admin/assets", "#7c3aed")}`
      );

    } else if (type === "takedown-request") {
      subject = `Takedown request — ${esc(data.artist_name)} · ${esc(data.song_title)}`;
      html = wrap(
        "#ef4444",
        "Action Required",
        "Takedown Request",
        "An artist has requested their release be removed from all streaming platforms.",
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eeeeee;">
          ${row("Artist",     data.artist_name)}
          ${row("Release",    data.song_title)}
          ${row("Type",       data.release_type)}
          ${row("Release ID", data.release_id)}
        </table>
        ${btn("View in Admin Panel", "https://orinlabi.com/admin/releases", "#ef4444")}`
      );

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
