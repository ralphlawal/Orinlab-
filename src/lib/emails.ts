/* ── Orinlabí branded email templates ── */

/*
 * Design rules:
 * - Outer wrapper: light gray (#f2f2f2) — safe across all clients
 * - Card: pure white — content area
 * - Header band: brand navy (#0b1120) with white logo — dark enough to show
 *   white logo; NOT pure black so email clients don't auto-invert it
 * - Forced light color-scheme meta + inline [data-ogsc] overrides for Outlook dark
 * - Logo alt="" (decorative) — prevents "Orinlabí" text from appearing on load fail
 * - Footer: single copyright line, no duplicate brand name
 */

const LOGO = "https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png";
const PORTAL = "https://orinlabi.com/portal/login";

const base = (content: string, accentColor = "#007bff") => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>Orinlabí</title>
  <style>
    /* Force light mode — prevent Gmail / Outlook dark-mode inversion */
    :root { color-scheme: light only; }
    body, table, td, th { color-scheme: light only; }

    /* Outlook dark mode overrides */
    [data-ogsc] .email-header { background-color: #0b1120 !important; }
    [data-ogsc] .email-body   { background-color: #ffffff !important; }
    [data-ogsc] .email-footer { background-color: #f2f2f2 !important; }
    [data-ogsb] .email-header { background-color: #0b1120 !important; }
    [data-ogsb] .email-body   { background-color: #ffffff !important; }

    /* Gmail dark mode override */
    @media (prefers-color-scheme: dark) {
      .email-header { background-color: #0b1120 !important; }
      .email-body   { background-color: #ffffff !important; color: #111111 !important; }
      .email-footer { background-color: #f2f2f2 !important; }
      .body-text    { color: #333333 !important; }
      .muted-text   { color: #666666 !important; }
    }

    @media only screen and (max-width: 600px) {
      .card { width: 100% !important; }
      .pad  { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f2f2f2;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;" bgcolor="#f2f2f2">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f2f2f2" style="background-color:#f2f2f2;margin:0;padding:0;">
  <tr>
    <td align="center" style="padding:32px 16px;">

      <table role="presentation" class="card" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- ─── Header: dark navy with logo ─── -->
        <tr>
          <td class="email-header" bgcolor="#0b1120" style="background-color:#0b1120;padding:28px 40px;" align="left">
            <img src="${LOGO}" alt="" width="120" height="auto"
              style="display:block;border:0;outline:none;text-decoration:none;max-width:120px;height:auto;line-height:1;" />
          </td>
        </tr>

        <!-- ─── Accent bar ─── -->
        <tr>
          <td bgcolor="${accentColor}" style="background-color:${accentColor};height:4px;font-size:1px;line-height:1px;">&nbsp;</td>
        </tr>

        <!-- ─── Body ─── -->
        <tr>
          <td class="email-body pad" bgcolor="#ffffff" style="background-color:#ffffff;padding:44px 40px 40px;">
            ${content}
          </td>
        </tr>

        <!-- ─── Footer ─── -->
        <tr>
          <td class="email-footer" bgcolor="#f2f2f2" style="background-color:#f2f2f2;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;line-height:1.5;">
              © 2026 Orinlabí Music Distribution Ltd.&nbsp;&nbsp;·&nbsp;&nbsp;A Ralph Lawal Group Company
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;">
              <a href="https://orinlabi.com" style="color:#007bff;text-decoration:none;">orinlabi.com</a>
              &nbsp;·&nbsp;
              <a href="mailto:info@orinlabi.com" style="color:#888888;text-decoration:none;">info@orinlabi.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

/* ── Shared block helpers ──────────────────────────────────────────────────── */

const label = (text: string, color: string, bg: string) =>
  `<p style="margin:0 0 20px;">
    <span style="display:inline-block;background:${bg};color:${color};font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:5px 14px;border-radius:100px;">${text}</span>
  </p>`;

const h1 = (text: string) =>
  `<h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:800;line-height:1.25;color:#0d0d0d;">${text}</h1>`;

const p = (html: string) =>
  `<p class="body-text" style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">${html}</p>`;

const muted = (html: string) =>
  `<p class="muted-text" style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#888888;">${html}</p>`;

const divider = () =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:28px 0;">
    <tr><td style="border-top:1px solid #ebebeb;font-size:1px;line-height:1px;">&nbsp;</td></tr>
  </table>`;

const btn = (text: string, url: string, color = "#007bff") =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
    <tr>
      <td bgcolor="${color}" style="background-color:${color};border-radius:100px;">
        <a href="${url}" style="display:inline-block;padding:15px 34px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${text}</a>
      </td>
    </tr>
  </table>`;

const infoTable = (rows: [string, string][]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 4px;">
    ${rows.map(([lbl, val]) => `
    <tr>
      <td style="padding:9px 0 9px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#999999;width:140px;vertical-align:top;border-bottom:1px solid #f5f5f5;">${lbl}</td>
      <td style="padding:9px 0 9px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;font-weight:600;vertical-align:top;border-bottom:1px solid #f5f5f5;">${val}</td>
    </tr>`).join("")}
  </table>`;

const sectionLabel = (text: string) =>
  `<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#aaaaaa;">${text}</p>`;

const noteBox = (text: string, borderColor = "#007bff") =>
  `<div style="background-color:#f8f9fa;border-left:3px solid ${borderColor};border-radius:0 8px 8px 0;padding:16px 18px;margin:0;">
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#444444;">${text}</p>
  </div>`;

/* ── 1. Submission confirmation ──────────────────────────────────────────────── */
export function submissionEmail(data: {
  artistName: string;
  songTitle: string;
  releaseType: string;
  genre: string;
  releaseDate: string;
}) {
  return base(`
    ${label("Submission Received", "#1d6ae5", "#e8f0fe")}
    ${h1(`We got your release, ${data.artistName}.`)}
    ${p(`Thanks for submitting to Orinlabí. Our team will review your release within <strong style="color:#0d0d0d;">24–48 hours</strong> and notify you with a decision.`)}
    ${divider()}
    ${sectionLabel("Your Submission")}
    ${infoTable([
      ["Title",        data.songTitle],
      ["Type",         data.releaseType],
      ["Genre",        data.genre],
      ["Release Date", data.releaseDate],
      ["Status",       "Under Review"],
    ])}
    ${divider()}
    ${p("While you wait, make sure your artist profile, social links, and platform bios are up to date.")}
    ${btn("View Your Portal", PORTAL)}
  `);
}

/* ── 2. Release approved ─────────────────────────────────────────────────────── */
export function approvalEmail(data: {
  artistName: string;
  songTitle: string;
  releaseType: string;
  genre: string;
  notes?: string;
}) {
  return base(`
    ${label("Release Approved ✓", "#166534", "#dcfce7")}
    ${h1(`Congratulations, ${data.artistName}!`)}
    ${p(`Your ${data.releaseType.toLowerCase()} <strong style="color:#0d0d0d;">${data.songTitle}</strong> has been approved and is entering the global distribution pipeline.`)}
    ${divider()}
    ${sectionLabel("Release Details")}
    ${infoTable([
      ["Title",  data.songTitle],
      ["Type",   data.releaseType],
      ["Genre",  data.genre],
      ["Status", "Approved — In Distribution"],
    ])}
    ${data.notes ? `${divider()}${sectionLabel("Notes from Our Team")}${noteBox(data.notes, "#22c55e")}` : ""}
    ${divider()}
    ${p("Your music will go live on Spotify, Apple Music, Boomplay, Audiomack, and 150+ platforms within 24–48 hours.")}
    ${btn("Open My Portal", PORTAL, "#16a34a")}
  `, "#22c55e");
}

/* ── 3. Release live ─────────────────────────────────────────────────────────── */
export function liveEmail(data: {
  artistName: string;
  songTitle: string;
  releaseType: string;
  storeLinks: Record<string, string>;
}) {
  const platformNames: Record<string, string> = {
    spotify: "Spotify", apple_music: "Apple Music", youtube_music: "YouTube Music",
    amazon_music: "Amazon Music", deezer: "Deezer", tidal: "TIDAL",
    pandora: "Pandora", audiomack: "Audiomack", boomplay: "Boomplay",
    soundcloud: "SoundCloud", anghami: "Anghami", napster: "Napster",
    tiktok: "TikTok", shazam: "Shazam", beatport: "Beatport",
  };
  const linkRows = Object.entries(data.storeLinks)
    .filter(([, url]) => url?.trim())
    .map(([key, url]) => {
      const name = platformNames[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return `<tr><td style="padding:10px 0;border-bottom:1px solid #f5f5f5;">
        <a href="${url}" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#007bff;text-decoration:none;">${name} →</a>
      </td></tr>`;
    }).join("");

  return base(`
    ${label("Your Music is Live! 🎉", "#166534", "#dcfce7")}
    ${h1(`${data.songTitle} is streaming worldwide!`)}
    ${p(`Congratulations ${data.artistName} — your ${data.releaseType.toLowerCase()} is officially live on streaming platforms around the world.`)}
    ${divider()}
    ${sectionLabel("Your Streaming Links")}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${linkRows}</table>
    ${divider()}
    ${p("Log in to your portal to get your smart link, share it everywhere, and start tracking streams.")}
    ${btn("Open My Portal", PORTAL, "#16a34a")}
  `, "#22c55e");
}

/* ── 4. Takedown confirmation ───────────────────────────────────────────────── */
export function takedownConfirmEmail(data: { artistName: string; songTitle: string }) {
  return base(`
    ${label("Takedown Request Received", "#6b7280", "#f3f4f6")}
    ${h1("We received your takedown request.")}
    ${p(`Hi ${data.artistName}, your request to remove <strong style="color:#0d0d0d;">${data.songTitle}</strong> from all streaming platforms has been logged.`)}
    ${divider()}
    ${p("Our team will begin the takedown process within 1–3 business days and send you a confirmation once it is complete.")}
    ${muted(`Submitted this by mistake? Email us immediately at <a href="mailto:info@orinlabi.com" style="color:#007bff;">info@orinlabi.com</a>.`)}
    ${btn("Visit My Portal", PORTAL, "#6b7280")}
  `);
}

/* ── 5. Payout request confirmation ─────────────────────────────────────────── */
export function payoutConfirmEmail(data: { artistName: string; songTitle: string; amountUsd: number }) {
  return base(`
    ${label("Payout Request Received", "#166534", "#dcfce7")}
    ${h1("Your payout request is in.")}
    ${p(`Hi ${data.artistName}, we've received your withdrawal request for royalties earned on <strong style="color:#0d0d0d;">${data.songTitle}</strong>.`)}
    ${divider()}
    ${infoTable([
      ["Release",          data.songTitle],
      ["Amount Requested", `$${data.amountUsd.toFixed(2)} USD`],
      ["Status",           "Pending — Under Review"],
    ])}
    ${divider()}
    ${p("Our team will review and process your payout within 3–5 business days. Funds are sent to the payout method saved in your profile.")}
    ${btn("View My Portal", PORTAL, "#16a34a")}
  `, "#22c55e");
}

/* ── 6. Support ticket confirmation ─────────────────────────────────────────── */
export function supportConfirmEmail(data: { artistName: string; subject: string; category: string }) {
  return base(`
    ${label("Support Ticket Open", "#1d6ae5", "#e8f0fe")}
    ${h1("We received your support request.")}
    ${p(`Hi ${data.artistName}, your ticket has been submitted. Our team will get back to you within 1–2 business days.`)}
    ${divider()}
    ${infoTable([
      ["Category", data.category],
      ["Subject",  data.subject],
      ["Status",   "Open"],
    ])}
    ${divider()}
    ${p("You can view your ticket status and our response in your artist portal at any time.")}
    ${btn("View My Ticket", "https://orinlabi.com/portal/support")}
  `);
}

/* ── 7. Playlist pitch confirmation ─────────────────────────────────────────── */
export function pitchConfirmEmail(data: { artistName: string; songTitle: string }) {
  return base(`
    ${label("Pitch Submitted", "#6d28d9", "#ede9fe")}
    ${h1("Your playlist pitch is in!")}
    ${p(`Hi ${data.artistName}, we've received your pitch for <strong style="color:#0d0d0d;">${data.songTitle}</strong> and our team will review it shortly.`)}
    ${divider()}
    ${p("We'll pitch your song to curators on your behalf. This typically takes 2–5 business days. Keep creating and promoting — curator engagement loves active artists.")}
    ${btn("Go to My Portal", PORTAL, "#7c3aed")}
  `, "#7c3aed");
}

/* ── 8. Distribution stage update ───────────────────────────────────────────── */
export function stageUpdateEmail(data: {
  artistName: string;
  songTitle: string;
  stage: "in_distribution" | "live";
  storeLinks?: Record<string, string>;
}) {
  const platformNames: Record<string, string> = {
    spotify: "Spotify", apple_music: "Apple Music", boomplay: "Boomplay",
    audiomack: "Audiomack", youtube_music: "YouTube Music", deezer: "Deezer",
    tidal: "TIDAL", amazon_music: "Amazon Music", soundcloud: "SoundCloud",
  };

  if (data.stage === "live") {
    const links = data.storeLinks ?? {};
    const linkRows = Object.entries(links)
      .filter(([, url]) => url?.trim())
      .map(([key, url]) => {
        const name = platformNames[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return `<tr><td style="padding:10px 0;border-bottom:1px solid #f5f5f5;">
          <a href="${url}" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#007bff;text-decoration:none;">${name} →</a>
        </td></tr>`;
      }).join("");

    return base(`
      ${label("Your Music is Live! 🎉", "#166534", "#dcfce7")}
      ${h1(`${data.songTitle} is streaming worldwide!`)}
      ${p(`Congratulations ${data.artistName} — your release is officially live. Start sharing your links and track your streams in the portal.`)}
      ${linkRows ? `${divider()}${sectionLabel("Streaming Links")}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${linkRows}</table>` : ""}
      ${divider()}
      ${btn("Open My Portal", PORTAL, "#16a34a")}
    `, "#22c55e");
  }

  return base(`
    ${label("Distribution Update", "#1d6ae5", "#e8f0fe")}
    ${h1("Your release is being distributed.")}
    ${p(`Hi ${data.artistName}, <strong style="color:#0d0d0d;">${data.songTitle}</strong> has entered our distribution pipeline and is on its way to streaming platforms.`)}
    ${divider()}
    ${p("Your music typically appears on platforms within 24–72 hours. We'll send another email as soon as it goes live.")}
    ${btn("Track My Release", PORTAL)}
  `);
}

/* ── 9. Smart link ready ─────────────────────────────────────────────────────── */
export function smartlinkReadyEmail(data: {
  artistName: string;
  songTitle: string;
  releaseId: string;
}) {
  const smartLink = `https://orinlabi.com/listen/${data.releaseId}`;
  return base(`
    ${label("Smart Link Ready", "#1d6ae5", "#eff6ff")}
    ${h1(`Your smart link is live, ${data.artistName}!`)}
    ${p(`<strong style="color:#0d0d0d;">${data.songTitle}</strong> now has a shareable streaming link. Send it to fans and they'll be taken to their favourite platform automatically.`)}
    ${divider()}
    ${sectionLabel("Your Smart Link")}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="background-color:#f0f7ff;border:1px solid #bcd9ff;border-radius:10px;padding:14px 18px;">
          <a href="${smartLink}" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#1d6ae5;text-decoration:none;word-break:break-all;">${smartLink}</a>
        </td>
      </tr>
    </table>
    ${p("Drop this link in your Instagram bio, WhatsApp status, or anywhere you promote — fans choose their own streaming app.")}
    ${btn("Share Your Smart Link", smartLink)}
  `);
}

/* ── 10. Rejection ───────────────────────────────────────────────────────────── */
export function rejectionEmail(data: {
  artistName: string;
  songTitle: string;
  notes?: string;
}) {
  return base(`
    ${label("Action Required", "#92400e", "#fef3c7")}
    ${h1(`Hi ${data.artistName}, we need some changes.`)}
    ${p(`Your submission <strong style="color:#0d0d0d;">${data.songTitle}</strong> was not approved at this stage. This is fixable — review the notes below and resubmit.`)}
    ${data.notes ? `${divider()}${sectionLabel("Reason / Notes")}${noteBox(data.notes, "#f59e0b")}` : ""}
    ${divider()}
    ${p("Once you've made the necessary corrections, submit your release again through your portal. Our team is here to help.")}
    ${btn("Resubmit Your Release", "https://orinlabi.com/portal/releases/new", "#d97706")}
    ${muted(`Questions? <a href="mailto:info@orinlabi.com" style="color:#007bff;">info@orinlabi.com</a>`)}
  `, "#f59e0b");
}

/* ── 11. Admin → artist / label notification ─────────────────────────────────── */
export function adminNotificationEmail(data: {
  recipientName: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "error";
  ctaUrl: string;
  ctaLabel: string;
  categoryLabel?: string;
}) {
  const styles = {
    info:    { labelColor: "#1d6ae5", labelBg: "#e8f0fe", accent: "#007bff", btnColor: "#007bff" },
    success: { labelColor: "#166534", labelBg: "#dcfce7", accent: "#22c55e", btnColor: "#16a34a" },
    warning: { labelColor: "#92400e", labelBg: "#fef3c7", accent: "#f59e0b", btnColor: "#d97706" },
    error:   { labelColor: "#991b1b", labelBg: "#fee2e2", accent: "#ef4444", btnColor: "#dc2626" },
  }[data.type];

  const categoryText = data.categoryLabel ?? "Message from Orinlabí";

  return base(`
    ${label(categoryText, styles.labelColor, styles.labelBg)}
    ${h1(data.title)}
    ${p(`Hi ${data.recipientName},`)}
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:#333333;white-space:pre-line;">${data.body}</p>
    ${divider()}
    ${p("Log in to your Orinlabí portal to view this notification and take any required action.")}
    ${btn(data.ctaLabel, data.ctaUrl, styles.btnColor)}
    ${muted(`This message was sent by the Orinlabí team. Questions? <a href="mailto:info@orinlabi.com" style="color:#007bff;">info@orinlabi.com</a>`)}
  `, styles.accent);
}
