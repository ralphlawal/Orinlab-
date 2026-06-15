/* ── Branded email HTML templates ── */

const base = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Orinlabí</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;" align="center">
              <img src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
                alt="Orinlabí" height="28"
                style="display:block;" />
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0d0d0d;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px 36px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;color:rgba(255,255,255,0.25);font-size:12px;line-height:1.6;">
              ℗ 2026 Orinlabí · © 2026 Orinlabí · A Ralph Lawal Group Company<br/>
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
  `<h1 style="margin:0 0 12px;color:#ffffff;font-size:24px;font-weight:700;line-height:1.3;">${text}</h1>`;

const p = (text: string) =>
  `<p style="margin:0 0 16px;color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;">${text}</p>`;

const badge = (label: string, color: string, bg: string) =>
  `<span style="display:inline-block;background:${bg};color:${color};font-size:12px;font-weight:600;padding:4px 12px;border-radius:999px;margin-bottom:24px;">${label}</span>`;

const infoRow = (label: string, value: string) =>
  `<tr>
    <td style="padding:8px 0;color:rgba(255,255,255,0.35);font-size:13px;width:130px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;color:rgba(255,255,255,0.75);font-size:13px;vertical-align:top;">${value}</td>
  </tr>`;

const divider = () =>
  `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0;" />`;

const btn = (text: string, url: string) =>
  `<a href="${url}" style="display:inline-block;background:#007bff;color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;padding:13px 28px;border-radius:999px;margin-top:8px;">${text}</a>`;

/* ── 1. Submission confirmation ── */
export function submissionEmail(data: {
  artistName: string;
  songTitle: string;
  releaseType: string;
  genre: string;
  releaseDate: string;
}) {
  return base(`
    ${badge("Submission Received", "#007bff", "rgba(0,123,255,0.12)")}
    ${h1(`We've received your release, ${data.artistName}.`)}
    ${p("Thanks for submitting to Orinlabí. Our team will review your release within <strong style='color:#fff;'>24–48 hours</strong> and get back to you with a decision.")}
    ${divider()}
    <p style="margin:0 0 12px;color:rgba(255,255,255,0.35);font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Your Submission</p>
    <table cellpadding="0" cellspacing="0" width="100%">
      ${infoRow("Title", data.songTitle)}
      ${infoRow("Type", data.releaseType)}
      ${infoRow("Genre", data.genre)}
      ${infoRow("Release Date", data.releaseDate)}
    </table>
    ${divider()}
    ${p("While you wait, make sure your social media profiles and streaming bios are up to date. We'll be in touch soon.")}
    ${btn("View Submission Status", "https://orinlabi.com")}
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
    ${badge("Release Approved ✓", "#22c55e", "rgba(34,197,94,0.12)")}
    ${h1(`Congratulations, ${data.artistName}!`)}
    ${p(`Your ${data.releaseType.toLowerCase()} <strong style="color:#fff;">${data.songTitle}</strong> has been approved and is entering our global distribution pipeline.`)}
    ${divider()}
    <p style="margin:0 0 12px;color:rgba(255,255,255,0.35);font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Release Details</p>
    <table cellpadding="0" cellspacing="0" width="100%">
      ${infoRow("Title", data.songTitle)}
      ${infoRow("Type", data.releaseType)}
      ${infoRow("Genre", data.genre)}
      ${infoRow("Status", "Approved — In Distribution")}
    </table>
    ${data.notes ? `${divider()}<p style="margin:0 0 8px;color:rgba(255,255,255,0.35);font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Notes from our team</p><p style="margin:0;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.7;">${data.notes}</p>` : ""}
    ${divider()}
    ${p("Your music will go live on Spotify, Apple Music, Boomplay, Audiomack, and 150+ platforms within 24–48 hours. Keep making great music — the world is about to hear you.")}
    ${btn("Go to Orinlabí", "https://orinlabi.com")}
  `);
}

/* ── 3. Rejection ── */
export function rejectionEmail(data: {
  artistName: string;
  songTitle: string;
  notes?: string;
}) {
  return base(`
    ${badge("Release Needs Revision", "#f59e0b", "rgba(245,158,11,0.12)")}
    ${h1(`Hi ${data.artistName}, we need to make some changes.`)}
    ${p(`Your submission <strong style="color:#fff;">${data.songTitle}</strong> was not approved at this stage. Don't worry — this is fixable. Please review the notes below and resubmit.`)}
    ${data.notes ? `
    ${divider()}
    <p style="margin:0 0 8px;color:rgba(255,255,255,0.35);font-size:12px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Reason / Notes</p>
    <p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px;line-height:1.7;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;">${data.notes}</p>
    ` : ""}
    ${divider()}
    ${p("Once you've made the necessary changes, submit your release again through the link below. Our team is here to help — reach out if you have questions.")}
    ${btn("Resubmit Your Release", "https://orinlabi.com/submit")}
    <p style="margin:16px 0 0;font-size:13px;color:rgba(255,255,255,0.3);">
      Questions? Email us at <a href="mailto:info@orinlabi.com" style="color:#007bff;">info@orinlabi.com</a>
    </p>
  `);
}
