import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FROM   = process.env.EMAIL_FROM  ?? "Orinlabí <onboarding@resend.dev>";
const ADMIN  = [process.env.ADMIN_EMAIL ?? "ralphlawal2003@gmail.com", "ibatwtc@gmail.com"];
const LOGO   = "https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png";

function esc(s: unknown): string {
  return String(s ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Shared row helper — dark theme */
function row(label: string, value: unknown) {
  return `
  <tr>
    <td style="padding:10px 0;color:#666666;font-size:13px;width:140px;vertical-align:top;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">${esc(label)}</td>
    <td style="padding:10px 0;color:#ffffff;font-size:13px;font-weight:700;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">${esc(value)}</td>
  </tr>`;
}

/* Quote block */
function quote(text: string) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td width="3" bgcolor="#007bff" style="background:#007bff;border-radius:3px;">&nbsp;</td>
      <td width="12">&nbsp;</td>
      <td style="padding:12px 0;color:#aaaaaa;font-size:13px;line-height:1.7;font-family:Arial,sans-serif;white-space:pre-wrap;">${esc(text)}</td>
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

/* Full email wrapper — fully dark, text logo fallback */
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
<body style="margin:0;padding:0;background:#1a1a1a;" bgcolor="#1a1a1a">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#1a1a1a" style="background:#1a1a1a;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo header — always dark, always visible -->
          <tr>
            <td bgcolor="#050505" style="background:#050505 !important;padding:28px 32px;border-radius:14px 14px 0 0;" align="left">
              <!-- Image logo — shows when external images load -->
              <img src="${LOGO}" alt="Orinlabí" width="130" height="35"
                style="display:block;border:0;outline:none;text-decoration:none;max-width:130px;" />
              <!-- Text fallback — always visible in white on dark bg -->
              <p style="margin:8px 0 0;color:#ffffff;font-size:16px;font-weight:800;letter-spacing:1.5px;font-family:Arial,sans-serif;line-height:1;">ORINLAB&Iacute;</p>
            </td>
          </tr>

          <!-- Accent line -->
          <tr>
            <td bgcolor="${accentColor}" style="background:${accentColor};height:3px;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>

          <!-- Content card — dark but mid-tone so Gmail preserves it -->
          <tr>
            <td bgcolor="#181818" style="background:#181818;padding:32px 32px 36px;border-radius:0 0 14px 14px;">

              <!-- Badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
                <tr>
                  <td bgcolor="#0d1a2e" style="background:#0d1a2e;border-radius:100px;padding:5px 14px;border:1px solid rgba(0,123,255,0.35);">
                    <span style="color:${accentColor};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif;">${esc(badge)}</span>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <h2 style="margin:0 0 6px;color:#ffffff;font-size:22px;font-weight:800;line-height:1.3;font-family:Arial,sans-serif;">${esc(heading)}</h2>
              <p style="margin:0 0 24px;color:#888888;font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">${esc(subheading)}</p>

              <!-- Dynamic body -->
              ${body}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#555555;font-size:12px;line-height:1.6;font-family:Arial,sans-serif;">
                &copy; 2026 Orinlab&iacute; &nbsp;&middot;&nbsp; A Ralph Lawal Group Company<br/>
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
      const isAlbum = data.release_type === "Album" || data.release_type === "EP";
      const tracks: { track_number: number; title: string; audio_file_url: string }[] =
        Array.isArray(data.tracks) ? data.tracks : [];

      const coverBlock = data.cover_art_url
        ? `<div style="margin:20px 0 8px;">
            <p style="margin:0 0 8px;color:#999999;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Cover Art</p>
            <a href="${esc(data.cover_art_url)}" target="_blank">
              <img src="${esc(data.cover_art_url)}" alt="Cover Art" width="160" height="160"
                style="display:block;border-radius:10px;object-fit:cover;border:1px solid #eeeeee;" />
            </a>
            <a href="${esc(data.cover_art_url)}" style="display:inline-block;margin-top:6px;color:#007bff;font-size:12px;font-family:Arial,sans-serif;">Download cover art ↗</a>
          </div>`
        : "";

      const tracksBlock = isAlbum && tracks.length > 0
        ? `<div style="margin:24px 0 0;">
            <p style="margin:0 0 10px;color:#999999;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Tracks (${tracks.length})</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1e1e1e;border-radius:10px;overflow:hidden;">
              ${tracks.map(t => `
              <tr>
                <td style="padding:10px 14px;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">
                  <span style="color:#007bff;font-size:11px;font-weight:700;margin-right:10px;">${t.track_number}</span>
                  <span style="color:#ffffff;font-size:13px;">${esc(t.title)}</span>
                </td>
                <td style="padding:10px 14px;border-bottom:1px solid #1e1e1e;text-align:right;">
                  <a href="${esc(t.audio_file_url)}" style="color:#007bff;font-size:12px;font-family:Arial,sans-serif;text-decoration:none;font-weight:600;">Download ↗</a>
                </td>
              </tr>`).join("")}
            </table>
          </div>`
        : data.audio_file_url
          ? `<div style="margin:20px 0 0;">
              <p style="margin:0 0 8px;color:#999999;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Audio File</p>
              <a href="${esc(data.audio_file_url)}" style="display:inline-block;background:rgba(0,123,255,0.12);border:1px solid rgba(0,123,255,0.25);border-radius:8px;padding:10px 18px;color:#007bff;font-size:13px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">
                ▶ Download audio file ↗
              </a>
            </div>`
          : "";

      subject = `New ${isAlbum ? data.release_type : "release"} — ${esc(data.artist_name)} · ${esc(isAlbum ? (data.album_title || data.song_title) : data.song_title)}`;
      html = wrap(
        "#007bff",
        "New Submission",
        isAlbum ? `New ${data.release_type}: ${esc(data.album_title || data.song_title)}` : `New Release: ${esc(data.song_title)}`,
        `${esc(data.artist_name)} just submitted ${isAlbum ? `a${data.release_type === "EP" ? "n" : ""} ${data.release_type}` : "a single"} for distribution.`,
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Artist",          data.artist_name)}
          ${row("Email",           data.email)}
          ${isAlbum ? row(`${data.release_type} Title`, data.album_title || data.song_title) : row("Song Title", data.song_title)}
          ${row("Release Type",    data.release_type)}
          ${row("Genre",           data.genre)}
          ${data.release_date      ? row("Desired Date",    data.release_date)      : ""}
          ${data.explicit          ? row("Explicit",        data.explicit)          : ""}
          ${data.language          ? row("Language",        data.language)          : ""}
          ${data.isrc              ? row("ISRC",            data.isrc)              : ""}
          ${data.songwriters       ? row("Songwriters",     data.songwriters)       : ""}
          ${data.producers         ? row("Producers",       data.producers)         : ""}
          ${data.featured_artists  ? row("Featured",        data.featured_artists)  : ""}
          ${data.copyright_owner   ? row("Copyright Owner", data.copyright_owner)   : ""}
          ${data.copyright_year    ? row("Copyright Year",  data.copyright_year)    : ""}
          ${data.publishing_info   ? row("Publishing",      data.publishing_info)   : ""}
        </table>
        ${coverBlock}
        ${tracksBlock}
        ${btn("Review in Admin Panel", "https://orinlabi.com/admin/releases")}`
      );

    } else if (type === "new-contact") {
      subject = `New message — ${esc(data.name)} · ${esc(data.subject)}`;
      html = wrap(
        "#007bff",
        "Admin Alert",
        "New Contact Message",
        "Someone sent a message via the contact form.",
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
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
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
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
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Artist",     data.artist_name)}
          ${row("Release",    data.song_title)}
          ${row("Type",       data.release_type)}
          ${row("Release ID", data.release_id)}
        </table>
        ${btn("View in Admin Panel", "https://orinlabi.com/admin/releases", "#ef4444")}`
      );

    } else if (type === "release-approved") {
      const reviewedDate = data.reviewed_at
        ? new Date(data.reviewed_at).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })
        : "—";
      subject = `✓ Approved — ${esc(data.artist_name)} · ${esc(data.song_title)}`;
      html = wrap(
        "#16a34a",
        "Decision Logged",
        `Release Approved: ${esc(data.song_title)}`,
        "You approved this release. This email is your admin record.",
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Artist",       data.artist_name)}
          ${row("Legal Name",   data.legal_name)}
          ${row("Email",        data.email)}
          ${row("Release",      data.song_title)}
          ${row("Type",         data.release_type)}
          ${row("Genre",        data.genre)}
          ${row("Country",      data.country)}
          ${row("Decision",     "APPROVED")}
          ${row("Reviewed At",  reviewedDate)}
          ${data.review_notes ? row("Notes to Artist", data.review_notes) : ""}
        </table>
        ${btn("Open in Admin Panel", `https://orinlabi.com/admin/releases`, "#16a34a")}`
      );

    } else if (type === "release-rejected") {
      const reviewedDate = data.reviewed_at
        ? new Date(data.reviewed_at).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })
        : "—";
      subject = `✗ Rejected — ${esc(data.artist_name)} · ${esc(data.song_title)}`;
      html = wrap(
        "#f59e0b",
        "Decision Logged",
        `Release Not Selected: ${esc(data.song_title)}`,
        "You rejected this release. This email is your admin record.",
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Artist",       data.artist_name)}
          ${row("Legal Name",   data.legal_name)}
          ${row("Email",        data.email)}
          ${row("Release",      data.song_title)}
          ${row("Type",         data.release_type)}
          ${row("Genre",        data.genre)}
          ${row("Country",      data.country)}
          ${row("Decision",     "NOT SELECTED")}
          ${row("Reviewed At",  reviewedDate)}
          ${data.review_notes ? row("Reason / Notes", data.review_notes) : ""}
        </table>
        ${btn("Open in Admin Panel", `https://orinlabi.com/admin/releases`, "#f59e0b")}`
      );

    } else if (type === "artist-message") {
      subject = `Message from ${esc(data.artist_name || data.email)}`;
      html = wrap(
        "#007bff",
        "New Message",
        `${esc(data.artist_name || data.email)} sent a message`,
        "Reply in the admin panel or directly via this email.",
        `${quote(data.content)}
        ${btn("Open Chat in Admin Panel", "https://orinlabi.com/admin/messages")}`
      );

    } else if (type === "asset-completed") {
      const assetList = (data.asset_types as string[])
        .map((id: string) => `<li style="margin-bottom:6px;color:#ffffff;">${esc(id.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()))}</li>`)
        .join("");
      const deliveredLinks = data.delivered_assets
        ? Object.entries(data.delivered_assets as Record<string, string>)
            .map(([k, url]) => btn(k.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()), url))
            .join("")
        : "";
      subject = "Your requested assets are ready — Orinlabí";
      html = wrap(
        "#007bff",
        "Assets Ready",
        "Your requested creative assets are ready to download",
        "Log in to your portal to access your files.",
        `<ul style="padding-left:20px;margin:0 0 16px;">${assetList}</ul>
        ${deliveredLinks}
        ${btn("Go to My Assets", "https://orinlabi.com/portal/assets")}`
      );
      await resend.emails.send({ from: FROM, to: data.email, subject, html });
      return NextResponse.json({ success: true });

    } else if (type === "service-request") {
      subject = `Service request — ${esc(data.service_title)} · ${esc(data.artist_name)}`;
      html = wrap(
        "#7c3aed",
        data.team,
        `${esc(data.service_title)} Request`,
        `${esc(data.artist_name)} has requested the ${esc(data.service_title)} service.`,
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Service",     data.service_title)}
          ${row("Assign To",   data.team_role)}
          ${row("Artist",      data.artist_name)}
          ${row("Email",       data.email)}
          ${data.genre   ? row("Genre",   data.genre)   : ""}
          ${data.country ? row("Country", data.country) : ""}
          ${data.release_title ? row("Release", `${esc(data.release_title)} (${esc(data.release_type)})`) : ""}
        </table>
        ${data.goal     ? `<p style="margin:20px 0 4px;color:#999;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Goal</p>${quote(data.goal)}`         : ""}
        ${data.audience ? `<p style="margin:20px 0 4px;color:#999;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Target Audience</p>${quote(data.audience)}` : ""}
        ${data.message  ? `<p style="margin:20px 0 4px;color:#999;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Additional Notes</p>${quote(data.message)}`  : ""}
        ${btn("Reply via Admin Messages", "https://orinlabi.com/admin/messages", "#7c3aed")}`
      );

    } else if (type === "payout-request") {
      const methodLabel = data.payout_method === "bank_transfer" ? "Bank Transfer"
        : data.payout_method === "paypal" ? "PayPal"
        : data.payout_method === "mobile_money" ? "Mobile Money"
        : "Not specified";

      const payoutDetails = data.payout_method === "bank_transfer"
        ? `${row("Bank Name",       data.bank_name || "—")}
           ${row("Account Name",    data.bank_account_name || "—")}
           ${row("Account Number",  data.bank_account_number || "—")}
           ${row("Bank Country",    data.bank_country || "—")}`
        : data.payout_method === "paypal"
        ? `${row("PayPal Email", data.paypal_email || "—")}`
        : data.payout_method === "mobile_money"
        ? `${row("Provider",     data.mobile_money_provider || "—")}
           ${row("Phone Number", data.mobile_money_number || "—")}`
        : `<tr><td colspan="2" style="padding:10px 0;color:#ef4444;font-size:13px;font-family:Arial,sans-serif;">⚠ Artist has not filled in their payout details. Ask them to complete their profile.</td></tr>`;

      subject = `Payout request — ${esc(data.artist_name)} · ${esc(data.song_title)}`;
      html = wrap(
        "#16a34a",
        "Payout Request",
        `Payout Request: ${esc(data.song_title)}`,
        `${esc(data.artist_name)} has requested a payout for their royalties.`,
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Artist",         data.artist_name)}
          ${row("Email",          data.email)}
          ${row("Release",        data.song_title)}
          ${row("Amount",         `$${Number(data.royalties_usd ?? 0).toFixed(2)} USD`)}
          ${row("Payout Method",  methodLabel)}
        </table>
        <p style="margin:20px 0 8px;color:#999999;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Payout Details</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${payoutDetails}
        </table>
        ${btn("Review in Admin Panel", `https://orinlabi.com/admin/releases`, "#16a34a")}`
      );

    } else if (type === "admin-message") {
      subject = `New message from Orinlabí`;
      html = wrap(
        "#007bff",
        "New Message",
        "You have a new message from Orinlabí",
        "Log in to your artist portal to reply.",
        `${quote(data.content)}
        ${btn("View & Reply in Portal", "https://orinlabi.com/portal/messages")}`
      );
      // Send to artist, not admin
      await resend.emails.send({ from: FROM, to: data.email, subject, html });
      return NextResponse.json({ success: true });

    } else if (type === "artist-login") {
      const loginTime = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" });
      subject = `Artist login — ${esc(data.email)}`;
      html = wrap(
        "#007bff",
        "Portal Activity",
        "Artist Logged In",
        `An artist just signed in to their Orinlabí portal.`,
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Email",        data.email)}
          ${data.artist_name ? row("Artist Name", data.artist_name) : ""}
          ${row("Time",         loginTime + " UTC")}
        </table>
        ${btn("View Artist in Admin", "https://orinlabi.com/admin/artists")}`
      );

    } else if (type === "newsletter-signup") {
      const signupTime = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" });
      subject = `New newsletter subscriber — ${esc(data.email)}`;
      html = wrap(
        "#007bff",
        "Newsletter",
        "New Subscriber",
        `Someone just subscribed to the Orinlabí newsletter.`,
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Email", data.email)}
          ${row("Time",  signupTime + " UTC")}
        </table>
        ${btn("View Subscribers", "https://orinlabi.com/admin/newsletter")}`
      );

    } else if (type === "profile-updated") {
      const updatedTime = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" });
      const changes: { field: string; from: string; to: string }[] = Array.isArray(data.changes) ? data.changes : [];
      const changesBlock = changes.length > 0
        ? `<p style="margin:20px 0 8px;color:#999999;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">What Changed</p>
           <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1e1e1e;border-radius:10px;overflow:hidden;">
             <tr style="background:#1a1a1a;">
               <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#666;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;width:130px;">Field</td>
               <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#666;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Before</td>
               <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#666;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">After</td>
             </tr>
             ${changes.map(c => `
             <tr>
               <td style="padding:10px 12px;border-top:1px solid #1e1e1e;font-size:12px;color:#888888;font-family:Arial,sans-serif;font-weight:600;">${esc(c.field)}</td>
               <td style="padding:10px 12px;border-top:1px solid #1e1e1e;font-size:12px;color:#555555;font-family:Arial,sans-serif;text-decoration:line-through;">${esc(c.from) || "<em style='color:#444'>empty</em>"}</td>
               <td style="padding:10px 12px;border-top:1px solid #1e1e1e;font-size:13px;color:#ffffff;font-family:Arial,sans-serif;font-weight:700;">${esc(c.to) || "<em style='color:#555'>cleared</em>"}</td>
             </tr>`).join("")}
           </table>`
        : "";
      subject = `Profile updated — ${esc(data.artist_name || data.email)}`;
      html = wrap(
        "#007bff",
        "Portal Activity",
        "Artist Profile Updated",
        `${esc(data.artist_name || data.email)} just updated their profile — ${changes.length} field${changes.length !== 1 ? "s" : ""} changed.`,
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Artist", data.artist_name || "—")}
          ${row("Email",  data.email)}
          ${row("Time",   updatedTime + " UTC")}
        </table>
        ${changesBlock}
        ${btn("View in Admin", "https://orinlabi.com/admin/artists")}`
      );

    } else if (type === "admin-login") {
      const loginTime = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" });
      subject = `Admin login — ${esc(data.email)}`;
      html = wrap(
        "#007bff",
        "Security Alert",
        "Admin Panel Login",
        `Someone just signed in to the Orinlabí admin panel.`,
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Admin",     data.email)}
          ${row("Time",      loginTime + " UTC")}
          ${data.ip ? row("IP Address", data.ip) : ""}
        </table>
        <p style="margin:20px 0 0;color:#888888;font-size:12px;font-family:Arial,sans-serif;line-height:1.6;">If this wasn't you, change the admin password in your Supabase dashboard immediately.</p>
        ${btn("Open Admin Panel", "https://orinlabi.com/admin")}`
      );

    } else if (type === "admin-action") {
      const actionTime = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" });
      subject = `Admin PIN verified — ${esc(data.email)}`;
      html = wrap(
        "#f59e0b",
        "Security Alert",
        "Admin PIN Verified",
        `An admin just entered the PIN and is making changes to the platform.`,
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Admin",  data.email)}
          ${row("Time",   actionTime + " UTC")}
          ${data.ip ? row("IP Address", data.ip) : ""}
        </table>
        <p style="margin:20px 0 0;color:#888888;font-size:12px;font-family:Arial,sans-serif;line-height:1.6;">If this wasn't authorised, revoke access immediately in your Supabase dashboard.</p>
        ${btn("Open Admin Panel", "https://orinlabi.com/admin")}`
      );

    } else if (type === "support-ticket") {
      subject = `Support ticket — ${esc(data.category)} · ${esc(data.artist_name)}`;
      html = wrap(
        "#007bff",
        "Support Ticket",
        `New Support Request: ${esc(data.subject)}`,
        `${esc(data.artist_name)} (${esc(data.email)}) has submitted a support ticket.`,
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Artist",   data.artist_name)}
          ${row("Email",    data.email)}
          ${row("Category", data.category)}
          ${row("Subject",  data.subject)}
        </table>
        <p style="margin:20px 0 8px;color:#999999;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Message</p>
        ${quote(data.description)}
        ${btn("Respond in Admin Panel", "https://orinlabi.com/admin/support")}`
      );

    } else if (type === "pitch-submitted") {
      subject = `Playlist pitch — ${esc(data.artist_name)} · ${esc(data.song_title)}`;
      html = wrap(
        "#7c3aed",
        "Pitch Received",
        `New Playlist Pitch: ${esc(data.song_title)}`,
        `${esc(data.artist_name)} has submitted a playlist pitch.`,
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Artist",  data.artist_name)}
          ${row("Email",   data.email)}
          ${row("Release", data.song_title)}
          ${data.genre ? row("Genre",  data.genre)  : ""}
          ${data.mood  ? row("Mood",   data.mood)   : ""}
        </table>
        ${data.pitch_notes ? `<p style="margin:20px 0 8px;color:#999999;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Pitch Notes</p>${quote(data.pitch_notes)}` : ""}
        ${btn("Review in Admin Panel", "https://orinlabi.com/admin/pitches", "#7c3aed")}`
      );

    } else if (type === "store-links-added") {
      const linkEntries = Object.entries(data.store_links ?? {}) as [string, string][];
      const linksBlock = linkEntries.length > 0
        ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
            ${linkEntries.map(([k, u]) => row(k.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()), u)).join("")}
          </table>`
        : "";
      subject = `Artist added streaming links — ${esc(data.artist_name)} · ${esc(data.song_title)}`;
      html = wrap(
        "#007bff",
        "Portal Activity",
        "Artist Added Streaming Links",
        `${esc(data.artist_name)} has added their own streaming links to their release.`,
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Artist",  data.artist_name)}
          ${row("Email",   data.email)}
          ${row("Release", data.song_title)}
        </table>
        ${linksBlock ? `<p style="margin:20px 0 8px;color:#999999;font-size:12px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Links Added</p>${linksBlock}` : ""}
        ${btn("View in Admin Panel", `https://orinlabi.com/admin/releases`)}`
      );

    } else if (type === "live-sent") {
      subject = `Live email sent — ${esc(data.artist_name)} · ${esc(data.song_title)}`;
      html = wrap(
        "#16a34a",
        "Action Logged",
        `Live Notification Sent: ${esc(data.song_title)}`,
        "You just sent the live notification email to this artist.",
        `<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
          ${row("Artist",  data.artist_name)}
          ${row("Email",   data.email)}
          ${row("Release", data.song_title)}
          ${row("Sent At", new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" }) + " UTC")}
        </table>
        ${btn("View Release", "https://orinlabi.com/admin/releases", "#16a34a")}`
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
