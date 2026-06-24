"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  Loader2, Send, MessageSquare, Mail, CheckCheck, ArrowLeft,
  Paperclip, Mic, MicOff, X, FileText,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ChatMsg = {
  id: string;
  artist_email: string;
  artist_name: string;
  sender: "admin" | "artist";
  content: string;
  created_at: string;
  read_at: string | null;
  attachment_url: string | null;
  attachment_type: "file" | "audio" | null;
  attachment_name: string | null;
};

type ArtistThread = {
  email: string;
  name: string;
  unread: number;
  lastContent: string;
  lastAt: string;
};

type ContactMsg = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiry_type: string;
  created_at: string;
};

type PendingAttachment = {
  file: File;
  type: "file" | "audio";
  previewUrl?: string;
};

const READ_KEY = "orinlabi_read_contacts";
const MAX_FILE_MB = 20;

function formatSecs(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

function AttachmentBubble({ url, type, name, isAdmin }: { url: string; type: string; name: string | null; isAdmin: boolean }) {
  if (type === "audio") {
    return (
      <div className="mt-2">
        <audio controls src={url} style={{ height: 36, maxWidth: 240 }} className="max-w-full" />
      </div>
    );
  }
  return (
    <a
      href={url} target="_blank" rel="noopener noreferrer"
      className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs transition-colors ${
        isAdmin ? "bg-white/20 hover:bg-white/30 text-white" : "bg-white/[0.07] hover:bg-white/[0.12] text-white/80"
      }`}
    >
      <FileText size={13} className="flex-shrink-0" />
      <span className="truncate max-w-[180px]">{name ?? "Download file"}</span>
    </a>
  );
}

// ── Admin Messages Page ────────────────────────────────────────────────────────

export default function AdminMessagesPage() {
  const [tab, setTab] = useState<"chats" | "contact">("chats");

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-1 mb-5 flex-shrink-0 border-b border-white/[0.06] pb-4">
        {(["chats", "contact"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              tab === t ? "bg-[#007bff]/15 text-[#007bff]" : "text-white/40 hover:text-white"
            }`}
          >
            {t === "chats" ? "Artist Chats" : "Contact Forms"}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "chats" ? <ArtistChats /> : <ContactForms />}
      </div>
    </div>
  );
}

// ── Artist Chats ──────────────────────────────────────────────────────────────

function ArtistChats() {
  const { requestUnlock } = usePinGate();
  const [threads, setThreads] = useState<ArtistThread[]>([]);
  const [selected, setSelected] = useState<ArtistThread | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadThreads();
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadThreads() {
    const [{ data: releases }, { data: allMsgs }] = await Promise.all([
      supabase.from("releases").select("email, artist_name").order("submitted_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: true }),
    ]);

    const chatMsgs = (allMsgs ?? []) as ChatMsg[];
    const seen = new Map<string, string>();
    for (const r of releases ?? []) {
      if (!seen.has(r.email)) seen.set(r.email, r.artist_name ?? r.email);
    }
    for (const m of chatMsgs) {
      if (!seen.has(m.artist_email)) seen.set(m.artist_email, m.artist_name || m.artist_email);
    }

    const artistList: ArtistThread[] = Array.from(seen.entries()).map(([email, name]) => {
      const mine = chatMsgs.filter(m => m.artist_email === email);
      const unread = mine.filter(m => m.sender === "artist" && !m.read_at).length;
      const last = mine[mine.length - 1];
      const lastContent = last?.attachment_type === "audio"
        ? "🎤 Voice message"
        : last?.attachment_type === "file"
        ? `📎 ${last.attachment_name ?? "File"}`
        : (last?.content ?? "");
      return { email, name, unread, lastContent, lastAt: last?.created_at ?? "" };
    });

    artistList.sort((a, b) => {
      if (!a.lastAt && !b.lastAt) return a.name.localeCompare(b.name);
      if (!a.lastAt) return 1;
      if (!b.lastAt) return -1;
      return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
    });

    setThreads(artistList);
    setLoadingThreads(false);
  }

  // Thread list refresh every 30s (Realtime handles active chat)
  useEffect(() => {
    const id = setInterval(loadThreads, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time subscription for all message inserts — update active thread instantly
  useEffect(() => {
    const channel = supabase
      .channel("admin-messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const incoming = payload.new as ChatMsg;
          // Update active thread if it matches
          setSelected((sel) => {
            if (sel && incoming.artist_email === sel.email) {
              setMsgs((prev) => {
                if (prev.some((m) => m.id === incoming.id)) return prev;
                if (incoming.sender === "artist") {
                  supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", incoming.id).then(() => {});
                }
                return [...prev.filter((m) => !m.id.startsWith("temp-")), incoming];
              });
            }
            return sel;
          });
          // Bump unread count in thread list
          setThreads((prev) =>
            prev.map((t) =>
              t.email === incoming.artist_email && incoming.sender === "artist"
                ? { ...t, unread: t.unread + 1, lastContent: incoming.content || (incoming.attachment_type === "audio" ? "🎤 Voice message" : `📎 ${incoming.attachment_name ?? "File"}`), lastAt: incoming.created_at }
                : t
            )
          );
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function openThread(thread: ArtistThread) {
    setSelected(thread);
    setMobileView("chat");
    setLoadingMsgs(true);
    setText("");
    clearAttachment();

    const { data } = await supabase.from("messages").select("*")
      .eq("artist_email", thread.email).order("created_at", { ascending: true });

    setMsgs((data ?? []) as ChatMsg[]);
    setLoadingMsgs(false);

    await supabase.from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("artist_email", thread.email).eq("sender", "artist").is("read_at", null);

    setThreads(prev => prev.map(t => t.email === thread.email ? { ...t, unread: 0 } : t));
  }

  function pickFile() { fileInputRef.current?.click(); }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setSendError(`File must be under ${MAX_FILE_MB} MB.`);
      return;
    }
    setAttachment({ file, type: "file" });
    e.target.value = "";
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const mimeType = mr.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const ext = mimeType.includes("mp4") ? "m4a" : mimeType.includes("ogg") ? "ogg" : "webm";
        const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: mimeType });
        const previewUrl = URL.createObjectURL(blob);
        setAttachment({ file, type: "audio", previewUrl });
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordingSecs(0);
      recordingTimerRef.current = setInterval(() => setRecordingSecs(s => s + 1), 1000);
    } catch {
      setSendError("Microphone access denied.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  }

  function clearAttachment() {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
  }

  async function uploadAttachment(file: File, artistEmail: string): Promise<{ url: string } | null> {
    const ext = file.name.split(".").pop() ?? "bin";
    const folder = `admin/${artistEmail.replace(/[@.]/g, "_")}`;
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("chat-attachments").upload(path, file, { contentType: file.type });
    if (error) { setSendError("Upload failed: " + error.message); return null; }
    const { data } = supabase.storage.from("chat-attachments").getPublicUrl(path);
    return { url: data.publicUrl };
  }

  async function sendMsg() {
    const content = text.trim();
    if ((!content && !attachment) || !selected || sending || recording) return;

    requestUnlock(async () => {
      setSending(true);
      setSendError("");
      setText("");

      let attachmentUrl: string | null = null;
      let attachmentType: "file" | "audio" | null = null;
      let attachmentName: string | null = null;

      if (attachment) {
        const up = await uploadAttachment(attachment.file, selected.email);
        if (up) {
          attachmentUrl = up.url;
          attachmentType = attachment.type;
          attachmentName = attachment.file.name;
        }
        clearAttachment();
      }

      const tempId = `temp-${Date.now()}`;
      const tempMsg: ChatMsg = {
        id: tempId, artist_email: selected.email, artist_name: selected.name,
        sender: "admin", content: content || "",
        created_at: new Date().toISOString(), read_at: null,
        attachment_url: attachmentUrl, attachment_type: attachmentType, attachment_name: attachmentName,
      };
      setMsgs(prev => [...prev, tempMsg]);

      const { data: inserted, error } = await supabase.from("messages")
        .insert({ artist_email: selected.email, artist_name: selected.name, sender: "admin",
          content: content || "", attachment_url: attachmentUrl, attachment_type: attachmentType, attachment_name: attachmentName })
        .select().single();

      if (error) {
        setMsgs(prev => prev.filter(m => m.id !== tempId));
        setSendError(error.message || "Failed to send. Please try again.");
        setText(content);
      } else if (inserted) {
        setMsgs(prev => prev.map(m => m.id === tempId ? (inserted as ChatMsg) : m));
        const preview = content || (attachmentType === "audio" ? "🎤 Voice message" : "📎 File attachment");
        fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "admin-message", data: { artist_name: selected.name, email: selected.email, content: preview } }),
        }).catch(() => {});
      }
      setSending(false);
    });
  }

  if (loadingThreads) {
    return <div className="flex items-center justify-center h-48"><Loader2 size={28} className="text-[#007bff] animate-spin" /></div>;
  }

  return (
    <div className="flex h-full gap-0 border border-white/[0.06] rounded-2xl overflow-hidden">

      {/* Artist list */}
      <div className={`flex-shrink-0 w-72 border-r border-white/[0.06] flex flex-col bg-black/30 ${mobileView === "chat" ? "hidden lg:flex" : "flex"}`}>
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Artists</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 && (
            <div className="text-center py-12 text-white/30 text-sm px-4">No artists yet.</div>
          )}
          {threads.map((t) => (
            <button
              key={t.email}
              onClick={() => openThread(t)}
              className={`w-full text-left px-4 py-4 border-b border-white/[0.04] transition-colors hover:bg-white/[0.04] ${
                selected?.email === t.email ? "bg-[#007bff]/10 border-l-2 border-l-[#007bff]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-white text-sm font-semibold truncate">{t.name}</p>
                {t.unread > 0 && (
                  <span className="flex-shrink-0 bg-[#007bff] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {t.unread}
                  </span>
                )}
              </div>
              <p className="text-white/30 text-xs mt-0.5 truncate">{t.email}</p>
              {t.lastContent && (
                <p className="text-white/40 text-xs mt-1.5 truncate">{t.lastContent}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}>
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <MessageSquare size={32} className="text-white/10 mb-3" />
            <p className="text-white/30 text-sm">Select an artist to open their chat</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] flex-shrink-0">
              <button
                className="lg:hidden text-white/40 hover:text-white mr-1"
                onClick={() => { setMobileView("list"); setSelected(null); clearAttachment(); }}
              >
                <ArrowLeft size={18} />
              </button>
              <div className="w-8 h-8 rounded-full bg-[#007bff]/15 flex items-center justify-center flex-shrink-0">
                <span className="text-[#007bff] text-xs font-bold">{selected.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{selected.name}</p>
                <p className="text-white/30 text-xs">{selected.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={24} className="text-[#007bff] animate-spin" />
                </div>
              ) : msgs.length === 0 ? (
                <div className="text-center py-12 text-white/30 text-sm">No messages yet. Start the conversation.</div>
              ) : (
                msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.sender === "admin"
                        ? "bg-[#007bff] text-white rounded-br-sm"
                        : "bg-white/[0.07] text-white/85 rounded-bl-sm"
                    }`}>
                      {m.sender === "artist" && (
                        <p className="text-[#007bff] text-[10px] font-bold uppercase tracking-widest mb-1">
                          {m.artist_name || selected.name}
                        </p>
                      )}
                      {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}
                      {m.attachment_url && m.attachment_type && (
                        <AttachmentBubble
                          url={m.attachment_url}
                          type={m.attachment_type}
                          name={m.attachment_name}
                          isAdmin={m.sender === "admin"}
                        />
                      )}
                      <p className={`text-[10px] mt-1.5 ${m.sender === "admin" ? "text-white/50" : "text-white/30"}`}>
                        {new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        {" · "}
                        {new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-white/[0.06] flex-shrink-0">
              {sendError && <p className="text-red-400 text-xs mb-2">{sendError}</p>}

              {recording && (
                <div className="mb-2 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <span className="text-red-400 text-xs font-medium flex-1">Recording… {formatSecs(recordingSecs)}</span>
                  <button onClick={stopRecording} className="text-red-400 hover:text-red-300 text-xs font-semibold">Stop</button>
                </div>
              )}

              {attachment && (
                <div className="mb-2 flex items-center gap-2 bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2">
                  {attachment.type === "audio" ? (
                    <>
                      <Mic size={13} className="text-[#007bff] flex-shrink-0" />
                      <audio controls src={attachment.previewUrl} className="flex-1 min-w-0" style={{ height: 32 }} />
                    </>
                  ) : (
                    <>
                      <FileText size={13} className="text-[#007bff] flex-shrink-0" />
                      <span className="text-white/70 text-xs truncate flex-1">{attachment.file.name}</span>
                    </>
                  )}
                  <button onClick={clearAttachment} className="text-white/30 hover:text-white flex-shrink-0 ml-1">
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex gap-2 items-center">
                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" />

                <button
                  onClick={pickFile}
                  disabled={recording || !!attachment}
                  title="Attach file"
                  className="text-white/40 hover:text-white disabled:opacity-30 p-2.5 rounded-xl hover:bg-white/[0.05] transition-colors flex-shrink-0"
                >
                  <Paperclip size={18} />
                </button>

                <button
                  onClick={recording ? stopRecording : startRecording}
                  disabled={!!attachment && !recording}
                  title={recording ? "Stop recording" : "Voice message"}
                  className={`p-2.5 rounded-xl transition-colors flex-shrink-0 disabled:opacity-30 ${
                    recording
                      ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                      : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {recording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                  placeholder={attachment ? `Caption for ${selected.name}… (optional)` : `Message ${selected.name}…`}
                  rows={1}
                  style={{ resize: "none", maxHeight: "120px" }}
                  className="flex-1 bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors overflow-y-auto"
                />

                <button
                  onClick={sendMsg}
                  disabled={(!text.trim() && !attachment) || sending || recording}
                  className="bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white p-3 rounded-xl transition-colors flex-shrink-0"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Contact Forms ─────────────────────────────────────────────────────────────

function ContactForms() {
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMsg | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(READ_KEY) ?? "[]") as string[];
      setReadIds(new Set(stored));
    } catch { /* ignore */ }
  }, []);

  function markRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(READ_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }

  useEffect(() => {
    supabase.from("contact_messages").select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setMessages(data ?? []); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-48"><Loader2 size={28} className="text-[#007bff] animate-spin" /></div>;
  }

  return (
    <div className="space-y-3 overflow-y-auto h-full">
      {messages.length === 0 && (
        <div className="text-center py-20 text-white/30">No contact messages yet.</div>
      )}
      {messages.map((m) => {
        const isRead = readIds.has(m.id);
        return (
          <button
            key={m.id}
            onClick={() => { setSelected(m); markRead(m.id); }}
            className={`w-full text-left hover:bg-white/[0.06] border rounded-2xl p-5 transition-all ${
              isRead ? "bg-white/[0.02] border-white/[0.04]" : "bg-white/[0.05] border-white/[0.1]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 bg-[#007bff]/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 relative">
                  <Mail size={16} className="text-[#007bff]" />
                  {!isRead && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#007bff] rounded-full" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-white font-semibold text-sm">{m.name}</p>
                    {m.inquiry_type && (
                      <span className="text-xs bg-[#007bff]/10 text-[#007bff] px-2 py-0.5 rounded-full">{m.inquiry_type}</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{m.email}</p>
                  {m.subject && <p className="text-white/60 text-sm mt-2 font-medium">{m.subject}</p>}
                  <p className="text-white/40 text-sm mt-1 truncate">{m.message}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-white/30 text-xs mt-1">
                  {new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {isRead && <CheckCheck size={13} className="text-white/20" />}
              </div>
            </div>
          </button>
        );
      })}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                  <a href={`mailto:${selected.email}`} className="text-[#007bff] text-sm hover:underline mt-0.5 block">{selected.email}</a>
                </div>
                {selected.inquiry_type && (
                  <span className="text-xs bg-[#007bff]/10 text-[#007bff] px-3 py-1 rounded-full">{selected.inquiry_type}</span>
                )}
              </div>
              {selected.subject && <p className="text-white/70 font-medium mt-4">{selected.subject}</p>}
              <p className="text-white/30 text-xs mt-1">{new Date(selected.created_at).toLocaleString()}</p>
            </div>
            <div className="p-6">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>
            <div className="p-6 border-t border-white/[0.06] flex gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 text-sm font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/30 py-3 rounded-xl transition-colors"
              >
                Close
              </button>
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject ?? "Your message to Orinlabí"}`}
                className="flex-1 text-sm font-semibold bg-[#007bff] hover:bg-[#0069d9] text-white py-3 rounded-xl transition-colors text-center flex items-center justify-center gap-2"
              >
                <Mail size={15} /> Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
