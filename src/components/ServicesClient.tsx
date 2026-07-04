"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Globe, Megaphone, CalendarDays, Headphones, Palette, TrendingUp,
  ArrowRight, CheckCircle2, Loader2, X, Send, User2, Music2,
} from "lucide-react";

function SlideIn({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" | "fade" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const hidden = direction === "left" ? "opacity-0 -translate-x-8" : direction === "right" ? "opacity-0 translate-x-8" : direction === "fade" ? "opacity-0" : "opacity-0 translate-y-7";
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-x-0 translate-y-0" : hidden}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Service definitions ───────────────────────────────────── */
type ServiceDef = {
  id: string;
  icon: React.ReactNode;
  title: string;
  tagline: string;
  desc: string;
  features: string[];
  team: string;
  teamRole: string; // shown to artist: "Your request will be handled by our ..."
  portalHref?: string; // bypass modal — go directly here
  strategyMode?: boolean; // richer form for release strategy
};

export const SERVICES: ServiceDef[] = [
  {
    id: "distribution",
    icon: <Globe size={28} />,
    title: "Music Distribution",
    tagline: "Your music everywhere, instantly.",
    desc: "Distribute your singles, EPs, and albums to 150+ streaming platforms including Spotify, Apple Music, Boomplay, Audiomack, Deezer, Tidal, YouTube Music, TikTok, and more. Go live within 24–48 hours.",
    features: ["150+ platforms globally", "50+ countries covered", "24–48 hour delivery", "ISRC & UPC generation", "Metadata management", "100% royalty collection"],
    team: "Distribution Team",
    teamRole: "Distribution Manager",
    portalHref: "/portal/releases/new",
  },
  {
    id: "marketing",
    icon: <Megaphone size={28} />,
    title: "Artist Marketing",
    tagline: "Amplify your release worldwide.",
    desc: "From pre-release campaigns to post-release promotion, our marketing team creates customized campaigns that put your music in front of the right audience at the right time.",
    features: ["Social media campaigns", "Press & blog features", "Radio promotion", "Email marketing", "Targeted digital ads", "Release rollout strategy"],
    team: "Marketing Team",
    teamRole: "Marketing Manager",
  },
  {
    id: "strategy",
    icon: <CalendarDays size={28} />,
    title: "Release Strategy",
    tagline: "Plan your release for maximum impact.",
    desc: "A well-planned release makes all the difference. Our strategy team helps you choose the right date, build anticipation, and execute a rollout that maximizes streams and audience growth.",
    features: ["Release date planning", "Pre-save campaigns", "Content calendar", "Platform-by-platform strategy", "Rollout timeline", "Post-release review"],
    team: "A&R & Strategy Team",
    teamRole: "A&R Manager",
    strategyMode: true,
  },
  {
    id: "playlist",
    icon: <Headphones size={28} />,
    title: "Playlist Promotion",
    tagline: "Get on the playlists that matter.",
    desc: "Our playlist team pitches your music to editorial and independent curators across Spotify, Apple Music, Audiomack, Boomplay, and more — targeting playlists that match your genre and audience.",
    features: ["Editorial playlist pitching", "Independent curator network", "Genre-targeted placement", "Global & regional playlists", "Boomplay & Audiomack focus", "Placement reporting"],
    team: "Playlist Team",
    teamRole: "Playlist Manager",
  },
  {
    id: "brand",
    icon: <TrendingUp size={28} />,
    title: "Brand Development",
    tagline: "Build a career, not just a song.",
    desc: "Your brand is the foundation of your career. We help you develop a consistent, compelling artistic identity — from your bio to your visual aesthetic — that resonates with fans and industry professionals.",
    features: ["Artist bio writing", "Visual identity guidance", "Social media branding", "Press kit creation", "Positioning strategy", "Long-term career planning"],
    team: "Artist Development Team",
    teamRole: "Artist Manager",
  },
  {
    id: "graphics",
    icon: <Palette size={28} />,
    title: "Graphics Design",
    tagline: "Visuals that match your sound.",
    desc: "Professional cover art, promotional graphics, and visual assets designed specifically for music industry standards. We create artwork that gets attention on every platform.",
    features: ["Album & single cover art", "Promotional graphics", "Social media templates", "Press photos editing", "Streaming profile assets", "Platform-spec compliance"],
    team: "Design Team",
    teamRole: "Creative Director",
    portalHref: "/portal/assets",
  },
];

/* ── Types ─────────────────────────────────────────────────── */
type Release = { id: string; song_title: string; release_type: string };
type ArtistInfo = {
  name: string;
  email: string;
  genre: string;
  country: string;
  releases: Release[];
};

/* ── Request Modal ─────────────────────────────────────────── */
function RequestModal({
  service,
  artist,
  onClose,
}: {
  service: ServiceDef;
  artist: ArtistInfo;
  onClose: () => void;
}) {
  const [releaseId, setReleaseId] = useState("");
  const [message, setMessage] = useState("");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const inp = "w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors";

  async function submit() {
    setSubmitting(true);
    const release = artist.releases.find((r) => r.id === releaseId);
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "service-request",
        data: {
          service_title: service.title,
          team: service.team,
          team_role: service.teamRole,
          artist_name: artist.name,
          email: artist.email,
          genre: artist.genre,
          country: artist.country,
          release_title: release?.song_title ?? null,
          release_type: release?.release_type ?? null,
          message: message.trim() || null,
          goal: goal.trim() || null,
          audience: audience.trim() || null,
        },
      }),
    }).catch(() => {});
    setSubmitting(false);
    setDone(true);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/[0.08] rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <p className="text-[#007bff] text-xs font-semibold uppercase tracking-widest mb-1">
              {service.team}
            </p>
            <p className="text-white font-bold text-lg">Request: {service.title}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors mt-1">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
            <div className="w-16 h-16 bg-[#007bff]/10 rounded-full flex items-center justify-center">
              <CheckCircle2 size={30} className="text-[#007bff]" />
            </div>
            <p className="text-white font-bold text-xl">Request Sent!</p>
            <p className="text-white/50 text-sm leading-relaxed">
              Your {service.title} request has been sent to our <strong className="text-white/70">{service.teamRole}</strong>. We&apos;ll be in touch within 1–3 business days.
            </p>
            <Link
              href="/portal/messages"
              onClick={onClose}
              className="mt-2 inline-flex items-center gap-2 text-[#007bff] text-sm font-semibold hover:underline"
            >
              View your messages <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {/* Pre-filled artist info */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Your Details (pre-filled)</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#007bff]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User2 size={16} className="text-[#007bff]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{artist.name}</p>
                    <p className="text-white/40 text-xs">{artist.email}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-3">
                  {artist.genre && <span className="text-white/40 text-xs">{artist.genre}</span>}
                  {artist.country && <span className="text-white/40 text-xs">{artist.country}</span>}
                </div>
              </div>

              {/* Routing label */}
              <div className="flex items-center gap-2 bg-[#007bff]/5 border border-[#007bff]/20 rounded-xl px-4 py-3">
                <CheckCircle2 size={14} className="text-[#007bff] flex-shrink-0" />
                <p className="text-white/60 text-xs">
                  This request will be handled by our <span className="text-white font-semibold">{service.teamRole}</span>.
                </p>
              </div>

              {/* Release picker */}
              {artist.releases.length > 0 && (
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">
                    Link to a release <span className="text-white/30">(optional)</span>
                  </label>
                  <div className="relative">
                    <Music2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    <select
                      value={releaseId}
                      onChange={(e) => setReleaseId(e.target.value)}
                      className={inp + " bg-[#0a0a0a] appearance-none pl-9"}
                    >
                      <option value="">Not tied to a specific release</option>
                      {artist.releases.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.song_title} ({r.release_type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Strategy-specific fields */}
              {service.strategyMode && (
                <>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">
                      What&apos;s your main goal for this release?
                    </label>
                    <textarea
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      rows={2}
                      placeholder="e.g. Reach 100K streams, get on Spotify editorial, grow my fanbase worldwide…"
                      className={inp + " resize-none"}
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">
                      Who is your target audience?
                    </label>
                    <textarea
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      rows={2}
                      placeholder="e.g. R&amp;B fans aged 18–30 in the US and UK, streaming audiences globally…"
                      className={inp + " resize-none"}
                    />
                  </div>
                </>
              )}

              {/* General message */}
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5">
                  Anything else you&apos;d like us to know? <span className="text-white/30">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder={
                    service.id === "marketing" ? "e.g. I want to focus on Instagram and Twitter. My release date is March 15…"
                    : service.id === "playlist" ? "e.g. Looking for playlists with 100K+ followers that match my genre, targeting global listeners…"
                    : service.id === "brand" ? "e.g. I want a complete rebrand — new bio, new visual direction, more serious tone…"
                    : "Tell us what you need…"
                  }
                  className={inp + " resize-none"}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/[0.06]">
              <button
                onClick={submit}
                disabled={submitting}
                className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {submitting ? "Sending…" : `Request ${service.title}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main client component ─────────────────────────────────── */
export default function ServicesClient() {
  const [artist, setArtist] = useState<ArtistInfo | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeService, setActiveService] = useState<ServiceDef | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setSessionChecked(true); return; }

      const email = session.user.email!;
      const [{ data: releases }, { data: profile }] = await Promise.all([
        supabase
          .from("releases")
          .select("id, song_title, release_type, status, artist_name, genre, country")
          .eq("email", email)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("artist_profiles")
          .select("artist_name, genre, country")
          .eq("email", email)
          .maybeSingle(),
      ]);

      const allReleases = (releases ?? []) as (Release & { status: string; artist_name: string; genre: string; country: string })[];
      const approved = allReleases.filter((r) => r.status === "approved");
      const latest = allReleases[0];

      if (latest) {
        setArtist({
          name: profile?.artist_name || latest.artist_name || "",
          email,
          genre: profile?.genre || latest.genre || "",
          country: profile?.country || latest.country || "",
          releases: allReleases.map((r) => ({ id: r.id, song_title: r.song_title, release_type: r.release_type })),
        });
        setIsApproved(approved.length > 0);
      }
      setSessionChecked(true);
    }
    load();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#007bff]/7 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <SlideIn>
            <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">What We Offer</p>
          </SlideIn>
          <SlideIn delay={80}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
              Complete Artist<br />Services.
            </h1>
          </SlideIn>
          <SlideIn delay={150}>
            {artist ? (
              <p className="text-white/60 text-lg sm:text-xl leading-relaxed">
                Welcome back, <span className="text-white font-semibold">{artist.name}</span>. Select a service below — your details are already on file.
              </p>
            ) : (
              <p className="text-white/60 text-lg sm:text-xl leading-relaxed">
                Everything you need to release, promote, and grow your music career — under one roof, built for independent artists everywhere.
              </p>
            )}
          </SlideIn>
        </div>
      </section>

      {/* Services list */}
      <section className="py-8 px-4 pb-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {SERVICES.map((s, idx) => (
            <SlideIn key={s.id} delay={idx * 40} direction={idx % 2 === 0 ? "left" : "right"}>
            <div
              className="grid lg:grid-cols-2 gap-10 items-center bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] rounded-3xl p-8 sm:p-12 transition-all duration-300 group"
            >
              <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                <div className="w-14 h-14 bg-[#007bff]/10 group-hover:bg-[#007bff]/15 rounded-2xl flex items-center justify-center text-[#007bff] mb-6 transition-colors duration-300">
                  {s.icon}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">{s.title}</h2>
                <p className="text-[#007bff] font-medium mb-5">{s.tagline}</p>
                <p className="text-white/60 leading-relaxed mb-6">{s.desc}</p>

                {/* Team badge — only shown when logged in */}
                {artist && isApproved && (
                  <p className="text-white/30 text-xs mb-5">
                    Handled by: <span className="text-white/50 font-medium">{s.teamRole}</span>
                  </p>
                )}

                {/* CTA */}
                {!sessionChecked ? (
                  // still checking — show placeholder to avoid flash
                  <div className="h-11 w-40 bg-white/[0.04] rounded-full animate-pulse" />
                ) : isApproved && artist ? (
                  s.portalHref ? (
                    <Link
                      href={s.portalHref}
                      className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
                    >
                      {s.id === "distribution" ? "Submit a Release" : "Request Assets"} <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => setActiveService(s)}
                      className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
                    >
                      Request {s.title} <ArrowRight size={16} />
                    </button>
                  )
                ) : (
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
                  >
                    Apply Now <ArrowRight size={16} />
                  </Link>
                )}
              </div>

              <div className={`bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-6 font-semibold">What&apos;s included</p>
                <ul className="space-y-4">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-[#007bff] flex-shrink-0" />
                      <span className="text-white/70 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            </SlideIn>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 bg-white/[0.02] border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          {isApproved && artist ? (
            <>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Need Something Specific?</h2>
              <p className="text-white/50 text-lg mb-8">
                Message our team directly from your portal and we&apos;ll connect you with the right person.
              </p>
              <Link
                href="/portal/messages"
                className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-4 rounded-full transition-all"
              >
                Open Messages <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
              <p className="text-white/50 text-lg mb-10">
                Apply to join OrinlabÍ Records. Selected artists receive all of these services.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/submit" className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-4 rounded-full transition-all">
                  Apply for Distribution
                </Link>
                <Link href="/pricing" className="flex items-center gap-2 text-white/60 hover:text-white font-medium transition-colors">
                  How It Works <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Service request modal */}
      {activeService && artist && (
        <RequestModal
          service={activeService}
          artist={artist}
          onClose={() => setActiveService(null)}
        />
      )}
    </>
  );
}
