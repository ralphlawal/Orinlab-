"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { AnimateIn } from "@/components/AnimateIn";

const FAQS = [
  {
    category: "Distribution",
    items: [
      {
        q: "How does OrinlabÍ Records distribution work?",
        a: "Subscribe to a plan, upload your release, and we deliver it to 150+ streaming platforms worldwide — including Spotify, Apple Music, Boomplay, Audiomack, Deezer, TIDAL, and more. Most releases go live within 24–48 hours.",
      },
      {
        q: "What happens after I submit my release?",
        a: "After you submit, we verify your release meets platform standards — artwork specs, audio quality, and metadata. Once cleared, it's delivered to all 150+ platforms. You'll be notified by email and in your portal when it's live.",
      },
      {
        q: "How long does it take for my music to go live?",
        a: "Once approved, your release typically goes live on all platforms within 24–48 hours of delivery. Some platforms like Spotify and Apple Music may take up to 5 business days to index the release in search.",
      },
      {
        q: "Which platforms will my music be on?",
        a: "Your music will be distributed to 150+ platforms including Spotify, Apple Music, Amazon Music, YouTube Music, Deezer, TIDAL, TikTok, Boomplay, Audiomack, SoundCloud, Facebook Music, and many more — worldwide.",
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
        a: "Absolutely. OrinlabÍ Records never takes ownership of your masters, publishing rights, or any intellectual property. You retain 100% of your copyright.",
      },
      {
        q: "Who collects my streaming royalties?",
        a: "Royalties from streaming platforms are collected and paid directly to you. Your first release earns you 100% of streaming revenue. From your second release onwards, 85% goes to you and 15% to OrinlabÍ Records. T&Cs apply.",
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
        a: "We accept all genres — Pop, Hip-Hop, R&B, Afrobeats, Electronic, Gospel, Rock, Indie, Latin, and more. If it's music, we can distribute it. Our team reviews based on sound quality and artistic vision, not genre.",
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
        q: "What if my submission is not approved?",
        a: "If your release doesn't pass our platform checks, you'll receive feedback on what to fix — artwork specs, audio quality, or metadata. You can resubmit once the issues are resolved at no extra cost.",
      },
      {
        q: "Can I submit more than one release?",
        a: "Yes. Once approved as an OrinlabÍ Records artist, you can submit future releases through your Artist Portal.",
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
        q: "How do I contact OrinlabÍ Records?",
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
          className={`flex-shrink-0 mt-0.5 text-white/30 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="text-white/50 text-sm leading-relaxed pb-5">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <AnimateIn>
            <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">Help</p>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-5">FAQ</h1>
          </AnimateIn>
          <AnimateIn delay={140}>
            <p className="text-white/50 text-lg leading-relaxed">
              Everything you need to know about distributing your music with OrinlabÍ Records.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* Questions */}
      <section className="max-w-2xl mx-auto px-4 pb-24 space-y-12">
        {FAQS.map((section, si) => (
          <AnimateIn key={section.category} delay={si * 60}>
          <div>
            <h2 className="text-white font-bold text-xs uppercase tracking-widest mb-1 text-[#007bff]">
              {section.category}
            </h2>
            <div className="mt-4">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
          </AnimateIn>
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
