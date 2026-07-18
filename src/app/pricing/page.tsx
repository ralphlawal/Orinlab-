"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Zap, ArrowRight, Music2, Users, Star } from "lucide-react";
import { PLANS, ADDONS } from "@/lib/stripePlans";

const LABEL_PLANS = PLANS.filter(p => p.key.startsWith("label_"));
const MAIN_PLANS  = PLANS.filter(p => !p.key.startsWith("label_"));

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function subscribe(priceKey: string) {
    setLoading(priceKey);
    router.push(`/portal/login?redirect=/pricing&plan=${priceKey}`);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative pt-36 pb-16 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] text-white/60 text-[11px] font-semibold px-4 py-2 rounded-full mb-10">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            Simple, transparent pricing
          </div>
          <h1 className="text-[clamp(3rem,8vw,5.5rem)] font-bold text-white leading-[0.95] tracking-tight mb-6">
            Release your music.<br /><span className="text-violet-400">Keep everything.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-xl mx-auto">
            One annual fee. Unlimited releases. 150+ platforms. You keep 100% of your royalties.
          </p>
        </div>
      </section>

      {/* Main plans */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-5">
            {MAIN_PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-3xl border p-8 flex flex-col ${
                  plan.highlight
                    ? "bg-violet-500/10 border-violet-400/40"
                    : "bg-white/[0.03] border-white/[0.08]"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                      <Star size={11} /> Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">{plan.name}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-white text-5xl font-bold">${plan.amountUsd}</span>
                    <span className="text-white/40 text-sm mb-2">/year</span>
                  </div>
                  <p className="text-white/40 text-sm">
                    {plan.artistsLimit === 1 ? "1 artist" : `Up to ${plan.artistsLimit} artists`} · Keep 100% royalties
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                      <CheckCircle2 size={15} className={`flex-shrink-0 mt-0.5 ${plan.highlight ? "text-violet-400" : "text-[#007bff]"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => subscribe(plan.key)}
                  disabled={loading === plan.key}
                  className={`w-full font-semibold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? "bg-violet-500 hover:bg-violet-400 text-white"
                      : "bg-[#007bff] hover:bg-[#0069d9] text-white"
                  } disabled:opacity-50`}
                >
                  Get {plan.name} <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Label plans */}
      <section className="py-16 px-6 bg-white/[0.01] border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Users size={16} className="text-[#007bff]" />
              <span className="text-[#007bff] text-xs font-bold uppercase tracking-widest">For Labels & Managers</span>
            </div>
            <h2 className="text-white font-bold text-3xl mb-2">Label Plans</h2>
            <p className="text-white/40 text-sm">Manage multiple artists from one account. Everyone keeps 100% of their royalties.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {LABEL_PLANS.map((plan) => (
              <div key={plan.key} className="bg-white/[0.03] border border-white/[0.08] hover:border-[#007bff]/30 rounded-2xl p-5 flex flex-col transition-colors">
                <p className="text-white font-bold text-lg mb-1">{plan.name}</p>
                <p className="text-white/40 text-xs mb-4">Up to {plan.artistsLimit} artists</p>
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-white font-bold text-2xl">${plan.amountUsd}</span>
                  <span className="text-white/30 text-xs mb-1">/yr</span>
                </div>
                <button
                  onClick={() => subscribe(plan.key)}
                  disabled={loading === plan.key}
                  className="mt-auto w-full text-xs font-semibold bg-white/[0.07] hover:bg-[#007bff]/20 border border-white/10 hover:border-[#007bff]/40 text-white/70 hover:text-white py-2.5 rounded-xl transition-all disabled:opacity-50"
                >
                  Get {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap size={15} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Power-Ups</span>
            </div>
            <h2 className="text-white font-bold text-3xl mb-2">Add-ons</h2>
            <p className="text-white/40 text-sm">Available on any plan. Pay once per release.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {ADDONS.map((addon) => (
              <div key={addon.key} className="bg-white/[0.03] border border-white/[0.08] hover:border-amber-400/20 rounded-2xl p-6 flex items-center justify-between gap-4 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                    <Music2 size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{addon.name}</p>
                    <p className="text-white/40 text-xs">{addon.description}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold">${addon.amountUsd}</p>
                  <p className="text-white/30 text-xs">one-time</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-6">Add-ons are purchased from your portal after submitting a release.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 border-t border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-white font-bold text-2xl mb-8 text-center">Common Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Do I keep 100% of my royalties?", a: "Yes — on any paid plan, every penny from Spotify, Apple Music, TikTok and all other platforms goes directly to you. OrinlabÍ Records makes money from the annual subscription fee, not your streams." },
              { q: "How many releases can I submit?", a: "Unlimited. Once you have an active plan, you can submit as many singles, EPs, albums, and compilations as you like." },
              { q: "What happens if my subscription expires?", a: "Your music stays live on all platforms. You just won't be able to submit new releases until you renew." },
              { q: "Can I upgrade my plan later?", a: "Yes — upgrade or downgrade anytime from the billing section of your portal. Changes take effect immediately." },
              { q: "Do I own my music?", a: "Absolutely. OrinlabÍ Records never claims ownership of your masters, publishing, or any intellectual property. We are purely a distribution service." },
              { q: "What is Priority Distribution?", a: "An add-on that gets your release delivered to all platforms within 3 days instead of the standard 2 weeks. Available for $14.99 per release on any plan." },
            ].map(({ q, a }) => (
              <details key={q} className="group bg-white/[0.03] border border-white/[0.07] rounded-2xl">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-white font-medium text-sm list-none">
                  {q}
                  <span className="text-white/30 group-open:rotate-180 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="px-6 pb-5 text-white/50 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-white font-bold text-4xl mb-4">Ready to distribute?</h2>
        <p className="text-white/40 mb-8">Choose a plan and start releasing today.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => subscribe("artist")}
            className="inline-flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold px-8 py-4 rounded-full transition-all hover:shadow-[0_0_30px_rgba(0,123,255,0.4)]"
          >
            Start with Artist — $19.99/yr <ArrowRight size={15} />
          </button>
          <Link href="/contact" className="inline-flex items-center justify-center gap-2 border border-white/[0.12] hover:border-white/30 text-white/60 hover:text-white font-semibold px-8 py-4 rounded-full transition-all">
            Talk to us
          </Link>
        </div>
        <p className="text-white/20 text-xs mt-6">
          Annual billing · Cancel anytime ·{" "}
          <Link href="/terms" className="underline hover:text-white/40">Terms apply</Link>
        </p>
      </section>
    </>
  );
}
