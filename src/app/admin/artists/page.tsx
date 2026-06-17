"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Loader2, Music2, Globe, CheckCircle2, Clock, XCircle,
  ChevronDown, ChevronUp, Save, User, BarChart3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReleaseRow = {
  id: string;
  email: string;
  artist_name: string;
  song_title: string | null;
  genre: string | null;
  country: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  streams: Record<string, number> | null;
  royalties_usd: number | null;
  cover_art_url: string | null;
};

type ProfileRow = {
  email: string;
  artist_name: string | null;
  bio: string | null;
  country: string | null;
  artist_image_url: string | null;
  instagram_handle: string | null;
  spotify_artist_id: string | null;
};

type Artist = {
  email: string;
  artist_name: string;
  bio: string | null;
  country: string | null;
  genre: string | null;
  photo: string | null;
  instagram_handle: string | null;
  spotify_artist_id: string | null;
  total_releases: number;
  approved_releases: number;
  latest_status: "pending" | "approved" | "rejected";
  joined: string;
  releases: ReleaseRow[];
};

const statusCfg = {
  approved: { icon: CheckCircle2, label: "Approved", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
  pending:  { icon: Clock,         label: "Pending",  color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  rejected: { icon: XCircle,       label: "Rejected", color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20" },
};

const PLATFORMS = ["spotify", "apple_music", "youtube", "boomplay", "audiomack", "deezer", "tidal", "amazon_music"];
const PLATFORM_LABELS: Record<string, string> = {
  spotify: "Spotify", apple_music: "Apple Music", youtube: "YouTube",
  boomplay: "Boomplay", audiomack: "Audiomack", deezer: "Deezer",
  tidal: "Tidal", amazon_music: "Amazon Music",
};

const inputCls = "w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-3 py-2 rounded-lg transition-colors";

// ─── Artist Edit Panel ────────────────────────────────────────────────────────

function EditPanel({ artist, onSaved }: { artist: Artist; onSaved: (updated: Partial<Artist>) => void }) {
  const { requestUnlock } = usePinGate();
  const [editTab, setEditTab] = useState<"profile" | "releases">("profile");

  // Profile state
  const [name, setName]         = useState(artist.artist_name);
  const [bio, setBio]           = useState(artist.bio ?? "");
  const [country, setCountry]   = useState(artist.country ?? "");
  const [photo, setPhoto]       = useState(artist.photo ?? "");
  const [instagram, setInsta]   = useState(artist.instagram_handle ?? "");
  const [spotifyId, setSpotify] = useState(artist.spotify_artist_id ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile]   = useState(false);

  // Release stats state — keyed by release ID
  const [relStats, setRelStats] = useState<Record<string, { streams: Record<string, string>; royalties: string }>>(
    () => {
      const init: Record<string, { streams: Record<string, string>; royalties: string }> = {};
      for (const r of artist.releases) {
        const s: Record<string, string> = {};
        for (const p of PLATFORMS) s[p] = String(r.streams?.[p] ?? "");
        init[r.id] = { streams: s, royalties: String(r.royalties_usd ?? "") };
      }
      return init;
    }
  );
  const [savingRelease, setSavingRelease] = useState<string | null>(null);
  const [savedRelease, setSavedRelease]   = useState<string | null>(null);

  async function doSaveProfile() {
    setSavingProfile(true);
    await supabase.from("artist_profiles").upsert(
      {
        email: artist.email,
        artist_name: name.trim() || null,
        bio: bio.trim() || null,
        country: country.trim() || null,
        artist_image_url: photo.trim() || null,
        instagram_handle: instagram.trim() || null,
        spotify_artist_id: spotifyId.trim() || null,
      },
      { onConflict: "email" }
    );
    setSavingProfile(false);
    setSavedProfile(true);
    setTimeout(() => setSavedProfile(false), 3000);
    onSaved({ artist_name: name, bio: bio || null, country: country || null, photo: photo || null });
  }

  async function doSaveRelease(releaseId: string) {
    setSavingRelease(releaseId);
    const stats = relStats[releaseId];
    const streamsObj: Record<string, number> = {};
    for (const [p, v] of Object.entries(stats.streams)) {
      const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(n) && n > 0) streamsObj[p] = n;
    }
    const royalties = parseFloat(stats.royalties) || 0;
    await supabase.from("releases").update({
      streams: Object.keys(streamsObj).length > 0 ? streamsObj : null,
      royalties_usd: royalties || null,
    }).eq("id", releaseId);
    setSavingRelease(null);
    setSavedRelease(releaseId);
    setTimeout(() => setSavedRelease(null), 3000);
  }

  function setStreamVal(releaseId: string, platform: string, val: string) {
    setRelStats((prev) => ({
      ...prev,
      [releaseId]: { ...prev[releaseId], streams: { ...prev[releaseId].streams, [platform]: val } },
    }));
  }

  function setRoyalties(releaseId: string, val: string) {
    setRelStats((prev) => ({
      ...prev,
      [releaseId]: { ...prev[releaseId], royalties: val },
    }));
  }

  return (
    <div className="mt-4 border-t border-white/[0.06] pt-4">
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-4">
        {(["profile", "releases"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setEditTab(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              editTab === t ? "bg-[#007bff]/15 text-[#007bff]" : "text-white/40 hover:text-white"
            }`}
          >
            {t === "profile" ? <User size={12} /> : <BarChart3 size={12} />}
            {t === "profile" ? "Profile" : `Releases (${artist.releases.length})`}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {editTab === "profile" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs mb-1">Artist Name</label>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Country</label>
              <input className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Nigeria" />
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1">Bio</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short artist bio…"
            />
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1">Photo URL</label>
            <input className={inputCls} value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://res.cloudinary.com/…" />
          </div>

          {photo && (
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/50 text-xs mb-1">Instagram Handle</label>
              <input className={inputCls} value={instagram} onChange={(e) => setInsta(e.target.value)} placeholder="@artistname" />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Spotify Artist ID</label>
              <input className={inputCls} value={spotifyId} onChange={(e) => setSpotify(e.target.value)} placeholder="4Z8W4fKeB5YxbusRsdQVPb" />
            </div>
          </div>

          <button
            onClick={() => requestUnlock(doSaveProfile)}
            disabled={savingProfile}
            className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {savingProfile ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : savedProfile ? <><CheckCircle2 size={12} /> Saved</> : <><Save size={12} /> Save Profile</>}
          </button>
        </div>
      )}

      {/* ── Releases tab ── */}
      {editTab === "releases" && (
        <div className="space-y-4">
          {artist.releases.length === 0 && (
            <p className="text-white/30 text-xs">No releases found for this artist.</p>
          )}
          {artist.releases.map((r) => {
            const cfg = statusCfg[r.status] ?? statusCfg.pending;
            const stats = relStats[r.id];
            const isSaving = savingRelease === r.id;
            const isSaved  = savedRelease  === r.id;

            return (
              <div key={r.id} className="border border-white/[0.06] rounded-xl p-4 space-y-3">
                {/* Release header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {r.cover_art_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.cover_art_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                    ) : (
                      <div className="w-9 h-9 bg-[#007bff]/10 rounded-lg flex items-center justify-center">
                        <Music2 size={14} className="text-[#007bff]/40" />
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">{r.song_title ?? "Untitled"}</p>
                      <p className="text-white/30 text-xs">{r.genre} · {new Date(r.submitted_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Streams */}
                <div>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Streams per Platform</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((p) => (
                      <div key={p} className="flex items-center gap-2">
                        <span className="text-white/30 text-xs w-24 flex-shrink-0">{PLATFORM_LABELS[p]}</span>
                        <input
                          className={`${inputCls} py-1.5`}
                          value={stats.streams[p]}
                          onChange={(e) => setStreamVal(r.id, p, e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Royalties */}
                <div className="flex items-center gap-3">
                  <label className="text-white/40 text-xs w-24 flex-shrink-0">Royalties (USD)</label>
                  <input
                    className={`${inputCls} py-1.5 max-w-[120px]`}
                    value={stats.royalties}
                    onChange={(e) => setRoyalties(r.id, e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <button
                  onClick={() => requestUnlock(() => doSaveRelease(r.id))}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  {isSaving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : isSaved ? <><CheckCircle2 size={12} className="text-green-400" /> Saved</> : <><Save size={12} /> Save Stats</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: releases }, { data: profiles }] = await Promise.all([
        supabase
          .from("releases")
          .select("id, email, artist_name, song_title, genre, country, status, submitted_at, streams, royalties_usd, cover_art_url")
          .order("submitted_at", { ascending: false }),
        supabase
          .from("artist_profiles")
          .select("email, artist_name, bio, country, artist_image_url, instagram_handle, spotify_artist_id"),
      ]);

      const profileMap: Record<string, ProfileRow> = {};
      for (const p of (profiles ?? []) as ProfileRow[]) profileMap[p.email] = p;

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
          instagram_handle: prof?.instagram_handle ?? null,
          spotify_artist_id: prof?.spotify_artist_id ?? null,
          total_releases: rows.length,
          approved_releases: rows.filter((r) => r.status === "approved").length,
          latest_status: latest.status,
          joined: rows[rows.length - 1].submitted_at,
          releases: rows,
        };
      });

      built.sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime());
      setArtists(built);
      setLoading(false);
    }
    load();
  }, []);

  function handleSaved(email: string, updated: Partial<Artist>) {
    setArtists((prev) =>
      prev.map((a) => (a.email === email ? { ...a, ...updated } : a))
    );
  }

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
          { label: "Total Artists",  value: artists.length },
          { label: "Approved",       value: artists.filter((a) => a.approved_releases > 0).length },
          { label: "Pending Review", value: artists.filter((a) => a.latest_status === "pending").length },
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
            const isOpen = expanded === artist.email;

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
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={12} />
                          {cfg.label}
                        </div>
                        <button
                          onClick={() => setExpanded(isOpen ? null : artist.email)}
                          className="flex items-center gap-1 text-white/40 hover:text-[#007bff] text-xs font-medium transition-colors px-2 py-1 rounded-lg hover:bg-[#007bff]/10"
                        >
                          {isOpen ? <><ChevronUp size={14} /> Close</> : <><ChevronDown size={14} /> Edit</>}
                        </button>
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

                {/* Edit panel */}
                {isOpen && (
                  <EditPanel
                    artist={artist}
                    onSaved={(updated) => handleSaved(artist.email, updated)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
