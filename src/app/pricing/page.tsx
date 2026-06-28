import Link from "next/link";
import {
  Globe, Music2, BarChart3, Shield, HeadphonesIcon,
  Sparkles, CheckCircle2, ArrowRight,
} from "lucide-react";
import { AnimateIn } from "@/components/AnimateIn";

export const metadata = {
  title: "How It Works – Orinlabí",
  description:
    "Simple process. Global reach. Full ownership. Apply, get reviewed by our team, and release your music to 150+ platforms worldwide.",
};

const steps = [
  {
    number: "01",
    title: "Submit Your Application",
    description:
      "Fill in your artist profile and upload your release. Tell us about your music, your goals, and link us to your existing work.",
  },
  {
    number: "02",
    title: "We Review Your Music",
    description:
      "Our team listens to every submission carefully. We look for quality, originality, and artistic vision. You'll hear back within 3–5 business days.",
  },
  {
    number: "03",
    title: "Selection & Onboarding",
    description:
      "If selected, you receive a confirmation email from info@orinlabi.com. We walk you through everything you need to go live.",
  },
  {
    number: "04",
    title: "Global Distribution",
    description:
      "Your music goes live on Spotify, Apple Music, TikTok, YouTube Music, Boomplay, Audiomack, and 150+ more stores worldwide.",
  },
];

const included = [
  { icon: Globe,           label: "Distribution to 150+ platforms", detail: "Spotify, Apple Music, TikTok, Amazon Music, YouTube Music, Deezer, TIDAL, and more" },
  { icon: BarChart3,       label: "Royalty & earnings tracking",     detail: "Real-time performance reports and monthly royalty statements" },
  { icon: Music2,          label: "ISRC & UPC codes",                detail: "Generated automatically if you don't already have them" },
  { icon: HeadphonesIcon,  label: "Dedicated artist support",        detail: "A real team you can reach — not just a ticket system" },
  { icon: Shield,          label: "Rights management",               detail: "We protect your metadata and ownership at every store" },
  { icon: Sparkles,        label: "Promotional opportunities",       detail: "Selected artists get featured on our social channels and editorial picks" },
];

const faqs = [
  {
    q: "How are artists selected?",
    a: "Every application is reviewed by our team personally — no algorithms. We select based on three things: sound quality, artistic vision, and originality. There are no follower count requirements.",
  },
  {
    q: "What happens if I'm not selected?",
    a: "We provide feedback where we can, and encourage you to keep creating and reapply. Many of our artists reapplied after an initial pass. A rejection is not a door closed permanently.",
  },
  {
    q: "How long does selection take?",
    a: "We aim to respond within 3–5 business days of receiving your application. If you haven't heard back after 7 days, feel free to reach out via our contact page.",
  },
  {
    q: "Do I keep ownership of my music?",
    a: "Absolutely. Orinlabí does not claim any ownership of your masters or publishing. You retain 100% of your intellectual property.",
  },
  {
    q: "How do royalties work?",
    a: "Earnings are collected from platforms and paid out to you on a monthly basis. We provide transparent reporting so you always know what you're earning.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-36 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#007bff]/7 rounded-full blur-[140px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <AnimateIn>
            <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] text-white/60 text-[11px] font-semibold px-4 py-2 rounded-full mb-10">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
              How It Works
            </div>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h1 className="text-[clamp(3rem,8vw,6rem)] font-bold text-white leading-[0.95] tracking-tight mb-6">
              Simple process.<br /><span className="text-[#007bff]">Global reach.</span><br />Full ownership.
            </h1>
          </AnimateIn>
          <AnimateIn delay={160}>
            <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              Apply, get reviewed by our team, and release your music to 150+ platforms worldwide. We handle everything from delivery to royalty collection — you keep 100% of your rights.
            </p>
          </AnimateIn>
          <AnimateIn delay={220}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold px-8 py-4 rounded-full transition-all hover:shadow-[0_0_30px_rgba(0,123,255,0.4)] group"
              >
                Apply for Distribution <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-white/[0.12] hover:border-white/30 text-white/60 hover:text-white font-semibold px-8 py-4 rounded-full transition-all"
              >
                Contact Us
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <AnimateIn>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
                <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">The Process</span>
              </div>
            </AnimateIn>
            <AnimateIn delay={80}>
              <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1.05] tracking-tight">
                How It Works
              </h2>
            </AnimateIn>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {steps.map((step, i) => (
              <AnimateIn key={step.number} delay={i * 70}>
                <div className="bg-white/[0.03] border border-white/[0.06] hover:border-[#007bff]/25 rounded-2xl p-8 transition-all duration-300 group hover:-translate-y-1 h-full">
                  <div className="text-[#007bff]/35 font-bold text-5xl leading-none mb-6 group-hover:text-[#007bff]/60 transition-colors">
                    {step.number}
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-white/45 leading-relaxed text-sm">{step.description}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-24 px-6 border-y border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <AnimateIn>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
                <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">For Selected Artists</span>
              </div>
            </AnimateIn>
            <AnimateIn delay={80}>
              <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1.05] tracking-tight mb-5">
                Everything. Included.
              </h2>
            </AnimateIn>
            <AnimateIn delay={140}>
              <p className="text-white/40 max-w-lg mx-auto leading-relaxed">
                Every selected artist gets the full Orinlabí experience — the same tools major labels use, with no price tag attached.
              </p>
            </AnimateIn>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {included.map((item, i) => (
              <AnimateIn key={item.label} delay={i * 60}>
                <div className="flex gap-4 bg-white/[0.03] border border-white/[0.06] hover:border-[#007bff]/20 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 h-full">
                  <div className="w-10 h-10 bg-[#007bff]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-[#007bff]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-1 text-sm">{item.label}</p>
                    <p className="text-white/35 text-xs leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why invite-only */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimateIn>
            <div className="bg-gradient-to-br from-[#007bff]/8 via-transparent to-transparent border border-[#007bff]/15 hover:border-[#007bff]/25 transition-all duration-300 rounded-3xl p-10 sm:p-14 text-center">
              <Sparkles size={32} className="text-[#007bff] mx-auto mb-6" />
              <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-white leading-[1.1] tracking-tight mb-6">
                Why Invitation-Based?
              </h2>
              <p className="text-white/55 leading-relaxed text-base sm:text-lg mb-5">
                We believe distribution should be earned, not purchased. The internet is saturated with music. Rather than being a pipeline that accepts everything for a fee, Orinlabí acts as a curator — surfacing voices that deserve to be heard.
              </p>
              <p className="text-white/55 leading-relaxed text-base sm:text-lg">
                We invest our platform, our team, and our relationships directly into the artists we select. That means we can only work with artists we genuinely believe in — and for those we do select, we go all the way.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <AnimateIn>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
                <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">FAQ</span>
              </div>
            </AnimateIn>
            <AnimateIn delay={80}>
              <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1.05] tracking-tight">
                Common Questions
              </h2>
            </AnimateIn>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AnimateIn key={faq.q} delay={i * 50}>
                <details className="group bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] rounded-xl overflow-hidden transition-colors duration-200">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:text-[#007bff] text-white font-medium text-sm transition-colors">
                    {faq.q}
                    <span className="text-white/30 group-open:text-[#007bff] text-xl ml-4 flex-shrink-0 transition-colors">
                      <span className="group-open:hidden">+</span>
                      <span className="hidden group-open:inline">–</span>
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-white/45 text-sm leading-relaxed">{faq.a}</p>
                </details>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <AnimateIn>
            <div className="flex items-center justify-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse" />
              <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">Ready to release?</span>
            </div>
          </AnimateIn>
          <AnimateIn delay={80}>
            <h2 className="text-[clamp(3rem,7vw,5rem)] font-bold text-white leading-[0.95] tracking-tight mb-5">
              Ready to Apply?
            </h2>
          </AnimateIn>
          <AnimateIn delay={140}>
            <p className="text-white/40 text-lg mb-10 leading-relaxed">
              If you believe your music deserves to be heard worldwide, we&apos;d love to hear from you. Applications are open year-round.
            </p>
          </AnimateIn>
          <AnimateIn delay={200}>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold px-10 py-4 rounded-full transition-all hover:shadow-[0_0_40px_rgba(0,123,255,0.4)] hover:gap-3 group"
            >
              Try For Free <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
