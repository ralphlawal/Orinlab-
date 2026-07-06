"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

const XIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.107.549 4.09 1.515 5.815L.057 23.998l6.304-1.658A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 01-4.992-1.367l-.358-.213-3.714.975.99-3.62-.234-.371A9.82 9.82 0 012.182 12C2.182 6.578 6.578 2.182 12 2.182S21.818 6.578 21.818 12 17.422 21.818 12 21.818z" />
  </svg>
);

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const enc = (s: string) => encodeURIComponent(s);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-white/25 text-xs font-medium mr-1 flex items-center gap-1.5">
        <Share2 size={12} /> Share
      </span>

      <a
        href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
        className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] text-white/50 hover:text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      >
        <XIcon size={12} />
        Post
      </a>

      <a
        href={`https://wa.me/?text=${enc(title + " — " + url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-[#25D366]/10 border border-white/[0.08] hover:border-[#25D366]/30 text-white/50 hover:text-[#25D366] px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      >
        <WhatsAppIcon size={12} />
        WhatsApp
      </a>

      <button
        onClick={copy}
        aria-label="Copy link"
        className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] text-white/50 hover:text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all"
      >
        {copied
          ? <><Check size={12} className="text-emerald-400" /> Copied!</>
          : <><Copy size={12} /> Copy link</>
        }
      </button>
    </div>
  );
}
