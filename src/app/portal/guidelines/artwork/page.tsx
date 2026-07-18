import { ImageIcon, CheckCircle2, XCircle, AlertTriangle, Ruler, Palette, FileImage } from "lucide-react";
import Link from "next/link";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-white font-semibold text-base mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
      {ok
        ? <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        : <XCircle      size={15} className="text-red-400    flex-shrink-0 mt-0.5" />
      }
      <span className={`text-sm ${ok ? "text-white/75" : "text-white/60"}`}>{children}</span>
    </li>
  );
}

function Spec({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/[0.05] last:border-0">
      <span className="text-white/40 text-sm">{label}</span>
      <div className="text-right">
        <span className="text-white text-sm font-semibold">{value}</span>
        {note && <p className="text-white/30 text-xs mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

export default function ArtworkGuidelinesPage() {
  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <ImageIcon size={18} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl">Artwork Guidelines</h1>
            <p className="text-white/35 text-sm">Requirements for cover art across all streaming platforms</p>
          </div>
        </div>
      </div>

      {/* Quick spec card */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Ruler size={14} className="text-purple-400" />
          <h2 className="text-white font-semibold text-sm">Technical Specifications</h2>
        </div>
        <div>
          <Spec label="Dimensions" value="3000 × 3000 px" note="Minimum — 4000 × 4000 px preferred" />
          <Spec label="Aspect ratio" value="1:1 (square)" note="Any other ratio will be rejected" />
          <Spec label="File format" value="JPG or PNG" note="PNG for artwork with sharp text or transparency" />
          <Spec label="Color mode" value="RGB" note="CMYK files are not accepted by streaming stores" />
          <Spec label="Color space" value="sRGB" />
          <Spec label="File size" value="Under 10 MB" />
          <Spec label="Resolution" value="72 – 300 DPI" note="Screen display — DPI itself is not enforced" />
        </div>
      </div>

      {/* What's allowed */}
      <Section title="What's Allowed">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4">
          <ul>
            <Rule ok={true}>High-resolution, sharp and clear imagery</Rule>
            <Rule ok={true}>Original photography, illustrations, or digital art</Rule>
            <Rule ok={true}>Your artist name and/or release title as text</Rule>
            <Rule ok={true}>Abstract or artistic backgrounds</Rule>
            <Rule ok={true}>Explicit content if the release is marked explicit</Rule>
          </ul>
        </div>
      </Section>

      {/* What's not allowed */}
      <Section title="What's Not Allowed">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4">
          <ul>
            <Rule ok={false}>Social media handles, @usernames, or hashtags</Rule>
            <Rule ok={false}>Website URLs or promotional text (e.g. "Out Now", "Available on Spotify")</Rule>
            <Rule ok={false}>Third-party logos, brand marks, or watermarks</Rule>
            <Rule ok={false}>Blurry, pixelated, or stretched images</Rule>
            <Rule ok={false}>Explicit nudity without the explicit flag</Rule>
            <Rule ok={false}>Copyright-infringing artwork (stock photos without licence, fan art, etc.)</Rule>
            <Rule ok={false}>Borders, letterboxing, or non-square padding</Rule>
            <Rule ok={false}>Text smaller than what's readable at thumbnail size (200 × 200 px)</Rule>
          </ul>
        </div>
      </Section>

      {/* Tips */}
      <Section title="Design Tips">
        <div className="space-y-3">
          {[
            { icon: "🎨", tip: "Test your artwork at small sizes", desc: "Preview at 200 × 200 px — it's the size listeners see in search results and playlists." },
            { icon: "🌈", tip: "Use high-contrast colours", desc: "Dark text on light background or vice versa. Low-contrast artwork looks washed out on OLED screens." },
            { icon: "📱", tip: "Leave breathing room", desc: "Keep important elements away from the edges — streaming apps may crop corners on some displays." },
            { icon: "🖼️", tip: "Save as PNG for text-heavy artwork", desc: "JPG compression creates visible artefacts around sharp text. Use PNG to keep it crisp." },
          ].map((item) => (
            <div key={item.tip} className="flex gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div>
                <p className="text-white text-sm font-medium mb-0.5">{item.tip}</p>
                <p className="text-white/45 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Warning */}
      <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-5 mb-8 flex gap-3">
        <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-300 font-semibold text-sm mb-1">Artwork rejection delays your release</p>
          <p className="text-amber-400/60 text-xs leading-relaxed">
            If your artwork doesn't meet these requirements, streaming stores will reject the release and we'll need to resubmit — adding 3–5 business days. Get it right the first time.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/portal/releases/new"
          className="bg-[#007bff] hover:bg-[#0066d6] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Submit a Release →
        </Link>
        <Link
          href="/portal/guidelines/audio"
          className="text-white/40 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl border border-white/[0.08] hover:border-white/20 transition-colors"
        >
          Audio Guidelines →
        </Link>
      </div>
    </section>
  );
}
