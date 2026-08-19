import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimitResponse } from "@/lib/rateLimit";

function makeDb(token?: string) {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      });
}

async function getAuthedUser(token: string | null) {
  if (!token) return null;
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: { user } } = await anon.auth.getUser(token);
  return user?.email ? user : null;
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] ?? null;
  const user = await getAuthedUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = makeDb(token ?? undefined);
  const { data, error } = await db
    .from("playlist_pitches")
    .select("id, song_title, genre, pitch_notes, status, admin_notes, created_at")
    .eq("email", user.email!)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pitches: data ?? [] });
}

export async function POST(req: NextRequest) {
  const limited = rateLimitResponse(req, 10, 60_000);
  if (limited) return limited;

  const token = req.headers.get("authorization")?.split(" ")[1] ?? null;
  const user = await getAuthedUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { release_id, artist_name, song_title, genre, mood, pitch_notes } = body;
  if (!release_id || !pitch_notes) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const db = makeDb(token ?? undefined);

  const { error } = await db.from("playlist_pitches").insert({
    email: user.email,
    artist_name: artist_name ?? "",
    release_id,
    song_title: song_title ?? "",
    genre: genre ?? null,
    mood: mood ?? null,
    pitch_notes,
    status: "pending",
  });

  if (error) {
    console.error("pitch insert:", error.message);
    return NextResponse.json({ error: "Failed to save pitch" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
