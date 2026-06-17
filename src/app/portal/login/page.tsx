"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  // Redirect already-authenticated users straight to the portal
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/portal");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("not allowed") || msg.includes("disabled")) {
        setError("Sign-ins are currently restricted. Please contact info@orinlabi.com for access.");
      } else if (msg.includes("rate limit") || msg.includes("too many")) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else if (msg.includes("invalid email") || msg.includes("unable to validate")) {
        setError("That email address doesn't look valid. Please check and try again.");
      } else {
        setError(authError.message || "Something went wrong. Please try again or contact info@orinlabi.com.");
      }
      setState("error");
    } else {
      setState("sent");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
            alt="Orinlabí"
            width={140}
            height={38}
            className="object-contain"
            priority
          />
        </div>

        {state === "sent" ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#007bff]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-[#007bff]" />
            </div>
            <h2 className="text-white font-bold text-2xl mb-3">Check your email</h2>
            <p className="text-white/50 leading-relaxed text-sm">
              We sent a login link to{" "}
              <strong className="text-white">{email}</strong>.
              Click it to access your artist portal.
            </p>
            <p className="text-white/30 text-xs mt-4">
              Didn&apos;t get it? Check your spam folder or{" "}
              <button
                onClick={() => setState("idle")}
                className="text-[#007bff] hover:underline"
              >
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-white font-bold text-2xl mb-2">Artist Portal</h1>
              <p className="text-white/50 text-sm">
                Enter the email you used to apply. We&apos;ll send you a login link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm pl-10 pr-4 py-3.5 rounded-xl transition-colors"
                  />
                </div>
              </div>

              {state === "error" && (
                <p className="text-red-400 text-xs">{error}</p>
              )}

              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {state === "loading" && <Loader2 size={16} className="animate-spin" />}
                Send Login Link
              </button>
            </form>

            <p className="text-center text-white/25 text-xs mt-8">
              Not yet an artist?{" "}
              <a href="/submit" className="text-[#007bff] hover:underline">
                Apply for distribution
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
