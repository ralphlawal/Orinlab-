"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft, ChevronRight, Music2, Clock, CheckCircle2, XCircle,
  CalendarDays, RotateCcw,
} from "lucide-react";

type Release = {
  id: string;
  song_title: string;
  release_date: string;
  status: "pending" | "approved" | "rejected" | "revision_requested";
  cover_art_url: string | null;
  release_type: string;
  genre: string;
  distribution_stage: string | null;
};

const STATUS: Record<string, { color: string; label: string; Icon: typeof Clock; dot: string }> = {
  pending:            { color: "#F59E0B", label: "Pending Review",   Icon: Clock,          dot: "bg-yellow-400" },
  approved:           { color: "#10B981", label: "Approved",         Icon: CheckCircle2,   dot: "bg-emerald-400" },
  rejected:           { color: "#F43F5E", label: "Not Selected",     Icon: XCircle,        dot: "bg-rose-400" },
  revision_requested: { color: "#F59E0B", label: "Revision Needed",  Icon: RotateCcw,      dot: "bg-yellow-400" },
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function CalendarPage() {
  const router = useRouter();
  const [releases, setReleases]   = useState<Release[]>([]);
  const [loading, setLoading]     = useState(true);
  const today                     = new Date();
  const [viewDate, setViewDate]   = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected]   = useState<Release[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push("/portal/login"); return; }
      const { data: rel } = await supabase
        .from("releases")
        .select("id, song_title, release_date, status, cover_art_url, release_type, genre, distribution_stage")
        .eq("email", data.session.user.email!)
        .not("release_date", "is", null)
        .order("release_date", { ascending: true });
      setReleases((rel ?? []) as Release[]);
      setLoading(false);
    });
  }, [router]);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const byDate = useMemo(() => {
    const map: Record<string, Release[]> = {};
    for (const r of releases) {
      const d = r.release_date?.slice(0, 10);
      if (!d) continue;
      (map[d] ??= []).push(r);
    }
    return map;
  }, [releases]);

  const todayStr = today.toISOString().slice(0, 10);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function dateStr(day: number) {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
  }

  const monthReleases = releases.filter((r) =>
    r.release_date?.startsWith(`${year}-${pad(month + 1)}`)
  );

  const stats = (["pending", "approved", "rejected"] as const).map((s) => ({
    status: s,
    count:  releases.filter((r) => r.status === s).length,
  }));

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="h-8 w-48 rounded-xl bg-white/[0.06] animate-pulse" />
        <div className="h-96 rounded-2xl bg-white/[0.04] animate-pulse" />
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl flex items-center gap-2">
          <CalendarDays size={22} className="text-[#60a5fa]" />
          Release Calendar
        </h1>
        <p className="text-white/40 text-sm mt-1">All your scheduled release dates at a glance.</p>
      </div>

      {/* Stat chips */}
      {releases.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {stats.map(({ status, count }) => {
            const cfg = STATUS[status];
            return count > 0 ? (
              <div key={status} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold"
                style={{ borderColor: `${cfg.color}30`, color: cfg.color, background: `${cfg.color}10` }}>
                <cfg.Icon size={12} />
                {count} {cfg.label}
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Calendar card */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden mb-6">
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <button
            onClick={() => { setSelected([]); setViewDate(new Date(year, month - 1, 1)); }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-white font-bold text-base">{MONTHS[month]} {year}</h2>
            {(year !== today.getFullYear() || month !== today.getMonth()) && (
              <button
                onClick={() => { setSelected([]); setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); }}
                className="text-[10px] font-semibold text-[#007bff] hover:text-white transition-colors px-2 py-0.5 rounded-full border border-[#007bff]/30 hover:border-white/30"
              >
                Today
              </button>
            )}
          </div>
          <button
            onClick={() => { setSelected([]); setViewDate(new Date(year, month + 1, 1)); }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 border-b border-white/[0.04]">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-white/20 text-[10px] font-bold uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`e-${idx}`} className="h-[72px] border-b border-r border-white/[0.03]" />;
            }
            const ds         = dateStr(day);
            const dayRels    = byDate[ds] ?? [];
            const isToday    = ds === todayStr;
            const isPast     = ds < todayStr;
            const isSelected = selected.length > 0 && selected[0]?.release_date?.slice(0, 10) === ds;

            return (
              <div
                key={ds}
                onClick={() => {
                  if (dayRels.length > 0) {
                    setSelected(isSelected ? [] : dayRels);
                  }
                }}
                className={`h-[72px] border-b border-r border-white/[0.03] p-2 flex flex-col transition-colors ${
                  dayRels.length > 0 ? "cursor-pointer hover:bg-white/[0.04]" : ""
                } ${isSelected ? "bg-[#007bff]/[0.07] border-[#007bff]/20" : ""}`}
              >
                <span
                  className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 flex-shrink-0 ${
                    isToday
                      ? "bg-[#007bff] text-white"
                      : isPast
                      ? "text-white/20"
                      : "text-white/50"
                  }`}
                >
                  {day}
                </span>
                <div className="space-y-0.5 flex-1 overflow-hidden">
                  {dayRels.slice(0, 2).map((r) => {
                    const cfg = STATUS[r.status] ?? STATUS.pending;
                    return (
                      <div key={r.id} className="flex items-center gap-1 overflow-hidden">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                        <span className="text-[9px] text-white/55 truncate leading-tight">{r.song_title}</span>
                      </div>
                    );
                  })}
                  {dayRels.length > 2 && (
                    <span className="text-[9px] text-white/25">+{dayRels.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selected.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">
              {new Date(selected[0].release_date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <button onClick={() => setSelected([])} className="text-white/25 hover:text-white text-xs transition-colors">✕</button>
          </div>
          {selected.map((r) => {
            const cfg  = STATUS[r.status] ?? STATUS.pending;
            const Icon = cfg.Icon;
            return (
              <Link key={r.id} href={`/portal/releases/${r.id}`}
                className="flex items-center gap-4 bg-white/[0.05] border border-white/[0.10] rounded-2xl p-4 hover:bg-white/[0.08] transition-colors">
                <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden bg-white/[0.06] flex items-center justify-center">
                  {r.cover_art_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                    : <Music2 size={20} className="text-white/20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{r.song_title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{r.release_type} · {r.genre}</p>
                  {r.distribution_stage && (
                    <p className="text-[10px] mt-1" style={{ color: r.distribution_stage === "live" ? "#10B981" : "#60a5fa" }}>
                      {r.distribution_stage === "live" ? "Live on all platforms" : "In distribution"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0" style={{ color: cfg.color }}>
                  <Icon size={14} />
                  <span className="text-xs font-semibold">{cfg.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* This month's releases list */}
      {monthReleases.length > 0 ? (
        <div>
          <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">
            {MONTHS[month]} — {monthReleases.length} {monthReleases.length === 1 ? "Release" : "Releases"}
          </p>
          <div className="space-y-2">
            {monthReleases.map((r) => {
              const cfg  = STATUS[r.status] ?? STATUS.pending;
              const Icon = cfg.Icon;
              return (
                <Link key={r.id} href={`/portal/releases/${r.id}`}
                  className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] rounded-xl p-3.5 hover:bg-white/[0.06] transition-colors">
                  <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden bg-white/[0.05] flex items-center justify-center">
                    {r.cover_art_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={r.cover_art_url} alt="" className="w-full h-full object-cover" />
                      : <Music2 size={14} className="text-white/20" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/85 font-medium text-sm truncate">{r.song_title}</p>
                    <p className="text-white/30 text-xs">{r.release_type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white/45 text-xs tabular-nums">
                      {new Date(r.release_date + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5" style={{ color: cfg.color }}>
                      <Icon size={10} />
                      <span className="text-[10px] font-semibold">{cfg.label}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-14 text-white/25">
          <CalendarDays size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No releases scheduled in {MONTHS[month]}.</p>
          <Link href="/portal/releases/new"
            className="text-[#007bff] text-xs mt-2.5 inline-block hover:underline">
            + Submit a new release
          </Link>
        </div>
      )}
    </section>
  );
}
