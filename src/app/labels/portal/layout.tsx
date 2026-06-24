"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard, User, Users, LogOut, Loader2, Menu, X,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Label",
    items: [
      { href: "/labels/portal",          label: "Dashboard", icon: <LayoutDashboard size={17} />, exact: true  },
      { href: "/labels/portal/artists",  label: "Roster",    icon: <Users size={17} />,           exact: false },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/labels/portal/profile",  label: "Profile",   icon: <User size={17} />,            exact: false },
    ],
  },
];

export default function LabelPortalLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking]   = useState(true);
  const [email, setEmail]         = useState<string | null>(null);
  const [labelName, setLabelName] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setEmail(session.user.email ?? null);
        setChecking(false);
      } else if (event === "SIGNED_OUT") {
        router.replace("/labels/portal/login");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setEmail(data.session.user.email ?? null);
        setChecking(false);
      } else if (!pathname.startsWith("/labels/portal/login") && !pathname.startsWith("/labels/portal/set-password")) {
        const hasToken =
          typeof window !== "undefined" &&
          (window.location.hash.includes("access_token") ||
           new URLSearchParams(window.location.search).has("code") ||
           new URLSearchParams(window.location.search).has("token_hash"));

        if (hasToken) {
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: d2 }) => {
              if (d2.session) setEmail(d2.session.user.email ?? null);
              else router.replace("/labels/portal/login");
              setChecking(false);
            });
          }, 3000);
        } else {
          router.replace("/labels/portal/login");
          setChecking(false);
        }
      } else {
        setChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // Fetch label name
  useEffect(() => {
    if (!email) return;
    supabase.from("label_profiles").select("label_name").eq("email", email).maybeSingle()
      .then(({ data }) => { if (data?.label_name) setLabelName(data.label_name); });
  }, [email]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/labels/portal/login");
  }

  if (pathname.startsWith("/labels/portal/login") || pathname.startsWith("/labels/portal/set-password")) {
    return <div className="fixed inset-0 z-[60] bg-black">{children}</div>;
  }

  if (checking) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050505]">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  const allNavItems = NAV_SECTIONS.flatMap(s => s.items);
  const activeLabel = allNavItems.find(n =>
    n.exact ? pathname === n.href : pathname.startsWith(n.href)
  )?.label ?? "Label Portal";

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
          <p className="text-white/25 text-[11px] mt-1.5 font-medium tracking-wide uppercase">Label Portal</p>
          {labelName && (
            <p className="text-white/60 text-xs mt-1 truncate">{labelName}</p>
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
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h2 className="text-white font-semibold text-sm">{activeLabel}</h2>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
