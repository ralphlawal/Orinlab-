"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const FAQS = [
  {
    category: "Distribution",
    items: [
      {
        q: "How does Orinlabí distribution work?",
        a: "You submit your release through our application form. Our team reviews it within 24–48 hours. If approved, we distribute your music to 150+ streaming platforms worldwide — including Spotify, Apple Music, Boomplay, Audiomack, Deezer, TIDAL, and more.",
      },
      {
        q: "How does the selection process work?",
        a: "Orinlabí is invitation-based — every application is reviewed by our team personally. We select based on sound quality, artistic vision, and cultural authenticity. If selected, your music goes to 150+ platforms worldwide.",
      },
      {
        q: "How long does it take for my music to go live?",
        a: "Once approved, your release typically goes live on all platforms within 24–48 hours of delivery. Some platforms like Spotify and Apple Music may take up to 5 business days to index the release in search.",
      },
      {
        q: "Which platforms will my music be on?",
        a: "Your music will be distributed to 150+ platforms including Spotify, Apple Music, Amazon Music, YouTube Music, Deezer, TIDAL, Boomplay, Audiomack, SoundCloud, Facebook Music, and many more across Africa, Europe, North America, and globally.",
      },
      {
        q: "Can I set a future release date?",
        a: "Yes. You can specify a release date on your submission. We recommend setting a date at least 7 days ahead to give platforms enough time to process and promote your release.",
      },
    ],
  },
  {
    category: "Rights & Royalties",
    items: [
      {
        q: "Do I keep ownership of my music?",
        a: "Absolutely. Orinlabí never takes ownership of your masters, publishing rights, or any intellectual property. You retain 100% of your copyright.",
      },
      {
        q: "Who collects my streaming royalties?",
        a: "Royalties from streaming platforms are collected and paid directly to you. Orinlabí facilitates distribution — we do not take a percentage of your royalty income.",
      },
      {
        q: "Do I need an ISRC code?",
        a: "No. If you already have an ISRC for your track, include it in your submission. If you don't have one, leave that field blank and we'll assign one during the distribution process.",
      },
    ],
  },
  {
    category: "The Application",
    items: [
      {
        q: "What genres do you accept?",
        a: "We focus on African music in all its forms — Afrobeats, Afropop, Amapiano, Highlife, Afro Soul, Afro R&B, Afro Hip-Hop, Jùjú, Fuji, Gospel, and more. If your sound has African roots or identity, we want to hear it.",
      },
      {
        q: "What do I need to submit a release?",
        a: "You'll need: a high-quality audio file (WAV or MP3, 320kbps minimum), cover artwork (3000×3000px JPEG or PNG), and basic release information including title, genre, release date, and copyright details.",
      },
      {
        q: "Can I submit an EP or album?",
        a: "Yes. You can submit singles, EPs, and albums. For multi-track releases, contact us at info@orinlabi.com after submitting your application so we can coordinate the full package.",
      },
      {
        q: "What if my application is not selected?",
        a: "We review every submission carefully. If your release isn't selected, you're welcome to reapply. We may provide notes on what to improve. Keep creating — the door is always open.",
      },
      {
        q: "Can I submit more than one release?",
        a: "Yes. Once approved as an Orinlabí artist, you can submit future releases through your Artist Portal.",
      },
    ],
  },
  {
    category: "Artist Portal",
    items: [
      {
        q: "What is the Artist Portal?",
        a: "The Artist Portal is your personal dashboard where you can track the status of your submissions, view your streaming links once your music is live, manage your distribution profile, and request creative assets like cover art and press photos.",
      },
      {
        q: "How do I log in to the portal?",
        a: "The portal uses a secure magic link — no password needed. Visit orinlabi.com/portal/login, enter your registered email address, and click the link sent to your inbox. You'll be logged in instantly.",
      },
      {
        q: "What are Creative Assets?",
        a: "Creative Assets is our in-house design service. If you need cover art, press photos, social media graphics, an artist bio, or an Electronic Press Kit, our team will create them for you. Access this through the My Assets section in your portal.",
      },
    ],
  },
  {
    category: "Contact & Support",
    items: [
      {
        q: "How do I contact Orinlabí?",
        a: "You can reach us at info@orinlabi.com, via WhatsApp at +234 811 469 1172, or through the contact form at orinlabi.com/contact. We respond to all enquiries within 1 business day.",
      },
      {
        q: "I want to take down a release. What do I do?",
        a: "Log in to your Artist Portal, open the release, and use the 'Request Takedown' option. Our team will process the removal within 3–5 business days and notify you when it's complete.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className={`font-medium text-sm leading-relaxed transition-colors ${open ? "text-white" : "text-white/70 group-hover:text-white"}`}>
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 mt-0.5 text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="text-white/50 text-sm leading-relaxed pb-5">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">Help</p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5">
            FAQ
          </h1>
          <p className="text-white/50 text-lg leading-relaxed">
            Everything you need to know about distributing your music with Orinlabí.
          </p>
        </div>
      </section>

      {/* Questions */}
      <section className="max-w-2xl mx-auto px-4 pb-24 space-y-12">
        {FAQS.map((section) => (
          <div key={section.category}>
            <h2 className="text-white font-bold text-xs uppercase tracking-widest mb-1 text-[#007bff]">
              {section.category}
            </h2>
            <div className="mt-4">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* CTA */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 text-center">
          <h3 className="text-white font-bold text-xl mb-3">Still have questions?</h3>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            Our team responds within 1 business day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact"
              className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-7 py-3 rounded-full transition-colors text-sm"
            >
              Contact Us
            </Link>
            <Link
              href="/submit"
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              Apply for Distribution →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
