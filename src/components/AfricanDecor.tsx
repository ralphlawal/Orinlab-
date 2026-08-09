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
