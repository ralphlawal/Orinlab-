"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Send, Paperclip, Mic, MicOff, X, FileText } from "lucide-react";

type Msg = {
  id: string;
  sender: "admin" | "artist";
  content: string;
  created_at: string;
  attachment_url: string | null;
  attachment_type: "file" | "audio" | null;
  attachment_name: string | null;
};

type PendingAttachment = {
  file: File;
  type: "file" | "audio";
  previewUrl?: string;
};

const MAX_FILE_MB = 20;

function formatSecs(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

function AttachmentBubble({ url, type, name, isArtist }: { url: string; type: string; name: string | null; isArtist: boolean }) {
  if (type === "audio") {
    return (
      <div className="mt-2">
        <audio controls src={url} className="max-w-full" style={{ height: 36, maxWidth: 240 }} />
      </div>
    );
  }
  return (
    <a
      href={url} target="_blank" rel="noopener noreferrer"
      className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs transition-colors ${
        isArtist ? "bg-white/20 hover:bg-white/30 text-white" : "bg-white/[0.07] hover:bg-white/[0.12] text-white/80"
      }`}
    >
      <FileText size={13} className="flex-shrink-0" />
      <span className="truncate max-w-[180px]">{name ?? "Download file"}</span>
    </a>
  );
}

export default function PortalMessagesPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [artistName, setArtistName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const e = session.user.email!;
      setEmail(e);

      const [{ data: rel }, { data: thread }] = await Promise.all([
        supabase.from("releases").select("artist_name").eq("email", e)
          .order("submitted_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("messages").select("*").eq("artist_email", e)
          .order("created_at", { ascending: true }),
      ]);

      setArtistName(rel?.artist_name ?? "");
      setMsgs((thread ?? []) as Msg[]);
      setLoading(false);

      supabase.from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("artist_email", e).eq("sender", "admin").is("read_at", null)
        .then(() => {});
    }
    load();
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (!email) return;
    const channel = supabase
      .channel(`portal-messages-${email}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `artist_email=eq.${email}` },
        (payload) => {
          const incoming = payload.new as Msg;
          setMsgs((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            if (incoming.sender === "admin") {
              supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", incoming.id).then(() => {});
            }
            return [...prev.filter((m) => !m.id.startsWith("temp-")), incoming];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [email]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

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

  async function uploadAttachment(file: File): Promise<{ url: string } | null> {
    const ext = file.name.split(".").pop() ?? "bin";
    const folder = email.replace(/[@.]/g, "_");
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("chat-attachments").upload(path, file, { contentType: file.type });
    if (error) { setSendError("Upload failed: " + error.message); return null; }
    const { data } = supabase.storage.from("chat-attachments").getPublicUrl(path);
    return { url: data.publicUrl };
  }

  async function send() {
    const content = text.trim();
    if ((!content && !attachment) || !email || sending || recording) return;
    setSending(true);
    setSendError("");
    setText("");

    let attachmentUrl: string | null = null;
    let attachmentType: "file" | "audio" | null = null;
    let attachmentName: string | null = null;

    if (attachment) {
      const up = await uploadAttachment(attachment.file);
      if (up) {
        attachmentUrl = up.url;
        attachmentType = attachment.type;
        attachmentName = attachment.file.name;
      }
      clearAttachment();
    }

    const tempId = `temp-${Date.now()}`;
    setMsgs(prev => [...prev, {
      id: tempId, sender: "artist", content: content || "",
      created_at: new Date().toISOString(),
      attachment_url: attachmentUrl, attachment_type: attachmentType, attachment_name: attachmentName,
    }]);

    const { data: inserted, error } = await supabase.from("messages")
      .insert({ artist_email: email, sender: "artist", content: content || "", artist_name: artistName,
        attachment_url: attachmentUrl, attachment_type: attachmentType, attachment_name: attachmentName })
      .select().single();

    if (error) {
      setMsgs(prev => prev.filter(m => m.id !== tempId));
      setSendError(error.message || "Failed to send. Please try again.");
      setText(content);
    } else if (inserted) {
      setMsgs(prev => prev.map(m => m.id === tempId ? (inserted as Msg) : m));
      const preview = content || (attachmentType === "audio" ? "🎤 Voice message" : "📎 File attachment");
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "artist-message", data: { artist_name: artistName, email, content: preview } }),
      }).catch(() => {});
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-8 flex flex-col h-[calc(100svh-7rem)] md:h-[calc(100svh-8rem)]">
      <div className="mb-5 flex-shrink-0">
        <h1 className="text-white font-bold text-2xl">Messages</h1>
        <p className="text-white/40 text-sm mt-1">
          Chat directly with the Orinlabí team.
          {email && <span className="ml-2 text-white/20 text-xs">({email})</span>}
        </p>
      </div>

      {/* Chat thread */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2 min-h-0">
        {msgs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">No messages yet.</p>
            <p className="text-white/20 text-xs mt-1">Send us a message — we reply within a few hours.</p>
          </div>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "artist" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              m.sender === "artist"
                ? "bg-[#007bff] text-white rounded-br-sm"
                : "bg-white/[0.07] text-white/85 rounded-bl-sm"
            }`}>
              {m.sender === "admin" && (
                <p className="text-[#007bff] text-[10px] font-bold uppercase tracking-widest mb-1">Orinlabí</p>
              )}
              {m.content && <p className="whitespace-pre-wrap break-words">{m.content}</p>}
              {m.attachment_url && m.attachment_type && (
                <AttachmentBubble
                  url={m.attachment_url}
                  type={m.attachment_type}
                  name={m.attachment_name}
                  isArtist={m.sender === "artist"}
                />
              )}
              <p className={`text-[10px] mt-1.5 ${m.sender === "artist" ? "text-white/50" : "text-white/30"}`}>
                {new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                {" · "}
                {new Date(m.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 pt-4 border-t border-white/[0.06]">
        {sendError && <p className="text-red-400 text-xs mb-2 px-1">{sendError}</p>}

        {/* Recording indicator */}
        {recording && (
          <div className="mb-2 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span className="text-red-400 text-xs font-medium flex-1">Recording… {formatSecs(recordingSecs)}</span>
            <button onClick={stopRecording} className="text-red-400 hover:text-red-300 text-xs font-semibold">Stop</button>
          </div>
        )}

        {/* Attachment preview */}
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
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={attachment ? "Add a caption… (optional)" : "Type a message…"}
            rows={1}
            style={{ resize: "none", maxHeight: "120px" }}
            className="flex-1 bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors overflow-y-auto"
          />

          <button
            onClick={send}
            disabled={(!text.trim() && !attachment) || sending || recording}
            className="bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white p-3 rounded-xl transition-colors flex-shrink-0"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </section>
  );
}
