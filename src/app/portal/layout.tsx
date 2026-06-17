"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LogOut, Loader2 } from "lucide-react";

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
      <div className="bg-black/90 border-b border-white/[0.06] backdrop-blur sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-12">
          {/* Nav links — horizontally scrollable on mobile */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0 pr-3">
            {[
              { href: "/portal", label: "Releases", exact: true },
              { href: "/portal/assets", label: "Assets", exact: false },
              { href: "/portal/profile", label: "Profile", exact: false },
              { href: "/portal/releases/new", label: "+ Release", exact: false },
            ].map(({ href, label, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? "bg-[#007bff]/15 text-[#007bff]"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={signOut}
            className="flex-shrink-0 flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors"
          >
            <LogOut size={13} />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </div>

      {children}
    </>
  );
}
