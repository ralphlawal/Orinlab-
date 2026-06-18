import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://orinlabi.com";

function spotifyBasic() {
  return `Basic ${Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64")}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code      = searchParams.get("code");
  const releaseId = searchParams.get("state");
  const error     = searchParams.get("error");

  if (error || !code || !releaseId) {
    return NextResponse.redirect(`${SITE}/presave/${releaseId ?? ""}?error=denied`);
  }

  // Exchange code for access + refresh tokens
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: spotifyBasic(),
    },
    body: new URLSearchParams({
      grant_type:   "authorization_code",
      code,
      redirect_uri: `${SITE}/api/presave/callback`,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${SITE}/presave/${releaseId}?error=token`);
  }

  const { access_token, refresh_token, expires_in } = await tokenRes.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  const tokenExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  // Get Spotify user profile
  const profileRes = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const spotifyProfile = await profileRes.json() as { id: string; email?: string };

  // Get release spotify_album_id
  const { data: release } = await supabase
    .from("releases")
    .select("spotify_album_id")
    .eq("id", releaseId)
    .maybeSingle();

  // Store / update presave record
  await supabase.from("presaves").upsert({
    release_id:       releaseId,
    spotify_user_id:  spotifyProfile.id,
    spotify_email:    spotifyProfile.email ?? null,
    access_token,
    refresh_token,
    token_expires_at: tokenExpiresAt,
    saved_at:         null,
  }, { onConflict: "release_id,spotify_user_id" });

  // Try to save album immediately if Spotify album ID is already set
  if (release?.spotify_album_id) {
    const saveRes = await fetch(
      `https://api.spotify.com/v1/me/albums?ids=${encodeURIComponent(release.spotify_album_id)}`,
      {
        method:  "PUT",
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    if (saveRes.ok) {
      await supabase.from("presaves")
        .update({ saved_at: new Date().toISOString() })
        .eq("release_id", releaseId)
        .eq("spotify_user_id", spotifyProfile.id);
    }
  }

  return NextResponse.redirect(`${SITE}/presave/${releaseId}?saved=true`);
}
