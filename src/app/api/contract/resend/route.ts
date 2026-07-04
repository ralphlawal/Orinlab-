import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { ContractDocument } from "@/lib/contractPdf";
import { supabase } from "@/lib/supabase";

const FROM   = process.env.EMAIL_FROM  ?? "Orinlabí <onboarding@resend.dev>";
const ADMINS = [process.env.ADMIN_EMAIL ?? "ralphlawal2003@gmail.com", "ibatwtc@gmail.com"];

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function POST(req: NextRequest) {
  // Verify admin
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const isAdmin = ADMIN_EMAILS.includes((user.email ?? "").toLowerCase());
  if (!isAdmin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { releaseId } = await req.json();
  if (!releaseId) return NextResponse.json({ error: "Missing releaseId." }, { status: 400 });

  // Fetch with service-role to bypass RLS
  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: release, error: releaseErr } = await service
    .from("releases")
    .select("id, artist_name, legal_name, email, song_title, release_type, genre, contract_signed_at, contract_signature")
    .eq("id", releaseId)
    .single();

  if (releaseErr || !release) {
    return NextResponse.json({ error: "Release not found." }, { status: 404 });
  }

  if (!release.contract_signed_at) {
    return NextResponse.json({ error: "Contract not signed yet." }, { status: 400 });
  }

  const contractData = {
    artistName:    release.artist_name,
    legalName:     release.legal_name,
    email:         release.email,
    songTitle:     release.song_title,
    releaseType:   release.release_type,
    genre:         release.genre,
    signatureName: release.contract_signature ?? release.legal_name,
    signedAt:      release.contract_signed_at,
  };

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
  const signedDateStr = new Date(release.contract_signed_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const adminHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><title>Orinlabí Admin</title></head>
<body style="margin:0;padding:0;background:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td bgcolor="#050505" style="padding:24px 32px;border-radius:14px 14px 0 0;">
          <img src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png" alt="Orinlabí" width="120" height="33" style="display:block;border:0;" />
        </td></tr>
        <tr><td bgcolor="#f59e0b" style="height:3px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
        <tr><td bgcolor="#181818" style="padding:32px 32px 36px;border-radius:0 0 14px 14px;">
          <table cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
            <tr><td bgcolor="#1f1500" style="border-radius:100px;padding:5px 14px;border:1px solid rgba(245,158,11,0.35);">
              <span style="color:#f59e0b;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif;">Resent Contract</span>
            </td></tr>
          </table>
          <h2 style="margin:0 0 6px;color:#ffffff;font-size:22px;font-weight:800;font-family:Arial,sans-serif;">Contract Resent by Admin</h2>
          <p style="margin:0 0 24px;color:#888888;font-size:13px;font-family:Arial,sans-serif;">This is a re-send of a previously signed contract. The signed PDF is attached.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1e1e1e;">
            <tr><td style="padding:10px 0;color:#666;font-size:13px;width:130px;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">Artist</td><td style="padding:10px 0;color:#fff;font-size:13px;font-weight:700;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">${release.artist_name}</td></tr>
            <tr><td style="padding:10px 0;color:#666;font-size:13px;width:130px;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">Legal Name</td><td style="padding:10px 0;color:#fff;font-size:13px;font-weight:700;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">${release.legal_name}</td></tr>
            <tr><td style="padding:10px 0;color:#666;font-size:13px;width:130px;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">Email</td><td style="padding:10px 0;color:#007bff;font-size:13px;font-weight:700;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">${release.email}</td></tr>
            <tr><td style="padding:10px 0;color:#666;font-size:13px;width:130px;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">Release</td><td style="padding:10px 0;color:#fff;font-size:13px;font-weight:700;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">${release.song_title}</td></tr>
            <tr><td style="padding:10px 0;color:#666;font-size:13px;width:130px;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">Signature</td><td style="padding:10px 0;color:#fff;font-size:13px;font-weight:700;border-bottom:1px solid #1e1e1e;font-family:Arial,sans-serif;">${contractData.signatureName}</td></tr>
            <tr><td style="padding:10px 0;color:#666;font-size:13px;font-family:Arial,sans-serif;">Originally Signed</td><td style="padding:10px 0;color:#fff;font-size:13px;font-weight:700;font-family:Arial,sans-serif;">${signedDateStr}</td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin-top:28px;">
            <tr><td bgcolor="#f59e0b" style="border-radius:100px;">
              <a href="https://orinlabi.com/admin/contracts" style="display:inline-block;padding:13px 28px;color:#000;font-size:14px;font-weight:700;text-decoration:none;font-family:Arial,sans-serif;">View All Contracts →</a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMINS,
      subject: `[Resent] Signed contract — ${release.artist_name} · ${release.song_title}`,
      html: adminHtml,
      attachments: [{ filename, content: pdfBuffer }],
    });
  } catch (err) {
    console.error("Resend email error:", err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
