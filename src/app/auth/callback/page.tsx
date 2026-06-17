"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let done = false;
    function toPortal() {
      if (done) return;
      done = true;
      router.replace("/portal");
    }
    function toLogin() {
      if (done) return;
      done = true;
      router.replace("/portal/login");
    }

    // --- PKCE flow: ?code=... ---
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) toLogin(); else toPortal();
      });
      return;
    }

    // --- token_hash flow: ?token_hash=...&type=... ---
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as "magiclink" | "signup" | null;
    if (tokenHash && type) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ error }) => {
        if (error) toLogin(); else toPortal();
      });
      return;
    }

    // --- Implicit flow: #access_token=... in URL hash ---
    // Supabase client auto-processes the hash on init and fires onAuthStateChange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) toPortal();
    });

    // Fallback: session may already be set by the time the listener fires
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) toPortal();
    });

    // Last resort: if nothing worked after 6 s, send to login
    const timeout = setTimeout(toLogin, 6000);

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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
        <p className="text-white/30 text-sm">Signing you in…</p>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
