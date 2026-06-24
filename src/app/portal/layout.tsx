"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard, Music, DollarSign, Megaphone, Wrench, FolderOpen,
  MessageSquare, LifeBuoy, User, Bell, LogOut, Loader2, Menu, X, Plus,
} from "lucide-react";

type Counts = { messages: number; notifications: number };
type NavBadge = "none" | "messages" | "notifications";
type NavItem = { href: string; label: string; icon: React.ReactNode; exact: boolean; badge: NavBadge };
type NavSection = { label: string; items: NavItem[] };

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="ml-auto flex-shrink-0 min-w-[18px] h-[18px] bg-[#007bff] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
      {n > 99 ? "99+" : n}
    </span>
  );
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Music",
    items: [
      { href: "/portal",           label: "My Releases",  icon: <LayoutDashboard size={17} />, exact: true,  badge: "none" as const },
      { href: "/portal/releases/new", label: "New Release", icon: <Plus size={17} />,          exact: false, badge: "none" as const },
    ],
  },
  {
    label: "Finances",
    items: [
      { href: "/portal/earnings",  label: "Earnings",     icon: <DollarSign size={17} />,      exact: false, badge: "none" as const },
      { href: "/portal/services",  label: "Services",     icon: <Megaphone size={17} />,       exact: false, badge: "none" as const },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/portal/pitch",     label: "Promote",      icon: <Music size={17} />,           exact: false, badge: "none" as const },
      { href: "/portal/tools",     label: "Tools",        icon: <Wrench size={17} />,          exact: false, badge: "none" as const },
      { href: "/portal/assets",    label: "Assets",       icon: <FolderOpen size={17} />,      exact: false, badge: "none" as const },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/portal/messages",  label: "Messages",     icon: <MessageSquare size={17} />,   exact: false, badge: "messages" as const },
      { href: "/portal/support",   label: "Support",      icon: <LifeBuoy size={17} />,        exact: false, badge: "none" as const },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/portal/profile",        label: "Profile",       icon: <User size={17} />,     exact: false, badge: "none" as const },
      { href: "/portal/notifications",  label: "Notifications", icon: <Bell size={17} />,     exact: false, badge: "notifications" as const },
    ],
  },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking]     = useState(true);
  const [email, setEmail]           = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string>("");
  const [counts, setCounts]         = useState<Counts>({ messages: 0, notifications: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadCounts = useCallback(async (userEmail: string) => {
    const [{ count: msg }, { count: notif }] = await Promise.all([
      supabase.from("messages").select("id", { count: "exact", head: true })
        .eq("artist_email", userEmail).eq("sender", "admin").is("read_at", null),
      supabase.from("notifications").select("id", { count: "exact", head: true })
        .eq("email", userEmail).eq("read", false),
    ]);
    setCounts({ messages: msg ?? 0, notifications: notif ?? 0 });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          const userEmail = session.user.email ?? null;
          setEmail(userEmail);
          setChecking(false);
          if (userEmail) loadCounts(userEmail);

          if (event === "SIGNED_IN") {
            const key = `login_notified_${session.user.email}`;
            if (!sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, "1");
              fetch("/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "artist-login",
                  data: { email: session.user.email, artist_name: session.user.user_metadata?.artist_name ?? "" },
                }),
              }).catch(() => {});
            }
          }
        } else if (event === "SIGNED_OUT") {
          router.replace("/portal/login");
        }
      }
    );

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const userEmail = data.session.user.email ?? null;
        setEmail(userEmail);
        setChecking(false);
        if (userEmail) loadCounts(userEmail);
      } else if (pathname.startsWith("/portal/login")) {
        setChecking(false);
      } else {
        const hasToken = typeof window !== "undefined" &&
          (window.location.hash.includes("access_token") ||
           new URLSearchParams(window.location.search).has("code") ||
           new URLSearchParams(window.location.search).has("token_hash"));

        if (hasToken) {
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: d2 }) => {
              if (d2.session) {
                const userEmail = d2.session.user.email ?? null;
                setEmail(userEmail);
                if (userEmail) loadCounts(userEmail);
              } else {
                router.replace("/portal/login");
              }
              setChecking(false);
            });
          }, 3000);
        } else {
          router.replace("/portal/login");
          setChecking(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router, loadCounts]);

  // Reload counts on pathname change
  useEffect(() => {
    if (email && !checking) loadCounts(email);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh counts every 30s
  useEffect(() => {
    if (!email) return;
    const id = setInterval(() => loadCounts(email), 30_000);
    return () => clearInterval(id);
  }, [email, loadCounts]);

  // Fetch artist name from profile
  useEffect(() => {
    if (!email) return;
    supabase.from("artist_profiles").select("artist_name").eq("email", email).maybeSingle()
      .then(({ data }) => { if (data?.artist_name) setArtistName(data.artist_name); });
  }, [email]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  if (pathname.startsWith("/portal/login")) {
    return <div className="fixed inset-0 z-[60] bg-black">{children}</div>;
  }

  if (checking) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050505]">
        <Loader2 size={32} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  const totalUnread = counts.messages + counts.notifications;

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-black border-r border-white/[0.06] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        {/* Logo + identity */}
        <div className="flex flex-col px-4 py-5 border-b border-white/[0.06]">
          <Image
            src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
            alt="Orinlabí" width={88} height={24} className="object-contain"
          />
          <p className="text-white/25 text-[11px] mt-1.5 font-medium tracking-wide uppercase">Artist Portal</p>
          {artistName && (
            <p className="text-white/60 text-xs mt-1 truncate">{artistName}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-1">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const badgeCount = item.badge === "messages" ? counts.messages
                    : item.badge === "notifications" ? counts.notifications : 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? "bg-[#007bff]/10 text-[#007bff]"
                          : "text-white/45 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {badgeCount > 0 && <Badge n={badgeCount} />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-2.5 py-3 border-t border-white/[0.06]">
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-white/35 hover:text-white hover:bg-white/[0.05] transition-colors w-full"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-white/[0.06] px-6 py-3.5 flex items-center gap-4">
          <button className="lg:hidden relative text-white/60 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {!sidebarOpen && totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#007bff] rounded-full" />
            )}
          </button>
          <h2 className="text-white font-semibold text-sm truncate">
            {NAV_SECTIONS.flatMap(s => s.items).find(n =>
              n.exact ? pathname === n.href : (pathname.startsWith(n.href) && n.href !== "/portal")
            )?.label ?? (pathname === "/portal" ? "My Releases" : "Portal")}
          </h2>
          {totalUnread > 0 && (
            <span className="ml-auto text-[#007bff]/80 text-xs flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse inline-block" />
              {totalUnread} unread
            </span>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
