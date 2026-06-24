"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [done, setDone]           = useState(false);
  const [ready, setReady]         = useState(false);

  useEffect(() => {
    // Supabase recovery link lands with a ?code= param; the client SDK
    // detects it on the URL hash and exchanges it for a session automatically
    // when we call getSession. We just need to wait for the session to exist.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        // listen for the AUTH_CODE_EXCHANGE event fired after redirect
        supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY") setReady(true);
        });
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message || "Could not update password. Please try again.");
    } else {
      setDone(true);
      setTimeout(() => router.replace("/portal"), 2500);
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

        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={28} className="text-green-400" />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">Password Set!</h2>
            <p className="text-white/50 text-sm">Taking you to your portal…</p>
          </div>
        ) : !ready ? (
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-[#007bff] mx-auto mb-4" />
            <p className="text-white/50 text-sm">Verifying your reset link…</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-white font-bold text-2xl mb-2">Set Your Password</h1>
              <p className="text-white/50 text-sm">Choose a strong password for your artist account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="New password" required autoFocus minLength={8}
                  className={inp + " pl-10 pr-12"} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPw ? "text" : "password"} value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                  placeholder="Confirm password" required minLength={8}
                  className={inp + " pl-10 pr-4"} />
              </div>

              {password && (
                <p className={`text-xs ${password.length >= 8 ? "text-green-400" : "text-white/30"}`}>
                  {password.length >= 8 ? "Strong enough" : `${8 - password.length} more characters needed`}
                </p>
              )}

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Save Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
