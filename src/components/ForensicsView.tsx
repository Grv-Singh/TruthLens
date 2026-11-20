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
import {
  createDemoImageFile,
  runLocalEdgeDetect,
  runLocalWatermarkCheck,
} from '../lib/forensics';

export interface ImageBatchItem {
  id: string;
  file: File;
  previewUrl: string;
  filename: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  detectResult?: DetectResult;
  watermarkResult?: WatermarkResult;
  error?: string;
}

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
  const [elaSplit, setElaSplit] = useState(50);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  // Multi-image queue state
  const [imageQueue, setImageQueue] = useState<ImageBatchItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Audio state
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioResult, setAudioResult] = useState<AudioDetectResult | null>(null);
  const [audioLabel, setAudioLabel] = useState<string>('');
  const [isPlayingTone, setIsPlayingTone] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Active item in queue
  const activeItem = imageQueue.find((item) => item.id === activeItemId) || imageQueue[0] || null;

  // Process a single item
  const analyzeSingleItem = async (item: ImageBatchItem): Promise<ImageBatchItem> => {
    try {
      const [det, wm] = await Promise.all([
        client.detectImage(item.file),
        client.detectWatermark(item.file),
      ]);
      return {
        ...item,
        status: 'done',
        detectResult: det,
        watermarkResult: wm,
      };
    } catch (err) {
      console.warn('Live API analysis failed, using local edge fallback:', err);
      try {
        const localDet = await runLocalEdgeDetect(item.file);
        const localWm = await runLocalWatermarkCheck(item.file);
        return {
          ...item,
          status: 'done',
          detectResult: localDet,
          watermarkResult: localWm,
        };
      } catch (e: any) {
        return {
          ...item,
          status: 'error',
          error: e?.message || 'Forensic analysis failed',
        };
      }
    }
  };

  // Add multiple files into the queue and start processing
  const handleAddFiles = (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileList.length === 0) return;

    const newItems: ImageBatchItem[] = fileList.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      filename: file.name,
      status: 'pending',
    }));

    setImageQueue((prev) => {
      const updated = [...prev, ...newItems];
      if (!activeItemId && updated.length > 0) {
        setActiveItemId(updated[0].id);
      }
      return updated;
    });

    if (!activeItemId && newItems.length > 0) {
      setActiveItemId(newItems[0].id);
    }

    // Process new items asynchronously
    newItems.forEach((item) => {
      setImageQueue((curr) =>
        curr.map((i) => (i.id === item.id ? { ...i, status: 'processing' } : i))
      );
      analyzeSingleItem(item).then((completed) => {
        setImageQueue((curr) =>
          curr.map((i) => (i.id === completed.id ? completed : i))
        );
        // If this completed item is the active item, sync with parent
        if (completed.status === 'done' && completed.detectResult) {
          onUpdateSharedMedia({
            file: completed.file,
            previewUrl: completed.previewUrl,
            filename: completed.filename,
            dhash: completed.detectResult.dhash,
            sha256: completed.detectResult.sha256,
            verdict: completed.detectResult.verdict,
          });
        }
      });
    });
  };

  // Switch active item and update sharedMedia context
  const selectActiveItem = (id: string) => {
    setActiveItemId(id);
    const target = imageQueue.find((i) => i.id === id);
    if (target && target.detectResult) {
      onUpdateSharedMedia({
        file: target.file,
        previewUrl: target.previewUrl,
        filename: target.filename,
        dhash: target.detectResult.dhash,
        sha256: target.detectResult.sha256,
        verdict: target.detectResult.verdict,
      });
    }
  };

  // Clear all items and reset to upload stage
  const handleClearQueue = () => {
    imageQueue.forEach((item) => {
      try {
        URL.revokeObjectURL(item.previewUrl);
      } catch {}
    });
    setImageQueue([]);
    setActiveItemId(null);
  };

  // Analyze URL Link
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
      const name = url.split('/').pop()?.split('?')[0] || 'linked_image.jpg';
      const file = new File([blob], name, { type: blob.type });
      handleAddFiles([file]);
      setLinkInput('');
    } catch {
      setLinkError('The site blocked direct download (CORS). Download the image and drop it instead.');
    }
  };

  // Preset loading handler
  const handleLoadPreset = async (presetId: string) => {
    setSubMode('image');
    const file = await createDemoImageFile(presetId);
    handleAddFiles([file]);
  };

  useEffect(() => {
    if (autoPresetId) {
      handleLoadPreset(autoPresetId);
      onConsumedPreset?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPresetId]);

  // Handle external shared media (Web Share Target / WhatsApp)
  useEffect(() => {
    if (sharedMedia.file && imageQueue.length === 0) {
      handleAddFiles([sharedMedia.file]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedMedia.file]);

  // Audio Handlers
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
      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleAddFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Header + Sub-mode Switch */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#10D4A2]">
            <ShieldCheck className="h-4 w-4" />
            Instant Deepfake &amp; AI Scanner
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-white">
            Check Photos &amp; Voice Notes for AI or Editing
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
            Photos
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
            Voice Notes
          </button>
        </div>
      </div>

      {subMode === 'image' ? (
        imageQueue.length === 0 ? (
          /* ======================================================== */
          /* STAGE 1: UPLOAD CARDS (SHOWN ONLY WHEN QUEUE IS EMPTY)   */
          /* ======================================================== */
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Manual Drop Card */}
            <div className="space-y-4 lg:col-span-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files) handleAddFiles(e.dataTransfer.files);
                }}
                className="group cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-[#0b1229]/80 p-8 text-center transition hover:border-[#10D4A2]/60 hover:bg-[#111b3a]/70 h-full flex flex-col items-center justify-center min-h-[280px]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10D4A2]/10 text-[#10D4A2] group-hover:scale-105 transition shadow-[0_0_20px_rgba(16,212,162,0.15)]">
                  <Upload className="h-7 w-7" />
                </div>
                <div className="mt-4 font-display text-lg font-bold text-white">
                  Drop Images or Click to Scan
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Select one or multiple images simultaneously.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#10D4A2]" />
                  Photos stay 100% private
                </div>
              </div>
            </div>

            {/* Link Input Card */}
            <div className="space-y-4 lg:col-span-6">
              <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-8 flex flex-col justify-between h-full min-h-[280px]">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                    <span className="material-symbols-rounded notranslate text-base align-middle" translate="no">link</span>
                    Analyze Web Image via Direct Link
                  </div>
                  <p className="mt-2 text-xs text-slate-300">
                    Paste an image URL from social media or news to run real-time ELA quantization and AI watermark detection.
                  </p>
                  <div className="mt-5 flex gap-2">
                    <input
                      id="tl-link"
                      type="url"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && analyzeLink()}
                      placeholder="https://example.com/viral-forward.jpg"
                      className="flex-1 rounded-xl border border-white/10 bg-[#050919] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#10D4A2]"
                    />
                    <button
                      onClick={analyzeLink}
                      disabled={!linkInput.trim()}
                      className="rounded-xl bg-sky-500/20 px-4 py-2.5 text-xs font-semibold text-sky-200 hover:bg-sky-500/30 cursor-pointer disabled:opacity-40 transition whitespace-nowrap"
                    >
                      Scan Link
                    </button>
                  </div>
                  {linkError && <p className="mt-2 text-[11px] text-amber-300">{linkError}</p>}
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-slate-400">
                  Tip: Direct WhatsApp / Android share sheet sends photos straight into the scanner without copying links.
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* STAGE 2: FORENSICS CARD TAKES OVER (UPLOAD CARDS HIDDEN) */
          /* ======================================================== */
          <div className="space-y-5">
            {/* Top Toolbar: Multi-image selector + Actions */}
            <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#10D4A2]/15 text-[#10D4A2] font-mono text-xs font-bold">
                    {imageQueue.length}
                  </span>
                  <span className="font-display text-sm font-bold text-white">
                    {imageQueue.length === 1 ? '1 Image Queued' : `${imageQueue.length} Images in Batch Session`}
                  </span>
                  {activeItem && (
                    <span className="hidden sm:inline font-mono text-xs text-slate-400">
                      • Active: <span className="text-slate-200">{activeItem.filename}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    <span className="material-symbols-rounded notranslate text-sm align-middle" translate="no">add_photo_alternate</span>
                    <span>Add More</span>
                  </button>
                  <button
                    onClick={handleClearQueue}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    <span className="material-symbols-rounded notranslate text-sm align-middle" translate="no">restart_alt</span>
                    <span>New Scan</span>
                  </button>
                </div>
              </div>

              {/* Horizontal Thumbnail Strip */}
              <div className="flex gap-3 overflow-x-auto pt-3 pb-1 scrollbar-thin">
                {imageQueue.map((item) => {
                  const isActive = item.id === (activeItem?.id);
                  const isProcessing = item.status === 'processing' || item.status === 'pending';
                  const isDone = item.status === 'done';
                  const verdict = item.detectResult?.verdict || 'PENDING';

                  return (
                    <div
                      key={item.id}
                      onClick={() => selectActiveItem(item.id)}
                      className={`group relative h-20 w-20 shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isActive
                          ? 'border-[#10D4A2] shadow-[0_0_16px_rgba(16,212,162,0.4)] scale-105 z-10'
                          : 'border-white/10 hover:border-white/30 bg-[#050919]'
                      }`}
                      title={item.filename}
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.filename}
                        className="h-full w-full object-cover"
                      />

                      {/* Status Overlay */}
                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#10D4A2] border-t-transparent" />
                        </div>
                      )}

                      {/* Verdict Badge */}
                      {isDone && item.detectResult && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-xs py-0.5 px-1 text-center">
                          <span
                            className={`font-mono text-[9px] font-bold uppercase ${
                              verdict === 'REAL'
                                ? 'text-[#10D4A2]'
                                : verdict === 'AI_GENERATED'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {verdict === 'AI_GENERATED' ? 'AI' : verdict}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Item Forensics Details */}
            {activeItem && activeItem.status === 'processing' && (
              <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b1229]/90">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#10D4A2] border-t-transparent" />
                <div className="mt-4 font-display text-base font-semibold text-white">
                  Scanning {activeItem.filename}...
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Computing ELA Quantization Residuals + SynthID/Gemini Watermark Check
                </p>
              </div>
            )}

            {activeItem && activeItem.status === 'done' && activeItem.detectResult && (
              <div className="space-y-4">
                {/* Verdict Card */}
                <div
                  className={`rounded-2xl border p-5 ${
                    activeItem.detectResult.verdict === 'REAL'
                      ? 'border-[#10D4A2]/40 bg-[#10D4A2]/[0.07]'
                      : 'border-rose-500/40 bg-rose-500/[0.08]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {activeItem.detectResult.verdict === 'REAL' ? (
                        <CheckCircle2 className="h-8 w-8 text-[#10D4A2]" />
                      ) : (
                        <ShieldAlert className="h-8 w-8 text-rose-400" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xl font-bold text-white">
                            {activeItem.detectResult.verdict.replace('_', ' ')}
                          </span>
                          <span className="rounded-full bg-black/40 px-2.5 py-0.5 font-mono text-xs text-slate-200 tabular-nums">
                            {activeItem.detectResult.confidence}% confidence
                          </span>
                        </div>
                        <div className="mt-0.5 font-mono text-xs text-slate-300">
                          File: <span className="text-white font-semibold">{activeItem.filename}</span> • dHash:{' '}
                          <span className="text-[#10D4A2]">{activeItem.detectResult.dhash}</span> • ELA Mean Error:{' '}
                          <span className="tabular-nums">{activeItem.detectResult.ela_mean_error}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400">
                        Manipulation Risk
                      </div>
                      <div
                        className={`font-display text-3xl font-bold tabular-nums ${
                          activeItem.detectResult.manipulation_score >= 50
                            ? 'text-rose-400'
                            : 'text-[#10D4A2]'
                        }`}
                      >
                        {activeItem.detectResult.manipulation_score}/100
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive ELA Heatmap Split Comparison */}
                <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <SlidersHorizontal className="h-4 w-4 text-[#10D4A2]" />
                      Photo Edit Inspector
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      Slide to reveal hidden edits
                    </span>
                  </div>

                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-[#050919]">
                    <img
                      src={activeItem.previewUrl}
                      alt="Original submitted media"
                      className="h-full w-full object-contain"
                    />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - elaSplit}% 0 0)` }}
                    >
                      <img
                        src={activeItem.detectResult.ela_heatmap_url}
                        alt="ELA forensic heatmap"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute inset-y-0 w-0.5 bg-[#10D4A2] shadow-[0_0_12px_#10D4A2]"
                      style={{ left: `${elaSplit}%` }}
                    />
                    <span className="pointer-events-none absolute left-3 top-3 rounded bg-black/70 px-2 py-0.5 font-mono text-[10px] font-bold text-[#10D4A2]">
                      EDIT HEATMAP
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
                  {activeItem.watermarkResult && (
                    <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4 space-y-2.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                        AI Watermark &amp; Camera Origin
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between rounded-lg bg-[#050919]/80 px-3 py-2">
                          <span className="text-slate-300">Gemini / SynthID Watermark</span>
                          <span
                            className={`font-mono font-bold ${
                              activeItem.watermarkResult.synthid_detected
                                ? 'text-rose-400'
                                : 'text-[#10D4A2]'
                            }`}
                          >
                            {activeItem.watermarkResult.synthid_detected
                              ? `DETECTED (${Math.round(activeItem.watermarkResult.synthid_confidence * 100)}%)`
                              : 'NONE'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-[#050919]/80 px-3 py-2">
                          <span className="text-slate-300">Original Camera Signature</span>
                          <span
                            className={`font-mono font-bold ${
                              activeItem.watermarkResult.c2pa_present ? 'text-[#10D4A2]' : 'text-amber-300'
                            }`}
                          >
                            {activeItem.watermarkResult.c2pa_present ? 'VERIFIED' : 'ABSENT / STRIPPED'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-[#050919]/80 px-3 py-2">
                          <span className="text-slate-300">AI Generated Tag</span>
                          <span
                            className={`font-mono font-bold ${
                              activeItem.watermarkResult.iptc_ai_flag ? 'text-rose-400' : 'text-slate-300'
                            }`}
                          >
                            {activeItem.watermarkResult.iptc_ai_flag ? 'AI TAGGED' : 'CLEAR'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        {activeItem.watermarkResult.provenance_summary}
                      </p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4 space-y-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#10D4A2]">
                      AI Analysis Notes
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {activeItem.detectResult.gemini_notes.map((note, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10D4A2]" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {activeItem.detectResult.ela_peak_zones.map((z) => (
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
              </div>
            )}
          </div>
        )
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
                Detects AI voice clones and synthetic speech
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4 space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#10D4A2]">
                Try Voice Samples
              </div>
              <button
                onClick={() => runAudioPreset('clone')}
                disabled={audioLoading}
                className="flex w-full items-center justify-between rounded-xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-left hover:bg-rose-500/20 cursor-pointer"
              >
                <div>
                  <div className="text-sm font-semibold text-white">
                    AI Voice Clone
                  </div>
                  <div className="text-[11px] text-rose-200/80">
                    High-frequency AI voice cutoff detected
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
                    Real Human Voice
                  </div>
                  <div className="text-[11px] text-[#10D4A2]/90">
                    Natural human vocal flow confirmed
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
                      Voice Frequency Graph
                    </div>
                    <span className="font-mono text-[11px] text-rose-300">
                      AI Voice Cutoff Line
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

                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-slate-400">
                    <span>
                      Glottal kurtosis ratio:{' '}
                      <strong className="text-white">{audioResult.glottal_kurtosis}</strong> (normal range: 3.8–5.8)
                    </span>
                    <span>
                      Vocoder cutoff frequency:{' '}
                      <strong className="text-white">{audioResult.vocoder_shelf_khz} kHz</strong>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b1229]/60 p-8 text-center">
                <Mic className="h-12 w-12 text-slate-600" />
                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  Awaiting Audio Waveform Input
                </h3>
                <p className="mt-1 max-w-md text-xs text-slate-400">
                  Upload any WhatsApp voice note, wire-transfer instruction, or synthetic speech sample.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
