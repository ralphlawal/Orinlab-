import Link from "next/link";
import {
  Globe, Music2, BarChart3, Shield, HeadphonesIcon,
  Sparkles, CheckCircle2, ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "How It Works – Orinlabí",
  description:
    "Orinlabí is an invitation-based distribution platform. Selected artists receive free global distribution to 150+ streaming services.",
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
      "Our team listens to every submission carefully. We look for quality, originality, and cultural authenticity. You'll hear back within 3–5 business days.",
  },
  {
    number: "03",
    title: "Selection & Onboarding",
    description:
      "If selected, you receive a confirmation email from info@orinlabi.com. We walk you through everything you need to go live.",
  },
  {
    number: "04",
    title: "Global Distribution — Free",
    description:
      "Your music goes live on Spotify, Apple Music, Boomplay, AudioMack, YouTube Music, and 150+ more stores worldwide. At no cost to you.",
  },
];

const included = [
  { icon: Globe, label: "Distribution to 150+ platforms", detail: "Spotify, Apple Music, Boomplay, Audiomack, YouTube Music, Deezer, TIDAL, and more" },
  { icon: BarChart3, label: "Royalty & earnings tracking", detail: "Real-time performance reports and monthly royalty statements" },
  { icon: Music2, label: "ISRC & UPC codes", detail: "Generated automatically if you don't already have them" },
  { icon: HeadphonesIcon, label: "Dedicated artist support", detail: "A real team you can reach — not just a ticket system" },
  { icon: Shield, label: "Rights management", detail: "We protect your metadata and ownership at every store" },
  { icon: Sparkles, label: "Promotional opportunities", detail: "Selected artists get featured on our social channels and editorial picks" },
];

const faqs = [
  {
    q: "Is distribution really free?",
    a: "Yes — 100% free for artists we select. We built Orinlabí to remove financial barriers from African music distribution. There are no hidden fees, no annual subscriptions, no per-release charges.",
  },
  {
    q: "How are artists selected?",
    a: "We review every application manually. We look at music quality, artist consistency, and alignment with our mission of amplifying authentic African sound globally. There is no fixed quota — we choose based on merit.",
  },
  {
    q: "How long does selection take?",
    a: "We aim to respond within 3–5 business days of receiving your application. If you haven't heard back after 7 days, feel free to reach out via our contact page.",
  },
  {
    q: "What happens if I'm not selected?",
    a: "We encourage you to keep creating and reapply in the future. We may not select every artist in the first round, but our roster grows continuously as we scale.",
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
      <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
            Invitation-Based · Always Free
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            No Plans.<br />No Fees.<br />Just Music.
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Orinlabí is an invitation-based distribution platform. We hand-pick
            artists we believe in — and for those we select, distribution is
            completely <strong className="text-white">free</strong>.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/submit"
              className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-4 rounded-full transition-colors"
            >
              Apply for Distribution
            </Link>
            <Link
              href="/contact"
              className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-semibold px-8 py-4 rounded-full transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
              The Process
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              How It Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white/[0.03] border border-white/[0.06] hover:border-[#007bff]/20 rounded-2xl p-8 transition-all duration-300 group"
              >
                <div className="text-[#007bff]/40 font-bold text-5xl leading-none mb-6 group-hover:text-[#007bff]/60 transition-colors">
                  {step.number}
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
              For Selected Artists
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Everything. Included.
            </h2>
            <p className="text-white/50 max-w-lg mx-auto leading-relaxed">
              Every selected artist gets the full Orinlabí experience — the same
              tools major labels use, with no price tag attached.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {included.map((item) => (
              <div
                key={item.label}
                className="flex gap-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-[#007bff]/20 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-[#007bff]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-[#007bff]" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1 text-sm">{item.label}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model explanation */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#007bff]/8 via-transparent to-transparent border border-[#007bff]/15 rounded-3xl p-10 sm:p-14 text-center">
            <Sparkles size={32} className="text-[#007bff] mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Why Invitation-Based?
            </h2>
            <p className="text-white/60 leading-relaxed text-lg mb-6">
              We believe distribution should be earned, not purchased. The internet
              is saturated with music. Rather than being a pipeline that accepts
              everything for a fee, Orinlabí acts as a curator — surfacing voices
              that deserve to be heard.
            </p>
            <p className="text-white/60 leading-relaxed text-lg">
              We invest our platform, our team, and our relationships directly into
              the artists we select. That means we can only work with artists we
              genuinely believe in — and for those we do select, we go all the way.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 bg-white/[0.02] border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
              FAQ
            </p>
            <h2 className="text-4xl font-bold text-white">Common Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-[#007bff] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold mb-2">{faq.q}</p>
                    <p className="text-white/50 leading-relaxed text-sm">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Apply?
          </h2>
          <p className="text-white/50 text-lg mb-10 leading-relaxed">
            If you believe your music deserves to be heard worldwide, we&apos;d
            love to hear from you. Applications are open year-round.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-3 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-10 py-4 rounded-full transition-colors text-lg"
          >
            Apply Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
