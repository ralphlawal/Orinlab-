"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LogOut, Loader2, Bell } from "lucide-react";

function useUnreadCount(email: string | null) {
  const [msgCount, setMsgCount]           = useState(0);
  const [notifCount, setNotifCount]       = useState(0);

  useEffect(() => {
    if (!email) return;
    const fetchMsg = () =>
      supabase.from("messages")
        .select("id", { count: "exact", head: true })
        .eq("artist_email", email).eq("sender", "admin").is("read_at", null)
        .then(({ count: c }) => setMsgCount(c ?? 0));
    const fetchNotif = () =>
      supabase.from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("email", email).eq("read", false)
        .then(({ count: c }) => setNotifCount(c ?? 0));
    fetchMsg(); fetchNotif();
    const id = setInterval(() => { fetchMsg(); fetchNotif(); }, 10000);
    return () => clearInterval(id);
  }, [email]);

  return { msgCount, notifCount };
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const { msgCount, notifCount } = useUnreadCount(email);

  useEffect(() => {
    // Auth is handled by /auth/callback before the user reaches the portal.
    // This layout only needs to: confirm a session exists, show the email,
    // and redirect to login if the user is genuinely unauthenticated.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setEmail(session.user.email ?? null);
          setChecking(false);

          // Notify Ralph when an artist logs in — fire once per session
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
        setEmail(data.session.user.email ?? null);
        setChecking(false);
      } else if (pathname.startsWith("/portal/login")) {
        setChecking(false);
      } else {
        // If there's an access_token in the hash, a magic link landed here directly.
        // Give Supabase 3 s to finish the token exchange before redirecting.
        const hasToken = typeof window !== "undefined" &&
          (window.location.hash.includes("access_token") ||
           new URLSearchParams(window.location.search).has("code") ||
           new URLSearchParams(window.location.search).has("token_hash"));

        if (hasToken) {
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: d2 }) => {
              if (d2.session) {
                setEmail(d2.session.user.email ?? null);
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
  }, [pathname, router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  // Login page — no portal chrome
  if (pathname.startsWith("/portal/login")) return <>{children}</>;

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20">
      {/* Portal top bar */}
      <div className="bg-black/90 border-b border-white/[0.06] backdrop-blur sticky top-16 md:top-20 z-30">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-12">
          {/* Nav links — horizontally scrollable on mobile */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0 pr-3">
            {[
              { href: "/portal",               label: "Releases",  exact: true  },
              { href: "/portal/earnings",       label: "Earnings",  exact: false },
              { href: "/portal/pitch",          label: "Pitch",     exact: false },
              { href: "/portal/assets",         label: "Assets",    exact: false },
              { href: "/portal/messages",       label: "Messages",  exact: false },
              { href: "/portal/profile",        label: "Profile",   exact: false },
            ].map(({ href, label, exact }) => {
              const active     = exact ? pathname === href : pathname.startsWith(href);
              const isMessages = href === "/portal/messages";
              return (
                <Link key={href} href={href}
                  className={`flex-shrink-0 relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    active ? "bg-[#007bff]/15 text-[#007bff]" : "text-white/40 hover:text-white"
                  }`}
                >
                  {label}
                  {isMessages && msgCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#007bff] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {msgCount > 9 ? "9+" : msgCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notification bell */}
            <Link href="/portal/notifications" className="relative text-white/40 hover:text-white transition-colors p-1">
              <Bell size={16} />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </Link>
            <button onClick={signOut}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors">
              <LogOut size={13} />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
