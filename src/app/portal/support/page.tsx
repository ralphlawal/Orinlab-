"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, LifeBuoy, CheckCircle2, ChevronDown, ChevronUp, Clock, MessageCircle } from "lucide-react";

type Ticket = {
  id: string;
  subject: string;
  category: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  admin_response: string | null;
  created_at: string;
};

const CATEGORIES = [
  "Release / Distribution Issue",
  "Royalties & Payments",
  "Contract / Legal",
  "Profile / Account",
  "Technical Problem",
  "Takedown Request",
  "Other",
];

const STATUS_STYLES = {
  open:        { label: "Open",        color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", icon: <Clock size={11} /> },
  in_progress: { label: "In Progress", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20",     icon: <Loader2 size={11} /> },
  closed:      { label: "Closed",      color: "text-green-400",  bg: "bg-green-400/10 border-green-400/20",   icon: <CheckCircle2 size={11} /> },
};

const inp = "w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl resize-none transition-colors";

export default function SupportPage() {
  const [tickets, setTickets]     = useState<Ticket[]>([]);
  const [loading, setLoading]     = useState(true);
  const [email, setEmail]         = useState<string | null>(null);
  const [artistName, setArtistName] = useState("");
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [subject, setSubject]     = useState("");
  const [category, setCategory]   = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const e = data.session.user.email!;
      setEmail(e);

      const [{ data: t }, { data: p }] = await Promise.all([
        supabase.from("support_tickets").select("*").eq("email", e).order("created_at", { ascending: false }),
        supabase.from("artist_profiles").select("artist_name").eq("email", e).maybeSingle(),
      ]);
      setTickets((t ?? []) as Ticket[]);
      setArtistName(p?.artist_name ?? "");
      setLoading(false);
    });
  }, []);

  async function submit() {
    if (!subject.trim() || !description.trim() || !email) return;
    setSubmitting(true);
    await supabase.from("support_tickets").insert({
      email, artist_name: artistName, subject: subject.trim(),
      category, description: description.trim(), status: "open",
    });
    // Notify admin
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "support-ticket",
        data: { email, artist_name: artistName, subject: subject.trim(), category, description: description.trim() },
      }),
    }).catch(() => {});
    // Artist confirmation
    fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "support-confirmation",
        data: { email, artist_name: artistName, subject: subject.trim(), category },
      }),
    }).catch(() => {});
    setSubject(""); setDescription(""); setCategory(CATEGORIES[0]);
    setShowForm(false); setSubmitted(true);
    // Reload tickets
    const { data } = await supabase.from("support_tickets").select("*").eq("email", email).order("created_at", { ascending: false });
    setTickets((data ?? []) as Ticket[]);
    setSubmitting(false);
  }

  if (loading) return (
    <section className="max-w-2xl mx-auto px-4 py-10 space-y-4">
      <div className="skeleton h-8 w-48 rounded-xl" />
      {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      <div className="skeleton h-48 rounded-2xl mt-4" />
    </section>
  );

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2"><LifeBuoy size={22} /> Support</h1>
          <p className="text-white/40 text-sm mt-1">Submit a request and our team will get back to you within 1–2 business days.</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setSubmitted(false); }}
          className="flex-shrink-0 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
        >
          + New Ticket
        </button>
      </div>

      {submitted && (
        <div className="mb-6 flex items-center gap-3 bg-green-400/10 border border-green-400/20 rounded-2xl px-5 py-4">
          <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm font-medium">Ticket submitted. We&apos;ll be in touch shortly.</p>
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-sm">New Support Request</h2>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inp + " appearance-none bg-[#0a0a0a]"}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your issue…" className={inp} />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe your issue in detail. Include release names, dates, or any error messages." className={inp} />
          </div>
          <button
            onClick={submit}
            disabled={submitting || !subject.trim() || !description.trim()}
            className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <LifeBuoy size={36} className="mx-auto mb-4 opacity-20" />
          <p>No tickets yet. If you need help, open a new request above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const st = STATUS_STYLES[t.status] ?? STATUS_STYLES.open;
            const isOpen = expanded === t.id;
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
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${st.bg} ${st.color}`}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <p className="text-white/30 text-xs mt-0.5">{t.category} · {new Date(t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-white/30 flex-shrink-0" /> : <ChevronDown size={16} className="text-white/30 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="border-t border-white/[0.06] px-5 py-4 space-y-4">
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Your message</p>
                      <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{t.description}</p>
                    </div>
                    {t.admin_response && (
                      <div className="bg-[#007bff]/8 border border-[#007bff]/20 rounded-xl px-4 py-4">
                        <p className="text-[#007bff] text-xs font-semibold mb-2 uppercase tracking-widest">Response from OrinlabÍ Records</p>
                        <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{t.admin_response}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
