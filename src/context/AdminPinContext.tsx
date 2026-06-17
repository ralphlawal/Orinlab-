"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock, X } from "lucide-react";

interface PinContextValue {
  unlocked: boolean;
  requestUnlock: (onSuccess: () => void) => void;
}

const PinContext = createContext<PinContextValue>({
  unlocked: false,
  requestUnlock: (cb) => cb(),
});

export function AdminPinProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [showing, setShowing] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef<(() => void) | null>(null);
  const adminEmailRef = useRef<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      adminEmailRef.current = data.session?.user?.email ?? "";
    });
  }, []);

  const requestUnlock = useCallback(
    (onSuccess: () => void) => {
      if (unlocked) {
        onSuccess();
        return;
      }
      pendingRef.current = onSuccess;
      setShowing(true);
      setPin("");
      setError("");
    },
    [unlocked]
  );

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim(), admin_email: adminEmailRef.current }),
      });
      const data = await res.json();
      if (data.ok) {
        setUnlocked(true);
        setShowing(false);
        setPin("");
        pendingRef.current?.();
        pendingRef.current = null;
      } else {
        setError("Incorrect PIN. Try again.");
        setPin("");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function dismiss() {
    setShowing(false);
    setPin("");
    setError("");
    pendingRef.current = null;
  }

  return (
    <PinContext.Provider value={{ unlocked, requestUnlock }}>
      {children}

      {showing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/[0.1] rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#007bff]/10 rounded-xl flex items-center justify-center">
                  <Lock size={18} className="text-[#007bff]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Admin PIN Required</h3>
                  <p className="text-white/40 text-xs mt-0.5">Enter your PIN to confirm this action</p>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="text-white/30 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="• • • • • •"
                autoFocus
                className="w-full bg-white/[0.05] border border-white/[0.1] focus:border-[#007bff] outline-none text-white placeholder-white/20 text-sm px-4 py-3.5 rounded-xl transition-colors text-center tracking-[0.5em] text-base"
              />
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !pin.trim()}
                className="w-full bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Verifying…
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </PinContext.Provider>
  );
}

export function usePinGate() {
  return useContext(PinContext);
}
