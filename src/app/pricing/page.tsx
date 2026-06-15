import Link from "next/link";
import { CheckCircle2, X, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Pricing – Orinlabí",
  description:
    "Simple, transparent pricing for African artists. Starter, Pro, and Label plans.",
};

const plans = [
  {
    name: "Starter",
    price: "₦5,000",
    period: "/ month",
    usd: "~$3/mo",
    tagline: "Perfect for new artists",
    highlight: false,
    features: [
      { label: "5 releases per year", included: true },
      { label: "150+ streaming platforms", included: true },
      { label: "100% royalty payout", included: true },
      { label: "ISRC & UPC generation", included: true },
      { label: "Basic analytics", included: true },
      { label: "Email support", included: true },
      { label: "Artist marketing services", included: false },
      { label: "Playlist pitching", included: false },
      { label: "Release strategy session", included: false },
      { label: "Cover art design", included: false },
      { label: "Priority support", included: false },
      { label: "Label sub-accounts", included: false },
    ],
  },
  {
    name: "Pro",
    price: "₦15,000",
    period: "/ month",
    usd: "~$9/mo",
    tagline: "For serious independent artists",
    highlight: true,
    features: [
      { label: "Unlimited releases", included: true },
      { label: "150+ streaming platforms", included: true },
      { label: "100% royalty payout", included: true },
      { label: "ISRC & UPC generation", included: true },
      { label: "Advanced analytics", included: true },
      { label: "Priority email & chat support", included: true },
      { label: "Artist marketing services", included: true },
      { label: "Playlist pitching", included: true },
      { label: "1 release strategy session / quarter", included: true },
      { label: "1 cover art design / quarter", included: true },
      { label: "Priority support", included: true },
      { label: "Label sub-accounts", included: false },
    ],
  },
  {
    name: "Label",
    price: "₦45,000",
    period: "/ month",
    usd: "~$27/mo",
    tagline: "For labels and collectives",
    highlight: false,
    features: [
      { label: "Unlimited releases", included: true },
      { label: "150+ streaming platforms", included: true },
      { label: "100% royalty payout", included: true },
      { label: "ISRC & UPC generation", included: true },
      { label: "Advanced analytics & reporting", included: true },
      { label: "Dedicated account manager", included: true },
      { label: "Full marketing campaign support", included: true },
      { label: "Unlimited playlist pitching", included: true },
      { label: "Monthly strategy sessions", included: true },
      { label: "Unlimited cover art design", included: true },
      { label: "24/7 priority support", included: true },
      { label: "Up to 10 artist sub-accounts", included: true },
    ],
  },
];

const comparison = [
  { feature: "Releases", starter: "5 / year", pro: "Unlimited", label: "Unlimited" },
  { feature: "Platforms", starter: "150+", pro: "150+", label: "150+" },
  { feature: "Royalties", starter: "100%", pro: "100%", label: "100%" },
  { feature: "ISRC / UPC", starter: "Yes", pro: "Yes", label: "Yes" },
  { feature: "Analytics", starter: "Basic", pro: "Advanced", label: "Advanced" },
  { feature: "Support", starter: "Email", pro: "Priority", label: "24/7 Dedicated" },
  { feature: "Marketing", starter: "—", pro: "Yes", label: "Full Campaign" },
  { feature: "Playlist Pitching", starter: "—", pro: "Yes", label: "Unlimited" },
  { feature: "Strategy Session", starter: "—", pro: "Quarterly", label: "Monthly" },
  { feature: "Cover Art Design", starter: "—", pro: "Quarterly", label: "Unlimited" },
  { feature: "Sub-Accounts", starter: "—", pro: "—", label: "Up to 10" },
];

function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 text-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
          Pricing
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
          Simple, Transparent Pricing.
        </h1>
        <p className="text-white/60 text-lg">
          No hidden fees. No surprises. Choose the plan that fits your career
          and start distributing today.
        </p>
      </div>
    </section>
  );
}

function PlanCards() {
  return (
    <section className="py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-3xl p-8 flex flex-col ${
              p.highlight
                ? "bg-[#007bff] text-white border-0"
                : "bg-white/[0.03] border border-white/[0.06] text-white"
            }`}
          >
            {p.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[#007bff] text-xs font-bold px-4 py-1.5 rounded-full">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <p
                className={`text-sm font-semibold uppercase tracking-widest mb-2 ${
                  p.highlight ? "text-white/70" : "text-[#007bff]"
                }`}
              >
                {p.name}
              </p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold">{p.price}</span>
                <span
                  className={`text-sm mb-1 ${p.highlight ? "text-white/70" : "text-white/40"}`}
                >
                  {p.period}
                </span>
              </div>
              <p
                className={`text-xs ${p.highlight ? "text-white/60" : "text-white/30"}`}
              >
                {p.usd}
              </p>
              <p
                className={`mt-3 text-sm ${p.highlight ? "text-white/80" : "text-white/50"}`}
              >
                {p.tagline}
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {p.features.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  {f.included ? (
                    <CheckCircle2
                      size={16}
                      className={p.highlight ? "text-white" : "text-[#007bff]"}
                    />
                  ) : (
                    <X
                      size={16}
                      className={p.highlight ? "text-white/30" : "text-white/20"}
                    />
                  )}
                  <span
                    className={`text-sm ${
                      f.included
                        ? p.highlight
                          ? "text-white"
                          : "text-white/70"
                        : p.highlight
                        ? "text-white/30"
                        : "text-white/25"
                    }`}
                  >
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/submit"
              className={`block text-center font-semibold py-3.5 rounded-full text-sm transition-all duration-200 ${
                p.highlight
                  ? "bg-white text-[#007bff] hover:bg-white/90"
                  : "bg-[#007bff] hover:bg-[#0069d9] text-white"
              }`}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComparisonTable() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Compare Plans
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 pr-6 text-white/40 text-sm font-medium w-1/3">
                  Feature
                </th>
                {["Starter", "Pro", "Label"].map((name) => (
                  <th
                    key={name}
                    className={`text-center py-4 px-4 text-sm font-semibold ${
                      name === "Pro" ? "text-[#007bff]" : "text-white"
                    }`}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-white/[0.05] ${
                    i % 2 === 0 ? "bg-white/[0.01]" : ""
                  }`}
                >
                  <td className="py-4 pr-6 text-white/60 text-sm">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-white/50">
                    {row.starter}
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-[#007bff] font-medium">
                    {row.pro}
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-white/50">
                    {row.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Can I upgrade or downgrade my plan?", a: "Yes. You can change your plan at any time. Changes take effect at the start of your next billing cycle." },
    { q: "Is there an annual discount?", a: "Yes. Paying annually gives you 2 months free. Contact us for annual billing options." },
    { q: "What payment methods do you accept?", a: "We accept bank transfers, card payments, and mobile money (where available)." },
    { q: "Are there any commission fees on royalties?", a: "No. All plans include 100% royalty payout. We earn through plan subscriptions, not your royalties." },
  ];

  return (
    <section className="py-16 px-4 bg-white/[0.02]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-10">
          Pricing FAQ
        </h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="bg-white/[0.03] border border-white/[0.06] rounded-xl"
            >
              <summary className="p-5 cursor-pointer text-white font-medium text-sm list-none hover:text-[#007bff] transition-colors">
                {f.q}
              </summary>
              <p className="px-5 pb-5 text-white/50 text-sm leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Start Today.
        </h2>
        <p className="text-white/50 text-lg mb-10">
          Pick a plan and get your music to the world in 24–48 hours.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/submit"
            className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200"
          >
            Submit a Release
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 text-white/60 hover:text-white font-medium transition-colors"
          >
            Have questions? Contact us <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function PricingPage() {
  return (
    <>
      <Hero />
      <PlanCards />
      <ComparisonTable />
      <FAQ />
      <CTA />
    </>
  );
}
