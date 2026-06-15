"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Music, MessageSquare, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

type Release = {
  id: string;
  artist_name: string;
  song_title: string;
  genre: string;
  release_type: string;
  status: string;
  submitted_at: string;
};

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  created_at: string;
};

type Stats = {
  pending: number;
  approved: number;
  rejected: number;
  messages: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, messages: 0 });
  const [recentReleases, setRecentReleases] = useState<Release[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { count: pending },
        { count: approved },
        { count: rejected },
        { count: messages },
        { data: releases },
        { data: msgs },
      ] = await Promise.all([
        supabase.from("releases").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("releases").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("releases").select("*", { count: "exact", head: true }).eq("status", "rejected"),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
        supabase.from("releases").select("id,artist_name,song_title,genre,release_type,status,submitted_at").order("submitted_at", { ascending: false }).limit(5),
        supabase.from("contact_messages").select("id,name,email,subject,created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        pending: pending ?? 0,
        approved: approved ?? 0,
        rejected: rejected ?? 0,
        messages: messages ?? 0,
      });
      setRecentReleases(releases ?? []);
      setRecentMessages(msgs ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#007bff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-white font-bold text-2xl">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Welcome back, Ralph.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Clock size={20} />} label="Pending" value={stats.pending} color="text-yellow-400" bg="bg-yellow-400/10" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Approved" value={stats.approved} color="text-green-400" bg="bg-green-400/10" />
        <StatCard icon={<XCircle size={20} />} label="Rejected" value={stats.rejected} color="text-red-400" bg="bg-red-400/10" />
        <StatCard icon={<MessageSquare size={20} />} label="Messages" value={stats.messages} color="text-[#007bff]" bg="bg-[#007bff]/10" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent releases */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Music size={16} className="text-[#007bff]" /> Recent Submissions
            </h3>
            <Link href="/admin/releases" className="text-[#007bff] text-xs flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentReleases.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-10">No submissions yet.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentReleases.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-white text-sm font-medium">{r.song_title}</p>
                    <p className="text-white/40 text-xs mt-0.5">{r.artist_name} · {r.genre}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <MessageSquare size={16} className="text-[#007bff]" /> Recent Messages
            </h3>
            <Link href="/admin/messages" className="text-[#007bff] text-xs flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-10">No messages yet.</p>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentMessages.map((m) => (
                <div key={m.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">{m.name}</p>
                    <p className="text-white/30 text-xs">{new Date(m.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-white/40 text-xs mt-0.5 truncate">{m.subject || m.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }: {
  icon: React.ReactNode; label: string; value: number; color: string; bg: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${color} mb-4`}>
        {icon}
      </div>
      <p className="text-white font-bold text-3xl">{value}</p>
      <p className="text-white/40 text-xs mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-400/10 text-yellow-400",
    approved: "bg-green-400/10 text-green-400",
    rejected: "bg-red-400/10 text-red-400",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${map[status] ?? "bg-white/10 text-white/40"}`}>
      {status}
    </span>
  );
}
