"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Clock, CheckCircle2, XCircle, Loader2, Users, Music, Globe, ArrowRight, Pencil,
} from "lucide-react";

type LabelProfile = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  bio: string | null;
  country: string | null;
  genre_focus: string | null;
  founded_year: number | null;
  status: string;
  rejection_reason: string | null;
  submitted_at: string | null;
};

export default function LabelPortalDashboard() {
  const [label, setLabel]         = useState<LabelProfile | null>(null);
  const [artistCount, setArtistCount] = useState(0);
  const [releaseCount, setReleaseCount] = useState(0);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("label_profiles")
        .select("id,name,slug,logo_url,bio,country,genre_focus,founded_year,status,rejection_reason,submitted_at")
        .eq("email", session.user.email!)
        .maybeSingle();

      if (!data) { setLoading(false); return; }
      setLabel(data as LabelProfile);

      // Count artists and releases if approved
      if (data.status === "approved") {
        const { data: profiles } = await supabase
          .from("artist_profiles")
          .select("email")
          .ilike("record_label", data.name);

        const count = profiles?.length ?? 0;
        setArtistCount(count);

        if (count > 0) {
          const emails = profiles!.map((p) => p.email);
          const { count: rc } = await supabase
            .from("releases")
            .select("id", { count: "exact", head: true })
            .in("email", emails)
            .eq("status", "approved");
          setReleaseCount(rc ?? 0);
        }
      }

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

  if (!label) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-white/40 text-sm mb-4">
          No label profile found for your email. Have you applied?
        </p>
        <Link href="/labels/apply" className="inline-block bg-[#007bff] text-white font-semibold px-6 py-3 rounded-full text-sm">
          Apply Now
        </Link>
      </div>
    );
  }

  const status = label.status;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Status banner */}
      {status === "pending" && (
        <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-5 mb-8">
          <Clock size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-semibold text-sm">Application Under Review</p>
            <p className="text-white/50 text-sm mt-1">
              We&apos;re reviewing your label&apos;s application. You&apos;ll receive an email at your registered address once a decision is made — usually within 2–5 business days.
            </p>
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div className="flex items-start gap-3 bg-red-400/5 border border-red-400/20 rounded-2xl p-5 mb-8">
          <XCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold text-sm">Application Not Approved</p>
            {label.rejection_reason && (
              <p className="text-white/50 text-sm mt-1">{label.rejection_reason}</p>
            )}
            <p className="text-white/40 text-sm mt-2">
              Questions? Contact us at{" "}
              <a href="mailto:info@orinlabi.com" className="text-[#007bff] hover:underline">info@orinlabi.com</a>
            </p>
          </div>
        </div>
      )}

      {status === "approved" && (
        <div className="flex items-center gap-2 text-green-400 text-sm mb-8">
          <CheckCircle2 size={16} />
          <span className="font-semibold">Active Label Partner</span>
        </div>
      )}

      {/* Label card */}
      <div className="flex flex-col sm:flex-row items-start gap-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 mb-8">
        {label.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={label.logo_url} alt="" className="w-20 h-20 rounded-2xl object-cover bg-white/5 flex-shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-[#007bff]/10 flex items-center justify-center flex-shrink-0">
            <Globe size={32} className="text-[#007bff]/30" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold text-2xl mb-1">{label.name}</h1>
          <div className="flex flex-wrap gap-2 mb-3">
            {label.country && (
              <span className="text-white/40 text-xs">{label.country}</span>
            )}
            {label.genre_focus && (
              <span className="text-white/40 text-xs">· {label.genre_focus}</span>
            )}
            {label.founded_year && (
              <span className="text-white/40 text-xs">· Est. {label.founded_year}</span>
            )}
          </div>
          {label.bio && (
            <p className="text-white/50 text-sm leading-relaxed line-clamp-2">{label.bio}</p>
          )}
        </div>
        <Link
          href="/labels/portal/profile"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
        >
          <Pencil size={12} /> Edit Profile
        </Link>
      </div>

      {/* Stats (approved only) */}
      {status === "approved" && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#007bff]/10 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-[#007bff]" />
              </div>
              <p className="text-white/50 text-sm">Artists on Roster</p>
            </div>
            <p className="text-white font-bold text-3xl">{artistCount}</p>
            <Link href="/labels/portal/artists" className="flex items-center gap-1 text-[#007bff] text-xs mt-3 hover:underline">
              View Roster <ArrowRight size={11} />
            </Link>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#007bff]/10 rounded-xl flex items-center justify-center">
                <Music size={20} className="text-[#007bff]" />
              </div>
              <p className="text-white/50 text-sm">Approved Releases</p>
            </div>
            <p className="text-white font-bold text-3xl">{releaseCount}</p>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/labels/portal/profile"
          className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl p-5 transition-all group"
        >
          <div>
            <p className="text-white font-semibold text-sm">Edit Profile</p>
            <p className="text-white/40 text-xs mt-0.5">Update logo, bio, and social links</p>
          </div>
          <ArrowRight size={16} className="text-white/20 group-hover:text-[#007bff] transition-colors" />
        </Link>

        {status === "approved" && (
          <Link
            href="/labels/portal/artists"
            className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl p-5 transition-all group"
          >
            <div>
              <p className="text-white font-semibold text-sm">View Roster</p>
              <p className="text-white/40 text-xs mt-0.5">See all artists linked to your label</p>
            </div>
            <ArrowRight size={16} className="text-white/20 group-hover:text-[#007bff] transition-colors" />
          </Link>
        )}

        {status === "approved" && label.slug && (
          <a
            href={`/labels/${label.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl p-5 transition-all group"
          >
            <div>
              <p className="text-white font-semibold text-sm">Public Label Page</p>
              <p className="text-white/40 text-xs mt-0.5">/labels/{label.slug}</p>
            </div>
            <ArrowRight size={16} className="text-white/20 group-hover:text-[#007bff] transition-colors" />
          </a>
        )}
      </div>
    </div>
  );
}
