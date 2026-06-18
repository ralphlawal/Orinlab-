"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Loader2, DollarSign, CheckCircle2, Clock, XCircle,
  ChevronDown, ChevronUp,
} from "lucide-react";

type PayoutRequest = {
  id: string;
  email: string;
  artist_name: string;
  song_title: string;
  release_id: string;
  amount_usd: number;
  payout_method: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_country: string | null;
  paypal_email: string | null;
  mobile_money_provider: string | null;
  mobile_money_number: string | null;
  status: "pending" | "paid" | "rejected";
  admin_notes: string | null;
  paid_at: string | null;
  created_at: string;
};

const STATUS_STYLES = {
  pending:  { label: "Pending",  color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: <Clock size={12} /> },
  paid:     { label: "Paid",     color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20",   icon: <CheckCircle2 size={12} /> },
  rejected: { label: "Rejected", color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20",       icon: <XCircle size={12} /> },
};

export default function PayoutsPage() {
  const { requestUnlock } = usePinGate();
  const [requests, setRequests]   = useState<PayoutRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"all" | "pending" | "paid" | "rejected">("pending");
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [notes, setNotes]         = useState<Record<string, string>>({});
  const [saving, setSaving]       = useState<string | null>(null);

  async function load() {
    setLoading(true);
    let q = supabase.from("payout_requests").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRequests((data ?? []) as PayoutRequest[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(id: string, status: "paid" | "rejected") {
    setSaving(id);
    await supabase
      .from("payout_requests")
      .update({
        status,
        admin_notes: notes[id] ?? null,
        paid_at: status === "paid" ? new Date().toISOString() : null,
      })
      .eq("id", id);

    // Notify artist in-app
    const req = requests.find((r) => r.id === id);
    if (req) {
      await supabase.from("notifications").insert({
        email: req.email,
        type:  status === "paid" ? "success" : "info",
        title: status === "paid"
          ? `Payout of $${req.amount_usd.toFixed(2)} has been sent!`
          : `Payout request for "${req.song_title}" was not processed`,
        body:  notes[id] || (status === "paid"
          ? "Your payout has been processed and sent to your provided payment details."
          : "Please check your profile payment details and resubmit, or contact support."),
        link: `/portal/releases/${req.release_id}`,
      });
    }

    setSaving(null);
    setExpanded(null);
    load();
  }

  const totalPending = requests.filter((r) => r.status === "pending").length;
  const totalPendingUsd = requests.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount_usd, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <DollarSign size={22} /> Payouts
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {totalPending} pending · ${totalPendingUsd.toFixed(2)} USD outstanding
          </p>
        </div>

        <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-xl">
          {(["pending", "paid", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filter === f ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-[#007bff] animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-white/30">No {filter !== "all" ? filter : ""} payout requests.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const st = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
            const isOpen = expanded === r.id;

            const methodDetails = r.payout_method === "bank_transfer"
              ? [["Bank", r.bank_name], ["Account Name", r.bank_account_name], ["Account No.", r.bank_account_number], ["Country", r.bank_country]]
              : r.payout_method === "paypal"
              ? [["PayPal Email", r.paypal_email]]
              : r.payout_method === "mobile_money"
              ? [["Provider", r.mobile_money_provider], ["Number", r.mobile_money_number]]
              : [];

            return (
              <div key={r.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                {/* Header row */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-white font-semibold text-sm">{r.artist_name}</span>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${st.bg} ${st.color}`}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5 truncate">{r.song_title} · {r.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold">${r.amount_usd.toFixed(2)}</p>
                    <p className="text-white/30 text-xs">{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-white/30 flex-shrink-0" /> : <ChevronDown size={16} className="text-white/30 flex-shrink-0" />}
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-white/[0.06] px-5 py-4 space-y-4">
                    {/* Payment details */}
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
                        {r.payout_method ? r.payout_method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "No payout method set"}
                      </p>
                      {methodDetails.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                          {methodDetails.map(([label, val]) => val ? (
                            <div key={label} className="flex flex-col">
                              <span className="text-white/30 text-xs">{label}</span>
                              <span className="text-white/80 text-sm font-medium">{val}</span>
                            </div>
                          ) : null)}
                        </div>
                      ) : (
                        <p className="text-red-400 text-xs">Artist has not filled in payout details.</p>
                      )}
                    </div>

                    {/* Admin notes */}
                    {r.status === "pending" && (
                      <>
                        <textarea
                          value={notes[r.id] ?? r.admin_notes ?? ""}
                          onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                          rows={2}
                          placeholder="Admin notes (optional — sent to artist)…"
                          className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2.5 rounded-xl resize-none transition-colors"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => requestUnlock(() => updateStatus(r.id, "paid"))}
                            disabled={saving === r.id}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors"
                          >
                            {saving === r.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            Mark as Paid
                          </button>
                          <button
                            onClick={() => requestUnlock(() => updateStatus(r.id, "rejected"))}
                            disabled={saving === r.id}
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-400 text-xs font-semibold px-5 py-2.5 rounded-full transition-colors"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </>
                    )}

                    {r.status !== "pending" && r.admin_notes && (
                      <div className="bg-white/[0.03] rounded-xl px-4 py-3">
                        <p className="text-white/30 text-xs mb-1">Admin note</p>
                        <p className="text-white/60 text-xs">{r.admin_notes}</p>
                      </div>
                    )}

                    {r.paid_at && (
                      <p className="text-green-400/60 text-xs">
                        Paid on {new Date(r.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
