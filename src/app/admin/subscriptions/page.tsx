"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, CreditCard, Crown, AlertCircle, XCircle, CheckCircle2, ExternalLink } from "lucide-react";

type Subscriber = {
  email: string;
  artist_name: string | null;
  plan: string | null;
  plan_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_expires_at: string | null;
};

const PLAN_LABELS: Record<string, string> = {
  artist: "Starter",
  pro: "Pro",
  label_5: "Label 5",
  label_10: "Label 10",
  label_15: "Label 15",
  label_20: "Label 20",
  label_30: "Label 30",
  label_40: "Label 40",
};

const PLAN_COLORS: Record<string, string> = {
  artist: "#007bff",
  pro: "#7c3aed",
  label_5: "#f59e0b",
  label_10: "#f59e0b",
  label_15: "#f59e0b",
  label_20: "#f59e0b",
  label_30: "#f59e0b",
  label_40: "#f59e0b",
};

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-white/25 text-xs">—</span>;
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    active:    { label: "Active",    color: "#10b981", icon: <CheckCircle2 size={11} /> },
    trialing:  { label: "Trial",     color: "#007bff", icon: <CheckCircle2 size={11} /> },
    past_due:  { label: "Past Due",  color: "#f59e0b", icon: <AlertCircle size={11} /> },
    cancelled: { label: "Cancelled", color: "#6b7280", icon: <XCircle size={11} /> },
    canceled:  { label: "Cancelled", color: "#6b7280", icon: <XCircle size={11} /> },
  };
  const cfg = map[status] ?? { label: status, color: "#6b7280", icon: null };
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${cfg.color}18`, color: cfg.color }}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "past_due" | "cancelled">("all");

  useEffect(() => {
    supabase
      .from("artist_profiles")
      .select("email, artist_name, plan, plan_status, stripe_customer_id, stripe_subscription_id, plan_expires_at")
      .not("plan", "is", null)
      .order("plan_expires_at", { ascending: false })
      .then(({ data }) => {
        setSubscribers(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = subscribers.filter((s) => {
    if (filter === "all") return true;
    if (filter === "active") return s.plan_status === "active" || s.plan_status === "trialing";
    if (filter === "past_due") return s.plan_status === "past_due";
    if (filter === "cancelled") return s.plan_status === "cancelled" || s.plan_status === "canceled";
    return true;
  });

  const activeSubs = subscribers.filter(s => s.plan_status === "active" || s.plan_status === "trialing");
  const pastDue = subscribers.filter(s => s.plan_status === "past_due");

  const planCounts = subscribers.reduce<Record<string, number>>((acc, s) => {
    if (s.plan) acc[s.plan] = (acc[s.plan] ?? 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-xl">Subscriptions</h1>
          <p className="text-white/35 text-sm mt-0.5">All paid plans — manage and monitor artist subscriptions</p>
        </div>
        <a
          href="https://dashboard.stripe.com/subscriptions"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ExternalLink size={12} />
          Stripe Dashboard
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/35 text-xs mb-1">Total Subscribers</p>
          <p className="text-white text-2xl font-bold">{subscribers.length}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/35 text-xs mb-1">Active</p>
          <p className="text-emerald-400 text-2xl font-bold">{activeSubs.length}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/35 text-xs mb-1">Past Due</p>
          <p className="text-amber-400 text-2xl font-bold">{pastDue.length}</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <p className="text-white/35 text-xs mb-1">MRR (est.)</p>
          <p className="text-[#007bff] text-2xl font-bold">
            ₦{activeSubs.reduce((sum, s) => {
              const prices: Record<string, number> = {
                artist: 29900, pro: 89900, label_5: 169900, label_10: 219900,
                label_15: 279900, label_20: 349900, label_30: 429900, label_40: 509900,
              };
              return sum + ((prices[s.plan ?? ""] ?? 0) / 12);
            }, 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Plan breakdown */}
      {Object.keys(planCounts).length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">Plan Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(planCounts).sort((a, b) => b[1] - a[1]).map(([plan, count]) => (
              <div key={plan} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: `${PLAN_COLORS[plan] ?? "#007bff"}15`, color: PLAN_COLORS[plan] ?? "#007bff" }}>
                <Crown size={12} />
                {PLAN_LABELS[plan] ?? plan} · {count}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        {(["all", "active", "past_due", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              filter === f ? "bg-[#007bff]/10 text-[#007bff]" : "text-white/35 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {f === "all" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard size={28} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/25 text-sm">No subscribers{filter !== "all" ? ` with status: ${filter}` : ""}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((s) => {
              const color = PLAN_COLORS[s.plan ?? ""] ?? "#007bff";
              const expires = s.plan_expires_at ? new Date(s.plan_expires_at) : null;
              const isExpired = expires ? expires < new Date() : false;
              return (
                <div key={s.email} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  {/* Plan badge */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15` }}>
                    <Crown size={14} style={{ color }} />
                  </div>

                  {/* Artist info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {s.artist_name ?? s.email}
                    </p>
                    <p className="text-white/30 text-xs truncate">{s.email}</p>
                  </div>

                  {/* Plan name */}
                  <div className="hidden sm:block w-28 flex-shrink-0">
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: `${color}15`, color }}>
                      {PLAN_LABELS[s.plan ?? ""] ?? s.plan}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="w-24 flex-shrink-0">
                    <StatusBadge status={s.plan_status} />
                  </div>

                  {/* Expiry */}
                  <div className="hidden md:block w-28 text-right flex-shrink-0">
                    {expires ? (
                      <p className={`text-xs ${isExpired ? "text-red-400" : "text-white/35"}`}>
                        {isExpired ? "Expired " : "Renews "}
                        {expires.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                      </p>
                    ) : (
                      <p className="text-white/20 text-xs">—</p>
                    )}
                  </div>

                  {/* Stripe link */}
                  {s.stripe_customer_id && (
                    <a
                      href={`https://dashboard.stripe.com/customers/${s.stripe_customer_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/20 hover:text-[#007bff] transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
