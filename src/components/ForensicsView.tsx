import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  AudioLines,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  FileCheck2,
  FileText,
  Fingerprint,
  Gavel,
  Image as ImageIcon,
  MessageSquare,
  Mic,
  Play,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
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
  TextDetectResult,
  WatermarkResult,
} from '../types/truthlens';
import type { TruthLensClient } from '../lib/api';
import {
  createDemoImageFile,
  runLocalEdgeDetect,
  runLocalTextDetect,
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
  const [subMode, setSubMode] = useState<'image' | 'audio' | 'text'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const m = p.get('mode');
      if (m === 'audio' || m === 'voice') return 'audio';
      if (m === 'text' || m === 'forward' || m === 'doc') return 'text';
      if (p.get('text')) return 'text';
    }
    if (sharedMedia?.text) return 'text';
    return 'image';
  });
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

  // Forwarded text & document claim state
  const [textContent, setTextContent] = useState(() => sharedMedia?.text || '');
  const [textLoading, setTextLoading] = useState(false);
  const [textResult, setTextResult] = useState<TextDetectResult | null>(null);
  const [copiedDebunk, setCopiedDebunk] = useState<'english' | 'hindi' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeText = async (customText?: string) => {
    const textToRun = (customText ?? textContent).trim();
    if (!textToRun) return;
    setTextLoading(true);
    try {
      const res = await client.detectText(textToRun);
      setTextResult(res);
    } catch {
      const fallback = runLocalTextDetect(textToRun);
      setTextResult(fallback);
    } finally {
      setTextLoading(false);
    }
  };

  const handleDocFileUpload = async (file: File) => {
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const text = await file.text();
      setTextContent(text);
      handleAnalyzeText(text);
    } else {
      try {
        const text = await file.text();
        const cleaned = text.replace(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleaned.length > 30) {
          setTextContent(cleaned.slice(0, 2000));
          handleAnalyzeText(cleaned.slice(0, 2000));
          return;
        }
      } catch {}
      const fallbackNote = `[Uploaded Document: Document 1] Attached circular claiming urgent public warning.`;
      setTextContent(fallbackNote);
      handleAnalyzeText(fallbackNote);
    }
  };

  useEffect(() => {
    if (sharedMedia?.text && !textResult) {
      setSubMode('text');
      setTextContent(sharedMedia.text);
      handleAnalyzeText(sharedMedia.text);
    }
  }, [sharedMedia?.text]);

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

    const baseIndex = imageQueue.length;
    const newItems: ImageBatchItem[] = fileList.map((file, idx) => {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const itemNumber = baseIndex + idx + 1;
      const cleanName = `Image ${itemNumber}`;
      const renamedFile = new File([file], `image_${itemNumber}.${ext}`, { type: file.type });
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file: renamedFile,
        previewUrl: URL.createObjectURL(renamedFile),
        filename: cleanName,
        status: 'pending',
      };
    });

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

  // Auto-route based on kind of shared media (Photos vs Voice Notes)
  useEffect(() => {
    if (sharedMedia.file) {
      const isAudio =
        sharedMedia.file.type.startsWith('audio/') ||
        /\.(opus|wav|mp3|m4a|ogg|aac)$/i.test(sharedMedia.file.name);

      if (isAudio) {
        setSubMode('audio');
        handleAudioFile(sharedMedia.file);
      } else {
        setSubMode('image');
        if (imageQueue.length === 0) {
          handleAddFiles([sharedMedia.file]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedMedia.file]);

  // Audio Handlers
  const handleAudioFile = async (file: File) => {
    setAudioLoading(true);
    const ext = (file.name.split('.').pop() || 'wav').toLowerCase().replace(/[^a-z0-9]/g, '') || 'wav';
    const renamedAudio = new File([file], `audio_1.${ext}`, { type: file.type });
    setAudioLabel('Audio 1');
    try {
      const res = await client.detectAudio(renamedAudio);
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

      {/* Mode Switcher Bar */}
      <div className="flex items-center justify-between pb-2">
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
          <button
            onClick={() => setSubMode('text')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition cursor-pointer ${
              subMode === 'text'
                ? 'bg-[#10D4A2] text-[#050919]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            Forwarded Text
          </button>
        </div>

        {((subMode === 'image' && imageQueue.length > 0) ||
          (subMode === 'audio' && audioResult) ||
          (subMode === 'text' && textResult)) && (
          <button
            onClick={() => {
              if (subMode === 'image') handleClearQueue();
              else if (subMode === 'audio') {
                setAudioResult(null);
                setAudioLabel('');
              } else {
                setTextResult(null);
                setTextContent('');
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
          >
            <span className="material-symbols-rounded notranslate text-sm align-middle" translate="no">restart_alt</span>
            <span>New Scan</span>
          </button>
        )}
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
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const first = e.dataTransfer.files[0];
                    if (first.type.startsWith('audio/') || /\.(opus|wav|mp3|m4a|ogg|aac)$/i.test(first.name)) {
                      setSubMode('audio');
                      handleAudioFile(first);
                    } else if (first.type.startsWith('text/') || /\.(pdf|doc|docx|txt|md)$/i.test(first.name)) {
                      setSubMode('text');
                      handleDocFileUpload(first);
                    } else {
                      handleAddFiles(e.dataTransfer.files);
                    }
                  }
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
                        {activeItem.detectResult.manipulation_score}%
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
                    <TrendingDown className="h-3.5 w-3.5" />
                    Simulate 24h Virality Spread (L2)
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
      ) : subMode === 'audio' ? (
        /* VOICE NOTE FORENSICS */
        !audioResult && !audioLoading ? (
          <div className="mx-auto max-w-2xl">
            <div
              onClick={() => audioInputRef.current?.click()}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-[#0b1229]/80 p-10 text-center transition hover:border-[#10D4A2]/60 hover:bg-[#111b3a]/70 flex flex-col items-center justify-center min-h-[300px]"
            >
              <input
                ref={audioInputRef}
                type="file"
                accept=".opus,.wav,.mp3,.m4a,audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAudioFile(file);
                }}
              />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 group-hover:scale-105 transition shadow-[0_0_24px_rgba(56,189,248,0.2)]">
                <Mic className="h-8 w-8" />
              </div>
              <div className="mt-4 font-display text-lg font-bold text-white">
                Upload Voice Note
              </div>
              <div className="mt-1 font-mono text-[11px] text-slate-400">
                opus, wav, mp3, m4a
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Detects AI voice clones and synthetic speech
              </p>
            </div>
          </div>
        ) : audioLoading ? (
          <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0b1229]/90">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#10D4A2] border-t-transparent" />
            <div className="mt-4 font-display text-base font-semibold text-white">
              Analyzing Voice Note Waveform...
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Inspecting Vocoder Shelf Cutoff + Glottal Pulse Naturalness
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {audioResult && (
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
            )}
          </div>
        )
      ) : (
          /* ======================================================== */
          /* SUBMODE: FORWARDED TEXT & DOCUMENT MISINFORMATION        */
          /* ======================================================== */
          !textResult && !textLoading ? (
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#10D4A2]" />
                      WhatsApp Forward &amp; Claim Fact-Check
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      Paste viral forwarded messages, rumor alerts, or upload notices to detect manipulation and fake claims.
                    </p>
                  </div>
                  <button
                    onClick={() => docInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5 text-[#10D4A2]" />
                    <span>Upload Doc / PDF</span>
                  </button>
                </div>

                {/* Hidden doc input */}
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".txt,.md,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleDocFileUpload(f);
                  }}
                />

                <div>
                  <textarea
                    rows={5}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Paste viral forwarded message, rumor, or notice here..."
                    className="w-full rounded-xl border border-white/10 bg-[#050919] p-3.5 text-xs text-white placeholder-slate-500 focus:border-[#10D4A2] focus:outline-none"
                  />
                </div>

                {/* Quick sample pills */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                    Try Sample WhatsApp Forwards:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const t = 'URGENT ALERT: Tonight from 12:30 AM to 3:30 AM NASA announces cosmic rays will pass close to earth. Switch off your mobile phones immediately or radiation will cause cancer. Forward to all family and school groups immediately!';
                        setTextContent(t);
                        handleAnalyzeText(t);
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:border-amber-400/40 hover:bg-white/10 transition cursor-pointer"
                    >
                      NASA Cosmic Ray Warning
                    </button>
                    <button
                      onClick={() => {
                        const t = 'BREAKING SCHEME: Government of India announced free 3-month 5G recharge for all citizens under Digital India scheme. Click link bit.ly/pm-5g-free before midnight. Share with 5 groups to activate!';
                        setTextContent(t);
                        handleAnalyzeText(t);
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:border-amber-400/40 hover:bg-white/10 transition cursor-pointer"
                    >
                      Free 5G Recharge Link
                    </button>
                    <button
                      onClick={() => {
                        const t = 'OFFICIAL CIRCULAR: RBI orders that all old currency notes are invalid from midnight tonight. Commercial banks directed to freeze branch deposits. Forward this notification to everyone immediately!';
                        setTextContent(t);
                        handleAnalyzeText(t);
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:border-amber-400/40 hover:bg-white/10 transition cursor-pointer"
                    >
                      RBI Currency Ban Notice
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleAnalyzeText()}
                  disabled={!textContent.trim()}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition cursor-pointer ${
                    textContent.trim()
                      ? 'bg-[#10D4A2] text-[#050919] hover:bg-[#00e8ac]'
                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ScanSearch className="h-4 w-4" />
                  <span>Verify Forwarded Text</span>
                </button>
              </div>
            </div>
          ) : textLoading ? (
            <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0b1229]/80 p-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10D4A2]/15 text-[#10D4A2] animate-pulse">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="font-display text-base font-bold text-white">
                Fact-Checking Claims &amp; Detecting Viral Fallacies...
              </div>
              <p className="text-xs text-slate-400">
                Cross-referencing official registries, forward chain patterns, and authority attributions.
              </p>
            </div>
          ) : textResult ? (
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Verdict Header Banner */}
              <div
                className={`rounded-2xl border p-5 ${
                  textResult.verdict === 'FABRICATED_RUMOR'
                    ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-[#0b1229] to-[#0b1229]'
                    : textResult.verdict === 'MISLEADING_CLAIM'
                    ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-[#0b1229] to-[#0b1229]'
                    : 'border-[#10D4A2]/40 bg-gradient-to-r from-emerald-950/60 via-[#0b1229] to-[#0b1229]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {textResult.verdict === 'FABRICATED_RUMOR' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 font-mono text-xs font-bold text-rose-300">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          FABRICATED RUMOR / FAKE FORWARD
                        </span>
                      ) : textResult.verdict === 'MISLEADING_CLAIM' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 font-mono text-xs font-bold text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          MISLEADING / UNVERIFIED CLAIM
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10D4A2]/20 px-3 py-1 font-mono text-xs font-bold text-[#10D4A2]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          AUTHENTIC / VERIFIED FACT
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-display text-xl font-bold text-white">
                      {textResult.verdict === 'FABRICATED_RUMOR'
                        ? 'Deceptive Viral Disinformation Detected'
                        : textResult.verdict === 'MISLEADING_CLAIM'
                        ? 'Unsubstantiated or Embellished Forward'
                        : 'No Malicious Forward Markers Found'}
                    </h3>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-2xl">
                      {textResult.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center sm:flex sm:gap-4">
                    <div className="rounded-xl border border-white/10 bg-[#050919]/80 px-4 py-2.5">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Risk Score</div>
                      <div
                        className={`font-mono text-xl font-bold tabular-nums ${
                          textResult.risk_score >= 70
                            ? 'text-rose-400'
                            : textResult.risk_score >= 40
                            ? 'text-amber-400'
                            : 'text-[#10D4A2]'
                        }`}
                      >
                        {textResult.risk_score}%
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[#050919]/80 px-4 py-2.5">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Artificial Urgency</div>
                      <div className="font-mono text-xl font-bold text-amber-300 tabular-nums">
                        {textResult.urgency_score}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fact-Check Details & Deception Markers */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Detected Manipulation &amp; Fallacy Signatures
                  </div>
                  <div className="space-y-2">
                    {textResult.fallacies.map((fallacy, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/8 bg-[#050919]/80 p-3 text-xs text-slate-200 flex items-start gap-2.5"
                      >
                        <span className="material-symbols-rounded notranslate text-rose-400 text-base shrink-0 mt-0.5" translate="no">flag</span>
                        <span>{fallacy}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Veracity &amp; Source Attribution Audit
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="rounded-xl border border-white/8 bg-[#050919]/80 p-3">
                      <div className="font-semibold text-slate-300">Factual Accuracy:</div>
                      <p className="mt-1 text-slate-300">{textResult.veracity_breakdown.factual_accuracy}</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-[#050919]/80 p-3">
                      <div className="font-semibold text-slate-300">Source Attribution:</div>
                      <p className="mt-1 text-slate-300">{textResult.veracity_breakdown.source_attribution}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Debunk Reply Generator */}
              <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 space-y-4">
                <div>
                  <h4 className="font-display text-sm font-bold text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#10D4A2]" />
                    Instant WhatsApp Group Debunk Reply
                  </h4>
                  <p className="mt-1 text-xs text-slate-400">
                    Copy and paste into your family or community group to stop the forward immediately.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* English Debunk */}
                  <div className="rounded-xl border border-white/10 bg-[#050919] p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                        <span>English Debunk Message</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-200 font-mono">
                        {textResult.debunk_reply.english}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(textResult.debunk_reply.english);
                        setCopiedDebunk('english');
                        setTimeout(() => setCopiedDebunk(null), 2000);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#10D4A2] px-3 py-2 text-xs font-bold text-[#050919] hover:bg-[#00e8ac] transition cursor-pointer"
                    >
                      {copiedDebunk === 'english' ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy English Debunk</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Hindi Debunk */}
                  <div className="rounded-xl border border-white/10 bg-[#050919] p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                        <span>Hindi Debunk Message</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-200 font-mono">
                        {textResult.debunk_reply.hindi}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(textResult.debunk_reply.hindi);
                        setCopiedDebunk('hindi');
                        setTimeout(() => setCopiedDebunk(null), 2000);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#10D4A2] px-3 py-2 text-xs font-bold text-[#050919] hover:bg-[#00e8ac] transition cursor-pointer"
                    >
                      {copiedDebunk === 'hindi' ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Hindi Debunk</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Handoff Bar */}
              <div className="flex flex-wrap gap-2.5 rounded-xl border border-white/10 bg-[#0b1229]/80 p-3">
                <button
                  onClick={() => onNavigate('dampen')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 cursor-pointer"
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  Simulate 24h Virality Spread (L2)
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
          ) : null
        )
      }
    </div>
  );
};
