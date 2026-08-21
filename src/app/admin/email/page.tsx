"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle, ArrowLeft, CheckCheck, Forward, Inbox,
  MailOpen, Minimize2, Plus, RefreshCw, Reply,
  Search, Send, Star, Trash2, X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────

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

type Folder = "inbox" | "starred" | "sent";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const diff = (now.getTime() - d.getTime()) / 86_400_000;
  if (diff < 7)   return d.toLocaleDateString("en-GB", { weekday: "short" });
  if (diff < 365) return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
}

function senderName(from: string) {
  const m = from.match(/^"?([^"<]+)"?\s*</);
  return (m ? m[1].trim() : from.split("@")[0]).replace(/\+/g, " ");
}

function senderEmail(from: string) {
  const m = from.match(/<([^>]+)>/);
  return m ? m[1] : from;
}

function quoteText(email: ReceivedEmail): string {
  const lines = (email.text_body ?? "").split("\n").map(l => `> ${l}`).join("\n");
  return `\n\n\n---\nOn ${new Date(email.received_at).toLocaleString("en-GB")}, ${email.from_address} wrote:\n${lines}`;
}

const STARRED_KEY = "orinlabi_starred";
const INBOUND_KEY = "orinlabi_inbound_done";

function loadStarred(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(STARRED_KEY) ?? "[]")); } catch { return new Set(); }
}
function saveStarred(s: Set<string>) {
  localStorage.setItem(STARRED_KEY, JSON.stringify([...s]));
}

// ── Compose (floating Gmail-style) ────────────────────────────────────────────

function ComposePanel({
  prefill, adminEmail, onSent, onClose,
}: {
  prefill: ComposePrefill;
  adminEmail: string;
  onSent: (e: SentEmail) => void;
  onClose: () => void;
}) {
  const [mini,    setMini]    = useState(false);
  const [to,      setTo]      = useState(prefill.to ?? "");
  const [cc,      setCc]      = useState("");
  const [bcc,     setBcc]     = useState("");
  const [showCc,  setShowCc]  = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState(prefill.subject ?? "");
  const [body,    setBody]    = useState(prefill.body ?? "");
  const [sending, setSending] = useState(false);
  const [err,     setErr]     = useState("");
  const [sent,    setSent]    = useState(false);

  const label = prefill.mode === "reply" ? "Reply" : prefill.mode === "forward" ? "Forward" : "New Message";

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    setSending(true); setErr("");
    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
        body: JSON.stringify({ to, cc: cc || undefined, subject, body }),
      });
      const json = await res.json();
      if (!res.ok) { setErr(json.error ?? "Failed."); setSending(false); return; }
      setSent(true);
      onSent({ id: crypto.randomUUID(), to_address: to, cc_address: cc || null, subject, body, sent_by: adminEmail, sent_at: new Date().toISOString() });
      setTimeout(onClose, 1600);
    } catch { setErr("Network error."); setSending(false); }
  }

  return (
    <div
      className="fixed bottom-0 right-6 z-[70] w-[500px] max-w-[calc(100vw-1.5rem)] rounded-t-2xl overflow-hidden border border-white/[0.12] bg-[#0e0e1a]"
      style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.7)" }}
    >
      {/* Header */}
      <div className="flex items-center bg-[#1a1a2e] px-4 py-2.5 cursor-pointer select-none" onClick={() => setMini(!mini)}>
        <span className="text-white text-sm font-semibold flex-1 truncate">{subject || label}</span>
        <button type="button" onClick={e => { e.stopPropagation(); setMini(!mini); }}
          className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors ml-1">
          <Minimize2 size={13} />
        </button>
        <button type="button" onClick={e => { e.stopPropagation(); onClose(); }}
          className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors">
          <X size={14} />
        </button>
      </div>

      {!mini && (
        <form onSubmit={handleSend}>
          {/* To */}
          <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
            <span className="text-white/35 text-xs w-8 shrink-0">To</span>
            <input value={to} onChange={e => setTo(e.target.value)} required placeholder="Recipients"
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
            <div className="flex gap-1 text-[11px] text-white/25 shrink-0">
              {!showCc  && <button type="button" onClick={() => setShowCc(true)}  className="px-1.5 py-0.5 rounded hover:text-white/60 hover:bg-white/[0.05]">Cc</button>}
              {!showBcc && <button type="button" onClick={() => setShowBcc(true)} className="px-1.5 py-0.5 rounded hover:text-white/60 hover:bg-white/[0.05]">Bcc</button>}
            </div>
          </div>
          {showCc && (
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
              <span className="text-white/35 text-xs w-8 shrink-0">Cc</span>
              <input value={cc} onChange={e => setCc(e.target.value)} placeholder="Carbon copy"
                className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
            </div>
          )}
          {showBcc && (
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5">
              <span className="text-white/35 text-xs w-8 shrink-0">Bcc</span>
              <input value={bcc} onChange={e => setBcc(e.target.value)} placeholder="Blind carbon copy"
                className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/20" />
            </div>
          )}
          {/* Subject */}
          <div className="border-b border-white/[0.07] px-4 py-2.5">
            <input value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Subject"
              className="w-full bg-transparent outline-none text-white text-sm font-medium placeholder-white/20" />
          </div>
          {/* Body */}
          <textarea value={body} onChange={e => setBody(e.target.value)} required rows={11}
            placeholder={"Write your message here…\n\nBlank lines become paragraphs."}
            className="w-full bg-transparent outline-none text-white text-sm placeholder-white/20 px-4 py-3 resize-none leading-relaxed" />
          {/* Footer */}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-white/[0.07]">
            <button type="submit" disabled={sending || sent}
              className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0066d6] disabled:opacity-50 text-white text-sm font-bold px-6 py-2 rounded-full transition-colors">
              {sending
                ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending…</>
                : sent
                  ? <><CheckCheck size={13} />Sent!</>
                  : <><Send size={13} />Send</>}
            </button>
            {err && <span className="text-red-400 text-xs">{err}</span>}
            <span className="flex-1" />
            <button type="button" onClick={onClose} title="Discard"
              className="text-white/25 hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Reading Pane ───────────────────────────────────────────────────────────────

function ReadingPane({
  email, sentEmail, adminEmail, starred,
  onBack, onToggleStar, onDelete, onMarkUnread, onOpenCompose,
}: {
  email?: ReceivedEmail;
  sentEmail?: SentEmail;
  adminEmail: string;
  starred: boolean;
  onBack: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
  onMarkUnread: () => void;
  onOpenCompose: (p: ComposePrefill) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending,   setSending]   = useState(false);
  const [replySent, setReplySent] = useState(false);
  const [replyErr,  setReplyErr]  = useState("");

  useEffect(() => { setShowReply(false); setReplyText(""); setReplySent(false); setReplyErr(""); }, [email?.id, sentEmail?.id]);

  function resizeIframe() {
    const f = iframeRef.current;
    if (!f) return;
    try { f.style.height = (f.contentWindow!.document.documentElement.scrollHeight + 48) + "px"; }
    catch { f.style.height = "500px"; }
  }

  async function sendReply() {
    if (!email || !replyText.trim()) return;
    setSending(true); setReplyErr("");
    const res = await fetch("/api/admin/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
      body: JSON.stringify({
        to: senderEmail(email.from_address),
        subject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
        body: replyText + quoteText(email),
      }),
    });
    if (res.ok) { setReplySent(true); setSending(false); setShowReply(false); setReplyText(""); }
    else { const j = await res.json(); setReplyErr(j.error ?? "Failed."); setSending(false); }
  }

  if (!email && !sentEmail) {
    return (
      <div className="hidden lg:flex flex-1 items-center justify-center flex-col gap-3 text-white/15">
        <MailOpen size={56} strokeWidth={1} />
        <p className="text-sm">Select an email to read</p>
      </div>
    );
  }

  const subj     = email?.subject ?? sentEmail?.subject ?? "";
  const fromAddr = email ? email.from_address : "info@orinlabi.com";
  const toAddr   = email ? email.to_address   : sentEmail!.to_address;
  const dateStr  = email ? email.received_at  : sentEmail!.sent_at;
  const htmlBody = email?.html_body  ?? null;
  const textBody = email?.text_body  ?? sentEmail?.body ?? null;

  const iframeDoc = (html: string) =>
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<style>*{box-sizing:border-box}body{margin:20px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;` +
    `line-height:1.7;color:#1a1a1a;word-break:break-word;-webkit-text-size-adjust:100%}` +
    `img{max-width:100%;height:auto}a{color:#007bff}p{margin:0 0 14px}` +
    `table{max-width:100%;border-collapse:collapse}td,th{padding:6px 10px}</style>` +
    `</head><body>${html}</body></html>`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#050505]">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.07] bg-[#07070a]">
        <button onClick={onBack} className="lg:hidden flex items-center gap-1.5 text-white/50 hover:text-white text-sm mr-2 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <button onClick={onDelete} title="Delete"
          className="w-8 h-8 flex items-center justify-center text-white/35 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
          <Trash2 size={15} />
        </button>
        <button onClick={onMarkUnread} title="Mark unread"
          className="w-8 h-8 flex items-center justify-center text-white/35 hover:text-white hover:bg-white/[0.07] rounded-lg transition-colors">
          <MailOpen size={15} />
        </button>
        <button onClick={onToggleStar} title={starred ? "Unstar" : "Star"}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${starred ? "text-yellow-400" : "text-white/35 hover:text-yellow-400 hover:bg-yellow-400/10"}`}>
          <Star size={15} fill={starred ? "currentColor" : "none"} />
        </button>
        <span className="flex-1" />
        {email && (
          <>
            <button
              onClick={() => setShowReply(r => !r)}
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors">
              <Reply size={13} /> Reply
            </button>
            <button
              onClick={() => onOpenCompose({
                subject: `Fwd: ${subj}`,
                body: `\n\n---------- Forwarded message ----------\nFrom: ${email.from_address}\nDate: ${new Date(dateStr).toLocaleString("en-GB")}\nSubject: ${subj}\n\n${email.text_body ?? ""}`,
                mode: "forward",
              })}
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors">
              <Forward size={13} /> Forward
            </button>
          </>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-5 max-w-3xl">
          {/* Subject */}
          <h2 className="text-white text-xl font-bold mb-5 leading-snug">{subj}</h2>

          {/* Sender avatar + meta */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#007bff]/15 border border-[#007bff]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#007bff] text-sm font-bold">{senderName(fromAddr)[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <span className="text-white font-semibold text-sm">{senderName(fromAddr)}</span>
                  <span className="text-white/35 text-xs ml-2">&lt;{senderEmail(fromAddr)}&gt;</span>
                </div>
                <span className="text-white/30 text-xs shrink-0">
                  {new Date(dateStr).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-white/30 text-xs mt-0.5">to <span className="text-white/45">{toAddr}</span></p>
            </div>
          </div>

          {/* Body */}
          <div className="border-t border-white/[0.06] pt-5">
            {htmlBody ? (
              <div className="rounded-xl overflow-hidden bg-white">
                <iframe
                  ref={iframeRef}
                  srcDoc={iframeDoc(htmlBody)}
                  sandbox="allow-same-origin"
                  style={{ width: "100%", border: "none", minHeight: 220, display: "block" }}
                  onLoad={resizeIframe}
                />
              </div>
            ) : textBody ? (
              <div className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{textBody}</div>
            ) : (
              <p className="text-white/25 text-sm italic">This email has no content.</p>
            )}
          </div>

          {/* Reply / Forward buttons */}
          {email && !showReply && !replySent && (
            <div className="mt-8 flex gap-2">
              <button onClick={() => setShowReply(true)}
                className="flex items-center gap-2 border border-white/[0.12] text-white/50 hover:text-white hover:border-white/25 text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
                <Reply size={14} /> Reply
              </button>
              <button onClick={() => onOpenCompose({ subject: `Fwd: ${subj}`, body: `\n\n---------- Forwarded message ----------\nFrom: ${email.from_address}\n\n${email.text_body ?? ""}`, mode: "forward" })}
                className="flex items-center gap-2 border border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/20 text-sm font-medium px-5 py-2.5 rounded-full transition-colors">
                <Forward size={14} /> Forward
              </button>
            </div>
          )}

          {replySent && <p className="mt-6 text-green-400 text-sm flex items-center gap-2"><CheckCheck size={14} /> Reply sent.</p>}

          {/* Inline reply box */}
          {showReply && email && (
            <div className="mt-6 border border-white/[0.12] rounded-2xl overflow-hidden bg-white/[0.02]">
              <div className="px-4 py-2.5 border-b border-white/[0.08]">
                <span className="text-white/30 text-xs">To: </span>
                <span className="text-white/55 text-xs">{senderEmail(email.from_address)}</span>
              </div>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} autoFocus rows={6}
                placeholder={`Reply to ${senderName(email.from_address)}…`}
                className="w-full bg-transparent outline-none text-white text-sm placeholder-white/20 px-4 py-3 resize-none leading-relaxed" />
              <div className="flex items-center gap-3 px-4 py-2.5 border-t border-white/[0.08]">
                <button onClick={sendReply} disabled={sending || !replyText.trim()}
                  className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0066d6] disabled:opacity-40 text-white text-sm font-bold px-5 py-2 rounded-full transition-colors">
                  {sending ? "Sending…" : <><Send size={13} />Send</>}
                </button>
                <button onClick={() => { setShowReply(false); setReplyText(""); }}
                  className="text-white/30 hover:text-white/60 text-sm transition-colors">Cancel</button>
                {replyErr && <span className="text-red-400 text-xs ml-2">{replyErr}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Email List Row ─────────────────────────────────────────────────────────────

function EmailRow({
  email, selected, starred, onSelect, onStar,
}: {
  email: ReceivedEmail | SentEmail;
  selected: boolean;
  starred: boolean;
  onSelect: () => void;
  onStar: () => void;
}) {
  const isInbound = "from_address" in email;
  const unread    = isInbound && !(email as ReceivedEmail).read_at;
  const name      = isInbound
    ? senderName((email as ReceivedEmail).from_address)
    : (email as SentEmail).to_address.split("@")[0];
  const date    = isInbound ? (email as ReceivedEmail).received_at : (email as SentEmail).sent_at;
  const snippet = (isInbound
    ? ((email as ReceivedEmail).text_body ?? "")
    : (email as SentEmail).body
  ).replace(/\s+/g, " ").trim().slice(0, 90);

  return (
    <div onClick={onSelect}
      className={`group flex items-start gap-2 px-3 py-3 cursor-pointer border-b border-white/[0.04] transition-colors
        ${selected
          ? "bg-[#007bff]/10 border-l-[3px] border-l-[#007bff]"
          : "hover:bg-white/[0.03] border-l-[3px] border-l-transparent"}`}>
      {/* Unread dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${unread ? "bg-[#007bff]" : "bg-transparent"}`} />
      {/* Star */}
      <button type="button" onClick={e => { e.stopPropagation(); onStar(); }}
        className={`flex-shrink-0 mt-0.5 transition-colors ${starred ? "text-yellow-400" : "text-white/0 group-hover:text-white/25 hover:!text-yellow-400"}`}>
        <Star size={13} fill={starred ? "currentColor" : "none"} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-[13px] truncate leading-snug ${unread ? "text-white font-bold" : "text-white/65"}`}>{name}</span>
          <span className="text-white/25 text-[10px] shrink-0 leading-none mt-0.5">{fmtDate(date)}</span>
        </div>
        <p className="text-xs mt-0.5 leading-snug truncate">
          <span className={unread ? "text-white/80 font-semibold" : "text-white/45"}>{email.subject}</span>
          {snippet && <span className="text-white/22"> &nbsp;·&nbsp; {snippet}</span>}
        </p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

function EmailPageInner() {
  const initialTo = useSearchParams().get("to") ?? "";

  const [adminEmail, setAdminEmail] = useState("");
  const adminRef = useRef("");
  const [folder,   setFolder]   = useState<Folder>("inbox");
  const [received, setReceived] = useState<ReceivedEmail[]>([]);
  const [sent,     setSent]     = useState<SentEmail[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selRecv,  setSelRecv]  = useState<string | null>(null);
  const [selSent,  setSelSent]  = useState<string | null>(null);
  const [starred,  setStarred]  = useState<Set<string>>(new Set());
  const [search,   setSearch]   = useState("");
  const [compose,  setCompose]  = useState<{ open: boolean; prefill: ComposePrefill }>({ open: !!initialTo, prefill: { to: initialTo } });
  const [setupState, setSetupState] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [setupMsg,   setSetupMsg]   = useState("");
  const [showBanner, setShowBanner] = useState(false);

  const refresh = useCallback(async () => {
    if (!adminRef.current) return;
    setLoading(true);
    const res = await fetch("/api/admin/inbox", { headers: { "x-admin-email": adminRef.current } });
    if (res.ok) setReceived(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    setStarred(loadStarred());
    setShowBanner(!localStorage.getItem(INBOUND_KEY));

    supabase.auth.getSession().then(async ({ data }) => {
      const email = data.session?.user?.email ?? "";
      adminRef.current = email;
      setAdminEmail(email);
      if (!email) return;

      refresh();

      const r2 = await fetch("/api/admin/sent", { headers: { "x-admin-email": email } });
      if (r2.ok) setSent(await r2.json());

      supabase.channel("email-inbox-rt")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "received_emails" }, p => {
          setReceived(prev => [p.new as ReceivedEmail, ...prev]);
        })
        .subscribe();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectReceived(id: string) {
    setSelRecv(id); setSelSent(null);
    const e = received.find(r => r.id === id);
    if (e && !e.read_at) {
      await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
        body: JSON.stringify({ id, read: true }),
      });
      setReceived(prev => prev.map(r => r.id === id ? { ...r, read_at: new Date().toISOString() } : r));
    }
  }

  async function deleteSelected() {
    if (!selRecv) return;
    await fetch("/api/admin/inbox", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
      body: JSON.stringify({ id: selRecv }),
    });
    setReceived(prev => prev.filter(e => e.id !== selRecv));
    setSelRecv(null);
  }

  function markUnread() {
    if (!selRecv) return;
    fetch("/api/admin/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
      body: JSON.stringify({ id: selRecv, read: false }),
    });
    setReceived(prev => prev.map(e => e.id === selRecv ? { ...e, read_at: null } : e));
  }

  function toggleStar(id: string) {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveStarred(next);
      return next;
    });
  }

  async function setupInbound() {
    setSetupState("loading"); setSetupMsg("");
    try {
      const res = await fetch("/api/admin/setup-inbound-route", {
        method: "POST", headers: { "Content-Type": "application/json", "x-admin-email": adminEmail },
      });
      const j = await res.json();
      if (res.ok) {
        setSetupState("done"); setSetupMsg("Route created!");
        localStorage.setItem(INBOUND_KEY, "1");
        setTimeout(() => setShowBanner(false), 2500);
      } else {
        setSetupState("error");
        setSetupMsg(j.detail?.message ?? j.error ?? "Failed — check Vercel logs.");
      }
    } catch { setSetupState("error"); setSetupMsg("Network error."); }
  }

  const q = search.toLowerCase().trim();
  const filtInbox = received.filter(e => !q || e.subject.toLowerCase().includes(q) || e.from_address.toLowerCase().includes(q) || (e.text_body ?? "").toLowerCase().includes(q));
  const filtSent  = sent.filter(e => !q || e.subject.toLowerCase().includes(q) || e.to_address.toLowerCase().includes(q));
  const filtStar  = received.filter(e => starred.has(e.id) && (!q || e.subject.toLowerCase().includes(q) || e.from_address.toLowerCase().includes(q)));

  const currentList  = folder === "inbox" ? filtInbox : folder === "starred" ? filtStar : filtSent;
  const unreadCount  = received.filter(e => !e.read_at).length;
  const selRecvEmail = received.find(e => e.id === selRecv);
  const selSentEmail = sent.find(e => e.id === selSent);
  const hasSelection = !!(selRecvEmail || selSentEmail);

  return (
    <div
      className="flex overflow-hidden rounded-xl border border-white/[0.07] bg-[#050505]"
      style={{ height: "calc(100vh - 104px)" }}
    >
      {/* ── Folder sidebar ── */}
      <div className={`${hasSelection ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-52 xl:w-56 flex-shrink-0 border-r border-white/[0.07] bg-[#07070a]`}>
        <div className="p-3 pb-2">
          <button
            onClick={() => setCompose({ open: true, prefill: {} })}
            className="w-full flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0066d6] text-white text-sm font-bold py-2.5 rounded-2xl transition-colors"
            style={{ boxShadow: "0 4px 20px rgba(0,123,255,0.25)" }}
          >
            <Plus size={15} /> Compose
          </button>
        </div>

        {/* Inbound banner compact */}
        {showBanner && (
          <div className="mx-3 mb-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle size={11} className="text-amber-400 shrink-0" />
              <span className="text-amber-400 font-semibold text-[11px]">Inbound not configured</span>
            </div>
            {setupMsg && <p className="text-amber-400/60 text-[10px] mb-1.5 leading-snug">{setupMsg}</p>}
            <div className="flex gap-1.5">
              <button onClick={setupInbound} disabled={setupState === "loading"}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-[10px] py-1 rounded-lg transition-colors">
                {setupState === "loading" ? "…" : setupState === "error" ? "Retry" : "Set up"}
              </button>
              <button onClick={() => { localStorage.setItem(INBOUND_KEY, "1"); setShowBanner(false); }}
                className="px-2 text-amber-400/40 hover:text-amber-400 text-xs transition-colors">✕</button>
            </div>
          </div>
        )}

        {/* Folders */}
        <nav className="flex-1 px-2 py-1 space-y-0.5">
          {([
            { id: "inbox"   as Folder, icon: <Inbox size={15} />, label: "Inbox",   count: unreadCount },
            { id: "starred" as Folder, icon: <Star  size={15} />, label: "Starred", count: starred.size },
            { id: "sent"    as Folder, icon: <Send  size={15} />, label: "Sent",    count: 0 },
          ] as const).map(f => (
            <button key={f.id}
              onClick={() => { setFolder(f.id); setSelRecv(null); setSelSent(null); }}
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
      </div>

      {/* ── Email list ── */}
      <div className={`${hasSelection ? "hidden lg:flex" : "flex"} flex-col lg:w-72 xl:w-80 w-full flex-shrink-0 border-r border-white/[0.07]`}>
        {/* Search */}
        <div className="flex-shrink-0 p-2.5 border-b border-white/[0.07]">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search email…"
              className="w-full bg-white/[0.04] border border-white/[0.07] text-white text-sm pl-8 pr-7 py-2 rounded-xl outline-none focus:border-[#007bff]/40 transition-colors placeholder-white/20" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && folder === "inbox" ? (
            <div className="text-center py-16 text-white/20 text-sm">Loading…</div>
          ) : currentList.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-white/18">
              <Inbox size={32} strokeWidth={1} />
              <p className="text-sm">{folder === "inbox" ? "Inbox empty" : folder === "starred" ? "No starred emails" : "No sent emails"}</p>
            </div>
          ) : currentList.map(email => (
            <EmailRow
              key={email.id}
              email={email}
              selected={email.id === selRecv || email.id === selSent}
              starred={starred.has(email.id)}
              onSelect={() => {
                if ("from_address" in email) selectReceived(email.id);
                else { setSelSent(email.id); setSelRecv(null); }
              }}
              onStar={() => toggleStar(email.id)}
            />
          ))}
        </div>

        <div className="flex-shrink-0 px-3 py-1.5 border-t border-white/[0.06] text-white/20 text-[10px]">
          {folder === "inbox" ? `${received.length} total · ${unreadCount} unread` : `${currentList.length} emails`}
        </div>
      </div>

      {/* ── Reading pane ── */}
      <ReadingPane
        email={selRecvEmail}
        sentEmail={selSentEmail}
        adminEmail={adminEmail}
        starred={starred.has(selRecv ?? "") || starred.has(selSent ?? "")}
        onBack={() => { setSelRecv(null); setSelSent(null); }}
        onToggleStar={() => toggleStar(selRecv ?? selSent ?? "")}
        onDelete={deleteSelected}
        onMarkUnread={markUnread}
        onOpenCompose={p => setCompose({ open: true, prefill: p })}
      />

      {/* ── Compose ── */}
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
