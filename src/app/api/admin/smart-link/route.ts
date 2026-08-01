import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const ORINLABI_EMAIL = "ralph@orinlabi.com";

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return false;
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data: { user } } = await anon.auth.getUser(token);
  return !!(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
}

// POST — create a new Orinlabi own release
export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { song_title, artist_name, genre, release_type } = body;
  if (!song_title?.trim() || !artist_name?.trim() || !genre?.trim() || !release_type?.trim()) {
    return NextResponse.json({ error: "song_title, artist_name, genre, and release_type are required" }, { status: 400 });
  }

  const { data, error } = await serviceClient()
    .from("releases")
    .insert({
      song_title:       song_title.trim(),
      artist_name:      artist_name.trim(),
      genre:            genre.trim(),
      release_type:     release_type.trim().toLowerCase(),
      release_date:     body.release_date || null,
      cover_art_url:    body.cover_art_url || null,
      store_links:      body.store_links && Object.keys(body.store_links).length ? body.store_links : null,
      ditto_smart_link: body.ditto_smart_link?.trim() || null,
      status:           "approved",
      email:            ORINLABI_EMAIL,
      submitted_at:     new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

// PATCH — update an existing Orinlabi release
export async function PATCH(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { id, ...rest } = body;
  const allowed: Record<string, unknown> = {};
  for (const field of ["song_title","artist_name","genre","release_type","release_date","cover_art_url","store_links","ditto_smart_link"]) {
    if (field in rest) allowed[field] = rest[field] ?? null;
  }

  const { error } = await serviceClient()
    .from("releases")
    .update(allowed)
    .eq("id", id)
    .eq("email", ORINLABI_EMAIL);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — remove an Orinlabi release
export async function DELETE(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await serviceClient()
    .from("releases")
    .delete()
    .eq("id", id)
    .eq("email", ORINLABI_EMAIL);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
