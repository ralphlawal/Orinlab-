"use client";

import { useState } from "react";
import {
  Search, Clock, CheckCircle2, XCircle, Loader2,
  Music2, Calendar, Globe, ChevronDown, ChevronUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Release = {
  id: string;
  song_title: string;
  release_type: string;
  genre: string;
  release_date: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  cover_art_url: string | null;
};

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Under Review",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    dot: "bg-yellow-400",
    desc: "Your application is in our review queue. We respond within 3–5 business days.",
  },
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    dot: "bg-green-400",
    desc: "Congratulations! Your release has been approved for global distribution.",
  },
  rejected: {
    icon: XCircle,
    label: "Not Selected",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    dot: "bg-red-400",
    desc: "Your application was not selected in this round. You're welcome to reapply.",
  },
};

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [releases, setReleases] = useState<Release[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setSearched(false);

    const { data } = await supabase
      .from("releases")
      .select("id,song_title,release_type,genre,release_date,status,admin_notes,created_at,cover_art_url")
      .eq("email", email.trim().toLowerCase())
      .order("created_at", { ascending: false });

    setReleases(data ?? []);
    setSearched(true);
    setLoading(false);
    setExpanded(null);
  }

  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#007bff]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto">
          <p className="text-[#007bff] text-sm font-semibold uppercase tracking-widest mb-4">
            Application Status
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Track Your Application.
          </h1>
          <p className="text-white/50 leading-relaxed">
            Enter the email address you used when submitting your application to
            see the current status of your release.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="px-4 pb-12">
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="flex-1 bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-5 py-4 rounded-full transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold px-6 py-4 rounded-full transition-colors flex items-center gap-2 flex-shrink-0"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </form>
        </div>
      </section>

      {/* Results */}
      {searched && (
        <section className="px-4 pb-24">
          <div className="max-w-2xl mx-auto">
            {releases.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-white/[0.04] rounded-full flex items-center justify-center mx-auto mb-5">
                  <Music2 size={28} className="text-white/20" />
                </div>
                <p className="text-white/50 font-medium">No applications found.</p>
                <p className="text-white/30 text-sm mt-2">
                  Double-check your email or{" "}
                  <a href="/submit" className="text-[#007bff] hover:underline">
                    submit an application
                  </a>
                  .
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-white/30 text-sm mb-6">
                  {releases.length} application{releases.length !== 1 ? "s" : ""} found for{" "}
                  <span className="text-white/60">{email}</span>
                </p>

                {releases.map((r) => {
                  const cfg = statusConfig[r.status] ?? statusConfig.pending;
                  const Icon = cfg.icon;
                  const isOpen = expanded === r.id;

                  return (
                    <div
                      key={r.id}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden"
                    >
                      {/* Card header */}
                      <button
                        onClick={() => setExpanded(isOpen ? null : r.id)}
                        className="w-full flex items-center gap-5 p-6 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Cover art placeholder */}
                        <div className="w-14 h-14 bg-gradient-to-br from-[#007bff]/20 to-black rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {r.cover_art_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Music2 size={22} className="text-[#007bff]/50" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{r.song_title}</p>
                          <p className="text-white/40 text-xs mt-0.5">
                            {r.release_type} · {r.genre}
                          </p>
                        </div>

                        {/* Status badge */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.color} flex-shrink-0`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </div>

                        {isOpen ? (
                          <ChevronUp size={16} className="text-white/30 flex-shrink-0" />
                        ) : (
                          <ChevronDown size={16} className="text-white/30 flex-shrink-0" />
                        )}
                      </button>

                      {/* Expanded details */}
                      {isOpen && (
                        <div className="border-t border-white/[0.06] px-6 py-5 space-y-5">
                          {/* Status message */}
                          <div className={`flex items-start gap-3 px-4 py-4 rounded-xl border ${cfg.bg}`}>
                            <Icon size={18} className={`${cfg.color} flex-shrink-0 mt-0.5`} />
                            <div>
                              <p className={`text-sm font-semibold ${cfg.color} mb-1`}>{cfg.label}</p>
                              <p className="text-white/50 text-sm leading-relaxed">{cfg.desc}</p>
                            </div>
                          </div>

                          {/* Admin note */}
                          {r.admin_notes && (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-4">
                              <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
                                Note from Orinlabí
                              </p>
                              <p className="text-white/70 text-sm leading-relaxed">{r.admin_notes}</p>
                            </div>
                          )}

                          {/* Meta */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-white/40 text-xs">
                              <Calendar size={13} />
                              Desired release: {r.release_date
                                ? new Date(r.release_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                                : "—"}
                            </div>
                            <div className="flex items-center gap-2 text-white/40 text-xs">
                              <Globe size={13} />
                              Submitted: {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                          </div>

                          {/* Next steps */}
                          {r.status === "approved" && (
                            <div className="bg-green-400/5 border border-green-400/15 rounded-xl px-4 py-4">
                              <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-2">
                                What Happens Next
                              </p>
                              <ul className="text-white/50 text-sm space-y-1 leading-relaxed">
                                <li>• Our team will reach out to finalize delivery details.</li>
                                <li>• Your release will go live on 150+ platforms within 24–48 hours of delivery.</li>
                                <li>• You&apos;ll receive a confirmation with your store links once live.</li>
                              </ul>
                            </div>
                          )}
                          {r.status === "rejected" && (
                            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-4">
                              <p className="text-white/30 text-xs uppercase tracking-widest mb-2">
                                What You Can Do
                              </p>
                              <ul className="text-white/50 text-sm space-y-1 leading-relaxed">
                                <li>• Keep creating — your next release may be the one.</li>
                                <li>• Reapply at any time. Applications are always open.</li>
                                <li>• Contact us if you have questions about this decision.</li>
                              </ul>
                            </div>
                          )}
                          {r.status === "pending" && (
                            <div className="bg-yellow-400/5 border border-yellow-400/15 rounded-xl px-4 py-4">
                              <p className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-2">
                                What to Expect
                              </p>
                              <ul className="text-white/50 text-sm space-y-1 leading-relaxed">
                                <li>• We review every application carefully — this takes time.</li>
                                <li>• You will receive an email at <strong className="text-white/70">{email}</strong> with our decision.</li>
                                <li>• Typical response time: 3–5 business days.</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Help footer */}
      <section className="py-16 px-4 border-t border-white/[0.06]">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-white/30 text-sm">
            Haven&apos;t applied yet?{" "}
            <a href="/submit" className="text-[#007bff] hover:underline">
              Submit your application
            </a>
            . Questions?{" "}
            <a href="/contact" className="text-[#007bff] hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
