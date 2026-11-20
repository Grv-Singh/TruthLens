import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Layers,
  Maximize2,
  Play,
  Presentation,
  ScanSearch,
  Sparkles,
  Video,
  Volume2,
} from 'lucide-react';
import type { Language, NavTab } from '../types/truthlens';

interface PitchDeckViewProps {
  lang: Language;
  onNavigate: (tab: NavTab) => void;
}

const SLIDES = [
  {
    id: 1,
    title: 'Break the Deepfake Loop',
    subtitle: 'Systems Thinking + Gemini AI to stop virality, protect mental health, and restore trust.',
    badge: 'Cover • Buildathon 2026',
    image: '/deck/slide1.png',
    keyPoints: [
      'Team: Gaurav Singh (Jaipur) & Ankita Sinha (Remote)',
      'Methodologies: Causal Inference (Erica) • Systems Dynamics (Schemo) • Gemini',
      'Theme: Buildathon 2026 • India • Hypothetica',
    ],
    actionTab: 'overview' as NavTab,
    actionLabel: 'Explore Systems Map',
  },
  {
    id: 2,
    title: 'The Problem is a System',
    subtitle: 'Deepfakes ride 3 reinforcing loops. Detection alone is too late.',
    badge: '3 Reinforcing Loops',
    image: '/deck/slide2.png',
    keyPoints: [
      'Virality Loop: AI Tool > Shocking Fake > Algorithm Boosts > More Shares',
      'Mental Health Loop: Victim sees fake > Anxiety/Shame > Withdrawal > Deeper harm',
      'Trust Collapse Loop: No one trusts photos > Real victims ignored > Society divides',
      'Critical Asymmetry: Damage goes viral in 2 hours. Takedown takes 2 days.',
      'India is ground zero: WhatsApp forwards, women & creators most targeted.',
    ],
    actionTab: 'dampen' as NavTab,
    actionLabel: 'Simulate Virality & Cooling',
  },
  {
    id: 3,
    title: 'Leverage Points, Not Whack-a-Mole',
    subtitle: 'Donella Meadows: Change the structure, not the symptom.',
    badge: 'Leverage Points Architecture',
    image: '/deck/slide3.png',
    keyPoints: [
      'L1 - AT CREATION: My Real Vault proves what is REAL before it is faked',
      'L2 - AT AMPLIFICATION: Warn BEFORE you share - break the virality loop',
      'L3 - AT VICTIM: Balancing loop - calm, evidence, takedown, counselor',
      'Every fake mapped as Causal Graph: Creator -> Platform -> Sharers -> Victim',
      'AI picks the ONE intervention with maximum harm reduction.',
    ],
    actionTab: 'overview' as NavTab,
    actionLabel: 'Inspect Causal Graph',
  },
  {
    id: 4,
    title: 'Solution: Detect + Protect + Heal',
    subtitle: 'One platform, three systems interventions.',
    badge: 'Platform Solutions',
    image: '/deck/slide4.png',
    keyPoints: [
      'DETECT: Upload image/link - Real / AI / Manipulated score in 2 sec + heatmap',
      'PROTECT: Invisible fingerprint - prove YOUR photo is the original',
      'HEAL: AI companion + evidence kit + takedown draft + counselor connect',
      'SIMULATE: What if I share this? shows 24h harm if 100 people share',
      'Delivery: WhatsApp-first, Chrome extension, Hindi + 8 Indian languages.',
    ],
    actionTab: 'detect' as NavTab,
    actionLabel: 'Try Live Detect & Heatmap',
  },
  {
    id: 5,
    title: 'Powered by Google AI',
    subtitle: 'Gemini detects. Our Systems Engine understands.',
    badge: 'Google AI Stack',
    image: '/deck/slide5.png',
    keyPoints: [
      'Gemini API Multimodal: artifacts, lighting, face-blend, metadata mismatch',
      'Nano Banana: creates safe demo fakes to train users + simulate spread',
      'Gemini Live: voice crisis coach in Hindi/English - talks you out of panic',
      'Gemma On-Device: private offline check, photo never leaves your phone',
      'Cloud Architecture: Cloud Run + Vertex AI + Firestore + BigQuery | asia-south1 for DPDP',
    ],
    actionTab: 'system' as NavTab,
    actionLabel: 'View Architecture & APIs',
  },
];

export const PitchDeckView: React.FC<PitchDeckViewProps> = ({ lang, onNavigate }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'slides' | 'video'>('slides');
  const slide = SLIDES[currentSlideIndex];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#10D4A2]">
            <Presentation className="h-4 w-4" />
            Buildathon 2026 • Official Presentation Deck
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-white">
            TruthLens — Pitch Deck &amp; Systems Strategy
          </h2>
        </div>

        {/* View Mode Switcher + Downloads */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-white/10 bg-[#050919] p-1">
            <button
              onClick={() => setViewMode('slides')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                viewMode === 'slides'
                  ? 'bg-[#10D4A2] text-[#050919]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Presentation className="h-3.5 w-3.5" />
              5-Slide Deck
            </button>
            <button
              onClick={() => setViewMode('video')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                viewMode === 'video'
                  ? 'bg-sky-400 text-[#050919]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              25s Pitch Video
            </button>
          </div>

          <a
            href="/truthlens_demo_walkthrough.mp4"
            download="truthlens_demo_walkthrough.mp4"
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-sky-400" />
            Video MP4
          </a>
          <a
            href="/deck/truthlens_pitch_deck.pdf"
            download="TruthLens_Pitch_Deck_2026.pdf"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#10D4A2]" />
            Deck PDF
          </a>
          <a
            href="/deck/truthlens_pitch_deck.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#10D4A2] px-3.5 py-1.5 text-xs font-bold text-[#050919] hover:bg-[#00e8ac] transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open
          </a>
        </div>
      </div>

      {viewMode === 'video' ? (
        /* Video Pitch Walkthrough Stage */
        <div className="space-y-6">
          <div className="rounded-2xl border border-sky-500/30 bg-[#070e28] p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                  <Play className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    25-Second Product Demo &amp; Investor Walkthrough Video
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-definition 720p 30fps MP4 narrative &bull; Problem &bull; Systems Architecture &bull; Traction
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#10D4A2]/15 border border-[#10D4A2]/30 px-2.5 py-0.5 text-xs font-semibold text-[#10D4A2]">
                  <Volume2 className="h-3 w-3" />
                  Voice Narration
                </span>
                <span className="rounded-full bg-sky-400/15 border border-sky-400/30 px-3 py-0.5 text-xs font-mono font-semibold text-sky-300">
                  0:25 DURATION
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-black aspect-video max-w-4xl mx-auto shadow-2xl">
              <video
                src="/truthlens_demo_walkthrough.mp4"
                poster="/deck/slide1.png"
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div className="rounded-xl border border-white/10 bg-[#050919] p-3">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-400">01. The Problem</div>
                <div className="mt-1 text-sm font-semibold text-white">Damage in 2h vs Takedown in 2d</div>
                <p className="mt-0.5 text-xs text-slate-400">
                  3 reinforcing loops exploit viral WhatsApp forwarding and cause acute victim trauma.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#050919] p-3">
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400">02. The Architecture</div>
                <div className="mt-1 text-sm font-semibold text-white">Zero-Cloud ELA + Gemini</div>
                <p className="mt-0.5 text-xs text-slate-400">
                  Error Level Analysis (&lt;2s), 11.2 kHz voice FFT, Qdrant vault, and 15s cooling friction.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#050919] p-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#10D4A2]">03. Full Compliance</div>
                <div className="mt-1 text-sm font-semibold text-white">BSA 63 + DPDP asia-south1</div>
                <p className="mt-0.5 text-xs text-slate-400">
                  Court-admissible certificate, 1-click Cyber Cell reporting, and local data sovereignty.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#10D4A2]" />
                Self-contained native video for investor presentations, demo days, and pitch decks.
              </span>
              <button
                onClick={() => onNavigate('detect')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#10D4A2] px-4 py-2 text-xs font-bold text-[#050919] hover:bg-[#00e8ac] transition cursor-pointer"
              >
                <ScanSearch className="h-4 w-4" />
                Launch Live Forensics Lab
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main Slide Presentation Stage */}
          <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Slide navigation controls */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#10D4A2]/15 px-3 py-1 font-mono text-xs font-bold text-[#10D4A2]">
              Slide {slide.id} of {SLIDES.length}
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-300">
              {slide.badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : SLIDES.length - 1))}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-[#050919] text-slate-300 hover:text-white hover:border-white/20 transition cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5 px-2">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${idx === currentSlideIndex ? 'w-6 bg-[#10D4A2]' : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentSlideIndex((prev) => (prev < SLIDES.length - 1 ? prev + 1 : 0))}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-[#050919] text-slate-300 hover:text-white hover:border-white/20 transition cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Slide Display */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-[#050919]">
          <img
            src={slide.image}
            alt={`Slide ${slide.id}: ${slide.title}`}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Slide Breakdown and Quick Navigation to App Feature */}
        <div className="grid gap-4 sm:grid-cols-12 items-center rounded-xl border border-white/10 bg-[#050919]/70 p-4">
          <div className="sm:col-span-8 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-white">{slide.title}</span>
            </div>
            <p className="text-xs text-slate-300">{slide.subtitle}</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-400">
              {slide.keyPoints.slice(0, 3).map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10D4A2]" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="sm:col-span-4 sm:text-right">
            <button
              onClick={() => onNavigate(slide.actionTab)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#10D4A2] px-4 py-2.5 text-xs font-bold text-[#050919] hover:bg-[#00e8ac] transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {slide.actionLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Slide Thumbnails Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-[#10D4A2]" /> All 5 Pitch Slides
          </span>
          <span>Click any thumbnail to preview</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SLIDES.map((s, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`group relative overflow-hidden rounded-xl border text-left transition cursor-pointer ${isActive
                  ? 'border-[#10D4A2] ring-2 ring-[#10D4A2]/40 bg-[#10D4A2]/10'
                  : 'border-white/10 bg-[#0b1229] hover:border-white/30'
                  }`}
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-black/40">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition"
                  />
                </div>
                <div className="p-2">
                  <div className="font-mono text-[10px] text-[#10D4A2]">Slide {s.id}</div>
                  <div className="font-display text-xs font-semibold text-white truncate">
                    {s.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
