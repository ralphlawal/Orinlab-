"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Upload, Loader2, Music2, Wand2, CheckCircle2, X } from "lucide-react";

type ConvertStatus = "idle" | "loading" | "converting" | "done" | "error";

const INPUT_FORMATS = ["mp3", "wav", "flac", "aac", "ogg", "m4a", "opus", "wma"];
const OUTPUT_FORMATS = [
  { ext: "mp3",  label: "MP3",  desc: "Best for streaming & sharing" },
  { ext: "wav",  label: "WAV",  desc: "Lossless, for DAWs & mastering" },
  { ext: "flac", label: "FLAC", desc: "Lossless compressed" },
  { ext: "aac",  label: "AAC",  desc: "High quality, small file" },
  { ext: "ogg",  label: "OGG",  desc: "Open format, web-friendly" },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ToolsPage() {
  const [status, setStatus]       = useState<ConvertStatus>("idle");
  const [progress, setProgress]   = useState(0);
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [outputFmt, setOutputFmt] = useState("mp3");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [outputSize, setOutputSize] = useState(0);
  const [errMsg, setErrMsg]       = useState("");
  const [mp3Quality, setMp3Quality] = useState("4"); // 0=best, 9=worst
  const [sampleRate, setSampleRate] = useState("44100");
  const ffRef = useRef<import("@ffmpeg/ffmpeg").FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) pickFile(file);
  }

  function pickFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!INPUT_FORMATS.includes(ext)) {
      setErrMsg(`Unsupported format: .${ext}. Accepted: ${INPUT_FORMATS.join(", ")}`);
      return;
    }
    setInputFile(file);
    setOutputUrl(null);
    setErrMsg("");
    setStatus("idle");
  }

  async function convert() {
    if (!inputFile) return;
    setStatus("loading");
    setProgress(0);
    setErrMsg("");

    try {
      if (!ffRef.current) {
        const { FFmpeg } = await import("@ffmpeg/ffmpeg");
        const { toBlobURL } = await import("@ffmpeg/util");
        const ff = new FFmpeg();
        ff.on("progress", ({ progress: p }) => setProgress(Math.round(p * 100)));
        const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
        await ff.load({
          coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
        });
        ffRef.current = ff;
      }

      setStatus("converting");
      const ff = ffRef.current;
      const { fetchFile } = await import("@ffmpeg/util");

      const inputName = "input." + (inputFile.name.split(".").pop()?.toLowerCase() ?? "mp3");
      const outputName = inputFile.name.replace(/\.[^.]+$/, "") + "." + outputFmt;

      await ff.writeFile(inputName, await fetchFile(inputFile));

      const args: string[] = ["-i", inputName];

      if (outputFmt === "mp3") {
        args.push("-codec:a", "libmp3lame", "-q:a", mp3Quality, "-ar", sampleRate);
      } else if (outputFmt === "wav") {
        args.push("-ar", sampleRate, "-sample_fmt", "s16");
      } else if (outputFmt === "flac") {
        args.push("-codec:a", "flac", "-ar", sampleRate);
      } else if (outputFmt === "aac") {
        args.push("-codec:a", "aac", "-b:a", "192k", "-ar", sampleRate);
      } else if (outputFmt === "ogg") {
        args.push("-codec:a", "libvorbis", "-q:a", "6", "-ar", sampleRate);
      }

      args.push(outputName);
      await ff.exec(args);

      const data = await ff.readFile(outputName);
      // Copy to a fresh Uint8Array to avoid SharedArrayBuffer type issues
      const bytes = data instanceof Uint8Array ? new Uint8Array(data) : new TextEncoder().encode(String(data));
      const blob = new Blob([bytes], { type: `audio/${outputFmt}` });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      setOutputName(outputName);
      setOutputSize(blob.size);

      // Clean up ffmpeg FS
      await ff.deleteFile(inputName).catch(() => {});
      await ff.deleteFile(outputName).catch(() => {});

      setStatus("done");
    } catch (e) {
      console.error(e);
      setErrMsg("Conversion failed. Please try a different file or format.");
      setStatus("error");
    }
  }

  const inputExt = inputFile?.name.split(".").pop()?.toLowerCase() ?? "";

  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#007bff]/10 flex items-center justify-center">
            <Wand2 size={18} className="text-[#007bff]" />
          </div>
          <h1 className="text-white font-bold text-2xl">Audio Tools</h1>
        </div>
        <p className="text-white/40 text-sm">Professional-grade audio processing — runs entirely in your browser. No uploads to external servers.</p>
      </div>

      {/* Audio Converter */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <Music2 size={16} className="text-[#007bff]" />
          <h2 className="text-white font-semibold">Audio Format Converter</h2>
          <span className="ml-auto text-[10px] text-white/25 uppercase tracking-widest">Free</span>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-5 ${
            inputFile ? "border-[#007bff]/40 bg-[#007bff]/[0.04]" : "border-white/[0.08] hover:border-white/[0.20] bg-white/[0.02]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={INPUT_FORMATS.map(f => `.${f}`).join(",")}
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) pickFile(e.target.files[0]); }}
          />
          {inputFile ? (
            <div className="flex items-center justify-center gap-3">
              <Music2 size={20} className="text-[#007bff]" />
              <div className="text-left">
                <p className="text-white font-medium text-sm truncate max-w-[260px]">{inputFile.name}</p>
                <p className="text-white/40 text-xs">{formatBytes(inputFile.size)} · .{inputExt.toUpperCase()}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setInputFile(null); setOutputUrl(null); setStatus("idle"); }}
                className="ml-2 text-white/30 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              <Upload size={28} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm font-medium mb-1">Drop audio file here or click to browse</p>
              <p className="text-white/25 text-xs">{INPUT_FORMATS.map(f => f.toUpperCase()).join(" · ")}</p>
            </div>
          )}
        </div>

        {/* Output format */}
        <div className="mb-5">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Output Format</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {OUTPUT_FORMATS.map((f) => (
              <button
                key={f.ext}
                onClick={() => setOutputFmt(f.ext)}
                disabled={inputExt === f.ext}
                className={`p-3 rounded-xl border text-left transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  outputFmt === f.ext
                    ? "border-[#007bff]/60 bg-[#007bff]/10"
                    : "border-white/[0.08] hover:border-white/[0.20] bg-white/[0.02]"
                }`}
              >
                <p className={`text-sm font-bold mb-0.5 ${outputFmt === f.ext ? "text-[#007bff]" : "text-white"}`}>{f.label}</p>
                <p className="text-white/30 text-[10px] leading-tight">{f.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced options */}
        <details className="mb-5">
          <summary className="text-white/30 text-xs cursor-pointer hover:text-white/60 transition-colors select-none">Advanced options</summary>
          <div className="mt-3 grid grid-cols-2 gap-4">
            {outputFmt === "mp3" && (
              <div>
                <label className="text-white/40 text-xs block mb-1.5">MP3 Quality</label>
                <select value={mp3Quality} onChange={(e) => setMp3Quality(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs px-3 py-2 rounded-lg outline-none">
                  <option value="0">0 — Best (~245 kbps)</option>
                  <option value="2">2 — High (~190 kbps)</option>
                  <option value="4">4 — Standard (~165 kbps)</option>
                  <option value="6">6 — Economy (~130 kbps)</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-white/40 text-xs block mb-1.5">Sample Rate</label>
              <select value={sampleRate} onChange={(e) => setSampleRate(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white/70 text-xs px-3 py-2 rounded-lg outline-none">
                <option value="44100">44,100 Hz (CD quality)</option>
                <option value="48000">48,000 Hz (Studio)</option>
                <option value="22050">22,050 Hz (Radio)</option>
              </select>
            </div>
          </div>
        </details>

        {/* Error */}
        {errMsg && (
          <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5 mb-4">{errMsg}</p>
        )}

        {/* Progress */}
        {(status === "loading" || status === "converting") && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs text-white/40 mb-2">
              <span>{status === "loading" ? "Loading audio engine…" : "Converting…"}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-[#007bff] rounded-full transition-all duration-300" style={{ width: `${status === "loading" ? 15 : progress}%` }} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={convert}
            disabled={!inputFile || status === "loading" || status === "converting"}
            className="flex items-center gap-2 bg-[#007bff] hover:bg-[#0069d9] disabled:opacity-40 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            {(status === "loading" || status === "converting") ? (
              <><Loader2 size={14} className="animate-spin" /> Converting…</>
            ) : (
              <><Wand2 size={14} /> Convert</>
            )}
          </button>

          {status === "done" && outputUrl && (
            <a
              href={outputUrl}
              download={outputName}
              className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <Download size={14} />
              Download {outputName} · {formatBytes(outputSize)}
            </a>
          )}
        </div>

        {status === "done" && (
          <p className="text-green-400/60 text-xs mt-3 flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Converted successfully
          </p>
        )}
      </div>

      {/* Coming soon tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: "🎵", title: "BPM & Key Detector",  desc: "Detect the tempo and musical key of any track.",        tag: "Coming soon" },
          { icon: "🎚️", title: "Audio Waveform",       desc: "Visualise your track as a waveform image.",             tag: "Coming soon" },
          { icon: "🏷️", title: "Metadata Tagger",      desc: "Edit ID3 tags — title, artist, album, artwork.",        tag: "Coming soon" },
          { icon: "🔊", title: "Loudness Normalizer",  desc: "Match LUFS levels for streaming platform standards.",   tag: "Coming soon" },
        ].map((t) => (
          <div key={t.title} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 opacity-50">
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-2xl">{t.icon}</span>
              <span className="text-[10px] text-white/30 border border-white/[0.08] rounded-full px-2 py-0.5">{t.tag}</span>
            </div>
            <p className="text-white font-medium text-sm mb-1">{t.title}</p>
            <p className="text-white/35 text-xs">{t.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
