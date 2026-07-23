"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePinGate } from "@/context/AdminPinContext";
import {
  UserPlus, CheckCircle2, XCircle, Loader2, Shield, ShieldAlert,
  Trash2, Mail, Clock, RefreshCw, Users, Copy,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type StaffRole = "reviewer" | "support" | "finance" | "distribution" | "super_admin";

type StaffMember = {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  status: "pending" | "active" | "removed";
  invited_by: string | null;
  invited_at: string;
  approved_at: string | null;
  notes: string | null;
};

const ROLES: { key: StaffRole; label: string; desc: string; color: string }[] = [
  { key: "reviewer",     label: "Reviewer",     desc: "Review & approve/reject releases",         color: "#60a5fa" },
  { key: "support",      label: "Support",       desc: "Handle support tickets and messages",       color: "#34d399" },
  { key: "finance",      label: "Finance",       desc: "Manage payouts and financial reports",      color: "#fbbf24" },
  { key: "distribution", label: "Distribution",  desc: "Manage pipeline, store links & stages",     color: "#a78bfa" },
  { key: "super_admin",  label: "Super Admin",   desc: "Full access — all features",               color: "#f472b6" },
];

const STATUS_CFG = {
  pending:  { label: "Pending",  color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", Icon: Clock         },
  active:   { label: "Active",   color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", Icon: CheckCircle2 },
  removed:  { label: "Removed",  color: "text-white/30",   bg: "bg-white/[0.04] border-white/[0.06]",   Icon: XCircle       },
};

const SUPER_ADMIN = (
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ||
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",")[0]
).trim().toLowerCase();

// ─── SQL migration helper (shown in the setup card) ────────────────────────────

const MIGRATION_SQL = `CREATE TABLE IF NOT EXISTS public.admin_staff (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'reviewer',
  status      TEXT NOT NULL DEFAULT 'pending',
  invited_by  TEXT,
  invited_at  TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  notes       TEXT
);
ALTER TABLE public.admin_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON public.admin_staff USING (false);`;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const { requestUnlock } = usePinGate();

  const [staff, setStaff]       = useState<StaffMember[]>([]);
  const [loading, setLoading]   = useState(true);
  const [dbReady, setDbReady]   = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [copied, setCopied]     = useState(false);

  // Invite form
  const [inviteName,  setInviteName]  = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState<StaffRole>("reviewer");
  const [inviteNotes, setInviteNotes] = useState("");
  const [inviting,    setInviting]    = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Per-row state
  const [approving, setApproving] = useState<string | null>(null);
  const [removing,  setRemoving]  = useState<string | null>(null);

  // Filter
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "removed">("all");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAdminEmail(data.session?.user?.email ?? "");
    });
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_staff")
      .select("*")
      .order("invited_at", { ascending: false });

    if (error?.code === "42P01") {
      // Table doesn't exist yet
      setDbReady(false);
      setLoading(false);
      return;
    }
    setDbReady(true);
    setStaff((data ?? []) as StaffMember[]);
    setLoading(false);
  }

  async function invite() {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError("Name and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setInviteError("Enter a valid email address.");
      return;
    }
    setInviting(true);
    setInviteError(null);

    const { error } = await supabase.from("admin_staff").insert({
      email:      inviteEmail.toLowerCase().trim(),
      name:       inviteName.trim(),
      role:       inviteRole,
      status:     "pending",
      invited_by: adminEmail,
      notes:      inviteNotes.trim() || null,
    });

    if (error) {
      setInviteError(error.code === "23505" ? "This email is already on the staff list." : error.message);
      setInviting(false);
      return;
    }

    // Notify yourself (admin) in-app
    await supabase.from("notifications").insert({
      email: adminEmail,
      type:  "info",
      title: `Staff invite created — ${inviteName.trim()}`,
      body:  `You've added ${inviteName.trim()} (${inviteEmail}) as a ${ROLES.find((r) => r.key === inviteRole)?.label ?? inviteRole}. Approve them below to grant access.`,
      link:  "/admin/staff",
    });

    setInviteName(""); setInviteEmail(""); setInviteNotes("");
    setInviting(false);
    load();
  }

  async function approve(member: StaffMember) {
    setApproving(member.id);
    await supabase.from("admin_staff").update({ status: "active", approved_at: new Date().toISOString() }).eq("id", member.id);
    setStaff((prev) => prev.map((s) => s.id === member.id ? { ...s, status: "active", approved_at: new Date().toISOString() } : s));
    setApproving(null);
  }

  async function remove(member: StaffMember) {
    setRemoving(member.id);
    await supabase.from("admin_staff").update({ status: "removed" }).eq("id", member.id);
    setStaff((prev) => prev.map((s) => s.id === member.id ? { ...s, status: "removed" } : s));
    setRemoving(null);
  }

  async function hardDelete(id: string) {
    await supabase.from("admin_staff").delete().eq("id", id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }

  const isSuperAdmin = adminEmail.toLowerCase() === SUPER_ADMIN;

  const filtered = staff.filter((s) => filter === "all" || s.status === filter);
  const pendingCount = staff.filter((s) => s.status === "pending").length;
  const activeCount  = staff.filter((s) => s.status === "active").length;

  // ─── DB not set up yet ────────────────────────────────────────────────────────
  if (!dbReady) {
    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2"><Users size={22} /> Staff Management</h1>
          <p className="text-white/40 text-sm mt-1">Add and manage admin staff members.</p>
        </div>

        <div className="bg-amber-400/[0.07] border border-amber-400/25 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldAlert size={20} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">Database table not set up</p>
              <p className="text-white/40 text-xs mt-0.5">Run this SQL in your Supabase SQL editor to enable staff management.</p>
            </div>
          </div>
          <div className="relative">
            <pre className="bg-black/40 rounded-xl p-4 text-xs text-white/60 font-mono leading-relaxed overflow-x-auto">
              {MIGRATION_SQL}
            </pre>
            <button
              onClick={() => { navigator.clipboard.writeText(MIGRATION_SQL); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-semibold text-white/40 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <CheckCircle2 size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button onClick={load} className="flex items-center gap-2 text-xs font-semibold text-[#007bff] hover:text-white border border-[#007bff]/30 hover:border-white/20 px-4 py-2 rounded-xl transition-colors">
            <RefreshCw size={12} /> Check again after running the SQL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white font-bold text-2xl flex items-center gap-2">
            <Users size={22} /> Staff Management
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {activeCount} active staff member{activeCount !== 1 ? "s" : ""}
            {pendingCount > 0 && ` · ${pendingCount} pending approval`}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 text-xs text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 px-3.5 py-2 rounded-xl transition-colors">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Invite form ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <p className="text-white font-semibold text-sm flex items-center gap-2">
              <UserPlus size={15} className="text-[#007bff]" /> Invite Staff Member
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-white/40 text-xs block mb-1.5">Full Name</label>
                <input
                  className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-3 py-2.5 rounded-xl transition-colors"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Adeola Bakare"
                />
              </div>

              <div>
                <label className="text-white/40 text-xs block mb-1.5">Email Address</label>
                <input
                  type="email"
                  className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-3 py-2.5 rounded-xl transition-colors"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteError(null); }}
                  placeholder="staff@example.com"
                />
              </div>

              <div>
                <label className="text-white/40 text-xs block mb-1.5">Role</label>
                <div className="space-y-1.5">
                  {ROLES.filter((r) => isSuperAdmin || r.key !== "super_admin").map((r) => (
                    <button key={r.key} type="button"
                      onClick={() => setInviteRole(r.key)}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border text-left text-xs transition-all ${
                        inviteRole === r.key
                          ? "border-[#007bff]/40 bg-[#007bff]/[0.08]"
                          : "border-white/[0.07] hover:bg-white/[0.04]"
                      }`}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ background: r.color, opacity: inviteRole === r.key ? 1 : 0.4 }} />
                      <div>
                        <p className={`font-semibold ${inviteRole === r.key ? "text-white" : "text-white/50"}`}>{r.label}</p>
                        <p className="text-white/25 text-[10px] mt-0.5 leading-tight">{r.desc}</p>
                      </div>
                      {inviteRole === r.key && <CheckCircle2 size={12} className="text-[#007bff] ml-auto flex-shrink-0 mt-0.5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/40 text-xs block mb-1.5">Notes <span className="text-white/20">(optional)</span></label>
                <textarea
                  className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-xs px-3 py-2.5 rounded-xl transition-colors resize-none"
                  rows={2}
                  value={inviteNotes}
                  onChange={(e) => setInviteNotes(e.target.value)}
                  placeholder="Any internal context about this staff member…"
                />
              </div>

              {inviteError && <p className="text-rose-400 text-xs">{inviteError}</p>}

              <button
                onClick={() => requestUnlock(invite)}
                disabled={inviting}
                className="w-full flex items-center justify-center gap-2 bg-[#007bff] hover:bg-[#0066dd] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {inviting ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                {inviting ? "Adding…" : "Add to Staff"}
              </button>
            </div>
          </div>

          {/* Role legend */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 space-y-2">
            <p className="text-white/25 text-[10px] uppercase tracking-widest font-bold mb-3">Role Access</p>
            {ROLES.map((r) => (
              <div key={r.key} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <span className="text-white/45 text-xs font-medium w-24 flex-shrink-0">{r.label}</span>
                <span className="text-white/20 text-[10px]">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Staff list ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter tabs */}
          <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl w-fit">
            {(["all", "pending", "active", "removed"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  filter === f ? "bg-[#007bff] text-white" : "text-white/40 hover:text-white"
                }`}>
                {f}
                {f === "pending" && pendingCount > 0 && (
                  <span className="ml-1.5 text-[10px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={24} className="text-[#007bff] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-white/25">
              <Users size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">
                {filter === "all" ? "No staff added yet. Invite someone using the form." : `No ${filter} staff members.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((member) => {
                const roleCfg   = ROLES.find((r) => r.key === member.role);
                const statusCfg = STATUS_CFG[member.status];
                const isApproving = approving === member.id;
                const isRemoving  = removing === member.id;

                return (
                  <div key={member.id}
                    className={`bg-white/[0.03] border rounded-2xl p-5 transition-all ${
                      member.status === "pending"
                        ? "border-yellow-400/20 bg-yellow-400/[0.03]"
                        : member.status === "removed"
                        ? "border-white/[0.04] opacity-50"
                        : "border-white/[0.06]"
                    }`}>

                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm"
                        style={{ background: `${roleCfg?.color ?? "#60a5fa"}20`, color: roleCfg?.color ?? "#60a5fa" }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-white font-semibold text-sm">{member.name}</p>
                            <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                              <Mail size={10} />{member.email}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                              <statusCfg.Icon size={9} />{statusCfg.label}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ color: roleCfg?.color ?? "#60a5fa", background: `${roleCfg?.color ?? "#60a5fa"}15` }}>
                              {roleCfg?.label ?? member.role}
                            </span>
                          </div>
                        </div>

                        {member.notes && (
                          <p className="text-white/30 text-xs mt-2 italic">"{member.notes}"</p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-[10px] text-white/25 flex-wrap">
                          <span>Invited {new Date(member.invited_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                          {member.invited_by && <span>by {member.invited_by}</span>}
                          {member.approved_at && (
                            <span>Active since {new Date(member.approved_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                          )}
                        </div>

                        {/* Actions */}
                        {member.status !== "removed" && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.05]">
                            {member.status === "pending" && (
                              <button
                                onClick={() => requestUnlock(() => approve(member))}
                                disabled={isApproving}
                                className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                              >
                                {isApproving ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                                Approve Access
                              </button>
                            )}
                            {member.status === "active" && (
                              <span className="flex items-center gap-1.5 text-emerald-400/60 text-xs">
                                <Shield size={11} /> Access granted
                              </span>
                            )}
                            <button
                              onClick={() => requestUnlock(() => remove(member))}
                              disabled={isRemoving}
                              className="flex items-center gap-1.5 text-white/25 hover:text-rose-400 text-xs transition-colors ml-auto disabled:opacity-40"
                            >
                              {isRemoving ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                              {member.status === "active" ? "Revoke Access" : "Dismiss"}
                            </button>
                          </div>
                        )}

                        {member.status === "removed" && isSuperAdmin && (
                          <button
                            onClick={() => requestUnlock(() => hardDelete(member.id))}
                            className="flex items-center gap-1 text-white/15 hover:text-rose-400/60 text-[10px] mt-2 transition-colors"
                          >
                            <Trash2 size={10} /> Delete record
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Notice about access */}
      <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
        <p className="text-white/25 text-xs leading-relaxed">
          <strong className="text-white/35">Note:</strong> After approving a staff member, add their email to the{" "}
          <code className="text-white/40 bg-white/[0.06] px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_ADMIN_EMAILS</code> environment variable so they can log in to the admin panel.
          Format: <code className="text-white/40 bg-white/[0.06] px-1 py-0.5 rounded text-[10px]">ralph@orinlabi.com,staff@example.com</code>
        </p>
      </div>
    </div>
  );
}
