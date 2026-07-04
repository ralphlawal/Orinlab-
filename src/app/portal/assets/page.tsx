"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Loader2, CheckCircle2, Clock, ImageIcon, Mic2,
  FileText, Smartphone, Share2, Film, ArrowRight,
} from "lucide-react";

type AssetType = {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  category: string;
};

const ASSET_TYPES: AssetType[] = [
  // Release
  { id: "cover_art",       label: "Cover Art",              desc: "3000×3000px · JPEG/PNG for all streaming platforms",      icon: <ImageIcon size={20} />,   category: "Release" },
  { id: "back_cover",      label: "Back Cover",             desc: "For physical or digital album/EP back artwork",            icon: <ImageIcon size={20} />,   category: "Release" },
  // Identity
  { id: "press_photo",     label: "Press Photo",            desc: "High-res promo photo edited for streaming bios & press",  icon: <Mic2 size={20} />,        category: "Identity" },
  { id: "artist_bio",      label: "Artist Bio (Written)",   desc: "Short & long professional bio for all platforms",         icon: <FileText size={20} />,    category: "Identity" },
  { id: "epk",             label: "Electronic Press Kit",   desc: "Full PDF press kit for media & playlist pitching",        icon: <FileText size={20} />,    category: "Identity" },
  // Social
  { id: "instagram_post",  label: "Instagram Post",         desc: "1080×1080px release or promo graphic",                   icon: <Smartphone size={20} />,  category: "Social" },
  { id: "instagram_story", label: "Instagram Story",        desc: "1080×1920px vertical graphic or reel cover",             icon: <Smartphone size={20} />,  category: "Social" },
  { id: "x_graphic",       label: "X / Twitter Graphic",   desc: "1200×675px post graphic",                                icon: <Share2 size={20} />,      category: "Social" },
  { id: "x_header",        label: "X / Twitter Header",    desc: "1500×500px profile banner",                              icon: <Share2 size={20} />,      category: "Social" },
  { id: "youtube_thumb",   label: "YouTube Thumbnail",      desc: "1280×720px video thumbnail",                             icon: <Film size={20} />,        category: "Social" },
  { id: "yt_fb_banner",    label: "YouTube / Facebook Banner","desc": "2048×1152px channel / page banner",                  icon: <Film size={20} />,        category: "Social" },
  // Promo
  { id: "promo_flyer",     label: "Digital Promo Flyer",    desc: "Release announcement or event flyer",                    icon: <FileText size={20} />,    category: "Promo" },
  { id: "lyric_video_bg",  label: "Lyric Video Background", desc: "Visual backdrop artwork for a lyric video",              icon: <Film size={20} />,        category: "Promo" },
];

const CATEGORIES = ["Release", "Identity", "Social", "Promo"];

type AssetRequest = {
  id: string;
  asset_types: string[];
  release_title: string | null;
  vision: string | null;
  status: "pending" | "in_progress" | "completed";
  admin_notes: string | null;
  delivered_assets: Record<string, string> | null;
  created_at: string;
};

const statusCfg = {
  pending:     { label: "Pending",     color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: <Clock size={14} /> },
  in_progress: { label: "In Progress", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20",     icon: <Loader2 size={14} className="animate-spin" /> },
  completed:   { label: "Completed",   color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20",   icon: <CheckCircle2 size={14} /> },
};

const input = "w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors";

export default function AssetsPage() {
  const [email, setEmail] = useState("");
  const [releases, setReleases] = useState<{ id: string; song_title: string; release_type: string }[]>([]);
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [releaseId, setReleaseId] = useState("");
  const [vision, setVision] = useState("");
  const [colors, setColors] = useState("");
  const [refs, setRefs] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userEmail = session.user.email!;
      setEmail(userEmail);

      const [{ data: rel }, { data: reqs }] = await Promise.all([
        supabase.from("releases").select("id,song_title,release_type").eq("email", userEmail).order("submitted_at", { ascending: false }),
        supabase.from("asset_requests").select("*").eq("email", userEmail).order("created_at", { ascending: false }),
      ]);
      setReleases(rel ?? []);
      setRequests((reqs ?? []) as AssetRequest[]);
      setLoading(false);
    }
    load();
  }, [submitted]);

  function toggleType(id: string) {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function submit() {
    if (selectedTypes.length === 0) {
      setFormError("Select at least one asset type.");
      return;
    }
    if (!vision.trim()) {
      setFormError("Describe your vision so we know how to create your assets.");
      return;
    }
    setFormError("");
    setSubmitting(true);

    const releaseTitle = releases.find((r) => r.id === releaseId)?.song_title ?? null;

    const { error } = await supabase.from("asset_requests").insert({
      email,
      release_id: releaseId || null,
      release_title: releaseTitle,
      asset_types: selectedTypes,
      vision: vision.trim(),
      color_preferences: colors.trim() || null,
      reference_urls: refs.trim() || null,
      status: "pending",
    });

    if (error) {
      setFormError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    // Notify admin
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "new-asset-request",
        data: { email, asset_types: selectedTypes, release_title: releaseTitle, vision: vision.trim() },
      }),
    }).catch(() => {});

    setSubmitting(false);
    setSubmitted(true);
    setSelectedTypes([]);
    setReleaseId("");
    setVision("");
    setColors("");
    setRefs("");
    setTimeout(() => setSubmitted(false), 5000);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-white font-bold text-2xl">Creative Assets</h1>
        <p className="text-white/40 text-sm mt-2 leading-relaxed">
          Don&apos;t have everything ready for your release? Our design team will build your cover art,
          press photos, social graphics, bios, EPKs, and more — so your release looks professional everywhere.
        </p>
      </div>

      {/* Request form */}
      <div className="space-y-8">
        <div>
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
            What do you need?
          </h2>

          {CATEGORIES.map((cat) => (
            <div key={cat} className="mb-6">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-3">{cat}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ASSET_TYPES.filter((t) => t.category === cat).map((t) => {
                  const active = selectedTypes.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleType(t.id)}
                      className={`flex items-start gap-3 text-left p-4 rounded-2xl border transition-all ${
                        active
                          ? "bg-[#007bff]/10 border-[#007bff]/40"
                          : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.15]"
                      }`}
                    >
                      <div className={`flex-shrink-0 mt-0.5 ${active ? "text-[#007bff]" : "text-white/30"}`}>
                        {t.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${active ? "text-white" : "text-white/60"}`}>
                          {t.label}
                        </p>
                        <p className="text-white/30 text-xs mt-0.5 leading-relaxed">{t.desc}</p>
                      </div>
                      <div className={`flex-shrink-0 w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-colors ${
                        active ? "bg-[#007bff] border-[#007bff]" : "border-white/20"
                      }`}>
                        {active && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Release link */}
        {releases.length > 0 && (
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5">
              Link to a release (optional)
            </label>
            <select
              value={releaseId}
              onChange={(e) => setReleaseId(e.target.value)}
              className={input + " bg-[#0a0a0a] appearance-none"}
            >
              <option value="">Not tied to a specific release</option>
              {releases.map((r) => (
                <option key={r.id} value={r.id}>{r.song_title} ({r.release_type})</option>
              ))}
            </select>
          </div>
        )}

        {/* Vision */}
        <div>
          <label className="block text-white/60 text-xs font-medium mb-1.5">
            Describe your vision <span className="text-[#007bff]">*</span>
          </label>
          <p className="text-white/30 text-xs mb-2 leading-relaxed">
            Tell us your sound, mood, aesthetic, and what feel you want for the assets. The more detail, the better the result.
          </p>
          <textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            rows={4}
            placeholder="e.g. Afrobeats feel, warm tones, I want a cinematic look with gold and deep blue. I'm inspired by artists like Burna Boy. My song is called LOYAL2ME and it's about resilience…"
            className={input + " resize-none"}
          />
        </div>

        {/* Color preferences */}
        <div>
          <label className="block text-white/60 text-xs font-medium mb-1.5">
            Color preferences (optional)
          </label>
          <input
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="e.g. Gold, deep blue, black. Avoid red."
            className={input}
          />
        </div>

        {/* Reference links */}
        <div>
          <label className="block text-white/60 text-xs font-medium mb-1.5">
            Reference links (optional)
          </label>
          <p className="text-white/30 text-xs mb-2">
            Links to artists, covers, or graphics whose style you like — Google Drive, Instagram, Spotify, anywhere.
          </p>
          <textarea
            value={refs}
            onChange={(e) => setRefs(e.target.value)}
            rows={2}
            placeholder="https://open.spotify.com/artist/… or paste links one per line"
            className={input + " resize-none"}
          />
        </div>

        {formError && (
          <p className="text-red-400 text-sm">{formError}</p>
        )}

        {submitted && (
          <div className="flex items-center gap-3 bg-green-400/10 border border-green-400/20 rounded-2xl px-5 py-4">
            <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm font-medium">
              Request submitted! Our team will get started and deliver your assets through this portal.
            </p>
          </div>
        )}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-4 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
        >
          {submitting ? (
            <><Loader2 size={17} className="animate-spin" /> Submitting…</>
          ) : (
            <>Submit Asset Request <ArrowRight size={16} /></>
          )}
        </button>
      </div>

      {/* Past requests */}
      {requests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-sm uppercase tracking-widest">
            Your Requests
          </h2>

          {requests.map((req) => {
            const cfg = statusCfg[req.status] ?? statusCfg.pending;
            const typeLabels = (req.asset_types ?? []).map(
              (id) => ASSET_TYPES.find((t) => t.id === id)?.label ?? id
            );
            const hasDelivered = req.delivered_assets && Object.keys(req.delivered_assets).length > 0;

            return (
              <div key={req.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">
                      {typeLabels.slice(0, 3).join(", ")}
                      {typeLabels.length > 3 && ` +${typeLabels.length - 3} more`}
                    </p>
                    {req.release_title && (
                      <p className="text-white/40 text-xs mt-0.5">Release: {req.release_title}</p>
                    )}
                    <p className="text-white/25 text-xs mt-1">
                      Requested {new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                    {cfg.label}
                  </div>
                </div>

                {req.admin_notes && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Note from OrinlabÍ Records</p>
                    <p className="text-white/70 text-sm leading-relaxed">{req.admin_notes}</p>
                  </div>
                )}

                {hasDelivered && (
                  <div className="space-y-2">
                    <p className="text-white/30 text-xs uppercase tracking-widest">Your Assets</p>
                    {Object.entries(req.delivered_assets!).map(([key, url]) => {
                      const label = ASSET_TYPES.find((t) => t.id === key)?.label ?? key;
                      return (
                        <a
                          key={key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 bg-green-400/5 border border-green-400/20 hover:border-green-400/40 rounded-xl px-4 py-3 transition-colors group"
                        >
                          <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                          <span className="text-white/70 group-hover:text-white text-sm flex-1 transition-colors">{label}</span>
                          <ArrowRight size={13} className="text-white/20 group-hover:text-green-400 transition-colors" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
