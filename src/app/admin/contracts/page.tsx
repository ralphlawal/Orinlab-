"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CONTRACT_CLAUSES } from "@/lib/contractTerms";
import {
  FileText, RefreshCw, CheckCircle2, AlertTriangle, Loader2, Search,
  Clock, Send, Eye, X, Download,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Contract = {
  id: string;
  artist_name: string;
  legal_name: string;
  email: string;
  song_title: string;
  release_type: string;
  genre: string;
  contract_signed_at: string;
  contract_signature: string | null;
  submitted_at: string;
};

type Unsigned = {
  id: string;
  artist_name: string;
  legal_name: string;
  email: string;
  song_title: string;
  release_type: string;
  genre: string;
  submitted_at: string;
};

type Tab = "signed" | "unsigned";

// ─── Contract Viewer ──────────────────────────────────────────────────────────

function ContractViewer({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const signedDate = new Date(contract.contract_signed_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const effectiveDate = new Date(contract.contract_signed_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  async function handleDownload() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/contract/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ releaseId: contract.id }),
    });
    if (res.ok) alert("PDF emailed to admin inboxes.");
    else alert("Failed to generate — check server logs.");
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-3xl bg-[#050505] border-l border-white/[0.08] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#007bff]/10 flex items-center justify-center">
              <FileText size={15} className="text-[#007bff]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{contract.song_title}</p>
              <p className="text-white/40 text-xs">{contract.artist_name} · Signed {signedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/[0.1] hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download size={12} /> Email PDF
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Contract document */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-0">
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl">

            {/* Header strip */}
            <div className="bg-[#050505] px-8 py-6 border-b-[3px] border-[#007bff]">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <p className="text-white font-bold text-xl tracking-wide">ORINLABÍ</p>
                <div className="text-right">
                  <p className="text-white/50 text-xs">Digital Music Distribution Agreement</p>
                  <p className="text-white/30 text-xs">Effective Date: {effectiveDate}</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-8 space-y-8">
              {/* Title */}
              <div className="text-center">
                <h2 className="text-gray-900 font-bold text-lg">DIGITAL MUSIC DISTRIBUTION AGREEMENT</h2>
                <p className="text-gray-400 text-sm mt-1">Effective Date: {effectiveDate}</p>
              </div>

              {/* Parties */}
              <div className="border-l-4 border-[#007bff] pl-5 py-3 bg-gray-50 rounded-r-xl">
                <p className="text-[#007bff] text-xs font-bold uppercase tracking-widest mb-4">Parties</p>
                <div className="grid gap-2 text-sm">
                  {[
                    ["Distributor", `OrinlabÍ Records Distribution Ltd ("OrinlabÍ Records" or "Distributor")`],
                    ["Artist", `${contract.legal_name} (professionally known as "${contract.artist_name}")`],
                    ["Email", contract.email],
                    ["Release", `"${contract.song_title}" (${contract.release_type} · ${contract.genre})`],
                  ].map(([label, val]) => (
                    <div key={label} className="flex gap-4">
                      <span className="text-gray-400 w-20 flex-shrink-0 text-xs">{label}</span>
                      <span className="text-gray-800 font-medium text-xs">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clauses */}
              {CONTRACT_CLAUSES.map((clause) => (
                <div key={clause.number} className="space-y-2">
                  <h3 className="text-gray-900 font-semibold text-sm">
                    {clause.number}. {clause.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{clause.body}</p>
                </div>
              ))}

              {/* Signature block */}
              <div className="border-t-2 border-gray-100 pt-8 space-y-6">
                <div className="grid sm:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-5 text-sm">
                  {[
                    ["Release", contract.song_title],
                    ["Release Type", `${contract.release_type} · ${contract.genre}`],
                    ["Legal Name", contract.legal_name],
                    ["Signed On", signedDate],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-gray-800 font-medium text-sm">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Signature */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Electronic Signature</p>
                  <p
                    className="text-gray-900 text-2xl border-b border-gray-300 pb-2 mb-2"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {contract.contract_signature ?? contract.legal_name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Signed electronically by {contract.legal_name} on {signedDate}.
                    This electronic signature is legally binding under applicable electronic signature laws.
                  </p>
                </div>

                {/* Verified badge */}
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  <p className="text-green-700 text-sm font-medium">
                    Contract verified — signed {signedDate} via OrinlabÍ Records Artist Portal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminContractsPage() {
  const [tab, setTab]             = useState<Tab>("signed");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [unsigned, setUnsigned]   = useState<Unsigned[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [viewing, setViewing]     = useState<Contract | null>(null);
  const [resending, setResending] = useState<string | null>(null);
  const [resendResult, setResendResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);
  const [nudging, setNudging]     = useState<string | null>(null);
  const [nudgeResult, setNudgeResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    async function load() {
      const [signedRes, unsignedRes] = await Promise.all([
        supabase
          .from("releases")
          .select("id,artist_name,legal_name,email,song_title,release_type,genre,contract_signed_at,contract_signature,submitted_at")
          .not("contract_signed_at", "is", null)
          .order("contract_signed_at", { ascending: false }),
        supabase
          .from("releases")
          .select("id,artist_name,legal_name,email,song_title,release_type,genre,submitted_at")
          .eq("status", "approved")
          .is("contract_signed_at", null)
          .order("submitted_at", { ascending: false }),
      ]);
      setContracts((signedRes.data ?? []) as Contract[]);
      setUnsigned((unsignedRes.data ?? []) as Unsigned[]);
      setLoading(false);
    }
    load();
  }, []);

  async function handleResend(contract: Contract) {
    setResending(contract.id);
    setResendResult(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setResendResult({ id: contract.id, ok: false, msg: "Session expired — please refresh." });
      setResending(null);
      return;
    }

    const res = await fetch("/api/contract/resend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ releaseId: contract.id }),
    });

    const json = await res.json();
    setResendResult({
      id: contract.id,
      ok: res.ok,
      msg: res.ok ? "Email resent to both admin inboxes." : (json.error ?? "Failed to resend."),
    });
    setResending(null);
  }

  async function handleNudge(u: Unsigned) {
    setNudging(u.id);
    setNudgeResult(null);

    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "artist-reminder",
        data: {
          email: u.email,
          artist_name: u.artist_name,
          song_title: u.song_title,
          reminder_type: "contract",
        },
      }),
    }).catch(() => {});

    await supabase.from("notifications").insert({
      email: u.email,
      title: `Sign your distribution agreement — ${u.song_title}`,
      body: `Your release "${u.song_title}" is approved but your contract hasn't been signed yet. Sign it in your artist portal to unlock full distribution.`,
      type: "warning",
      read: false,
      created_at: new Date().toISOString(),
    });

    setNudgeResult({ id: u.id, ok: true, msg: "Reminder sent to artist." });
    setNudging(null);
  }

  const filterSigned   = (c: Contract) => { const q = search.toLowerCase(); return c.artist_name.toLowerCase().includes(q) || c.song_title.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.legal_name ?? "").toLowerCase().includes(q); };
  const filterUnsigned = (u: Unsigned) => { const q = search.toLowerCase(); return u.artist_name.toLowerCase().includes(q) || u.song_title.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.legal_name ?? "").toLowerCase().includes(q); };

  const filteredSigned   = contracts.filter(filterSigned);
  const filteredUnsigned = unsigned.filter(filterUnsigned);

  return (
    <>
      {viewing && <ContractViewer contract={viewing} onClose={() => setViewing(null)} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-white font-bold text-2xl">Contracts</h1>
            <p className="text-white/40 text-sm mt-1">
              Track signed agreements and chase artists who still need to sign.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-400" />
              <span className="text-green-400 font-bold text-sm">{contracts.length} signed</span>
            </div>
            {unsigned.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                <Clock size={14} className="text-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm">{unsigned.length} unsigned</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 w-fit">
          {(["signed", "unsigned"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                tab === t
                  ? "bg-white/10 text-white"
                  : "text-white/35 hover:text-white/60"
              }`}
            >
              {t === "signed" ? `Signed (${contracts.length})` : `Awaiting Signature (${unsigned.length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by artist, song, or email…"
            className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff]/50 outline-none text-white placeholder-white/25 text-sm pl-9 pr-4 py-2.5 rounded-xl transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={26} className="text-[#007bff] animate-spin" />
          </div>
        ) : tab === "signed" ? (
          /* ── Signed ──────────────────────────────────────────────────────── */
          filteredSigned.length === 0 ? (
            <div className="text-center py-24 text-white/30 text-sm">
              {search ? "No contracts match your search." : "No signed contracts yet."}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSigned.map((c) => {
                const result = resendResult?.id === c.id ? resendResult : null;
                return (
                  <div key={c.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-green-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm truncate">{c.artist_name}</p>
                        <span className="text-white/20">·</span>
                        <p className="text-white/60 text-sm truncate">{c.song_title}</p>
                        <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 font-bold uppercase tracking-wide flex-shrink-0">
                          Signed
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        <p className="text-white/35 text-xs">{c.email}</p>
                        <p className="text-white/25 text-xs">Legal: {c.legal_name || "—"}</p>
                        <p className="text-white/25 text-xs">Signature: <span className="text-white/50 italic">{c.contract_signature || "—"}</span></p>
                      </div>
                      <p className="text-white/20 text-xs mt-1">
                        Signed {new Date(c.contract_signed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        {" at "}
                        {new Date(c.contract_signed_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} UTC
                      </p>

                      {result && (
                        <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${result.ok ? "text-green-400" : "text-red-400"}`}>
                          {result.ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                          {result.msg}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setViewing(c)}
                        className="inline-flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] hover:border-white/25 text-white/60 hover:text-white rounded-xl px-3 py-2 text-xs font-semibold transition-all"
                      >
                        <Eye size={13} />
                        View
                      </button>
                      <button
                        onClick={() => handleResend(c)}
                        disabled={resending === c.id}
                        className="inline-flex items-center gap-1.5 bg-[#007bff]/10 hover:bg-[#007bff]/20 border border-[#007bff]/25 hover:border-[#007bff]/40 text-[#007bff] rounded-xl px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resending === c.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <RefreshCw size={13} />}
                        {resending === c.id ? "Sending…" : "Resend Email"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ── Unsigned ────────────────────────────────────────────────────── */
          filteredUnsigned.length === 0 ? (
            <div className="text-center py-24 text-white/30 text-sm">
              {search ? "No results match your search." : "All approved releases have signed contracts."}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUnsigned.map((u) => {
                const result = nudgeResult?.id === u.id ? nudgeResult : null;
                return (
                  <div key={u.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <Clock size={16} className="text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm truncate">{u.artist_name}</p>
                        <span className="text-white/20">·</span>
                        <p className="text-white/60 text-sm truncate">{u.song_title}</p>
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5 font-bold uppercase tracking-wide flex-shrink-0">
                          Unsigned
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        <p className="text-white/35 text-xs">{u.email}</p>
                        <p className="text-white/25 text-xs">Legal: {u.legal_name || "—"}</p>
                        <p className="text-white/25 text-xs">{u.release_type} · {u.genre}</p>
                      </div>
                      <p className="text-white/20 text-xs mt-1">
                        Approved {new Date(u.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      {result && (
                        <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${result.ok ? "text-green-400" : "text-red-400"}`}>
                          {result.ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                          {result.msg}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleNudge(u)}
                        disabled={nudging === u.id}
                        className="inline-flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/25 hover:border-yellow-500/40 text-yellow-400 rounded-xl px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {nudging === u.id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        {nudging === u.id ? "Sending…" : "Nudge Artist"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Legend */}
        <div className="border-t border-white/[0.05] pt-5">
          <p className="text-white/20 text-xs leading-relaxed">
            <strong className="text-white/35">View</strong> — opens the full contract document with the artist&apos;s actual signature.{" "}
            <strong className="text-white/35">Resend Email</strong> — regenerates the PDF and sends it to admin inboxes.{" "}
            <strong className="text-white/35">Nudge Artist</strong> — sends a reminder email and portal notification asking them to sign.
          </p>
        </div>
      </div>
    </>
  );
}
