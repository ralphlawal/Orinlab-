"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const INPUT = "w-full bg-white/[0.05] border border-white/[0.10] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl transition-colors";

export function InviteRequestForm() {
  const [open, setOpen]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState("");
  const [form, setForm]           = useState({ name: "", email: "", genre: "", message: "" });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
    } catch {
      setError("Something went wrong. Email us directly at info@orinlabi.com");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={24} className="text-green-400" />
        </div>
        <p className="text-white font-semibold text-base mb-1">Application received.</p>
        <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
          We&apos;ll review it personally and be in touch at{" "}
          <span className="text-white/70">{form.email}</span> within 5 business days.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="text-center">
        <p className="text-white/30 text-sm mb-3">Can&apos;t subscribe right now?</p>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm font-semibold transition-colors group"
        >
          Apply for artist access
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 text-left">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="Your full name *"
          value={form.name}
          onChange={set("name")}
          className={INPUT}
        />
        <input
          required
          type="email"
          placeholder="Email address *"
          value={form.email}
          onChange={set("email")}
          className={INPUT}
        />
      </div>
      <input
        placeholder="Your genre / style (e.g. Afrobeats, Amapiano, Highlife)"
        value={form.genre}
        onChange={set("genre")}
        className={INPUT}
      />
      <textarea
        required
        rows={4}
        placeholder="Tell us about your music and why you'd like to join OrinlabÍ Records *"
        value={form.message}
        onChange={set("message")}
        className={INPUT + " resize-none leading-relaxed"}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors active:scale-95"
        >
          {submitting
            ? <Loader2 size={14} className="animate-spin" />
            : <Sparkles size={14} />}
          Submit Application
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-white/30 hover:text-white text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
