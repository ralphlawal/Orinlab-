import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import type { Metadata } from "next";
import PresaveActions from "./PresaveActions";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
};

const SELECT = "id, artist_name, song_title, album_title, release_type, release_date, cover_art_url, presave_url, presave_enabled";

async function getRelease(id: string) {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(id);

  if (isUUID) {
    // Fetch by ID — presave_enabled/presave_url check happens in the render
    const { data } = await db
      .from("releases")
      .select(SELECT)
      .eq("id", id)
      .maybeSingle();
    return data;
  }

  // Slug lookup: 'staeci-moore' → find by artist_name (no presave filter; render handles it)
  const nameQuery = id.replace(/-/g, " ");
  const { data: rows } = await db
    .from("releases")
    .select(SELECT)
    .ilike("artist_name", `%${nameQuery}%`)
    .order("created_at", { ascending: false })
    .limit(1);
  return rows?.[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getRelease(id);
  if (!data) return { title: "Pre-save | OrinlabÍ" };

  const title =
    data.release_type === "Album" || data.release_type === "EP"
      ? data.album_title || data.song_title
      : data.song_title;

  const releaseDate = data.release_date
    ? new Date(data.release_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return {
    title: `${title} · ${data.artist_name}`,
    description: releaseDate ? `Pre-save now — dropping ${releaseDate}` : `Pre-save ${title} by ${data.artist_name}`,
    openGraph: {
      title: `${title} · ${data.artist_name}`,
      description: releaseDate ? `Pre-save now — dropping ${releaseDate}` : `Pre-save now`,
      images: data.cover_art_url ? [{ url: data.cover_art_url, width: 1200, height: 1200 }] : [],
      siteName: "OrinlabÍ",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${data.artist_name}`,
      description: releaseDate ? `Pre-save now — dropping ${releaseDate}` : `Pre-save now`,
      images: data.cover_art_url ? [data.cover_art_url] : [],
    },
  };
}

export default async function PresavePage({ params }: Props) {
  const { id } = await params;
  const release = await getRelease(id);

  if (!release || !release.presave_enabled || !release.presave_url) notFound();

  const title =
    release.release_type === "Album" || release.release_type === "EP"
      ? release.album_title || release.song_title
      : release.song_title;

  const releaseDate = release.release_date
    ? new Date(release.release_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    // pt-24 ensures cover art clears the fixed navbar (h-16 + breathing room)
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto flex flex-col items-center justify-start pt-24 pb-16 px-4">
      {release.cover_art_url && (
        <div
          className="fixed inset-0 opacity-20 blur-3xl scale-110 bg-cover bg-center"
          style={{ backgroundImage: `url(${release.cover_art_url})` }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 w-full max-w-sm">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl mb-7">
          {release.cover_art_url ? (
            <Image
              src={release.cover_art_url}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <span style={{ fontSize: 64, opacity: 0.15 }}>♪</span>
            </div>
          )}
        </div>

        {releaseDate && (
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3 text-center"
            style={{ color: "#1db954" }}
          >
            Coming {releaseDate}
          </p>
        )}

        <h1 className="text-white text-3xl font-black text-center leading-tight mb-1.5">
          {title}
        </h1>
        <p className="text-white/50 text-base text-center mb-8">{release.artist_name}</p>

        <PresaveActions releaseId={release.id} presaveUrl={release.presave_url} />

        <p className="text-white/20 text-xs text-center mt-10">Distributed by OrinlabÍ Records</p>
      </div>
    </div>
  );
}
