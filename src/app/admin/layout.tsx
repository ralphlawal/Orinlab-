"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { AdminPinProvider } from "@/context/AdminPinContext";
import {
  LayoutDashboard, Music, MessageSquare, BookOpen, Mail, LogOut, Loader2, Menu, X,
  Palette, Users, Settings, BarChart2, Megaphone, Radio, DollarSign, LifeBuoy, Globe, MessagesSquare, Bell, ShieldAlert, Send, CreditCard, Zap, Kanban, UserCheck, Link2,
} from "lucide-react";

type Counts = {
  releases: number;
  labels: number;
  support: number;
  payouts: number;
  messages: number;
  pitches: number;
  compliance: number;
  subscribers: number;
};

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const SUPER_ADMIN = (
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ||
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",")[0]
).trim().toLowerCase();

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="ml-auto flex-shrink-0 min-w-[18px] h-[18px] bg-[#007bff] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking]     = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navProgress, setNavProgress] = useState(false);
  const prevPathRef = useRef(pathname);
  const [counts, setCounts] = useState<Counts>({ releases: 0, labels: 0, support: 0, payouts: 0, messages: 0, pitches: 0, compliance: 0, subscribers: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (pathname === "/admin/login") { setChecking(false); return; }
      const email = (data.session?.user?.email ?? "").toLowerCase();
      const isAdmin = Boolean(email) && ADMIN_EMAILS.includes(email);
      if (!isAdmin) { router.replace("/admin/login"); }
      else { setAdminEmail(email); setChecking(false); }
    }).catch(() => { router.replace("/admin/login"); });
  }, [pathname, router]);

  const loadCounts = useCallback(async () => {
    const [
      { count: releases },
      { count: labels },
      { count: support },
      { count: payouts },
      { count: messages },
      { count: pitches },
      { count: subscribers },
      { data: approvedArtists },
      { data: approvedReleases },
    ] = await Promise.all([
      supabase.from("releases").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("label_profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("payout_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("messages").select("*", { count: "exact", head: true }).eq("sender", "artist").is("read_at", null),
      supabase.from("playlist_pitches").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("artist_profiles").select("*", { count: "exact", head: true }).eq("plan_status", "active"),
      supabase.from("artist_profiles").select("email,bio,artist_image_url,instagram_handle,x_handle,tiktok_username,country,payout_method").eq("status", "approved"),
      supabase.from("releases").select("email,store_links,lyrics,royalties_usd").eq("status", "approved"),
    ]);

    // Count artists with at least one compliance gap
    const releasesByEmail: Record<string, typeof approvedReleases> = {};
    for (const r of approvedReleases ?? []) {
      if (!releasesByEmail[r.email]) releasesByEmail[r.email] = [];
      releasesByEmail[r.email]!.push(r);
    }
    let complianceCount = 0;
    for (const a of approvedArtists ?? []) {
      const hasGap =
        !a.bio || !a.artist_image_url || !a.country ||
        (!a.instagram_handle && !a.x_handle && !a.tiktok_username) ||
        (releasesByEmail[a.email] ?? []).some(r => !r.store_links || Object.keys(r.store_links).length === 0) ||
        ((releasesByEmail[a.email] ?? []).some(r => Number(r.royalties_usd ?? 0) > 0) && !a.payout_method);
      if (hasGap) complianceCount++;
    }

    setCounts({
      releases: releases ?? 0,
      labels: labels ?? 0,
      support: support ?? 0,
      payouts: payouts ?? 0,
      messages: messages ?? 0,
      pitches: pitches ?? 0,
      compliance: complianceCount,
      subscribers: subscribers ?? 0,
    });
  }, []);

  useEffect(() => {
    if (!checking && pathname !== "/admin/login") {
      loadCounts();
      // Refresh counts every 60s
      const id = setInterval(loadCounts, 60_000);
      return () => clearInterval(id);
    }
  }, [checking, pathname, loadCounts]);

  // Refresh counts whenever the path changes (user navigates between sections)
  useEffect(() => {
    if (!checking && pathname !== "/admin/login") loadCounts();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigation progress bar
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      setNavProgress(true);
      const t = setTimeout(() => setNavProgress(false), 600);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  const isSuperAdmin = adminEmail === SUPER_ADMIN;

  const NAV_SECTIONS = [
    {
      label: "",
      items: [
        { label: "Dashboard",     href: "/admin",               icon: <LayoutDashboard size={17} />, badge: 0, superOnly: false },
      ],
    },
    {
      label: "Content Review",
      items: [
        { label: "Releases",      href: "/admin/releases",      icon: <Music size={17} />,           badge: counts.releases,          superOnly: false },
        { label: "Pipeline",      href: "/admin/pipeline",      icon: <Kanban size={17} />,          badge: 0,                        superOnly: false },
        { label: "Pitches",       href: "/admin/pitches",       icon: <Radio size={17} />,           badge: counts.pitches,           superOnly: false },
        { label: "Smart Links",   href: "/admin/smart-links",   icon: <Link2 size={17} />,           badge: 0,                        superOnly: false },

      ],
    },
    {
      label: "People",
      items: [
        { label: "Artists",       href: "/admin/artists",       icon: <Users size={17} />,           badge: 0,                        superOnly: false },
        { label: "Staff",         href: "/admin/staff",         icon: <UserCheck size={17} />,       badge: 0,                        superOnly: false },
        { label: "Labels",        href: "/admin/labels",        icon: <Globe size={17} />,           badge: counts.labels,            superOnly: false },
        { label: "Compliance",    href: "/admin/compliance",    icon: <ShieldAlert size={17} />,     badge: counts.compliance,        superOnly: false },
      ],
    },
    {
      label: "Inbox",
      items: [
        { label: "Messages",      href: "/admin/messages",      icon: <MessageSquare size={17} />,   badge: counts.messages, superOnly: false },
        { label: "Support",       href: "/admin/support",       icon: <LifeBuoy size={17} />,        badge: counts.support,  superOnly: false },
        { label: "Team Chat",     href: "/admin/chat",          icon: <MessagesSquare size={17} />,  badge: 0,               superOnly: false },
      ],
    },
    {
      label: "Outreach",
      items: [
        { label: "Email",         href: "/admin/email",         icon: <Send size={17} />,            badge: 0,               superOnly: false },
        { label: "Notify Artists",  href: "/admin/notify",      icon: <Bell size={17} />,            badge: 0,               superOnly: false },
        { label: "Announcements", href: "/admin/announcements", icon: <Megaphone size={17} />,       badge: 0,               superOnly: false },
        { label: "Newsletter",    href: "/admin/newsletter",    icon: <Mail size={17} />,            badge: 0,               superOnly: true  },
      ],
    },
    {
      label: "Finance",
      items: [
        { label: "Subscriptions", href: "/admin/subscriptions", icon: <CreditCard size={17} />,      badge: counts.subscribers, superOnly: false },
        { label: "Payouts",       href: "/admin/payouts",       icon: <DollarSign size={17} />,      badge: counts.payouts,     superOnly: false },
        { label: "Contracts",     href: "/admin/contracts",     icon: <Zap size={17} />,             badge: 0,                  superOnly: false },
      ],
    },
    {
      label: "Platform",
      items: [
        { label: "Analytics",     href: "/admin/analytics",     icon: <BarChart2 size={17} />,       badge: 0,               superOnly: false },
        { label: "Blog",          href: "/admin/blog",          icon: <BookOpen size={17} />,        badge: 0,               superOnly: false },
        { label: "Assets",        href: "/admin/assets",        icon: <Palette size={17} />,         badge: 0,               superOnly: false },
        { label: "Settings",      href: "/admin/settings",      icon: <Settings size={17} />,        badge: 0,               superOnly: true  },
      ],
    },
  ];

  const visibleSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => !item.superOnly || isSuperAdmin),
  })).filter(section => section.items.length > 0);

  const allNavItems = visibleSections.flatMap(s => s.items);

  // Total pending for the hamburger dot
  const totalPending = counts.releases + counts.labels + counts.support + counts.payouts;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (pathname === "/admin/login") {
    return <div className="fixed inset-0 z-[60] bg-black">{children}</div>;
  }

  if (checking) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050505]">
        <Loader2 size={32} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  const currentNavItem = allNavItems.find(n =>
    n.href === "/admin" ? pathname === "/admin" : (n.href !== "/admin" && pathname.startsWith(n.href))
  );
  const currentSection = visibleSections.find(s => s.items.some(i => i === currentNavItem));

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[220px] bg-[#08080b] border-r border-white/[0.07] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Logo */}
        <div className="flex flex-col px-5 pt-5 pb-4">
          <Link href="/" className="block">
            <Image
              src="https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png"
              alt="OrinlabÍ Records" width={88} height={24} className="object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
          <p className="text-white/25 text-[10px] mt-1.5 font-bold tracking-[0.1em] uppercase">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
          {visibleSections.map((section) => (
            <div key={section.label || "top"}>
              {section.label && (
                <p className="px-2 mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/25">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                  return (
                    <div key={item.href} className="relative">
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] bg-[#007bff] rounded-r-full" />
                      )}
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                          active
                            ? "bg-white/[0.07] text-white"
                            : "text-white/45 hover:text-white/80 hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className={`flex-shrink-0 ${active ? "text-[#007bff]" : ""}`}>{item.icon}</span>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge > 0 && <Badge n={item.badge} />}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin identity + Logout */}
        <div className="px-3 py-3 border-t border-white/[0.07] space-y-1">
          {adminEmail && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 mb-1">
              <div className="w-7 h-7 rounded-full bg-[#007bff]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#007bff] text-[11px] font-bold">
                  {adminEmail.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white/70 text-xs font-semibold truncate">{adminEmail.split("@")[0]}</p>
                <p className="text-white/25 text-[10px] truncate">{isSuperAdmin ? "Super Admin" : "Admin"}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-xl text-[13px] font-medium text-white/35 hover:text-white/70 hover:bg-white/[0.04] transition-colors w-full"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-[220px] flex flex-col overflow-hidden">
        {navProgress && (
          <div className="h-0.5 bg-white/5 overflow-hidden flex-shrink-0">
            <div className="h-full bg-[#007bff]" style={{ animation: "navBar 0.6s ease-out forwards" }} />
          </div>
        )}
        <style>{`@keyframes navBar { from { width: 0% } to { width: 100% } }`}</style>

        {/* Top bar */}
        <header
          className="flex-shrink-0 z-20 bg-[#050505]/95 backdrop-blur-md border-b border-white/[0.07] px-4 md:px-6 flex items-center gap-3"
          style={{ minHeight: 56, paddingTop: "env(safe-area-inset-top)" }}
        >
          <button className="lg:hidden relative text-white/50 hover:text-white transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {!sidebarOpen && totalPending > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
            )}
          </button>

          <div className="flex flex-col justify-center">
            <h2 className="text-white font-bold text-[15px] leading-tight">
              {currentNavItem?.label ?? "Admin"}
            </h2>
            {currentSection?.label && (
              <p className="text-white/30 text-[10px] leading-tight">{currentSection.label}</p>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {totalPending > 0 && (
              <span className="text-yellow-400/80 text-xs flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse inline-block" />
                {totalPending} pending
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AdminPinProvider>{children}</AdminPinProvider>
        </main>
      </div>
    </div>
  );
}
