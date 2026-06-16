import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";
import { ContractDocument } from "@/lib/contractPdf";

const FROM  = process.env.EMAIL_FROM  ?? "Orinlabí <onboarding@resend.dev>";
const ADMIN = process.env.ADMIN_EMAIL ?? "ralphlawal2003@gmail.com";

export async function POST(req: NextRequest) {
  const { releaseId, signatureName } = await req.json();

  if (!releaseId || !signatureName?.trim()) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  // Verify auth via Bearer token
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Fetch the release
  const { data: release, error: releaseErr } = await supabase
    .from("releases")
    .select("id, artist_name, legal_name, email, song_title, release_type, genre, status, contract_signed_at")
    .eq("id", releaseId)
    .single();

  if (releaseErr || !release) {
    return NextResponse.json({ error: "Release not found." }, { status: 404 });
  }

  // Must belong to the authenticated user
  if (release.email !== user.email) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Must be approved
  if (release.status !== "approved") {
    return NextResponse.json({ error: "Release is not approved." }, { status: 400 });
  }

  // Prevent double-signing
  if (release.contract_signed_at) {
    return NextResponse.json({ error: "Contract already signed." }, { status: 409 });
  }

  const signedAt = new Date().toISOString();

  const contractData = {
    artistName:    release.artist_name,
    legalName:     release.legal_name,
    email:         release.email,
    songTitle:     release.song_title,
    releaseType:   release.release_type,
    genre:         release.genre,
    signatureName: signatureName.trim(),
    signedAt,
  };

  // Generate PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = Buffer.from(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await renderToBuffer(createElement(ContractDocument, { data: contractData }) as any)
    );
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Failed to generate contract PDF." }, { status: 500 });
  }

  const filename = `contract-${release.song_title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;

  // Send emails
  const resend = new Resend(process.env.RESEND_API_KEY);

  const artistHtml = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="UTF-8"/><meta name="color-scheme" content="light"/><meta name="supported-color-schemes" content="light"/><title>Orinlabí</title></head>
<body style="margin:0;padding:0;background:#f0f0f0;" bgcolor="#f0f0f0">
  <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f0f0f0" style="background:#f0f0f0;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr>
          <td bgcolor="#050505" style="background:#050505;padding:24px 32px;border-radius:14px 14px 0 0;" align="left">
            <img src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png" alt="Orinlabí" width="120" height="33" style="display:block;border:0;" />
          </td>
        </tr>
        <tr><td bgcolor="#007bff" style="background:#007bff;height:3px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
        <tr>
          <td bgcolor="#ffffff" style="background:#ffffff;padding:32px 32px 36px;border-radius:0 0 14px 14px;">
            <table cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
              <tr><td bgcolor="#e8f0fe" style="background:#e8f0fe;border-radius:100px;padding:5px 14px;">
                <span style="color:#007bff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif;">Contract Signed ✓</span>
              </td></tr>
            </table>
            <h2 style="margin:0 0 6px;color:#0a0a0a;font-size:22px;font-weight:800;font-family:Arial,sans-serif;">Your contract is signed.</h2>
            <p style="margin:0 0 24px;color:#888888;font-size:13px;font-family:Arial,sans-serif;">A copy of your signed Distribution Agreement is attached to this email. Please keep it for your records.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eeeeee;">
              <tr>
                <td style="padding:10px 0;color:#999999;font-size:13px;width:130px;font-family:Arial,sans-serif;">Release</td>
                <td style="padding:10px 0;color:#111111;font-size:13px;font-weight:700;font-family:Arial,sans-serif;">${release.song_title}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#999999;font-size:13px;width:130px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;">Signed by</td>
                <td style="padding:10px 0;color:#111111;font-size:13px;font-weight:700;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;">${contractData.signatureName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#999999;font-size:13px;font-family:Arial,sans-serif;">Date</td>
                <td style="padding:10px 0;color:#111111;font-size:13px;font-weight:700;font-family:Arial,sans-serif;">${new Date(signedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</td>
              </tr>
            </table>
            <p style="margin:24px 0 0;color:#555555;font-size:14px;line-height:1.7;font-family:Arial,sans-serif;">
              Your release is now covered under the Orinlabí Distribution Agreement. If you have any questions, contact us at <a href="mailto:info@orinlabi.com" style="color:#007bff;">info@orinlabi.com</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td bgcolor="#f0f0f0" style="background:#f0f0f0;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#aaaaaa;font-size:12px;font-family:Arial,sans-serif;">℗ 2026 Orinlabí · <a href="https://orinlabi.com" style="color:#007bff;text-decoration:none;">orinlabi.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const adminHtml = artistHtml.replace("Your contract is signed.", `Signed Contract — ${release.artist_name}`).replace("A copy of your signed Distribution Agreement is attached to this email. Please keep it for your records.", "An artist has signed their distribution agreement. A copy is attached.");

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM,
        to: release.email,
        subject: `Your Orinlabí Distribution Agreement — ${release.song_title}`,
        html: artistHtml,
        attachments: [{ filename, content: pdfBuffer }],
      }),
      resend.emails.send({
        from: FROM,
        to: ADMIN,
        subject: `Signed contract — ${release.artist_name} · ${release.song_title}`,
        html: adminHtml,
        attachments: [{ filename, content: pdfBuffer }],
      }),
    ]);
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send contract emails." }, { status: 500 });
  }

  // Mark as signed in DB
  await supabase
    .from("releases")
    .update({ contract_signed_at: signedAt, contract_signature: signatureName.trim() })
    .eq("id", releaseId);

  return NextResponse.json({ success: true, signedAt });
}
