import Link from "next/link";
import {
  Globe, Music2, BarChart3, Shield, HeadphonesIcon,
  Sparkles, CheckCircle2, ArrowRight,
} from "lucide-react";
import { AnimateIn } from "@/components/AnimateIn";
import { FAQAccordion } from "@/components/FAQAccordion";

export const metadata = {
  title: "How It Works – OrinlabÍ Records",
  description:
    "Simple process. Global reach. Full ownership. Apply, get reviewed by our team, and release your music to 150+ platforms worldwide.",
};

const steps = [
  {
    number: "01",
    title: "Submit Your Music",
    description:
      "Fill in your artist profile and upload your release. Tell us about your music and your goals — the process takes under 10 minutes.",
  },
  {
    number: "02",
    title: "Instant Review",
    description:
      "Our team reviews every submission promptly. Once approved, you receive a confirmation email from info@orinlabi.com.",
  },
  {
    number: "03",
    title: "Sign Your Contract",
    description:
      "You'll get a digital distribution agreement to review and sign. It takes seconds and locks in your royalty terms.",
  },
  {
    number: "04",
    title: "Go Live Worldwide",
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
  { icon: Sparkles,        label: "Promotional opportunities",       detail: "Approved artists get featured on our social channels and editorial picks" },
];

const faqs = [
  {
    q: "Can any artist submit?",
    a: "Yes — any independent artist can submit their music. Our team reviews every submission and approves it promptly. There are no follower count requirements.",
  },
  {
    q: "How quickly will I be approved?",
    a: "We review submissions promptly. Once approved you receive a confirmation email from info@orinlabi.com and you can sign your contract and go live.",
  },
  {
    q: "Do I keep ownership of my music?",
    a: "Absolutely. OrinlabÍ Records does not claim any ownership of your masters or publishing. You retain 100% of your intellectual property.",
  },
  {
    q: "How do royalties work?",
    a: "Earnings are collected from platforms and paid out to you on a monthly basis. We provide transparent reporting so you always know what you're earning.",
  },
  {
    q: "What platforms will my music be on?",
    a: "Spotify, Apple Music, TikTok, YouTube Music, Amazon Music, Deezer, TIDAL, Boomplay, Audiomack, and 150+ more stores worldwide.",
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
              Submit your music, get approved, and release to 150+ platforms worldwide — for free. We handle everything from delivery to royalty collection. You keep your rights.
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
          <AnimateIn delay={300}>
            <p className="text-white/20 text-[11px] mt-6">
              OrinlabÍ Records is a{" "}
              <a href="https://ralphlawalgroup.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors underline">
                Ralph Lawal Group
              </a>{" "}
              Company · Terms &amp; conditions apply to all distribution plans.{" "}
              <Link href="/terms" className="underline hover:text-white/40 transition-colors">View terms →</Link>
            </p>
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
                <span className="text-[#007bff] text-[11px] font-bold uppercase tracking-[0.25em]">For Every Approved Artist</span>
              </div>
            </AnimateIn>
            <AnimateIn delay={80}>
              <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-[1.05] tracking-tight mb-5">
                Everything. Included.
              </h2>
            </AnimateIn>
            <AnimateIn delay={140}>
              <p className="text-white/40 max-w-lg mx-auto leading-relaxed">
                Every approved artist gets the full OrinlabÍ Records experience — the same tools major labels use, with no price tag attached.
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

      {/* Why OrinlabÍ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimateIn>
            <div className="bg-gradient-to-br from-[#007bff]/8 via-transparent to-transparent border border-[#007bff]/15 hover:border-[#007bff]/25 transition-all duration-300 rounded-3xl p-10 sm:p-14 text-center">
              <Sparkles size={32} className="text-[#007bff] mx-auto mb-6" />
              <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-white leading-[1.1] tracking-tight mb-6">
                Free to submit. Free to distribute.
              </h2>
              <p className="text-white/55 leading-relaxed text-base sm:text-lg mb-5">
                Any independent artist can submit their music to OrinlabÍ Records — no gatekeeping, no upfront fees. Submit once, get approved, and your music goes live on every major platform worldwide.
              </p>
              <p className="text-white/55 leading-relaxed text-base sm:text-lg">
                We invest our platform, our team, and our relationships into every artist we work with. That means we go all the way — from delivery and royalty collection to promotion and support.
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

          <FAQAccordion items={faqs} />
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
