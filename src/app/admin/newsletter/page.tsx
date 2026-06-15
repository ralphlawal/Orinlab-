"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Download, UserCheck, UserX } from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  subscribed_at: string;
  active: boolean;
};

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");

  async function load() {
    setLoading(true);
    let query = supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });
    if (filter === "active") query = query.eq("active", true);
    if (filter === "inactive") query = query.eq("active", false);
    const { data } = await query;
    setSubscribers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleActive(id: string, current: boolean) {
    await supabase
      .from("newsletter_subscribers")
      .update({ active: !current })
      .eq("id", id);
    load();
  }

  function exportCSV() {
    const rows = [
      ["Email", "Subscribed At", "Active"],
      ...subscribers.map((s) => [
        s.email,
        new Date(s.subscribed_at).toLocaleDateString("en-GB"),
        s.active ? "Yes" : "No",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orinlabi-subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeCount = subscribers.filter((s) => s.active).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl">Newsletter</h1>
          <p className="text-white/40 text-sm mt-1">
            {activeCount} active subscriber{activeCount !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-xl">
            {(["active", "inactive", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  filter === f ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={exportCSV}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white border border-white/10 hover:border-white/30 disabled:opacity-30 px-3 py-2.5 rounded-xl transition-colors"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="text-[#007bff] animate-spin" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          No {filter !== "all" ? filter : ""} subscribers yet.
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 text-white/30 text-xs uppercase tracking-widest font-medium">
                  Email
                </th>
                <th className="text-left px-5 py-3.5 text-white/30 text-xs uppercase tracking-widest font-medium hidden sm:table-cell">
                  Subscribed
                </th>
                <th className="text-left px-5 py-3.5 text-white/30 text-xs uppercase tracking-widest font-medium">
                  Status
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-white/[0.04] last:border-0 ${
                    i % 2 === 0 ? "" : "bg-white/[0.01]"
                  }`}
                >
                  <td className="px-5 py-4 text-white/80 text-sm font-medium">
                    {s.email}
                  </td>
                  <td className="px-5 py-4 text-white/30 text-xs hidden sm:table-cell">
                    {new Date(s.subscribed_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      s.active
                        ? "bg-green-400/10 text-green-400"
                        : "bg-white/5 text-white/30"
                    }`}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => toggleActive(s.id, s.active)}
                      className="text-white/30 hover:text-white transition-colors"
                      title={s.active ? "Deactivate" : "Reactivate"}
                    >
                      {s.active ? <UserX size={15} /> : <UserCheck size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
