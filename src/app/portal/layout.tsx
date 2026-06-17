"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { LogOut, Loader2, Music2, PlusCircle } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Auth is handled by /auth/callback before the user reaches the portal.
    // This layout only needs to: confirm a session exists, show the email,
    // and redirect to login if the user is genuinely unauthenticated.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setEmail(session.user.email ?? null);
          setChecking(false);
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
    <>
      {/* Portal top bar */}
      <div className="bg-black/80 border-b border-white/[0.06] backdrop-blur sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none min-w-0">
            <div className="w-6 h-6 bg-[#007bff]/20 rounded-lg flex items-center justify-center">
              <Music2 size={13} className="text-[#007bff]" />
            </div>
            <span className="text-white/60 text-xs font-medium hidden sm:block">Artist Portal</span>
            <span className="text-white/20 text-xs hidden sm:block flex-shrink-0">·</span>
            <Link href="/portal" className={`text-xs font-medium transition-colors flex-shrink-0 ${pathname === "/portal" ? "text-white" : "text-white/40 hover:text-white"}`}>
              Releases
            </Link>
            <span className="text-white/20 text-xs flex-shrink-0">·</span>
            <Link href="/portal/assets" className={`text-xs font-medium transition-colors flex-shrink-0 ${pathname.startsWith("/portal/assets") ? "text-white" : "text-white/40 hover:text-white"}`}>
              Assets
            </Link>
            <span className="text-white/20 text-xs flex-shrink-0">·</span>
            <Link href="/portal/profile" className={`text-xs font-medium transition-colors flex-shrink-0 ${pathname.startsWith("/portal/profile") ? "text-white" : "text-white/40 hover:text-white"}`}>
              Profile
            </Link>
            <span className="text-white/20 text-xs flex-shrink-0">·</span>
            <Link href="/portal/releases/new" className={`flex items-center gap-1 text-xs font-medium transition-colors flex-shrink-0 ${pathname.startsWith("/portal/releases/new") ? "text-[#007bff]" : "text-white/40 hover:text-[#007bff]"}`}>
              <PlusCircle size={11} /> New Release
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {email && <span className="text-white/30 text-xs hidden sm:block">{email}</span>}
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </div>

      {children}
    </>
  );
}
