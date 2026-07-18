"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import { CheckCircle2, XCircle, FileAudio, Image as ImageIcon, ExternalLink, Loader2, Link2, Share2, Copy, Download, Wrench } from "lucide-react";
import { LISTENING_PLATFORMS } from "@/lib/platforms";
import { PlatformIcon } from "@/components/PlatformIcon";

const PLATFORMS = LISTENING_PLATFORMS;

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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
  ditto_smart_link: string | null;
  streams: Record<string, number> | null;
  royalties_usd: number | null;
  contract_signed_at: string | null;
  contract_signature: string | null;
  presave_enabled: boolean | null;
  presave_url: string | null;
  uploaded_to_ditto: boolean | null;
  language: string | null;
  store_platforms: string | null;
  youtube_content_id: boolean | null;
  distribution_stage: string | null;
};

type Filter = "all" | "pending" | "approved" | "rejected" | "revision_requested";

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

const PAGE_SIZE = 25;

export default function ReleasesPage() {
  const { requestUnlock } = usePinGate();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<Release | null>(null);
  const [notes, setNotes] = useState("");
  const [storeLinks, setStoreLinks] = useState<Record<string, string>>({});
  const [savingLinks, setSavingLinks] = useState(false);
  const [linksSaved, setLinksSaved] = useState(false);
  const [dittoLink, setDittoLink] = useState("");
  const [savingDitto, setSavingDitto] = useState(false);
  const [dittoSaved, setDittoSaved] = useState(false);
  const [smartLinkCopied, setSmartLinkCopied] = useState(false);
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
  const [editReleaseDate, setEditReleaseDate] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaSaved, setMetaSaved] = useState(false);

  // Royalty splits
  const [splits, setSplits]       = useState<{ role: string; email: string; percentage: string }[]>([]);
  const [savingSplits, setSavingSplits] = useState(false);
  const [splitsSaved, setSplitsSaved]   = useState(false);
  const [search, setSearch] = useState("");
  const [notifyingLive, setNotifyingLive] = useState(false);
  const [liveNotified, setLiveNotified] = useState(false);

  // Revision request
  const REVISION_PRESETS = [
    { id: "audio", label: "Audio quality issue", reason: "The audio file does not meet our quality standards." },
    { id: "artwork", label: "Artwork doesn't meet specs", reason: "The cover art does not meet platform requirements (must be square JPG/PNG, at least 3000×3000 px, no URLs or logos)." },
    { id: "metadata", label: "Incomplete metadata", reason: "Required metadata is missing or incorrect (songwriters, copyright owner, release date, or genre)." },
    { id: "copyright", label: "Copyright / licensing issue", reason: "There is an issue with the copyright or licensing information. Please provide proof of ownership or a valid licence for any samples used." },
    { id: "format", label: "Wrong file format", reason: "The submitted audio file is in the wrong format. Please resubmit as a lossless WAV or FLAC file." },
    { id: "custom", label: "Custom message", reason: "" },
  ];
  const [revisionPreset, setRevisionPreset] = useState(REVISION_PRESETS[0].id);
  const [revisionNote, setRevisionNote] = useState("");
  const [sendingRevision, setSendingRevision] = useState(false);
  const [revisionSent, setRevisionSent] = useState(false);

  // Distribution stage
  const [distStage, setDistStage] = useState<"submitted" | "in_distribution" | "live">("submitted");
  const [savingStage, setSavingStage] = useState(false);
  const [stageSaved, setStageSaved]   = useState(false);

  // Batch selection
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [batchStatus, setBatchStatus] = useState<"idle" | "running">("idle");

  // Pre-save state
  const [presaveEnabled, setPresaveEnabled] = useState(false);
  const [presaveUrl, setPresaveUrl] = useState("");
  const [savingPresave, setSavingPresave] = useState(false);
  const [presaveSaved, setPresaveSaved] = useState(false);

  // Ditto Upload Pack
  const [dittoUploaded, setDittoUploaded] = useState(false);
  const [dittoPackCopied, setDittoPackCopied] = useState(false);

  async function load(p = page) {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;
    let query = supabase.from("releases")
      .select("*", { count: "exact" })
      .order("submitted_at", { ascending: false })
      .range(from, to);
    if (filter !== "all") query = query.eq("status", filter);
    const { data, count } = await query;
    setReleases(data ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }

  useEffect(() => { setPage(0); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(page); }, [page, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function notifyLive() {
    if (!selected) return;
    setNotifyingLive(true);
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "live", release: { ...selected, store_links: storeLinks } }),
    }).catch(() => {});
    // In-app notification
    supabase.from("notifications").insert({
      email: selected.email,
      type:  "live",
      title: `"${selected.song_title}" is now live!`,
      body:  "Your music is live on streaming platforms. Head to your portal to get your smart link and share it with the world.",
      link:  `/portal/releases/${selected.id}`,
    }).then(() => {}).then(undefined, () => {});
    // Admin record — logs that the live email was sent
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "live-sent",
        data: { email: selected.email, artist_name: selected.artist_name, song_title: selected.song_title },
      }),
    }).catch(() => {});
    setNotifyingLive(false);
    setLiveNotified(true);
  }

  async function requestRevision() {
    if (!selected) return;
    const preset = REVISION_PRESETS.find((p) => p.id === revisionPreset);
    const reason = revisionPreset === "custom" ? revisionNote.trim() : preset?.reason ?? "";
    const note   = revisionPreset === "custom" ? "" : revisionNote.trim();
    if (!reason) return;
    setSendingRevision(true);

    // Update status
    await supabase.from("releases").update({
      status: "revision_requested",
      review_notes: `[Revision requested] ${reason}${note ? `\n\n${note}` : ""}`,
      reviewed_at: new Date().toISOString(),
    }).eq("id", selected.id);

    // Email artist
    fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "revision-requested",
        data: { email: selected.email, artist_name: selected.artist_name, song_title: selected.song_title, reason, note },
      }),
    }).catch(() => {});

    // In-app notification
    supabase.from("notifications").insert({
      email: selected.email,
      type:  "warning",
      title: `Action needed — ${selected.song_title}`,
      body:  `We need you to update your submission. ${reason}${note ? " " + note : ""}`,
      link:  `/portal/releases/${selected.id}`,
    }).then(() => {});

    setSendingRevision(false);
    setRevisionSent(true);
    setSelected((s) => s ? { ...s, status: "revision_requested" } : s);
    load();
  }

  function openRelease(r: Release) {
    setSelected(r);
    setNotes(r.review_notes ?? "");
    setStoreLinks(r.store_links ?? {});
    setDittoLink(r.ditto_smart_link ?? "");
    setDittoSaved(false);
    setStreams(r.streams ?? {});
    setRoyalties(r.royalties_usd?.toString() ?? "");
    setEditIsrc(r.isrc ?? "");
    setEditUpc(r.upc ?? "");
    setEditReleaseDate(r.release_date ?? "");
    setLinksSaved(false);
    setStreamsSaved(false);
    setRoyaltiesSaved(false);
    setMetaSaved(false);
    setLiveNotified(false);
    setRevisionPreset(REVISION_PRESETS[0].id);
    setRevisionNote("");
    setRevisionSent(false);
    setSplits([]);
    setSplitsSaved(false);
    supabase.from("royalty_splits").select("name,email,percentage").eq("release_id", r.id)
      .then(({ data }) => {
        if (data?.length) setSplits(data.map((s: { name: string; email: string | null; percentage: number }) =>
          ({ role: s.name, email: s.email ?? "", percentage: String(s.percentage) })));
      });
    setDistStage((r.distribution_stage as "submitted" | "in_distribution" | "live") ?? "submitted");
    setStageSaved(false);
    setPresaveEnabled(r.presave_enabled ?? false);
    setPresaveUrl(r.presave_url ?? "");
    setPresaveSaved(false);
    setDittoUploaded(r.uploaded_to_ditto ?? false);
    setDittoPackCopied(false);
    setArtistProfile(undefined);
    supabase
      .from("artist_profiles")
      .select("*")
      .eq("email", r.email)
      .maybeSingle()
      .then(({ data }) => setArtistProfile((data as ArtistProfile) ?? null));
  }

  async function saveDittoLink() {
    if (!selected) return;
    setSavingDitto(true);
    const val = dittoLink.trim() || null;
    await supabase.from("releases").update({ ditto_smart_link: val }).eq("id", selected.id);
    setSelected((s) => s ? { ...s, ditto_smart_link: val } : s);

    // Notify artist when a link is being set (not cleared)
    if (val) {
      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "smartlink-ready",
          data: {
            email:       selected.email,
            artist_name: selected.artist_name,
            song_title:  selected.song_title,
            release_id:  selected.id,
          },
        }),
      }).catch(() => {});
      supabase.from("notifications").insert({
        email: selected.email,
        type:  "smartlink",
        title: `Your smart link is ready — ${selected.song_title}`,
        body:  "Your OrinlabÍ Records smart link is live. Share it with your fans and they can listen on their favourite platform.",
        link:  `/portal/releases/${selected.id}`,
      }).then(() => {}).then(undefined, () => {});
    }

    setSavingDitto(false);
    setDittoSaved(true);
    setTimeout(() => setDittoSaved(false), 3000);
    load();
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
    load();
  }

  async function saveRoyalties() {
    if (!selected) return;
    setSavingRoyalties(true);
    const val = parseFloat(royalties) || 0;
    await supabase.from("releases").update({ royalties_usd: val }).eq("id", selected.id);
    setSelected((s) => s ? { ...s, royalties_usd: val } : s);
    setSavingRoyalties(false);
    setRoyaltiesSaved(true);
    load();
  }

  async function saveMeta() {
    if (!selected) return;
    setSavingMeta(true);
    const prevDate = selected.release_date ?? "";
    await supabase.from("releases").update({ isrc: editIsrc || null, upc: editUpc || null, release_date: editReleaseDate || null }).eq("id", selected.id);
    setSelected((s) => s ? { ...s, isrc: editIsrc, upc: editUpc || null, release_date: editReleaseDate } : s);

    // Notify artist when a release date is set or changed
    if (editReleaseDate && editReleaseDate !== prevDate) {
      // In-portal notification
      supabase.from("notifications").insert({
        email: selected.email,
        title: `Release date set — ${selected.song_title}`,
        body: `Your release date has been confirmed: your music drops on ${new Date(editReleaseDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}. Start building the hype!`,
        type: "success",
        read: false,
        created_at: new Date().toISOString(),
      }).then(() => {});

      // Email notification
      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "release-date-set",
          data: {
            email:        selected.email,
            artist_name:  selected.artist_name,
            song_title:   selected.song_title,
            release_date: editReleaseDate,
          },
        }),
      }).catch(() => {});
    }

    setSavingMeta(false);
    setMetaSaved(true);
    load();
  }

  function generateIsrc() {
    const year  = new Date().getFullYear().toString().slice(-2);
    const seq   = Math.floor(10000 + Math.random() * 90000);
    return `NG-ORL-${year}-${seq}`;
  }

  async function saveSplits() {
    if (!selected) return;
    setSavingSplits(true);
    const { error: delErr } = await supabase.from("royalty_splits").delete().eq("release_id", selected.id);
    if (delErr) { console.error("royalty_splits delete:", delErr); setSavingSplits(false); alert("Save failed: " + delErr.message); return; }
    const valid = splits.filter((s) => s.role && Number(s.percentage) > 0);
    if (valid.length > 0) {
      const { error: insErr } = await supabase.from("royalty_splits").insert(
        valid.map((s) => ({ release_id: selected.id, name: s.role, email: s.email.trim() || null, percentage: Number(s.percentage) }))
      );
      if (insErr) { console.error("royalty_splits insert:", insErr); setSavingSplits(false); alert("Save failed: " + insErr.message); return; }
    }
    // Reload from DB so the view stays in sync with what was actually saved
    const { data: fresh } = await supabase.from("royalty_splits").select("name,email,percentage").eq("release_id", selected.id);
    if (fresh) setSplits(fresh.map((s: { name: string; email: string | null; percentage: number }) => ({ role: s.name, email: s.email ?? "", percentage: String(s.percentage) })));
    setSavingSplits(false);
    setSplitsSaved(true);
    setTimeout(() => setSplitsSaved(false), 3000);
  }

  async function saveStage() {
    if (!selected) return;
    setSavingStage(true);
    await supabase.from("releases").update({ distribution_stage: distStage }).eq("id", selected.id);
    // Email artist when stage changes to a meaningful step
    if (distStage === "in_distribution" || distStage === "live") {
      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stage-update",
          data: {
            email:       selected.email,
            artist_name: selected.artist_name,
            song_title:  selected.song_title,
            stage:       distStage,
            store_links: distStage === "live" ? (storeLinks ?? {}) : {},
          },
        }),
      }).catch(() => {});
    }
    setSavingStage(false);
    setStageSaved(true);
    load();
  }

  async function savePresaveSettings() {
    if (!selected) return;
    setSavingPresave(true);
    await supabase.from("releases").update({
      presave_enabled: presaveEnabled,
      presave_url:     presaveUrl.trim() || null,
    }).eq("id", selected.id);
    setSavingPresave(false);
    setPresaveSaved(true);
    load();
  }

  async function toggleDittoUploaded() {
    if (!selected) return;
    const next = !dittoUploaded;
    setDittoUploaded(next);
    await supabase.from("releases").update({ uploaded_to_ditto: next }).eq("id", selected.id);
  }

  function copyAllDittoPack() {
    if (!selected) return;
    const fa = (() => {
      if (!selected.featured_artists) return "";
      try {
        const arr = JSON.parse(selected.featured_artists) as { name: string; spotify_id?: string; apple_id?: string }[];
        return arr.map((a) => `${a.name}${a.spotify_id ? ` [Spotify: ${a.spotify_id}]` : ""}${a.apple_id ? ` [Apple: ${a.apple_id}]` : ""}`).join(", ");
      } catch { return selected.featured_artists; }
    })();
    const lines = [
      `ARTIST NAME: ${selected.artist_name}`,
      `LEGAL NAME: ${selected.legal_name}`,
      `SONG TITLE: ${selected.song_title}`,
      selected.album_title ? `ALBUM/PROJECT: ${selected.album_title}` : null,
      `RELEASE TYPE: ${selected.release_type}`,
      `GENRE: ${selected.genre}`,
      `RELEASE DATE: ${editReleaseDate || selected.release_date || "—"}`,
      `EXPLICIT: ${selected.explicit ? "Yes" : "No"}`,
      `ISRC: ${editIsrc || selected.isrc || "— generate on Ditto"}`,
      editUpc || selected.upc ? `UPC: ${editUpc || selected.upc}` : null,
      `COPYRIGHT OWNER: ${selected.copyright_owner}`,
      `COPYRIGHT YEAR: ${selected.copyright_year}`,
      selected.publishing_info ? `PUBLISHING/PRO: ${selected.publishing_info}` : null,
      `SONGWRITERS: ${selected.songwriters}`,
      `PRODUCERS: ${selected.producers}`,
      fa ? `FEATURED ARTISTS: ${fa}` : null,
      selected.language ? `LANGUAGE: ${selected.language}` : `LANGUAGE: — confirm with artist`,
      `COUNTRY: ${selected.country}`,
      `STORE SELECTION: ${selected.store_platforms || "All stores"}`,
      `YOUTUBE CONTENT ID: ${selected.youtube_content_id ? "Yes" : "No"}`,
      artistProfile?.spotify_artist_id ? `SPOTIFY ARTIST ID: ${artistProfile.spotify_artist_id}` : null,
      artistProfile?.apple_music_artist_id ? `APPLE MUSIC ARTIST ID: ${artistProfile.apple_music_artist_id}` : null,
      `\nFILES`,
      `Cover Art: ${selected.cover_art_url || "—"}`,
      `Audio: ${selected.audio_file_url || "—"}`,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(lines);
    setDittoPackCopied(true);
    setTimeout(() => setDittoPackCopied(false), 2000);
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

    // Write in-app notification
    supabase.from("notifications").insert({
      email:  selected.email,
      type:   status,
      title:  status === "approved" ? `"${selected.song_title}" has been approved!` : `"${selected.song_title}" was not selected`,
      body:   notes || (status === "approved" ? "Your release has been approved and is being prepared for distribution." : "Your release was not selected at this time. Check your portal for details."),
      link:   `/portal/releases/${selected.id}`,
    }).then(() => {}).then(undefined, () => {});

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
    setEditReleaseDate("");
    setLinksSaved(false);
    setStreamsSaved(false);
    setRoyaltiesSaved(false);
    setMetaSaved(false);
    setLiveNotified(false);
    setRevisionPreset(REVISION_PRESETS[0].id);
    setRevisionNote("");
    setRevisionSent(false);
    setArtistProfile(undefined);
    load();
  }

  async function batchApprove() {
    if (!checkedIds.size) return;
    setBatchStatus("running");
    for (const id of checkedIds) {
      const r = releases.find((x) => x.id === id);
      if (!r || r.status === "approved") continue;
      await supabase.from("releases").update({ status: "approved", review_notes: null }).eq("id", id);
      fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "approved", data: { email: r.email, artist_name: r.artist_name, song_title: r.song_title, release_type: r.release_type, country: r.country, review_notes: null, release_id: id } }) }).catch(() => {});
    }
    setCheckedIds(new Set());
    setBatchStatus("idle");
    load();
  }

  async function batchReject(reason: string) {
    if (!checkedIds.size) return;
    setBatchStatus("running");
    for (const id of checkedIds) {
      const r = releases.find((x) => x.id === id);
      if (!r || r.status === "rejected") continue;
      await supabase.from("releases").update({ status: "rejected", review_notes: reason }).eq("id", id);
      fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rejected", data: { email: r.email, artist_name: r.artist_name, song_title: r.song_title, release_type: r.release_type, country: r.country, review_notes: reason, release_id: id } }) }).catch(() => {});
    }
    setCheckedIds(new Set());
    setBatchStatus("idle");
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
            {([
              { val: "pending", label: "Pending" },
              { val: "revision_requested", label: "Needs Revision" },
              { val: "approved", label: "Approved" },
              { val: "rejected", label: "Rejected" },
              { val: "all", label: "All" },
            ] as { val: Filter; label: string }[]).map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  filter === val ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white"
                }`}
              >
                {label}
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
          {/* Batch action bar */}
          {checkedIds.size > 0 && (
            <div className="sticky top-0 z-10 flex items-center gap-3 flex-wrap bg-[#0a0a0a]/90 backdrop-blur border border-white/[0.1] rounded-2xl px-5 py-3">
              <p className="text-white/60 text-sm flex-1">{checkedIds.size} release{checkedIds.size !== 1 ? "s" : ""} selected</p>
              <button onClick={batchApprove} disabled={batchStatus === "running"}
                className="flex items-center gap-1.5 text-xs font-semibold bg-green-500/15 hover:bg-green-500/25 text-green-400 px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
                {batchStatus === "running" ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Approve All
              </button>
              {[
                { label: "Audio quality issues", reason: "The audio does not meet our quality standards. Please re-master your track to at least 16-bit / 44.1kHz WAV or 320kbps MP3 and resubmit." },
                { label: "Artwork doesn't meet specs", reason: "The cover art does not meet platform requirements. Please submit a square JPG/PNG at least 3000×3000px with no streaming platform logos or URLs." },
                { label: "Metadata incomplete", reason: "Your submission is missing required metadata (songwriters, copyright owner, or release date). Please complete all fields and resubmit." },
              ].map(({ label, reason }) => (
                <button key={label} onClick={() => batchReject(reason)} disabled={batchStatus === "running"}
                  className="text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
                  Reject: {label}
                </button>
              ))}
              <button onClick={() => setCheckedIds(new Set())} className="text-xs text-white/30 hover:text-white transition-colors ml-2">Clear</button>
            </div>
          )}

          {totalCount > 0 && !search && (
            <p className="text-white/20 text-xs px-1">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
            </p>
          )}

          {releases.filter((r) => !search || r.artist_name.toLowerCase().includes(search.toLowerCase()) || r.song_title.toLowerCase().includes(search.toLowerCase())).map((r) => (
            <div
              key={r.id}
              className="bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <input type="checkbox" checked={checkedIds.has(r.id)}
                      onChange={(e) => setCheckedIds((prev) => { const next = new Set(prev); e.target.checked ? next.add(r.id) : next.delete(r.id); return next; })}
                      className="w-4 h-4 rounded accent-[#007bff] cursor-pointer flex-shrink-0" />
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

          {/* Pagination */}
          {!search && totalCount > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-white/30 text-xs">
                Page {page + 1} of {Math.ceil(totalCount / PAGE_SIZE)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="text-xs px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(Math.ceil(totalCount / PAGE_SIZE) - 1, p + 1))}
                  disabled={(page + 1) * PAGE_SIZE >= totalCount}
                  className="text-xs px-4 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
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
                <Row label="Release Date" value={editReleaseDate || selected.release_date} />
                <Row label="Album" value={selected.album_title} />
                <Row label="Explicit" value={selected.explicit ? "Yes" : "No"} />
              </Section>

              {/* Credits */}
              <Section title="Credits">
                <Row label="Songwriters" value={selected.songwriters} />
                <Row label="Producers" value={selected.producers} />
                {/* Featured artists — may be JSON or plain text */}
                {selected.featured_artists ? (() => {
                  try {
                    const fa = JSON.parse(selected.featured_artists) as { name: string; spotify_id?: string; apple_id?: string }[];
                    return (
                      <div className="py-1.5">
                        <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Featured Artists</p>
                        <div className="space-y-2">
                          {fa.map((a, i) => (
                            <div key={i} className="bg-white/[0.03] rounded-xl px-3 py-2 space-y-0.5">
                              <p className="text-white/80 text-xs font-semibold">{a.name}</p>
                              {a.spotify_id && <p className="text-white/30 text-[10px]">Spotify: {a.spotify_id}</p>}
                              {a.apple_id && <p className="text-white/30 text-[10px]">Apple Music: {a.apple_id}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } catch {
                    return <Row label="Featured" value={selected.featured_artists} />;
                  }
                })() : null}
              </Section>

              {/* Metadata — editable */}
              <Section title="Edit Release Details">
                <p className="text-white/30 text-xs mb-3">Set or correct the release date, ISRC, and UPC. Click <strong className="text-white/50">Save Release Details</strong> below to apply.</p>
                <div className="space-y-2">
                  {([
                    { key: "releaseDate", label: "Release Date", value: editReleaseDate, set: setEditReleaseDate, placeholder: "", type: "date" },
                    { key: "isrc", label: "ISRC", value: editIsrc, set: setEditIsrc, placeholder: "e.g. USRC11700609", type: "text" },
                    { key: "upc", label: "UPC", value: editUpc, set: setEditUpc, placeholder: "12-digit barcode (albums)", type: "text" },
                  ] as { key: string; label: string; value: string; set: (v: string) => void; placeholder: string; type: string }[]).map(({ key, label, value, set, placeholder, type }) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-white/40 text-xs w-28 flex-shrink-0">{label}</span>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => { set(e.target.value); setMetaSaved(false); }}
                        className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors font-mono"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => { setEditIsrc(generateIsrc()); setMetaSaved(false); }}
                    className="text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 px-3 py-2 rounded-lg transition-colors border border-white/[0.06]"
                  >
                    Generate ISRC
                  </button>
                  <button
                    onClick={() => requestUnlock(saveMeta)}
                    disabled={savingMeta}
                    className="flex items-center gap-2 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] disabled:opacity-40 text-white/60 hover:text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {savingMeta ? <Loader2 size={12} className="animate-spin" /> : null}
                    {metaSaved ? "Saved ✓" : "Save Release Details"}
                  </button>
                </div>
              </Section>

              {/* Rights */}
              <Section title="Rights">
                <Row label="Copyright Owner" value={selected.copyright_owner} />
                <Row label="Year" value={selected.copyright_year} />
                <Row label="Publishing" value={selected.publishing_info} />
                {selected.store_platforms && (
                  <Row label="Requested Stores" value={selected.store_platforms} />
                )}
                {selected.youtube_content_id && (
                  <Row label="YouTube Content ID" value="Requested ✓" />
                )}
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

              {/* Ditto Upload Pack — approved releases only */}
              {selected.status === "approved" && (
                <Section title="Ditto Upload Pack">
                  <p className="text-white/25 text-[10px] mb-3 leading-relaxed">
                    All fields needed to upload this release to Ditto — compiled in one place. Use the copy buttons or "Copy All" to paste into Ditto.
                  </p>
                  <div className="space-y-0.5 mb-3">
                    <PackRow label="Artist Name" value={selected.artist_name} />
                    <PackRow label="Legal Name" value={selected.legal_name} />
                    <PackRow label="Song Title" value={selected.song_title} />
                    {selected.album_title && <PackRow label="Album / Project" value={selected.album_title} />}
                    <PackRow label="Release Type" value={selected.release_type} />
                    <PackRow label="Genre" value={selected.genre} />
                    <PackRow label="Release Date" value={editReleaseDate || selected.release_date} />
                    <PackRow label="Explicit" value={selected.explicit ? "Yes" : "No"} />
                    <PackRow label="ISRC" value={editIsrc || selected.isrc || "— generate on Ditto"} />
                    {(editUpc || selected.upc) && <PackRow label="UPC" value={editUpc || selected.upc} />}
                    <PackRow label="Copyright Owner" value={selected.copyright_owner} />
                    <PackRow label="Copyright Year" value={selected.copyright_year} />
                    {selected.publishing_info && <PackRow label="Publishing / PRO" value={selected.publishing_info} />}
                    <PackRow label="Songwriters" value={selected.songwriters} />
                    <PackRow label="Producers" value={selected.producers} />
                    {selected.featured_artists && (() => {
                      try {
                        const fa = JSON.parse(selected.featured_artists) as { name: string; spotify_id?: string; apple_id?: string }[];
                        return <PackRow label="Featured Artists" value={fa.map((a) => `${a.name}${a.spotify_id ? ` [Spotify: ${a.spotify_id}]` : ""}${a.apple_id ? ` [Apple: ${a.apple_id}]` : ""}`).join(", ")} />;
                      } catch { return <PackRow label="Featured Artists" value={selected.featured_artists} />; }
                    })()}
                    <PackRow label="Language" value={selected.language} />
                    <PackRow label="Country" value={selected.country} />
                    <PackRow label="Store Selection" value={selected.store_platforms || "All stores"} />
                    <PackRow label="YouTube Content ID" value={selected.youtube_content_id ? "Yes — requested" : "No"} />
                    {artistProfile?.spotify_artist_id && <PackRow label="Artist Spotify ID" value={artistProfile.spotify_artist_id} />}
                    {artistProfile?.apple_music_artist_id && <PackRow label="Artist Apple ID" value={artistProfile.apple_music_artist_id} />}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selected.audio_file_url && (
                      <a href={selected.audio_file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/[0.06] px-3 py-2 rounded-lg transition-colors">
                        <Download size={12} /> Audio File
                      </a>
                    )}
                    {selected.cover_art_url && (
                      <a href={selected.cover_art_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/[0.06] px-3 py-2 rounded-lg transition-colors">
                        <Download size={12} /> Cover Art
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                    <button
                      onClick={copyAllDittoPack}
                      className="flex items-center gap-2 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] text-white/60 hover:text-white px-4 py-2 rounded-lg transition-colors border border-white/[0.06]"
                    >
                      <Copy size={12} />
                      {dittoPackCopied ? "Copied ✓" : "Copy All"}
                    </button>
                    <button
                      onClick={() => requestUnlock(toggleDittoUploaded)}
                      className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors border ${
                        dittoUploaded
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-white/[0.04] text-white/40 hover:text-white border-white/[0.06]"
                      }`}
                    >
                      {dittoUploaded ? "✓ Uploaded to Ditto" : "Mark as Uploaded to Ditto"}
                    </button>
                  </div>
                </Section>
              )}

              {/* Store links — only for approved releases */}
              {selected.status === "approved" && (
                <Section title="Store Links">
                  {/* Distribution stage */}
                  <div className="mb-4 pb-4 border-b border-white/[0.06]">
                    <p className="text-white/30 text-xs mb-2">Distribution Stage</p>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {([
                        { val: "submitted",      label: "Submitted",       color: "border-yellow-400/30 text-yellow-400 bg-yellow-400/8" },
                        { val: "in_distribution", label: "In Distribution", color: "border-blue-400/30 text-blue-400 bg-blue-400/8" },
                        { val: "live",           label: "Live",            color: "border-green-400/30 text-green-400 bg-green-400/8" },
                      ] as const).map(({ val, label, color }) => (
                        <button key={val} onClick={() => { setDistStage(val); setStageSaved(false); }}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${distStage === val ? color : "border-white/[0.08] text-white/30 hover:text-white"}`}
                        >{label}</button>
                      ))}
                    </div>
                    <button onClick={() => requestUnlock(saveStage)} disabled={savingStage}
                      className="flex items-center gap-2 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] disabled:opacity-40 text-white/60 hover:text-white px-4 py-2 rounded-lg transition-colors">
                      {savingStage ? <Loader2 size={11} className="animate-spin" /> : null}
                      {stageSaved ? "Stage Saved ✓" : "Save Stage"}
                    </button>
                  </div>
                  {/* Ditto smart link */}
                  <div className="mb-4 pb-4 border-b border-white/[0.06]">
                    <p className="text-white/30 text-xs mb-1.5">Ditto Smart Link</p>
                    <p className="text-white/20 text-[10px] mb-2">
                      Copy the <span className="text-white/40">ditto.fm/…</span> link from the Ditto dashboard. While no individual store URLs are saved, fans visiting the smart link will be redirected directly to Ditto.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://ditto.fm/slug"
                        value={dittoLink}
                        onChange={(e) => { setDittoLink(e.target.value); setDittoSaved(false); }}
                        className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors"
                      />
                      <button
                        onClick={() => requestUnlock(saveDittoLink)}
                        disabled={savingDitto}
                        className="flex items-center gap-2 text-xs font-semibold bg-[#007bff]/10 hover:bg-[#007bff]/20 disabled:opacity-40 text-[#007bff] px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {savingDitto ? <Loader2 size={12} className="animate-spin" /> : null}
                        {dittoSaved ? "Saved ✓" : "Save"}
                      </button>
                    </div>
                  </div>
                  <p className="text-white/30 text-xs mb-3">
                    Paste the streaming URLs once the release is live. Artists will see these in their portal.
                  </p>
                  <div className="space-y-2">
                    {PLATFORMS.map((p) => (
                      <div key={p.key} className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                          <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}20`, color: p.color }}>
                            {PlatformIcon({ platformKey: p.key, size: 11 }) ?? <span className="text-[8px] font-bold">{p.label.charAt(0)}</span>}
                          </div>
                          <span className="text-white/40 text-xs truncate">{p.label}</span>
                        </div>
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
                      onClick={() => requestUnlock(saveStoreLinks)}
                      disabled={savingLinks}
                      className="flex items-center gap-2 text-xs font-semibold bg-[#007bff]/10 hover:bg-[#007bff]/20 disabled:opacity-40 text-[#007bff] px-4 py-2 rounded-lg transition-colors"
                    >
                      {savingLinks ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                      {linksSaved ? "Links Saved ✓" : "Save Store Links"}
                    </button>
                    <button
                      onClick={() => requestUnlock(notifyLive)}
                      disabled={notifyingLive || liveNotified || !Object.values(storeLinks).some((v) => v.trim())}
                      className="flex items-center gap-2 text-xs font-semibold bg-green-500/10 hover:bg-green-500/20 disabled:opacity-40 text-green-400 px-4 py-2 rounded-lg transition-colors"
                      title={!Object.values(storeLinks).some((v) => v.trim()) ? "Add at least one store link first" : ""}
                    >
                      {notifyingLive ? <Loader2 size={12} className="animate-spin" /> : null}
                      {liveNotified ? "Artist Notified ✓" : "Email Artist: Music is Live"}
                    </button>
                  </div>
                  {/* OrinlabÍ Records smart link */}
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <p className="text-white/30 text-xs mb-2 flex items-center gap-1.5">
                      <Share2 size={11} /> OrinlabÍ Records Smart Link
                    </p>
                    <div className="flex items-center gap-2 bg-[#007bff]/[0.06] border border-[#007bff]/20 rounded-xl px-3 py-2.5">
                      <span className="text-[#007bff]/80 text-xs font-mono flex-1 truncate">
                        orinlabi.com/listen/{toSlug(selected.artist_name)}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://orinlabi.com/listen/${toSlug(selected.artist_name)}`);
                          setSmartLinkCopied(true);
                          setTimeout(() => setSmartLinkCopied(false), 2000);
                        }}
                        className="text-[#007bff] hover:text-white text-xs font-semibold flex-shrink-0 transition-colors"
                      >
                        {smartLinkCopied ? "Copied ✓" : "Copy"}
                      </button>
                      <a
                        href={`https://orinlabi.com/listen/${toSlug(selected.artist_name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/30 hover:text-white transition-colors flex-shrink-0"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <p className="text-white/20 text-[10px] mt-1.5">Fan link stays on orinlabi.com. Shows listen page or pre-save depending on release date.</p>
                  </div>

                </Section>
              )}

              {/* Pre-save — approved releases only */}
              {selected.status === "approved" && (
                <Section title="Pre-save Campaign">
                  <p className="text-white/30 text-xs mb-4">
                    Enable a pre-save link for this release. Fans authorize Spotify and the album is saved to their library on release day.
                  </p>

                  {/* Enable toggle */}
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => { setPresaveEnabled((v) => !v); setPresaveSaved(false); }}
                      className={`relative w-10 h-6 rounded-full transition-colors ${presaveEnabled ? "bg-[#1db954]" : "bg-white/10"}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${presaveEnabled ? "translate-x-4" : ""}`} />
                    </button>
                    <span className="text-white/60 text-xs">
                      {presaveEnabled ? "Pre-save enabled — link is live" : "Pre-save disabled"}
                    </span>
                  </div>

                  {/* Ditto pre-save URL */}
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white/40 text-xs w-28 flex-shrink-0">Pre-save URL</span>
                    <input
                      type="url"
                      placeholder="Paste the Ditto pre-save link here…"
                      value={presaveUrl}
                      onChange={(e) => { setPresaveUrl(e.target.value); setPresaveSaved(false); }}
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#1db954] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors"
                    />
                  </div>
                  <p className="text-white/20 text-xs mb-4 pl-[calc(112px+12px)]">
                    Get this from Ditto after submitting the release with a future date.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => requestUnlock(savePresaveSettings)}
                      disabled={savingPresave}
                      className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                      style={{ background: "rgba(29,185,84,0.12)", color: "#1db954" }}
                    >
                      {savingPresave ? <Loader2 size={12} className="animate-spin" /> : null}
                      {presaveSaved ? "Saved ✓" : "Save Settings"}
                    </button>
                    {presaveEnabled && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://orinlabi.com/presave/${toSlug(selected.artist_name)}`);
                        }}
                        className="flex items-center gap-2 text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.10] text-white/50 hover:text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Link2 size={12} /> Copy Pre-save Link
                      </button>
                    )}
                  </div>

                  {presaveEnabled && presaveUrl && (
                    <div className="mt-3">
                      <p className="text-white/25 text-xs mb-1">Fan link:</p>
                      <a
                        href={`https://orinlabi.com/presave/${toSlug(selected.artist_name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1db954] text-xs hover:underline font-mono break-all"
                      >
                        orinlabi.com/presave/{toSlug(selected.artist_name)}
                      </a>
                    </div>
                  )}
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
                    onClick={() => requestUnlock(saveStreams)}
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
                    onClick={() => requestUnlock(saveRoyalties)}
                    disabled={savingRoyalties}
                    className="mt-3 flex items-center gap-2 text-xs font-semibold bg-green-500/10 hover:bg-green-500/20 disabled:opacity-40 text-green-400 px-4 py-2 rounded-lg transition-colors"
                  >
                    {savingRoyalties ? <Loader2 size={12} className="animate-spin" /> : null}
                    {royaltiesSaved ? "Saved ✓" : "Save Royalties"}
                  </button>
                </Section>
              )}

              {/* Royalty Splits */}
              {true && (
                <Section title="Royalty Splits">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-white/30 text-xs">Define how earnings are split. Visible to the artist in their portal.</p>
                    <button
                      onClick={() => {
                        supabase.from("royalty_splits").select("name,email,percentage").eq("release_id", selected.id)
                          .then(({ data }) => {
                            setSplits((data ?? []).map((s: { name: string; email: string | null; percentage: number }) => ({ role: s.name, email: s.email ?? "", percentage: String(s.percentage) })));
                          });
                      }}
                      className="text-white/30 hover:text-white text-[10px] uppercase tracking-widest flex items-center gap-1 transition-colors"
                    >
                      ↻ Refresh
                    </button>
                  </div>

                  {/* Column headers */}
                  {splits.length > 0 && (
                    <div className="grid grid-cols-[1fr_1fr_80px_28px] gap-2 mb-1 px-1">
                      <span className="text-white/25 text-[10px] uppercase tracking-widest">Position / Role</span>
                      <span className="text-white/25 text-[10px] uppercase tracking-widest">Email</span>
                      <span className="text-white/25 text-[10px] uppercase tracking-widest">%</span>
                      <span />
                    </div>
                  )}

                  <div className="space-y-2 mb-3">
                    {splits.map((s, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_80px_28px] gap-2 items-center">
                        {/* Role dropdown */}
                        <select
                          value={s.role}
                          onChange={(e) => { const n = [...splits]; n[i] = { ...n[i], role: e.target.value }; setSplits(n); setSplitsSaved(false); }}
                          className="bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 text-xs px-3 py-2 rounded-lg transition-colors"
                        >
                          <option value="">Select position…</option>
                          <optgroup label="── Song / Publishing">
                            <option>Artist</option>
                            <option>Featured Artist</option>
                            <option>Songwriter / Lyricist</option>
                            <option>Composer</option>
                            <option>Topline Writer</option>
                            <option>Beatmaker</option>
                            <option>Producer</option>
                            <option>Co-Producer</option>
                            <option>Additional Producer</option>
                            <option>Melody Writer</option>
                            <option>Hook Writer</option>
                            <option>Arranger</option>
                            <option>Sample Creator</option>
                            <option>Translator / Adaptor</option>
                          </optgroup>
                          <optgroup label="── Master Recording">
                            <option>Main Artist</option>
                            <option>Executive Producer</option>
                            <option>Vocal Producer</option>
                            <option>Background Vocalist</option>
                            <option>Session Musician</option>
                            <option>Mixing Engineer</option>
                            <option>Mastering Engineer</option>
                            <option>DJ / Remixer</option>
                            <option>Programmer / Sound Designer</option>
                          </optgroup>
                          <optgroup label="── Business">
                            <option>Manager</option>
                            <option>Label</option>
                            <option>Distributor</option>
                            <option>Publisher</option>
                            <option>Investor / Funder</option>
                            <option>A&R Representative</option>
                          </optgroup>
                        </select>
                        {/* Email */}
                        <input
                          type="email"
                          placeholder="email@example.com"
                          value={s.email}
                          onChange={(e) => { const n = [...splits]; n[i] = { ...n[i], email: e.target.value }; setSplits(n); setSplitsSaved(false); }}
                          className="bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors"
                        />
                        {/* Percentage */}
                        <input
                          type="number"
                          placeholder="%"
                          min="0"
                          max="100"
                          step="0.1"
                          value={s.percentage}
                          onChange={(e) => { const n = [...splits]; n[i] = { ...n[i], percentage: e.target.value }; setSplits(n); setSplitsSaved(false); }}
                          className="bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors"
                        />
                        <button
                          onClick={() => { setSplits(splits.filter((_, j) => j !== i)); setSplitsSaved(false); }}
                          className="text-white/30 hover:text-red-400 transition-colors text-sm leading-none"
                        >✕</button>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  {splits.length > 0 && (
                    <p className={`text-xs mb-3 ${
                      Math.abs(splits.reduce((acc, s) => acc + Number(s.percentage || 0), 0) - 100) < 0.01
                        ? "text-green-400/60" : "text-yellow-400/60"
                    }`}>
                      Total: {splits.reduce((acc, s) => acc + Number(s.percentage || 0), 0).toFixed(1)}%
                      {Math.abs(splits.reduce((acc, s) => acc + Number(s.percentage || 0), 0) - 100) >= 0.01 && " (should equal 100%)"}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSplits([...splits, { role: "", email: "", percentage: "" }]); setSplitsSaved(false); }}
                      className="text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white/80 px-3 py-2 rounded-lg transition-colors border border-white/[0.06]"
                    >
                      + Add Collaborator
                    </button>
                    <button
                      onClick={() => requestUnlock(saveSplits)}
                      disabled={savingSplits}
                      className="flex items-center gap-2 text-xs font-semibold bg-green-500/10 hover:bg-green-500/20 disabled:opacity-40 text-green-400 px-4 py-2 rounded-lg transition-colors"
                    >
                      {savingSplits ? <Loader2 size={12} className="animate-spin" /> : null}
                      {splitsSaved ? "Saved ✓" : "Save Splits"}
                    </button>
                  </div>
                </Section>
              )}

              {/* Request Revision */}
              <Section title="Request Revision">
                <p className="text-white/30 text-xs mb-4">
                  Ask the artist to fix something without fully rejecting. Sends an email + portal notification and marks the submission as needing revision.
                </p>
                <div className="space-y-2 mb-3">
                  {REVISION_PRESETS.map((p) => (
                    <label key={p.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${revisionPreset === p.id ? "border-amber-500/40 bg-amber-500/[0.07]" : "border-white/[0.06] hover:border-white/[0.14] bg-white/[0.02]"}`}>
                      <input
                        type="radio"
                        name="revisionPreset"
                        value={p.id}
                        checked={revisionPreset === p.id}
                        onChange={() => setRevisionPreset(p.id)}
                        className="mt-0.5 accent-amber-400 flex-shrink-0"
                      />
                      <div>
                        <p className={`text-sm font-medium ${revisionPreset === p.id ? "text-amber-300" : "text-white/70"}`}>{p.label}</p>
                        {p.reason && revisionPreset === p.id && (
                          <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{p.reason}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  rows={3}
                  placeholder={revisionPreset === "custom" ? "Describe exactly what the artist needs to fix…" : "Add extra context (optional)…"}
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-amber-500/50 outline-none text-white/70 placeholder-white/25 text-sm px-4 py-3 rounded-xl resize-none transition-colors mb-3"
                />
                <button
                  onClick={() => requestUnlock(requestRevision)}
                  disabled={sendingRevision || revisionSent || (revisionPreset === "custom" && !revisionNote.trim())}
                  className="flex items-center gap-2 text-sm font-semibold bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40 text-amber-400 px-5 py-2.5 rounded-xl transition-colors border border-amber-500/20"
                >
                  {sendingRevision ? <Loader2 size={14} className="animate-spin" /> : <Wrench size={14} />}
                  {revisionSent ? "Revision Request Sent ✓" : "Send Revision Request"}
                </button>
                {revisionSent && (
                  <p className="text-amber-400/60 text-xs mt-2">Email and in-app notification sent. Status updated to "Revision Requested".</p>
                )}
              </Section>

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
                onClick={() => requestUnlock(saveNotes)}
                disabled={updating}
                className="w-full text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/30 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {updating ? <Loader2 size={13} className="animate-spin" /> : null}
                Save Notes
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelected(null); setNotes(""); setStoreLinks({}); setStreams({}); setRoyalties(""); setEditIsrc(""); setEditUpc(""); setEditReleaseDate(""); setSplits([]); setSplitsSaved(false); setLinksSaved(false); setStreamsSaved(false); setRoyaltiesSaved(false); setMetaSaved(false); setStageSaved(false); setRevisionPreset(REVISION_PRESETS[0].id); setRevisionNote(""); setRevisionSent(false); setArtistProfile(undefined); }}
                  className="flex-1 text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/30 py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                {selected.status !== "approved" && (
                  <button
                    onClick={() => requestUnlock(() => updateStatus(selected.id, "approved"))}
                    disabled={updating}
                    className="flex-1 text-sm font-semibold bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {updating ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    Approve
                  </button>
                )}
                {selected.status !== "rejected" && (
                  <button
                    onClick={() => requestUnlock(() => updateStatus(selected.id, "rejected"))}
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
    pending:              "bg-yellow-400/10 text-yellow-400",
    approved:             "bg-green-400/10 text-green-400",
    rejected:             "bg-red-400/10 text-red-400",
    revision_requested:   "bg-amber-500/10 text-amber-400",
  };
  const labels: Record<string, string> = {
    revision_requested: "Needs Revision",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] ?? "bg-white/10 text-white/40"}`}>
      {labels[status] ?? status}
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

function PackRow({ label, value }: { label: string; value?: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 py-0.5 group">
      <span className="text-white/30 text-[10px] w-36 flex-shrink-0">{label}</span>
      <span className="text-white/70 text-[10px] flex-1 font-mono break-all leading-relaxed">{value}</span>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="text-white/0 group-hover:text-white/30 hover:!text-[#007bff] text-[9px] flex-shrink-0 transition-colors"
      >
        {copied ? "✓" : "copy"}
      </button>
    </div>
  );
}

