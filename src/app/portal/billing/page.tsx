"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PLANS, ADDONS, getPlan } from "@/lib/stripePlans";
import { CheckCircle2, Zap, ExternalLink, Loader2, ArrowRight, Crown } from "lucide-react";

interface Profile {
  email: string;
  artist_name: string;
  plan: string | null;
  plan_status: string | null;
  plan_expires_at: string | null;
}

export default function BillingPage() {
  const params   = useSearchParams();
  const router   = useRouter();
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [openPortal, setOpenPortal] = useState(false);

  const justSubscribed = params.get("subscribed") === "1";
  const newPlan        = params.get("plan");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.replace("/portal/login"); return; }
      const email = data.session.user.email!;
      const { data: p } = await supabase
        .from("artist_profiles")
        .select("email,artist_name,plan,plan_status,plan_expires_at")
        .eq("email", email)
        .maybeSingle();
      setProfile(p ?? { email, artist_name: "", plan: null, plan_status: null, plan_expires_at: null });
      setLoading(false);
    });
  }, [router]);

  async function handleSubscribe(planKey: string) {
    if (!profile) return;
    setUpgrading(planKey);
    const res = await fetch("/api/stripe/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceKey:   planKey,
        email:      profile.email,
        artistName: profile.artist_name,
        mode:       "subscription",
      }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setUpgrading(null);
  }

  async function handleBillingPortal() {
    if (!profile) return;
    setOpenPortal(true);
    const res = await fetch("/api/stripe/billing-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: profile.email }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setOpenPortal(false);
  }

  const activePlan = profile?.plan ? getPlan(profile.plan) : null;
  const expiry     = profile?.plan_expires_at
    ? new Date(profile.plan_expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-white font-bold text-2xl mb-1">Billing & Plan</h1>
        <p className="text-white/40 text-sm">Manage your subscription and add-ons.</p>
      </div>

      {/* Success banner */}
      {justSubscribed && newPlan && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
          <div>
            <p className="text-green-400 font-semibold text-sm">Subscription activated!</p>
            <p className="text-white/50 text-xs mt-0.5">You are now on the {getPlan(newPlan)?.name ?? newPlan} plan. Start submitting unlimited releases.</p>
          </div>
        </div>
      )}

      {/* Current plan */}
      <div className={`rounded-2xl border p-6 ${activePlan ? "bg-violet-500/10 border-violet-400/30" : "bg-white/[0.03] border-white/[0.08]"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Current Plan</p>
            {activePlan ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <Crown size={16} className="text-violet-400" />
                  <p className="text-white font-bold text-xl">{activePlan.name}</p>
                </div>
                <p className="text-white/50 text-sm">₦{activePlan.amountNgn.toLocaleString("en-NG")}/year · renews {expiry}</p>
                <p className="text-white/40 text-xs mt-1">
                  {profile?.plan_status === "active" ? "✓ Active" : profile?.plan_status}
                </p>
              </>
            ) : (
              <>
                <p className="text-white font-bold text-xl">No active plan</p>
                <p className="text-white/40 text-sm mt-1">Subscribe to submit unlimited releases.</p>
              </>
            )}
          </div>
          {activePlan && (
            <button
              onClick={handleBillingPortal}
              disabled={openPortal}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {openPortal ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={12} />}
              Manage billing
            </button>
          )}
        </div>
      </div>

      {/* Upgrade options */}
      {!activePlan && (
        <div>
          <p className="text-white/50 text-sm font-medium mb-4">Choose a plan to get started:</p>
          <div className="space-y-3">
            {PLANS.map((plan) => (
              <div key={plan.key} className={`flex items-center justify-between gap-4 rounded-2xl border p-5 ${plan.highlight ? "border-violet-400/30 bg-violet-500/5" : "border-white/[0.08] bg-white/[0.02]"}`}>
                <div>
                  <p className="text-white font-semibold">{plan.name}</p>
                  <p className="text-white/40 text-xs">{plan.artistsLimit === 1 ? "1 artist" : `Up to ${plan.artistsLimit} artists`} · Keep 100% royalties</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-white font-bold">₦{plan.amountNgn.toLocaleString("en-NG")}<span className="text-white/30 text-xs font-normal">/yr</span></p>
                  <button
                    onClick={() => handleSubscribe(plan.key)}
                    disabled={upgrading === plan.key}
                    className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 ${plan.highlight ? "bg-violet-500 hover:bg-violet-400 text-white" : "bg-[#007bff] hover:bg-[#0069d9] text-white"}`}
                  >
                    {upgrading === plan.key ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                    Get {plan.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade from existing plan */}
      {activePlan && (
        <div>
          <p className="text-white/50 text-sm font-medium mb-4">Upgrade your plan:</p>
          <div className="space-y-2">
            {PLANS.filter(p => p.amountNgn > activePlan.amountNgn).map((plan) => (
              <div key={plan.key} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-3.5">
                <div>
                  <p className="text-white/70 font-medium text-sm">{plan.name}</p>
                  <p className="text-white/30 text-xs">{plan.artistsLimit === 1 ? "1 artist" : `Up to ${plan.artistsLimit} artists`}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-white/60 font-semibold text-sm">₦{plan.amountNgn.toLocaleString("en-NG")}/yr</p>
                  <button
                    onClick={() => handleSubscribe(plan.key)}
                    disabled={!!upgrading}
                    className="text-xs font-medium border border-white/10 hover:border-[#007bff]/50 text-white/50 hover:text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add-ons */}
      <div>
        <p className="text-white/50 text-sm font-medium mb-4">Available add-ons:</p>
        <div className="space-y-2">
          {ADDONS.map((addon) => (
            <div key={addon.key} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                  <Zap size={13} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-white/80 font-medium text-sm">{addon.name}</p>
                  <p className="text-white/30 text-xs">{addon.description}</p>
                </div>
              </div>
              <p className="text-white/60 font-semibold text-sm flex-shrink-0">₦{addon.amountNgn.toLocaleString("en-NG")}</p>
            </div>
          ))}
        </div>
        <p className="text-white/25 text-xs mt-3">Add-ons are purchased per release from your release page.</p>
      </div>

      <div className="pt-2">
        <Link href="/portal" className="text-white/30 hover:text-white/60 text-sm transition-colors">← Back to portal</Link>
      </div>
    </div>
  );
}
