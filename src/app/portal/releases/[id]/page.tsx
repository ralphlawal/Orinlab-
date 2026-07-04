"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, Music2,
  Globe, Calendar, Mic2, FileText, Loader2, ExternalLink, Trash2,
  BarChart2, DollarSign, PenLine, Share2, Copy, Star, Send,
  ShieldCheck, Radio,
} from "lucide-react";
import { LISTENING_PLATFORMS } from "@/lib/platforms";
import { PlatformIcon } from "@/components/PlatformIcon";

type Release = {
  id: string;
  email: string;
  artist_name: string;
  song_title: string;
  album_title: string | null;
  release_type: string;
  genre: string;
  language: string | null;
  release_date: string;
  explicit: boolean;
  status: "pending" | "approved" | "rejected";
  review_notes: string | null;
  cover_art_url: string | null;
  audio_file_url: string | null;
  store_links: Record<string, string> | null;
  ditto_smart_link: string | null;
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
  youtube_content_id: boolean | null;
  artist_bio: string | null;
};

const DITTO_PLATFORMS = LISTENING_PLATFORMS;

const statusConfig = {
  pending: {
    icon: Clock, label: "Under Review", color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    heading: "Your application is under review.",
    body: "Our team is listening to your music and will reach out within 3–5 business days.",
  },
  approved: {
    icon: CheckCircle2, label: "Approved", color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    heading: "Your release has been approved!",
    body: "Congratulations — your music has been selected for global distribution.",
  },
  rejected: {
    icon: XCircle, label: "Not Selected", color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    heading: "Your application was not selected.",
    body: "We appreciate you applying. Keep creating and reapply — applications are always open.",
  },
};

export default function ReleaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<"overview" | "stores" | "services" | "splits">("overview");

  const [takedownState, setTakedownState] = useState<"idle" | "confirm" | "sent">("idle");
  const [sendingTakedown, setSendingTakedown] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [presaveCopied, setPresaveCopied] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState<string | null>(null);
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
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaDraft, setMetaDraft] = useState({ song_title: "", genre: "", language: "", copyright_owner: "", copyright_year: "", artist_bio: "" });
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaSaved, setMetaSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [{ data }, { data: profileData }, { data: splitsData }] = await Promise.all([
        supabase.from("releases").select("*").eq("id", id).eq("email", session.user.email!).maybeSingle(),
        supabase.from("artist_profiles").select("payout_method").eq("email", session.user.email!).maybeSingle(),
        supabase.from("royalty_splits").select("name, email, percentage").eq("release_id", id).order("created_at", { ascending: true }),
      ]);

      if (splitsData?.length) {
        setSplits(splitsData.map((s: { name: string; email: string | null; percentage: number }) => ({
          role: s.name, email: s.email ?? "", percentage: String(s.percentage),
        })));
      }

      if (!data) setNotFound(true);
      else {
        setRelease(data as Release);
        setLocalLinks((data as Release).store_links ?? {});
        const raw = (data as Release).featured_artists;
        if (raw) {
          try { setFeaturedArtists(JSON.parse(raw)); }
          catch {
            setFeaturedArtists(raw.split(",").map((n: string) => ({ name: n.trim(), spotify_id: "", apple_id: "" })).filter((a: { name: string }) => a.name));
          }
        }
      }
      setHasPayoutDetails(!!profileData?.payout_method);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 size={28} className="text-[#007bff] animate-spin" /></div>;
  if (notFound || !release) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <p className="text-white/50">Release not found.</p>
      <Link href="/portal" className="text-[#007bff] text-sm mt-4 inline-block hover:underline">← Back to portal</Link>
    </div>
  );

  async function saveSplits() {
    if (!release) return;
    setSavingSplits(true);
    const { error: delErr } = await supabase.from("royalty_splits").delete().eq("release_id", release.id);
    if (delErr) { console.error("royalty_splits delete:", delErr); setSavingSplits(false); alert("Save failed — please try again."); return; }
    const valid = splits.filter((s) => s.role && Number(s.percentage) > 0);
    if (valid.length > 0) {
      const { error: insErr } = await supabase.from("royalty_splits").insert(valid.map((s) => ({
        release_id: release.id, name: s.role, email: s.email.trim() || null, percentage: Number(s.percentage),
      })));
      if (insErr) { console.error("royalty_splits insert:", insErr); setSavingSplits(false); alert("Save failed — please try again."); return; }
    }
    setSavingSplits(false); setSplitsSaved(true); setEditingSplits(false);
    setTimeout(() => setSplitsSaved(false), 3000);
  }

  async function saveFeaturedArtists() {
    if (!release) return;
    setSavingFeatured(true);
    const valid = featuredArtists.filter((a) => a.name.trim());
    await supabase.from("releases").update({ featured_artists: valid.length > 0 ? JSON.stringify(valid) : null }).eq("id", release.id);
    setSavingFeatured(false); setFeaturedSaved(true); setEditingFeatured(false);
    setTimeout(() => setFeaturedSaved(false), 3000);
  }

  async function saveStoreLinks() {
    if (!release) return;
    setSavingLinks(true);
    const filtered = Object.fromEntries(Object.entries(localLinks).filter(([, v]) => v.trim() !== ""));
    await supabase.from("releases").update({ store_links: filtered }).eq("id", release.id);
    setRelease((r) => r ? { ...r, store_links: filtered } : r);
    fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "store-links-added", data: { email: release.email, artist_name: release.artist_name, song_title: release.song_title, store_links: filtered } }) }).catch(() => {});
    setSavingLinks(false); setLinksSaved(true); setEditingLinks(false);
    setTimeout(() => setLinksSaved(false), 3000);
  }

  async function saveMeta() {
    if (!release) return;
    setSavingMeta(true);
    const update = {
      song_title: metaDraft.song_title.trim() || release.song_title,
      genre: metaDraft.genre || release.genre,
      language: metaDraft.language || release.language,
      copyright_owner: metaDraft.copyright_owner.trim() || release.copyright_owner,
      copyright_year: metaDraft.copyright_year.trim() || release.copyright_year,
      artist_bio: metaDraft.artist_bio.trim() || release.artist_bio,
    };
    await supabase.from("releases").update(update).eq("id", release.id);
    setRelease((r) => r ? { ...r, ...update } : r);
    setSavingMeta(false); setMetaSaved(true); setEditingMeta(false);
    setTimeout(() => setMetaSaved(false), 3000);
  }

  async function handlePayoutRequest() {
    if (!release) return;
    setPayoutLoading(true);
    try {
      const { data: profileData } = await supabase.from("artist_profiles")
        .select("payout_method,bank_name,bank_account_name,bank_account_number,bank_country,paypal_email,mobile_money_provider,mobile_money_number")
        .eq("email", release.email).maybeSingle();
      await supabase.from("payout_requests").insert({
        email: release.email, artist_name: release.artist_name, song_title: release.song_title,
        release_id: release.id, amount_usd: release.royalties_usd ?? 0,
        payout_method: profileData?.payout_method ?? null, bank_name: profileData?.bank_name ?? null,
        bank_account_name: profileData?.bank_account_name ?? null, bank_account_number: profileData?.bank_account_number ?? null,
        bank_country: profileData?.bank_country ?? null, paypal_email: profileData?.paypal_email ?? null,
        mobile_money_provider: profileData?.mobile_money_provider ?? null, mobile_money_number: profileData?.mobile_money_number ?? null, status: "pending",
      });
      await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "payout-request", data: { email: release.email, artist_name: release.artist_name, song_title: release.song_title, royalties_usd: release.royalties_usd, release_id: release.id, payout_method: profileData?.payout_method ?? null, bank_name: profileData?.bank_name ?? null, bank_account_name: profileData?.bank_account_name ?? null, bank_account_number: profileData?.bank_account_number ?? null, bank_country: profileData?.bank_country ?? null, paypal_email: profileData?.paypal_email ?? null, mobile_money_provider: profileData?.mobile_money_provider ?? null, mobile_money_number: profileData?.mobile_money_number ?? null } }) });
      fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "payout-confirmation", data: { email: release.email, artist_name: release.artist_name, song_title: release.song_title, amount_usd: release.royalties_usd ?? 0 } }) }).catch(() => {});
      setPayoutState("sent");
    } catch { setPayoutState("idle"); }
    finally { setPayoutLoading(false); }
  }

  const cfg = (() => {
    if (release.status === "approved") {
      const stage = release.distribution_stage ?? "submitted";
      if (stage === "live") return { icon: CheckCircle2, label: "Live", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", heading: "Your music is live worldwide!", body: "Your release is now available on streaming platforms globally. Add your links below and share them with your fans." };
      if (stage === "in_distribution") return { icon: Clock, label: "Processing", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", heading: "Your release is being distributed.", body: "We have submitted your music to streaming platforms. It typically goes live within 24–72 hours." };
    }
    return statusConfig[release.status] ?? statusConfig.pending;
  })();
  const Icon = cfg.icon;

  const stageOrder = { submitted: 0, in_distribution: 1, live: 2 };
  const currentStage = stageOrder[release.distribution_stage ?? "submitted"] ?? 0;
  const collaboratorTotal = splits.reduce((a, s) => a + Number(s.percentage || 0), 0);
  const myShare = Math.max(0, 100 - collaboratorTotal);

  const TABS = [
    { key: "overview",  label: "Overview",         num: 1 },
    { key: "stores",    label: "Stores",            num: 2 },
    { key: "services",  label: "Services & Extras", num: 3 },
    { key: "splits",    label: "Royalty Splits",    num: 4 },
  ] as const;

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      {/* Back */}
      <Link href="/portal" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-8">
        <ArrowLeft size={15} /> My Releases
      </Link>

      {/* Tab navigation — Ditto style */}
      <div className="flex border-b border-white/[0.08] mb-8">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2.5 px-5 py-4 text-sm font-medium border-b-2 transition-all -mb-px ${
                active
                  ? "border-[#007bff] text-white"
                  : "border-transparent text-white/35 hover:text-white/70"
              }`}
            >
              <span className={`text-[11px] font-bold tabular-nums ${active ? "text-[#007bff]" : "text-white/25"}`}>{t.num}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Overview ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* Release hero */}
          <div className="flex gap-6 items-start">
            <div className="w-44 h-44 rounded-2xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black flex items-center justify-center">
              {release.cover_art_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={release.cover_art_url} alt="" className="w-full h-full object-cover" />
                : <Music2 size={40} className="text-[#007bff]/40" />}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest mb-3 ${cfg.bg} ${cfg.color}`}>
                <Icon size={11} /> {cfg.label}
              </div>
              <h1 className="text-white font-bold text-3xl leading-tight">{release.song_title}</h1>
              <p className="text-[#007bff] text-base mt-1 font-medium">
                {release.artist_name}
                {featuredArtists.length > 0 && ` (feat. ${featuredArtists.map(f => f.name).join(", ")})`}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1.5">
                <MetaRow label="Label" value="OrinlabÍ Records" />
                <MetaRow label="Language" value={release.language ?? "English"} />
                <MetaRow label="Copyright" value={`© ${release.copyright_year} ${release.copyright_owner}`} />
                <MetaRow label="Release Date" value={release.release_date ? new Date(release.release_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"} />
                <MetaRow label="Release Type" value={release.release_type} />
                <MetaRow label="Production Year" value={release.copyright_year} />
                <MetaRow label="Primary Genre" value={release.genre} />
                <MetaRow label="Explicit" value={release.explicit ? "Yes" : "No"} />
                {release.upc && <MetaRow label="UPC" value={release.upc} mono />}
                {release.isrc && <MetaRow label="ISRC" value={release.isrc} mono />}
              </div>
            </div>
          </div>

          {/* Distribution progress */}
          {release.status === "approved" && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-5">Distribution Progress</p>
              <div className="flex items-center">
                {([
                  { key: "submitted" as const,       label: "Submitted"       },
                  { key: "in_distribution" as const, label: "In Distribution" },
                  { key: "live" as const,            label: "Live"            },
                ]).map(({ key, label }, i, arr) => {
                  const mine = stageOrder[key];
                  const done = mine <= currentStage;
                  const active = mine === currentStage;
                  return (
                    <div key={key} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${done ? "border-[#007bff] bg-[#007bff]/20" : "border-white/10 bg-white/[0.03]"}`}>
                          {done ? <CheckCircle2 size={15} className={active ? "text-[#007bff]" : "text-[#007bff]/60"} /> : <span className="w-2 h-2 rounded-full bg-white/10" />}
                        </div>
                        <p className={`text-xs mt-2 font-medium text-center leading-tight ${active ? "text-white" : done ? "text-white/40" : "text-white/20"}`}>{label}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`h-0.5 flex-1 -mt-5 ${done && stageOrder[arr[i + 1].key] <= currentStage ? "bg-[#007bff]/30" : "bg-white/[0.06]"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status message */}
          <div className={`rounded-2xl border p-5 ${cfg.bg}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className={`font-semibold mb-1.5 ${cfg.color}`}>{cfg.heading}</p>
                <p className="text-white/60 text-sm leading-relaxed">{cfg.body}</p>
              </div>
              {release.status === "pending" && (
                <button
                  onClick={() => { setMetaDraft({ song_title: release.song_title, genre: release.genre, language: release.language ?? "", copyright_owner: release.copyright_owner, copyright_year: release.copyright_year, artist_bio: release.artist_bio ?? "" }); setEditingMeta(true); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white border border-white/[0.1] hover:border-white/30 px-3 py-2 rounded-xl transition-colors flex-shrink-0"
                >
                  <PenLine size={13} /> Edit Info
                </button>
              )}
            </div>
            {release.review_notes && (
              <div className="mt-4 pt-4 border-t border-white/[0.08]">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Note from OrinlabÍ Records</p>
                <p className="text-white/80 text-sm leading-relaxed">{release.review_notes}</p>
              </div>
            )}
          </div>

          {/* Inline metadata editor — pending releases only */}
          {editingMeta && release.status === "pending" && (() => {
            const inp = "w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-2.5 rounded-xl transition-colors";
            return (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                <p className="text-white font-semibold mb-4">Edit Release Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white/40 text-xs mb-1">Track Title</label>
                    <input value={metaDraft.song_title} onChange={(e) => setMetaDraft((d) => ({ ...d, song_title: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1">Genre</label>
                    <input value={metaDraft.genre} onChange={(e) => setMetaDraft((d) => ({ ...d, genre: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1">Language</label>
                    <input value={metaDraft.language} onChange={(e) => setMetaDraft((d) => ({ ...d, language: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1">Copyright Owner</label>
                    <input value={metaDraft.copyright_owner} onChange={(e) => setMetaDraft((d) => ({ ...d, copyright_owner: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1">Copyright Year</label>
                    <input value={metaDraft.copyright_year} onChange={(e) => setMetaDraft((d) => ({ ...d, copyright_year: e.target.value }))} className={inp} />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-white/40 text-xs mb-1">Artist Bio</label>
                  <textarea value={metaDraft.artist_bio} onChange={(e) => setMetaDraft((d) => ({ ...d, artist_bio: e.target.value }))} rows={3} className={`${inp} resize-none`} />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={saveMeta} disabled={savingMeta}
                    className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0066dd] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                    {savingMeta ? <Loader2 size={14} className="animate-spin" /> : null}
                    Save Changes
                  </button>
                  <button onClick={() => setEditingMeta(false)} className="text-sm text-white/30 hover:text-white transition-colors">Cancel</button>
                </div>
              </div>
            );
          })()}

          {/* Resubmit after rejection */}
          {release.status === "rejected" && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white font-semibold mb-1">Want to try again?</p>
              <p className="text-white/40 text-sm mb-4 leading-relaxed">
                You can resubmit this release after making changes. Your info will be pre-filled so you only need to fix what&apos;s needed.
              </p>
              <Link
                href={`/portal/releases/new?from=${release.id}`}
                className="inline-flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <ArrowLeft size={14} className="rotate-180" /> Fix &amp; Resubmit
              </Link>
            </div>
          )}

          {/* Contract */}
          {release.status === "approved" && (
            <div className={`border rounded-2xl p-5 ${release.contract_signed_at ? "bg-green-500/5 border-green-500/15" : "bg-[#007bff]/5 border-[#007bff]/20"}`}>
              <div className="flex items-start gap-3">
                {release.contract_signed_at
                  ? <CheckCircle2 size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  : <PenLine size={18} className="text-[#007bff] flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  {release.contract_signed_at ? (
                    <>
                      <p className="text-green-400 font-semibold text-sm mb-1">Distribution Agreement Signed</p>
                      <p className="text-white/40 text-xs">Signed on {new Date(release.contract_signed_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. A PDF copy was sent to your email.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white/80 font-semibold text-sm mb-1">Sign Your Distribution Agreement</p>
                      <p className="text-white/40 text-xs leading-relaxed mb-4">Please read and sign the distribution agreement to complete your onboarding.</p>
                      <Link href={`/portal/contract/${release.id}`} className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0066dd] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors">
                        <PenLine size={13} /> Read & Sign Contract
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pre-save — artists can self-enable for pending/approved releases */}
          {(release.status === "pending" || release.status === "approved") && (
            <div className={`border rounded-2xl p-5 ${release.presave_enabled ? "bg-[#1db954]/5 border-[#1db954]/20" : "bg-white/[0.03] border-white/[0.06]"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Star size={17} className={release.presave_enabled ? "text-[#1db954]" : "text-white/30"} />
                  <p className="text-white font-semibold">Pre-save Campaign</p>
                  {release.presave_enabled && <span className="text-[10px] font-bold bg-[#1db954]/20 text-[#1db954] px-2 py-0.5 rounded-full uppercase tracking-widest">Active</span>}
                </div>
                <button
                  onClick={async () => {
                    const next = !release.presave_enabled;
                    await supabase.from("releases").update({ presave_enabled: next, presave_url: next ? `https://orinlabi.com/presave/${release.id}` : null }).eq("id", release.id);
                    setRelease((r) => r ? { ...r, presave_enabled: next, presave_url: next ? `https://orinlabi.com/presave/${release.id}` : null } : r);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${release.presave_enabled ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" : "bg-[#1db954]/10 border-[#1db954]/20 text-[#1db954] hover:bg-[#1db954]/20"}`}
                >
                  {release.presave_enabled ? "Turn Off" : "Enable Pre-save"}
                </button>
              </div>
              <p className="text-white/40 text-sm mb-4">
                {release.presave_enabled
                  ? "Fans can follow this link to pre-save your release before it drops."
                  : "Enable this to get a shareable pre-save link for your release."}
              </p>
              {release.presave_enabled && (
                <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
                  <span className="text-white/60 text-xs flex-1 truncate font-mono">https://orinlabi.com/presave/{release.id}</span>
                  <button onClick={() => { navigator.clipboard.writeText(`https://orinlabi.com/presave/${release.id}`); setPresaveCopied(true); setTimeout(() => setPresaveCopied(false), 2000); }} className="flex items-center gap-1.5 text-xs font-semibold text-[#1db954] hover:text-white transition-colors flex-shrink-0">
                    {presaveCopied ? <CheckCircle2 size={13} /> : <Copy size={13} />}{presaveCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Smart link — visible for all approved releases */}
          {release.status === "approved" && (() => {
            const hasStoreLinks = release.store_links && Object.keys(release.store_links).length > 0;
            // When Ditto link is set and no individual store links yet, the smart link
            // redirects fans directly to Ditto — show the Ditto URL as the primary link.
            const primaryUrl = release.ditto_smart_link && !hasStoreLinks
              ? release.ditto_smart_link
              : `https://orinlabi.com/listen/${release.id}`;
            const displayUrl = release.ditto_smart_link && !hasStoreLinks
              ? release.ditto_smart_link.replace(/^https?:\/\//, "")
              : `orinlabi.com/listen/${release.id}`;

            return (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Share2 size={17} className="text-[#007bff]" />
                  <p className="text-white font-semibold">Your Smart Link</p>
                </div>
                <p className="text-white/40 text-sm mb-4">
                  {hasStoreLinks
                    ? "Share this link — fans choose their streaming platform."
                    : release.ditto_smart_link
                    ? "Your Ditto smart link is live. Share it — fans pick their platform on Ditto."
                    : "Your smart link is ready. Share it now — streaming links will appear as your release goes live."}
                </p>
                <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3">
                  <span className="text-white/60 text-xs flex-1 truncate font-mono">{displayUrl}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(primaryUrl); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#007bff] hover:text-white transition-colors flex-shrink-0"
                  >
                    {linkCopied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    {linkCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <a href={primaryUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors">
                  <ExternalLink size={11} /> Open link
                </a>
                {/* When individual store links exist and a Ditto link is also set, show it as a secondary option */}
                {hasStoreLinks && release.ditto_smart_link && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <p className="text-white/25 text-[10px] mb-2 uppercase tracking-widest">Permalink (always works)</p>
                    <span className="text-white/30 text-xs font-mono">orinlabi.com/listen/{release.id}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Social sharing copy */}
          {release.status === "approved" && (() => {
            const hasStoreLinks = release.store_links && Object.keys(release.store_links).length > 0;
            const smartLink = release.ditto_smart_link && !hasStoreLinks
              ? release.ditto_smart_link
              : `https://orinlabi.com/listen/${release.id}`;
            const captions: { label: string; key: string; text: string }[] = [
              {
                label: "Instagram / TikTok",
                key: "ig",
                text: `🎵 "${release.song_title}" by ${release.artist_name} is OUT NOW!\n\nStream on all platforms 👇\n${smartLink}\n\n#${release.artist_name.replace(/\s+/g, "")} #NewMusic #OrinlabiRecords`,
              },
              {
                label: "Twitter / X",
                key: "x",
                text: `"${release.song_title}" is out now 🎶\nStream it here → ${smartLink}`,
              },
              {
                label: "WhatsApp",
                key: "wa",
                text: `My new ${release.release_type.toLowerCase()} "${release.song_title}" is out! 🔥 Listen here: ${smartLink}`,
              },
            ];
            return (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Send size={17} className="text-violet-400" />
                  <p className="text-white font-semibold">Share Your Release</p>
                </div>
                <p className="text-white/40 text-sm mb-4">Ready-made captions — tap to copy, paste anywhere.</p>
                <div className="space-y-3">
                  {captions.map(({ label, key, text }) => (
                    <div key={key} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">{label}</p>
                        <button
                          onClick={() => { navigator.clipboard.writeText(text); setCopiedCaption(key); setTimeout(() => setCopiedCaption(null), 2000); }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-white transition-colors"
                        >
                          {copiedCaption === key ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                          {copiedCaption === key ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed whitespace-pre-line">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Stream analytics */}
          {release.status === "approved" && release.streams && Object.values(release.streams).some((v) => v > 0) && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4"><BarChart2 size={17} className="text-[#007bff]" /><p className="text-white font-semibold">Stream Analytics</p></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(release.streams).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).map(([key, count]) => (
                  <div key={key} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                    <p className="text-white/40 text-xs mb-1">{key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</p>
                    <p className="text-white font-bold text-lg">{fmtStreams(count)}</p>
                    <p className="text-white/25 text-xs">streams</p>
                  </div>
                ))}
              </div>
              <p className="text-white/20 text-xs mt-4">Stream counts updated monthly from DSP reports.</p>
            </div>
          )}

          {/* Content ID status */}
          {release.status === "approved" && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck size={17} className={release.youtube_content_id ? "text-green-400" : "text-white/25"} />
                <p className="text-white font-semibold">YouTube Content ID</p>
              </div>
              {release.youtube_content_id ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-green-400/15 text-green-400 px-2.5 py-1 rounded-full uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                      Active
                    </span>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Your music is registered with Content ID. If your track is used in YouTube videos, you&apos;ll earn a share of ad revenue. Earnings appear in your royalties report.
                  </p>
                  <p className="text-white/25 text-xs mt-3">To dispute a Content ID claim or report an issue, use the Support tab.</p>
                </>
              ) : (
                <p className="text-white/40 text-sm leading-relaxed">
                  Content ID is not active for this release. If you requested it during submission and it&apos;s been more than 14 days, contact us via the Support tab.
                </p>
              )}
            </div>
          )}

          {/* Credits */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4"><Mic2 size={16} className="text-[#007bff]" /><p className="text-white/60 text-xs uppercase tracking-widest font-medium">Credits</p></div>
            <div className="space-y-3">
              <Row label="Songwriters" value={release.songwriters} />
              <Row label="Producers" value={release.producers} />
              {release.album_title && <Row label="Album" value={release.album_title} />}

              {/* Featured artists */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/30 text-[10px] uppercase tracking-widest">Featured Artists</span>
                  <div className="flex items-center gap-3">
                    {featuredSaved && <span className="text-green-400 text-xs">Saved ✓</span>}
                    {!editingFeatured && (
                      <button onClick={() => setEditingFeatured(true)} className="flex items-center gap-1 text-[#007bff] text-xs hover:text-white transition-colors">
                        <PenLine size={11} />{featuredArtists.length > 0 ? "Edit / Add IDs" : "Add"}
                      </button>
                    )}
                  </div>
                </div>
                {editingFeatured ? (
                  <div className="space-y-2">
                    {featuredArtists.map((fa, i) => (
                      <div key={i} className="space-y-1.5 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="Artist name *" value={fa.name} onChange={(e) => { const n = [...featuredArtists]; n[i] = { ...n[i], name: e.target.value }; setFeaturedArtists(n); }} className="flex-1 bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors" />
                          <button type="button" onClick={() => setFeaturedArtists(featuredArtists.filter((_, j) => j !== i))} className="text-white/20 hover:text-red-400 transition-colors text-sm flex-shrink-0">✕</button>
                        </div>
                        <input type="text" placeholder="Spotify Artist ID (optional)" value={fa.spotify_id} onChange={(e) => { const n = [...featuredArtists]; n[i] = { ...n[i], spotify_id: e.target.value }; setFeaturedArtists(n); }} className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors" />
                        <input type="text" placeholder="Apple Music Artist ID (optional)" value={fa.apple_id} onChange={(e) => { const n = [...featuredArtists]; n[i] = { ...n[i], apple_id: e.target.value }; setFeaturedArtists(n); }} className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors" />
                      </div>
                    ))}
                    <button type="button" onClick={() => setFeaturedArtists([...featuredArtists, { name: "", spotify_id: "", apple_id: "" }])} className="text-xs text-white/40 hover:text-white transition-colors">+ Add artist</button>
                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={saveFeaturedArtists} disabled={savingFeatured} className="flex items-center gap-1.5 text-xs font-semibold bg-[#007bff]/10 hover:bg-[#007bff]/20 text-[#007bff] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                        {savingFeatured ? <Loader2 size={11} className="animate-spin" /> : null} Save
                      </button>
                      <button onClick={() => setEditingFeatured(false)} className="text-xs text-white/30 hover:text-white transition-colors px-2">Cancel</button>
                    </div>
                  </div>
                ) : featuredArtists.length > 0 ? (
                  <div className="space-y-1.5">
                    {featuredArtists.map((fa, i) => (
                      <div key={i} className="space-y-0.5">
                        <p className="text-white/70 text-xs font-medium">{fa.name}</p>
                        {fa.spotify_id && <p className="text-white/30 text-[10px]">Spotify: {fa.spotify_id}</p>}
                        {fa.apple_id && <p className="text-white/30 text-[10px]">Apple Music: {fa.apple_id}</p>}
                        {!fa.spotify_id && !fa.apple_id && <p className="text-yellow-400/50 text-[10px]">No platform IDs yet — tap Edit to add</p>}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-white/20 text-xs">None</p>}
              </div>
            </div>
          </div>

          {/* Claim artist profiles */}
          {release.status === "approved" && release.store_links?.spotify && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3"><Star size={17} className="text-green-400" /><p className="text-white font-semibold">Claim Your Artist Profile</p></div>
              <p className="text-white/40 text-sm leading-relaxed mb-4">Claim your official artist profile on streaming platforms to update your bio and access your stats directly.</p>
              <div className="space-y-2.5">
                {[
                  { label: "Spotify for Artists", sub: "artists.spotify.com/claim", color: "#1DB954", href: "https://artists.spotify.com/claim" },
                  { label: "Apple Music for Artists", sub: "artists.apple.com", color: "#FC3C44", href: "https://artists.apple.com" },
                  { label: "Boomplay Artist Account", sub: "boomplay.com/artist-claim", color: "#f5a623", href: "https://boomplay.com/artist-claim" },
                ].map((p) => (
                  <a key={p.label} href={p.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between w-full border rounded-xl px-4 py-3.5 transition-all group hover:opacity-80"
                    style={{ background: `${p.color}10`, borderColor: `${p.color}25` }}>
                    <div>
                      <p className="text-white font-medium text-sm">{p.label}</p>
                      <p className="text-white/40 text-xs mt-0.5">{p.sub}</p>
                    </div>
                    <ExternalLink size={14} className="text-white/20 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Stores ── */}
      {tab === "stores" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-xl">Selected Stores</h2>
              <p className="text-white/40 text-sm mt-1">Your music is distributed to all supported platforms through OrinlabÍ Records.</p>
            </div>
            {release.status === "approved" && (
              <button onClick={() => setEditingLinks(!editingLinks)} className="flex items-center gap-2 text-[#007bff] hover:text-white text-sm font-medium transition-colors">
                <PenLine size={14} />{editingLinks ? "Cancel" : "Edit Links"}
              </button>
            )}
          </div>

          {editingLinks && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white/50 text-sm mb-4">Paste your streaming URLs. Leave blank if not yet available.</p>
              <div className="space-y-2 mb-5">
                {DITTO_PLATFORMS.map((p) => (
                  <div key={p.key} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}20`, color: p.color }}>
                      {PlatformIcon({ platformKey: p.key, size: 13 }) ?? <span className="text-[9px] font-bold">{p.label.charAt(0)}</span>}
                    </div>
                    <span className="text-white/50 text-xs w-28 flex-shrink-0">{p.label}</span>
                    <input type="url" placeholder="https://…" value={localLinks[p.key] ?? ""} onChange={(e) => { setLocalLinks(prev => ({ ...prev, [p.key]: e.target.value })); setLinksSaved(false); }}
                      className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2 rounded-lg transition-colors" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={saveStoreLinks} disabled={savingLinks} className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  {savingLinks ? <Loader2 size={14} className="animate-spin" /> : null} Save Links
                </button>
                <button onClick={() => { setEditingLinks(false); setLocalLinks(release.store_links ?? {}); }} className="text-sm text-white/30 hover:text-white transition-colors px-3 py-2">Cancel</button>
                {linksSaved && <span className="text-green-400 text-xs">Saved ✓</span>}
              </div>
            </div>
          )}

          {/* Platform grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {DITTO_PLATFORMS.map((p) => {
              const link = release.store_links?.[p.key];
              const isLive = release.distribution_stage === "live";
              const isProcessing = release.distribution_stage === "in_distribution";
              const statusLabel = link ? "Live" : isLive ? "Live" : isProcessing ? "Processing" : release.status === "approved" ? "Queued" : "Pending";
              const statusColor = (link || isLive) ? "text-green-400" : isProcessing ? "text-blue-400" : "text-white/25";

              return (
                <div key={p.key} className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] rounded-2xl p-4 transition-colors flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}20`, color: p.color }}>
                      {PlatformIcon({ platformKey: p.key, size: 16 }) ?? <span className="text-[11px] font-bold">{p.label.charAt(0)}</span>}
                    </div>
                    <span className="text-white/80 text-sm font-medium leading-tight">{p.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold flex items-center gap-1.5 ${statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${(link || isLive) ? "bg-green-400" : isProcessing ? "bg-blue-400 animate-pulse" : "bg-white/20"}`} />
                      {statusLabel}
                    </span>
                    {link && (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-[#007bff] transition-colors">
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {release.status !== "approved" && (
            <p className="text-white/20 text-xs text-center pt-2">Stores will activate once your release is approved and distributed.</p>
          )}
        </div>
      )}

      {/* ── Tab 3: Services & Extras ── */}
      {tab === "services" && (
        <div className="space-y-3">
          <h2 className="text-white font-bold text-xl mb-5">Services &amp; Extras</h2>

          {[
            {
              icon: <ShieldCheck size={22} className="text-green-400" />,
              label: "Content Protection",
              status: "Active | Free",
              statusColor: "text-green-400",
              dot: "bg-green-400",
              desc: "Your release is automatically protected against unauthorized use on streaming platforms.",
              action: null,
            },
            {
              icon: <Radio size={22} className="text-[#007bff]" />,
              label: "Playlist Pitch",
              status: release.status === "approved" ? "Available" : "Requires Approval",
              statusColor: release.status === "approved" ? "text-[#007bff]" : "text-white/30",
              dot: release.status === "approved" ? "bg-[#007bff]" : "bg-white/20",
              desc: "Submit your release to OrinlabÍ Records's playlist network for curator consideration.",
              action: release.status === "approved" ? <Link href="/portal/pitch" className="text-xs font-semibold text-[#007bff] hover:text-white transition-colors">Submit Pitch →</Link> : null,
            },
            {
              icon: <Globe size={22} className="text-white/30" />,
              label: "Charts Registration UK / Ireland",
              status: "Request via Support",
              statusColor: "text-white/30",
              dot: "bg-white/20",
              desc: "Get your release registered for UK & Ireland chart eligibility.",
              action: <a href="/portal/support" className="text-xs font-semibold text-white/40 hover:text-white transition-colors">Request via Support →</a>,
            },
            {
              icon: <Globe size={22} className="text-white/30" />,
              label: "Charts Registration US / Canada",
              status: "Request via Support",
              statusColor: "text-white/30",
              dot: "bg-white/20",
              desc: "Get your release registered for US & Canada chart eligibility.",
              action: <a href="/portal/support" className="text-xs font-semibold text-white/40 hover:text-white transition-colors">Request via Support →</a>,
            },
            {
              icon: <Globe size={22} className="text-white/30" />,
              label: "Charts Registration",
              status: "Request via Support",
              statusColor: "text-white/30",
              dot: "bg-white/20",
              desc: "Get your release registered for international chart programs.",
              action: <a href="/portal/support" className="text-xs font-semibold text-white/40 hover:text-white transition-colors">Request via Support →</a>,
            },
            {
              icon: <FileText size={22} className="text-white/30" />,
              label: "Report Unauthorized Use",
              status: "Available",
              statusColor: "text-white/30",
              dot: "bg-white/20",
              desc: "Found someone using your music without permission? Report it and we'll file a takedown on your behalf.",
              action: <a href="/portal/support" className="text-xs font-semibold text-white/40 hover:text-white transition-colors">Report via Support →</a>,
            },
          ].map((svc, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">{svc.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-white font-medium text-sm">{svc.label}</p>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${svc.statusColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${svc.dot}`} />{svc.status}
                  </span>
                </div>
                <p className="text-white/35 text-xs leading-relaxed mt-1.5 mb-3">{svc.desc}</p>
                {svc.action}
              </div>
            </div>
          ))}

          {/* Takedown request */}
          {release.status === "approved" && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex items-start gap-4">
              <Trash2 size={22} className="text-red-400/50 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-white font-medium text-sm">Takedown Request</p>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-white/30"><span className="w-1.5 h-1.5 rounded-full bg-white/20" />Available</span>
                </div>
                <p className="text-white/35 text-xs leading-relaxed mt-1.5 mb-3">Want this release removed from all platforms? Processing takes 3–5 business days.</p>
                {takedownState === "sent" ? (
                  <div className="flex items-center gap-2 text-green-400 text-xs"><CheckCircle2 size={13} /> Takedown request sent. Our team will be in touch.</div>
                ) : takedownState === "confirm" ? (
                  <div className="space-y-3">
                    <p className="text-white/60 text-xs font-medium">Are you sure? This will remove your release from all platforms worldwide.</p>
                    <div className="flex gap-3">
                      <button onClick={async () => { setSendingTakedown(true); await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "takedown-request", data: { artist_name: release.artist_name, song_title: release.song_title, release_type: release.release_type, release_id: release.id } }) }).catch(() => {}); fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "takedown-confirmation", data: { email: release.email, artist_name: release.artist_name, song_title: release.song_title } }) }).catch(() => {}); setSendingTakedown(false); setTakedownState("sent"); }} disabled={sendingTakedown} className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                        {sendingTakedown ? <Loader2 size={13} className="animate-spin" /> : null} Yes, request takedown
                      </button>
                      <button onClick={() => setTakedownState("idle")} className="text-white/30 hover:text-white text-xs transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setTakedownState("confirm")} className="flex items-center gap-2 border border-red-400/20 hover:border-red-400/40 text-red-400/60 hover:text-red-400 text-xs font-medium px-4 py-2 rounded-xl transition-all">
                    <Trash2 size={13} /> Request Takedown
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: Royalty Splits ── */}
      {tab === "splits" && (
        <div className="space-y-6">
          <h2 className="text-white font-bold text-xl">Share Your Royalties</h2>
          <p className="text-white/40 text-sm -mt-4">Add &amp; edit royalty splits to automatically share earnings with your collaborators.</p>

          {/* Track card — Ditto style */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black flex items-center justify-center">
                {release.cover_art_url
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={release.cover_art_url} alt="" className="w-full h-full object-cover" />
                  : <Music2 size={22} className="text-[#007bff]/40" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base leading-tight">{release.song_title}</p>
                <p className="text-white/40 text-xs mt-0.5">Account Owner · OrinlabÍ Records (me)</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 flex-wrap border-t border-white/[0.06] pt-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">My release split</p>
                  <p className="text-white font-bold text-lg">{myShare.toFixed(2)}%</p>
                </div>
                {splits.length > 0 && (
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Collaborators split</p>
                    <p className="text-[#007bff] font-bold text-lg">{collaboratorTotal.toFixed(2)}%</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${splits.length > 0 ? "bg-[#007bff]" : "bg-green-400"}`} />
                {!editingSplits && (
                  <button onClick={() => { setEditingSplits(true); if (splits.length === 0) setSplits([{ role: "", email: "", percentage: "" }]); }} className="flex items-center gap-1.5 text-sm font-semibold text-[#007bff] hover:text-white transition-colors">
                    + {splits.length > 0 ? "Edit Splits" : "Split All"}
                  </button>
                )}
                {splitsSaved && <span className="text-green-400 text-xs font-medium ml-2">Saved ✓</span>}
              </div>
            </div>
          </div>

          {/* Track-level splits list */}
          {splits.length > 0 && !editingSplits && (
            <div className="space-y-2">
              <p className="text-white/30 text-xs uppercase tracking-widest px-1">Collaborators</p>
              {splits.map((s, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{s.role}</p>
                    {s.email && <p className="text-white/30 text-xs mt-0.5">{s.email}</p>}
                  </div>
                  <span className="text-white/70 font-bold tabular-nums">{Number(s.percentage).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Edit form */}
          {editingSplits && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              {splits.length > 0 && (
                <div className="hidden sm:grid grid-cols-[1fr_1fr_80px_28px] gap-3 px-1">
                  <span className="text-white/25 text-[10px] uppercase tracking-widest">Role</span>
                  <span className="text-white/25 text-[10px] uppercase tracking-widest">Email</span>
                  <span className="text-white/25 text-[10px] uppercase tracking-widest">%</span>
                  <span />
                </div>
              )}
              <div className="space-y-3">
                {splits.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_28px] sm:grid-cols-[1fr_1fr_80px_28px] gap-2 items-start">
                    <div className="flex flex-col sm:contents gap-2">
                      <select value={s.role} onChange={(e) => { const n = [...splits]; n[i] = { ...n[i], role: e.target.value }; setSplits(n); }} className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 text-sm px-3 py-2.5 rounded-xl transition-colors">
                        <option value="">Select role…</option>
                        <optgroup label="── Song / Publishing">
                          {["Artist","Featured Artist","Songwriter / Lyricist","Composer","Topline Writer","Beatmaker","Producer","Co-Producer","Additional Producer","Melody Writer","Hook Writer","Arranger","Sample Creator","Translator / Adaptor"].map(r => <option key={r}>{r}</option>)}
                        </optgroup>
                        <optgroup label="── Master Recording">
                          {["Main Artist","Executive Producer","Vocal Producer","Background Vocalist","Session Musician","Mixing Engineer","Mastering Engineer","DJ / Remixer","Programmer / Sound Designer"].map(r => <option key={r}>{r}</option>)}
                        </optgroup>
                        <optgroup label="── Business">
                          {["Manager","Label","Distributor","Publisher","Investor / Funder","A&R Representative"].map(r => <option key={r}>{r}</option>)}
                        </optgroup>
                      </select>
                      <input type="email" placeholder="Email (optional)" value={s.email} onChange={(e) => { const n = [...splits]; n[i] = { ...n[i], email: e.target.value }; setSplits(n); }} className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-sm px-3 py-2.5 rounded-xl transition-colors" />
                      <input type="number" placeholder="%" min="0" max="100" step="0.1" value={s.percentage} onChange={(e) => { const n = [...splits]; n[i] = { ...n[i], percentage: e.target.value }; setSplits(n); }} className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-sm px-3 py-2.5 rounded-xl transition-colors" />
                    </div>
                    <button onClick={() => setSplits(splits.filter((_, j) => j !== i))} className="text-white/20 hover:text-red-400 transition-colors text-base pt-2.5 sm:pt-0">✕</button>
                  </div>
                ))}
              </div>
              {splits.length > 0 && (
                <p className={`text-sm font-medium ${Math.abs(collaboratorTotal - 100) < 0.01 ? "text-green-400" : "text-yellow-400"}`}>
                  Total: {collaboratorTotal.toFixed(1)}%{Math.abs(collaboratorTotal - 100) >= 0.01 && " — should add up to 100%"}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setSplits([...splits, { role: "", email: "", percentage: "" }])} className="text-sm text-white/50 hover:text-white border border-white/[0.08] hover:border-white/20 px-4 py-2 rounded-xl transition-colors">+ Add person</button>
                <button onClick={saveSplits} disabled={savingSplits} className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                  {savingSplits ? <Loader2 size={14} className="animate-spin" /> : null} Save Splits
                </button>
                <button onClick={() => setEditingSplits(false)} className="text-sm text-white/30 hover:text-white transition-colors px-3 py-2">Cancel</button>
              </div>
            </div>
          )}

          {splits.length === 0 && !editingSplits && (
            <div className="text-center py-10 text-white/25 text-sm">
              No splits defined. Click &quot;Split All&quot; above to add collaborators.
            </div>
          )}

          {/* Earnings in splits tab */}
          {release.status === "approved" && release.royalties_usd != null && release.royalties_usd > 0 && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4"><DollarSign size={17} className="text-green-400" /><p className="text-white font-semibold">Earnings</p></div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-green-400 text-3xl font-bold">${release.royalties_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-white/30 text-sm mb-1">USD</span>
              </div>
              {payoutState === "sent" ? (
                <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3"><CheckCircle2 size={16} className="text-green-400 flex-shrink-0" /><p className="text-green-400 text-sm">Payout request sent! Our team will reach out within 3–5 business days.</p></div>
              ) : payoutState === "confirm" ? (
                <div className="bg-white/[0.04] border border-white/[0.1] rounded-xl p-4 space-y-3">
                  {!hasPayoutDetails && <div className="flex items-start gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-3"><span className="text-yellow-400 text-xs flex-1">You haven&apos;t added your payout details yet. <Link href="/portal/profile" className="underline font-semibold">Add them in your profile</Link>.</span></div>}
                  <p className="text-white/70 text-sm">Submit a payout request for <span className="text-white font-semibold">${release.royalties_usd.toFixed(2)} USD</span>?</p>
                  <div className="flex gap-3">
                    <button onClick={handlePayoutRequest} disabled={payoutLoading} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
                      {payoutLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Confirm Request
                    </button>
                    <button onClick={() => setPayoutState("idle")} className="text-white/40 hover:text-white text-sm px-5 py-2.5 rounded-full border border-white/[0.1] hover:border-white/30 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <p className="text-white/30 text-xs">Payouts are processed monthly.</p>
                  <button onClick={() => setPayoutState("confirm")} className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
                    <DollarSign size={15} /> Request Payout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function fmtStreams(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-white/30 text-[10px] uppercase tracking-widest">{label}</p>
      <p className={`text-white/75 text-sm mt-0.5 ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
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
