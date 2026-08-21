"use client";

import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import {
  Send, Clock, Plus, Inbox, ChevronDown, ChevronUp,
  Reply, Trash2, RefreshCw, Search, Forward, MailOpen,
  X, CheckCheck, AlertCircle,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

type ReceivedEmail = {
  id: string;
  message_id: string;
  from_address: string;
  to_address: string;
  subject: string;
  html_body: string | null;
  text_body: string | null;
  read_at: string | null;
  received_at: string;
};

type SentEmail = {
  id: string;
  to_address: string;
  cc_address: string | null;
  subject: string;
  body: string;
  sent_by: string;
  sent_at: string;
};

type ComposePrefill = {
  to?: string;
  subject?: string;
  body?: string;
  mode?: "reply" | "forward" | "new";
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3_600_000;
  if (diffH < 24 && d.getDate() === now.getDate())
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (diffH < 8760)
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function senderName(from: string) {
  const m = from.match(/^"?([^"<]+)"?\s*</);
  return m ? m[1].trim() : from.split("@")[0];
}

function senderEmail(from: string) {
  const m = from.match(/<([^>]+)>/);
  return m ? m[1] : from;
}

function quoteEmail(email: ReceivedEmail): string {
  const text = email.text_body ?? "(no plain text)";
  const lines = text.split("\n").map(l => `> ${l}`).join("\n");
  return `\n\n\n---\nOn ${new Date(email.received_at).toLocaleString("en-GB")}, ${email.from_address} wrote:\n${lines}`;
}

// ── Composer ──────────────────────────────────────────────────────────────────

function EmailComposer({
  prefill,
  adminEmail,
  onSent,
  onCancel,
}: {
  prefill?: ComposePrefill;
  adminEmail: string;
  onSent: (email: SentEmail) => void;
  onCancel?: () => void;
}) {
  const [to,      setTo]      = useState(prefill?.to ?? "");
  const [cc,      setCc]      = useState("");
  const [showCc,  setShowCc]  = useState(false);
  const [subject, setSubject] = useState(prefill?.subject ?? "");
  const [body,    setBody]    = useState(prefill?.body ?? "");
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState("");
  const [sent,    setSent]    = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (prefill?.body) setTimeout(() => bodyRef.current?.setSelectionRange(0, 0), 50);
  }, [prefill?.body]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
        body: JSON.stringify({ to, cc: cc || undefined, subject, body }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to send."); setSending(false); return; }
      setSent(true);
      onSent({ id: crypto.randomUUID(), to_address: to, cc_address: cc || null, subject, body, sent_by: adminEmail, sent_at: new Date().toISOString() });
      setTimeout(() => { setSent(false); setTo(""); setCc(""); setSubject(""); setBody(""); if (onCancel) onCancel(); }, 1800);
    } catch {
      setError("Network error."); setSending(false);
    }
  }

  const modeLabel = prefill?.mode === "reply" ? "Reply" : prefill?.mode === "forward" ? "Forward" : "New Email";

  return (
    <form onSubmit={handleSend} className="flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Mode label */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">{modeLabel}</span>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* To */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06]">
        <span className="text-white/30 text-xs w-14 shrink-0">To</span>
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com"
          required className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
        <button type="button" onClick={() => setShowCc(!showCc)}
          className="text-white/30 hover:text-white/60 text-xs transition-colors shrink-0">
          {showCc ? "−Cc" : "+Cc"}
        </button>
      </div>

      {/* Cc */}
      {showCc && (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06]">
          <span className="text-white/30 text-xs w-14 shrink-0">Cc</span>
          <input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="cc@example.com"
            className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
        </div>
      )}

      {/* Subject */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06]">
        <span className="text-white/30 text-xs w-14 shrink-0">Subject</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject"
          required className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
      </div>

      {/* Body */}
      <textarea
        ref={bodyRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={"Write your message…\n\nBlank lines become paragraphs."}
        required rows={12}
        className="w-full bg-transparent outline-none text-white text-sm placeholder-white/20 px-5 py-4 resize-none leading-relaxed font-mono"
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
        <p className="text-white/25 text-xs">From: info@orinlabi.com</p>
        <div className="flex items-center gap-3">
          {error && <p className="text-red-400 text-xs">{error}</p>}
          {sent  && <p className="text-green-400 text-xs flex items-center gap-1"><CheckCheck size={12} /> Sent!</p>}
          <button type="submit" disabled={sending || sent}
            className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0066d6] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
            {sending
              ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
              : sent ? <><CheckCheck size={14} /> Sent!</>
              : <><Send size={14} /> Send</>}
          </button>
        </div>
      </div>
    </form>
  );
}

// ── Inbox ─────────────────────────────────────────────────────────────────────

function InboxView({
  emails,
  loading,
  adminEmail,
  onRefresh,
  onCompose,
  onDeleted,
  onRead,
}: {
  emails: ReceivedEmail[];
  loading: boolean;
  adminEmail: string;
  onRefresh: () => void;
  onCompose: (p: ComposePrefill) => void;
  onDeleted: (id: string) => void;
  onRead: (id: string) => void;
}) {
  const [open,   setOpen]   = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = search.trim()
    ? emails.filter(e =>
        e.subject.toLowerCase().includes(search.toLowerCase()) ||
        e.from_address.toLowerCase().includes(search.toLowerCase())
      )
    : emails;

  async function markRead(email: ReceivedEmail) {
    if (email.read_at) return;
    await fetch("/api/admin/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
      body: JSON.stringify({ id: email.id, read: true }),
    });
    onRead(email.id);
  }

  async function deleteEmail(id: string) {
    setDeleting(id);
    await fetch("/api/admin/inbox", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
      body: JSON.stringify({ id }),
    });
    onDeleted(id);
    setDeleting(null);
    if (open === id) setOpen(null);
  }

  function toggle(email: ReceivedEmail) {
    if (open !== email.id) markRead(email);
    setOpen(open === email.id ? null : email.id);
  }

  if (loading) return <div className="text-center py-16 text-white/30 text-sm">Loading…</div>;

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inbox…"
          className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff]/50 text-white text-sm pl-9 pr-4 py-2.5 rounded-xl outline-none transition-colors placeholder-white/25" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <X size={13} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox size={32} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">
            {emails.length === 0 ? "Inbox empty — emails sent to info@orinlabi.com appear here." : "No emails match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((email) => {
            const isOpen = open === email.id;
            const unread = !email.read_at;
            return (
              <div key={email.id} className={`rounded-xl border transition-colors ${isOpen ? "border-white/[0.12] bg-white/[0.05]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                <button onClick={() => toggle(email)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${unread ? "bg-[#007bff]" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm truncate ${unread ? "text-white font-semibold" : "text-white/70"}`}>
                        {senderName(email.from_address)}
                      </span>
                      <span className="text-white/25 text-xs truncate hidden sm:inline">{senderEmail(email.from_address)}</span>
                    </div>
                    <p className={`text-xs truncate ${unread ? "text-white/70" : "text-white/40"}`}>{email.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-white/25 text-xs">{fmtDate(email.received_at)}</span>
                    {isOpen ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
                    {/* Email meta + actions */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="space-y-0.5">
                        <p className="text-white/40 text-xs">From: <span className="text-white/70">{email.from_address}</span></p>
                        <p className="text-white/40 text-xs">To: <span className="text-white/70">{email.to_address}</span></p>
                        <p className="text-white/30 text-xs">{new Date(email.received_at).toLocaleString("en-GB")}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Reply */}
                        <button
                          onClick={() => onCompose({
                            to: senderEmail(email.from_address),
                            subject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
                            body: quoteEmail(email),
                            mode: "reply",
                          })}
                          className="flex items-center gap-1.5 bg-[#007bff]/10 hover:bg-[#007bff]/20 border border-[#007bff]/30 text-[#007bff] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Reply size={12} /> Reply
                        </button>
                        {/* Forward */}
                        <button
                          onClick={() => onCompose({
                            subject: email.subject.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject}`,
                            body: `\n\n\n---\n---------- Forwarded message ----------\nFrom: ${email.from_address}\nDate: ${new Date(email.received_at).toLocaleString("en-GB")}\nSubject: ${email.subject}\n\n${email.text_body ?? ""}`,
                            mode: "forward",
                          })}
                          className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-white/50 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Forward size={12} /> Forward
                        </button>
                        {/* Mark read/unread */}
                        <button
                          onClick={() => {
                            if (email.read_at) {
                              fetch("/api/admin/inbox", { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-email": adminEmail }, body: JSON.stringify({ id: email.id, read: false }) });
                              onRead(email.id + "__unread");
                            } else {
                              markRead(email);
                            }
                          }}
                          title={email.read_at ? "Mark unread" : "Mark read"}
                          className="w-7 h-7 flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/40 hover:text-white rounded-lg transition-colors"
                        >
                          <MailOpen size={13} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => deleteEmail(email.id)}
                          disabled={deleting === email.id}
                          title="Delete"
                          className="w-7 h-7 flex items-center justify-center bg-white/[0.04] hover:bg-red-500/20 border border-white/[0.08] hover:border-red-500/30 text-white/40 hover:text-red-400 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    {email.html_body ? (
                      <iframe
                        srcDoc={email.html_body}
                        className="w-full rounded-xl bg-white"
                        style={{ minHeight: 200, border: "none" }}
                        sandbox="allow-same-origin"
                        onLoad={(e) => {
                          const f = e.currentTarget;
                          f.style.height = (f.contentWindow?.document.body.scrollHeight ?? 200) + 32 + "px";
                        }}
                      />
                    ) : (
                      <div className="bg-black/30 rounded-xl px-4 py-3 text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                        {email.text_body ?? "(no body)"}
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
  );
}

// ── Sent log ──────────────────────────────────────────────────────────────────

function SentLog({ emails }: { emails: SentEmail[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? emails.filter(e =>
        e.subject.toLowerCase().includes(search.toLowerCase()) ||
        e.to_address.toLowerCase().includes(search.toLowerCase())
      )
    : emails;

  if (emails.length === 0) return (
    <div className="text-center py-16 text-white/25 text-sm">No emails sent yet.</div>
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sent mail…"
          className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff]/50 text-white text-sm pl-9 pr-4 py-2.5 rounded-xl outline-none transition-colors placeholder-white/25" />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-white/25 text-sm">No results.</div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((e) => (
            <div key={e.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
              <button onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{e.subject}</p>
                  <p className="text-white/35 text-xs truncate mt-0.5">To: {e.to_address}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-white/25 text-xs">{fmtDate(e.sent_at)}</span>
                  {expanded === e.id ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                </div>
              </button>
              {expanded === e.id && (
                <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
                  {e.cc_address && <p className="text-white/40 text-xs mb-2">Cc: {e.cc_address}</p>}
                  <div className="bg-black/30 rounded-xl px-4 py-3 text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{e.body}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type Tab = "inbox" | "compose" | "sent";

const INBOUND_KEY = "orinlabi_inbound_setup_done";

function EmailPageInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const initialTo    = searchParams.get("to") ?? "";

  const [adminEmail, setAdminEmail] = useState("");
  const [tab, setTab]               = useState<Tab>(initialTo ? "compose" : "inbox");
  const [received, setReceived]     = useState<ReceivedEmail[]>([]);
  const [sent, setSent]             = useState<SentEmail[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [compose, setCompose]       = useState<ComposePrefill>({ to: initialTo });
  const [inboundDone, setInboundDone] = useState(false);
  const [setupState, setSetupState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [setupMsg, setSetupMsg]     = useState("");
  const adminRef = useRef("");

  const refreshInbox = useCallback(async () => {
    if (!adminRef.current) return;
    setLoadingInbox(true);
    const res = await fetch("/api/admin/inbox", { headers: { "x-admin-email": adminRef.current } });
    if (res.ok) setReceived(await res.json());
    setLoadingInbox(false);
  }, []);

  useEffect(() => {
    // Check localStorage for inbound setup
    setInboundDone(!!localStorage.getItem(INBOUND_KEY));

    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getSession().then(async ({ data }) => {
        const email = data.session?.user?.email ?? "";
        adminRef.current = email;
        setAdminEmail(email);

        if (!email) return;

        // Fetch inbox + sent
        refreshInbox();
        const res2 = await fetch("/api/admin/sent", { headers: { "x-admin-email": email } });
        if (res2.ok) setSent(await res2.json());

        // Realtime: new inbound email
        supabase
          .channel("received-emails-realtime")
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "received_emails" }, (payload) => {
            setReceived((prev) => [payload.new as ReceivedEmail, ...prev]);
          })
          .subscribe();
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setupInbound() {
    setSetupState("loading"); setSetupMsg("");
    try {
      const res = await fetch("/api/admin/setup-inbound-route", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
      });
      const json = await res.json();
      if (res.ok) {
        setSetupState("done");
        setSetupMsg("Inbound route created. Send a test email to info@orinlabi.com.");
        localStorage.setItem(INBOUND_KEY, "1");
        setInboundDone(true);
      } else {
        setSetupState("error");
        setSetupMsg(json.detail?.message ?? json.error ?? "Failed — check Vercel logs.");
      }
    } catch {
      setSetupState("error"); setSetupMsg("Network error.");
    }
  }

  function handleCompose(prefill: ComposePrefill) {
    setCompose(prefill);
    setTab("compose");
  }

  function handleSent(email: SentEmail) {
    setSent((prev) => [email, ...prev]);
  }

  // When marking read/unread — update local state
  function handleRead(signal: string) {
    if (signal.endsWith("__unread")) {
      const id = signal.replace("__unread", "");
      setReceived(prev => prev.map(e => e.id === id ? { ...e, read_at: null } : e));
    } else {
      setReceived(prev => prev.map(e => e.id === signal ? { ...e, read_at: new Date().toISOString() } : e));
    }
  }

  function handleDeleted(id: string) {
    setReceived(prev => prev.filter(e => e.id !== id));
  }

  const unread = received.filter(e => !e.read_at).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-xl">Email</h1>
          <p className="text-white/40 text-sm mt-0.5">info@orinlabi.com</p>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
          <button onClick={() => setTab("inbox")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === "inbox" ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"}`}>
            <Inbox size={14} /> Inbox
            {unread > 0 && <span className="bg-[#007bff] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">{unread}</span>}
          </button>
          <button onClick={() => { setCompose({}); setTab("compose"); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === "compose" ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white/70"}`}>
            <Plus size={14} /> Compose
          </button>
          <button onClick={() => setTab("sent")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === "sent" ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"}`}>
            <Clock size={14} /> Sent
          </button>
        </div>
      </div>

      {/* Inbound setup banner — only show if not done */}
      {!inboundDone && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-400 text-sm font-semibold">Inbound email routing not configured</p>
              <p className="text-amber-400/60 text-xs mt-0.5">{setupMsg || "One-time setup needed to receive emails in this inbox."}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button onClick={() => { localStorage.setItem(INBOUND_KEY, "1"); setInboundDone(true); }}
              className="text-amber-400/50 hover:text-amber-400 text-xs transition-colors">Dismiss</button>
            <button onClick={setupInbound} disabled={setupState === "loading"}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors">
              {setupState === "loading" ? "Setting up…" : setupState === "error" ? "Retry" : "Set up inbound"}
            </button>
          </div>
        </div>
      )}

      {/* Tab content */}
      {tab === "inbox" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs">
              {received.length} email{received.length !== 1 ? "s" : ""}
              {unread > 0 ? ` · ${unread} unread` : ""}
            </p>
            <button onClick={refreshInbox} className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <InboxView
            emails={received}
            loading={loadingInbox}
            adminEmail={adminEmail}
            onRefresh={refreshInbox}
            onCompose={handleCompose}
            onDeleted={handleDeleted}
            onRead={handleRead}
          />
        </>
      )}

      {tab === "compose" && (
        <EmailComposer
          prefill={compose}
          adminEmail={adminEmail}
          onSent={handleSent}
          onCancel={compose.mode ? () => setTab("inbox") : undefined}
        />
      )}

      {tab === "sent" && <SentLog emails={sent} />}
    </div>
  );
}

export default function AdminEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-white/30 text-sm">Loading…</div>}>
      <EmailPageInner />
    </Suspense>
  );
}
