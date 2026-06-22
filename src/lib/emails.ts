/* ── Branded email HTML templates ── */

/*
 * Email design: dark logo strip on top (#050505) + white content card.
 * This renders identically on Gmail iOS/Android, Apple Mail, Outlook, and webmail.
 * Pure dark emails get "auto-inverted" by Gmail iOS — this hybrid avoids that.
 */

const base = (content: string) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Orinlabí</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;" bgcolor="#f0f0f0">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0" style="background:#f0f0f0;padding:0;">
    <tr>
      <td align="center" bgcolor="#f0f0f0" style="background:#f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo header — dark strip -->
          <tr>
            <td bgcolor="#050505" style="background:#050505;padding:28px 36px 28px;border-radius:16px 16px 0 0;" align="left">
              <img src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
                alt="Orinlabí" width="130" height="35"
                style="display:block;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>

          <!-- Blue accent line -->
          <tr>
            <td bgcolor="#007bff" style="background:#007bff;height:3px;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>

          <!-- White content card -->
          <tr>
            <td bgcolor="#ffffff" style="background:#ffffff;padding:40px 36px;border-radius:0 0 16px 16px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f0f0f0" style="background:#f0f0f0;padding:24px 36px;text-align:center;color:#999999;font-size:12px;line-height:1.6;font-family:Arial,sans-serif;">
              ℗ 2026 Orinlabí &nbsp;·&nbsp; © 2026 Orinlabí &nbsp;·&nbsp; A Ralph Lawal Group Company<br/>
              <a href="https://orinlabi.com" style="color:#007bff;text-decoration:none;">orinlabi.com</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const h1 = (text: string) =>
  `<h1 style="margin:0 0 12px;color:#111111;font-size:24px;font-weight:700;line-height:1.3;font-family:Arial,sans-serif;">${text}</h1>`;

const p = (text: string) =>
  `<p style="margin:0 0 16px;color:#555555;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">${text}</p>`;

const badge = (label: string, color: string, bg: string) =>
  `<span style="display:inline-block;background:${bg};color:${color};font-size:12px;font-weight:700;padding:5px 14px;border-radius:999px;margin-bottom:20px;font-family:Arial,sans-serif;">${label}</span>`;

const infoRow = (label: string, value: string) =>
  `<tr>
    <td style="padding:9px 0;color:#999999;font-size:13px;width:130px;vertical-align:top;font-family:Arial,sans-serif;">${label}</td>
    <td style="padding:9px 0;color:#222222;font-size:13px;vertical-align:top;font-weight:600;font-family:Arial,sans-serif;">${value}</td>
  </tr>`;

const divider = () =>
  `<hr style="border:none;border-top:1px solid #eeeeee;margin:24px 0;" />`;

const btn = (text: string, url: string) =>
  `<a href="${url}" style="display:inline-block;background:#007bff;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:14px 30px;border-radius:999px;margin-top:8px;font-family:Arial,sans-serif;">${text}</a>`;

/* ── 1. Submission confirmation ── */
export function submissionEmail(data: {
  artistName: string;
  songTitle: string;
  releaseType: string;
  genre: string;
  releaseDate: string;
}) {
  return base(`
    ${badge("Submission Received", "#007bff", "#e8f0fe")}
    ${h1(`We've received your release, ${data.artistName}.`)}
    ${p("Thanks for submitting to Orinlabí. Our team will review your release within <strong style='color:#111111;'>24–48 hours</strong> and get back to you with a decision.")}
    ${divider()}
    <p style="margin:0 0 12px;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;font-family:Arial,sans-serif;">YOUR SUBMISSION</p>
    <table cellpadding="0" cellspacing="0" width="100%">
      ${infoRow("Title", data.songTitle)}
      ${infoRow("Type", data.releaseType)}
      ${infoRow("Genre", data.genre)}
      ${infoRow("Release Date", data.releaseDate)}
    </table>
    ${divider()}
    ${p("While you wait, make sure your social media profiles and streaming bios are up to date. We'll be in touch soon.")}
    ${btn("Check Your Application Status", "https://orinlabi.com/portal/login")}
  `);
}

/* ── 2. Approval ── */
export function approvalEmail(data: {
  artistName: string;
  songTitle: string;
  releaseType: string;
  genre: string;
  notes?: string;
}) {
  return base(`
    ${badge("Release Approved ✓", "#16a34a", "#dcfce7")}
    ${h1(`Congratulations, ${data.artistName}!`)}
    ${p(`Your ${data.releaseType.toLowerCase()} <strong style="color:#111111;">${data.songTitle}</strong> has been approved and is entering our global distribution pipeline.`)}
    ${divider()}
    <p style="margin:0 0 12px;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;font-family:Arial,sans-serif;">RELEASE DETAILS</p>
    <table cellpadding="0" cellspacing="0" width="100%">
      ${infoRow("Title", data.songTitle)}
      ${infoRow("Type", data.releaseType)}
      ${infoRow("Genre", data.genre)}
      ${infoRow("Status", "Approved — In Distribution")}
    </table>
    ${data.notes ? `${divider()}<p style="margin:0 0 8px;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;font-family:Arial,sans-serif;">NOTES FROM OUR TEAM</p><p style="margin:0;color:#444444;font-size:14px;line-height:1.7;background:#f8f8f8;border-left:3px solid #007bff;border-radius:0 8px 8px 0;padding:14px 16px;font-family:Arial,sans-serif;">${data.notes}</p>` : ""}
    ${divider()}
    ${p("Your music will go live on Spotify, Apple Music, Boomplay, Audiomack, and 150+ platforms within 24–48 hours. Log into your portal to track your release and complete your distribution profile.")}
    ${btn("Access Your Artist Portal", "https://orinlabi.com/portal/login")}
  `);
}

/* ── 3. Release Live ── */
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
    iheartradio: "iHeartRadio", tiktok: "TikTok", shazam: "Shazam",
    beatport: "Beatport", jio_saavn: "JioSaavn", gaana: "Gaana",
    wynk: "Wynk Music", kkbox: "KKBOX", claro_musica: "Claro Música",
    "7digital": "7digital",
  };
  const linkRows = Object.entries(data.storeLinks)
    .filter(([, url]) => url?.trim())
    .map(([key, url]) => {
      const label = platformNames[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;"><a href="${url}" style="color:#007bff;font-size:14px;font-weight:600;text-decoration:none;font-family:Arial,sans-serif;">${label} &rarr;</a></td></tr>`;
    })
    .join("");

  return base(`
    ${badge("Your Music is Live!", "#16a34a", "#dcfce7")}
    ${h1(`${data.songTitle} is streaming worldwide, ${data.artistName}!`)}
    ${p(`Your ${data.releaseType.toLowerCase()} is officially live on streaming platforms around the world. Start sharing your links and let your fans know.`)}
    ${divider()}
    <p style="margin:0 0 12px;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;font-family:Arial,sans-serif;">STREAMING LINKS</p>
    <table cellpadding="0" cellspacing="0" width="100%">${linkRows}</table>
    ${divider()}
    ${p("Log in to your Artist Portal to see all your streaming links and check your distribution details.")}
    ${btn("Open My Portal", "https://orinlabi.com/portal/login")}
    <p style="margin:16px 0 0;font-size:13px;color:#999999;font-family:Arial,sans-serif;">
      Questions? Email us at <a href="mailto:info@orinlabi.com" style="color:#007bff;">info@orinlabi.com</a>
    </p>
  `);
}

/* ── 4. Takedown confirmation (artist) ── */
export function takedownConfirmEmail(data: { artistName: string; songTitle: string }) {
  return base(`
    ${badge("Takedown Request Received", "#6b7280", "#f3f4f6")}
    ${h1("We've received your takedown request.")}
    ${p(`Hi ${data.artistName}, your request to remove <strong style="color:#111111;">${data.songTitle}</strong> from all streaming platforms has been logged.`)}
    ${divider()}
    ${p("Our team will begin the takedown process within 1–3 business days. You will receive a follow-up once it is complete.")}
    ${p("If you submitted this request by mistake, contact us immediately at <a href='mailto:info@orinlabi.com' style='color:#007bff;'>info@orinlabi.com</a>.")}
    ${btn("Visit Your Portal", "https://orinlabi.com/portal/login")}
  `);
}

/* ── 5. Payout request confirmation (artist) ── */
export function payoutConfirmEmail(data: { artistName: string; songTitle: string; amountUsd: number }) {
  return base(`
    ${badge("Payout Request Received", "#16a34a", "#dcfce7")}
    ${h1("Your payout request is in.")}
    ${p(`Hi ${data.artistName}, we've received your withdrawal request for royalties earned on <strong style="color:#111111;">${data.songTitle}</strong>.`)}
    ${divider()}
    <table cellpadding="0" cellspacing="0" width="100%">
      ${infoRow("Release", data.songTitle)}
      ${infoRow("Amount Requested", `$${data.amountUsd.toFixed(2)} USD`)}
      ${infoRow("Status", "Pending — under review")}
    </table>
    ${divider()}
    ${p("Our team will review and process your payout within 3–5 business days. Funds are sent to the payout method saved in your profile.")}
    ${btn("View My Portal", "https://orinlabi.com/portal/login")}
  `);
}

/* ── 6. Support ticket confirmation (artist) ── */
export function supportConfirmEmail(data: { artistName: string; subject: string; category: string }) {
  return base(`
    ${badge("Support Ticket Open", "#007bff", "#e8f0fe")}
    ${h1("We've received your support request.")}
    ${p(`Hi ${data.artistName}, your ticket has been submitted and our team will get back to you within 1–2 business days.`)}
    ${divider()}
    <table cellpadding="0" cellspacing="0" width="100%">
      ${infoRow("Category", data.category)}
      ${infoRow("Subject", data.subject)}
      ${infoRow("Status", "Open")}
    </table>
    ${divider()}
    ${p("You can view your ticket and check for our response in your artist portal at any time.")}
    ${btn("View My Tickets", "https://orinlabi.com/portal/support")}
  `);
}

/* ── 7. Playlist pitch confirmation (artist) ── */
export function pitchConfirmEmail(data: { artistName: string; songTitle: string }) {
  return base(`
    ${badge("Pitch Submitted", "#7c3aed", "#ede9fe")}
    ${h1("Your playlist pitch is in!")}
    ${p(`Hi ${data.artistName}, we've received your pitch for <strong style="color:#111111;">${data.songTitle}</strong> and our team will review it shortly.`)}
    ${divider()}
    ${p("We'll pitch your song to playlist curators on your behalf. This typically takes 2–5 business days. We'll reach out if we need anything else from you.")}
    ${p("Keep creating and promoting your music in the meantime — curator engagement loves active artists.")}
    ${btn("Go to My Portal", "https://orinlabi.com/portal/login")}
  `);
}

/* ── 8. Distribution stage update (artist) ── */
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
    anghami: "Anghami", tiktok: "TikTok", pandora: "Pandora",
  };

  if (data.stage === "live") {
    const links = data.storeLinks ?? {};
    const linkRows = Object.entries(links)
      .filter(([, url]) => url?.trim())
      .map(([key, url]) => {
        const label = platformNames[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        return `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;"><a href="${url}" style="color:#007bff;font-size:14px;font-weight:600;text-decoration:none;font-family:Arial,sans-serif;">${label} &rarr;</a></td></tr>`;
      })
      .join("");

    return base(`
      ${badge("Your Music is Live!", "#16a34a", "#dcfce7")}
      ${h1(`${data.songTitle} is streaming worldwide!`)}
      ${p(`Congratulations, ${data.artistName} — your release is officially live on streaming platforms around the world. Start sharing and let your fans know.`)}
      ${linkRows ? `${divider()}<p style="margin:0 0 12px;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;font-family:Arial,sans-serif;">YOUR STREAMING LINKS</p><table cellpadding="0" cellspacing="0" width="100%">${linkRows}</table>` : ""}
      ${divider()}
      ${p("Log in to your portal to get your smart link, share it everywhere, and check your streaming stats.")}
      ${btn("Open My Portal", "https://orinlabi.com/portal/login")}
    `);
  }

  return base(`
    ${badge("Distribution Update", "#007bff", "#e8f0fe")}
    ${h1("Your release is being distributed.")}
    ${p(`Hi ${data.artistName}, <strong style="color:#111111;">${data.songTitle}</strong> has entered our distribution pipeline and is on its way to streaming platforms.`)}
    ${divider()}
    ${p("Your music typically appears on platforms within 24–72 hours. We'll send you another email as soon as it goes live.")}
    ${btn("Track My Release", "https://orinlabi.com/portal/login")}
  `);
}

/* ── 9. Smart link ready (artist) ── */
export function smartlinkReadyEmail(data: {
  artistName: string;
  songTitle: string;
  releaseId: string;
}) {
  const smartLink = `https://orinlabi.com/listen/${data.releaseId}`;
  return base(`
    ${badge("Smart Link Ready", "#007bff", "#eff6ff")}
    ${h1(`Your smart link is live, ${data.artistName}!`)}
    ${p(`<strong style="color:#111111;">${data.songTitle}</strong> now has a shareable streaming link. Send it to your fans and they can listen on their preferred platform.`)}
    ${divider()}
    <p style="margin:0 0 8px;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;font-family:Arial,sans-serif;">YOUR SMART LINK</p>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="background:#f5f9ff;border:1px solid #d0e4ff;border-radius:10px;padding:14px 18px;">
          <a href="${smartLink}" style="color:#007bff;font-size:14px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">${smartLink}</a>
        </td>
      </tr>
    </table>
    ${p("Share this link anywhere — social media, WhatsApp, bio links. Fans choose their own streaming app.")}
    ${btn("Share Your Smart Link", smartLink)}
    <p style="margin:16px 0 0;font-size:13px;color:#999999;font-family:Arial,sans-serif;">
      View your full release in <a href="https://orinlabi.com/portal" style="color:#007bff;">your portal</a>.
    </p>
  `);
}

/* ── 10. Rejection ── */
export function rejectionEmail(data: {
  artistName: string;
  songTitle: string;
  notes?: string;
}) {
  return base(`
    ${badge("Action Required", "#b45309", "#fef3c7")}
    ${h1(`Hi ${data.artistName}, we need to make some changes.`)}
    ${p(`Your submission <strong style="color:#111111;">${data.songTitle}</strong> was not approved at this stage. Don't worry — this is fixable. Please review the notes below and resubmit.`)}
    ${data.notes ? `
    ${divider()}
    <p style="margin:0 0 8px;color:#999999;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;font-family:Arial,sans-serif;">REASON / NOTES</p>
    <p style="margin:0;color:#444444;font-size:14px;line-height:1.7;background:#f8f8f8;border-left:3px solid #f59e0b;border-radius:0 8px 8px 0;padding:14px 16px;font-family:Arial,sans-serif;">${data.notes}</p>
    ` : ""}
    ${divider()}
    ${p("Once you've made the necessary changes, submit your release again through the link below. Our team is here to help — reach out if you have any questions.")}
    ${btn("Resubmit Your Release", "https://orinlabi.com/submit")}
    <p style="margin:16px 0 0;font-size:13px;color:#999999;font-family:Arial,sans-serif;">
      Questions? Email us at <a href="mailto:info@orinlabi.com" style="color:#007bff;">info@orinlabi.com</a>
    </p>
  `);
}
