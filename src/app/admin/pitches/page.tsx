"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import { Loader2, Radio, ChevronDown } from "lucide-react";

type Pitch = {
  id: string;
  email: string;
  artist_name: string;
  song_title: string;
  genre: string | null;
  mood: string | null;
  pitch_notes: string | null;
  status: "pending" | "submitted" | "placed" | "declined";
  admin_notes: string | null;
  created_at: string;
};

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  submitted: { label: "Submitted", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20"   },
  placed:    { label: "Placed ✓",  color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20"  },
  declined:  { label: "Declined",  color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20"      },
};

export default function PitchesPage() {
  const { requestUnlock } = usePinGate();
  const [pitches, setPitches]       = useState<Pitch[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<Pitch | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus]         = useState<Pitch["status"]>("pending");
  const [saving, setSaving]         = useState(false);
  const [filter, setFilter]         = useState<"all" | Pitch["status"]>("all");

  async function load() {
    setLoading(true);
    let q = supabase.from("playlist_pitches").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setPitches((data ?? []) as Pitch[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  function open(p: Pitch) {
    setSelected(p);
    setAdminNotes(p.admin_notes ?? "");
    setStatus(p.status);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    await supabase.from("playlist_pitches").update({ status, admin_notes: adminNotes }).eq("id", selected.id);
    setSaving(false);
    setSelected(null);
    load();
  }

  const filtered = pitches;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Playlist Pitches</h1>
          <p className="text-white/40 text-sm mt-1">Review artist playlist pitch submissions.</p>
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "submitted", "placed", "declined"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filter === f ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white bg-white/[0.04]"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 size={26} className="text-[#007bff] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">No pitches found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const cfg = STATUS_CONFIG[p.status];
            return (
              <div key={p.id}
                onClick={() => open(p)}
                className="bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 cursor-pointer transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#007bff]/10 flex items-center justify-center flex-shrink-0">
                    <Radio size={16} className="text-[#007bff]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{p.song_title}</p>
                    <p className="text-white/40 text-xs">{p.artist_name} · {p.genre ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <ChevronDown size={14} className="text-white/20 -rotate-90" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-white/[0.06]">
              <p className="text-white font-bold">{selected.song_title}</p>
              <p className="text-white/40 text-sm">{selected.artist_name} · {selected.email}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selected.genre  && <div><p className="text-white/30 text-xs mb-0.5">Genre</p><p className="text-white/80">{selected.genre}</p></div>}
                {selected.mood   && <div><p className="text-white/30 text-xs mb-0.5">Mood</p><p className="text-white/80">{selected.mood}</p></div>}
              </div>
              {selected.pitch_notes && (
                <div>
                  <p className="text-white/30 text-xs mb-1 uppercase tracking-widest">Pitch Notes</p>
                  <p className="text-white/70 text-sm leading-relaxed bg-white/[0.03] rounded-xl p-3">{selected.pitch_notes}</p>
                </div>
              )}
              <div>
                <label className="text-white/30 text-xs uppercase tracking-widest block mb-1.5">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as Pitch["status"])}
                  className="w-full bg-white/[0.05] border border-white/[0.10] outline-none text-white text-sm px-3 py-2 rounded-xl">
                  {(["pending", "submitted", "placed", "declined"] as const).map((s) => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/30 text-xs uppercase tracking-widest block mb-1.5">Admin Notes</label>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3}
                  placeholder="e.g. Submitted to AfroBeats Weekly — awaiting response"
                  className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-3 py-2.5 rounded-xl resize-none transition-colors"
                />
              </div>
            </div>
            <div className="p-5 border-t border-white/[0.06] flex gap-3">
              <button onClick={() => requestUnlock(save)} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                {saving && <Loader2 size={13} className="animate-spin" />} Save
              </button>
              <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-sm px-5 py-2.5 border border-white/10 rounded-xl transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
