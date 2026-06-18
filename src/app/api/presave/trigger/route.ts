import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function spotifyBasic() {
  return `Basic ${Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64")}`;
}

type Presave = {
  id: string;
  spotify_user_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string | null;
};

export async function POST(req: NextRequest) {
  const { release_id } = await req.json() as { release_id: string };

  const { data: release } = await supabase
    .from("releases")
    .select("spotify_album_id")
    .eq("id", release_id)
    .maybeSingle();

  if (!release?.spotify_album_id) {
    return NextResponse.json({ error: "No Spotify album ID set for this release." }, { status: 400 });
  }

  const { data: presaves } = await supabase
    .from("presaves")
    .select("id, spotify_user_id, access_token, refresh_token, token_expires_at")
    .eq("release_id", release_id)
    .is("saved_at", null);

  if (!presaves?.length) {
    return NextResponse.json({ success: true, triggered: 0, total: 0 });
  }

  let triggered = 0;

  for (const p of presaves as Presave[]) {
    let token = p.access_token;

    // Refresh if expired
    if (p.token_expires_at && new Date(p.token_expires_at) <= new Date()) {
      const r = await fetch("https://accounts.spotify.com/api/token", {
        method:  "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: spotifyBasic(),
        },
        body: new URLSearchParams({
          grant_type:    "refresh_token",
          refresh_token: p.refresh_token,
        }),
      });
      if (r.ok) {
        const refreshed = await r.json() as { access_token: string; expires_in: number };
        token = refreshed.access_token;
        await supabase.from("presaves").update({
          access_token:     token,
          token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
        }).eq("id", p.id);
      }
    }

    const saveRes = await fetch(
      `https://api.spotify.com/v1/me/albums?ids=${encodeURIComponent(release.spotify_album_id)}`,
      {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (saveRes.ok) {
      await supabase.from("presaves")
        .update({ saved_at: new Date().toISOString() })
        .eq("id", p.id);
      triggered++;
    }
  }

  return NextResponse.json({ success: true, triggered, total: presaves.length });
}
