"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Music2, Clock, CheckCircle2, XCircle,
  ChevronRight, Loader2, ArrowRight,
} from "lucide-react";

type Release = {
  id: string;
  song_title: string;
  release_type: string;
  genre: string;
  release_date: string;
  status: "pending" | "approved" | "rejected";
  review_notes: string | null;
  cover_art_url: string | null;
  submitted_at: string;
};

const statusConfig = {
  pending:  { icon: Clock,         label: "Under Review", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", dot: "bg-yellow-400 animate-pulse" },
  approved: { icon: CheckCircle2,  label: "Approved",     color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20",   dot: "bg-green-400" },
  rejected: { icon: XCircle,       label: "Not Selected", color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20",        dot: "bg-red-400" },
};

export default function PortalDashboard() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistName, setArtistName] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("releases")
        .select("id,song_title,release_type,genre,release_date,status,review_notes,cover_art_url,submitted_at")
        .eq("email", session.user.email!)
        .order("submitted_at", { ascending: false });

      if (data && data.length > 0) {
        setArtistName((data[0] as unknown as { artist_name?: string }).artist_name ?? "");
      }

      setReleases((data as Release[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-white font-bold text-3xl">
          {artistName ? `Welcome back, ${artistName}.` : "Your Releases"}
        </h1>
        <p className="text-white/40 text-sm mt-2">
          Track the status of your applications and approved distributions.
        </p>
      </div>

      {releases.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-5">
            <Music2 size={28} className="text-white/20" />
          </div>
          <p className="text-white/50 font-medium mb-2">No submissions yet</p>
          <p className="text-white/30 text-sm mb-8">
            Apply to distribute your music with Orinlabí.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
          >
            Submit Application <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {releases.map((r) => {
            const cfg = statusConfig[r.status] ?? statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <Link
                key={r.id}
                href={`/portal/releases/${r.id}`}
                className="group flex items-center gap-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/20 rounded-2xl p-5 transition-all duration-200"
              >
                {/* Cover */}
                <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#007bff]/20 to-black flex items-center justify-center">
                  {r.cover_art_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music2 size={20} className="text-[#007bff]/40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{r.song_title}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {r.release_type} · {r.genre}
                  </p>
                  <p className="text-white/25 text-xs mt-1">
                    Applied {new Date(r.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                {/* Status */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className="hidden sm:block">{cfg.label}</span>
                  <Icon size={13} className="sm:hidden" />
                </div>

                <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 flex-shrink-0 transition-colors" />
              </Link>
            );
          })}

          {/* Apply again CTA */}
          <div className="mt-8 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-white/30 text-sm mb-4">Have more music to release?</p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 border border-white/10 hover:border-[#007bff]/40 text-white/60 hover:text-white font-medium px-6 py-3 rounded-full text-sm transition-all"
            >
              Submit Another Application <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
