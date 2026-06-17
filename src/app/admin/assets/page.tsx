"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Loader2, CheckCircle2, Clock, X, ChevronDown,
  ExternalLink, Save,
} from "lucide-react";

const ASSET_TYPES: { id: string; label: string }[] = [
  { id: "cover_art",       label: "Cover Art" },
  { id: "back_cover",      label: "Back Cover" },
  { id: "press_photo",     label: "Press Photo" },
  { id: "artist_bio",      label: "Artist Bio (Written)" },
  { id: "epk",             label: "Electronic Press Kit" },
  { id: "instagram_post",  label: "Instagram Post" },
  { id: "instagram_story", label: "Instagram Story" },
  { id: "x_graphic",       label: "X / Twitter Graphic" },
  { id: "x_header",        label: "X / Twitter Header" },
  { id: "youtube_thumb",   label: "YouTube Thumbnail" },
  { id: "yt_fb_banner",    label: "YouTube / Facebook Banner" },
  { id: "promo_flyer",     label: "Digital Promo Flyer" },
  { id: "lyric_video_bg",  label: "Lyric Video Background" },
];

type AssetRequest = {
  id: string;
  email: string;
  release_id: string | null;
  release_title: string | null;
  asset_types: string[];
  vision: string | null;
  color_preferences: string | null;
  reference_urls: string | null;
  status: "pending" | "in_progress" | "completed";
  admin_notes: string | null;
  delivered_assets: Record<string, string> | null;
  created_at: string;
  updated_at: string;
};

const statusCfg = {
  pending:     { label: "Pending",     color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  in_progress: { label: "In Progress", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20" },
  completed:   { label: "Completed",   color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20" },
};

const FILTERS = ["all", "pending", "in_progress", "completed"] as const;
type Filter = typeof FILTERS[number];

const inp = "w-full bg-[#0e0e0e] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-3 py-2.5 rounded-xl transition-colors";

function labelFor(id: string) {
  return ASSET_TYPES.find((t) => t.id === id)?.label ?? id;
}

export default function AdminAssetsPage() {
  const { requestUnlock } = usePinGate();
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<AssetRequest | null>(null);

  // Modal form state
  const [status, setStatus] = useState<AssetRequest["status"]>("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [delivered, setDelivered] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("asset_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRequests((data ?? []) as AssetRequest[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function open(req: AssetRequest) {
    setSelected(req);
    setStatus(req.status);
    setAdminNotes(req.admin_notes ?? "");
    setDelivered(req.delivered_assets ?? {});
    setSaveOk(false);
  }

  function close() {
    setSelected(null);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    const wasCompleted = selected.status === "completed";
    await supabase.from("asset_requests").update({
      status,
      admin_notes: adminNotes || null,
      delivered_assets: Object.keys(delivered).length ? delivered : null,
      updated_at: new Date().toISOString(),
    }).eq("id", selected.id);

    // Email artist the first time their request is marked completed
    if (status === "completed" && !wasCompleted) {
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "asset-completed",
          data: {
            email: selected.email,
            asset_types: selected.asset_types,
            delivered_assets: Object.keys(delivered).length ? delivered : null,
          },
        }),
      }).catch(() => {});
    }

    setSaving(false);
    setSaveOk(true);
    setSelected((s) => s ? { ...s, status, admin_notes: adminNotes || null, delivered_assets: Object.keys(delivered).length ? delivered : null } : s);
    await load();
    setTimeout(() => setSaveOk(false), 3000);
  }

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-[#007bff] text-white"
                : "bg-white/[0.05] text-white/50 hover:text-white"
            }`}
          >
            {f.replace("_", " ")} · {counts[f]}
          </button>
        ))}
      </div>

      {/* Request list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30 text-sm">No requests here.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const cfg = statusCfg[req.status] ?? statusCfg.pending;
            const types = (req.asset_types ?? []).map(labelFor);
            return (
              <button
                key={req.id}
                onClick={() => open(req)}
                className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-white font-semibold text-sm truncate">{req.email}</p>
                    <p className="text-white/50 text-xs">
                      {types.slice(0, 3).join(" · ")}
                      {types.length > 3 && ` +${types.length - 3} more`}
                    </p>
                    {req.release_title && (
                      <p className="text-white/30 text-xs">Release: {req.release_title}</p>
                    )}
                    <p className="text-white/20 text-xs">
                      {new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={close}>
          <div
            className="w-full max-w-xl bg-[#0a0a0a] border border-white/[0.08] rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div>
                <p className="text-white font-semibold text-sm">{selected.email}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {new Date(selected.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <button onClick={close} className="text-white/30 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
              {/* Requested assets */}
              <div>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Requested Assets</p>
                <div className="flex flex-wrap gap-2">
                  {(selected.asset_types ?? []).map((id) => (
                    <span key={id} className="bg-white/[0.06] border border-white/[0.1] text-white/70 text-xs px-3 py-1.5 rounded-full">
                      {labelFor(id)}
                    </span>
                  ))}
                </div>
              </div>

              {selected.release_title && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Release</p>
                  <p className="text-white/70 text-sm">{selected.release_title}</p>
                </div>
              )}

              {selected.vision && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Vision</p>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{selected.vision}</p>
                </div>
              )}

              {selected.color_preferences && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Colour Preferences</p>
                  <p className="text-white/70 text-sm">{selected.color_preferences}</p>
                </div>
              )}

              {selected.reference_urls && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-1">References</p>
                  <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap break-all">{selected.reference_urls}</p>
                </div>
              )}

              {/* Status */}
              <div>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Status</p>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AssetRequest["status"])}
                    className={inp + " appearance-none pr-8 bg-[#0e0e0e]"}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
              </div>

              {/* Admin notes */}
              <div>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Note to Artist</p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Working on your cover art, ETA 3 days. We'll update you here."
                  className={inp + " resize-none"}
                />
              </div>

              {/* Delivered assets */}
              <div>
                <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Delivered Assets</p>
                <p className="text-white/25 text-xs mb-3">Paste a download/view link for each completed asset. The artist will see these as clickable buttons.</p>
                <div className="space-y-2.5">
                  {(selected.asset_types ?? []).map((id) => (
                    <div key={id} className="flex items-center gap-3">
                      <span className="text-white/40 text-xs w-36 flex-shrink-0">{labelFor(id)}</span>
                      <div className="relative flex-1">
                        <input
                          value={delivered[id] ?? ""}
                          onChange={(e) => setDelivered((d) => ({ ...d, [id]: e.target.value }))}
                          placeholder="https://drive.google.com/…"
                          className={inp + " pr-9"}
                        />
                        {delivered[id] && (
                          <a href={delivered[id]} target="_blank" rel="noopener noreferrer"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#007bff] transition-colors">
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-white/[0.06]">
              {saveOk && (
                <div className="flex items-center gap-2 text-green-400 text-xs mb-3">
                  <CheckCircle2 size={13} />
                  Saved successfully
                </div>
              )}
              <button
                onClick={() => requestUnlock(save)}
                disabled={saving}
                className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
