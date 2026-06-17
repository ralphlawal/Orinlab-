/**
 * Send an apology + "portal is live" email to all artists in the releases table.
 * Run with:  npx tsx scripts/send-apology.ts
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const SUPABASE_URL      = "https://zfhtnqhnqqstxyyonjul.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmaHRucWhucXFzdHh5eW9uanVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjI1MzksImV4cCI6MjA5NzA5ODUzOX0.6Zfw9mEFyPUEHsreh6j0lwV19oQF7f3uAZWhWrl7YoY";
const RESEND_API_KEY    = "re_63SRXbEp_KPZosaxxMEvTLkJXiEd8euUd";
const FROM              = "Orinlabí <info@orinlabi.com>";
const LOGO              = "https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const resend   = new Resend(RESEND_API_KEY);

function buildEmail(artistName: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>Orinlabí — Artist Portal Update</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;" bgcolor="#f0f0f0">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0" style="background:#f0f0f0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td bgcolor="#050505" style="background:#050505;padding:24px 32px;border-radius:14px 14px 0 0;" align="left">
              <img src="${LOGO}" alt="Orinlabí" width="120" height="33" style="display:block;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>

          <!-- Accent line -->
          <tr>
            <td bgcolor="#007bff" style="background:#007bff;height:3px;font-size:1px;line-height:1px;">&nbsp;</td>
          </tr>

          <!-- Body card -->
          <tr>
            <td bgcolor="#ffffff" style="background:#ffffff;padding:36px 32px 40px;border-radius:0 0 14px 14px;">

              <!-- Badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td bgcolor="#e8f5e9" style="background:#e8f5e9;border-radius:100px;padding:5px 14px;">
                    <span style="color:#16a34a;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif;">Portal Update</span>
                  </td>
                </tr>
              </table>

              <h2 style="margin:0 0 8px;color:#0a0a0a;font-size:22px;font-weight:800;line-height:1.3;font-family:Arial,sans-serif;">
                Hi ${artistName || "there"} — your artist portal is fully live.
              </h2>
              <p style="margin:0 0 24px;color:#888888;font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">
                We have an important update about your Orinlabí artist account.
              </p>

              <!-- Main message -->
              <p style="margin:0 0 16px;color:#333333;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;">
                We sincerely apologise for the difficulties you experienced trying to access your artist portal. We are aware that some of you were unable to log in, and we understand how frustrating that must have been — especially when your music career is on the line.
              </p>
              <p style="margin:0 0 16px;color:#333333;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;">
                The issue has been fully resolved. Our sign-in system has been rebuilt and thoroughly tested. Everything is working as it should.
              </p>

              <!-- What's fixed -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#f8faff;border-radius:12px;border:1px solid #e0eaff;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;color:#007bff;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;font-family:Arial,sans-serif;">What's new &amp; working</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        "Magic link sign-in — click the link in your email and you're in",
                        "Artist dashboard showing your release status and store links",
                        "Stream analytics and earnings visible once your music is live",
                        "New release submission for approved artists",
                        "Distribution agreement signing with PDF delivery",
                      ].map(item => `
                      <tr>
                        <td width="20" valign="top" style="padding:4px 0;font-family:Arial,sans-serif;">
                          <span style="color:#007bff;font-size:14px;">✓</span>
                        </td>
                        <td style="padding:4px 0;color:#444444;font-size:13px;line-height:1.6;font-family:Arial,sans-serif;">${item}</td>
                      </tr>`).join("")}
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;color:#333333;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;">
                To access your portal, simply visit <a href="https://orinlabi.com/portal/login" style="color:#007bff;text-decoration:none;font-weight:600;">orinlabi.com/portal/login</a>, enter your email address, and click the sign-in link we send you. It takes less than 30 seconds.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="#007bff" style="background:#007bff;border-radius:100px;">
                    <a href="https://orinlabi.com/portal/login" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;letter-spacing:0.2px;">
                      Access Your Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;color:#999999;font-size:13px;line-height:1.7;font-family:Arial,sans-serif;">
                If you experience any issues at all, reply to this email or contact us at
                <a href="mailto:info@orinlabi.com" style="color:#007bff;text-decoration:none;"> info@orinlabi.com</a>.
                We respond within a few hours.<br/><br/>
                Thank you for your patience and for believing in what we are building at Orinlabí.
              </p>

              <p style="margin:24px 0 0;color:#0a0a0a;font-size:13px;font-family:Arial,sans-serif;">
                With respect,<br/>
                <strong>Ralph Lawal</strong><br/>
                <span style="color:#888888;">Founder, Orinlabí</span>
              </p>

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

async function main() {
  console.log("Fetching artist emails from Supabase...");

  const { data, error } = await supabase
    .from("releases")
    .select("email, artist_name")
    .order("submitted_at", { ascending: true });

  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }

  // De-duplicate by email — keep the first artist_name found per email
  const seen = new Map<string, string>();
  for (const row of data ?? []) {
    const email = (row.email as string)?.toLowerCase().trim();
    if (email && !seen.has(email)) {
      seen.set(email, (row.artist_name as string) ?? "");
    }
  }

  const artists = Array.from(seen.entries());
  console.log(`Found ${artists.length} unique artist email(s).`);

  let sent = 0;
  let failed = 0;

  for (const [email, artistName] of artists) {
    try {
      const { error: sendError } = await resend.emails.send({
        from: FROM,
        to: email,
        subject: "Your Orinlabí artist portal is now fully live",
        html: buildEmail(artistName),
      });

      if (sendError) throw sendError;
      console.log(`  ✓ Sent to ${email}`);
      sent++;

      // Small delay to stay within Resend rate limits
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`  ✗ Failed for ${email}:`, err);
      failed++;
    }
  }

  console.log(`\nDone. Sent: ${sent}  Failed: ${failed}`);
}

main();
