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
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data } = await db
    .from("releases")
    .select("artist_name, song_title, album_title, release_type, cover_art_url")
    .eq("id", id)
    .eq("presave_enabled", true)
    .maybeSingle();

  if (!data) return { title: "Pre-save | Orinlabí" };

  const title = (data.release_type === "Album" || data.release_type === "EP")
    ? (data.album_title || data.song_title)
    : data.song_title;

  return {
    title: `Pre-save: ${title} by ${data.artist_name} | Orinlabí`,
    openGraph: {
      title: `${title} — Pre-save now`,
      description: `Save "${title}" by ${data.artist_name} before it drops. Powered by Orinlabí.`,
      images: data.cover_art_url ? [data.cover_art_url] : [],
    },
  };
}

export default async function PresavePage({ params, searchParams }: Props) {
  const { id }          = await params;
  const { saved, error } = await searchParams;

  const { data: release } = await db
    .from("releases")
    .select("id, artist_name, song_title, album_title, release_type, release_date, cover_art_url, genre")
    .eq("id", id)
    .eq("presave_enabled", true)
    .maybeSingle();

  if (!release) notFound();

  const isSaved  = saved === "true";
  const isDenied = error === "denied";

  const title = (release.release_type === "Album" || release.release_type === "EP")
    ? (release.album_title || release.song_title)
    : release.song_title;

  const releaseDate = release.release_date
    ? new Date(release.release_date).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto flex flex-col items-center justify-center px-4 py-16">
      {/* Blurred cover art backdrop */}
      {release.cover_art_url && (
        <div
          className="fixed inset-0 opacity-20 blur-3xl scale-110 bg-cover bg-center"
          style={{ backgroundImage: `url(${release.cover_art_url})` }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 w-full max-w-sm">
        {/* Cover Art */}
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

        {/* Release info */}
        {releaseDate && (
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center"
            style={{ color: "#1db954" }}>
            Coming {releaseDate}
          </p>
        )}

        <h1 className="text-white text-3xl font-black text-center leading-tight mb-1.5">
          {title}
        </h1>
        <p className="text-white/50 text-base text-center mb-8">
          {release.artist_name}
        </p>

        <PresaveActions
          releaseId={release.id}
          saved={isSaved}
          denied={isDenied}
          releaseDate={releaseDate}
        />

        <p className="text-white/20 text-xs text-center mt-10">
          Distributed by Orinlabí
        </p>
      </div>
    </div>
  );
}
