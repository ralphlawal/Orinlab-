import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { submissionEmail, approvalEmail, rejectionEmail } from "@/lib/emails";

const FROM = process.env.EMAIL_FROM ?? "Orinlabí <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await req.json();
  const { type, release } = body;

  if (!type || !release) {
    return NextResponse.json({ error: "Missing type or release" }, { status: 400 });
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
    } else {
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: release.email,
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
