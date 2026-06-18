import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const releaseId = req.nextUrl.searchParams.get("release_id");
  if (!releaseId) return NextResponse.json({ error: "Missing release_id" }, { status: 400 });

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://orinlabi.com";

  const params = new URLSearchParams({
    client_id:     process.env.SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri:  `${SITE}/api/presave/callback`,
    scope:         "user-library-modify",
    state:         releaseId,
    show_dialog:   "false",
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params}`);
}
