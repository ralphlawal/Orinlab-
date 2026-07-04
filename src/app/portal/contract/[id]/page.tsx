"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CONTRACT_CLAUSES } from "@/lib/contractTerms";
import {
  ArrowLeft, CheckCircle2, FileText, Loader2, PenLine, ShieldCheck,
} from "lucide-react";

type Release = {
  id: string;
  artist_name: string;
  legal_name: string;
  email: string;
  song_title: string;
  release_type: string;
  genre: string;
  status: string;
  contract_signed_at: string | null;
  contract_signature: string | null;
};

export default function ContractPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [signatureName, setSignatureName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/portal/login"); return; }

      const { data } = await supabase
        .from("releases")
        .select("id, artist_name, legal_name, email, song_title, release_type, genre, status, contract_signed_at, contract_signature")
        .eq("id", id)
        .eq("email", session.user.email!)
        .maybeSingle();

      if (!data) { router.push("/portal"); return; }
      setRelease(data as Release);
      if ((data as Release).contract_signed_at) setDone(true);
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleSign() {
    if (!release || !signatureName.trim() || !agreed) return;
    setSubmitting(true);
    setError("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setError("Session expired. Please log in again."); setSubmitting(false); return; }

    const res = await fetch("/api/contract/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ releaseId: release.id, signatureName: signatureName.trim() }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  if (!release) return null;

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  if (done) {
    const signedDate = release.contract_signed_at
      ? new Date(release.contract_signed_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : today;
    return (
      <section className="max-w-3xl mx-auto px-4 py-12">
        <Link href={`/portal/releases/${release.id}`} className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-8">
          <ArrowLeft size={15} /> Back to Release
        </Link>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
          <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-white font-bold text-2xl mb-2">Contract Signed</h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">
            Your distribution agreement for <strong className="text-white">{release.song_title}</strong> was signed
            {release.contract_signature ? ` by ${release.contract_signature}` : ""} on {signedDate}.
            A PDF copy has been sent to your email.
          </p>
        </div>
      </section>
    );
  }

  if (release.status !== "approved") {
    return (
      <section className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-white/50 text-sm">Contract is only available for approved releases.</p>
        <Link href="/portal" className="text-[#007bff] text-sm mt-4 inline-block hover:underline">← Back to portal</Link>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <Link href={`/portal/releases/${release.id}`} className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
        <ArrowLeft size={15} /> Back to Release
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#007bff]/10 flex items-center justify-center flex-shrink-0">
          <FileText size={22} className="text-[#007bff]" />
        </div>
        <div>
          <h1 className="text-white font-bold text-2xl leading-tight">Distribution Agreement</h1>
          <p className="text-white/40 text-sm mt-1">
            Read the full contract below, then sign with your legal name.
          </p>
        </div>
      </div>

      {/* Contract document */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">

        {/* Contract header strip */}
        <div className="bg-[#050505] px-8 py-6 border-b-2 border-[#007bff]">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <p className="text-white font-bold text-xl tracking-wide">ORINLABÍ</p>
            <div className="text-right">
              <p className="text-white/50 text-xs">Digital Music Distribution Agreement</p>
              <p className="text-white/30 text-xs">Effective Date: {today}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-white font-bold text-lg">DIGITAL MUSIC DISTRIBUTION AGREEMENT</h2>
            <p className="text-white/40 text-sm mt-1">Effective Date: {today}</p>
          </div>

          {/* Parties */}
          <div className="border-l-4 border-[#007bff] pl-5 py-3 bg-white/[0.02] rounded-r-xl">
            <p className="text-[#007bff] text-xs font-bold uppercase tracking-widest mb-4">Parties</p>
            <div className="grid gap-2 text-sm">
              {[
                ["Distributor", `OrinlabÍ Records Distribution Ltd ("OrinlabÍ Records" or "Distributor")`],
                ["Artist", `${release.legal_name} (professionally known as "${release.artist_name}")`],
                ["Email", release.email],
                ["Release", `"${release.song_title}" (${release.release_type} · ${release.genre})`],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-4">
                  <span className="text-white/30 w-20 flex-shrink-0">{label}</span>
                  <span className="text-white/80 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clauses */}
          {CONTRACT_CLAUSES.map((clause) => (
            <div key={clause.number} className="space-y-2">
              <h3 className="text-white font-semibold text-sm">
                {clause.number}. {clause.title}
              </h3>
              <p className="text-white/55 text-sm leading-relaxed">{clause.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Signature section */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <PenLine size={18} className="text-[#007bff]" />
          <p className="text-white font-semibold">Sign This Agreement</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 bg-white/[0.03] rounded-xl p-4 text-sm">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Release</p>
            <p className="text-white/80 font-medium">{release.song_title}</p>
          </div>
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Date</p>
            <p className="text-white/80 font-medium">{today}</p>
          </div>
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Legal Name (from submission)</p>
            <p className="text-white/80 font-medium">{release.legal_name}</p>
          </div>
        </div>

        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Type your full legal name to sign
          </label>
          <input
            type="text"
            placeholder={release.legal_name}
            value={signatureName}
            onChange={(e) => setSignatureName(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors"
            style={{ fontFamily: "Georgia, serif", fontSize: "1rem" }}
          />
          <p className="text-white/25 text-xs mt-2">
            This typed name constitutes your electronic signature and is legally binding.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-md border-2 transition-colors flex items-center justify-center ${
                agreed ? "bg-[#007bff] border-[#007bff]" : "border-white/20 bg-white/[0.04]"
              }`}
            >
              {agreed && <CheckCircle2 size={12} className="text-white" />}
            </div>
          </div>
          <p className="text-white/55 text-sm leading-relaxed">
            I have read and understood the full Distribution Agreement above. I agree to all terms and confirm that I own or control all rights in the release{" "}
            <strong className="text-white/80">{release.song_title}</strong>, and I authorise OrinlabÍ Records to distribute it on digital platforms worldwide.
          </p>
        </label>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleSign}
            disabled={submitting || !signatureName.trim() || !agreed}
            className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0066dd] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ShieldCheck size={15} />
            )}
            {submitting ? "Signing…" : "Sign & Submit"}
          </button>
          <p className="text-white/25 text-xs">
            A signed PDF will be emailed to you and OrinlabÍ Records immediately.
          </p>
        </div>
      </div>
    </section>
  );
}
