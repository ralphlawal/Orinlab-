"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, CheckCheck, Forward, Inbox, MailOpen,
  Minimize2, Pencil, Plus, RefreshCw, Reply,
  Search, Send, Star, Trash2, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────

type RxEmail = {
  id: string; message_id: string; from_address: string; to_address: string;
  subject: string; html_body: string | null; text_body: string | null;
  read_at: string | null; received_at: string;
};
type TxEmail = {
  id: string; to_address: string; cc_address: string | null;
  subject: string; body: string; sent_by: string; sent_at: string;
};
type ComposePrefill = { to?: string; subject?: string; body?: string; mode?: "reply" | "forward" | "new" };
type Folder = "inbox" | "starred" | "sent";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso), now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const diff = (now.getTime() - d.getTime()) / 86_400_000;
  if (diff < 7) return d.toLocaleDateString("en-GB", { weekday: "short" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function sName(from: string) {
  const m = from.match(/^"?([^"<]+)"?\s*</);
  return (m ? m[1].trim() : from.split("@")[0]).replace(/\+/g, " ").trim() || from;
}
function sAddr(from: string) { const m = from.match(/<([^>]+)>/); return m ? m[1] : from; }

const STAR_KEY = "orinlabi_starred_v2";
function storedStarred(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(STAR_KEY) ?? "[]")); } catch { return new Set(); }
}
function persistStarred(s: Set<string>) { localStorage.setItem(STAR_KEY, JSON.stringify([...s])); }

// ── Compose panel ─────────────────────────────────────────────────────────────

function ComposePanel({ prefill, adminEmail, onSent, onClose }: {
  prefill: ComposePrefill; adminEmail: string;
  onSent: (e: TxEmail) => void; onClose: () => void;
}) {
  const [mini,    setMini]    = useState(false);
  const [to,      setTo]      = useState(prefill.to ?? "");
  const [cc,      setCc]      = useState("");
  const [bcc,     setBcc]     = useState("");
  const [ccOpen,  setCcOpen]  = useState(false);
  const [subject, setSubject] = useState(prefill.subject ?? "");
  const [body,    setBody]    = useState(prefill.body ?? "");
  const [busy,    setBusy]    = useState(false);
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState("");

  const label = prefill.mode === "reply" ? "Reply" : prefill.mode === "forward" ? "Forward" : "New Message";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
        body: JSON.stringify({ to, cc: cc || undefined, subject, body }),
      });
      if (!res.ok) { const j = await res.json(); setErr(j.error ?? "Send failed."); setBusy(false); return; }
      setDone(true);
      onSent({ id: crypto.randomUUID(), to_address: to, cc_address: cc || null, subject, body, sent_by: adminEmail, sent_at: new Date().toISOString() });
      setTimeout(onClose, 1500);
    } catch { setErr("Network error."); setBusy(false); }
  }

  return (
    <div className="fixed bottom-0 right-6 z-[80] w-[520px] max-w-[calc(100vw-3rem)] rounded-t-2xl overflow-hidden border border-white/[0.14] bg-[#0c0c1a]"
      style={{ boxShadow: "0 -16px 60px rgba(0,0,0,0.85)" }}>
      {/* Title bar */}
      <div className="flex items-center gap-1 bg-[#161628] px-4 py-3 cursor-pointer select-none" onClick={() => setMini(m => !m)}>
        <span className="text-white text-sm font-semibold flex-1 truncate">{subject || label}</span>
        <button type="button" onClick={e => { e.stopPropagation(); setMini(m => !m); }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/40 hover:text-white">
          <Minimize2 size={13} />
        </button>
        <button type="button" onClick={e => { e.stopPropagation(); onClose(); }}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/40 hover:text-white">
          <X size={14} />
        </button>
      </div>

      {!mini && (
        <form onSubmit={send}>
          {/* To */}
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
            <span className="text-white/30 text-xs w-12 shrink-0">To</span>
            <input value={to} onChange={e => setTo(e.target.value)} required placeholder="Recipients"
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
            {!ccOpen && (
              <button type="button" onClick={() => setCcOpen(true)} className="text-[11px] text-white/25 hover:text-white/60 px-2 shrink-0">Cc/Bcc</button>
            )}
          </div>
          {ccOpen && (
            <>
              <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
                <span className="text-white/30 text-xs w-12 shrink-0">Cc</span>
                <input value={cc} onChange={e => setCc(e.target.value)} placeholder="Carbon copy"
                  className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
              </div>
              <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
                <span className="text-white/30 text-xs w-12 shrink-0">Bcc</span>
                <input value={bcc} onChange={e => setBcc(e.target.value)} placeholder="Blind carbon copy"
                  className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
              </div>
            </>
          )}
          {/* Subject */}
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
            <span className="text-white/30 text-xs w-12 shrink-0">Subject</span>
            <input value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Subject line"
              className="flex-1 bg-transparent outline-none text-white text-sm font-medium placeholder-white/20" />
          </div>
          {/* Body */}
          <textarea value={body} onChange={e => setBody(e.target.value)} required rows={12}
            placeholder={"Write your message…\n\nBlank lines become paragraphs."}
            className="w-full bg-transparent outline-none text-white text-sm placeholder-white/20 px-4 py-3.5 resize-none leading-relaxed" />
          {/* Footer */}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-white/[0.08]">
            <button type="submit" disabled={busy || done}
              className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0066d6] disabled:opacity-50 text-white text-sm font-bold px-6 py-2 rounded-full transition-colors">
              {done ? <><CheckCheck size={13} />Sent!</> : busy ? "Sending…" : <><Send size={13} />Send</>}
            </button>
            {err && <span className="text-red-400 text-xs">{err}</span>}
            <span className="flex-1" />
            <button type="button" onClick={onClose} title="Discard draft"
              className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Reading pane ───────────────────────────────────────────────────────────────

function ReadingPane({ rx, tx, adminEmail, starred, onBack, onToggleStar, onDelete, onMarkUnread, onCompose }: {
  rx?: RxEmail; tx?: TxEmail; adminEmail: string; starred: boolean;
  onBack: () => void; onToggleStar: () => void; onDelete: () => void;
  onMarkUnread: () => void; onCompose: (p: ComposePrefill) => void;
}) {
  const iframeRef  = useRef<HTMLIFrameElement>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyOk, setReplyOk] = useState(false);

  // Reset when email changes
  useEffect(() => { setReplyOpen(false); setReplyText(""); setReplyOk(false); }, [rx?.id, tx?.id]);

  function resizeIframe() {
    try {
      const f = iframeRef.current!;
      f.style.height = "1px";
      const h = f.contentWindow!.document.documentElement.scrollHeight;
      f.style.height = Math.max(h + 40, 200) + "px";
    } catch { if (iframeRef.current) iframeRef.current.style.height = "480px"; }
  }

  async function sendReply() {
    if (!rx || !replyText.trim()) return;
    setReplySending(true);
    const quote = (rx.text_body ?? "").split("\n").map(l => `> ${l}`).join("\n");
    const body  = `${replyText}\n\n---\nOn ${new Date(rx.received_at).toLocaleString("en-GB")}, ${rx.from_address} wrote:\n${quote}`;
    const res = await fetch("/api/admin/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
      body: JSON.stringify({ to: sAddr(rx.from_address), subject: rx.subject.startsWith("Re:") ? rx.subject : `Re: ${rx.subject}`, body }),
    });
    setReplySending(false);
    if (res.ok) { setReplyOk(true); setReplyOpen(false); setReplyText(""); }
  }

  if (!rx && !tx) {
    return (
      <div className="hidden lg:flex flex-1 items-center justify-center flex-col gap-3 text-white/15">
        <MailOpen size={52} strokeWidth={1} />
        <p className="text-sm">Select an email to read</p>
      </div>
    );
  }

  const from = rx?.from_address ?? "info@orinlabi.com";
  const to   = rx?.to_address   ?? tx!.to_address;
  const date = rx?.received_at  ?? tx!.sent_at;
  const subj = rx?.subject ?? tx?.subject ?? "";
  const html = rx?.html_body ?? null;
  // tx.body is the canonical field; also check alternate column names in case
  // the sent_emails DB schema uses a different name
  const txAny = tx as unknown as Record<string, string | null> | undefined;
  const text = rx?.text_body ?? tx?.body ?? txAny?.html_body ?? txAny?.text_body ?? txAny?.content ?? null;

  const iDoc = html
    ? `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<style>*{box-sizing:border-box}body{margin:16px 20px;font-family:-apple-system,Arial,sans-serif;` +
      `font-size:14px;line-height:1.7;color:#1a1a1a;word-break:break-word}` +
      `img{max-width:100%;height:auto}a{color:#0066cc}p{margin:0 0 12px}` +
      `table{max-width:100%;border-collapse:collapse}td,th{padding:4px 8px}</style>` +
      `</head><body>${html}</body></html>`
    : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#050505]">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-white/[0.07] bg-[#080810]">
        {/* Back (mobile only) */}
        <button onClick={onBack}
          className="lg:hidden flex items-center gap-1 text-white/50 hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors mr-1">
          <ArrowLeft size={15} />
          <span className="text-xs font-medium">Back</span>
        </button>
        {/* Actions */}
        <button onClick={onDelete} title="Delete"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <Trash2 size={14} />
        </button>
        <button onClick={onMarkUnread} title="Mark unread"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.07] transition-colors">
          <MailOpen size={14} />
        </button>
        <button onClick={onToggleStar}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${starred ? "text-yellow-400" : "text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10"}`}>
          <Star size={14} fill={starred ? "currentColor" : "none"} />
        </button>
        <div className="flex-1" />
        {rx && (
          <>
            <button onClick={() => setReplyOpen(r => !r)}
              className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/[0.07] transition-colors">
              <Reply size={13} /> Reply
            </button>
            <button onClick={() => onCompose({
              subject: `Fwd: ${subj}`,
              body: `\n\n--- Forwarded message ---\nFrom: ${from}\nDate: ${new Date(date).toLocaleString("en-GB")}\nSubject: ${subj}\n\n${text ?? ""}`,
              mode: "forward",
            })}
              className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/[0.07] transition-colors">
              <Forward size={13} /> Forward
            </button>
          </>
        )}
      </div>

      {/* Scrollable email body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 max-w-3xl">
          {/* Subject */}
          <h2 className="text-white text-lg font-bold mb-4 leading-snug">{subj}</h2>

          {/* From/To/Date */}
          <div className="flex items-start gap-3 mb-5 pb-4 border-b border-white/[0.07]">
            <div className="w-9 h-9 rounded-full bg-[#007bff]/15 border border-[#007bff]/20 flex items-center justify-center text-[#007bff] text-sm font-bold flex-shrink-0 mt-0.5">
              {sName(from)[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 justify-between">
                <div className="min-w-0">
                  <span className="text-white font-semibold text-sm">{sName(from)}</span>
                  <span className="text-white/30 text-xs ml-2 truncate">&lt;{sAddr(from)}&gt;</span>
                </div>
                <span className="text-white/30 text-xs flex-shrink-0">
                  {new Date(date).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-white/25 text-xs mt-0.5">to <span className="text-white/40">{to}</span></p>
            </div>
          </div>

          {/* Body */}
          {iDoc ? (
            <div className="rounded-xl overflow-hidden bg-white shadow">
              <iframe ref={iframeRef} srcDoc={iDoc} sandbox="allow-same-origin"
                style={{ width: "100%", border: "none", display: "block", minHeight: 240 }}
                onLoad={resizeIframe} />
            </div>
          ) : text ? (
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          ) : (
            <div className="text-white/25 text-sm">
              <p className="italic mb-2">No message body found.</p>
              {tx && <p className="text-white/15 text-xs">This email was sent successfully — the body may not have been saved to the database. Run the SQL below in Supabase to ensure the <span className="font-mono">sent_emails</span> table has a <span className="font-mono">body TEXT</span> column.</p>}
              {rx && <p className="text-white/15 text-xs">The inbound email arrived but had no readable body — check Vercel logs for the raw payload under &quot;INBOUND PAYLOAD&quot;.</p>}
            </div>
          )}

          {/* Reply sent confirmation */}
          {replyOk && (
            <div className="mt-6 flex items-center gap-2 text-green-400 text-sm">
              <CheckCheck size={14} /> Reply sent.
            </div>
          )}

          {/* Quick action buttons (when no reply open) */}
          {rx && !replyOpen && !replyOk && (
            <div className="mt-8 flex gap-2">
              <button onClick={() => setReplyOpen(true)}
                className="flex items-center gap-2 border border-white/[0.12] text-white/55 hover:text-white hover:border-white/30 text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
                <Reply size={14} /> Reply
              </button>
              <button onClick={() => onCompose({ subject: `Fwd: ${subj}`, body: `\n\n--- Forwarded message ---\nFrom: ${from}\n\n${text ?? ""}`, mode: "forward" })}
                className="flex items-center gap-2 border border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/20 text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
                <Forward size={14} /> Forward
              </button>
            </div>
          )}

          {/* Inline reply box */}
          {replyOpen && rx && (
            <div className="mt-6 border border-white/[0.12] rounded-2xl overflow-hidden bg-white/[0.02]">
              <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center gap-2">
                <Reply size={12} className="text-white/25" />
                <span className="text-white/35 text-xs">to</span>
                <span className="text-white/55 text-xs font-medium">{sAddr(from)}</span>
              </div>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} autoFocus rows={6}
                placeholder={`Reply to ${sName(from)}…`}
                className="w-full bg-transparent outline-none text-white text-sm placeholder-white/20 px-4 py-3 resize-none leading-relaxed" />
              <div className="flex items-center gap-3 px-4 py-3 border-t border-white/[0.08]">
                <button onClick={sendReply} disabled={replySending || !replyText.trim()}
                  className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0066d6] disabled:opacity-40 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors">
                  {replySending ? "Sending…" : <><Send size={13} />Send</>}
                </button>
                <button onClick={() => { setReplyOpen(false); setReplyText(""); }}
                  className="text-white/30 hover:text-white/60 text-sm transition-colors">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Email row ──────────────────────────────────────────────────────────────────

function EmailRow({ email, selected, starred, onSelect, onStar }: {
  email: RxEmail | TxEmail; selected: boolean; starred: boolean;
  onSelect: () => void; onStar: () => void;
}) {
  const isRx  = "from_address" in email;
  const unread = isRx && !(email as RxEmail).read_at;
  const name   = isRx ? sName((email as RxEmail).from_address) : (email as TxEmail).to_address.split("@")[0];
  const date   = isRx ? (email as RxEmail).received_at : (email as TxEmail).sent_at;
  const snip   = (isRx ? ((email as RxEmail).text_body ?? "") : (email as TxEmail).body)
    .replace(/\s+/g, " ").trim().slice(0, 100);

  return (
    <div onClick={onSelect}
      className={`group flex items-start gap-2.5 px-4 py-3.5 cursor-pointer border-b border-white/[0.04] transition-colors select-none
        ${selected
          ? "bg-[#007bff]/10 border-l-2 border-l-[#007bff] pl-[14px]"
          : "border-l-2 border-l-transparent hover:bg-white/[0.03]"}`}>
      <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${unread ? "bg-[#007bff]" : "bg-transparent"}`} />
      <button type="button" onClick={e => { e.stopPropagation(); onStar(); }}
        className={`mt-0.5 flex-shrink-0 transition-colors ${starred ? "text-yellow-400" : "text-transparent group-hover:text-white/20 hover:!text-yellow-400"}`}>
        <Star size={13} fill={starred ? "currentColor" : "none"} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-[13px] truncate ${unread ? "text-white font-bold" : "text-white/60"}`}>{name}</span>
          <span className="text-white/22 text-[10px] flex-shrink-0">{fmtDate(date)}</span>
        </div>
        <p className="text-xs leading-snug mt-0.5 truncate">
          <span className={unread ? "text-white/80 font-semibold" : "text-white/40"}>{email.subject}</span>
          {snip && <span className="text-white/20"> · {snip}</span>}
        </p>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

function EmailPageInner() {
  const initialTo = useSearchParams().get("to") ?? "";

  const [adminEmail, setAdminEmail] = useState("");
  const adminRef = useRef("");
  const [folder,    setFolder]    = useState<Folder>("inbox");
  const [received,  setReceived]  = useState<RxEmail[]>([]);
  const [sent,      setSent]      = useState<TxEmail[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadErr,   setLoadErr]   = useState("");
  const [selId,     setSelId]     = useState<string | null>(null);
  const [starred,   setStarred]   = useState<Set<string>>(new Set());
  const [search,    setSearch]    = useState("");
  const [mobileView, setMobileView] = useState<"list" | "reading">("list");
  const [compose,   setCompose]   = useState<{ open: boolean; prefill: ComposePrefill }>({ open: !!initialTo, prefill: { to: initialTo } });

  const refresh = useCallback(async () => {
    if (!adminRef.current) return;
    setLoading(true); setLoadErr("");
    try {
      const res = await fetch("/api/admin/inbox", { headers: { "x-admin-email": adminRef.current } });
      if (res.ok) setReceived(await res.json());
      else { const j = await res.json().catch(() => ({})); setLoadErr(j.error ?? `HTTP ${res.status}`); }
    } catch {
      setLoadErr("Network error — check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setStarred(storedStarred());
    supabase.auth.getSession().then(async ({ data }) => {
      const email = data.session?.user?.email ?? "";
      adminRef.current = email;
      setAdminEmail(email);
      if (!email) { setLoadErr("Not signed in"); setLoading(false); return; }
      refresh();
      try {
        const r2 = await fetch("/api/admin/sent", { headers: { "x-admin-email": email } });
        if (r2.ok) setSent(await r2.json());
      } catch { /* sent emails unavailable */ }
      supabase.channel("email-inbox-live")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "received_emails" }, p => {
          setReceived(prev => [p.new as RxEmail, ...prev]);
        })
        .subscribe();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openEmail(id: string, isRx: boolean) {
    setSelId(id);
    setMobileView("reading");
    if (!isRx) return;
    const e = received.find(r => r.id === id);
    if (e && !e.read_at) {
      fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
        body: JSON.stringify({ id, read: true }),
      });
      setReceived(prev => prev.map(r => r.id === id ? { ...r, read_at: new Date().toISOString() } : r));
    }
  }

  function deleteEmail() {
    if (!selId) return;
    fetch("/api/admin/inbox", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
      body: JSON.stringify({ id: selId }),
    });
    setReceived(prev => prev.filter(e => e.id !== selId));
    setSelId(null); setMobileView("list");
  }

  function markUnread() {
    if (!selId) return;
    fetch("/api/admin/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
      body: JSON.stringify({ id: selId, read: false }),
    });
    setReceived(prev => prev.map(e => e.id === selId ? { ...e, read_at: null } : e));
  }

  function toggleStar(id: string) {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      persistStarred(next);
      return next;
    });
  }

  const q   = search.toLowerCase();
  const rxList = received.filter(e => !q || e.subject.toLowerCase().includes(q) || e.from_address.toLowerCase().includes(q) || (e.text_body ?? "").toLowerCase().includes(q));
  const txList = sent.filter(e => !q || e.subject.toLowerCase().includes(q) || e.to_address.toLowerCase().includes(q));
  const starList = received.filter(e => starred.has(e.id) && (!q || e.subject.toLowerCase().includes(q) || e.from_address.toLowerCase().includes(q)));

  const list    = folder === "inbox" ? rxList : folder === "starred" ? starList : txList;
  const unread  = received.filter(e => !e.read_at).length;
  const selRx   = received.find(e => e.id === selId);
  const selTx   = sent.find(e => e.id === selId);

  function openCompose(p: ComposePrefill) { setCompose({ open: true, prefill: p }); }

  // ── Shared folder tab markup (used in both sidebar and mobile tab strip)
  const folders: { id: Folder; icon: React.ReactNode; label: string; count: number }[] = [
    { id: "inbox",   icon: <Inbox size={14} />, label: "Inbox",   count: unread },
    { id: "starred", icon: <Star  size={14} />, label: "Starred", count: starred.size },
    { id: "sent",    icon: <Send  size={14} />, label: "Sent",    count: 0 },
  ];

  // ── Shared email list panel (used in both mobile and desktop)
  const listPanel = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="flex-shrink-0 p-2.5 border-b border-white/[0.07]">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email…"
            className="w-full bg-white/[0.04] border border-white/[0.07] text-white text-sm pl-8 pr-7 py-2.5 rounded-xl outline-none focus:border-[#007bff]/40 transition-colors placeholder-white/20" />
          {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"><X size={12} /></button>}
        </div>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loading ? (
          <div className="py-16 text-center text-white/25 text-sm">Loading inbox…</div>
        ) : loadErr ? (
          <div className="py-16 text-center px-4">
            <p className="text-red-400/70 text-sm mb-3">{loadErr}</p>
            <button onClick={refresh} className="text-[#007bff] text-xs hover:underline">Retry</button>
          </div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center px-6">
            {folder === "inbox" ? (
              <>
                <p className="text-white/30 text-sm mb-1">No emails received yet</p>
                <p className="text-white/15 text-xs leading-relaxed">Inbound emails appear here once Resend inbound routing is pointed at <span className="font-mono">/api/email/inbound</span></p>
              </>
            ) : folder === "starred" ? (
              <p className="text-white/20 text-sm">No starred emails</p>
            ) : (
              <p className="text-white/20 text-sm">Nothing sent yet — use Compose to send</p>
            )}
          </div>
        ) : list.map(email => (
          <EmailRow
            key={email.id}
            email={email}
            selected={email.id === selId}
            starred={starred.has(email.id)}
            onSelect={() => openEmail(email.id, "from_address" in email)}
            onStar={() => toggleStar(email.id)}
          />
        ))}
      </div>

      {/* Count */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-white/[0.06] text-white/20 text-[10px]">
        {folder === "inbox"
          ? `${received.length} total · ${unread} unread`
          : `${list.length} emails`}
      </div>
    </div>
  );

  // ── Reading pane (shared props)
  const readingPane = (
    <ReadingPane
      rx={selRx} tx={selTx} adminEmail={adminEmail}
      starred={starred.has(selId ?? "")}
      onBack={() => { setSelId(null); setMobileView("list"); }}
      onToggleStar={() => toggleStar(selId ?? "")}
      onDelete={deleteEmail}
      onMarkUnread={markUnread}
      onCompose={openCompose}
    />
  );

  return (
    // h-[calc(100vh-88px)] = 100vh − header(56) − main-padding(p-4 = 32)
    // md:h-[calc(100vh-104px)] = 100vh − header(56) − main-padding(p-6 = 48)
    <div className="flex overflow-hidden rounded-xl border border-white/[0.07] h-[calc(100vh-88px)] md:h-[calc(100vh-104px)]">

      {/* ─── DESKTOP ONLY: folder sidebar ─── */}
      <aside className="hidden lg:flex flex-col w-52 xl:w-56 flex-shrink-0 border-r border-white/[0.07] bg-[#080810]">
        <div className="p-3 pb-2">
          <button onClick={() => openCompose({})}
            className="w-full flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0066d6] text-white text-sm font-bold py-2.5 rounded-2xl transition-colors"
            style={{ boxShadow: "0 4px 20px rgba(0,123,255,0.25)" }}>
            <Plus size={15} /> Compose
          </button>
        </div>
        <nav className="flex-1 px-2 py-1 space-y-0.5">
          {folders.map(f => (
            <button key={f.id}
              onClick={() => { setFolder(f.id); setSelId(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
                ${folder === f.id ? "bg-[#007bff]/15 text-white" : "text-white/40 hover:bg-white/[0.05] hover:text-white/70"}`}>
              <span className={folder === f.id ? "text-[#007bff]" : ""}>{f.icon}</span>
              <span className="flex-1">{f.label}</span>
              {f.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none
                  ${folder === f.id ? "bg-[#007bff] text-white" : "bg-white/10 text-white/50"}`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-white/[0.07]">
          <button onClick={refresh}
            className="w-full flex items-center gap-2 justify-center text-white/25 hover:text-white/50 text-xs py-2 rounded-xl hover:bg-white/[0.04] transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </aside>

      {/* ─── DESKTOP ONLY: email list ─── */}
      <div className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-r border-white/[0.07]">
        {listPanel}
      </div>

      {/* ─── DESKTOP ONLY: reading pane ─── */}
      <div className="hidden lg:flex flex-col flex-1 min-w-0">
        {readingPane}
      </div>

      {/* ─── MOBILE: tab bar + list OR reading pane ─── */}
      <div className="lg:hidden flex flex-col flex-1 overflow-hidden min-w-0">
        {mobileView === "list" ? (
          <>
            {/* Folder tab strip */}
            <div className="flex-shrink-0 flex items-stretch border-b border-white/[0.07] bg-[#080810]">
              {folders.map(f => (
                <button key={f.id}
                  onClick={() => { setFolder(f.id); setSelId(null); }}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex-1 justify-center
                    ${folder === f.id ? "border-[#007bff] text-white" : "border-transparent text-white/40 hover:text-white/70"}`}>
                  {f.icon}
                  <span>{f.label}</span>
                  {f.count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none
                      ${folder === f.id ? "bg-[#007bff] text-white" : "bg-white/10 text-white/50"}`}>
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
              <button onClick={refresh}
                className="px-3 text-white/25 hover:text-white/50 transition-colors flex-shrink-0">
                <RefreshCw size={14} />
              </button>
            </div>
            {/* Email list */}
            <div className="flex-1 overflow-hidden">
              {listPanel}
            </div>
          </>
        ) : (
          readingPane
        )}
      </div>

      {/* ─── Mobile FAB compose button ─── */}
      {!compose.open && (
        <button onClick={() => openCompose({})}
          className="lg:hidden fixed bottom-6 right-6 z-[70] w-14 h-14 bg-[#007bff] hover:bg-[#0066d6] text-white rounded-full flex items-center justify-center transition-colors"
          style={{ boxShadow: "0 4px 24px rgba(0,123,255,0.45)" }}>
          <Pencil size={20} />
        </button>
      )}

      {/* ─── Compose panel (floating) ─── */}
      {compose.open && (
        <ComposePanel
          prefill={compose.prefill}
          adminEmail={adminEmail}
          onSent={e => setSent(prev => [e, ...prev])}
          onClose={() => setCompose({ open: false, prefill: {} })}
        />
      )}
    </div>
  );
}

export default function AdminEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-white/25 text-sm">Loading…</div>}>
      <EmailPageInner />
    </Suspense>
  );
}
