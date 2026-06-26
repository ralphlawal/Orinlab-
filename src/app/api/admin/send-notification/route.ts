import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { adminNotificationEmail } from "@/lib/emails";

const FROM = process.env.EMAIL_FROM ?? "Orinlabí <onboarding@resend.dev>";

type Recipient = { email: string; name: string; portalUrl: string };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    recipients,
    notification,
  }: {
    recipients: Recipient[];
    notification: {
      title: string;
      body: string;
      type: "info" | "success" | "warning" | "error";
      categoryLabel: string;
      ctaUrl: string;
      ctaLabel: string;
    };
  } = body;

  if (!recipients?.length || !notification?.title) {
    return NextResponse.json({ error: "Missing recipients or notification data" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  let dbInserted = 0;
  let emailsSent = 0;
  const emailsFailed: string[] = [];

  // Insert in-app notifications for all recipients at once
  const notifRows = recipients.map((r) => ({
    email: r.email,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    read: false,
    created_at: new Date().toISOString(),
  }));

  const { error: dbErr } = await supabase.from("notifications").insert(notifRows);
  if (!dbErr) dbInserted = notifRows.length;

  // Send emails sequentially (Resend free tier: 2 req/s)
  for (const r of recipients) {
    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: r.email,
        subject: `${notification.title} — Orinlabí`,
        html: adminNotificationEmail({
          recipientName: r.name,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          categoryLabel: notification.categoryLabel,
          ctaUrl: r.portalUrl,
          ctaLabel: notification.ctaLabel,
        }),
      });
      if (error) throw error;
      emailsSent++;
    } catch {
      emailsFailed.push(r.email);
    }
    // Rate-limit: 100ms between sends
    await new Promise((res) => setTimeout(res, 100));
  }

  return NextResponse.json({
    dbInserted,
    emailsSent,
    emailsFailed,
    total: recipients.length,
  });
}
