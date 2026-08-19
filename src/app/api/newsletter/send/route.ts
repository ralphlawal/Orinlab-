import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { campaignGeneralEmail, campaignPromotionalEmail, campaignInterestingEmail } from "@/lib/emails";

const FROM = process.env.EMAIL_FROM ?? "OrinlabÍ Records <onboarding@resend.dev>";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

type CampaignType = "general" | "promotional" | "interesting";
type Audience     = "subscribers" | "artists" | "both";

export async function POST(req: NextRequest) {
  const callerEmail = req.headers.get("x-admin-email")?.toLowerCase() ?? "";
  if (!callerEmail || !ADMIN_EMAILS.includes(callerEmail)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let subject: string, body: string, campaign_type: CampaignType, audience: Audience;
  try {
    const parsed = await req.json();
    subject       = parsed.subject;
    body          = parsed.body;
    campaign_type = parsed.campaign_type ?? "general";
    audience      = parsed.audience ?? "subscribers";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });
  }

  const db = serviceClient();

  // Build recipient list based on audience
  const recipientSet = new Map<string, string>(); // email → name

  if (audience === "subscribers" || audience === "both") {
    const { data: subs } = await db.from("newsletter_subscribers").select("email").eq("active", true);
    for (const s of subs ?? []) recipientSet.set(s.email.toLowerCase(), s.email);
  }

  if (audience === "artists" || audience === "both") {
    const { data: artists } = await db.from("artist_profiles").select("email, artist_name");
    // Exclude artists who have unsubscribed (newsletter_subscribers with active=false)
    const { data: unsubs } = await db.from("newsletter_subscribers").select("email").eq("active", false);
    const unsubSet = new Set((unsubs ?? []).map((u: { email: string }) => u.email.toLowerCase()));
    for (const a of artists ?? []) {
      if (!unsubSet.has(a.email.toLowerCase())) {
        recipientSet.set(a.email.toLowerCase(), a.artist_name ?? a.email);
      }
    }
  }

  if (recipientSet.size === 0) {
    return NextResponse.json({ error: "No recipients found for the selected audience." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent = 0, failed = 0;

  for (const [email] of recipientSet) {
    const unsubUrl = `https://orinlabi.com/unsubscribe?email=${encodeURIComponent(email)}`;

    let html: string;
    if (campaign_type === "promotional") {
      html = campaignPromotionalEmail({ subject, body, unsubscribeUrl: unsubUrl });
    } else if (campaign_type === "interesting") {
      html = campaignInterestingEmail({ subject, body, unsubscribeUrl: unsubUrl });
    } else {
      html = campaignGeneralEmail({ subject, body, unsubscribeUrl: unsubUrl });
    }

    try {
      await resend.emails.send({ from: FROM, to: email, subject, html });
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ success: true, sent, failed, total: recipientSet.size });
}
