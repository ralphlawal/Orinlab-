"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Zap } from "lucide-react";

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const releaseId = params.get("release_id");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay so the webhook has time to fire before they check the release
    const t = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {!ready ? (
          <Loader2 size={36} className="animate-spin text-violet-400 mx-auto mb-6" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-violet-500/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-violet-400" />
          </div>
        )}

        <h1 className="text-white font-bold text-2xl mb-3">
          {ready ? "Payment confirmed!" : "Processing…"}
        </h1>

        {ready && (
          <>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap size={14} className="text-violet-400" />
              <p className="text-violet-300 text-sm font-medium">Priority Distribution activated</p>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-8">
              Your release will be distributed within <strong className="text-white">3 days</strong>.
              We&apos;ll notify you by email and in the portal when it&apos;s live.
            </p>
            <div className="flex flex-col gap-3">
              {releaseId && (
                <Link
                  href={`/portal/releases/${releaseId}`}
                  className="w-full bg-violet-500 hover:bg-violet-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  View My Release
                </Link>
              )}
              <Link
                href="/portal"
                className="w-full border border-white/10 hover:border-white/30 text-white/60 hover:text-white font-medium py-3 rounded-xl transition-colors text-sm"
              >
                Go to Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
