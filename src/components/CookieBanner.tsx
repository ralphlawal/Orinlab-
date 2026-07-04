"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "orinlabi-cookies";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setShow(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setShow(false);
  }

  function necessary() {
    localStorage.setItem(STORAGE_KEY, "necessary");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] p-4 md:p-6 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-[#0d0d0d] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl pointer-events-auto">
        <p className="text-white/60 text-sm leading-relaxed flex-1">
          We use cookies to improve your experience on OrinlabÍ Records. See our{" "}
          <Link href="/privacy" className="text-[#007bff] hover:underline">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={necessary}
            className="text-white/40 hover:text-white text-sm px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-colors whitespace-nowrap"
          >
            Necessary only
          </button>
          <button
            onClick={accept}
            className="bg-[#007bff] hover:bg-[#0069d9] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors whitespace-nowrap"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
