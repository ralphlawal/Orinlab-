import { Music2, CheckCircle2, XCircle, AlertTriangle, Gauge, Volume2, Mic } from "lucide-react";
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

function LufsRow({ platform, target, max }: { platform: string; target: string; max: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
      <span className="text-white/70 text-sm">{platform}</span>
      <div className="flex items-center gap-6 text-right">
        <div>
          <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Target</p>
          <p className="text-white text-sm font-semibold">{target}</p>
        </div>
        <div>
          <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">True Peak Max</p>
          <p className="text-amber-300 text-sm font-semibold">{max}</p>
        </div>
      </div>
    </div>
  );
}

export default function AudioGuidelinesPage() {
  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Music2 size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl">Audio Guidelines</h1>
            <p className="text-white/35 text-sm">File requirements and mastering standards for all platforms</p>
          </div>
        </div>
      </div>

      {/* Quick spec card */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Gauge size={14} className="text-blue-400" />
          <h2 className="text-white font-semibold text-sm">Technical Specifications</h2>
        </div>
        <div>
          <Spec label="Format" value="WAV or FLAC" note="Lossless only — no MP3 or AAC for submission" />
          <Spec label="Sample rate" value="44,100 Hz or 48,000 Hz" note="44.1 kHz is standard; 48 kHz for video sync" />
          <Spec label="Bit depth" value="16-bit or 24-bit" note="24-bit preferred for mastered audio" />
          <Spec label="Channels" value="Stereo (2-channel)" note="Mono not accepted by most stores" />
          <Spec label="True peak" value="−1.0 dBTP or lower" note="Prevents clipping after codec encoding" />
          <Spec label="Silence at start" value="None (or under 2 sec)" />
          <Spec label="Silence at end" value="None (or under 3 sec)" />
        </div>
      </div>

      {/* Loudness targets */}
      <Section title="Loudness Targets by Platform">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-5 mb-3">
          <LufsRow platform="Spotify"      target="−14 LUFS" max="−1.0 dBTP" />
          <LufsRow platform="Apple Music"  target="−16 LUFS" max="−1.0 dBTP" />
          <LufsRow platform="YouTube Music" target="−14 LUFS" max="−1.0 dBTP" />
          <LufsRow platform="Tidal"        target="−14 LUFS" max="−1.0 dBTP" />
          <LufsRow platform="Amazon Music" target="−14 LUFS" max="−1.0 dBTP" />
          <LufsRow platform="Deezer"       target="−15 LUFS" max="−1.0 dBTP" />
          <LufsRow platform="Boomplay"     target="−14 LUFS" max="−1.0 dBTP" />
        </div>
        <p className="text-white/30 text-xs px-1">
          Platforms normalize playback loudness. If your master is louder than their target, it will be turned down automatically — often at the cost of dynamics. Master to −14 LUFS as a safe general target.
        </p>
      </Section>

      {/* What's required */}
      <Section title="What's Required">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4">
          <ul>
            <Rule ok={true}>Lossless source file (WAV or FLAC) — not a re-encoded MP3</Rule>
            <Rule ok={true}>Professionally mastered or well-balanced mix</Rule>
            <Rule ok={true}>True peak at or below −1.0 dBTP</Rule>
            <Rule ok={true}>Clean fade-in and fade-out — no abrupt cuts</Rule>
            <Rule ok={true}>Stereo mix, both channels balanced</Rule>
          </ul>
        </div>
      </Section>

      {/* What's not allowed */}
      <Section title="What's Not Allowed">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4">
          <ul>
            <Rule ok={false}>MP3, AAC, OGG, or any lossy format as the submission file</Rule>
            <Rule ok={false}>Audible clipping or distortion anywhere in the track</Rule>
            <Rule ok={false}>Watermarks, countdown beeps, or placeholder tones</Rule>
            <Rule ok={false}>Excessive silence (more than 3 seconds at start or end)</Rule>
            <Rule ok={false}>Samples or interpolations without proper clearance</Rule>
            <Rule ok={false}>Tracks shorter than 30 seconds (streaming royalty threshold)</Rule>
          </ul>
        </div>
      </Section>

      {/* Tips */}
      <Section title="Mastering Tips">
        <div className="space-y-3">
          {[
            {
              icon: "🎚️",
              tip: "Master for −14 LUFS integrated",
              desc: "This is the sweet spot across most platforms. Your mix will be reproduced accurately without loudness normalization kicking in.",
            },
            {
              icon: "🔊",
              tip: "Keep true peak at −1.0 dBTP or lower",
              desc: "Streaming codecs (AAC, Ogg) can push peaks above 0 dBFS. A −1 dBTP ceiling prevents inter-sample clipping.",
            },
            {
              icon: "🎛️",
              tip: "Don't over-compress",
              desc: "Heavy limiting to chase loudness destroys dynamics. Platforms normalize anyway — a punchy, dynamic master sounds better than a loud, squashed one.",
            },
            {
              icon: "🛠️",
              tip: "Use the free Audio Converter in Tools",
              desc: "If your DAW exports 32-bit float, convert to 24-bit WAV before submitting using the built-in converter.",
            },
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
          <p className="text-amber-300 font-semibold text-sm mb-1">Lossy files will be rejected</p>
          <p className="text-amber-400/60 text-xs leading-relaxed">
            Submitting an MP3 that has been re-exported as WAV does not make it lossless — the quality is already degraded. Always export directly from your DAW or mastering software as WAV or FLAC.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/portal/tools"
          className="bg-[#007bff] hover:bg-[#0066d6] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Open Audio Converter →
        </Link>
        <Link
          href="/portal/guidelines/artwork"
          className="text-white/40 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl border border-white/[0.08] hover:border-white/20 transition-colors"
        >
          Artwork Guidelines →
        </Link>
        <Link
          href="/portal/releases/new"
          className="text-white/40 hover:text-white text-sm font-medium px-5 py-2.5 rounded-xl border border-white/[0.08] hover:border-white/20 transition-colors"
        >
          Submit a Release →
        </Link>
      </div>
    </section>
  );
}
