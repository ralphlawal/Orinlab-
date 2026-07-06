import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { artistReminderEmail } from "@/lib/emails";

const ADMIN_PIN = process.env.ADMIN_PIN ?? "";
const FROM      = process.env.EMAIL_FROM ?? "OrinlabÍ Records <onboarding@resend.dev>";

type ReminderResult = {
  email: string;
  artist: string;
  reminders: string[];
  notifInserted: number;
  emailSent: boolean;
  error?: string;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { pin } = body;

  if (!ADMIN_PIN || pin !== ADMIN_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY);
  const results: ReminderResult[] = [];

  // ── Fetch all approved artists ──────────────────────────────────────────────
  const { data: artists } = await supabase
    .from("artist_profiles")
    .select("email,artist_name,bio,artist_image_url,instagram_handle,x_handle,tiktok_username,country,payout_method")
    .eq("status", "approved")
    .not("email", "is", null);

  // ── Fetch all approved releases (for store-links and lyrics checks) ─────────
  const { data: releases } = await supabase
    .from("releases")
    .select("id,email,artist_name,song_title,status,store_links,lyrics,royalties_usd")
    .eq("status", "approved");

  // Group releases by artist email
  const releasesByEmail: Record<string, typeof releases> = {};
  for (const r of releases ?? []) {
    if (!releasesByEmail[r.email]) releasesByEmail[r.email] = [];
    releasesByEmail[r.email]!.push(r);
  }

  // Process each artist
  for (const artist of artists ?? []) {
    const artistEmail = artist.email as string;
    const artistName  = (artist.artist_name as string) || "Artist";
    const artistReleases = releasesByEmail[artistEmail] ?? [];
    const result: ReminderResult = { email: artistEmail, artist: artistName, reminders: [], notifInserted: 0, emailSent: false };

    // ── 1. Profile completeness ───────────────────────────────────────────────
    const missingProfile: string[] = [];
    if (!artist.bio)                                                   missingProfile.push("Artist bio");
    if (!artist.artist_image_url)                                      missingProfile.push("Profile photo");
    if (!artist.instagram_handle && !artist.x_handle && !artist.tiktok_username) missingProfile.push("At least one social media link");
    if (!artist.country)                                               missingProfile.push("Country");

    if (missingProfile.length > 0) {
      const { error: dbErr } = await supabase.from("notifications").insert({
        email: artistEmail,
        title: "Your artist profile is incomplete",
        body: `Your profile is missing: ${missingProfile.join(", ")}. A complete profile helps fans and curators discover you — takes 5 minutes, makes a big difference.`,
        type: "warning",
        read: false,
        created_at: new Date().toISOString(),
      });
      if (!dbErr) result.notifInserted++;

      try {
        await resend.emails.send({
          from: FROM,
          to: artistEmail,
          subject: "Your OrinlabÍ Records profile needs some attention",
          html: artistReminderEmail({
            artistName,
            reminderType: "profile",
            missingItems: missingProfile,
          }),
        });
        result.emailSent = true;
      } catch (e) { result.error = String(e); }

      result.reminders.push("profile");
      await new Promise((r) => setTimeout(r, 120));
    }

    // ── 2. No payout details ─────────────────────────────────────────────────
    const hasEarnings = artistReleases.some((r) => Number(r.royalties_usd ?? 0) > 0);
    if (hasEarnings && !artist.payout_method) {
      const { error: dbErr } = await supabase.from("notifications").insert({
        email: artistEmail,
        title: "Add your payout details",
        body: "Your music is earning royalties but we cannot send you the money without your payout details. Add them to your profile now.",
        type: "error",
        read: false,
        created_at: new Date().toISOString(),
      });
      if (!dbErr) result.notifInserted++;

      try {
        await resend.emails.send({
          from: FROM,
          to: artistEmail,
          subject: "We can't pay you without your payout details — urgent",
          html: artistReminderEmail({ artistName, reminderType: "payout-details" }),
        });
        result.emailSent = true;
      } catch (e) { result.error = String(e); }

      result.reminders.push("payout-details");
      await new Promise((r) => setTimeout(r, 120));
    }

    // ── 3. Live releases with no store links ─────────────────────────────────
    for (const rel of artistReleases) {
      const hasLinks = rel.store_links && Object.keys(rel.store_links).length > 0;
      if (!hasLinks) {
        const { error: dbErr } = await supabase.from("notifications").insert({
          email: artistEmail,
          title: `Add your streaming links — ${rel.song_title}`,
          body: `"${rel.song_title}" is live but your portal has no streaming links yet. Add them so you can share a smart link and track your streams.`,
          type: "info",
          read: false,
          created_at: new Date().toISOString(),
        });
        if (!dbErr) result.notifInserted++;

        try {
          await resend.emails.send({
            from: FROM,
            to: artistEmail,
            subject: `Add your streaming links — ${rel.song_title} is live!`,
            html: artistReminderEmail({ artistName, songTitle: rel.song_title, reminderType: "store-links" }),
          });
          result.emailSent = true;
        } catch (e) { result.error = String(e); }

        result.reminders.push(`store-links:${rel.song_title}`);
        await new Promise((r) => setTimeout(r, 120));
        break; // one email per artist per batch — avoid spam
      }
    }

    // ── 4. Releases missing lyrics ────────────────────────────────────────────
    const noLyricsRelease = artistReleases.find((r) => !r.lyrics);
    if (noLyricsRelease) {
      const { error: dbErr } = await supabase.from("notifications").insert({
        email: artistEmail,
        title: `Add lyrics for "${noLyricsRelease.song_title}"`,
        body: `Lyrics help fans connect with your music and get your track featured on platforms like Genius and Shazam. Add them in under 2 minutes.`,
        type: "info",
        read: false,
        created_at: new Date().toISOString(),
      });
      if (!dbErr) result.notifInserted++;

      try {
        await resend.emails.send({
          from: FROM,
          to: artistEmail,
          subject: `Add your lyrics — ${noLyricsRelease.song_title}`,
          html: artistReminderEmail({ artistName, songTitle: noLyricsRelease.song_title, reminderType: "lyrics" }),
        });
        result.emailSent = true;
      } catch (e) { result.error = String(e); }

      result.reminders.push(`lyrics:${noLyricsRelease.song_title}`);
      await new Promise((r) => setTimeout(r, 120));
    }

    if (result.reminders.length > 0) results.push(result);
  }

  const totalNotifs  = results.reduce((a, r) => a + r.notifInserted, 0);
  const totalEmails  = results.filter((r) => r.emailSent).length;
  const artistsHit   = results.length;

  return NextResponse.json({
    artistsHit,
    totalNotificationsInserted: totalNotifs,
    totalEmailsSent: totalEmails,
    detail: results,
  });
}
