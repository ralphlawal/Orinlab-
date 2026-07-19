"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard, DollarSign, Megaphone, Wrench, FolderOpen,
  MessageSquare, LifeBuoy, User, Bell, LogOut, Loader2, Menu, X, Plus, ShieldOff, Globe,
  ImageIcon, Music2, CreditCard, BarChart3, Radio,
} from "lucide-react";

export const PORTAL_LANG_KEY = "orinlabi_portal_lang";

export const PORTAL_LANGUAGES = [
  // African Languages
  { code: "af", label: "Afrikaans",           section: "African" },
  { code: "am", label: "Amharic (አማርኛ)",      section: "African" },
  { code: "bm", label: "Bambara",             section: "African" },
  { code: "ny", label: "Chichewa / Nyanja",   section: "African" },
  { code: "ee", label: "Ewe",                 section: "African" },
  { code: "ff", label: "Fula / Fulani",       section: "African" },
  { code: "ha", label: "Hausa",               section: "African" },
  { code: "ig", label: "Igbo",                section: "African" },
  { code: "rw", label: "Kinyarwanda",         section: "African" },
  { code: "rn", label: "Kirundi",             section: "African" },
  { code: "ln", label: "Lingala",             section: "African" },
  { code: "lg", label: "Luganda",             section: "African" },
  { code: "mg", label: "Malagasy",            section: "African" },
  { code: "nd", label: "Ndebele",             section: "African" },
  { code: "om", label: "Oromo",               section: "African" },
  { code: "st", label: "Sesotho",             section: "African" },
  { code: "sn", label: "Shona",              section: "African" },
  { code: "so", label: "Somali",              section: "African" },
  { code: "sw", label: "Kiswahili",           section: "African" },
  { code: "ti", label: "Tigrinya",            section: "African" },
  { code: "tn", label: "Tswana",              section: "African" },
  { code: "tw", label: "Twi / Akan",          section: "African" },
  { code: "wo", label: "Wolof",               section: "African" },
  { code: "xh", label: "Xhosa",               section: "African" },
  { code: "yo", label: "Yoruba",              section: "African" },
  { code: "zu", label: "isiZulu",             section: "African" },
  // Major World Languages
  { code: "en", label: "English",             section: "World" },
  { code: "ar", label: "Arabic (العربية)",    section: "World" },
  { code: "bn", label: "Bengali (বাংলা)",     section: "World" },
  { code: "zh", label: "Chinese (中文)",      section: "World" },
  { code: "nl", label: "Dutch",              section: "World" },
  { code: "fr", label: "Français",           section: "World" },
  { code: "de", label: "Deutsch",            section: "World" },
  { code: "hi", label: "Hindi (हिन्दी)",     section: "World" },
  { code: "id", label: "Indonesian",         section: "World" },
  { code: "it", label: "Italiano",           section: "World" },
  { code: "ja", label: "Japanese (日本語)",  section: "World" },
  { code: "ko", label: "Korean (한국어)",    section: "World" },
  { code: "ms", label: "Malay",              section: "World" },
  { code: "fa", label: "Persian (فارسی)",    section: "World" },
  { code: "pl", label: "Polish",             section: "World" },
  { code: "pt", label: "Português",          section: "World" },
  { code: "ro", label: "Romanian",           section: "World" },
  { code: "ru", label: "Russian",            section: "World" },
  { code: "es", label: "Español",            section: "World" },
  { code: "th", label: "Thai (ภาษาไทย)",    section: "World" },
  { code: "tr", label: "Turkish",            section: "World" },
  { code: "uk", label: "Ukrainian",          section: "World" },
  { code: "ur", label: "Urdu (اردو)",        section: "World" },
  { code: "vi", label: "Vietnamese",         section: "World" },
];

type Counts = { messages: number; notifications: number };
type NavBadge = "none" | "messages" | "notifications";
type NavItem = { href: string; label: string; icon: React.ReactNode; exact: boolean; badge: NavBadge };
type NavSection = { label: string; color: string; items: NavItem[] };

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
    color: "#60a5fa",
    items: [
      { href: "/portal",               label: "My Releases",  icon: <LayoutDashboard size={16} />, exact: true,  badge: "none" as const },
      { href: "/portal/analytics",     label: "Analytics",    icon: <BarChart3 size={16} />,       exact: false, badge: "none" as const },
      { href: "/portal/releases/new",  label: "New Release",  icon: <Plus size={16} />,            exact: false, badge: "none" as const },
    ],
  },
  {
    label: "Finances",
    color: "#34d399",
    items: [
      { href: "/portal/earnings",  label: "Earnings",  icon: <DollarSign size={16} />, exact: false, badge: "none" as const },
      { href: "/portal/billing",   label: "Billing",   icon: <CreditCard size={16} />, exact: false, badge: "none" as const },
    ],
  },
  {
    label: "Growth",
    color: "#c084fc",
    items: [
      { href: "/portal/services",  label: "Promotion",  icon: <Megaphone size={16} />,  exact: false, badge: "none" as const },
      { href: "/portal/pitch",     label: "Pitch & Promo", icon: <Radio size={16} />,   exact: false, badge: "none" as const },
      { href: "/portal/tools",     label: "Tools",      icon: <Wrench size={16} />,     exact: false, badge: "none" as const },
      { href: "/portal/assets",    label: "Assets",     icon: <FolderOpen size={16} />, exact: false, badge: "none" as const },
    ],
  },
  {
    label: "Resources",
    color: "#a78bfa",
    items: [
      { href: "/portal/guidelines/artwork", label: "Artwork Guide", icon: <ImageIcon size={16} />, exact: false, badge: "none" as const },
      { href: "/portal/guidelines/audio",   label: "Audio Guide",   icon: <Music2    size={16} />, exact: false, badge: "none" as const },
    ],
  },
  {
    label: "Support",
    color: "#fb923c",
    items: [
      { href: "/portal/messages", label: "Messages", icon: <MessageSquare size={16} />, exact: false, badge: "messages" as const },
      { href: "/portal/support",  label: "Support",  icon: <LifeBuoy size={16} />,      exact: false, badge: "none" as const },
    ],
  },
  {
    label: "Account",
    color: "#f472b6",
    items: [
      { href: "/portal/profile",       label: "Profile",       icon: <User size={16} />, exact: false, badge: "none" as const },
      { href: "/portal/notifications", label: "Notifications", icon: <Bell size={16} />, exact: false, badge: "notifications" as const },
    ],
  },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking]         = useState(true);
  const [email, setEmail]               = useState<string | null>(null);
  const [artistName, setArtistName]     = useState<string>("");
  const [artistImage, setArtistImage]   = useState<string | null>(null);
  const [counts, setCounts]             = useState<Counts>({ messages: 0, notifications: 0 });
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [suspended, setSuspended]       = useState(false);
  const [portalLang, setPortalLang]     = useState("en");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langFilter, setLangFilter]     = useState("");
  const langPickerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(PORTAL_LANG_KEY) : null;
    if (saved) setPortalLang(saved);
  }, []);

  useEffect(() => {
    if (!showLangPicker) return;
    function onClickOutside(e: MouseEvent) {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target as Node)) {
        setShowLangPicker(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showLangPicker]);

  // Allow child pages (e.g. messages) to open the lang picker via a custom event
  useEffect(() => {
    function onOpenLangPicker() { setShowLangPicker(true); }
    document.addEventListener("orinlabi:open-lang-picker", onOpenLangPicker);
    return () => document.removeEventListener("orinlabi:open-lang-picker", onOpenLangPicker);
  }, []);

  function changeLanguage(code: string) {
    localStorage.setItem(PORTAL_LANG_KEY, code);
    setPortalLang(code);
    setShowLangPicker(false);
    setLangFilter("");
  }

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

  // Fetch artist profile — also enforces account_status suspension
  useEffect(() => {
    if (!email) return;
    supabase.from("artist_profiles").select("artist_name,artist_image_url,account_status").eq("email", email).maybeSingle()
      .then(({ data }) => {
        if (data?.account_status === "suspended") {
          setSuspended(true);
          supabase.auth.signOut();
          return;
        }
        if (data?.artist_name) setArtistName(data.artist_name);
        if (data?.artist_image_url) setArtistImage(data.artist_image_url);
      });
  }, [email]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  if (pathname.startsWith("/portal/login")) {
    return <div className="fixed inset-0 z-[60] bg-black">{children}</div>;
  }

  if (suspended) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center px-4 text-center">
        <div className="max-w-sm">
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShieldOff size={26} className="text-red-400" />
          </div>
          <h1 className="text-white font-bold text-xl mb-2">Account Suspended</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Your account has been suspended. Contact us at{" "}
            <a href="mailto:info@orinlabi.com" className="text-[#007bff] hover:underline">info@orinlabi.com</a>{" "}
            if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050505]">
        <Loader2 size={32} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  const totalUnread = counts.messages + counts.notifications;
  const initials = artistName ? artistName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "A";

  // Find which section the current page belongs to, for color tinting
  const activeSection = NAV_SECTIONS.find((s) =>
    s.items.some((item) => item.exact ? pathname === item.href : pathname.startsWith(item.href))
  );
  const activeSectionColor = activeSection?.color ?? "#007bff";

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ background: "linear-gradient(180deg, #050505 0%, #080808 100%)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

        {/* Logo + identity */}
        <div className="flex flex-col px-4 py-5 border-b border-white/[0.05]">
          <Link href="/">
            <Image
              src="https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png"
              alt="OrinlabÍ Records" width={88} height={24} className="object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
          <p className="text-white/20 text-[10px] mt-1.5 font-semibold tracking-widest uppercase">Artist Portal</p>
        </div>

        {/* Artist identity card */}
        <div className="px-3 py-3 border-b border-white/[0.05]">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-white/[0.03]">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden relative">
              {artistImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={artistImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ background: "linear-gradient(135deg, #007bff, #8B5CF6)" }}
                >
                  {initials}
                </div>
              )}
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-[#050505]" />
            </div>
            <div className="flex-1 min-w-0">
              {artistName
                ? <p className="text-white text-xs font-semibold truncate">{artistName}</p>
                : <p className="text-white/40 text-xs truncate">{email ?? "Artist"}</p>}
              <p className="text-white/30 text-[10px] truncate">Active</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="flex items-center gap-1.5 px-3 mb-1">
                <div className="w-1 h-1 rounded-full" style={{ background: section.color, opacity: 0.6 }} />
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: section.color, opacity: 0.5 }}>
                  {section.label}
                </p>
              </div>
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
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                        active ? "text-white" : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
                      }`}
                      style={active ? {
                        background: `${section.color}18`,
                        boxShadow: `inset 0 0 0 1px ${section.color}20`,
                        color: section.color,
                      } : undefined}
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
        <div className="px-2.5 py-3 border-t border-white/[0.05]">
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all w-full"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 z-20 px-6 py-3.5 flex items-center gap-4"
          style={{ background: "rgba(5,5,5,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <button className="lg:hidden relative text-white/50 hover:text-white transition-colors" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {!sidebarOpen && totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#007bff] rounded-full" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full" style={{ background: activeSectionColor }} />
            <h2 className="text-white font-semibold text-sm">
              {NAV_SECTIONS.flatMap(s => s.items).find(n =>
                n.exact ? pathname === n.href : (pathname.startsWith(n.href) && n.href !== "/portal")
              )?.label ?? (pathname === "/portal" ? "My Releases" : "Portal")}
            </h2>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {totalUnread > 0 && (
              <Link href="/portal/notifications" className="flex items-center gap-1.5 text-[#007bff] text-xs font-medium hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 bg-[#007bff] rounded-full animate-pulse inline-block" />
                {totalUnread} unread
              </Link>
            )}

            {/* Language selector */}
            <div ref={langPickerRef} className="relative">
              <button
                onClick={() => { setShowLangPicker((v) => !v); setLangFilter(""); }}
                title="Change language"
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
                  portalLang !== "en"
                    ? "border-[#007bff]/30 text-[#007bff] bg-[#007bff]/[0.07]"
                    : "border-white/[0.08] text-white/30 hover:text-white/70 hover:border-white/20"
                }`}
              >
                <Globe size={13} />
                <span className="hidden sm:inline">{PORTAL_LANGUAGES.find((l) => l.code === portalLang)?.label ?? "Language"}</span>
              </button>

              {showLangPicker && (() => {
                const q = langFilter.toLowerCase();
                const filtered = q
                  ? PORTAL_LANGUAGES.filter((l) => l.label.toLowerCase().includes(q) || l.code.includes(q))
                  : PORTAL_LANGUAGES;
                const african = filtered.filter((l) => l.section === "African");
                const world   = filtered.filter((l) => l.section === "World");
                const LangBtn = ({ l }: { l: typeof PORTAL_LANGUAGES[number] }) => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      portalLang === l.code
                        ? "bg-[#007bff]/10 text-[#007bff] font-semibold"
                        : "text-white/55 hover:text-white hover:bg-white/[0.05]"
                    }`}
                  >
                    {l.label}
                    {portalLang === l.code && <span className="text-[10px] flex-shrink-0">✓</span>}
                  </button>
                );
                return (
                  <div className="absolute right-0 top-full mt-2 bg-[#0d0d0d] border border-white/[0.10] rounded-2xl shadow-2xl z-50 w-52 flex flex-col" style={{ maxHeight: "min(420px, 80vh)" }}>
                    {/* Search */}
                    <div className="p-2 border-b border-white/[0.07] flex-shrink-0">
                      <input
                        autoFocus
                        value={langFilter}
                        onChange={(e) => setLangFilter(e.target.value)}
                        placeholder="Search language…"
                        className="w-full bg-white/[0.06] border border-white/[0.08] outline-none text-white/80 placeholder-white/25 text-xs px-3 py-2 rounded-lg"
                      />
                    </div>
                    {/* List */}
                    <div className="overflow-y-auto flex-1 p-1.5">
                      {african.length > 0 && (
                        <>
                          <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 py-1.5">African Languages</p>
                          {african.map((l) => <LangBtn key={l.code} l={l} />)}
                        </>
                      )}
                      {world.length > 0 && (
                        <>
                          <p className="text-white/20 text-[10px] uppercase tracking-widest px-3 pt-3 pb-1.5">World Languages</p>
                          {world.map((l) => <LangBtn key={l.code} l={l} />)}
                        </>
                      )}
                      {filtered.length === 0 && (
                        <p className="text-white/25 text-xs text-center py-4">No language found.</p>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
