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
};

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
  const [payoutState, setPayoutState] = useState<"idle" | "confirm" | "sent">("idle");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [hasPayoutDetails, setHasPayoutDetails] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [{ data }, { data: profileData }] = await Promise.all([
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
      ]);

      if (!data) setNotFound(true);
      else setRelease(data as Release);
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
      setPayoutState("sent");
    } catch {
      setPayoutState("idle");
    } finally {
      setPayoutLoading(false);
    }
  }

  const cfg = statusConfig[release.status] ?? statusConfig.pending;
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

      {/* Approved — store links */}
      {release.status === "approved" && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={18} className="text-[#007bff]" />
            <p className="text-white font-semibold">Store Links</p>
          </div>

          {release.store_links && Object.keys(release.store_links).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(release.store_links).map(([key, url]) => {
                const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
              <p className="text-white/40 text-sm leading-relaxed">
                Your store links will appear here once your release is live on
                streaming platforms. Our team will notify you by email when
                everything is live.
              </p>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Spotify", "Apple Music", "Boomplay", "Audiomack", "YouTube Music", "Deezer"].map((p) => (
                  <div key={p} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-center">
                    <p className="text-white/30 text-xs">{p}</p>
                    <p className="text-white/20 text-xs mt-1">Coming soon</p>
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
          <Row label="Featured" value={release.featured_artists} />
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
