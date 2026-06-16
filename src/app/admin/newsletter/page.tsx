"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Download, UserCheck, UserX, Send, CheckCircle2 } from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  subscribed_at: string;
  active: boolean;
};

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);
  const [sendError, setSendError] = useState("");

  async function load() {
    setLoading(true);
    let query = supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });
    if (filter === "active") query = query.eq("active", true);
    if (filter === "inactive") query = query.eq("active", false);
    const { data } = await query;
    setSubscribers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleActive(id: string, current: boolean) {
    await supabase
      .from("newsletter_subscribers")
      .update({ active: !current })
      .eq("id", id);
    load();
  }

  function exportCSV() {
    const rows = [
      ["Email", "Subscribed At", "Active"],
      ...subscribers.map((s) => [
        s.email,
        new Date(s.subscribed_at).toLocaleDateString("en-GB"),
        s.active ? "Yes" : "No",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orinlabi-subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeCount = subscribers.filter((s) => s.active).length;

  async function sendCampaign() {
    if (!subject.trim() || !body.trim()) {
      setSendError("Subject and message body are required.");
      return;
    }
    setSendError("");
    setSending(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const json = await res.json();
      if (!res.ok) { setSendError(json.error ?? "Send failed."); setSending(false); return; }
      setSendResult(json);
      setSubject("");
      setBody("");
      setShowCompose(false);
    } catch {
      setSendError("Something went wrong. Try again.");
    }
    setSending(false);
  }

  const inp = "w-full bg-[#0e0e0e] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-3 rounded-xl transition-colors";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl">Newsletter</h1>
          <p className="text-white/40 text-sm mt-1">
            {activeCount} active subscriber{activeCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-xl">
            {(["active", "inactive", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  filter === f ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={exportCSV}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/30 disabled:opacity-30 px-3 py-2.5 rounded-xl transition-colors"
          >
            <Download size={13} /> Export CSV
          </button>

          {/* Send campaign */}
          <button
            onClick={() => { setShowCompose((v) => !v); setSendResult(null); setSendError(""); }}
            className="flex items-center gap-2 text-xs font-semibold bg-[#007bff] hover:bg-[#0069d9] text-white px-4 py-2.5 rounded-xl transition-colors"
          >
            <Send size={13} /> Send Campaign
          </button>
        </div>
      </div>

      {/* Compose panel */}
      {showCompose && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold text-sm">Compose Campaign</h3>
          <p className="text-white/30 text-xs">
            Will be sent to <strong className="text-white/60">{activeCount}</strong> active subscriber{activeCount !== 1 ? "s" : ""}. Write in plain text — use double line breaks for paragraphs.
          </p>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line…"
            className={inp}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="Email body…&#10;&#10;Use double line breaks for new paragraphs."
            className={inp + " resize-none"}
          />
          {sendError && <p className="text-red-400 text-xs">{sendError}</p>}
          <button
            onClick={sendCampaign}
            disabled={sending || activeCount === 0}
            className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {sending ? "Sending…" : `Send to ${activeCount} subscriber${activeCount !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {sendResult && (
        <div className="flex items-center gap-3 bg-green-400/10 border border-green-400/20 rounded-2xl px-5 py-4">
          <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm font-medium">
            Campaign sent: {sendResult.sent} delivered
            {sendResult.failed > 0 && `, ${sendResult.failed} failed`}.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-[#007bff] animate-spin" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          No {filter !== "all" ? filter : ""} subscribers yet.
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 text-white/30 text-xs uppercase tracking-widest font-medium">
                  Email
                </th>
                <th className="text-left px-5 py-3.5 text-white/30 text-xs uppercase tracking-widest font-medium hidden sm:table-cell">
                  Subscribed
                </th>
                <th className="text-left px-5 py-3.5 text-white/30 text-xs uppercase tracking-widest font-medium">
                  Status
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-white/[0.04] last:border-0 ${
                    i % 2 === 0 ? "" : "bg-white/[0.01]"
                  }`}
                >
                  <td className="px-5 py-4 text-white/80 text-sm font-medium">
                    {s.email}
                  </td>
                  <td className="px-5 py-4 text-white/30 text-xs hidden sm:table-cell">
                    {new Date(s.subscribed_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      s.active
                        ? "bg-green-400/10 text-green-400"
                        : "bg-white/5 text-white/30"
                    }`}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => toggleActive(s.id, s.active)}
                      className="text-white/30 hover:text-white transition-colors"
                      title={s.active ? "Deactivate" : "Reactivate"}
                    >
                      {s.active ? <UserX size={15} /> : <UserCheck size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
