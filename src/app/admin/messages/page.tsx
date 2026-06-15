"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Loader2 } from "lucide-react";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiry_type: string;
  created_at: string;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  useEffect(() => {
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMessages(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-white font-bold text-2xl">Messages</h1>
        <p className="text-white/40 text-sm mt-1">
          All contact form submissions.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-[#007bff] animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-white/30">No messages yet.</div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className="w-full text-left bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#007bff]/30 rounded-2xl p-5 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 bg-[#007bff]/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail size={16} className="text-[#007bff]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-white font-semibold text-sm">{m.name}</p>
                      {m.inquiry_type && (
                        <span className="text-xs bg-[#007bff]/10 text-[#007bff] px-2 py-0.5 rounded-full">
                          {m.inquiry_type}
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs mt-0.5">{m.email}</p>
                    {m.subject && (
                      <p className="text-white/60 text-sm mt-2 font-medium">{m.subject}</p>
                    )}
                    <p className="text-white/40 text-sm mt-1 truncate">{m.message}</p>
                  </div>
                </div>
                <p className="text-white/30 text-xs flex-shrink-0 mt-1">
                  {new Date(m.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/[0.08] rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-[#007bff] text-sm hover:underline mt-0.5 block"
                  >
                    {selected.email}
                  </a>
                </div>
                {selected.inquiry_type && (
                  <span className="text-xs bg-[#007bff]/10 text-[#007bff] px-3 py-1 rounded-full">
                    {selected.inquiry_type}
                  </span>
                )}
              </div>
              {selected.subject && (
                <p className="text-white/70 font-medium mt-4">{selected.subject}</p>
              )}
              <p className="text-white/30 text-xs mt-1">
                {new Date(selected.created_at).toLocaleString()}
              </p>
            </div>

            <div className="p-6">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </p>
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
