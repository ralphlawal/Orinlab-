/* ── OrinlabÍ Records email templates ── */

const LOGO   = "https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png";
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
  <title>OrinlabÍ Records</title>
  <style>
    :root { color-scheme: light only; }
    body, table, td, th { color-scheme: light only; }
    [data-ogsc] .email-header { background-color: #0b1120 !important; }
    [data-ogsc] .email-body   { background-color: #ffffff !important; }
    [data-ogsc] .email-footer { background-color: #f2f2f2 !important; }
    [data-ogsb] .email-header { background-color: #0b1120 !important; }
    [data-ogsb] .email-body   { background-color: #ffffff !important; }
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
        <tr>
          <td class="email-header" bgcolor="#0b1120" style="background-color:#0b1120;padding:28px 40px;" align="left">
            <img src="${LOGO}" alt="" width="120" height="auto"
              style="display:block;border:0;outline:none;text-decoration:none;max-width:120px;height:auto;line-height:1;" />
          </td>
        </tr>
        <tr>
          <td bgcolor="${accentColor}" style="background-color:${accentColor};height:4px;font-size:1px;line-height:1px;">&nbsp;</td>
        </tr>
        <tr>
          <td class="email-body pad" bgcolor="#ffffff" style="background-color:#ffffff;padding:44px 40px 40px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td class="email-footer" bgcolor="#f2f2f2" style="background-color:#f2f2f2;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#888888;line-height:1.5;">
              © 2026 OrinlabÍ Records Music Distribution Ltd.&nbsp;&nbsp;·&nbsp;&nbsp;A Ralph Lawal Group Company
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

/* ── 1. Submission confirmation ── */
export function submissionEmail(data: {
  artistName: string;
  songTitle: string;
  releaseType: string;
  genre: string;
  releaseDate: string;
}) {
  return base(`
    ${label("Your release is in our inbox", "#1d6ae5", "#e8f0fe")}
    ${h1(`Got it. We'll take it from here, ${data.artistName}.`)}
    ${p(`Your submission landed safely and we are already looking it over. Our team will get back to you with a decision within <strong style="color:#0d0d0d;">24–48 hours</strong>. Go touch some grass — or write your next hit. Either works.`)}
    ${divider()}
    ${sectionLabel("What You Submitted")}
    ${infoTable([
      ["Title",        data.songTitle],
      ["Type",         data.releaseType],
      ["Genre",        data.genre],
      ["Release Date", data.releaseDate],
      ["Status",       "Under Review — we're on it"],
    ])}
    ${divider()}
    ${p("While you wait, make sure your artist profile, social links, and platform bios are sharp. Curators actually check these things.")}
    ${btn("View Your Portal", PORTAL)}
  `);
}

/* ── 2. Release approved ── */
export function approvalEmail(data: {
  artistName: string;
  songTitle: string;
  releaseType: string;
  genre: string;
  notes?: string;
}) {
  return base(`
    ${label("You're officially in ✓", "#166534", "#dcfce7")}
    ${h1(`Let's go, ${data.artistName}. This one is hitting platforms.`)}
    ${p(`Your ${data.releaseType.toLowerCase()} <strong style="color:#0d0d0d;">${data.songTitle}</strong> made it through our review. 150+ platforms are about to know your name — Spotify, Apple Music, Boomplay, TikTok, and everywhere in between.`)}
    ${divider()}
    ${sectionLabel("Release Details")}
    ${infoTable([
      ["Title",  data.songTitle],
      ["Type",   data.releaseType],
      ["Genre",  data.genre],
      ["Status", "Approved — entering distribution now"],
    ])}
    ${data.notes ? `${divider()}${sectionLabel("A Note from Our Team")}${noteBox(data.notes, "#22c55e")}` : ""}
    ${divider()}
    ${p("Your music will be live on streaming platforms within 24–48 hours. Start teasing it everywhere — the hype is part of the launch.")}
    ${btn("Open My Portal", PORTAL, "#16a34a")}
  `, "#22c55e");
}

/* ── 3. Release live ── */
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
    ${label("The world can hear you now 🔥", "#166534", "#dcfce7")}
    ${h1(`${data.songTitle} is live. The internet is not ready.`)}
    ${p(`${data.artistName} — your ${data.releaseType.toLowerCase()} is officially streaming worldwide right now. Drop your links everywhere. Instagram bio. WhatsApp status. Text your mum. All of it.`)}
    ${divider()}
    ${sectionLabel("Stream It Now")}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${linkRows}</table>
    ${divider()}
    ${p("Log in to your portal to grab your smart link, track your streams, and watch the numbers move.")}
    ${btn("Open My Portal", PORTAL, "#16a34a")}
  `, "#22c55e");
}

/* ── 4. Takedown confirmation ── */
export function takedownConfirmEmail(data: { artistName: string; songTitle: string }) {
  return base(`
    ${label("Takedown Request Logged", "#6b7280", "#f3f4f6")}
    ${h1("We got your takedown request.")}
    ${p(`Hey ${data.artistName} — not every release needs to live forever, and we respect that. We have logged your request to remove <strong style="color:#0d0d0d;">${data.songTitle}</strong> from all streaming platforms.`)}
    ${divider()}
    ${p("Our team will start the takedown process within 1–3 business days. Once it is done, we will send you a confirmation. DSPs can take a little time to fully remove listings, so hang tight.")}
    ${muted(`Sent this by accident? Email us <em>immediately</em> at <a href="mailto:info@orinlabi.com" style="color:#007bff;">info@orinlabi.com</a> and we will try to stop it.`)}
    ${btn("Visit My Portal", PORTAL, "#6b7280")}
  `);
}

/* ── 5. Payout request confirmation ── */
export function payoutConfirmEmail(data: { artistName: string; songTitle: string; amountUsd: number }) {
  return base(`
    ${label("Show me the money 💸", "#166534", "#dcfce7")}
    ${h1("Your payout request is logged.")}
    ${p(`Smart move, ${data.artistName}. We have received your withdrawal request for royalties on <strong style="color:#0d0d0d;">${data.songTitle}</strong>. Your music made money — now let it come to you.`)}
    ${divider()}
    ${infoTable([
      ["Release",          data.songTitle],
      ["Amount Requested", `$${data.amountUsd.toFixed(2)} USD`],
      ["Status",           "Pending — under review"],
    ])}
    ${divider()}
    ${p("Our team will review and process your payout within 3–5 business days. Funds go to the payout method saved on your profile. Keep releasing music — that number will only go up.")}
    ${btn("View My Portal", PORTAL, "#16a34a")}
  `, "#22c55e");
}

/* ── 6. Support ticket confirmation ── */
export function supportConfirmEmail(data: { artistName: string; subject: string; category: string }) {
  return base(`
    ${label("We're on it", "#1d6ae5", "#e8f0fe")}
    ${h1("Your message landed safely.")}
    ${p(`Hey ${data.artistName} — your support request is in our queue and a real human being will look at it. We will get back to you within 1–2 business days. No bots, no copy-paste responses (well, maybe a little).`)}
    ${divider()}
    ${infoTable([
      ["Category", data.category],
      ["Subject",  data.subject],
      ["Status",   "Open"],
    ])}
    ${divider()}
    ${p("You can check your ticket status in your artist portal anytime.")}
    ${btn("View My Ticket", "https://orinlabi.com/portal/support")}
  `);
}

/* ── 7. Playlist pitch confirmation ── */
export function pitchConfirmEmail(data: { artistName: string; songTitle: string }) {
  return base(`
    ${label("Pitch Submitted", "#6d28d9", "#ede9fe")}
    ${h1("Your pitch is in curators' hands.")}
    ${p(`Hey ${data.artistName} — we have received your pitch for <strong style="color:#0d0d0d;">${data.songTitle}</strong>. Our team is on it. Pitching typically takes 2–5 business days.`)}
    ${divider()}
    ${p("While you wait: keep posting, keep engaging your audience, keep releasing. Curator engagement loves active artists — an artist who ghosts their fanbase between pitches is a harder sell.")}
    ${btn("Go to My Portal", PORTAL, "#7c3aed")}
  `, "#7c3aed");
}

/* ── 8. Distribution stage update ── */
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
      ${label("Your music is LIVE 🔥", "#166534", "#dcfce7")}
      ${h1(`Pack your bags — ${data.songTitle} is everywhere.`)}
      ${p(`${data.artistName}, your release is officially live and streaming worldwide. Share it. Scream it. Put it in your Instagram bio right now.`)}
      ${linkRows ? `${divider()}${sectionLabel("Streaming Links")}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${linkRows}</table>` : ""}
      ${divider()}
      ${btn("Open My Portal", PORTAL, "#16a34a")}
    `, "#22c55e");
  }

  return base(`
    ${label("We're uploading your music to the world", "#1d6ae5", "#e8f0fe")}
    ${h1("Your release is in the pipeline.")}
    ${p(`Hey ${data.artistName} — <strong style="color:#0d0d0d;">${data.songTitle}</strong> has entered our distribution pipeline. It is on its way to Spotify, Apple Music, Boomplay, and 150+ other platforms as we speak.`)}
    ${divider()}
    ${p("Your music typically appears on platforms within 24–72 hours. We will hit you with another email the moment it goes live. Sit tight — this is the good part.")}
    ${btn("Track My Release", PORTAL)}
  `);
}

/* ── 9. Smart link ready ── */
export function smartlinkReadyEmail(data: {
  artistName: string;
  songTitle: string;
  releaseId: string;
}) {
  const smartLink = `https://orinlabi.com/listen/${data.releaseId}`;
  return base(`
    ${label("Smart Link Ready", "#1d6ae5", "#eff6ff")}
    ${h1(`${data.songTitle} has its own address on the internet.`)}
    ${p(`${data.artistName} — your smart link is live. Share it anywhere and fans are taken straight to their favourite streaming platform automatically. No confusion. No "which link do I click?" No excuses.`)}
    ${divider()}
    ${sectionLabel("Your Smart Link")}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="background-color:#f0f7ff;border:1px solid #bcd9ff;border-radius:10px;padding:14px 18px;">
          <a href="${smartLink}" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#1d6ae5;text-decoration:none;word-break:break-all;">${smartLink}</a>
        </td>
      </tr>
    </table>
    ${p("Instagram bio. WhatsApp status. Twitter. Email signature. Everywhere.")}
    ${btn("Share Your Smart Link", smartLink)}
  `);
}

/* ── 10. Rejection ── */
export function rejectionEmail(data: {
  artistName: string;
  songTitle: string;
  notes?: string;
}) {
  return base(`
    ${label("A small bump in the road", "#92400e", "#fef3c7")}
    ${h1(`Hey ${data.artistName}, we need a few tweaks.`)}
    ${p(`Your submission <strong style="color:#0d0d0d;">${data.songTitle}</strong> needs some changes before we can distribute it. This is not a "no" — it is a "not yet." Read the notes below, make the fixes, and come back.`)}
    ${data.notes ? `${divider()}${sectionLabel("What Needs Fixing")}${noteBox(data.notes, "#f59e0b")}` : ""}
    ${divider()}
    ${p("Once you have sorted it, resubmit through your portal. Our team is rooting for you — we would not bother with feedback if we did not think the music was worth it.")}
    ${btn("Resubmit Your Release", "https://orinlabi.com/portal/releases/new", "#d97706")}
    ${muted(`Questions? We are right here: <a href="mailto:info@orinlabi.com" style="color:#007bff;">info@orinlabi.com</a>`)}
  `, "#f59e0b");
}

/* ── 11. Admin notification ── */
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

  const categoryText = data.categoryLabel ?? "Message from OrinlabÍ Records";

  return base(`
    ${label(categoryText, styles.labelColor, styles.labelBg)}
    ${h1(data.title)}
    ${p(`Hey ${data.recipientName},`)}
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;color:#333333;white-space:pre-line;">${data.body}</p>
    ${divider()}
    ${p("Log in to your OrinlabÍ Records portal to view this notification and take any required action.")}
    ${btn(data.ctaLabel, data.ctaUrl, styles.btnColor)}
    ${muted(`This message was sent by the OrinlabÍ Records team. Questions? <a href="mailto:info@orinlabi.com" style="color:#007bff;">info@orinlabi.com</a>`)}
  `, styles.accent);
}

/* ── 12. Release date set ── */
export function releaseDateEmail(data: {
  artistName: string;
  songTitle: string;
  releaseDate: string;
}) {
  const formatted = (() => {
    try {
      return new Date(data.releaseDate + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
    } catch {
      return data.releaseDate;
    }
  })();

  return base(`
    ${label("Mark your calendar 📅", "#1d6ae5", "#e8f0fe")}
    ${h1(`${data.songTitle} drops on ${formatted}.`)}
    ${p(`${data.artistName} — your release date is officially locked in. You now have a deadline (the good kind). Use this time to build anticipation, prep your content, and make sure the world is ready for what you are about to drop.`)}
    ${divider()}
    ${sectionLabel("Release Info")}
    ${infoTable([
      ["Title",        data.songTitle],
      ["Release Date", formatted],
      ["Status",       "Scheduled — distribution in progress"],
    ])}
    ${divider()}
    ${p("What to do before your release date:")}
    <ul style="margin:0 0 20px;padding-left:20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:2;color:#444444;">
      <li>Schedule social media posts and countdowns</li>
      <li>Send your smart link to fans for pre-saves</li>
      <li>Pitch your music to playlists (the earlier the better)</li>
      <li>Prep a press release or artist statement</li>
    </ul>
    ${btn("Open My Portal", PORTAL)}
  `);
}

/* ── 13. Artist reminder ── */
export function artistReminderEmail(data: {
  artistName: string;
  songTitle?: string;
  reminderType: "profile" | "store-links" | "lyrics" | "payout-details" | "contract";
  missingItems?: string[];
}) {
  const configs = {
    "profile": {
      labelText: "Your profile needs some love",
      labelColor: "#92400e", labelBg: "#fef3c7",
      accent: "#f59e0b",
      heading: `${data.artistName}, your profile is half-finished.`,
      intro: `A complete profile is the difference between a fan clicking "follow" and clicking "back." Right now, yours has some gaps. Let's fix that — it takes five minutes and it matters more than you think.`,
      cta: "Complete My Profile",
      ctaUrl: "https://orinlabi.com/portal/profile",
      ctaColor: "#d97706",
    },
    "store-links": {
      labelText: "Your music is live — add your links!",
      labelColor: "#166534", labelBg: "#dcfce7",
      accent: "#22c55e",
      heading: `${data.artistName}, people are searching for ${data.songTitle ?? "your release"} right now.`,
      intro: `Your release is live on streaming platforms but your portal does not have the direct links yet. Add them so you can share a smart link, send fans straight to Spotify or Apple Music, and actually track where your streams are coming from.`,
      cta: "Add My Streaming Links",
      ctaUrl: "https://orinlabi.com/portal",
      ctaColor: "#16a34a",
    },
    "lyrics": {
      labelText: "Add your lyrics",
      labelColor: "#6d28d9", labelBg: "#ede9fe",
      accent: "#7c3aed",
      heading: `${data.songTitle ?? "Your release"} is missing its lyrics.`,
      intro: `Lyrics help fans connect with your music on a deeper level. They also get your track featured on platforms like Genius and Shazam. Adding them to your portal takes two minutes — and can make a real difference to how your music travels.`,
      cta: "Add My Lyrics",
      ctaUrl: "https://orinlabi.com/portal",
      ctaColor: "#7c3aed",
    },
    "payout-details": {
      labelText: "We can't pay you without these details",
      labelColor: "#991b1b", labelBg: "#fee2e2",
      accent: "#ef4444",
      heading: `${data.artistName}, your payout details are missing.`,
      intro: `Your music is earning royalties — but we cannot send you the money without your payout details. This is the one admin task you absolutely should not skip. Add your bank, PayPal, or mobile money details to your profile and you will be ready to withdraw whenever you want.`,
      cta: "Add Payout Details",
      ctaUrl: "https://orinlabi.com/portal/profile",
      ctaColor: "#dc2626",
    },
    "contract": {
      labelText: "One signature away",
      labelColor: "#1e3a5f", labelBg: "#dbeafe",
      accent: "#007bff",
      heading: `${data.artistName}, your distribution agreement needs a signature.`,
      intro: `Your release "${data.songTitle ?? "your release"}" is approved and ready — but your distribution contract hasn't been signed yet. Without it, we can't fully push your music to global platforms. It takes 60 seconds to sign and you only need to do it once.`,
      cta: "Sign My Contract",
      ctaUrl: "https://orinlabi.com/portal",
      ctaColor: "#007bff",
    },
  };

  const cfg = configs[data.reminderType];
  const missingList = data.missingItems?.length
    ? `<ul style="margin:0 0 20px;padding-left:20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:2;color:#444444;">
        ${data.missingItems.map(m => `<li>${m}</li>`).join("")}
      </ul>`
    : "";

  return base(`
    ${label(cfg.labelText, cfg.labelColor, cfg.labelBg)}
    ${h1(cfg.heading)}
    ${p(cfg.intro)}
    ${missingList ? `${divider()}${sectionLabel("What's Missing")}${missingList}` : ""}
    ${divider()}
    ${btn(cfg.cta, cfg.ctaUrl, cfg.ctaColor)}
    ${muted(`You are receiving this because you are an OrinlabÍ Records artist. Questions? <a href="mailto:info@orinlabi.com" style="color:#007bff;">info@orinlabi.com</a>`)}
  `, cfg.accent);
}
