"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { AdminPinProvider } from "@/context/AdminPinContext";
import {
  LayoutDashboard, Music, MessageSquare, BookOpen, Mail, LogOut, Loader2, Menu, X,
  Palette, Users, Settings, BarChart2, Megaphone, Radio, DollarSign,
} from "lucide-react";

const BASE_NAV = [
  { label: "Dashboard",     href: "/admin",               icon: <LayoutDashboard size={18} />, superOnly: false },
  { label: "Releases",      href: "/admin/releases",      icon: <Music size={18} />,           superOnly: false },
  { label: "Assets",        href: "/admin/assets",        icon: <Palette size={18} />,         superOnly: false },
  { label: "Artists",       href: "/admin/artists",       icon: <Users size={18} />,           superOnly: false },
  { label: "Messages",      href: "/admin/messages",      icon: <MessageSquare size={18} />,   superOnly: false },
  { label: "Pitches",       href: "/admin/pitches",       icon: <Radio size={18} />,           superOnly: false },
  { label: "Payouts",       href: "/admin/payouts",       icon: <DollarSign size={18} />,      superOnly: false },
  { label: "Analytics",     href: "/admin/analytics",     icon: <BarChart2 size={18} />,       superOnly: true  },
  { label: "Announcements", href: "/admin/announcements", icon: <Megaphone size={18} />,       superOnly: true  },
  { label: "Blog",          href: "/admin/blog",          icon: <BookOpen size={18} />,        superOnly: true  },
  { label: "Newsletter",    href: "/admin/newsletter",    icon: <Mail size={18} />,            superOnly: true  },
  { label: "Settings",      href: "/admin/settings",      icon: <Settings size={18} />,        superOnly: true  },
];

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Falls back to the first email in NEXT_PUBLIC_ADMIN_EMAILS if the dedicated env var isn't set
const SUPER_ADMIN = (
  process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ||
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",")[0]
).trim().toLowerCase();

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (pathname === "/admin/login") {
        setChecking(false);
        return;
      }
      const email = (data.session?.user?.email ?? "").toLowerCase();
      const isAdmin = Boolean(email) && ADMIN_EMAILS.includes(email);
      if (!isAdmin) {
        router.replace("/admin/login");
      } else {
        setAdminEmail(email);
        setChecking(false);
      }
    });
  }, [pathname, router]);

  const navItems = BASE_NAV.filter((item) => !item.superOnly || adminEmail === SUPER_ADMIN);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  // Login page — full-screen overlay, no chrome
  if (pathname === "/admin/login") {
    return (
      <div className="fixed inset-0 z-[60] bg-black">
        {children}
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

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-black border-r border-white/[0.06] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex flex-col px-4 py-5 border-b border-white/[0.06]">
          <Image
            src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
            alt="Orinlabí"
            width={96}
            height={26}
            className="object-contain"
          />
          <p className="text-white/30 text-xs mt-1.5">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                  ? "bg-[#007bff]/10 text-[#007bff]"
                  : "text-white/50 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-white/[0.06] px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h2 className="text-white font-semibold text-sm">
            {navItems.find((n) => n.href === pathname)?.label ?? "Admin"}
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <AdminPinProvider>{children}</AdminPinProvider>
        </main>
      </div>
    </div>
  );
}
