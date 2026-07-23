"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Bell, CheckCheck, Trash2, Info, CheckCircle2, AlertTriangle,
  XCircle, Music2, Radio, DollarSign, Megaphone, Zap,
} from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

// Icon + color per notification type
const TYPE_CONFIG: Record<string, { Icon: typeof Bell; color: string; ring: string; bg: string }> = {
  // Release milestones
  release_approved: { Icon: CheckCircle2,   color: "text-emerald-400",  ring: "border-emerald-400/20", bg: "bg-emerald-400/[0.06]"  },
  release_live:     { Icon: Zap,            color: "text-emerald-400",  ring: "border-emerald-400/20", bg: "bg-emerald-400/[0.06]"  },
  release_rejected: { Icon: XCircle,        color: "text-rose-400",     ring: "border-rose-400/20",    bg: "bg-rose-400/[0.05]"     },
  revision_request: { Icon: AlertTriangle,  color: "text-yellow-400",   ring: "border-yellow-400/20",  bg: "bg-yellow-400/[0.05]"   },
  // Semantic types used by admin notify page
  success:          { Icon: CheckCircle2,   color: "text-emerald-400",  ring: "border-emerald-400/20", bg: "bg-emerald-400/[0.06]"  },
  warning:          { Icon: AlertTriangle,  color: "text-yellow-400",   ring: "border-yellow-400/20",  bg: "bg-yellow-400/[0.05]"   },
  error:            { Icon: XCircle,        color: "text-rose-400",     ring: "border-rose-400/20",    bg: "bg-rose-400/[0.05]"     },
  info:             { Icon: Info,           color: "text-[#60a5fa]",    ring: "border-[#60a5fa]/20",   bg: "bg-[#60a5fa]/[0.05]"   },
  // Other types
  payment_sent:     { Icon: DollarSign,     color: "text-[#34d399]",    ring: "border-[#34d399]/20",   bg: "bg-[#34d399]/[0.05]"   },
  payout_sent:      { Icon: DollarSign,     color: "text-[#34d399]",    ring: "border-[#34d399]/20",   bg: "bg-[#34d399]/[0.05]"   },
  pitch_update:     { Icon: Radio,          color: "text-purple-400",   ring: "border-purple-400/20",  bg: "bg-purple-400/[0.05]"   },
  pitch_result:     { Icon: Radio,          color: "text-purple-400",   ring: "border-purple-400/20",  bg: "bg-purple-400/[0.05]"   },
  announcement:     { Icon: Megaphone,      color: "text-[#007bff]",    ring: "border-[#007bff]/20",   bg: "bg-[#007bff]/[0.05]"   },
  music:            { Icon: Music2,         color: "text-[#60a5fa]",    ring: "border-[#60a5fa]/20",   bg: "bg-[#60a5fa]/[0.05]"   },
};

const FALLBACK = { Icon: Bell, color: "text-white/40", ring: "border-white/[0.08]", bg: "bg-white/[0.03]" };

function groupByDate(items: Notification[]) {
  const now       = new Date();
  const todayStr  = now.toDateString();
  const weekAgo   = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const today:    Notification[] = [];
  const thisWeek: Notification[] = [];
  const earlier:  Notification[] = [];

  for (const n of items) {
    const d = new Date(n.created_at);
    if (d.toDateString() === todayStr) today.push(n);
    else if (d >= weekAgo)              thisWeek.push(n);
    else                                earlier.push(n);
  }

  const groups: { label: string; items: Notification[] }[] = [];
  if (today.length)    groups.push({ label: "Today",     items: today    });
  if (thisWeek.length) groups.push({ label: "This Week", items: thisWeek });
  if (earlier.length)  groups.push({ label: "Earlier",   items: earlier  });
  return groups;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems]     = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail]     = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push("/portal/login"); return; }
      const userEmail = data.session.user.email!;
      setEmail(userEmail);
      supabase
        .from("notifications")
        .select("*")
        .eq("email", userEmail)
        .order("created_at", { ascending: false })
        .limit(100)
        .then(({ data: d }) => {
          setItems((d ?? []) as Notification[]);
          setLoading(false);
        });
    });
  }, [router]);

  async function markAllRead() {
    if (!email) return;
    await supabase.from("notifications").update({ read: true }).eq("email", email).eq("read", false);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  async function deleteNotif(id: string) {
    setDeleting(id);
    await supabase.from("notifications").delete().eq("id", id);
    setItems((prev) => prev.filter((n) => n.id !== id));
    setDeleting(null);
  }

  const unread = items.filter((n) => !n.read).length;
  const groups = groupByDate(items);

  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <Bell size={22} className="text-[#f472b6]" />
            Notifications
            {unread > 0 && (
              <span className="bg-[#007bff] text-white text-xs font-bold px-2 py-0.5 rounded-full leading-none">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {unread > 0 ? `${unread} unread · ` : ""}
            {items.length} total notifications
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white border border-white/[0.08] hover:border-white/25 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/[0.04] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <Bell size={40} className="text-white/[0.08] mx-auto mb-4" />
          <p className="text-white/35 text-sm">No notifications yet.</p>
          <p className="text-white/20 text-xs mt-1">Updates about your releases and account will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ label, items: gItems }) => (
            <div key={label}>
              <p className="text-white/25 text-[10px] uppercase tracking-widest font-bold mb-3">{label}</p>
              <div className="space-y-2">
                {gItems.map((n) => {
                  const cfg  = TYPE_CONFIG[n.type] ?? FALLBACK;
                  const Icon = cfg.Icon;

                  const inner = (
                    <div
                      onClick={() => !n.read && markRead(n.id)}
                      className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                        n.read
                          ? `${cfg.ring} bg-white/[0.015] opacity-55 hover:opacity-75`
                          : `${cfg.ring} ${cfg.bg} hover:opacity-90`
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.read ? "bg-white/[0.04]" : cfg.bg} border ${cfg.ring}`}>
                        <Icon size={16} className={n.read ? "text-white/25" : cfg.color} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-start gap-2 flex-wrap">
                          <p className={`text-sm font-semibold leading-snug ${n.read ? "text-white/55" : "text-white"}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007bff] flex-shrink-0 mt-1.5 animate-pulse" />
                          )}
                        </div>
                        {n.body && (
                          <p className="text-white/40 text-xs mt-1 leading-relaxed line-clamp-2">{n.body}</p>
                        )}
                        <p className="text-white/20 text-xs mt-2 tabular-nums">{fmtTime(n.created_at)}</p>
                      </div>

                      {/* Delete button — shows on hover */}
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteNotif(n.id); }}
                        disabled={deleting === n.id}
                        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-rose-400 hover:bg-rose-400/[0.08] transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );

                  return n.link ? (
                    <Link key={n.id} href={n.link} className="block cursor-pointer">
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id} className={!n.read ? "cursor-pointer" : ""}>
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
