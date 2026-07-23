"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  FileCheck2, CheckCircle2, ArrowLeft, Calendar, Music2, User2, Mail,
  AlertCircle, Loader2, Building2,
} from "lucide-react";

type ContractRelease = {
  id: string;
  artist_name: string;
  legal_name: string;
  email: string;
  song_title: string;
  release_type: string;
  genre: string;
  contract_signed_at: string | null;
  contract_signature: string | null;
  status: string;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-6 py-3.5 border-b border-white/[0.05] last:border-0">
      <span className="text-white/35 text-sm w-36 flex-shrink-0">{label}</span>
      <span className="text-white/90 text-sm font-medium break-all">{value}</span>
    </div>
  );
}

export default function ContractViewerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [release, setRelease] = useState<ContractRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/portal/login"); return; }

      const { data: rel, error: relErr } = await supabase
        .from("releases")
        .select("id, artist_name, legal_name, email, song_title, release_type, genre, contract_signed_at, contract_signature, status")
        .eq("id", params.id)
        .eq("email", data.session.user.email!)
        .maybeSingle();

      if (relErr || !rel) {
        setError("Release not found or you don't have access to it.");
        setLoading(false);
        return;
      }

      setRelease(rel as ContractRelease);
      setLoading(false);
    });
  }, [router, params.id]);

  if (loading) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </section>
    );
  }

  if (error || !release) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/portal" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={15} /> My Releases
        </Link>
        <div className="text-center py-20">
          <AlertCircle size={36} className="text-rose-400 mx-auto mb-4" />
          <p className="text-white/50 text-sm">{error ?? "Something went wrong."}</p>
        </div>
      </section>
    );
  }

  const signed    = Boolean(release.contract_signed_at);
  const signedDate = release.contract_signed_at
    ? new Date(release.contract_signed_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const signedTime = release.contract_signed_at
    ? new Date(release.contract_signed_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " UTC"
    : null;

  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <Link href={`/portal/releases/${release.id}`}
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft size={15} /> Back to Release
      </Link>

      <div className="mb-6">
        <h1 className="text-white font-bold text-2xl flex items-center gap-2">
          <FileCheck2 size={22} className="text-[#34d399]" />
          Distribution Agreement
        </h1>
        <p className="text-white/40 text-sm mt-1">Your signed contract with OrinlabÍ Records.</p>
      </div>

      {!signed ? (
        <div className="bg-yellow-500/[0.07] border border-yellow-500/20 rounded-2xl p-6 text-center">
          <AlertCircle size={28} className="text-yellow-400 mx-auto mb-3" />
          <p className="text-yellow-300 font-semibold text-sm">Contract Not Yet Signed</p>
          <p className="text-white/40 text-xs mt-2 leading-relaxed">
            This release has been approved but the distribution agreement has not been signed yet.
          </p>
          {release.status === "approved" && (
            <Link href={`/portal/releases/${release.id}`}
              className="inline-flex items-center gap-2 mt-4 bg-[#007bff] hover:bg-[#0066dd] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Sign Agreement
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Signed badge */}
          <div className="flex items-center gap-3 bg-emerald-500/[0.07] border border-emerald-500/20 rounded-2xl px-5 py-4 mb-6">
            <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-300 font-semibold text-sm">Agreement Signed</p>
              <p className="text-white/40 text-xs mt-0.5">
                Signed on {signedDate} at {signedTime}
              </p>
            </div>
          </div>

          {/* Contract details card */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden mb-6">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
              <Building2 size={16} className="text-white/30" />
              <div>
                <p className="text-white font-bold text-sm">OrinlabÍ Records</p>
                <p className="text-white/30 text-xs">Distribution Agreement · Non-Exclusive License</p>
              </div>
            </div>

            <div className="px-6 py-2">
              <Row label="Artist Name" value={release.artist_name} />
              <Row label="Legal Name" value={release.legal_name || "—"} />
              <Row label="Email" value={release.email} />
              <Row label="Release Title" value={release.song_title} />
              <Row label="Type" value={release.release_type} />
              <Row label="Genre" value={release.genre} />
              <Row label="Signed By" value={release.contract_signature ?? "—"} />
              <Row label="Date Signed" value={signedDate ?? "—"} />
              <Row label="Time" value={signedTime ?? "—"} />
            </div>
          </div>

          {/* Summary clauses */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 space-y-4 mb-6">
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-bold">Agreement Summary</p>
            {[
              { icon: Music2, text: "OrinlabÍ Records is granted a non-exclusive license to distribute your music across digital streaming platforms worldwide." },
              { icon: User2, text: "You retain full ownership and copyright of your master recordings and compositions." },
              { icon: Calendar, text: "Royalties are paid out upon request, subject to the minimum payout threshold and your confirmed payment details." },
              { icon: Mail,  text: "You will be notified by email when your release goes live and when royalties are available." },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <Icon size={15} className="text-white/25 mt-0.5 flex-shrink-0" />
                <p className="text-white/45 text-xs leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Copy notice */}
          <div className="p-4 rounded-xl bg-[#007bff]/[0.05] border border-[#007bff]/15">
            <p className="text-[#60a5fa] text-xs leading-relaxed">
              A signed PDF copy of this agreement was emailed to <strong>{release.email}</strong> at the time of signing. For a replacement copy, contact{" "}
              <a href="mailto:info@orinlabi.com" className="underline hover:text-white transition-colors">info@orinlabi.com</a>.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
