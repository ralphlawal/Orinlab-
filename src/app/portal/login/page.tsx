"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, KeyRound } from "lucide-react";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/portal");
    });
  }, [router]);

  useEffect(() => {
    if (step !== "code" || timeLeft === null) return;
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => (t !== null ? t - 1 : null)), 1000);
    return () => clearInterval(id);
  }, [step, timeLeft]);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });

    setLoading(false);

    if (authError) {
      setTimeLeft(null);
      const msg = authError.message.toLowerCase();
      if (msg.includes("rate limit") || msg.includes("too many")) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else if (msg.includes("invalid email") || msg.includes("unable to validate")) {
        setError("That email address doesn't look valid. Please check and try again.");
      } else {
        setError(authError.message || "Something went wrong. Please try again.");
      }
    } else {
      setTimeLeft(300);
      setStep("code");
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });

    setLoading(false);

    if (verifyError) {
      if (verifyError.message.toLowerCase().includes("expired") || verifyError.message.toLowerCase().includes("invalid")) {
        setError("That code is invalid or has expired. Request a new one.");
      } else {
        setError(verifyError.message || "Could not verify the code. Please try again.");
      }
    } else {
      router.replace("/portal");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Image
            src="https://res.cloudinary.com/dco9drzzp/image/upload/v1783353777/94573a59-02c9-4066-b6ab-5ce4ce3c1c54_inmopu.png"
            alt="OrinlabÍ Records"
            width={140}
            height={38}
            className="object-contain"
            priority
          />
        </div>

        {step === "email" ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-white font-bold text-2xl mb-2">Artist Portal</h1>
              <p className="text-white/50 text-sm">
                Enter your email and we&apos;ll send you a login code.
              </p>
            </div>

            <form onSubmit={sendCode} className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="your@email.com"
                    required
                    autoFocus
                    className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm pl-10 pr-4 py-3.5 rounded-xl transition-colors"
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Send Code
              </button>
            </form>

            <p className="text-center text-white/25 text-xs mt-6">
              By signing in, you agree to our{" "}
              <a href="/terms" className="text-white/40 hover:text-white underline underline-offset-2">
                Terms of Service & Distribution Agreement
              </a>
              .
            </p>

            <p className="text-center text-white/20 text-xs mt-4">
              Not yet an artist?{" "}
              <a href="/submit" className="text-[#007bff] hover:underline">
                Apply for distribution
              </a>
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#007bff]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <KeyRound size={26} className="text-[#007bff]" />
              </div>
              <h1 className="text-white font-bold text-2xl mb-2">Enter your code</h1>
              <p className="text-white/50 text-sm leading-relaxed">
                We sent a login code to{" "}
                <strong className="text-white">{email}</strong>.
                <br />Check your inbox (and spam folder).
              </p>
            </div>

            <form onSubmit={verifyCode} className="space-y-4">
              <div>
                <label className="block text-white/60 text-xs font-medium mb-2">
                  Login Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
                  placeholder="········"
                  required
                  autoFocus
                  className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-center text-2xl font-bold tracking-[0.4em] py-4 rounded-xl transition-colors"
                />
              </div>

              {timeLeft !== null && timeLeft > 0 && (
                <p className={`text-xs text-center ${timeLeft <= 60 ? "text-amber-400" : "text-white/30"}`}>
                  Code expires in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                </p>
              )}
              {timeLeft === 0 && (
                <p className="text-red-400 text-xs text-center">
                  Code expired — request a new one below.
                </p>
              )}

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading || code.length < 4 || timeLeft === 0}
                className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Sign In
              </button>
            </form>

            <button
              onClick={() => { setStep("email"); setCode(""); setError(""); setTimeLeft(null); }}
              className="w-full text-center text-white/30 hover:text-white/60 text-xs mt-5 transition-colors"
            >
              Use a different email or resend code
            </button>
          </>
        )}
      </div>
    </div>
  );
}
