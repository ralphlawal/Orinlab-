"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Loader2, Music2, Globe, CheckCircle2, Clock, XCircle,
  ChevronDown, ChevronUp, Save, User, BarChart3, Send,
  UserCheck, UserX, TrendingUp,
} from "lucide-react";

const SUPER_ADMIN = (
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ||
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",")[0]
).trim().toLowerCase();

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
  account_status: "active" | "suspended" | null;
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
  total_streams: number;
  total_royalties: number;
  latest_status: "pending" | "approved" | "rejected";
  joined: string;
  releases: ReleaseRow[];
  accountStatus: "active" | "suspended";
};

const statusCfg = {
  approved: { icon: CheckCircle2, label: "Approved", color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20" },
  pending:  { icon: Clock,        label: "Pending",  color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  rejected: { icon: XCircle,      label: "Rejected", color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20" },
};

const PLATFORMS = ["spotify", "apple_music", "youtube", "boomplay", "audiomack", "deezer", "tidal", "amazon_music"];
const PLATFORM_LABELS: Record<string, string> = {
  spotify: "Spotify", apple_music: "Apple Music", youtube: "YouTube",
  boomplay: "Boomplay", audiomack: "Audiomack", deezer: "Deezer",
  tidal: "Tidal", amazon_music: "Amazon Music",
};

function fmtN(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
    : n.toString();
}

const inputCls = "w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-3 py-2 rounded-lg transition-colors";

// ─── Artist Edit Panel ────────────────────────────────────────────────────────

function EditPanel({ artist, onSaved }: { artist: Artist; onSaved: (updated: Partial<Artist>) => void }) {
  const { requestUnlock } = usePinGate();
  const [editTab, setEditTab] = useState<"profile" | "releases" | "message">("profile");
  const [msgBody, setMsgBody]         = useState("");
  const [msgTitle, setMsgTitle]       = useState("");
  const [sendingMsg, setSendingMsg]   = useState(false);
  const [msgSent, setMsgSent]         = useState(false);

  const [name, setName]         = useState(artist.artist_name);
  const [bio, setBio]           = useState(artist.bio ?? "");
  const [country, setCountry]   = useState(artist.country ?? "");
  const [photo, setPhoto]       = useState(artist.photo ?? "");
  const [instagram, setInsta]   = useState(artist.instagram_handle ?? "");
  const [spotifyId, setSpotify] = useState(artist.spotify_artist_id ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile]   = useState(false);

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

  async function doSendMessage() {
    if (!msgTitle.trim() || !msgBody.trim()) return;
    setSendingMsg(true);
    await supabase.from("notifications").insert({
      email: artist.email,
      type: "info",
      title: msgTitle.trim(),
      body: msgBody.trim(),
      link: "/portal",
    });
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "admin-message",
        data: { email: artist.email, content: `${msgTitle.trim()}\n\n${msgBody.trim()}` },
      }),
    }).catch(() => {});
    setSendingMsg(false);
    setMsgSent(true);
    setMsgTitle("");
    setMsgBody("");
    setTimeout(() => setMsgSent(false), 3000);
  }

  return (
    <div className="mt-4 border-t border-white/[0.06] pt-4">
      <div className="flex gap-1 mb-4">
        {(["profile", "releases", "message"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setEditTab(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              editTab === t ? "bg-[#007bff]/15 text-[#007bff]" : "text-white/40 hover:text-white"
            }`}
          >
            {t === "profile" ? <User size={12} /> : t === "releases" ? <BarChart3 size={12} /> : <Send size={12} />}
            {t === "profile" ? "Profile" : t === "releases" ? `Releases (${artist.releases.length})` : "Message"}
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

      {/* ── Message tab ── */}
      {editTab === "message" && (
        <div className="space-y-3">
          <p className="text-white/30 text-xs">Send a direct message to <strong className="text-white/60">{artist.artist_name}</strong>. It will appear in their portal notifications and be emailed to <strong className="text-white/60">{artist.email}</strong>.</p>
          <div>
            <label className="block text-white/50 text-xs mb-1">Title / Subject</label>
            <input className={inputCls} value={msgTitle} onChange={e => setMsgTitle(e.target.value)} placeholder="e.g. Your release is ready to go live" />
          </div>
          <div>
            <label className="block text-white/50 text-xs mb-1">Message</label>
            <textarea className={`${inputCls} resize-none`} rows={4} value={msgBody} onChange={e => setMsgBody(e.target.value)} placeholder="Write your message to the artist…" />
          </div>
          <button
            onClick={() => requestUnlock(doSendMessage)}
            disabled={sendingMsg || msgSent || !msgTitle.trim() || !msgBody.trim()}
            className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {sendingMsg ? <><Loader2 size={12} className="animate-spin" /> Sending…</> : msgSent ? <><CheckCircle2 size={12} /> Sent!</> : <><Send size={12} /> Send Message</>}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminArtistsPage() {
  const { requestUnlock } = usePinGate();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [togglingEmail, setTogglingEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const email = (data.session?.user?.email ?? "").toLowerCase();
      setIsSuperAdmin(email === SUPER_ADMIN);
    });
  }, []);

  useEffect(() => {
    async function load() {
      const [{ data: releases }, { data: profiles }] = await Promise.all([
        supabase
          .from("releases")
          .select("id, email, artist_name, song_title, genre, country, status, submitted_at, streams, royalties_usd, cover_art_url")
          .order("submitted_at", { ascending: false }),
        supabase
          .from("artist_profiles")
          .select("email, artist_name, bio, country, artist_image_url, instagram_handle, spotify_artist_id, account_status"),
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
        const totalStreams = rows.reduce((sum, r) =>
          sum + Object.values(r.streams ?? {}).reduce((a, b) => a + b, 0), 0);
        const totalRoyalties = rows.reduce((sum, r) => sum + (r.royalties_usd ?? 0), 0);
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
          total_streams: totalStreams,
          total_royalties: totalRoyalties,
          latest_status: latest.status,
          joined: rows[rows.length - 1].submitted_at,
          releases: rows,
          accountStatus: (prof?.account_status === "suspended" ? "suspended" : "active") as "active" | "suspended",
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

  async function toggleStatus(email: string, current: "active" | "suspended") {
    const newStatus = current === "suspended" ? "active" : "suspended";
    setTogglingEmail(email);
    await supabase.from("artist_profiles").upsert(
      { email, account_status: newStatus },
      { onConflict: "email" }
    );
    setArtists((prev) =>
      prev.map((a) => (a.email === email ? { ...a, accountStatus: newStatus } : a))
    );
    // Notify artist via in-app notification
    await supabase.from("notifications").insert({
      email,
      type: newStatus === "suspended" ? "warning" : "success",
      title: newStatus === "suspended" ? "Account Suspended" : "Account Reactivated",
      body: newStatus === "suspended"
        ? "Your Orinlabí account has been suspended. Please contact support for details."
        : "Your Orinlabí account has been reactivated. Welcome back!",
      link: "/portal",
    });
    setTogglingEmail(null);
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
      {/* Stats — now includes active/suspended counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Artists",  value: artists.length },
          { label: "Active",         value: artists.filter((a) => a.accountStatus === "active").length,    color: "text-green-400" },
          { label: "Suspended",      value: artists.filter((a) => a.accountStatus === "suspended").length, color: "text-red-400" },
          { label: "Pending Review", value: artists.filter((a) => a.latest_status === "pending").length,   color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
            <p className={`font-bold text-2xl ${s.color ?? "text-white"}`}>{s.value}</p>
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
            const avatarSrc = artist.photo || artist.releases.find((r) => r.cover_art_url)?.cover_art_url || null;
            const isSuspended = artist.accountStatus === "suspended";
            const isToggling = togglingEmail === artist.email;

            return (
              <div
                key={artist.email}
                className={`border rounded-2xl p-5 transition-colors ${
                  isSuspended
                    ? "bg-red-500/[0.04] border-red-500/20"
                    : "bg-white/[0.03] border-white/[0.06]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`relative w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black ${isSuspended ? "opacity-50 grayscale" : ""}`}>
                    {avatarSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarSrc} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Music2 size={20} className="text-[#007bff]/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-semibold text-sm ${isSuspended ? "text-white/50" : "text-white"}`}>
                            {artist.artist_name}
                          </p>
                          {isSuspended && (
                            <span className="text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                              SUSPENDED
                            </span>
                          )}
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">{artist.email}</p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={12} />
                          {cfg.label}
                        </div>

                        {/* Activate / Suspend toggle */}
                        <button
                          onClick={() => requestUnlock(() => toggleStatus(artist.email, artist.accountStatus))}
                          disabled={isToggling}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border disabled:opacity-50 ${
                            isSuspended
                              ? "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20"
                              : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : isSuspended ? (
                            <><UserCheck size={12} /> Activate</>
                          ) : (
                            <><UserX size={12} /> Suspend</>
                          )}
                        </button>

                        {isSuperAdmin && (
                          <button
                            onClick={() => setExpanded(isOpen ? null : artist.email)}
                            className="flex items-center gap-1 text-white/40 hover:text-[#007bff] text-xs font-medium transition-colors px-2 py-1 rounded-lg hover:bg-[#007bff]/10"
                          >
                            {isOpen ? <><ChevronUp size={14} /> Close</> : <><ChevronDown size={14} /> Edit</>}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
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
                      {artist.total_streams > 0 && (
                        <span className="flex items-center gap-1 text-white/30 text-xs">
                          <TrendingUp size={10} />{fmtN(artist.total_streams)} streams
                        </span>
                      )}
                      {artist.total_royalties > 0 && (
                        <span className="text-white/30 text-xs">${artist.total_royalties.toFixed(2)} royalties</span>
                      )}
                      <span className="text-white/20 text-xs">
                        Joined {new Date(artist.joined).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </span>
                    </div>

                    {artist.bio && (
                      <p className="text-white/40 text-xs mt-2 line-clamp-2 leading-relaxed">{artist.bio}</p>
                    )}
                  </div>
                </div>

                {/* Edit panel — super admin only */}
                {isOpen && isSuperAdmin && (
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
