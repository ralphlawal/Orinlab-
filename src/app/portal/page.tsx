"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Music2, Clock, CheckCircle2, XCircle,
  ChevronRight, Loader2, ArrowRight, UserCircle2, PlusCircle,
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
  const [showProfileBanner, setShowProfileBanner] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [releasesRes, profileRes] = await Promise.all([
        supabase
          .from("releases")
          .select("id,song_title,release_type,genre,release_date,status,review_notes,cover_art_url,submitted_at,artist_name")
          .eq("email", session.user.email!)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("artist_profiles")
          .select("spotify_artist_id,instagram_handle")
          .eq("email", session.user.email!)
          .single(),
      ]);

      const data = releasesRes.data ?? [];
      if (data.length > 0) {
        setArtistName((data[0] as unknown as { artist_name?: string }).artist_name ?? "");
      }

      const hasApproved = data.some((r: Release) => r.status === "approved");
      const profileFilled = !!(profileRes.data?.spotify_artist_id || profileRes.data?.instagram_handle);
      setShowProfileBanner(hasApproved && !profileFilled);

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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-3xl">
            {artistName ? `Welcome back, ${artistName}.` : "Your Releases"}
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Track the status of your applications and approved distributions.
          </p>
        </div>
        {releases.some((r) => r.status === "approved") && (
          <Link
            href="/portal/releases/new"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
          >
            <PlusCircle size={16} /> New Release
          </Link>
        )}
      </div>

      {/* Profile completion banner */}
      {showProfileBanner && (
        <div className="mb-8 bg-[#007bff]/10 border border-[#007bff]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <UserCircle2 size={20} className="text-[#007bff] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold text-sm">Complete your distribution profile</p>
              <p className="text-white/50 text-xs mt-1">
                Your release was approved! We need your platform IDs and social handles to finalise your distribution setup.
              </p>
            </div>
          </div>
          <Link
            href="/portal/profile"
            className="flex-shrink-0 bg-[#007bff] hover:bg-[#0069d9] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors whitespace-nowrap"
          >
            Complete Profile →
          </Link>
        </div>
      )}

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

          {/* Submit more music CTA */}
          <div className="mt-8 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-white/30 text-sm mb-4">Have more music to release?</p>
            {releases.some((r) => r.status === "approved") ? (
              <Link
                href="/portal/releases/new"
                className="inline-flex items-center gap-2 border border-[#007bff]/30 hover:border-[#007bff]/60 text-[#007bff]/70 hover:text-[#007bff] font-medium px-6 py-3 rounded-full text-sm transition-all"
              >
                <PlusCircle size={15} /> Submit a New Release <ArrowRight size={15} />
              </Link>
            ) : (
              <Link
                href="/submit"
                className="inline-flex items-center gap-2 border border-white/10 hover:border-[#007bff]/40 text-white/60 hover:text-white font-medium px-6 py-3 rounded-full text-sm transition-all"
              >
                Submit Another Application <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
