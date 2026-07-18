"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Loader2, LifeBuoy, CheckCircle2, Clock, ChevronDown, ChevronUp,
  MessageCircle, Send, ShieldAlert,
} from "lucide-react";

type Ticket = {
  id: string;
  email: string;
  artist_name: string;
  subject: string;
  category: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  admin_response: string | null;
  created_at: string;
};

const STATUS_STYLES = {
  open:        { label: "Open",        color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  in_progress: { label: "In Progress", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20"     },
  closed:      { label: "Closed",      color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20"   },
};

export default function SupportAdminPage() {
  const { requestUnlock } = usePinGate();
  const [tickets, setTickets]   = useState<Ticket[]>([]);
  const [loading, setLoading]   = useState(true);
  const [rlsBlocked, setRlsBlocked] = useState(false);
  const [filter, setFilter]     = useState<"all" | "open" | "in_progress" | "closed">("open");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [statuses, setStatuses]   = useState<Record<string, Ticket["status"]>>({});
  const [saving, setSaving]       = useState<string | null>(null);

  async function load() {
    setLoading(true);
    let q = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) console.error("support_tickets:", error.message);
    const rows = (data ?? []) as Ticket[];
    setTickets(rows);
    // Detect RLS block: no data returned but filter is "all" — likely policy missing
    if (!error && rows.length === 0 && filter === "all") {
      // Double-check: try counting without filter
      const { count } = await supabase.from("support_tickets").select("*", { count: "exact", head: true });
      setRlsBlocked(count === 0 || count === null);
    } else {
      setRlsBlocked(false);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveResponse(ticket: Ticket) {
    const response = responses[ticket.id]?.trim() ?? "";
    const newStatus = statuses[ticket.id] ?? ticket.status;
    setSaving(ticket.id);
    await supabase.from("support_tickets").update({
      admin_response: response || null,
      status: newStatus,
    }).eq("id", ticket.id);

    // In-app notification to artist
    await supabase.from("notifications").insert({
      email: ticket.email,
      type: newStatus === "closed" ? "success" : "info",
      title: `Support ticket: "${ticket.subject}"`,
      body: response || `Your support ticket status has been updated to ${newStatus.replace("_", " ")}.`,
      link: "/portal/support",
    });

    // Email artist via notify
    if (response) {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "admin-message",
          data: { email: ticket.email, content: `Re: ${ticket.subject}\n\n${response}` },
        }),
      }).catch(() => {});
    }

    setSaving(null);
    load();
  }

  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <LifeBuoy size={22} /> Support Tickets
          </h1>
          <p className="text-white/40 text-sm mt-1">{openCount} open ticket{openCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-xl">
          {(["open", "in_progress", "closed", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors whitespace-nowrap ${
                filter === f ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* RLS warning — shown when tickets exist in DB but admin can't read them */}
      {!loading && rlsBlocked && (
        <div className="bg-amber-500/10 border border-amber-400/25 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <ShieldAlert size={16} />
            Supabase RLS is blocking ticket reads
          </div>
          <p className="text-white/50 text-xs leading-relaxed">
            The <code className="text-white/70 bg-white/[0.06] px-1 py-0.5 rounded">support_tickets</code> table has a Row Level Security policy that only lets artists read their own tickets. Run the SQL below in your <strong className="text-white/70">Supabase Dashboard → SQL Editor</strong> to fix it:
          </p>
          <pre className="bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-[11px] text-green-300 overflow-x-auto whitespace-pre-wrap">{`-- Allow authenticated users to read all support tickets
-- (Artists are restricted by .eq("email", ...) in the portal code)
CREATE POLICY "admin_read_all_support_tickets"
ON support_tickets
FOR SELECT
TO authenticated
USING (true);`}</pre>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 size={28} className="text-[#007bff] animate-spin" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 text-white/30">No {filter !== "all" ? filter.replace("_", " ") : ""} tickets.</div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const st = STATUS_STYLES[t.status] ?? STATUS_STYLES.open;
            const isOpen = expanded === t.id;
            const currentStatus = statuses[t.id] ?? t.status;
            return (
              <div key={t.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpanded(isOpen ? null : t.id)}
                >
                  <MessageCircle size={16} className="text-white/20 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{t.subject}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${st.bg} ${st.color}`}>{st.label}</span>
                    </div>
                    <p className="text-white/30 text-xs mt-0.5">{t.artist_name} · {t.email} · {t.category}</p>
                  </div>
                  <p className="text-white/25 text-xs flex-shrink-0 hidden sm:block">
                    {new Date(t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  {isOpen ? <ChevronUp size={16} className="text-white/30 flex-shrink-0" /> : <ChevronDown size={16} className="text-white/30 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-white/[0.06] px-5 py-5 space-y-4">
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Artist message</p>
                      <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{t.description}</p>
                    </div>

                    {t.admin_response && (
                      <div className="bg-[#007bff]/8 border border-[#007bff]/20 rounded-xl px-4 py-3">
                        <p className="text-[#007bff] text-xs font-semibold mb-1">Previous response</p>
                        <p className="text-white/60 text-xs whitespace-pre-wrap">{t.admin_response}</p>
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <span className="text-white/30 text-xs">Status</span>
                      <div className="flex gap-1">
                        {(["open", "in_progress", "closed"] as const).map((s) => (
                          <button key={s} onClick={() => setStatuses((prev) => ({ ...prev, [t.id]: s }))}
                            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors capitalize ${
                              currentStatus === s
                                ? STATUS_STYLES[s].bg + " " + STATUS_STYLES[s].color
                                : "border-white/[0.08] text-white/30 hover:text-white"
                            }`}
                          >
                            {s.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Response */}
                    <textarea
                      value={responses[t.id] ?? ""}
                      onChange={(e) => setResponses((r) => ({ ...r, [t.id]: e.target.value }))}
                      rows={4}
                      placeholder="Type your response to the artist… (leave blank to just update status)"
                      className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white/70 placeholder-white/20 text-xs px-3 py-2.5 rounded-xl resize-none transition-colors"
                    />

                    <button
                      onClick={() => requestUnlock(() => saveResponse(t))}
                      disabled={saving === t.id}
                      className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors"
                    >
                      {saving === t.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : responses[t.id]?.trim() ? <Send size={13} /> : <Clock size={13} />}
                      {responses[t.id]?.trim() ? "Send Response" : "Update Status"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
