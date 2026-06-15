/* ── Branded email HTML templates ── */

/*
 * Email design: dark logo strip on top (#050505) + white content card.
 * This renders identically on Gmail iOS/Android, Apple Mail, Outlook, and webmail.
 * Pure dark emails get "auto-inverted" by Gmail iOS — this hybrid avoids that.
 */

const base = (content: string) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
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

/* ── 3. Rejection ── */
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
