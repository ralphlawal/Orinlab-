"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Globe, Shield, Music2, Radio, Tv, Newspaper, Mic2, BarChart2,
  DollarSign, Headphones, Wand2, Star, ChevronRight, Loader2,
  CheckCircle2, X, FileText,
} from "lucide-react";
import Link from "next/link";

type InquiryService = { key: string; label: string };

const SERVICES = [
  {
    category: "Distribution & Rights",
    items: [
      { icon: Globe,      key: "distribution",   label: "Global Music Distribution",  desc: "Get your music on 150+ streaming platforms and digital stores worldwide.",               cta: "Submit Release",    href: "/portal/releases/new", color: "#007bff" },
      { icon: Shield,     key: "copyright",      label: "Content Protection",         desc: "DMCA takedowns, copyright registration, and rights enforcement across platforms.",        cta: "Request Protection", href: null,                   color: "#f59e0b" },
      { icon: FileText,   key: "publishing",     label: "Music Publishing & PRO",     desc: "Register with performing rights organisations (ASCAP, BMI, PRS, CSCM) and collect royalties.", cta: "Enquire",        href: null,                   color: "#8b5cf6" },
      { icon: DollarSign, key: "royalties",      label: "Royalty Collection",         desc: "Collect all your streaming, sync, and mechanical royalties in one place.",              cta: "View Earnings",      href: "/portal/earnings",     color: "#10b981" },
    ],
  },
  {
    category: "Promotion & Pitching",
    items: [
      { icon: Music2,     key: "playlist",       label: "Playlist Pitching",          desc: "Get featured on editorial and independent playlists on Spotify, Apple Music & more.",   cta: "Submit Pitch",       href: "/portal/pitch",        color: "#1db954" },
      { icon: Radio,      key: "radio",          label: "Radio Promotion",            desc: "Radio campaign across the UK, US, and worldwide including BBC 1Xtra and Beats 1.",             cta: "Submit Pitch",       href: "/portal/pitch",        color: "#f97316" },
      { icon: Newspaper,  key: "press",          label: "Blog & Press Coverage",      desc: "Music blog features, reviews, and artist interviews in top publications.",               cta: "Submit Pitch",       href: "/portal/pitch",        color: "#a855f7" },
      { icon: Tv,         key: "sync",           label: "Sync Licensing",             desc: "License your music for Netflix, film, TV, adverts, and video games.",                   cta: "Submit Pitch",       href: "/portal/pitch",        color: "#007bff" },
      { icon: Mic2,       key: "social",         label: "Social Media & Viral Push",  desc: "Organic campaign on TikTok, Instagram Reels, YouTube Shorts, and Twitter.",             cta: "Submit Pitch",       href: "/portal/pitch",        color: "#ec4899" },
    ],
  },
  {
    category: "Growth & Analytics",
    items: [
      { icon: BarChart2,  key: "analytics",      label: "Streaming Analytics",        desc: "View your stream counts, territories, and audience demographics per release.",          cta: "View Analytics",     href: "/portal",              color: "#007bff" },
      { icon: Star,       key: "charts",         label: "Charts Registration",        desc: "Register for Billboard, UK Official Charts, Afrochart, and more.",                      cta: "Enquire",            href: null,                   color: "#f59e0b" },
      { icon: Headphones, key: "mastering",      label: "AI Mastering",               desc: "Professional-grade mastering optimised for all streaming platforms.",                   cta: "Enquire",            href: null,                   color: "#6366f1" },
    ],
  },
  {
    category: "Artist Tools",
    items: [
      { icon: Wand2,      key: "converter",      label: "Audio Format Converter",     desc: "Convert MP3, WAV, FLAC, AAC, OGG and more — runs free in your browser.",               cta: "Open Tool",          href: "/portal/tools",        color: "#007bff" },
      { icon: Music2,     key: "smartlink",      label: "Smart Link Page",            desc: "Share one link for all platforms. Your fans pick their preferred streaming app.",       cta: "View Releases",      href: "/portal",              color: "#10b981" },
      { icon: FileText,   key: "contract",       label: "Artist Agreement",           desc: "View and sign your distribution agreement with OrinlabÍ Records.",                             cta: "View Contract",      href: "/portal",              color: "#8b5cf6" },
    ],
  },
];

export default function ServicesPage() {
  const [email, setEmail]             = useState("");
  const [artistName, setArtistName]   = useState("");
  const [inquiry, setInquiry]         = useState<InquiryService | null>(null);
  const [inquiryMsg, setInquiryMsg]   = useState("");
  const [sending, setSending]         = useState(false);
  const [sent, setSent]               = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setEmail(data.session.user.email!);
        setArtistName(data.session.user.user_metadata?.artist_name ?? "");
      }
    });
  }, []);

  async function sendInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiry || !inquiryMsg.trim()) return;
    setSending(true);
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "service-inquiry",
        data: { email, artist_name: artistName, service: inquiry.label, message: inquiryMsg.trim() },
      }),
    }).catch(() => {});
    supabase.from("support_tickets").insert({
      email,
      artist_name: artistName,
      subject: `Service Inquiry: ${inquiry.label}`,
      category: "Service Inquiry",
      description: inquiryMsg.trim(),
      status: "open",
    }).then(() => {});
    setSending(false);
    setSent(true);
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-white font-bold text-2xl mb-1">Music Services</h1>
        <p className="text-white/40 text-sm">Everything you need to distribute, promote, and grow your music career.</p>
      </div>

      {SERVICES.map((group) => (
        <div key={group.category} className="mb-10">
          <h2 className="text-white/30 text-xs uppercase tracking-widest mb-4">{group.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.items.map((item) => (
              <div
                key={item.key}
                className="bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] rounded-2xl p-5 transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}15`, color: item.color }}>
                    <item.icon size={18} />
                  </div>
                </div>
                <p className="text-white font-semibold text-sm mb-1">{item.label}</p>
                <p className="text-white/40 text-xs leading-relaxed flex-1 mb-4">{item.desc}</p>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    style={{ color: item.color }}
                  >
                    {item.cta} <ChevronRight size={12} />
                  </Link>
                ) : (
                  <button
                    onClick={() => { setInquiry({ key: item.key, label: item.label }); setInquiryMsg(""); setSent(false); }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
                    style={{ color: item.color }}
                  >
                    {item.cta} <ChevronRight size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Inquiry modal */}
      {inquiry && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0">
          <div className="bg-[#111] border border-white/[0.10] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            {sent ? (
              <div className="text-center py-4">
                <CheckCircle2 size={36} className="text-green-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Inquiry sent!</p>
                <p className="text-white/40 text-sm mb-5">Our team will be in touch within 1–2 business days.</p>
                <button onClick={() => setInquiry(null)} className="text-[#007bff] text-sm hover:underline">Close</button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-white font-semibold">{inquiry.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">We'll get back to you within 1–2 business days.</p>
                  </div>
                  <button onClick={() => setInquiry(null)} className="text-white/30 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={sendInquiry} className="space-y-4">
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">Your message</label>
                    <textarea
                      value={inquiryMsg}
                      onChange={(e) => setInquiryMsg(e.target.value)}
                      rows={4}
                      required
                      placeholder="Tell us about your release, your goals, and what you need…"
                      className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl resize-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending || !inquiryMsg.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    {sending && <Loader2 size={14} className="animate-spin" />}
                    Send Inquiry
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
