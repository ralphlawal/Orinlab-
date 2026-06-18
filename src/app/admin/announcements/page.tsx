"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import { Loader2, Plus, Trash2, Megaphone, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  type: "info" | "warning" | "success";
  active: boolean;
  created_at: string;
};

const TYPE_META = {
  info:    { label: "Info",    icon: <Info size={14} />,          color: "#007bff",  bg: "bg-[#007bff]/10  border-[#007bff]/20"  },
  warning: { label: "Warning", icon: <AlertTriangle size={14} />, color: "#f59e0b",  bg: "bg-amber-500/10   border-amber-500/20"  },
  success: { label: "Success", icon: <CheckCircle2 size={14} />,  color: "#16a34a",  bg: "bg-green-500/10   border-green-500/20"  },
};

export default function AnnouncementsPage() {
  const { requestUnlock } = usePinGate();
  const [items, setItems]           = useState<Announcement[]>([]);
  const [loading, setLoading]       = useState(true);
  const [title, setTitle]           = useState("");
  const [body, setBody]             = useState("");
  const [type, setType]             = useState<"info" | "warning" | "success">("info");
  const [saving, setSaving]         = useState(false);
  const [showForm, setShowForm]     = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Announcement[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    await supabase.from("announcements").insert({ title: title.trim(), body: body.trim(), type, active: true });
    setTitle(""); setBody(""); setType("info"); setShowForm(false);
    setSaving(false);
    load();
  }

  async function toggle(item: Announcement) {
    await supabase.from("announcements").update({ active: !item.active }).eq("id", item.id);
    load();
  }

  async function remove(id: string) {
    await supabase.from("announcements").delete().eq("id", id);
    load();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Announcements</h1>
          <p className="text-white/40 text-sm mt-1">Post platform-wide messages visible to all artists in the portal.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} /> New
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <p className="text-white font-semibold text-sm flex items-center gap-2"><Megaphone size={15} /> New Announcement</p>

          <div>
            <label className="text-white/40 text-xs uppercase tracking-widest block mb-1.5">Title</label>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Platform maintenance on Saturday"
              className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-2.5 rounded-xl transition-colors"
            />
          </div>

          <div>
            <label className="text-white/40 text-xs uppercase tracking-widest block mb-1.5">Message</label>
            <textarea
              value={body} onChange={(e) => setBody(e.target.value)} rows={3}
              placeholder="What should artists know?"
              className="w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-2.5 rounded-xl transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-white/40 text-xs uppercase tracking-widest">Type</label>
            <div className="flex gap-2">
              {(["info", "warning", "success"] as const).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors capitalize ${
                    type === t ? "border-[#007bff] text-[#007bff] bg-[#007bff]/10" : "border-white/10 text-white/40 hover:text-white"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => requestUnlock(create)} disabled={saving || !title.trim() || !body.trim()}
              className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
            >
              {saving && <Loader2 size={13} className="animate-spin" />} Publish
            </button>
            <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-sm px-4 py-2 rounded-xl transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={24} className="text-[#007bff] animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-white/30">No announcements yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const meta = TYPE_META[item.type] ?? TYPE_META.info;
            return (
              <div key={item.id} className={`border rounded-2xl p-5 transition-opacity ${item.active ? "opacity-100" : "opacity-40"} ${meta.bg}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: meta.color }}>{meta.icon}</span>
                      <p className="text-white font-semibold text-sm">{item.title}</p>
                      {!item.active && <span className="text-white/30 text-xs">(hidden)</span>}
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{item.body}</p>
                    <p className="text-white/25 text-xs mt-2">
                      {new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => requestUnlock(() => toggle(item))}
                      className="text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1 rounded-lg transition-colors">
                      {item.active ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => requestUnlock(() => remove(item.id))}
                      className="text-red-400/60 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
