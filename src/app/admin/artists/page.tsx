"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Music2, Globe, CheckCircle2, Clock, XCircle } from "lucide-react";

type ReleaseRow = {
  email: string;
  artist_name: string;
  genre: string | null;
  country: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
};

type ProfileRow = {
  email: string;
  artist_name: string | null;
  bio: string | null;
  country: string | null;
  artist_image_url: string | null;
};

type Artist = {
  email: string;
  artist_name: string;
  bio: string | null;
  country: string | null;
  genre: string | null;
  photo: string | null;
  total_releases: number;
  approved_releases: number;
  latest_status: "pending" | "approved" | "rejected";
  joined: string;
};

const statusCfg = {
  approved: { icon: CheckCircle2, label: "Approved", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
  pending:  { icon: Clock,         label: "Pending",  color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  rejected: { icon: XCircle,       label: "Rejected", color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20" },
};

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const [{ data: releases }, { data: profiles }] = await Promise.all([
        supabase
          .from("releases")
          .select("email, artist_name, genre, country, status, submitted_at")
          .order("submitted_at", { ascending: false }),
        supabase
          .from("artist_profiles")
          .select("email, artist_name, bio, country, artist_image_url"),
      ]);

      const profileMap: Record<string, ProfileRow> = {};
      for (const p of profiles ?? []) profileMap[p.email] = p;

      const byEmail: Record<string, ReleaseRow[]> = {};
      for (const r of (releases ?? []) as ReleaseRow[]) {
        if (!byEmail[r.email]) byEmail[r.email] = [];
        byEmail[r.email].push(r);
      }

      const built: Artist[] = Object.entries(byEmail).map(([email, rows]) => {
        const prof = profileMap[email];
        const latest = rows[0];
        return {
          email,
          artist_name: prof?.artist_name || latest.artist_name,
          bio: prof?.bio ?? null,
          country: prof?.country || latest.country || null,
          genre: latest.genre,
          photo: prof?.artist_image_url ?? null,
          total_releases: rows.length,
          approved_releases: rows.filter((r) => r.status === "approved").length,
          latest_status: latest.status,
          joined: rows[rows.length - 1].submitted_at,
        };
      });

      built.sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime());
      setArtists(built);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = search.trim()
    ? artists.filter(
        (a) =>
          a.artist_name.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase())
      )
    : artists;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Artists", value: artists.length },
          { label: "Approved",      value: artists.filter((a) => a.approved_releases > 0).length },
          { label: "Pending",       value: artists.filter((a) => a.latest_status === "pending").length },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
            <p className="text-white font-bold text-2xl">{s.value}</p>
            <p className="text-white/40 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full bg-white/[0.03] border border-white/[0.06] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-3 rounded-xl transition-colors"
      />

      {/* Artist list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30 text-sm">No artists found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((artist) => {
            const cfg = statusCfg[artist.latest_status] ?? statusCfg.pending;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={artist.email}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black flex items-center justify-center">
                    {artist.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={artist.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Music2 size={20} className="text-[#007bff]/40" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-white font-semibold text-sm">{artist.artist_name}</p>
                        <p className="text-white/40 text-xs mt-0.5">{artist.email}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon size={12} />
                        {cfg.label}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3">
                      {artist.genre && (
                        <span className="text-white/30 text-xs">{artist.genre}</span>
                      )}
                      {artist.country && (
                        <span className="flex items-center gap-1 text-white/30 text-xs">
                          <Globe size={11} />{artist.country}
                        </span>
                      )}
                      <span className="text-white/30 text-xs">
                        {artist.total_releases} release{artist.total_releases !== 1 ? "s" : ""}
                        {artist.approved_releases > 0 && ` · ${artist.approved_releases} approved`}
                      </span>
                      <span className="text-white/20 text-xs">
                        Joined {new Date(artist.joined).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </span>
                    </div>

                    {artist.bio && (
                      <p className="text-white/40 text-xs mt-2 line-clamp-2 leading-relaxed">{artist.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
