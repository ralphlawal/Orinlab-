"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let redirected = false;

    function go() {
      if (redirected) return;
      redirected = true;
      router.replace("/portal");
    }

    // Handle PKCE / token_hash flow (newer Supabase email templates)
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as "magiclink" | "signup" | null;
    if (tokenHash && type) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error }) => {
        if (!error) go();
        else router.replace("/portal/login");
      });
      return;
    }

    // Handle implicit flow (access_token in URL hash) — Supabase client auto-processes it.
    // Listen for the SIGNED_IN event which fires once the exchange is complete.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) go();
    });

    // If session already exists (e.g. page refresh), redirect immediately.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) go();
    });

    // Safety fallback — 5 s with no session → back to login
    const timeout = setTimeout(() => {
      if (!redirected) router.replace("/portal/login");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 size={28} className="text-[#007bff] animate-spin" />
      <p className="text-white/30 text-sm">Signing you in…</p>
    </div>
  );
}
