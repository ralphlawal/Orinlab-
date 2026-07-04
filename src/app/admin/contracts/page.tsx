"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, RefreshCw, CheckCircle2, AlertTriangle, Loader2, Search, Download } from "lucide-react";

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

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [resending, setResending] = useState<string | null>(null);
  const [resendResult, setResendResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("releases")
        .select("id,artist_name,legal_name,email,song_title,release_type,genre,contract_signed_at,contract_signature,submitted_at")
        .not("contract_signed_at", "is", null)
        .order("contract_signed_at", { ascending: false });
      setContracts((data ?? []) as Contract[]);
      setLoading(false);
    }
    load();
  }, []);

  async function handleResend(contract: Contract) {
    setResending(contract.id);
    setResendResult(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setResendResult({ id: contract.id, ok: false, msg: "Session expired — please refresh and try again." });
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

  const filtered = contracts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.artist_name.toLowerCase().includes(q) ||
      c.song_title.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.legal_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl">Signed Contracts</h1>
          <p className="text-white/40 text-sm mt-1">
            All signed Distribution Agreements. Use &ldquo;Resend Email&rdquo; to push any contract to both admin inboxes with the PDF attached.
          </p>
        </div>
        <div className="bg-[#007bff]/10 border border-[#007bff]/20 rounded-xl px-4 py-2 flex items-center gap-2">
          <FileText size={15} className="text-[#007bff]" />
          <span className="text-[#007bff] font-bold text-sm">{contracts.length} total</span>
        </div>
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

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={26} className="text-[#007bff] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-white/30 text-sm">
          {search ? "No contracts match your search." : "No signed contracts yet."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const result = resendResult?.id === c.id ? resendResult : null;
            return (
              <div
                key={c.id}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-green-400" />
                </div>

                {/* Info */}
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

                  {/* Inline result */}
                  {result && (
                    <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${result.ok ? "text-green-400" : "text-red-400"}`}>
                      {result.ok
                        ? <CheckCircle2 size={13} />
                        : <AlertTriangle size={13} />}
                      {result.msg}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/portal/contract/${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-xl px-3 py-2 text-xs font-medium transition-all"
                    title="View contract page"
                  >
                    <Download size={13} /> View
                  </a>
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
      )}

      {/* Legend */}
      <div className="border-t border-white/[0.05] pt-5">
        <p className="text-white/20 text-xs leading-relaxed">
          <strong className="text-white/35">Resend Email</strong> — regenerates the contract PDF using the data at the time of signing and sends it to both admin inboxes (ralphlawal2003@gmail.com and ibatwtc@gmail.com). The artist is not re-notified.
          <br />
          <strong className="text-white/35">View</strong> — opens the contract signing page (the signed state is shown if the contract is already signed).
        </p>
      </div>
    </div>
  );
}
