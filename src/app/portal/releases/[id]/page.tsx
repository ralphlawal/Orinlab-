"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, Music2,
  Globe, Calendar, Mic2, FileText, Loader2, ExternalLink, Trash2,
  BarChart2, DollarSign, PenLine, Share2, Copy, Star, Send,
} from "lucide-react";

type Release = {
  id: string;
  email: string;
  artist_name: string;
  song_title: string;
  album_title: string | null;
  release_type: string;
  genre: string;
  release_date: string;
  explicit: boolean;
  status: "pending" | "approved" | "rejected";
  review_notes: string | null;
  cover_art_url: string | null;
  audio_file_url: string | null;
  store_links: Record<string, string> | null;
  streams: Record<string, number> | null;
  royalties_usd: number | null;
  upc: string | null;
  contract_signed_at: string | null;
  songwriters: string;
  producers: string;
  featured_artists: string | null;
  isrc: string | null;
  copyright_owner: string;
  copyright_year: string;
  submitted_at: string;
  distribution_stage: "submitted" | "in_distribution" | "live" | null;
  presave_enabled: boolean | null;
  presave_url: string | null;
};

const DITTO_PLATFORMS = [
  { key: "spotify",       label: "Spotify" },
  { key: "apple_music",   label: "Apple Music" },
  { key: "youtube_music", label: "YouTube Music" },
  { key: "amazon_music",  label: "Amazon Music" },
  { key: "deezer",        label: "Deezer" },
  { key: "tidal",         label: "TIDAL" },
  { key: "pandora",       label: "Pandora" },
  { key: "audiomack",     label: "Audiomack" },
  { key: "boomplay",      label: "Boomplay" },
  { key: "soundcloud",    label: "SoundCloud" },
  { key: "anghami",       label: "Anghami" },
  { key: "napster",       label: "Napster" },
  { key: "iheartradio",   label: "iHeartRadio" },
  { key: "tiktok",        label: "TikTok" },
  { key: "shazam",        label: "Shazam" },
  { key: "beatport",      label: "Beatport" },
  { key: "jio_saavn",     label: "JioSaavn" },
  { key: "gaana",         label: "Gaana" },
  { key: "wynk",          label: "Wynk Music" },
  { key: "kkbox",         label: "KKBOX" },
  { key: "claro_musica",  label: "Claro Música" },
  { key: "7digital",      label: "7digital" },
];

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Under Review",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    heading: "Your application is under review.",
    body: "Our team is listening to your music and will reach out within 3–5 business days. You will receive an email at your registered address with our decision.",
  },
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    heading: "Your release has been approved!",
    body: "Congratulations — your music has been selected for global distribution. Our team will reach out to confirm delivery details. Your release will go live on 150+ platforms within 24–48 hours of delivery.",
  },
  rejected: {
    icon: XCircle,
    label: "Not Selected",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    heading: "Your application was not selected.",
    body: "We appreciate you applying. This round, your release wasn't the right fit — but we encourage you to keep creating and reapply. Applications are always open.",
  },
};

export default function ReleaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [takedownState, setTakedownState] = useState<"idle" | "confirm" | "sent">("idle");
  const [sendingTakedown, setSendingTakedown] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [presaveCopied, setPresaveCopied] = useState(false);
  const [payoutState, setPayoutState] = useState<"idle" | "confirm" | "sent">("idle");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [hasPayoutDetails, setHasPayoutDetails] = useState(false);
  const [featuredArtists, setFeaturedArtists] = useState<{ name: string; spotify_id: string; apple_id: string }[]>([]);
  const [editingFeatured, setEditingFeatured] = useState(false);
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [featuredSaved, setFeaturedSaved] = useState(false);
  const [splits, setSplits] = useState<{ role: string; email: string; percentage: string }[]>([]);
  const [editingSplits, setEditingSplits] = useState(false);
  const [savingSplits, setSavingSplits] = useState(false);
  const [splitsSaved, setSplitsSaved] = useState(false);
  const [editingLinks, setEditingLinks] = useState(false);
  const [localLinks, setLocalLinks] = useState<Record<string, string>>({});
  const [savingLinks, setSavingLinks] = useState(false);
  const [linksSaved, setLinksSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [{ data }, { data: profileData }, { data: splitsData }] = await Promise.all([
        supabase
          .from("releases")
          .select("*")
          .eq("id", id)
          .eq("email", session.user.email!)
          .maybeSingle(),
        supabase
          .from("artist_profiles")
          .select("payout_method")
          .eq("email", session.user.email!)
          .maybeSingle(),
        supabase
          .from("royalty_splits")
          .select("name, email, percentage")
          .eq("release_id", id)
          .order("created_at", { ascending: true }),
      ]);

      if (splitsData?.length) {
        setSplits(splitsData.map((s: { name: string; email: string | null; percentage: number }) => ({
          role: s.name,
          email: s.email ?? "",
          percentage: String(s.percentage),
        })));
      }

      if (!data) setNotFound(true);
      else {
        setRelease(data as Release);
        setLocalLinks((data as Release).store_links ?? {});
        // Parse featured artists — handles both JSON (new) and plain text (old)
        const raw = (data as Release).featured_artists;
        if (raw) {
          try {
            setFeaturedArtists(JSON.parse(raw));
          } catch {
            // Old format: comma-separated names
            setFeaturedArtists(
              raw.split(",").map((n: string) => ({ name: n.trim(), spotify_id: "", apple_id: "" })).filter((a: { name: string }) => a.name)
            );
          }
        }
      }
      setHasPayoutDetails(!!profileData?.payout_method);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  if (notFound || !release) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-white/50">Release not found.</p>
        <Link href="/portal" className="text-[#007bff] text-sm mt-4 inline-block hover:underline">
          ← Back to portal
        </Link>
      </div>
    );
  }

  async function saveSplits() {
    if (!release) return;
    setSavingSplits(true);
    await supabase.from("royalty_splits").delete().eq("release_id", release.id);
    const valid = splits.filter((s) => s.role && Number(s.percentage) > 0);
    if (valid.length > 0) {
      await supabase.from("royalty_splits").insert(
        valid.map((s) => ({
          release_id: release.id,
          name: s.role,
          email: s.email.trim() || null,
          percentage: Number(s.percentage),
        }))
      );
    }
    setSavingSplits(false);
    setSplitsSaved(true);
    setEditingSplits(false);
    setTimeout(() => setSplitsSaved(false), 3000);
  }

  async function saveFeaturedArtists() {
    if (!release) return;
    setSavingFeatured(true);
    const valid = featuredArtists.filter((a) => a.name.trim());
    await supabase
      .from("releases")
      .update({ featured_artists: valid.length > 0 ? JSON.stringify(valid) : null })
      .eq("id", release.id);
    setSavingFeatured(false);
    setFeaturedSaved(true);
    setEditingFeatured(false);
    setTimeout(() => setFeaturedSaved(false), 3000);
  }

  async function saveStoreLinks() {
    if (!release) return;
    setSavingLinks(true);
    const filtered = Object.fromEntries(Object.entries(localLinks).filter(([, v]) => v.trim() !== ""));
    await supabase.from("releases").update({ store_links: filtered }).eq("id", release.id);
    setRelease((r) => r ? { ...r, store_links: filtered } : r);
    // Notify admin that artist added their own links
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "store-links-added",
        data: { email: release.email, artist_name: release.artist_name, song_title: release.song_title, store_links: filtered },
      }),
    }).catch(() => {});
    setSavingLinks(false);
    setLinksSaved(true);
    setEditingLinks(false);
    setTimeout(() => setLinksSaved(false), 3000);
  }

  async function handlePayoutRequest() {
    if (!release) return;
    setPayoutLoading(true);
    try {
      // Fetch artist payout details to include in the request email
      const { data: profileData } = await supabase
        .from("artist_profiles")
        .select("payout_method,bank_name,bank_account_name,bank_account_number,bank_country,paypal_email,mobile_money_provider,mobile_money_number")
        .eq("email", release.email)
        .maybeSingle();

      await supabase.from("payout_requests").insert({
        email:                   release.email,
        artist_name:             release.artist_name,
        song_title:              release.song_title,
        release_id:              release.id,
        amount_usd:              release.royalties_usd ?? 0,
        payout_method:           profileData?.payout_method ?? null,
        bank_name:               profileData?.bank_name ?? null,
        bank_account_name:       profileData?.bank_account_name ?? null,
        bank_account_number:     profileData?.bank_account_number ?? null,
        bank_country:            profileData?.bank_country ?? null,
        paypal_email:            profileData?.paypal_email ?? null,
        mobile_money_provider:   profileData?.mobile_money_provider ?? null,
        mobile_money_number:     profileData?.mobile_money_number ?? null,
        status:                  "pending",
      });
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payout-request",
          data: {
            email: release.email,
            artist_name: release.artist_name,
            song_title: release.song_title,
            royalties_usd: release.royalties_usd,
            release_id: release.id,
            payout_method: profileData?.payout_method ?? null,
            bank_name: profileData?.bank_name ?? null,
            bank_account_name: profileData?.bank_account_name ?? null,
            bank_account_number: profileData?.bank_account_number ?? null,
            bank_country: profileData?.bank_country ?? null,
            paypal_email: profileData?.paypal_email ?? null,
            mobile_money_provider: profileData?.mobile_money_provider ?? null,
            mobile_money_number: profileData?.mobile_money_number ?? null,
          },
        }),
      });
      // Artist confirmation email
      fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payout-confirmation",
          data: { email: release.email, artist_name: release.artist_name, song_title: release.song_title, amount_usd: release.royalties_usd ?? 0 },
        }),
      }).catch(() => {});
      setPayoutState("sent");
    } catch {
      setPayoutState("idle");
    } finally {
      setPayoutLoading(false);
    }
  }

  const cfg = (() => {
    if (release.status === "approved") {
      const stage = release.distribution_stage ?? "submitted";
      if (stage === "live") return {
        icon: CheckCircle2,
        label: "Live",
        color: "text-green-400",
        bg: "bg-green-400/10 border-green-400/20",
        heading: "Your music is live worldwide!",
        body: "Your release is now available on streaming platforms globally. Add your links below and share them with your fans.",
      };
      if (stage === "in_distribution") return {
        icon: Clock,
        label: "Processing",
        color: "text-blue-400",
        bg: "bg-blue-400/10 border-blue-400/20",
        heading: "Your release is being distributed.",
        body: "We have submitted your music to streaming platforms. It typically goes live within 24–72 hours. You will receive an email as soon as it is available.",
      };
    }
    return statusConfig[release.status] ?? statusConfig.pending;
  })();
  const Icon = cfg.icon;

  return (
    <section className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Back */}
      <Link
        href="/portal"
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft size={15} /> My Releases
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5">
        <div className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black flex items-center justify-center">
          {release.cover_art_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={release.cover_art_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Music2 size={28} className="text-[#007bff]/40" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-2xl leading-tight">{release.song_title}</h1>
          <p className="text-white/50 text-sm mt-1">{release.artist_name}</p>
          <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
            <Icon size={13} />
            {cfg.label}
          </div>
        </div>
      </div>

      {/* Status card */}
      <div className={`rounded-2xl border p-6 ${cfg.bg}`}>
        <p className={`font-semibold mb-2 ${cfg.color}`}>{cfg.heading}</p>
        <p className="text-white/60 text-sm leading-relaxed">{cfg.body}</p>

        {release.review_notes && (
          <div className="mt-5 pt-5 border-t border-white/[0.08]">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Note from Orinlabí</p>
            <p className="text-white/80 text-sm leading-relaxed">{release.review_notes}</p>
          </div>
        )}
      </div>

      {/* Distribution stage progress — approved only */}
      {release.status === "approved" && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Distribution Progress</p>
          <div className="flex items-center gap-0">
            {([
              { key: "submitted",       label: "Submitted"       },
              { key: "in_distribution", label: "In Distribution" },
              { key: "live",            label: "Live"            },
            ] as const).map(({ key, label }, i, arr) => {
              const stageOrder = { submitted: 0, in_distribution: 1, live: 2 };
              const current = stageOrder[release.distribution_stage ?? "submitted"] ?? 0;
              const mine    = stageOrder[key];
              const done    = mine <= current;
              const active  = mine === current;
              return (
                <div key={key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      done ? "border-[#007bff] bg-[#007bff]/20" : "border-white/10 bg-white/[0.03]"
                    }`}>
                      {done
                        ? <CheckCircle2 size={14} className={active ? "text-[#007bff]" : "text-[#007bff]/60"} />
                        : <span className="w-2 h-2 rounded-full bg-white/10" />}
                    </div>
                    <p className={`text-xs mt-2 font-medium text-center leading-tight ${active ? "text-white" : done ? "text-white/40" : "text-white/20"}`}>
                      {label}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`h-0.5 flex-1 -mt-5 transition-all ${done && stageOrder[arr[i + 1].key] <= current ? "bg-[#007bff]/30" : "bg-white/[0.06]"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contract signing — approved releases only */}
      {release.status === "approved" && (
        <div className={`border rounded-2xl p-5 ${release.contract_signed_at ? "bg-green-500/5 border-green-500/15" : "bg-[#007bff]/5 border-[#007bff]/20"}`}>
          <div className="flex items-start gap-3">
            {release.contract_signed_at ? (
              <CheckCircle2 size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <PenLine size={18} className="text-[#007bff] flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              {release.contract_signed_at ? (
                <>
                  <p className="text-green-400 font-semibold text-sm mb-1">Distribution Agreement Signed</p>
                  <p className="text-white/40 text-xs">
                    Signed on{" "}
                    {new Date(release.contract_signed_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric",
                    })}. A PDF copy was sent to your email.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white/80 font-semibold text-sm mb-1">Sign Your Distribution Agreement</p>
                  <p className="text-white/40 text-xs leading-relaxed mb-4">
                    Your release has been approved. Please read and sign the distribution agreement to complete your onboarding. The signed contract will be emailed to you and Orinlabí.
                  </p>
                  <Link
                    href={`/portal/contract/${release.id}`}
                    className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0066dd] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <PenLine size={13} /> Read & Sign Contract
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Takedown request — approved releases only */}
      {release.status === "approved" && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Trash2 size={16} className="text-red-400/60 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-white/50 text-sm font-medium mb-1">Request Takedown</p>
              <p className="text-white/30 text-xs leading-relaxed mb-4">
                If you want this release removed from all streaming platforms, submit a takedown request. Processing takes 3–5 business days.
              </p>

              {takedownState === "sent" ? (
                <div className="flex items-center gap-2 text-green-400 text-xs">
                  <CheckCircle2 size={14} /> Takedown request sent. Our team will be in touch.
                </div>
              ) : takedownState === "confirm" ? (
                <div className="space-y-3">
                  <p className="text-white/60 text-xs font-medium">Are you sure? This will remove your release from all platforms worldwide.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        setSendingTakedown(true);
                        await fetch("/api/notify", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            type: "takedown-request",
                            data: {
                              artist_name: release.artist_name,
                              song_title: release.song_title,
                              release_type: release.release_type,
                              release_id: release.id,
                            },
                          }),
                        }).catch(() => {});
                        // Artist confirmation email
                        fetch("/api/email", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            type: "takedown-confirmation",
                            data: { email: release.email, artist_name: release.artist_name, song_title: release.song_title },
                          }),
                        }).catch(() => {});
                        setSendingTakedown(false);
                        setTakedownState("sent");
                      }}
                      disabled={sendingTakedown}
                      className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                    >
                      {sendingTakedown ? <Loader2 size={13} className="animate-spin" /> : null}
                      Yes, request takedown
                    </button>
                    <button onClick={() => setTakedownState("idle")} className="text-white/30 hover:text-white text-xs transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setTakedownState("confirm")}
                  className="flex items-center gap-2 border border-red-400/20 hover:border-red-400/40 text-red-400/60 hover:text-red-400 text-xs font-medium px-4 py-2 rounded-xl transition-all"
                >
                  <Trash2 size={13} /> Request Takedown
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content protection */}
      {release.status === "approved" && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <FileText size={16} className="text-white/30 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-white/50 text-sm font-medium mb-1">Content Protection</p>
              <p className="text-white/30 text-xs leading-relaxed mb-4">
                Found someone using your music without permission? Report it and our team will file a takedown on your behalf.
              </p>
              <a
                href="/portal/support"
                className="flex items-center gap-2 border border-white/[0.1] hover:border-[#007bff]/40 text-white/40 hover:text-[#007bff] text-xs font-medium px-4 py-2 rounded-xl transition-all"
              >
                Report Unauthorized Use →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Approved — store links */}
      {release.status === "approved" && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-[#007bff]" />
              <p className="text-white font-semibold">Store Links</p>
            </div>
            <div className="flex items-center gap-3">
              {linksSaved && <span className="text-green-400 text-xs">Saved ✓</span>}
              {!editingLinks && (
                <button
                  onClick={() => setEditingLinks(true)}
                  className="flex items-center gap-1.5 text-[#007bff] hover:text-white text-xs font-medium transition-colors"
                >
                  <PenLine size={12} />
                  {Object.keys(release.store_links ?? {}).length > 0 ? "Edit Links" : "Add Links"}
                </button>
              )}
            </div>
          </div>

          {editingLinks ? (
            <div>
              <p className="text-white/40 text-xs mb-4">
                Paste your streaming URLs below. Leave any platform blank if your music isn&apos;t there yet.
              </p>
              <div className="space-y-2 mb-5">
                {DITTO_PLATFORMS.map((p) => (
                  <div key={p.key} className="flex items-center gap-3">
                    <span className="text-white/40 text-xs w-28 flex-shrink-0">{p.label}</span>
                    <input
                      type="url"
                      placeholder="https://…"
                      value={localLinks[p.key] ?? ""}
                      onChange={(e) => { setLocalLinks((prev) => ({ ...prev, [p.key]: e.target.value })); setLinksSaved(false); }}
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={saveStoreLinks}
                  disabled={savingLinks}
                  className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {savingLinks ? <Loader2 size={14} className="animate-spin" /> : null}
                  Save Links
                </button>
                <button
                  onClick={() => { setEditingLinks(false); setLocalLinks(release.store_links ?? {}); }}
                  className="text-sm text-white/30 hover:text-white transition-colors px-3 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : Object.keys(release.store_links ?? {}).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(release.store_links!).map(([key, url]) => {
                const label = DITTO_PLATFORMS.find((p) => p.key === key)?.label
                  ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#007bff]/30 rounded-xl px-4 py-3 transition-all group"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                    <span className="text-white/70 group-hover:text-white text-sm font-medium transition-colors flex-1">
                      {label}
                    </span>
                    <ExternalLink size={13} className="text-white/20 group-hover:text-[#007bff] transition-colors" />
                  </a>
                );
              })}
            </div>
          ) : (
            <>
              <p className="text-white/40 text-sm leading-relaxed mb-4">
                Your music will be distributed to 150+ platforms. Tap <strong className="text-white/60">Add Links</strong> once your release goes live to add your streaming URLs, or our team will add them automatically.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DITTO_PLATFORMS.slice(0, 6).map((p) => (
                  <div key={p.key} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-center">
                    <p className="text-white/30 text-xs">{p.label}</p>
                    <p className="text-white/20 text-xs mt-1">Pending</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Smart link — only when store links exist */}
      {release.status === "approved" && release.store_links && Object.keys(release.store_links).length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Share2 size={18} className="text-[#007bff]" />
            <p className="text-white font-semibold">Share Your Music</p>
          </div>
          <p className="text-white/40 text-sm mb-4">
            One link that shows all your streaming platforms. Share it everywhere.
          </p>
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
            <span className="text-white/60 text-sm flex-1 truncate font-mono text-xs">
              https://orinlabi.com/listen/{release.id}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://orinlabi.com/listen/${release.id}`);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#007bff] hover:text-white transition-colors flex-shrink-0"
            >
              {linkCopied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
              {linkCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <a
            href={`/listen/${release.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            <ExternalLink size={12} /> Preview link
          </a>
        </div>
      )}

      {/* Pre-save link — shown when admin has enabled presave */}
      {release.presave_enabled && release.presave_url && (
        <div className="bg-[#1db954]/5 border border-[#1db954]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star size={18} className="text-[#1db954]" />
            <p className="text-white font-semibold">Pre-save Link</p>
            <span className="text-[10px] font-bold bg-[#1db954]/20 text-[#1db954] px-2 py-0.5 rounded-full uppercase tracking-widest">Live</span>
          </div>
          <p className="text-white/40 text-sm mb-4">
            Share this link so fans can pre-save your release before it drops. When they click it, they will be taken to Spotify to pre-save.
          </p>
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 mb-3">
            <span className="text-white/60 text-xs flex-1 truncate font-mono">
              https://orinlabi.com/presave/{release.id}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://orinlabi.com/presave/${release.id}`);
                setPresaveCopied(true);
                setTimeout(() => setPresaveCopied(false), 2000);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1db954] hover:text-white transition-colors flex-shrink-0"
            >
              {presaveCopied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
              {presaveCopied ? "Copied!" : "Copy"}
            </button>
          </div>
          <a
            href={`/presave/${release.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            <ExternalLink size={12} /> Preview pre-save page
          </a>
        </div>
      )}

      {/* Spotify for Artists / Apple Music for Artists guidance */}
      {release.status === "approved" && release.store_links && release.store_links.spotify && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Star size={18} className="text-green-400" />
            <p className="text-white font-semibold">Claim Your Artist Profile</p>
          </div>
          <p className="text-white/40 text-sm leading-relaxed mb-5">
            Now that your music is live, claim your official artist profile on Spotify and Apple Music. This lets you update your photo, bio, and access your streaming stats directly.
          </p>
          <div className="space-y-3">
            <a
              href="https://artists.spotify.com/claim"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full bg-[#1db954]/10 border border-[#1db954]/20 hover:border-[#1db954]/40 rounded-xl px-4 py-3.5 transition-all group"
            >
              <div>
                <p className="text-white font-medium text-sm">Spotify for Artists</p>
                <p className="text-white/40 text-xs mt-0.5">Claim your profile at artists.spotify.com/claim</p>
              </div>
              <ExternalLink size={14} className="text-white/20 group-hover:text-[#1db954] transition-colors flex-shrink-0" />
            </a>
            <a
              href="https://artists.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full bg-[#fc3c44]/10 border border-[#fc3c44]/20 hover:border-[#fc3c44]/40 rounded-xl px-4 py-3.5 transition-all group"
            >
              <div>
                <p className="text-white font-medium text-sm">Apple Music for Artists</p>
                <p className="text-white/40 text-xs mt-0.5">Claim your profile at artists.apple.com</p>
              </div>
              <ExternalLink size={14} className="text-white/20 group-hover:text-[#fc3c44] transition-colors flex-shrink-0" />
            </a>
            <a
              href="https://boomplay.com/artist-claim"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full bg-[#f5a623]/10 border border-[#f5a623]/20 hover:border-[#f5a623]/40 rounded-xl px-4 py-3.5 transition-all group"
            >
              <div>
                <p className="text-white font-medium text-sm">Boomplay Artist Account</p>
                <p className="text-white/40 text-xs mt-0.5">Claim your Boomplay artist page</p>
              </div>
              <ExternalLink size={14} className="text-white/20 group-hover:text-[#f5a623] transition-colors flex-shrink-0" />
            </a>
          </div>
          <p className="text-white/20 text-xs mt-4 leading-relaxed">
            You&apos;ll need the email you used to submit your release to verify ownership. It usually takes 1–2 days after your music goes live.
          </p>
        </div>
      )}

      {/* Streams */}
      {release.status === "approved" && release.streams && Object.values(release.streams).some((v) => v > 0) && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart2 size={18} className="text-[#007bff]" />
            <p className="text-white font-semibold">Stream Analytics</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(release.streams)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([key, count]) => {
                const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <div key={key} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                    <p className="text-white/40 text-xs mb-1">{label}</p>
                    <p className="text-white font-bold text-lg">{fmtStreams(count)}</p>
                    <p className="text-white/25 text-xs">streams</p>
                  </div>
                );
              })}
          </div>
          <p className="text-white/20 text-xs mt-4">
            Stream counts are updated monthly from DSP reports.
          </p>
        </div>
      )}

      {/* Royalties */}
      {release.status === "approved" && release.royalties_usd != null && release.royalties_usd > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign size={18} className="text-green-400" />
            <p className="text-white font-semibold">Earnings</p>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-green-400 text-3xl font-bold">
              ${release.royalties_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-white/30 text-sm mb-1">USD</span>
          </div>

          {payoutState === "sent" ? (
            <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3">
              <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">Payout request sent! Our team will reach out within 3–5 business days.</p>
            </div>
          ) : payoutState === "confirm" ? (
            <div className="bg-white/[0.04] border border-white/[0.1] rounded-xl p-4 space-y-3">
              {!hasPayoutDetails && (
                <div className="flex items-start gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3 mb-1">
                  <span className="text-yellow-400 text-xs flex-1">You haven&apos;t added your payout details yet. <Link href="/portal/profile" className="underline font-semibold">Add them in your profile</Link> so we know where to send your money.</span>
                </div>
              )}
              <p className="text-white/70 text-sm">Submit a payout request for <span className="text-white font-semibold">${release.royalties_usd.toFixed(2)} USD</span> to the Orinlabí team?</p>
              <div className="flex gap-3">
                <button
                  onClick={handlePayoutRequest}
                  disabled={payoutLoading}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                >
                  {payoutLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Confirm Request
                </button>
                <button
                  onClick={() => setPayoutState("idle")}
                  className="text-white/40 hover:text-white text-sm px-5 py-2.5 rounded-full border border-white/[0.1] hover:border-white/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-white/30 text-xs">
                Payouts are processed monthly. Click to request your earnings.
              </p>
              <button
                onClick={() => setPayoutState("confirm")}
                className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                <DollarSign size={15} />
                Request Payout
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Royalty Splits ── prominent standalone section ── */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <DollarSign size={18} className="text-[#007bff]" />
            <p className="text-white font-semibold">Royalty Splits</p>
          </div>
          {splitsSaved && <span className="text-green-400 text-xs font-medium">Saved ✓</span>}
        </div>
        <p className="text-white/40 text-sm mb-5 ml-7">
          Define how earnings are split between everyone who contributed — producers, songwriters, featured artists, managers, and more.
        </p>

        {/* Column headers */}
        {splits.length > 0 && (
          <div className="hidden sm:grid grid-cols-[1fr_1fr_80px_28px] gap-3 mb-2 px-1">
            <span className="text-white/25 text-[10px] uppercase tracking-widest">Role / Position</span>
            <span className="text-white/25 text-[10px] uppercase tracking-widest">Email</span>
            <span className="text-white/25 text-[10px] uppercase tracking-widest">%</span>
            <span />
          </div>
        )}

        <div className="space-y-3 mb-4">
          {splits.map((s, i) => (
            <div key={i} className={editingSplits ? "grid grid-cols-[1fr_28px] sm:grid-cols-[1fr_1fr_80px_28px] gap-2 items-start" : "flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"}>
              {editingSplits ? (
                <>
                  <div className="flex flex-col sm:contents gap-2">
                    <select
                      value={s.role}
                      onChange={(e) => { const n = [...splits]; n[i] = { ...n[i], role: e.target.value }; setSplits(n); }}
                      className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 text-sm px-3 py-2.5 rounded-xl transition-colors"
                    >
                      <option value="">Select role…</option>
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
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={s.email}
                      onChange={(e) => { const n = [...splits]; n[i] = { ...n[i], email: e.target.value }; setSplits(n); }}
                      className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-sm px-3 py-2.5 rounded-xl transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="%"
                      min="0"
                      max="100"
                      step="0.1"
                      value={s.percentage}
                      onChange={(e) => { const n = [...splits]; n[i] = { ...n[i], percentage: e.target.value }; setSplits(n); }}
                      className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-sm px-3 py-2.5 rounded-xl transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setSplits(splits.filter((_, j) => j !== i))}
                    className="text-white/20 hover:text-red-400 transition-colors text-base pt-2.5 sm:pt-0"
                  >✕</button>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{s.role}</p>
                    {s.email && <p className="text-white/30 text-xs mt-0.5">{s.email}</p>}
                  </div>
                  <span className="text-white/60 text-sm font-semibold tabular-nums">{Number(s.percentage).toFixed(1)}%</span>
                </>
              )}
            </div>
          ))}

          {splits.length === 0 && !editingSplits && (
            <p className="text-white/25 text-sm py-2">No splits defined yet. Click below to add collaborators.</p>
          )}
        </div>

        {/* Total indicator */}
        {editingSplits && splits.length > 0 && (
          <p className={`text-sm mb-3 font-medium ${
            Math.abs(splits.reduce((a, s) => a + Number(s.percentage || 0), 0) - 100) < 0.01
              ? "text-green-400" : "text-yellow-400"
          }`}>
            Total: {splits.reduce((a, s) => a + Number(s.percentage || 0), 0).toFixed(1)}%
            {Math.abs(splits.reduce((a, s) => a + Number(s.percentage || 0), 0) - 100) >= 0.01 && " — should add up to 100%"}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {editingSplits ? (
            <>
              <button
                type="button"
                onClick={() => setSplits([...splits, { role: "", email: "", percentage: "" }])}
                className="text-sm text-white/50 hover:text-white transition-colors border border-white/[0.08] hover:border-white/20 px-4 py-2 rounded-xl"
              >
                + Add person
              </button>
              <button
                onClick={saveSplits}
                disabled={savingSplits}
                className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
              >
                {savingSplits ? <Loader2 size={14} className="animate-spin" /> : null}
                Save Splits
              </button>
              <button
                onClick={() => setEditingSplits(false)}
                className="text-sm text-white/30 hover:text-white transition-colors px-3 py-2"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => { setEditingSplits(true); if (splits.length === 0) setSplits([{ role: "", email: "", percentage: "" }]); }}
              className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] hover:border-[#007bff]/40 text-white/70 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
            >
              <PenLine size={14} />
              {splits.length > 0 ? "Edit Splits" : "Define Splits"}
            </button>
          )}
        </div>
      </div>

      {/* Release details */}
      <div className="grid sm:grid-cols-2 gap-5">
        <InfoCard icon={<Calendar size={16} />} title="Release Info">
          <Row label="Type" value={release.release_type} />
          <Row label="Genre" value={release.genre} />
          <Row label="Release Date" value={release.release_date
            ? new Date(release.release_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
            : null}
          />
          {release.album_title && <Row label="Album" value={release.album_title} />}
          <Row label="Explicit" value={release.explicit ? "Yes" : "No"} />
        </InfoCard>

        <InfoCard icon={<Mic2 size={16} />} title="Credits">
          <Row label="Songwriters" value={release.songwriters} />
          <Row label="Producers" value={release.producers} />
          {/* Featured artists — editable inline */}
          <div className="py-1.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/30 text-[10px] uppercase tracking-widest">Featured Artists</p>
              {!editingFeatured && (
                <button
                  onClick={() => setEditingFeatured(true)}
                  className="flex items-center gap-1 text-[#007bff] text-xs hover:text-white transition-colors"
                >
                  <PenLine size={11} />
                  {featuredArtists.length > 0 ? "Edit / Add IDs" : "Add"}
                </button>
              )}
              {featuredSaved && <span className="text-green-400 text-xs">Saved ✓</span>}
            </div>

            {editingFeatured ? (
              <div className="space-y-2">
                {featuredArtists.map((fa, i) => (
                  <div key={i} className="space-y-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Artist name *"
                        value={fa.name}
                        onChange={(e) => {
                          const n = [...featuredArtists];
                          n[i] = { ...n[i], name: e.target.value };
                          setFeaturedArtists(n);
                        }}
                        className="flex-1 bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setFeaturedArtists(featuredArtists.filter((_, j) => j !== i))}
                        className="text-white/20 hover:text-red-400 transition-colors text-sm flex-shrink-0"
                      >✕</button>
                    </div>
                    <input
                      type="text"
                      placeholder="Spotify Artist ID (optional — from spotify.com/artist/...)"
                      value={fa.spotify_id}
                      onChange={(e) => {
                        const n = [...featuredArtists];
                        n[i] = { ...n[i], spotify_id: e.target.value };
                        setFeaturedArtists(n);
                      }}
                      className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Apple Music Artist ID (optional — from music.apple.com/artist/...)"
                      value={fa.apple_id}
                      onChange={(e) => {
                        const n = [...featuredArtists];
                        n[i] = { ...n[i], apple_id: e.target.value };
                        setFeaturedArtists(n);
                      }}
                      className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFeaturedArtists([...featuredArtists, { name: "", spotify_id: "", apple_id: "" }])}
                  className="text-xs text-white/40 hover:text-white transition-colors"
                >
                  + Add artist
                </button>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={saveFeaturedArtists}
                    disabled={savingFeatured}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-[#007bff]/10 hover:bg-[#007bff]/20 text-[#007bff] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                  >
                    {savingFeatured ? <Loader2 size={11} className="animate-spin" /> : null}
                    Save
                  </button>
                  <button
                    onClick={() => setEditingFeatured(false)}
                    className="text-xs text-white/30 hover:text-white transition-colors px-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              featuredArtists.length > 0 ? (
                <div className="space-y-1.5">
                  {featuredArtists.map((fa, i) => (
                    <div key={i} className="space-y-0.5">
                      <p className="text-white/70 text-xs font-medium">{fa.name}</p>
                      {fa.spotify_id && <p className="text-white/30 text-[10px]">Spotify: {fa.spotify_id}</p>}
                      {fa.apple_id && <p className="text-white/30 text-[10px]">Apple Music: {fa.apple_id}</p>}
                      {!fa.spotify_id && !fa.apple_id && (
                        <p className="text-yellow-400/50 text-[10px]">No platform IDs yet — tap Edit to add</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/20 text-xs">None</p>
              )
            )}
          </div>
          <Row label="ISRC" value={release.isrc} />
          <Row label="UPC" value={release.upc} />
        </InfoCard>

        <InfoCard icon={<FileText size={16} />} title="Rights">
          <Row label="Copyright" value={`© ${release.copyright_year} ${release.copyright_owner}`} />
        </InfoCard>

        <InfoCard icon={<Calendar size={16} />} title="Timeline">
          <Row
            label="Applied"
            value={new Date(release.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          />
          <Row
            label="Status"
            value={cfg.label}
          />
        </InfoCard>
      </div>
    </section>
  );
}

function fmtStreams(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#007bff]">{icon}</span>
        <p className="text-white/50 text-xs uppercase tracking-widest font-medium">{title}</p>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <span className="text-white/30 text-xs w-24 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-white/70 text-xs leading-relaxed">{value}</span>
    </div>
  );
}
