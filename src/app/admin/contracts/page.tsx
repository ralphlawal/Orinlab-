"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import { FileText, CheckCircle2, AlertTriangle, RotateCcw, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

type ContractRow = {
  id: string;
  artist_name: string;
  email: string;
  song_title: string;
  release_type: string;
  submitted_at: string;
  contract_signed_at: string | null;
  contract_signature: string | null;
};

type Filter = "unsigned" | "signed" | "all";

export default function AdminContractsPage() {
  const { requestUnlock } = usePinGate();
  const [rows, setRows] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("unsigned");
  const [resending, setResending] = useState<string | null>(null);
  const [resentIds, setResentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    supabase
      .from("releases")
      .select("id,artist_name,email,song_title,release_type,submitted_at,contract_signed_at,contract_signature")
      .order("submitted_at", { ascending: false })
      .then(({ data }) => {
        setRows((data ?? []) as ContractRow[]);
        setLoading(false);
      });
  }, []);

  async function doResend(row: ContractRow) {
    setResending(row.id);
    try {
      await fetch("/api/contract/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releaseId: row.id, email: row.email, artistName: row.artist_name, songTitle: row.song_title }),
      });
      setResentIds((prev) => new Set(prev).add(row.id));
    } finally {
      setResending(null);
    }
  }

  function resendContract(row: ContractRow) {
    requestUnlock(() => doResend(row));
  }

  const unsigned = rows.filter((r) => !r.contract_signed_at);
  const signed   = rows.filter((r) => !!r.contract_signed_at);
  const visible  = filter === "unsigned" ? unsigned : filter === "signed" ? signed : rows;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-white font-bold text-2xl mb-1">Contracts</h1>
        <p className="text-white/40 text-sm">Artist distribution agreements — signed and unsigned.</p>
      </div>

      {unsigned.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-400/10 border border-amber-400/20 rounded-2xl px-5 py-4">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300 text-sm">
            <span className="font-semibold">{unsigned.length} release{unsigned.length !== 1 ? "s" : ""}</span> still awaiting a signed contract.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 w-fit">
        {(["unsigned", "signed", "all"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? "bg-white/10 text-white" : "text-white/35 hover:text-white/60"
            }`}
          >
            {f === "unsigned" ? `Unsigned (${unsigned.length})` : f === "signed" ? `Signed (${signed.length})` : `All (${rows.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-[#007bff] animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-white/25">
          <FileText size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No {filter !== "all" ? filter : ""} contracts.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-white/30 text-xs uppercase tracking-widest font-medium">Artist</th>
                <th className="px-4 py-3 text-left text-white/30 text-xs uppercase tracking-widest font-medium">Release</th>
                <th className="px-4 py-3 text-left text-white/30 text-xs uppercase tracking-widest font-medium hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-white/30 text-xs uppercase tracking-widest font-medium hidden lg:table-cell">Submitted</th>
                <th className="px-4 py-3 text-left text-white/30 text-xs uppercase tracking-widest font-medium">Status</th>
                <th className="px-4 py-3 text-right text-white/30 text-xs uppercase tracking-widest font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-white/[0.04] last:border-0 ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                >
                  <td className="px-4 py-3.5 text-white font-medium">{row.artist_name}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-white/80">{row.song_title}</p>
                    <p className="text-white/30 text-xs mt-0.5 capitalize">{row.release_type}</p>
                  </td>
                  <td className="px-4 py-3.5 text-white/50 hidden md:table-cell">{row.email}</td>
                  <td className="px-4 py-3.5 text-white/40 text-xs hidden lg:table-cell">
                    {new Date(row.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5">
                    {row.contract_signed_at ? (
                      <span className="inline-flex items-center gap-1.5 text-green-400 text-xs font-medium bg-green-400/10 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={11} /> Signed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-medium bg-amber-400/10 px-2.5 py-1 rounded-full">
                        <AlertTriangle size={11} /> Unsigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {!row.contract_signed_at && (
                        <button
                          onClick={() => resendContract(row)}
                          disabled={resending === row.id || resentIds.has(row.id)}
                          title="Resend contract email"
                          className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white disabled:opacity-40 transition-colors"
                        >
                          {resending === row.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : resentIds.has(row.id)
                            ? <CheckCircle2 size={13} className="text-green-400" />
                            : <RotateCcw size={13} />}
                          {resentIds.has(row.id) ? "Sent" : "Resend"}
                        </button>
                      )}
                      <Link
                        href={`/admin/releases?id=${row.id}`}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#007bff] hover:text-[#4da6ff] transition-colors"
                      >
                        View <ExternalLink size={11} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
