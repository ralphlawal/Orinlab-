import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  artistWelcomeFollowupEmail,
  artistProfileIncompleteEmail,
  artistFirstReleaseEmail,
  artistPitchCheckinEmail,
} from "@/lib/emails";

const FROM = process.env.EMAIL_FROM ?? "OrinlabÍ Records <onboarding@resend.dev>";

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

// Vercel Cron calls with Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db     = serviceClient();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const now    = new Date();

  const results = { welcome: 0, profile: 0, firstRelease: 0, pitchCheckin: 0, errors: 0 };

  // Helper: check if a notification with this title was already sent to this email
  async function alreadySent(email: string, titleFragment: string): Promise<boolean> {
    const { count } = await db
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .ilike("title", `%${titleFragment}%`);
    return (count ?? 0) > 0;
  }

  async function sendEmail(to: string, subject: string, html: string) {
    await resend.emails.send({ from: FROM, to, subject, html });
  }

  async function notify(email: string, type: string, title: string, body: string, link: string) {
    await db.from("notifications").insert({ email, type, title, body, link });
  }

  /* ── 1. Welcome email — artists who joined in the last 48 hours ── */
  const since48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
  const { data: newArtists } = await db
    .from("artist_profiles")
    .select("email, artist_name, created_at")
    .gte("created_at", since48h);

  for (const artist of newArtists ?? []) {
    try {
      if (await alreadySent(artist.email, "You're in")) continue;
      await sendEmail(
        artist.email,
        "Welcome to OrinlabÍ Records — here's how to get started",
        artistWelcomeFollowupEmail({ artistName: artist.artist_name ?? "there" }),
      );
      await notify(artist.email, "info", "You're in — let's get started 🎤",
        "Check your email for a getting-started guide from the Orinlabí team.", "/portal");
      results.welcome++;
    } catch { results.errors++; }
  }

  /* ── 2. Profile incomplete — artists who joined 2–7 days ago ── */
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since2d = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const { data: midArtists } = await db
    .from("artist_profiles")
    .select("email, artist_name, bio, artist_image_url")
    .gte("created_at", since7d)
    .lte("created_at", since2d);

  for (const artist of midArtists ?? []) {
    try {
      const missing: string[] = [];
      if (!artist.bio)              missing.push("Artist bio");
      if (!artist.artist_image_url) missing.push("Profile photo");
      if (missing.length === 0) continue;
      if (await alreadySent(artist.email, "profile")) continue;
      await sendEmail(
        artist.email,
        "Your OrinlabÍ Records profile is incomplete",
        artistProfileIncompleteEmail({ artistName: artist.artist_name ?? "there", missing }),
      );
      await notify(artist.email, "warning", "Your profile has missing information",
        `Missing: ${missing.join(", ")}. Complete it in your portal.`, "/portal/profile");
      results.profile++;
    } catch { results.errors++; }
  }

  /* ── 3. No release nudge — artists who joined 5–14 days ago with zero releases ── */
  const since14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const since5d  = new Date(now.getTime() - 5  * 24 * 60 * 60 * 1000).toISOString();
  const { data: olderArtists } = await db
    .from("artist_profiles")
    .select("email, artist_name")
    .gte("created_at", since14d)
    .lte("created_at", since5d);

  for (const artist of olderArtists ?? []) {
    try {
      const [{ count: releaseCount }, alreadyNudged] = await Promise.all([
        db.from("releases").select("*", { count: "exact", head: true }).eq("email", artist.email),
        alreadySent(artist.email, "first release"),
      ]);
      if ((releaseCount ?? 0) > 0 || alreadyNudged) continue;
      await sendEmail(
        artist.email,
        "Ready to get your music out there?",
        artistFirstReleaseEmail({ artistName: artist.artist_name ?? "there" }),
      );
      await notify(artist.email, "info", "Submit your first release",
        "Start distributing your music to Spotify, Apple Music, and 150+ platforms.", "/portal/releases/new");
      results.firstRelease++;
    } catch { results.errors++; }
  }

  /* ── 4. Pitch check-in — pitches in "submitted" for 10+ days ── */
  const since10d = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const { data: stalePitches } = await db
    .from("playlist_pitches")
    .select("id, email, artist_name, song_title, pitch_notes, created_at")
    .eq("status", "submitted")
    .lte("created_at", since10d);

  for (const pitch of stalePitches ?? []) {
    try {
      if (await alreadySent(pitch.email, "still working on your pitch")) continue;
      const typeMatch = (pitch.pitch_notes ?? "").match(/^\[([A-Z]+)\]/);
      const pitchType = typeMatch?.[1]
        ? typeMatch[1].charAt(0) + typeMatch[1].slice(1).toLowerCase()
        : "Playlist";
      await sendEmail(
        pitch.email,
        `Update on your ${pitchType} pitch — "${pitch.song_title}"`,
        artistPitchCheckinEmail({ artistName: pitch.artist_name, songTitle: pitch.song_title, pitchType }),
      );
      await notify(pitch.email, "info", "We're still working on your pitch",
        `Your ${pitchType} pitch for "${pitch.song_title}" is active. We'll notify you when there's an update.`,
        "/portal/pitch");
      results.pitchCheckin++;
    } catch { results.errors++; }
  }

  console.log("[artist-followups cron]", results);
  return NextResponse.json({ ok: true, ...results });
}
