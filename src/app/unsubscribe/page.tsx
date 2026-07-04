"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

function UnsubscribeContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    if (!email) setState("error");
  }, [email]);

  async function unsubscribe() {
    setState("loading");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setState("done");
      else setState("error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <Link href="/" className="inline-flex justify-center">
          <Image
            src="https://res.cloudinary.com/dco9drzzp/image/upload/v1781548294/IMG_1636_icjgpt.png"
            alt="OrinlabÍ Records"
            width={110}
            height={30}
            className="object-contain"
          />
        </Link>

        {state === "done" ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
            <h1 className="text-white font-bold text-2xl">Unsubscribed</h1>
            <p className="text-white/50 leading-relaxed">
              <span className="text-white/70">{email}</span> has been removed from the OrinlabÍ Records mailing list. You won&apos;t receive any more emails from us.
            </p>
            <Link href="/" className="inline-block text-[#007bff] text-sm hover:underline mt-2">
              ← Back to OrinlabÍ Records
            </Link>
          </div>
        ) : state === "error" && !email ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h1 className="text-white font-bold text-2xl">Invalid Link</h1>
            <p className="text-white/50">This unsubscribe link is missing the email address. Please use the link from your email.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-white font-bold text-2xl mb-3">Unsubscribe</h1>
              <p className="text-white/50 leading-relaxed">
                Remove <span className="text-white/80">{email}</span> from the OrinlabÍ Records newsletter?
              </p>
            </div>

            {state === "error" && (
              <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={unsubscribe}
                disabled={state === "loading"}
                className="w-full bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-semibold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {state === "loading" ? <Loader2 size={16} className="animate-spin" /> : null}
                {state === "loading" ? "Unsubscribing…" : "Yes, unsubscribe me"}
              </button>
              <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
                Cancel — keep me subscribed
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 size={28} className="text-[#007bff] animate-spin" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
