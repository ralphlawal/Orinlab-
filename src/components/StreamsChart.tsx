"use client";
import { useEffect, useRef, useState } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DATASETS = [
  { label: "Spotify",     color: "#1DB954", data: [1, 2, 3, 5, 7, 10, 12, 15, 17, 20, 23, 26] },
  { label: "TikTok",      color: "#69C9D0", data: [1, 1, 2, 3,  5,  7, 10, 14, 18, 23, 28, 33] },
  { label: "Apple Music", color: "#FC3C44", data: [1, 2, 2, 3,  4,  5,  6,  8, 10, 12, 14, 16] },
];

export function StreamsChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start: number | null = null;
          const dur = 2400;
          const tick = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min(1, (ts - start) / dur);
            const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
            setProgress(ease);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const W = 800, H = 220;
  const pad = { top: 20, bottom: 36, left: 44, right: 16 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const maxVal = Math.max(...DATASETS.flatMap(d => d.data)) * 1.12;

  const getX = (i: number) => pad.left + (i / (MONTHS.length - 1)) * cW;
  const getY = (v: number) => pad.top + cH - (v / maxVal) * cH;

  function buildPaths(data: number[]) {
    const steps = data.length - 1;
    const curStep = progress * steps;
    const fullSteps = Math.floor(curStep);
    const frac = curStep - fullSteps;

    const pts: [number, number][] = [];
    for (let i = 0; i <= Math.min(fullSteps, steps); i++) {
      pts.push([getX(i), getY(data[i])]);
    }
    if (fullSteps < steps && progress > 0) {
      const [x0, y0] = [getX(fullSteps), getY(data[fullSteps])];
      const [x1, y1] = [getX(fullSteps + 1), getY(data[fullSteps + 1])];
      pts.push([x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac]);
    }
    if (pts.length < 2) return { line: "", area: "" };

    let line = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      line += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    const last = pts[pts.length - 1];
    const area = line + ` L ${last[0]},${pad.top + cH} L ${pts[0][0]},${pad.top + cH} Z`;

    return { line, area, tip: last };
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => ({ val: maxVal * f, y: getY(maxVal * f) }));

  return (
    <div ref={ref} className="w-full select-none">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
        <defs>
          {DATASETS.map(d => (
            <linearGradient key={d.label} id={`cg-${d.label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={d.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid */}
        {yTicks.map(({ val, y }) => (
          <g key={val}>
            <line x1={pad.left} x2={W - pad.right} y1={y} y2={y}
              stroke="rgba(255,255,255,0.055)" strokeWidth="1" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end"
              fill="rgba(255,255,255,0.22)" fontSize="9.5" fontFamily="system-ui, sans-serif">
              {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : Math.round(val)}
            </text>
          </g>
        ))}

        {/* Month labels */}
        {MONTHS.map((m, i) => (
          <text key={m} x={getX(i)} y={H - 6} textAnchor="middle"
            fill="rgba(255,255,255,0.22)" fontSize="9.5" fontFamily="system-ui, sans-serif">
            {m}
          </text>
        ))}

        {/* Lines */}
        {DATASETS.map(d => {
          const { line, area, tip } = buildPaths(d.data);
          if (!line) return null;
          return (
            <g key={d.label}>
              <path d={area} fill={`url(#cg-${d.label.replace(/\s/g, "")})`} />
              <path d={line} fill="none" stroke={d.color} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 5px ${d.color}55)` }} />
              {tip && progress > 0.05 && (
                <>
                  <circle cx={tip[0]} cy={tip[1]} r="5" fill={d.color}
                    style={{ filter: `drop-shadow(0 0 8px ${d.color})` }} />
                  <circle cx={tip[0]} cy={tip[1]} r="9" fill="none" stroke={d.color} strokeWidth="1" strokeOpacity="0.4" />
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
