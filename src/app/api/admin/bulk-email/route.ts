import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "OrinlabÍ Records <info@orinlabi.com>";
const ADMIN_PIN = process.env.ADMIN_PIN ?? "";

function esc(s: string) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: NextRequest) {
  const { pin, subject, body, audience } = await req.json();
  if (!pin || pin !== ADMIN_PIN) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
  }

  // Fetch recipients
  let emails: string[] = [];

  if (audience === "artists" || audience === "all") {
    const { data } = await supabase.from("artist_profiles").select("email").eq("status", "approved");
    emails.push(...(data ?? []).map((r: { email: string }) => r.email).filter(Boolean));
  }
  if (audience === "labels" || audience === "all") {
    const { data } = await supabase.from("label_profiles").select("email").eq("status", "approved");
    emails.push(...(data ?? []).map((r: { email: string }) => r.email).filter(Boolean));
  }

  // Dedupe
  emails = [...new Set(emails)];
  if (!emails.length) return NextResponse.json({ sent: 0, total: 0, failed: [] });

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="background:#0a0a0a;color:#ffffff;font-family:Arial,sans-serif;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <img src="https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png" height="28" style="margin-bottom:32px;filter:brightness(1.1);" alt="OrinlabÍ Records" />
    <div style="white-space:pre-line;color:#cccccc;font-size:15px;line-height:1.7;">${esc(body)}</div>
    <hr style="border:none;border-top:1px solid #1e1e1e;margin:32px 0;" />
    <p style="color:#555555;font-size:12px;">You're receiving this because you're part of the OrinlabÍ Records artist/label community. <a href="https://orinlabi.com/portal" style="color:#007bff;">Log into your portal →</a></p>
  </div>
</body></html>`;

  const sent: string[] = [];
  const failed: { email: string; reason: string }[] = [];

  for (const email of emails) {
    await new Promise(r => setTimeout(r, 100));
    try {
      const { error } = await resend.emails.send({ from: FROM, to: email, subject: subject.trim(), html });
      if (error) failed.push({ email, reason: error.message });
      else sent.push(email);
    } catch (e: unknown) {
      failed.push({ email, reason: e instanceof Error ? e.message : "unknown" });
    }
  }

  return NextResponse.json({ sent: sent.length, total: emails.length, failed });
}
