"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, XCircle, FileAudio, Image as ImageIcon, ExternalLink, Loader2, Link2 } from "lucide-react";

const PLATFORMS = [
  { key: "spotify",       label: "Spotify" },
  { key: "apple_music",   label: "Apple Music" },
  { key: "boomplay",      label: "Boomplay" },
  { key: "audiomack",     label: "Audiomack" },
  { key: "youtube_music", label: "YouTube Music" },
  { key: "deezer",        label: "Deezer" },
  { key: "tidal",         label: "TIDAL" },
  { key: "amazon_music",  label: "Amazon Music" },
];

type Release = {
  id: string;
  artist_name: string;
  legal_name: string;
  email: string;
  phone: string;
  country: string;
  artist_bio: string;
  social_links: string;
  sample_url: string;
  release_type: string;
  song_title: string;
  album_title: string;
  genre: string;
  release_date: string;
  explicit: boolean;
  audio_file_url: string;
  cover_art_url: string;
  songwriters: string;
  producers: string;
  featured_artists: string;
  isrc: string;
  upc: string | null;
  copyright_owner: string;
  copyright_year: string;
  publishing_info: string;
  status: string;
  submitted_at: string;
  review_notes: string;
  store_links: Record<string, string> | null;
  streams: Record<string, number> | null;
  royalties_usd: number | null;
  contract_signed_at: string | null;
  contract_signature: string | null;
};

type Filter = "all" | "pending" | "approved" | "rejected";

type ArtistProfile = {
  artist_type: string | null;
  artist_image_url: string | null;
  spotify_artist_id: string | null;
  apple_music_artist_id: string | null;
  audiomack_id: string | null;
  boomplay_id: string | null;
  soundcloud_id: string | null;
  deezer_id: string | null;
  amazon_id: string | null;
  instagram_handle: string | null;
  x_handle: string | null;
  tiktok_username: string | null;
  youtube_channel: string | null;
  facebook_url: string | null;
  website_url: string | null;
};

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [selected, setSelected] = useState<Release | null>(null);
  const [notes, setNotes] = useState("");
  const [storeLinks, setStoreLinks] = useState<Record<string, string>>({});
  const [savingLinks, setSavingLinks] = useState(false);
  const [linksSaved, setLinksSaved] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null | undefined>(undefined);
  const [streams, setStreams] = useState<Record<string, number>>({});
  const [savingStreams, setSavingStreams] = useState(false);
  const [streamsSaved, setStreamsSaved] = useState(false);
  const [royalties, setRoyalties] = useState("");
  const [savingRoyalties, setSavingRoyalties] = useState(false);
  const [royaltiesSaved, setRoyaltiesSaved] = useState(false);
  const [editIsrc, setEditIsrc] = useState("");
  const [editUpc, setEditUpc] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaSaved, setMetaSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [notifyingLive, setNotifyingLive] = useState(false);
  const [liveNotified, setLiveNotified] = useState(false);

  async function load() {
    setLoading(true);
    let query = supabase.from("releases").select("*").order("submitted_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setReleases(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function notifyLive() {
    if (!selected) return;
    setNotifyingLive(true);
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "live", release: { ...selected, store_links: storeLinks } }),
    }).catch(() => {});
    setNotifyingLive(false);
    setLiveNotified(true);
  }

  function openRelease(r: Release) {
    setSelected(r);
    setNotes(r.review_notes ?? "");
    setStoreLinks(r.store_links ?? {});
    setStreams(r.streams ?? {});
    setRoyalties(r.royalties_usd?.toString() ?? "");
    setEditIsrc(r.isrc ?? "");
    setEditUpc(r.upc ?? "");
    setLinksSaved(false);
    setStreamsSaved(false);
    setRoyaltiesSaved(false);
    setMetaSaved(false);
    setLiveNotified(false);
    setArtistProfile(undefined);
    supabase
      .from("artist_profiles")
      .select("*")
      .eq("email", r.email)
      .single()
      .then(({ data }) => setArtistProfile((data as ArtistProfile) ?? null));
  }

  async function saveStoreLinks() {
    if (!selected) return;
    setSavingLinks(true);
    // Filter out empty strings before saving
    const filtered = Object.fromEntries(
      Object.entries(storeLinks).filter(([, v]) => v.trim() !== "")
    );
    await supabase.from("releases").update({ store_links: filtered }).eq("id", selected.id);
    setSelected((s) => s ? { ...s, store_links: filtered } : s);
    setSavingLinks(false);
    setLinksSaved(true);
    load();
  }

  async function saveStreams() {
    if (!selected) return;
    setSavingStreams(true);
    const filtered = Object.fromEntries(
      Object.entries(streams).filter(([, v]) => v > 0)
    );
    await supabase.from("releases").update({ streams: filtered }).eq("id", selected.id);
    setSelected((s) => s ? { ...s, streams: filtered } : s);
    setSavingStreams(false);
    setStreamsSaved(true);
  }

  async function saveRoyalties() {
    if (!selected) return;
    setSavingRoyalties(true);
    const val = parseFloat(royalties) || 0;
    await supabase.from("releases").update({ royalties_usd: val }).eq("id", selected.id);
    setSelected((s) => s ? { ...s, royalties_usd: val } : s);
    setSavingRoyalties(false);
    setRoyaltiesSaved(true);
  }

  async function saveMeta() {
    if (!selected) return;
    setSavingMeta(true);
    await supabase.from("releases").update({ isrc: editIsrc || null, upc: editUpc || null }).eq("id", selected.id);
    setSelected((s) => s ? { ...s, isrc: editIsrc, upc: editUpc || null } : s);
    setSavingMeta(false);
    setMetaSaved(true);
  }

  async function saveNotes() {
    if (!selected) return;
    setUpdating(true);
    await supabase.from("releases").update({ review_notes: notes }).eq("id", selected.id);
    setSelected((s) => s ? { ...s, review_notes: notes } : s);
    setUpdating(false);
    load();
  }

  async function updateStatus(id: string, status: "approved" | "rejected") {
    if (!selected) return;
    setUpdating(true);

    const updatedRelease = { ...selected, review_notes: notes, status };

    await supabase.from("releases").update({
      status,
      review_notes: notes,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);

    // Send email notification to artist
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: status, release: updatedRelease }),
    }).catch(() => {});

    // Admin record copy
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: status === "approved" ? "release-approved" : "release-rejected",
        data: {
          artist_name:  selected.artist_name,
          legal_name:   selected.legal_name,
          email:        selected.email,
          song_title:   selected.song_title,
          release_type: selected.release_type,
          genre:        selected.genre,
          country:      selected.country,
          review_notes: notes || null,
          reviewed_at:  new Date().toISOString(),
          release_id:   selected.id,
        },
      }),
    }).catch(() => {});

    setUpdating(false);
    setSelected(null);
    setNotes("");
    setStoreLinks({});
    setStreams({});
    setRoyalties("");
    setEditIsrc("");
    setEditUpc("");
    setLinksSaved(false);
    setStreamsSaved(false);
    setRoyaltiesSaved(false);
    setMetaSaved(false);
    setLiveNotified(false);
    setArtistProfile(undefined);
    load();
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl">Releases</h1>
          <p className="text-white/40 text-sm mt-1">Review and manage artist submissions.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artist or title…"
            className="bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/80 placeholder-white/25 text-sm px-4 py-2 rounded-xl transition-colors w-full sm:w-52"
          />
          {/* Filter tabs */}
          <div className="flex gap-2 bg-white/[0.04] border border-white/[0.06] p-1 rounded-xl">
            {(["pending", "approved", "rejected", "all"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  filter === f ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-[#007bff] animate-spin" />
        </div>
      ) : releases.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          No {filter === "all" ? "" : filter} releases found.
        </div>
      ) : (
        <div className="space-y-3">
          {releases.filter((r) => !search || r.artist_name.toLowerCase().includes(search.toLowerCase()) || r.song_title.toLowerCase().includes(search.toLowerCase())).map((r) => (
            <div
              key={r.id}
              className="bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-white font-semibold">{r.song_title}</h3>
                    <StatusBadge status={r.status} />
                    {r.explicit && (
                      <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-medium">
                        Explicit
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    <p className="text-white/60 text-sm">{r.artist_name}</p>
                    <p className="text-white/30 text-sm">{r.genre} · {r.release_type}</p>
                    <p className="text-white/30 text-sm">{r.country}</p>
                    <p className="text-white/30 text-sm">
                      Submitted {new Date(r.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3 mt-3">
                    {r.audio_file_url && (
                      <a href={r.audio_file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#007bff] hover:underline">
                        <FileAudio size={13} /> Audio
                      </a>
                    )}
                    {r.cover_art_url && (
                      <a href={r.cover_art_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#007bff] hover:underline">
                        <ImageIcon size={13} /> Cover Art
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openRelease(r)}
                    className="text-xs font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} /> Details
                  </button>
                  {r.status !== "approved" && (
                    <button
                      onClick={() => openRelease(r)}
                      className="text-xs font-medium bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      onClick={() => openRelease(r)}
                      className="text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail / action modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/[0.06] flex items-start justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">{selected.song_title}</h3>
                <p className="text-white/40 text-sm mt-0.5">{selected.artist_name}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="p-6 space-y-4">
              {/* Artist info */}
              <Section title="Artist">
                <Row label="Legal Name" value={selected.legal_name} />
                <Row label="Email" value={selected.email} />
                <Row label="Phone" value={selected.phone} />
                <Row label="Country" value={selected.country} />
              </Section>

              {/* Application details */}
              {(selected.artist_bio || selected.social_links || selected.sample_url) && (
                <Section title="Application">
                  {selected.artist_bio && (
                    <div>
                      <span className="text-white/40 text-xs block mb-1">About the Artist</span>
                      <p className="text-white/80 text-xs leading-relaxed">{selected.artist_bio}</p>
                    </div>
                  )}
                  {selected.social_links && (
                    <Row label="Social Links" value={selected.social_links} />
                  )}
                  {selected.sample_url && (
                    <div className="flex gap-3">
                      <span className="text-white/40 text-xs w-28 flex-shrink-0 pt-0.5">Sample Work</span>
                      <a
                        href={selected.sample_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#007bff] text-xs hover:underline break-all"
                      >
                        {selected.sample_url}
                      </a>
                    </div>
                  )}
                </Section>
              )}

              {/* Release info */}
              <Section title="Release">
                <Row label="Type" value={selected.release_type} />
                <Row label="Genre" value={selected.genre} />
                <Row label="Release Date" value={selected.release_date} />
                <Row label="Album" value={selected.album_title} />
                <Row label="Explicit" value={selected.explicit ? "Yes" : "No"} />
              </Section>

              {/* Credits */}
              <Section title="Credits">
                <Row label="Songwriters" value={selected.songwriters} />
                <Row label="Producers" value={selected.producers} />
                <Row label="Featured" value={selected.featured_artists} />
              </Section>

              {/* Metadata — editable */}
              <Section title="Metadata">
                <p className="text-white/30 text-xs mb-3">ISRC and UPC can be assigned or corrected here after submission.</p>
                <div className="space-y-2">
                  {[
                    { key: "isrc", label: "ISRC", value: editIsrc, set: setEditIsrc, placeholder: "e.g. USRC11700609" },
                    { key: "upc", label: "UPC", value: editUpc, set: setEditUpc, placeholder: "12-digit barcode (albums)" },
                  ].map(({ key, label, value, set, placeholder }) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-white/40 text-xs w-28 flex-shrink-0">{label}</span>
                      <input
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => { set(e.target.value); setMetaSaved(false); }}
                        className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors font-mono"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={saveMeta}
                  disabled={savingMeta}
                  className="mt-3 flex items-center gap-2 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] disabled:opacity-40 text-white/60 hover:text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {savingMeta ? <Loader2 size={12} className="animate-spin" /> : null}
                  {metaSaved ? "Saved ✓" : "Save Metadata"}
                </button>
              </Section>

              {/* Rights */}
              <Section title="Rights">
                <Row label="Copyright Owner" value={selected.copyright_owner} />
                <Row label="Year" value={selected.copyright_year} />
                <Row label="Publishing" value={selected.publishing_info} />
              </Section>

              {/* Files */}
              <Section title="Files">
                {selected.audio_file_url && (
                  <>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <audio controls src={selected.audio_file_url} className="w-full mt-1 rounded-xl" style={{ height: 36 }} />
                    <a href={selected.audio_file_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#007bff] text-xs hover:underline mt-1">
                      <FileAudio size={13} /> Open file in new tab
                    </a>
                  </>
                )}
                {selected.cover_art_url && (
                  <>
                    <a href={selected.cover_art_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#007bff] text-sm hover:underline">
                      <ImageIcon size={15} /> View cover art
                    </a>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected.cover_art_url} alt="Cover" className="mt-3 w-32 h-32 object-cover rounded-xl border border-white/10" />
                  </>
                )}
              </Section>

              {/* Distribution Profile */}
              <Section title="Distribution Profile">
                {artistProfile === undefined ? (
                  <div className="flex items-center gap-2 text-white/30 text-xs">
                    <Loader2 size={12} className="animate-spin" /> Loading…
                  </div>
                ) : artistProfile === null ? (
                  <p className="text-white/25 text-xs italic">
                    Artist hasn&apos;t completed their distribution profile yet.
                    {selected.status === "approved" && " They have a prompt to do so in their portal."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {artistProfile.artist_type && (
                      <Row label="Type" value={artistProfile.artist_type} />
                    )}
                    {artistProfile.artist_image_url && (
                      <div className="flex gap-3">
                        <span className="text-white/40 text-xs w-28 flex-shrink-0 pt-0.5">Photo</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={artistProfile.artist_image_url} alt="" className="w-16 h-16 object-cover rounded-xl border border-white/10" />
                      </div>
                    )}
                    <p className="text-white/30 text-xs uppercase tracking-widest pt-1">Platform IDs</p>
                    <Row label="Spotify" value={artistProfile.spotify_artist_id} />
                    <Row label="Apple Music" value={artistProfile.apple_music_artist_id} />
                    <Row label="Audiomack" value={artistProfile.audiomack_id} />
                    <Row label="Boomplay" value={artistProfile.boomplay_id} />
                    <Row label="Deezer" value={artistProfile.deezer_id} />
                    <Row label="SoundCloud" value={artistProfile.soundcloud_id} />
                    <Row label="Amazon" value={artistProfile.amazon_id} />
                    <p className="text-white/30 text-xs uppercase tracking-widest pt-1">Social</p>
                    <Row label="Instagram" value={artistProfile.instagram_handle ? `@${artistProfile.instagram_handle}` : null} />
                    <Row label="X" value={artistProfile.x_handle ? `@${artistProfile.x_handle}` : null} />
                    <Row label="TikTok" value={artistProfile.tiktok_username} />
                    <Row label="YouTube" value={artistProfile.youtube_channel} />
                    <Row label="Facebook" value={artistProfile.facebook_url} />
                    <Row label="Website" value={artistProfile.website_url} />
                  </div>
                )}
              </Section>

              {/* Contract status */}
              <Section title="Distribution Agreement">
                {selected.contract_signed_at ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-400 text-xs font-semibold">Signed</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        By {selected.contract_signature ?? "—"} on{" "}
                        {new Date(selected.contract_signed_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/30 text-xs italic">
                    {selected.status === "approved"
                      ? "Artist has not signed the contract yet. They will see a prompt in their portal."
                      : "Contract becomes available after approval."}
                  </p>
                )}
              </Section>

              {/* Store links — only for approved releases */}
              {selected.status === "approved" && (
                <Section title="Store Links">
                  <p className="text-white/30 text-xs mb-3">
                    Paste the streaming URLs once the release is live. Artists will see these in their portal.
                  </p>
                  <div className="space-y-2">
                    {PLATFORMS.map((p) => (
                      <div key={p.key} className="flex items-center gap-3">
                        <span className="text-white/40 text-xs w-28 flex-shrink-0">{p.label}</span>
                        <input
                          type="url"
                          placeholder="https://…"
                          value={storeLinks[p.key] ?? ""}
                          onChange={(e) => {
                            setStoreLinks((prev) => ({ ...prev, [p.key]: e.target.value }));
                            setLinksSaved(false);
                          }}
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={saveStoreLinks}
                      disabled={savingLinks}
                      className="flex items-center gap-2 text-xs font-semibold bg-[#007bff]/10 hover:bg-[#007bff]/20 disabled:opacity-40 text-[#007bff] px-4 py-2 rounded-lg transition-colors"
                    >
                      {savingLinks ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                      {linksSaved ? "Links Saved ✓" : "Save Store Links"}
                    </button>
                    <button
                      onClick={notifyLive}
                      disabled={notifyingLive || liveNotified || !Object.values(storeLinks).some((v) => v.trim())}
                      className="flex items-center gap-2 text-xs font-semibold bg-green-500/10 hover:bg-green-500/20 disabled:opacity-40 text-green-400 px-4 py-2 rounded-lg transition-colors"
                      title={!Object.values(storeLinks).some((v) => v.trim()) ? "Add at least one store link first" : ""}
                    >
                      {notifyingLive ? <Loader2 size={12} className="animate-spin" /> : null}
                      {liveNotified ? "Artist Notified ✓" : "Email Artist: Music is Live"}
                    </button>
                  </div>
                </Section>
              )}

              {/* Streams — approved releases only */}
              {selected.status === "approved" && (
                <Section title="Stream Counts">
                  <p className="text-white/30 text-xs mb-3">
                    Update after each DSP reporting period. Artists see these totals in their portal.
                  </p>
                  <div className="space-y-2">
                    {PLATFORMS.map((p) => (
                      <div key={p.key} className="flex items-center gap-3">
                        <span className="text-white/40 text-xs w-28 flex-shrink-0">{p.label}</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={streams[p.key] ?? ""}
                          onChange={(e) => {
                            const n = parseInt(e.target.value) || 0;
                            setStreams((prev) => ({ ...prev, [p.key]: n }));
                            setStreamsSaved(false);
                          }}
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={saveStreams}
                    disabled={savingStreams}
                    className="mt-3 flex items-center gap-2 text-xs font-semibold bg-[#007bff]/10 hover:bg-[#007bff]/20 disabled:opacity-40 text-[#007bff] px-4 py-2 rounded-lg transition-colors"
                  >
                    {savingStreams ? <Loader2 size={12} className="animate-spin" /> : null}
                    {streamsSaved ? "Saved ✓" : "Save Stream Counts"}
                  </button>
                </Section>
              )}

              {/* Royalties — approved releases only */}
              {selected.status === "approved" && (
                <Section title="Royalties">
                  <p className="text-white/30 text-xs mb-3">
                    Total earnings to display in the artist portal. Update after each payout cycle.
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-xs w-28 flex-shrink-0">Total (USD)</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={royalties}
                        onChange={(e) => { setRoyalties(e.target.value); setRoyaltiesSaved(false); }}
                        className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs pl-7 pr-3 py-2 rounded-lg transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={saveRoyalties}
                    disabled={savingRoyalties}
                    className="mt-3 flex items-center gap-2 text-xs font-semibold bg-green-500/10 hover:bg-green-500/20 disabled:opacity-40 text-green-400 px-4 py-2 rounded-lg transition-colors"
                  >
                    {savingRoyalties ? <Loader2 size={12} className="animate-spin" /> : null}
                    {royaltiesSaved ? "Saved ✓" : "Save Royalties"}
                  </button>
                </Section>
              )}

              {/* Review notes */}
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                  Review Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes for the artist…"
                  className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl resize-none transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-white/[0.06] space-y-3">
              {/* Save notes without changing status */}
              <button
                onClick={saveNotes}
                disabled={updating}
                className="w-full text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/30 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 size={13} className="animate-spin" /> : null}
                Save Notes
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelected(null); setNotes(""); setStoreLinks({}); setStreams({}); setRoyalties(""); setEditIsrc(""); setEditUpc(""); setLinksSaved(false); setStreamsSaved(false); setRoyaltiesSaved(false); setMetaSaved(false); setArtistProfile(undefined); }}
                  className="flex-1 text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/30 py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                {selected.status !== "approved" && (
                  <button
                    onClick={() => updateStatus(selected.id, "approved")}
                    disabled={updating}
                    className="flex-1 text-sm font-semibold bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    Approve
                  </button>
                )}
                {selected.status !== "rejected" && (
                  <button
                    onClick={() => updateStatus(selected.id, "rejected")}
                    disabled={updating}
                    className="flex-1 text-sm font-semibold bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                    Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-400/10 text-yellow-400",
    approved: "bg-green-400/10 text-green-400",
    rejected: "bg-red-400/10 text-red-400",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] ?? "bg-white/10 text-white/40"}`}>
      {status}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-white/30 text-xs uppercase tracking-widest mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <span className="text-white/40 text-xs w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-white/80 text-xs">{value}</span>
    </div>
  );
}

