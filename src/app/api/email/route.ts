import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  submissionEmail, approvalEmail, rejectionEmail, liveEmail,
  takedownConfirmEmail, payoutConfirmEmail, supportConfirmEmail,
  pitchConfirmEmail, stageUpdateEmail, smartlinkReadyEmail,
  releaseDateEmail, artistReminderEmail, revisionRequestEmail,
  priorityPaymentEmail, planActivatedEmail,
  streamsUpdatedEmail, royaltiesUpdatedEmail,
  pitchPlacedEmail, pitchSubmittedEmail, pitchDeclinedEmail, accountStatusEmail,
} from "@/lib/emails";
import { rateLimitResponse } from "@/lib/rateLimit";

const FROM = process.env.EMAIL_FROM ?? "OrinlabÍ Records <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, 15, 60_000);
  if (limited) return limited;

  const resend = new Resend(process.env.RESEND_API_KEY);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const { type, release, data } = body;

  if (!type) {
    return NextResponse.json({ error: "Missing type" }, { status: 400 });
  }

  // Recipient comes from release.email (old pattern) or data.email (new pattern)
  const to: string | undefined = release?.email ?? data?.email;
  if (!to) {
    return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });
  }

  try {
    let subject = "";
    let html = "";

    if (type === "submission") {
      subject = `We received your release — ${release.song_title}`;
      html = submissionEmail({
        artistName: release.artist_name,
        songTitle: release.song_title,
        releaseType: release.release_type,
        genre: release.genre,
        releaseDate: release.release_date,
      });
    } else if (type === "approved") {
      subject = `Your release has been approved — ${release.song_title}`;
      html = approvalEmail({
        artistName: release.artist_name,
        songTitle: release.song_title,
        releaseType: release.release_type,
        genre: release.genre,
        notes: release.review_notes,
      });
    } else if (type === "rejected") {
      subject = `Action needed on your release — ${release.song_title}`;
      html = rejectionEmail({
        artistName: release.artist_name,
        songTitle: release.song_title,
        notes: release.review_notes,
      });
    } else if (type === "live") {
      subject = `Your music is live — ${release.song_title} 🎉`;
      html = liveEmail({
        artistName: release.artist_name,
        songTitle: release.song_title,
        releaseType: release.release_type,
        storeLinks: release.store_links ?? {},
      });
    } else if (type === "takedown-confirmation") {
      subject = `Takedown request received — ${data.song_title}`;
      html = takedownConfirmEmail({ artistName: data.artist_name, songTitle: data.song_title });
    } else if (type === "payout-confirmation") {
      subject = `Payout request received — ${data.song_title}`;
      html = payoutConfirmEmail({ artistName: data.artist_name, songTitle: data.song_title, amountUsd: Number(data.amount_usd ?? 0) });
    } else if (type === "support-confirmation") {
      subject = `Your support ticket is open — ${data.subject}`;
      html = supportConfirmEmail({ artistName: data.artist_name, subject: data.subject, category: data.category });
    } else if (type === "pitch-confirmation") {
      subject = `Your playlist pitch was submitted — ${data.song_title}`;
      html = pitchConfirmEmail({ artistName: data.artist_name, songTitle: data.song_title });
    } else if (type === "smartlink-ready") {
      subject = `Your smart link is ready — ${data.song_title}`;
      html = smartlinkReadyEmail({
        artistName: data.artist_name,
        songTitle:  data.song_title,
        releaseId:  data.release_id,
      });
    } else if (type === "stage-update") {
      const stage = data.stage as "in_distribution" | "live";
      subject = stage === "live"
        ? `Your music is live — ${data.song_title} 🔥`
        : `Distribution update — ${data.song_title}`;
      html = stageUpdateEmail({
        artistName:  data.artist_name,
        songTitle:   data.song_title,
        stage,
        storeLinks:  data.store_links ?? {},
      });
    } else if (type === "release-date-set") {
      subject = `Your release date is locked in — ${data.song_title} drops ${data.release_date}`;
      html = releaseDateEmail({
        artistName:  data.artist_name,
        songTitle:   data.song_title,
        releaseDate: data.release_date,
      });
    } else if (type === "artist-reminder") {
      const reminderType = data.reminder_type as "profile" | "store-links" | "lyrics" | "payout-details";
      const subjectMap = {
        "profile":        `Your OrinlabÍ Records profile needs attention`,
        "store-links":    `Add your streaming links — ${data.song_title ?? "your release"} is live!`,
        "lyrics":         `Don't forget to add your lyrics — ${data.song_title ?? "your release"}`,
        "payout-details": `We can't pay you without your details — urgent`,
      };
      subject = subjectMap[reminderType] ?? "A quick reminder from OrinlabÍ Records";
      html = artistReminderEmail({
        artistName:   data.artist_name,
        songTitle:    data.song_title,
        reminderType,
        missingItems: data.missing_items,
      });
    } else if (type === "plan-activated") {
      subject = `Your ${data.plan_name} plan is now active — OrinlabÍ Records`;
      html = planActivatedEmail({
        planName:  data.plan_name,
        expiresAt: data.expires_at,
      });
    } else if (type === "payment-confirmed") {
      subject = `Payment confirmed — Priority Distribution for ${data.song_title}`;
      html = priorityPaymentEmail({
        artistName: data.artist_name,
        songTitle:  data.song_title,
        releaseId:  data.release_id,
      });
    } else if (type === "revision-requested") {
      subject = `Action required on your submission — ${data.song_title}`;
      html = revisionRequestEmail({
        artistName: data.artist_name,
        songTitle:  data.song_title,
        reason:     data.reason,
        note:       data.note ?? "",
      });
    } else if (type === "streams-updated") {
      const total: number = Object.values((data.breakdown ?? {}) as Record<string, number>).reduce((a: number, v: number) => a + v, 0);
      subject = `Your stream count has been updated — ${data.song_title}`;
      html = streamsUpdatedEmail({
        artistName:   data.artist_name,
        songTitle:    data.song_title,
        totalStreams:  total,
        breakdown:    data.breakdown ?? {},
      });
    } else if (type === "royalties-updated") {
      subject = `Your earnings have been updated — ${data.song_title}`;
      html = royaltiesUpdatedEmail({
        artistName:   data.artist_name,
        songTitle:    data.song_title,
        royaltiesUsd: Number(data.royalties_usd ?? 0),
        releaseId:    data.release_id,
      });
    } else if (type === "pitch-placed") {
      subject = `Your song was placed on a playlist — "${data.song_title}" 🎉`;
      html = pitchPlacedEmail({
        artistName:   data.artist_name,
        songTitle:    data.song_title,
        placementUrl: data.placement_url,
        adminNote:    data.admin_note,
      });
    } else if (type === "pitch-submitted") {
      subject = `Your pitch has been submitted — "${data.song_title}"`;
      html = pitchSubmittedEmail({
        artistName: data.artist_name,
        songTitle:  data.song_title,
        adminNote:  data.admin_note,
      });
    } else if (type === "pitch-declined") {
      subject = `Pitch update for "${data.song_title}"`;
      html = pitchDeclinedEmail({
        artistName: data.artist_name,
        songTitle:  data.song_title,
        adminNote:  data.admin_note,
      });
    } else if (type === "account-status") {
      const statusLabels: Record<string, string> = {
        active: "Your account has been reactivated",
        suspended: "Your account has been suspended",
        inactive: "Your account is now inactive",
        takedown: "Important update about your releases",
        access_revoked: "Your portal access has been restricted",
      };
      subject = `${statusLabels[data.status] ?? "Account update"} — OrinlabÍ Records`;
      html = accountStatusEmail({
        artistName: data.artist_name,
        status:     data.status,
      });
    } else {
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
