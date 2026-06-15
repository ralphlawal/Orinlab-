"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-[#007bff] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <h1 className="text-white font-bold text-2xl">Orinlabi Admin</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Signing in…</>
              : <><LogIn size={18} /> Sign In</>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
