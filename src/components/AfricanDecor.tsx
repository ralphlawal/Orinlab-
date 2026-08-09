// African decorative components — server-compatible, purely visual.
// All elements carry pointer-events:none and aria-hidden.
// Colors: Kente Gold #D4A017 · Forest Green #2A5C3F · Deep Red #8B1A1A

const G = "#D4A017"; // Kente Gold
const V = "#2A5C3F"; // Forest Green
const R = "#8B1A1A"; // Deep Red
const K = "#0A0A08"; // Near-black

// Pre-encoded SVG data URI for MudclothBg — computed once at module load
const MUDCLOTH_URI = (() => {
  const svg =
    '<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">' +
    '<polygon points="30,3 57,30 30,57 3,30" fill="none" stroke="#D4A017" stroke-width="1.5"/>' +
    '<line x1="3" y1="30" x2="57" y2="30" stroke="#D4A017" stroke-width="0.8"/>' +
    '<line x1="30" y1="3" x2="30" y2="57" stroke="#D4A017" stroke-width="0.8"/>' +
    '<polygon points="0,0 14,0 0,14" fill="#D4A017" fill-opacity="0.55"/>' +
    '<polygon points="60,0 46,0 60,14" fill="#D4A017" fill-opacity="0.55"/>' +
    '<polygon points="0,60 14,60 0,46" fill="#D4A017" fill-opacity="0.55"/>' +
    '<polygon points="60,60 46,60 60,46" fill="#D4A017" fill-opacity="0.55"/>' +
    '<circle cx="30" cy="30" r="3.5" fill="#D4A017" fill-opacity="0.65"/>' +
    '</svg>';
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

// Computes a pie-slice SVG path from center (cx,cy) to radius r,
// spanning from angle a0 to a1 (degrees, clockwise from 3 o'clock).
function arcSeg(
  cx: number, cy: number, r: number,
  a0: number, a1: number,
): string {
  const d = Math.PI / 180;
  const x0 = (cx + r * Math.cos(a0 * d)).toFixed(2);
  const y0 = (cy + r * Math.sin(a0 * d)).toFixed(2);
  const x1 = (cx + r * Math.cos(a1 * d)).toFixed(2);
  const y1 = (cy + r * Math.sin(a1 * d)).toFixed(2);
  return `M${cx},${cy}L${x0},${y0}A${r},${r},0,0,1,${x1},${y1}Z`;
}

// 12 repeating colors for the ring segments
const RING12 = [G, K, R, V, G, K, R, V, G, K, R, V];

/**
 * Concentric-ring sun mandala — inspired by African shield and Kente
 * wheel motifs. Three rings of alternating coloured pie segments.
 * Render at 6–12% opacity as a background decoration.
 */
export function AfricanSun({
  size = 500,
  opacity = 0.08,
  className = "",
}: {
  size?: number;
  opacity?: number;
  className?: string;
}) {
  const cx = size / 2, cy = size / 2;

  // Outer ring: from center to OR, then covered by a fill circle at OI
  const OR = size * 0.44;  // outer ring outer edge
  const OI = size * 0.315; // outer ring inner edge (cover circle)

  // Middle ring drawn to MR, covered at MI
  const MR = size * 0.295;
  const MI = size * 0.185;

  // Inner ring drawn to IR, covered at II
  const IR = size * 0.17;
  const II = size * 0.085;

  // Centre dot
  const CR = size * 0.065;

  const BG = "#050505";
  const n = 12, step = 360 / n, base = -90;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className={className}
      style={{ opacity, pointerEvents: "none" }}
    >
      {/* Outer ring — 12 pie slices */}
      {RING12.map((c, i) => (
        <path key={`o${i}`} d={arcSeg(cx, cy, OR, base + i * step, base + (i + 1) * step)} fill={c} />
      ))}
      {/* Mask inner part of outer ring */}
      <circle cx={cx} cy={cy} r={OI} fill={BG} />

      {/* Middle ring — offset by half step for interlocking look */}
      {RING12.map((c, i) => (
        <path key={`m${i}`} d={arcSeg(cx, cy, MR, base + (i + 0.5) * step, base + (i + 1.5) * step)} fill={c} />
      ))}
      <circle cx={cx} cy={cy} r={MI} fill={BG} />

      {/* Inner ring — 8 segments */}
      {[G, K, R, G, V, K, G, R].map((c, i) => (
        <path key={`i${i}`} d={arcSeg(cx, cy, IR, base + i * 45, base + (i + 1) * 45)} fill={c} />
      ))}
      <circle cx={cx} cy={cy} r={II} fill={BG} />

      {/* Centre dot */}
      <circle cx={cx} cy={cy} r={CR} fill={G} />
      <circle cx={cx} cy={cy} r={CR * 0.42} fill={BG} />
    </svg>
  );
}

/**
 * Horizontal Kente-cloth strip — use as a section divider.
 * Replaces plain border lines with a pattern of coloured blocks.
 */
export function KenteStrip({
  height = 6,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  // Kente pattern: wide gold bars, narrow green/red/black accents
  const css = [
    `${G} 0px, ${G} 24px`,
    `${V} 24px, ${V} 36px`,
    `${R} 36px, ${R} 44px`,
    `${K} 44px, ${K} 52px`,
    `${G} 52px, ${G} 76px`,
    `${R} 76px, ${R} 84px`,
    `${V} 84px, ${V} 92px`,
    `${K} 92px, ${K} 100px`,
  ].join(", ");

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        height: `${height}px`,
        backgroundImage: `repeating-linear-gradient(90deg, ${css})`,
        flexShrink: 0,
      }}
    />
  );
}

/**
 * Stylised djembe drum SVG — West African goblet drum silhouette.
 * Use as a decorative illustration element.
 */
export function DjembeArt({
  size = 140,
  opacity = 1,
  className = "",
}: {
  size?: number;
  opacity?: number;
  className?: string;
}) {
  // viewBox 0 0 100 200 — aspect 1:2
  return (
    <svg
      width={size}
      height={size * 2}
      viewBox="0 0 100 200"
      aria-hidden="true"
      className={className}
      style={{ opacity, pointerEvents: "none" }}
    >
      {/* Drum head */}
      <ellipse cx="50" cy="19" rx="38" ry="10" fill={G} />
      <ellipse cx="50" cy="19" rx="29" ry="6.5" fill={K} />

      {/* Upper body — curves inward toward neck */}
      <path d="M 12 19 C 9 58 26 95 32 111 L 68 111 C 74 95 91 58 88 19 Z" fill={V} />

      {/* Lacing lines across upper body */}
      <path d="M 17 46 Q 50 41 83 46" stroke={G} strokeWidth="1.8" fill="none" opacity="0.55" />
      <path d="M 20 72 Q 50 67 80 72" stroke={G} strokeWidth="1.8" fill="none" opacity="0.55" />
      <path d="M 25 96 Q 50 92 75 96" stroke={G} strokeWidth="1.8" fill="none" opacity="0.55" />

      {/* Neck */}
      <rect x="32" y="109" width="36" height="18" rx="3" fill={R} />
      {/* Diamond accent on neck */}
      <polygon points="50,112 58,118 50,124 42,118" fill={G} />

      {/* Lower bell — flares outward */}
      <path d="M 32 127 C 11 156 8 180 11 196 L 89 196 C 92 180 89 156 68 127 Z" fill={V} />

      {/* Decorative band on lower bell */}
      <path d="M 21 158 Q 50 153 79 158" stroke={G} strokeWidth="2" fill="none" opacity="0.5" />

      {/* Bottom rim */}
      <ellipse cx="50" cy="195" rx="39" ry="8" fill={G} />
      <ellipse cx="50" cy="195" rx="29" ry="5" fill={K} />
    </svg>
  );
}

/**
 * Small Adinkra-inspired diamond glyph — concentric diamond with
 * centre dot. Use as a section-header bullet or corner decoration.
 */
export function AdinkraGlyph({
  size = 22,
  color = G,
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      style={{ pointerEvents: "none" }}
    >
      {/* Outer diamond */}
      <path d="M12,1 L23,12 L12,23 L1,12 Z" fill="none" stroke={color} strokeWidth="1.5" />
      {/* Inner diamond (filled, semi-transparent) */}
      <path d="M12,5 L19,12 L12,19 L5,12 Z" fill={color} fillOpacity="0.25" />
      {/* Centre dot */}
      <circle cx="12" cy="12" r="3" fill={color} />
    </svg>
  );
}

/**
 * Warm gold dot-matrix pattern — use as `absolute inset-0` background
 * over a dark section. opacity prop controls visibility (0.3–0.5 typical).
 */
export function AfricanGeoBg({
  opacity = 0.35,
  className = "",
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle, ${G} 1px, transparent 1px)`,
        backgroundSize: "44px 44px",
        opacity,
      }}
    />
  );
}

/**
 * Woven-fabric CSS texture — overlapping gold horizontal lines and green
 * vertical lines create a crosshatch that evokes hand-woven Kente cloth.
 * Use as `absolute inset-0` at 0.04–0.08 opacity.
 */
export function WovenBg({
  opacity = 0.06,
  className = "",
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: [
          "repeating-linear-gradient(0deg, transparent 0px, transparent 14px, rgba(212,160,23,0.6) 14px, rgba(212,160,23,0.6) 15px)",
          "repeating-linear-gradient(90deg, transparent 0px, transparent 14px, rgba(42,92,63,0.5) 14px, rgba(42,92,63,0.5) 15px)",
        ].join(", "),
        opacity,
      }}
    />
  );
}

/**
 * Malian mud-cloth (bogolan) geometric pattern — diamond + cross + corner
 * triangles tiling at 60 px. Use as `absolute inset-0` at 0.04–0.07 opacity.
 */
export function MudclothBg({
  opacity = 0.05,
  className = "",
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: MUDCLOTH_URI,
        backgroundSize: "60px 60px",
        opacity,
      }}
    />
  );
}

/**
 * Large African shield / vinyl medallion — five concentric rings of
 * alternating Kente colour segments, growing denser toward the outer edge.
 * Designed to sit behind the hero plan card as dominant background art.
 */
export function AfricanVinyl({
  size = 700,
  opacity = 0.14,
  className = "",
}: {
  size?: number;
  opacity?: number;
  className?: string;
}) {
  const cx = size / 2, cy = size / 2;

  // Ring boundary radii (as fraction of half-size)
  const r1 = size * 0.48;  // outermost ring outer edge
  const m1 = size * 0.40;  // ring 1 inner (mask)
  const m2 = size * 0.30;  // ring 2 inner
  const m3 = size * 0.195; // ring 3 inner
  const m4 = size * 0.105; // ring 4 inner / center outer
  const rc = size * 0.07;  // center dot
  const ri = size * 0.036; // center hole

  const BG = "#050505";
  const b  = -90; // start angle

  // Ring 1 — 12 wide slices, step=30°
  const C12 = [G, K, R, V, G, K, R, V, G, K, R, V];
  // Ring 2 — 18 slices, step=20°, offset 10°
  const C18 = [G, K, G, R, G, K, G, V, G, K, G, R, G, K, G, V, G, K];
  // Ring 3 — 24 slices, step=15°, offset
  const C24 = [G, V, K, R, G, K, G, R, V, K, G, R, G, V, K, G, R, K, G, V, G, K, R, G];
  // Ring 4 — 36 slices, step=10°, densest
  const C36 = [G, K, G, K, R, K, G, K, G, V, G, K, G, K, R, K, G, K, V, K, G, K, G, K, R, K, G, V, G, K, G, K, G, V, R, K];

  // Stroke rings for extra detail
  const strokes = [m1 * 0.995, m2 * 0.995, m3 * 0.995, m4 * 0.995];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className={className}
      style={{ opacity, pointerEvents: "none" }}
    >
      {/* Outer accent ring stroke */}
      <circle cx={cx} cy={cy} r={r1 * 1.01} fill="none" stroke={G} strokeWidth={size * 0.006} opacity="0.35" />

      {/* Ring 1 — 12 segments */}
      {C12.map((c, i) => (
        <path key={`v1-${i}`} d={arcSeg(cx, cy, r1, b + i * 30, b + (i + 1) * 30)} fill={c} />
      ))}
      <circle cx={cx} cy={cy} r={m1} fill={BG} />

      {/* Ring 2 — 18 segments, 10° offset */}
      {C18.map((c, i) => (
        <path key={`v2-${i}`} d={arcSeg(cx, cy, m1, b + 10 + i * 20, b + 10 + (i + 1) * 20)} fill={c} />
      ))}
      <circle cx={cx} cy={cy} r={m2} fill={BG} />

      {/* Ring 3 — 24 segments */}
      {C24.map((c, i) => (
        <path key={`v3-${i}`} d={arcSeg(cx, cy, m2, b + i * 15, b + (i + 1) * 15)} fill={c} />
      ))}
      <circle cx={cx} cy={cy} r={m3} fill={BG} />

      {/* Ring 4 — 36 segments, densest */}
      {C36.map((c, i) => (
        <path key={`v4-${i}`} d={arcSeg(cx, cy, m3, b + i * 10, b + (i + 1) * 10)} fill={c} />
      ))}
      <circle cx={cx} cy={cy} r={m4} fill={BG} />

      {/* Divider strokes for crisp ring edges */}
      {strokes.map((r, i) => (
        <circle key={`sv-${i}`} cx={cx} cy={cy} r={r} fill="none" stroke={BG} strokeWidth={size * 0.004} />
      ))}

      {/* Centre gold dot with hole */}
      <circle cx={cx} cy={cy} r={rc} fill={G} />
      <circle cx={cx} cy={cy} r={ri} fill={BG} />

      {/* Cardinal accent points (12/3/6/9 o'clock) */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg - 90) * Math.PI / 180;
        return (
          <circle
            key={deg}
            cx={cx + r1 * 1.005 * Math.cos(rad)}
            cy={cy + r1 * 1.005 * Math.sin(rad)}
            r={size * 0.018}
            fill={G}
            opacity="0.7"
          />
        );
      })}
    </svg>
  );
}

/**
 * Floating music note symbols — static positions with CSS animations so they
 * drift upward and fade without any client-side JS (SSR-safe).
 */
const NOTES_DATA = [
  { s: "♪", x:  8, b: 12, sz: 20, dur: 4.5, del: 0   },
  { s: "♫", x: 22, b: 28, sz: 13, dur: 5.8, del: 1.3 },
  { s: "♩", x: 42, b:  8, sz: 22, dur: 3.9, del: 2.1 },
  { s: "♪", x: 63, b: 22, sz: 15, dur: 6.2, del: 0.7 },
  { s: "♫", x: 80, b: 14, sz: 19, dur: 4.8, del: 3.5 },
  { s: "♩", x: 14, b: 38, sz: 16, dur: 5.4, del: 1.9 },
  { s: "♪", x: 52, b: 18, sz: 12, dur: 3.7, del: 4.2 },
  { s: "♫", x: 72, b: 32, sz: 24, dur: 6.8, del: 2.8 },
  { s: "♩", x: 32, b:  6, sz: 14, dur: 4.1, del: 5.0 },
  { s: "♪", x: 90, b: 20, sz: 17, dur: 5.6, del: 1.5 },
  { s: "♫", x: 28, b: 45, sz: 20, dur: 3.5, del: 3.8 },
  { s: "♩", x: 60, b: 10, sz: 11, dur: 7.0, del: 0.4 },
];

export function FloatingNotes({
  color = G,
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      {NOTES_DATA.map((n, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${n.x}%`,
            bottom: `${n.b}%`,
            fontSize: `${n.sz}px`,
            color,
            animation: `float-note ${n.dur}s ${n.del}s ease-in-out infinite`,
            opacity: 0,
            userSelect: "none",
          }}
        >
          {n.s}
        </span>
      ))}
    </div>
  );
}

/**
 * Animated equaliser / waveform bars — evokes a live audio visualisation.
 * Each bar has its own rhythm, giving an organic polyrhythmic feel.
 */
const BAR_DURS = [0.75, 1.1, 0.65, 1.25, 0.9, 0.6, 1.15, 0.8, 1.0, 0.7, 1.3, 0.85];
const BAR_DELS = [0, 0.3, 0.6, 0.1, 0.5, 0.85, 0.2, 0.7, 0.4, 0.9, 0.15, 0.55];

export function WaveformDecor({
  bars = 20,
  color = G,
  opacity = 0.55,
  height = 40,
  className = "",
}: {
  bars?: number;
  color?: string;
  opacity?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-end pointer-events-none ${className}`}
      style={{ height: `${height}px`, opacity, gap: "3px" }}
    >
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            minWidth: "2px",
            maxWidth: "7px",
            borderRadius: "3px",
            height: "100%",
            background: color,
            animation: `wave-bar ${BAR_DURS[i % BAR_DURS.length]}s ${BAR_DELS[i % BAR_DELS.length]}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * West African kora (bridge harp) silhouette — 21-string calabash harp
 * native to the Mande people. Use as a floating decorative illustration.
 */
export function KoraArt({
  size = 120,
  opacity = 1,
  className = "",
}: {
  size?: number;
  opacity?: number;
  className?: string;
}) {
  // viewBox 0 0 100 180 — aspect 1:1.8
  return (
    <svg
      width={size}
      height={size * 1.8}
      viewBox="0 0 100 180"
      aria-hidden="true"
      className={className}
      style={{ opacity, pointerEvents: "none" }}
    >
      {/* Gourd body */}
      <ellipse cx="50" cy="142" rx="46" ry="36" fill={V} />
      {/* Gourd soundboard (skin) */}
      <ellipse cx="50" cy="136" rx="35" ry="25" fill={K} fillOpacity="0.75" />
      {/* Decorative ring on gourd */}
      <ellipse cx="50" cy="142" rx="31" ry="19" fill="none" stroke={G} strokeWidth="1.2" opacity="0.45" />

      {/* Neck — runs through centre from top to gourd */}
      <rect x="46" y="4" width="8" height="150" rx="3" fill={R} />

      {/* Bridge stick — horizontal bar resting on gourd */}
      <rect x="16" y="105" width="68" height="5" rx="2" fill={G} />

      {/* Left set of strings — fan from neck to bridge */}
      <line x1="46" y1="18" x2="20" y2="107" stroke={G} strokeWidth="1.1" opacity="0.7" />
      <line x1="46" y1="33" x2="26" y2="107" stroke={G} strokeWidth="1.1" opacity="0.7" />
      <line x1="46" y1="48" x2="32" y2="107" stroke={G} strokeWidth="1.1" opacity="0.7" />
      <line x1="46" y1="63" x2="38" y2="107" stroke={G} strokeWidth="1.1" opacity="0.7" />
      {/* Centre string */}
      <line x1="50" y1="12" x2="50" y2="105" stroke={G} strokeWidth="1.1" opacity="0.7" />
      {/* Right set of strings */}
      <line x1="54" y1="18" x2="80" y2="107" stroke={G} strokeWidth="1.1" opacity="0.7" />
      <line x1="54" y1="33" x2="74" y2="107" stroke={G} strokeWidth="1.1" opacity="0.7" />
      <line x1="54" y1="48" x2="68" y2="107" stroke={G} strokeWidth="1.1" opacity="0.7" />
      <line x1="54" y1="63" x2="62" y2="107" stroke={G} strokeWidth="1.1" opacity="0.7" />

      {/* Tuning rings on neck */}
      <rect x="44" y="22" width="12" height="4" rx="2" fill={G} />
      <rect x="44" y="42" width="12" height="4" rx="2" fill={G} />
      <rect x="44" y="62" width="12" height="4" rx="2" fill={G} />
      <rect x="44" y="82" width="12" height="4" rx="2" fill={G} />

      {/* Bottom rim */}
      <ellipse cx="50" cy="178" rx="18" ry="5" fill={G} opacity="0.5" />
    </svg>
  );
}
