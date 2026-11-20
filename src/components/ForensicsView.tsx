import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  AudioLines,
  CheckCircle2,
  Cpu,
  FileCheck2,
  Fingerprint,
  Gavel,
  Image as ImageIcon,
  Mic,
  Play,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  AudioDetectResult,
  DetectResult,
  NavTab,
  SharedMediaContext,
  WatermarkResult,
} from '../types/truthlens';
import type { TruthLensClient } from '../lib/api';
import { createDemoImageFile, NANO_BANANA_PRESETS } from '../lib/forensics';

interface ForensicsViewProps {
  client: TruthLensClient;
  sharedMedia: SharedMediaContext;
  onUpdateSharedMedia: (ctx: SharedMediaContext) => void;
  onNavigate: (tab: NavTab) => void;
  autoPresetId?: string | null;
  onConsumedPreset?: () => void;
}

export const ForensicsView: React.FC<ForensicsViewProps> = ({
  client,
  sharedMedia,
  onUpdateSharedMedia,
  onNavigate,
  autoPresetId,
  onConsumedPreset,
}) => {
  const [subMode, setSubMode] = useState<'image' | 'audio'>('image');
  const [loading, setLoading] = useState(false);
  const [detectResult, setDetectResult] = useState<DetectResult | null>(null);
  const [watermarkResult, setWatermarkResult] = useState<WatermarkResult | null>(null);
  const [elaSplit, setElaSplit] = useState(50);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  // Audio state
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioResult, setAudioResult] = useState<AudioDetectResult | null>(null);
  const [audioLabel, setAudioLabel] = useState<string>('');
  const [isPlayingTone, setIsPlayingTone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const analyzeImageFile = async (file: File) => {
    setLoading(true);
    const previewUrl = URL.createObjectURL(file);
    try {
      const [det, wm] = await Promise.all([
        client.detectImage(file),
        client.detectWatermark(file),
      ]);
      setDetectResult(det);
      setWatermarkResult(wm);
      onUpdateSharedMedia({
        file,
        previewUrl,
        filename: file.name,
        dhash: det.dhash,
        sha256: det.sha256,
        verdict: det.verdict,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPreset = async (presetId: string) => {
    setSubMode('image');
    const file = await createDemoImageFile(presetId);
    await analyzeImageFile(file);
  };

  // Deck slide 4: "DETECT: Upload image/link"
  const analyzeLink = async () => {
    const url = linkInput.trim();
    setLinkError(null);
    if (!/^https?:\/\//i.test(url)) {
      setLinkError('Enter a full http(s) image URL.');
      return;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) {
        setLinkError('That link is not a direct image. Paste a direct image URL (ending in .jpg/.png/.webp).');
        return;
      }
      const name = url.split('/').pop()?.split('?')[0] || 'linked_image';
      await analyzeImageFile(new File([blob], name, { type: blob.type }));
    } catch {
      setLinkError(
        'The site blocked direct download (CORS). Save the image and upload it instead, or use Live mode once the backend adds POST /api/detect/url.'
      );
    }
  };

  useEffect(() => {
    if (autoPresetId) {
      handleLoadPreset(autoPresetId);
      onConsumedPreset?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPresetId]);

  const handleAudioFile = async (file: File) => {
    setAudioLoading(true);
    setAudioLabel(file.name);
    try {
      const res = await client.detectAudio(file);
      setAudioResult(res);
    } finally {
      setAudioLoading(false);
    }
  };

  const playDemoSynthAudio = (mode: 'clone' | 'human') => {
    try {
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = mode === 'clone' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(mode === 'clone' ? 195 : 155, now);
      osc.frequency.exponentialRampToValueAtTime(mode === 'clone' ? 210 : 190, now + 0.6);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      setIsPlayingTone(true);
      osc.start(now);
      osc.stop(now + 0.7);
      osc.onended = () => {
        setIsPlayingTone(false);
        ctx.close();
      };
    } catch {
      setIsPlayingTone(false);
    }
  };

  const runAudioPreset = async (mode: 'clone' | 'human') => {
    setAudioLoading(true);
    setAudioLabel(
      mode === 'clone'
        ? 'wire_transfer_cfo_voice_clone.opus (Synthetic Demo)'
        : 'authentic_whatsapp_voice_note.wav (Human Demo)'
    );
    playDemoSynthAudio(mode);
    try {
      const res = await client.detectAudio(null, mode);
      setAudioResult(res);
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Sub-mode Switch */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#10D4A2]">
            <Cpu className="h-4 w-4" />
            L0 • Multimodal Edge Forensics (Zero Cloud Costs)
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-white">
            ELA Heatmap, SynthID/C2PA &amp; 11.2 kHz Voice Forensics
          </h2>
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-[#0b1229] p-1">
          <button
            onClick={() => setSubMode('image')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
              subMode === 'image'
                ? 'bg-[#10D4A2] text-[#050919]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            Image &amp; Provenance
          </button>
          <button
            onClick={() => setSubMode('audio')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
              subMode === 'audio'
                ? 'bg-[#10D4A2] text-[#050919]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <AudioLines className="h-4 w-4" />
            Voice Note FFT
          </button>
        </div>
      </div>

      {subMode === 'image' ? (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Upload & Nano Banana Safe Demo Presets */}
          <div className="space-y-4 lg:col-span-5">
            {/* Funding Pitch Walkthrough Banner */}
            <div className="rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-[#070e28] to-[#040816] p-3 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Pitch Demo: 1-Click Upload
                </span>
                <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-mono text-sky-300">
                  Ready for VCs
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                During live screen shares, drag any image, paste a link, or click a 1-click preset below to show instant ELA heatmaps &amp; C2PA credentials.
              </p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) analyzeImageFile(file);
              }}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-[#0b1229]/80 p-6 text-center transition hover:border-[#10D4A2]/60 hover:bg-[#111b3a]/70"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) analyzeImageFile(file);
                }}
              />
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#10D4A2]/10 text-[#10D4A2] group-hover:scale-105 transition">
                <Upload className="h-6 w-6" />
              </div>
              <div className="mt-3 font-display text-base font-semibold text-white">
                Drop Image or Click to Scan
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Runs <code className="text-[#10D4A2]">POST /api/detect</code> +{' '}
                <code className="text-[#10D4A2]">POST /api/detect/watermark</code>
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10D4A2]" />
                Gemma On-Device Edge Mode — Photo stays private
              </div>
            </div>

            {/* Analyze by link */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4 space-y-2">
              <label htmlFor="tl-link" className="text-xs font-bold uppercase tracking-wider text-sky-300">
                Or paste an image link
              </label>
              <div className="flex gap-2">
                <input
                  id="tl-link"
                  type="url"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && analyzeLink()}
                  placeholder="https://example.com/viral-forward.jpg"
                  className="flex-1 rounded-xl border border-white/10 bg-[#050919] px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={analyzeLink}
                  disabled={loading || !linkInput.trim()}
                  className="rounded-xl bg-sky-500/20 px-3 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-500/30 cursor-pointer disabled:opacity-50"
                >
                  Scan Link
                </button>
              </div>
              {linkError && <p className="text-[11px] text-amber-300">{linkError}</p>}
            </div>

            {/* Nano Banana Safe Demo Generator */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Nano Banana — 1-Click Safe Demo Fakes
                </div>
                <span className="text-[11px] text-slate-400">Zero PII</span>
              </div>
              <div className="mt-3 grid gap-2">
                {NANO_BANANA_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset.id)}
                    disabled={loading}
                    className="flex items-center justify-between rounded-xl border border-white/8 bg-[#050919]/70 px-3.5 py-2.5 text-left transition hover:border-[#10D4A2]/45 hover:bg-white/[0.04] cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{preset.label}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                            preset.expectedVerdict === 'REAL'
                              ? 'bg-[#10D4A2]/15 text-[#10D4A2]'
                              : 'bg-rose-500/15 text-rose-300'
                          }`}
                        >
                          {preset.badge}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400">{preset.description}</p>
                    </div>
                    <ScanSearch className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live ELA Split Viewer & Results */}
          <div className="space-y-4 lg:col-span-7">
            {loading ? (
              <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b1229]/90">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#10D4A2] border-t-transparent" />
                <div className="mt-4 font-display text-base font-semibold text-white">
                  Running ELA Quantization Heatmap + 64-bit dHash + SynthID...
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Edge Forensics Pipeline (&lt;2 sec)
                </p>
              </div>
            ) : detectResult && sharedMedia.previewUrl ? (
              <>
                {/* Verdict Card */}
                <div
                  className={`rounded-2xl border p-5 ${
                    detectResult.verdict === 'REAL'
                      ? 'border-[#10D4A2]/40 bg-[#10D4A2]/[0.07]'
                      : 'border-rose-500/40 bg-rose-500/[0.08]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {detectResult.verdict === 'REAL' ? (
                        <CheckCircle2 className="h-8 w-8 text-[#10D4A2]" />
                      ) : (
                        <ShieldAlert className="h-8 w-8 text-rose-400" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xl font-bold text-white">
                            {detectResult.verdict.replace('_', ' ')}
                          </span>
                          <span className="rounded-full bg-black/40 px-2.5 py-0.5 font-mono text-xs text-slate-200 tabular-nums">
                            {detectResult.confidence}% confidence
                          </span>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                            {detectResult.source === 'live' ? 'LIVE SERVER' : 'EDGE ENGINE'} •{' '}
                            {detectResult.processing_ms}ms
                          </span>
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-slate-300">
                          dHash: <span className="text-[#10D4A2]">{detectResult.dhash}</span> • ELA
                          Mean Error: <span className="tabular-nums">{detectResult.ela_mean_error}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400">
                        Manipulation Risk
                      </div>
                      <div
                        className={`font-display text-3xl font-bold tabular-nums ${
                          detectResult.manipulation_score >= 50
                            ? 'text-rose-400'
                            : 'text-[#10D4A2]'
                        }`}
                      >
                        {detectResult.manipulation_score}/100
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive ELA Heatmap Split Comparison */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <SlidersHorizontal className="h-4 w-4 text-[#10D4A2]" />
                      Interactive Error Level Analysis (ELA) Split Inspector
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      Drag slider: Original ↔ Thermal Quantization Diff
                    </span>
                  </div>

                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-[#050919]">
                    <img
                      src={sharedMedia.previewUrl}
                      alt="Original submitted media"
                      className="h-full w-full object-contain"
                    />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - elaSplit}% 0 0)` }}
                    >
                      <img
                        src={detectResult.ela_heatmap_url}
                        alt="ELA forensic heatmap"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute inset-y-0 w-0.5 bg-[#10D4A2] shadow-[0_0_12px_#10D4A2]"
                      style={{ left: `${elaSplit}%` }}
                    />
                    <span className="pointer-events-none absolute left-3 top-3 rounded bg-black/70 px-2 py-0.5 font-mono text-[10px] font-bold text-[#10D4A2]">
                      ELA HEATMAP
                    </span>
                    <span className="pointer-events-none absolute right-3 top-3 rounded bg-black/70 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-200">
                      ORIGINAL
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={elaSplit}
                    onChange={(e) => setElaSplit(Number(e.target.value))}
                    aria-label="ELA comparison split percentage"
                    className="mt-3 w-full accent-[#10D4A2] cursor-pointer"
                  />
                </div>

                {/* Watermark / Provenance + Gemini Findings */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {watermarkResult && (
                    <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4 space-y-2.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                        Provenance &amp; Watermark (/detect/watermark)
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between rounded-lg bg-[#050919]/80 px-3 py-2">
                          <span className="text-slate-300">Google SynthID</span>
                          <span
                            className={`font-mono font-bold ${
                              watermarkResult.synthid_detected
                                ? 'text-rose-400'
                                : 'text-[#10D4A2]'
                            }`}
                          >
                            {watermarkResult.synthid_detected
                              ? `DETECTED (${Math.round(watermarkResult.synthid_confidence * 100)}%)`
                              : 'NONE'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-[#050919]/80 px-3 py-2">
                          <span className="text-slate-300">C2PA Manifest</span>
                          <span
                            className={`font-mono font-bold ${
                              watermarkResult.c2pa_present ? 'text-[#10D4A2]' : 'text-amber-300'
                            }`}
                          >
                            {watermarkResult.c2pa_present ? 'VERIFIED' : 'ABSENT / STRIPPED'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-[#050919]/80 px-3 py-2">
                          <span className="text-slate-300">IPTC AI Marker</span>
                          <span
                            className={`font-mono font-bold ${
                              watermarkResult.iptc_ai_flag ? 'text-rose-400' : 'text-slate-300'
                            }`}
                          >
                            {watermarkResult.iptc_ai_flag ? 'AI TAGGED' : 'CLEAR'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        {watermarkResult.provenance_summary}
                      </p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4 space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#10D4A2]">
                      Gemini Multimodal Forensic Notes
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {detectResult.gemini_notes.map((note, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10D4A2]" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {detectResult.ela_peak_zones.map((z) => (
                        <span
                          key={z}
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300"
                        >
                          {z}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Handoff Bar */}
                <div className="flex flex-wrap gap-2.5 rounded-xl border border-white/10 bg-[#0b1229]/80 p-3">
                  <button
                    onClick={() => onNavigate('vault')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#10D4A2]/15 px-3 py-2 text-xs font-semibold text-[#10D4A2] hover:bg-[#10D4A2]/25 cursor-pointer"
                  >
                    <Fingerprint className="h-3.5 w-3.5" />
                    Register / Verify in Origin Vault (L1)
                  </button>
                  <button
                    onClick={() => onNavigate('dampen')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 cursor-pointer"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Test WhatsApp Cooling Friction (L2)
                  </button>
                  <button
                    onClick={() => onNavigate('heal')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/25 cursor-pointer"
                  >
                    <Gavel className="h-3.5 w-3.5" />
                    Generate Debunk Sticker &amp; BSA 63 Dossier (L3)
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b1229]/60 p-8 text-center">
                <ScanSearch className="h-12 w-12 text-slate-600" />
                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  Ready for Multimodal Edge Forensics
                </h3>
                <p className="mt-1 max-w-md text-xs text-slate-400">
                  Upload any photo or pick a Nano Banana Safe Demo preset on the left to inspect
                  real-time ELA quantization heatmaps, 64-bit dHash, SynthID, and C2PA provenance.
                </p>
                <button
                  onClick={() => handleLoadPreset('kyc-faceswap')}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#10D4A2] px-4 py-2 text-sm font-semibold text-[#050919] hover:bg-[#00e8ac] cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Run Instant KYC Face-Swap Demo
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VOICE NOTE FFT FORENSICS */
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            <div
              onClick={() => audioInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-[#0b1229]/80 p-6 text-center transition hover:border-[#10D4A2]/60"
            >
              <input
                ref={audioInputRef}
                type="file"
                accept=".opus,.wav,.mp3,audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAudioFile(file);
                }}
              />
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400">
                <Mic className="h-6 w-6" />
              </div>
              <div className="mt-3 font-display text-base font-semibold text-white">
                Upload Voice Note (.opus / .wav / .mp3)
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Calls <code className="text-[#10D4A2]">POST /api/detect/audio</code> — SciPy FFT
                11.2 kHz vocoder shelf + glottal pulse kurtosis
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#10D4A2]">
                1-Click Voice Clone Benchmark
              </div>
              <button
                onClick={() => runAudioPreset('clone')}
                disabled={audioLoading}
                className="flex w-full items-center justify-between rounded-xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-left hover:bg-rose-500/20 cursor-pointer"
              >
                <div>
                  <div className="text-sm font-semibold text-white">
                    CFO Wire-Transfer Voice Clone
                  </div>
                  <div className="text-[11px] text-rose-200/80">
                    Triggers 11.2 kHz neural vocoder shelf cutoff
                  </div>
                </div>
                <Play className="h-4 w-4 text-rose-300" />
              </button>

              <button
                onClick={() => runAudioPreset('human')}
                disabled={audioLoading}
                className="flex w-full items-center justify-between rounded-xl border border-[#10D4A2]/25 bg-[#10D4A2]/10 p-3.5 text-left hover:bg-[#10D4A2]/20 cursor-pointer"
              >
                <div>
                  <div className="text-sm font-semibold text-white">
                    Authentic Human Voice Note
                  </div>
                  <div className="text-[11px] text-[#10D4A2]/90">
                    Natural fricatives past 14 kHz + healthy kurtosis
                  </div>
                </div>
                <Play className="h-4 w-4 text-[#10D4A2]" />
              </button>
              {isPlayingTone && (
                <div className="text-[11px] font-mono text-sky-300">
                  Playing WebAudio sample tone...
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 lg:col-span-8">
            {audioResult ? (
              <>
                <div
                  className={`rounded-2xl border p-5 ${
                    audioResult.verdict === 'HUMAN_VOICE'
                      ? 'border-[#10D4A2]/40 bg-[#10D4A2]/[0.07]'
                      : 'border-rose-500/40 bg-rose-500/[0.08]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-mono text-xs text-slate-400">{audioLabel}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-display text-2xl font-bold text-white">
                          {audioResult.verdict.replace('_', ' ')}
                        </span>
                        <span className="rounded-full bg-black/40 px-2.5 py-0.5 font-mono text-xs text-white tabular-nums">
                          {audioResult.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-lg bg-[#050919]/80 px-3 py-2">
                        <div className="text-[10px] text-slate-400">Vocoder Shelf</div>
                        <div
                          className={`font-mono text-sm font-bold tabular-nums ${
                            audioResult.cutoff_detected ? 'text-rose-400' : 'text-[#10D4A2]'
                          }`}
                        >
                          {audioResult.vocoder_shelf_khz} kHz
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#050919]/80 px-3 py-2">
                        <div className="text-[10px] text-slate-400">Glottal Kurtosis</div>
                        <div className="font-mono text-sm font-bold text-white tabular-nums">
                          {audioResult.glottal_kurtosis}
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#050919]/80 px-3 py-2">
                        <div className="text-[10px] text-slate-400">Crest Factor</div>
                        <div className="font-mono text-sm font-bold text-sky-300 tabular-nums">
                          {audioResult.crest_factor_db} dB
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-200">
                    {audioResult.explanation}
                  </p>
                </div>

                {/* FFT Spectrum Chart highlighting 11.2 kHz Vocoder Shelf */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      SciPy FFT Spectral Envelope (0–16 kHz)
                    </div>
                    <span className="font-mono text-[11px] text-rose-300">
                      Red Marker: 11.2 kHz Neural Vocoder Shelf
                    </span>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={audioResult.spectrum_bins}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          dataKey="freqKhz"
                          stroke="#94a3b8"
                          fontSize={11}
                          tickFormatter={(v) => `${v}k`}
                        />
                        <YAxis
                          domain={[-96, 0]}
                          stroke="#94a3b8"
                          fontSize={11}
                          tickFormatter={(v) => `${v}dB`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#050919',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '10px',
                            fontSize: '12px',
                          }}
                        />
                        <ReferenceLine
                          x={11.0}
                          stroke="#f43f5e"
                          strokeDasharray="4 4"
                          label={{
                            value: '11.2 kHz Shelf',
                            fill: '#fb7185',
                            fontSize: 11,
                            position: 'insideTopRight',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="magnitudeDb"
                          stroke={audioResult.cutoff_detected ? '#f43f5e' : '#10d4a2'}
                          fill={
                            audioResult.cutoff_detected
                              ? 'rgba(244,63,94,0.22)'
                              : 'rgba(16,212,162,0.22)'
                          }
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Amplitude Waveform Bar Strip */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">
                      Waveform Amplitude Array ({audioResult.waveform.length} frames)
                    </span>
                    <span className="font-mono text-slate-400">
                      Skewness: {audioResult.glottal_skewness}
                    </span>
                  </div>
                  <div className="flex h-16 items-end gap-1">
                    {audioResult.waveform.map((amp, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${
                          audioResult.cutoff_detected ? 'bg-rose-400/80' : 'bg-[#10D4A2]/80'
                        }`}
                        style={{ height: `${Math.max(10, Math.round(amp * 100))}%` }}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[340px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b1229]/60 p-8 text-center">
                <AudioLines className="h-12 w-12 text-slate-600" />
                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  Detect AI Voice Clones on WhatsApp &amp; Bank Calls
                </h3>
                <p className="mt-1 max-w-md text-xs text-slate-400">
                  Test the 11.2 kHz vocoder shelf cutoff, glottal pulse kurtosis/skewness, and crest
                  factor pipeline used to stop Fintech wire scams and executive BEC 2.0 voice calls.
                </p>
                <button
                  onClick={() => runAudioPreset('clone')}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 cursor-pointer"
                >
                  <FileCheck2 className="h-4 w-4" />
                  Analyze Synthetic CFO Voice Clone Demo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
