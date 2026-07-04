import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const ADMIN_PIN = process.env.ADMIN_PIN ?? "";
const FROM      = process.env.EMAIL_FROM ?? "OrinlabÍ Records <onboarding@resend.dev>";
const LOGO      = "https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png";

function wrap(heading: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#1a1a1a;" bgcolor="#1a1a1a">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#1a1a1a">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td bgcolor="#050505" style="background:#050505;padding:24px 32px;border-radius:14px 14px 0 0;" align="left">
            <img src="${LOGO}" alt="OrinlabÍ Records" width="120" height="32"
              style="display:block;border:0;outline:none;text-decoration:none;max-width:120px;height:auto;" />
          </td>
        </tr>
        <tr><td bgcolor="#007bff" style="background:#007bff;height:3px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
        <tr>
          <td bgcolor="#181818" style="background:#181818;padding:32px 32px 36px;border-radius:0 0 14px 14px;">
            <table cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
              <tr>
                <td bgcolor="#0d1a2e" style="background:#0d1a2e;border-radius:100px;padding:5px 14px;border:1px solid rgba(0,123,255,0.35);">
                  <span style="color:#007bff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif;">Profile Reminder</span>
                </td>
              </tr>
            </table>
            <h2 style="margin:0 0 24px;color:#ffffff;font-size:22px;font-weight:800;line-height:1.3;font-family:Arial,sans-serif;">${heading}</h2>
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#555555;font-size:12px;line-height:1.6;font-family:Arial,sans-serif;">
              &copy; 2026 Orinlab&iacute; &nbsp;&middot;&nbsp; A Ralph Lawal Group Company<br/>
              <a href="https://orinlabi.com" style="color:#007bff;text-decoration:none;">orinlabi.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function artistMissing(p: Record<string, unknown>) {
  const fields: string[] = [];
  if (!p.bio)              fields.push("Bio");
  if (!p.profile_photo)    fields.push("Profile photo");
  if (!p.instagram_url && !p.twitter_url && !p.tiktok_url) fields.push("Social links");
  if (!p.country)          fields.push("Country");
  return fields;
}

function labelMissing(p: Record<string, unknown>) {
  const fields: string[] = [];
  if (!p.bio)              fields.push("Label bio");
  if (!p.logo_url)         fields.push("Logo");
  if (!p.country)          fields.push("Country");
  if (!p.genre_focus)      fields.push("Genre focus");
  return fields;
}

export async function POST(req: NextRequest) {
  const { pin } = await req.json();

  if (!ADMIN_PIN || pin !== ADMIN_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY);
  const sent: string[] = [];
  const skipped: string[] = [];
  const failed: { email: string; reason: string }[] = [];

  // --- Artists ---
  const { data: artists } = await supabase
    .from("artist_profiles")
    .select("email,artist_name,bio,profile_photo,instagram_url,twitter_url,tiktok_url,country")
    .eq("status", "approved")
    .not("email", "is", null);

  for (const a of artists ?? []) {
    const missing = artistMissing(a as Record<string, unknown>);
    if (missing.length === 0) { skipped.push(a.email); continue; }

    const name = a.artist_name || "Artist";
    const listItems = missing.map(m => `<li style="margin-bottom:6px;color:#cccccc;font-family:Arial,sans-serif;font-size:13px;">${m}</li>`).join("");

    const body = `
      <p style="color:#cccccc;font-size:14px;line-height:1.7;font-family:Arial,sans-serif;margin:0 0 16px;">
        Hi ${name}, your OrinlabÍ Records artist profile is missing a few things. A complete profile helps fans and labels discover you.
      </p>
      <p style="color:#999999;font-size:13px;font-family:Arial,sans-serif;margin:0 0 8px;">Missing:</p>
      <ul style="margin:0 0 24px;padding-left:20px;">${listItems}</ul>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td bgcolor="#007bff" style="background:#007bff;border-radius:100px;">
            <a href="https://orinlabi.com/portal/profile" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">Complete Your Profile &rarr;</a>
          </td>
        </tr>
      </table>`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: a.email,
      subject: "Your OrinlabÍ Records artist profile is incomplete",
      html: wrap(`Complete your profile, ${name}`, body),
    });

    if (error) failed.push({ email: a.email, reason: error.message });
    else sent.push(a.email);
    await new Promise((r) => setTimeout(r, 100));
  }

  // --- Labels ---
  const { data: labels } = await supabase
    .from("label_profiles")
    .select("email,name,bio,logo_url,country,genre_focus")
    .eq("status", "approved")
    .not("email", "is", null);

  for (const l of labels ?? []) {
    const missing = labelMissing(l as Record<string, unknown>);
    if (missing.length === 0) { skipped.push(l.email); continue; }

    const name = l.name || "Label";
    const listItems = missing.map(m => `<li style="margin-bottom:6px;color:#cccccc;font-family:Arial,sans-serif;font-size:13px;">${m}</li>`).join("");

    const body = `
      <p style="color:#cccccc;font-size:14px;line-height:1.7;font-family:Arial,sans-serif;margin:0 0 16px;">
        Hi ${name}, your OrinlabÍ Records label profile is incomplete. Finish it so artists and fans can find your label on the platform.
      </p>
      <p style="color:#999999;font-size:13px;font-family:Arial,sans-serif;margin:0 0 8px;">Missing:</p>
      <ul style="margin:0 0 24px;padding-left:20px;">${listItems}</ul>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td bgcolor="#007bff" style="background:#007bff;border-radius:100px;">
            <a href="https://orinlabi.com/labels/portal/profile" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">Complete Your Profile &rarr;</a>
          </td>
        </tr>
      </table>`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: l.email,
      subject: "Your OrinlabÍ Records label profile is incomplete",
      html: wrap(`Complete your label profile, ${name}`, body),
    });

    if (error) failed.push({ email: l.email, reason: error.message });
    else sent.push(l.email);
    await new Promise((r) => setTimeout(r, 100));
  }

  return NextResponse.json({
    sent: sent.length,
    skipped: skipped.length,
    failed,
    total: (artists?.length ?? 0) + (labels?.length ?? 0),
  });
}
