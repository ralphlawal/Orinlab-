"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setState("success");
      setMessage("You're subscribed!");
      setEmail("");
    } else {
      setState("error");
      setMessage(data.error ?? "Something went wrong. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className={`flex items-center gap-3 bg-[#007bff]/10 border border-[#007bff]/20 rounded-full px-5 py-3 ${compact ? "" : "justify-center max-w-lg mx-auto px-6 py-4"}`}>
        <CheckCircle2 size={16} className="text-[#007bff] flex-shrink-0" />
        <p className="text-white/70 text-sm">{message}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
            placeholder="Your email"
            required
            className="flex-1 bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-xs px-4 py-2.5 rounded-full transition-colors min-w-0"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-full text-xs transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
          >
            {state === "loading" && <Loader2 size={12} className="animate-spin" />}
            Subscribe
          </button>
        </div>
        {state === "error" && (
          <p className="text-red-400 text-xs">{message}</p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3 max-w-lg mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
          placeholder="Enter your email"
          required
          className="flex-1 bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-5 py-3.5 rounded-full transition-colors"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-60 text-white font-semibold px-6 py-3.5 rounded-full text-sm transition-colors whitespace-nowrap flex items-center gap-2"
        >
          {state === "loading" && <Loader2 size={14} className="animate-spin" />}
          Subscribe
        </button>
      </div>
      {state === "error" && (
        <p className="text-red-400 text-xs text-center">{message}</p>
      )}
    </form>
  );
}
