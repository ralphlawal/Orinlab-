"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LabelPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [mode, setMode]           = useState<"login" | "forgot">("login");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/labels/portal");
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Gate: only labels that have applied can log in
    const { data: label } = await supabase
      .from("label_profiles")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (!label) {
      setError("No label found with that email. Have you applied yet?");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials") || msg.includes("password")) {
        setError("Incorrect email or password. Use 'Forgot password?' to reset.");
      } else if (msg.includes("email not confirmed")) {
        setError("Please check your email and confirm your account first.");
      } else {
        setError(authError.message || "Something went wrong. Please try again.");
      }
    } else {
      router.replace("/labels/portal");
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/labels/portal/set-password` }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message || "Could not send reset email. Please try again.");
    } else {
      setResetSent(true);
    }
  }

  const inp = "w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/25 text-sm py-3.5 rounded-xl transition-colors";

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Image
            src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
            alt="Orinlabí" width={140} height={38} className="object-contain" priority
          />
        </div>

        {mode === "login" ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-white font-bold text-2xl mb-2">Label Portal</h1>
              <p className="text-white/50 text-sm">Sign in to your label account.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="label@example.com" required autoFocus className={inp + " pl-10 pr-4"} />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Password" required className={inp + " pl-10 pr-12"} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Sign In
              </button>
            </form>

            <div className="flex items-center justify-between mt-6">
              <button onClick={() => { setMode("forgot"); setError(""); }}
                className="text-white/30 hover:text-[#007bff] text-xs transition-colors">
                Forgot password?
              </button>
              <Link href="/labels/apply" className="text-white/25 hover:text-white/60 text-xs transition-colors">
                Not registered? Apply
              </Link>
            </div>
          </>
        ) : resetSent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Mail size={24} className="text-green-400" />
            </div>
            <h2 className="text-white font-bold text-xl mb-3">Check your inbox</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              We sent a password reset link to <strong className="text-white">{email}</strong>.
              Click the link to set your new password.
            </p>
            <button onClick={() => { setMode("login"); setResetSent(false); }}
              className="text-[#007bff] text-sm hover:underline">
              Back to sign in
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-white font-bold text-2xl mb-2">Reset Password</h1>
              <p className="text-white/50 text-sm">Enter your label email and we'll send a reset link.</p>
            </div>

            <form onSubmit={handleForgot} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="label@example.com" required autoFocus className={inp + " pl-10 pr-4"} />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Send Reset Link
              </button>
            </form>

            <button onClick={() => { setMode("login"); setError(""); }}
              className="w-full text-center text-white/30 hover:text-white/60 text-xs mt-5 transition-colors">
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
