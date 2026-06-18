"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Bell, CheckCheck } from "lucide-react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

const TYPE_DOT: Record<string, string> = {
  release_approved: "bg-green-400",
  release_rejected: "bg-red-400",
  release_live:     "bg-[#1db954]",
  payment_sent:     "bg-yellow-400",
  announcement:     "bg-[#007bff]",
  pitch_update:     "bg-purple-400",
};

export default function NotificationsPage() {
  const [items, setItems]   = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail]   = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      setEmail(data.session.user.email ?? null);
      supabase
        .from("notifications")
        .select("*")
        .eq("email", data.session.user.email!)
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data: d }) => { setItems((d ?? []) as Notification[]); setLoading(false); });
    });
  }, []);

  async function markAllRead() {
    if (!email) return;
    await supabase.from("notifications").update({ read: true }).eq("email", email).eq("read", false);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  const unread = items.filter((n) => !n.read).length;

  return (
    <section className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <Bell size={22} /> Notifications
            {unread > 0 && (
              <span className="bg-[#007bff] text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>
            )}
          </h1>
          <p className="text-white/40 text-sm mt-1">Updates about your releases and account.</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-lg transition-colors">
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 size={26} className="text-[#007bff] animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={36} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/40">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const dot = TYPE_DOT[n.type] ?? "bg-white/20";
            const inner = (
              <div onClick={() => !n.read && markRead(n.id)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
                  n.read
                    ? "bg-white/[0.02] border-white/[0.04] opacity-60"
                    : "bg-white/[0.05] border-white/[0.10] hover:border-white/20"
                }`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dot} ${!n.read ? "animate-pulse" : ""}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${n.read ? "text-white/60" : "text-white"}`}>{n.title}</p>
                  {n.body && <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{n.body}</p>}
                  <p className="text-white/25 text-xs mt-1.5">
                    {new Date(n.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link}>{inner}</Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </section>
  );
}
