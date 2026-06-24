"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Loader2, Music, Users, Play, ArrowRight } from "lucide-react";

type Artist = {
  email: string;
  artist_name: string | null;
  artist_image_url: string | null;
  artist_type: string | null;
  country: string | null;
  coverArt: string | null;
  releaseCount: number;
  latestRelease: { song_title: string; genre: string } | null;
};

export default function LabelPortalArtistsPage() {
  const [artists, setArtists]   = useState<Artist[]>([]);
  const [labelName, setLabelName] = useState("");
  const [loading, setLoading]   = useState(true);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: label } = await supabase
        .from("label_profiles")
        .select("name,status")
        .eq("email", session.user.email!)
        .maybeSingle();

      if (!label || label.status !== "approved") {
        setApproved(false);
        setLoading(false);
        return;
      }

      setApproved(true);
      setLabelName(label.name);

      const { data: profiles } = await supabase
        .from("artist_profiles")
        .select("email,artist_name,artist_image_url,artist_type,country")
        .ilike("record_label", label.name);

      if (!profiles?.length) { setLoading(false); return; }

      const emails = profiles.map((p) => p.email);
      const { data: releases } = await supabase
        .from("releases")
        .select("email,song_title,genre,cover_art_url")
        .in("email", emails)
        .eq("status", "approved")
        .order("submitted_at", { ascending: false });

      const artistList: Artist[] = profiles.map((p) => {
        const artistReleases = (releases ?? []).filter((r) => r.email === p.email);
        return {
          ...p,
          coverArt: artistReleases.find((r) => r.cover_art_url)?.cover_art_url ?? null,
          releaseCount: artistReleases.length,
          latestRelease: artistReleases[0] ? { song_title: artistReleases[0].song_title, genre: artistReleases[0].genre } : null,
        };
      });

      setArtists(artistList);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-white/40 text-sm">Roster is available once your label is approved.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white font-bold text-2xl mb-1">Your Roster</h1>
          <p className="text-white/40 text-sm">
            Artists whose profile lists <strong className="text-white/60">{labelName}</strong> as their record label
          </p>
        </div>
        <span className="text-white/30 text-sm">{artists.length} artist{artists.length !== 1 ? "s" : ""}</span>
      </div>

      {artists.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-[#007bff]/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Users size={28} className="text-[#007bff]/40" />
          </div>
          <p className="text-white/40 text-sm mb-2">No artists linked to your label yet.</p>
          <p className="text-white/25 text-xs max-w-xs mx-auto">
            Artists appear here when they set their &ldquo;Record Label&rdquo; field to{" "}
            <strong className="text-white/40">{labelName}</strong> in their Artist Portal profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {artists.map((a) => {
            const heroImg = a.artist_image_url ?? a.coverArt;
            const slug = encodeURIComponent((a.artist_name ?? "").trim());
            return (
              <div key={a.email} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="relative aspect-square bg-gradient-to-br from-[#007bff]/10 to-black overflow-hidden">
                  {heroImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={heroImg} alt={a.artist_name ?? ""} className="absolute inset-0 w-full h-full object-cover object-center" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Music size={32} className="text-[#007bff]/20" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-white font-semibold truncate">{a.artist_name}</p>
                  <div className="flex items-center gap-2 mt-0.5 mb-3">
                    {a.artist_type && <p className="text-white/40 text-xs">{a.artist_type}</p>}
                    {a.country && <p className="text-white/25 text-xs">· {a.country}</p>}
                  </div>
                  {a.latestRelease && (
                    <div className="flex items-center gap-2 bg-white/[0.04] rounded-xl p-2.5 mb-3">
                      <div className="w-6 h-6 bg-[#007bff]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Play size={11} className="text-[#007bff]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/30 text-[10px]">Latest · {a.releaseCount} release{a.releaseCount !== 1 ? "s" : ""}</p>
                        <p className="text-white text-xs font-medium truncate">{a.latestRelease.song_title}</p>
                      </div>
                    </div>
                  )}
                  <Link
                    href={`/artists/${slug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-[#007bff] text-xs hover:underline"
                  >
                    Public Page <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
