import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Download,
  Eye,
  FileText,
  Fingerprint,
  Flame,
  Gavel,
  Globe,
  HeartHandshake,
  HelpCircle,
  Landmark,
  Layers,
  Lock,
  MapPin,
  MessageSquare,
  Newspaper,
  Play,
  Presentation,
  Radio,
  RefreshCw,
  ScanSearch,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  UploadCloud,
  UserCheck,
  Users,
  Video,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import type {
  ApiInfoResponse,
  DomainId,
  HealthResponse,
  Language,
  NavTab,
} from '../types/truthlens';
import { t } from '../lib/i18n';

interface OverviewViewProps {
  lang: Language;
  health: HealthResponse | null;
  apiInfo: ApiInfoResponse | null;
  baseUrl: string;
  onRefreshHealth: () => void;
  onNavigate: (tab: NavTab) => void;
  onOpenDomain: (domain: DomainId) => void;
}

const CAUSAL_NODES = [
  {
    id: 'creator',
    step: '01',
    label: 'Creator / Forger',
    sub: 'AI Tools & Synthetic Audio/Video',
    icon: Lock,
    image: '/reactions/node1_creator.png',
    leverage: 'L1 — AT CREATION',
    leverageTitle: 'Origin Derivative Vault (Qdrant)',
    leverageDesc:
      'Registers cryptographic SHA-256 + 64-bit dHash of authentic media BEFORE it can be faked. Proves provenance even after screenshots or re-compression (Hamming ≤ 10).',
    targetTab: 'vault' as NavTab,
    badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-[#10D4A2]',
    glowColor: 'hover:shadow-[0_0_25px_rgba(16,212,162,0.25)]',
  },
  {
    id: 'platform',
    step: '02',
    label: 'Platform & Feeds',
    sub: 'Algorithm Boosts Sensational Outrage',
    icon: Eye,
    image: '/reactions/node2_platform.png',
    leverage: 'L0 — EDGE FORENSICS',
    leverageTitle: 'Zero-Cloud Multimodal Gate',
    leverageDesc:
      'Runs Error Level Analysis (ELA), SynthID, C2PA, and 11.2 kHz audio vocoder FFT before broadcast — separating malicious impersonations from benign creative edits.',
    targetTab: 'detect' as NavTab,
    badgeColor: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
    glowColor: 'hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]',
  },
  {
    id: 'sharers',
    step: '03',
    label: 'Viral Sharers',
    sub: 'WhatsApp Forwards & Bot Farms',
    icon: Flame,
    image: '/reactions/node3_sharers.png',
    leverage: 'L2 — AT AMPLIFICATION',
    leverageTitle: '15s Cognitive Cooling + Outrage Guardrail',
    leverageDesc:
      'Injects behavioral friction before impulsive forwarding, throttles outrage-bait streaks, and suppresses coordinated astroturfing bots to drop R₀ below viral threshold.',
    targetTab: 'dampen' as NavTab,
    badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    glowColor: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
  },
  {
    id: 'victim',
    step: '04',
    label: 'Targeted Victim',
    sub: 'Anxiety, Shame, Extortion',
    icon: HeartHandshake,
    image: '/reactions/node4_victim.png',
    leverage: 'L3 — AT VICTIM',
    leverageTitle: 'Balancing Loop: Heal + Debunk + Law',
    leverageDesc:
      'Gemini Live Hindi/English crisis coach calms panic, auto-generates WhatsApp debunk sticker cards, BSA Sec 63 court dossiers, and Rule 3(2)(b) 24h takedowns.',
    targetTab: 'heal' as NavTab,
    badgeColor: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    glowColor: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]',
  },
];

const AI_RECOMMENDED_NODE = 'sharers';

const VERTICAL_SUMMARY: {
  id: DomainId;
  title: string;
  tag: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  badgeBg: string;
  image: string;
}[] = [
  {
    id: 'fintech',
    title: 'Fintech, Banking & Remote KYC',
    tag: 'KYC & Voice Auth',
    desc: 'Stop face-swapped selfies, AI IDs, virtual-camera injection, and call-center voice clones on wire transfers.',
    icon: Landmark,
    accent: 'text-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,212,162,0.3)]',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    image: '/reactions/domain1_fintech.png',
  },
  {
    id: 'social',
    title: 'Social, Messaging & Wellbeing',
    tag: 'Virality & Mental Health',
    desc: 'Pre-share labeling, outrage-bait exposure cool-downs, and coordinated bot/astroturfing suppression.',
    icon: Users,
    accent: 'text-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    image: '/reactions/domain2_social.png',
  },
  {
    id: 'enterprise',
    title: 'Enterprise Security & Hiring',
    tag: 'BEC 2.0 & Interviews',
    desc: 'Detect live Zoom/Meet C-suite executive deepfakes and proxy-candidate face-swap interview fraud.',
    icon: Building2,
    accent: 'text-sky-400 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    image: '/reactions/domain3_enterprise.png',
  },
  {
    id: 'journalism',
    title: 'Journalism, Newsrooms & Civic',
    tag: 'UGC & Elections',
    desc: 'Rapid breaking-news UGC provenance scoring and election/public-figure speech forgery defense.',
    icon: Newspaper,
    accent: 'text-purple-400 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    image: '/reactions/domain4_journalism.png',
  },
  {
    id: 'commerce',
    title: 'E-Commerce, Insurance & Gig',
    tag: 'Claims & Liveness',
    desc: 'Catch tampered delivery/insurance damage claims and run fast driver/seller identity re-verification.',
    icon: ShoppingBag,
    accent: 'text-cyan-400 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    image: '/reactions/domain5_commerce.png',
  },
  {
    id: 'legal',
    title: 'Legal, Compliance & Forensics',
    tag: 'BSA 63 & Takedowns',
    desc: 'Court-ready chain-of-custody validation, Sec 67C CGNAT preservation, and 24h Rule 3(2)(b) notices.',
    icon: Gavel,
    accent: 'text-rose-400 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]',
    badgeBg: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    image: '/reactions/domain6_legal.png',
  },
];

const USE_CASE_STORIES = [
  {
    id: 'priya',
    persona: 'Priya Sharma (Age 21)',
    role: 'University Student & Creator',
    location: 'New Delhi, India',
    badge: 'Social & Harassment Defense',
    badgeColor: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
    accentColor: '#f43f5e',
    crisisTitle: 'Non-Consensual Morphed Deepfake in 8 WhatsApp Groups',
    crisisDesc:
      'A cyber-blackmailer uses an AI face-swap app to morph Priya’s college photo onto explicit media, broadcasting it into student WhatsApp groups with extortion demands.',
    impactWithout: 'Victim deletes social media, suffers acute trauma & panic, police complaint delayed by 3 weeks.',
    impactWith: 'Fake debunked in 2 minutes, R₀ virality collapsed below 1.0, court-ready BSA 63 certificate filed to 1930 Cyber Cell within the hour.',
    steps: [
      {
        num: '01',
        title: 'Instant Zero-Cloud ELA Heatmap Scan',
        stage: 'L0 Forensics',
        tech: 'Gemma On-Device + Error Level Analysis',
        detail:
          'Priya drags the screenshot into TruthLens. Within 1.4 seconds, pixel recompression quantization reveals a 94% splice seam anomaly around the facial jawline. Photo never leaves her phone.',
        targetTab: 'detect' as NavTab,
        cta: 'Launch ELA Scanner in Detect',
      },
      {
        num: '02',
        title: 'Generate WhatsApp Debunk Sticker Card',
        stage: 'L3 Victim Counter-Narrative',
        tech: 'PNG-8 Base64 Generator',
        detail:
          'TruthLens instantly creates a 512×512 high-contrast debunk sticker: "⚠️ TRUTHLENS VERIFIED DEEPFAKE • DO NOT FORWARD". Friends forward the sticker into group chats, killing rumor momentum.',
        targetTab: 'heal' as NavTab,
        cta: 'Generate Debunk Sticker in Heal',
      },
      {
        num: '03',
        title: 'WhatsApp 15s Cognitive Cooling Friction',
        stage: 'L2 Amplification Guardrail',
        tech: 'Donella Meadows Systems Engine',
        detail:
          'OpenWA gateway injects a 15-second behavioral pause before group forwards. The Donella Meadows stock-and-flow virality curve causes an 82% abandonment rate, dropping R₀ from 3.4 to 0.65.',
        targetTab: 'dampen' as NavTab,
        cta: 'Simulate Virality Friction in Dampen',
      },
      {
        num: '04',
        title: 'Section 63 BSA 2023 Certificate & 1930 Cyber Cell Filing',
        stage: 'L3 Statutory Legal Enforcement',
        tech: 'Sec 63 BSA + Sec 67C IT Act / Sec 94 BNSS',
        detail:
          'TruthLens auto-compiles a court-admissible Section 63 BSA digital certificate with SHA-256 hash, generates a Jamtara/Mewat ISP CGNAT preservation notice, and opens direct filing to 1930.',
        targetTab: 'heal' as NavTab,
        cta: 'Inspect BSA 63 Dossier in Heal',
      },
    ],
  },
  {
    id: 'vikram',
    persona: 'Vikram Malhotra',
    role: 'VP Finance & Treasury',
    location: 'Mumbai, India',
    badge: 'Fintech & BEC 2.0 Defense',
    badgeColor: 'border-sky-500/40 bg-sky-500/15 text-sky-300',
    accentColor: '#38bdf8',
    crisisTitle: 'Executive Audio Deepfake ₹18 Lakh Wire Transfer Attack',
    crisisDesc:
      'A cyber-criminal generates a voice clone of the Managing Director using 30 seconds of YouTube interview audio, calling the accounts desk to authorize an urgent vendor payment.',
    impactWithout: '₹18,00,000 lost to mule accounts in 4 minutes; funds laundered via UPI before bank alerts trigger.',
    impactWith: '11.2 kHz vocoder cutoff detected in 800ms; Qdrant vector mismatch freezes wire transfer at the policy gate.',
    steps: [
      {
        num: '01',
        title: 'SciPy 11.2 kHz FFT Neural Vocoder Shelf Detection',
        stage: 'L0 Audio FFT',
        tech: 'Glottal Pulse Kurtosis + FFT Spectrum',
        detail:
          'The voice note is fed through TruthLens audio forensics. The FFT spectrum shows a distinct steep shelf cutoff at 11.2 kHz and an abnormal glottal crest factor, characteristic of ElevenLabs voice models.',
        targetTab: 'detect' as NavTab,
        cta: 'Run Audio Voice Note FFT',
      },
      {
        num: '02',
        title: 'Qdrant Origin Vault Biometric Distance Check',
        stage: 'L1 Pre-Creation Seal',
        tech: 'Perceptual 64-bit dHash Vector Search',
        detail:
          'The call audio vector is compared against the Executive Director’s registered voice profile in Qdrant collection truthlens_vault. Hamming distance is 34 (threshold ≤ 10), failing authenticity.',
        targetTab: 'vault' as NavTab,
        cta: 'Inspect Origin Vault in Vault',
      },
      {
        num: '03',
        title: 'Automated Wire Transfer Policy Gate Freeze',
        stage: 'L1 Transaction Gate',
        tech: 'Fintech / Banking Policy Gate Simulator',
        detail:
          'TruthLens triggers an automated webhook that blocks RTGS execution, flags the target account, and prompts for multi-factor in-person biometric challenge.',
        targetTab: 'solutions' as NavTab,
        cta: 'Test Fintech Domain Gate',
      },
      {
        num: '04',
        title: 'Emergency Sec 94 BNSS Telecom Preservation Order',
        stage: 'L3 Compliance & Legal',
        tech: 'Sec 67C IT Act Preservation Notice',
        detail:
          'Generates a statutory preservation notice ordering the VoIP gateway carrier to freeze IP logs, CGNAT allocations, and call-detail records for the National Cyber Crime Reporting Portal.',
        targetTab: 'heal' as NavTab,
        cta: 'Generate Telecom Preservation Notice',
      },
    ],
  },
  {
    id: 'ananya',
    persona: 'Ananya Deshmukh',
    role: 'Senior Fact-Checking Editor',
    location: 'Bengaluru, India',
    badge: 'Journalism & Civic Integrity',
    badgeColor: 'border-purple-500/40 bg-purple-500/15 text-purple-300',
    accentColor: '#a855f7',
    crisisTitle: 'Election Eve UGC Video Forgery with Synced Speech',
    crisisDesc:
      'At 11 PM on election eve, an unverified breaking-news UGC video showing an election candidate supposedly withdrawing from the race is forwarded across WhatsApp political groups.',
    impactWithout: 'Misinformation causes thousands of confused voters to stay home; retractions the next morning are useless.',
    impactWith: 'Newsroom validates C2PA cryptographic signature mismatch in 2s, publishes verified debunk ticker before broadcast.',
    steps: [
      {
        num: '01',
        title: 'Sub-2s Direct URL Provenance Ingestion',
        stage: 'L0 Provenance',
        tech: 'Google SynthID + C2PA Manifest Reader',
        detail:
          'Ananya pastes the breaking video URL into TruthLens. The system inspects C2PA digital credentials and IPTC generative metadata, confirming the media lacks authentic hardware camera signatures.',
        targetTab: 'detect' as NavTab,
        cta: 'Analyze Direct URL in Detect',
      },
      {
        num: '02',
        title: 'Donella Meadows 24h Amplification Forecaster',
        stage: 'L2 Outrage Modeling',
        tech: 'Stock-and-Flow Virality Differential Equation',
        detail:
          'The systems engine simulates 100 seed forwards across 24 hours, alerting the newsroom that unmitigated spread will reach 140,000 citizens within 4 hours if not counteracted.',
        targetTab: 'dampen' as NavTab,
        cta: 'Open 24h Virality Simulator',
      },
      {
        num: '03',
        title: 'Rule 3(2)(b) 24h Emergency Intermediary Takedown',
        stage: 'L3 Platform Compliance',
        tech: 'IT Rules 2021 Statutory Notice Generator',
        detail:
          'TruthLens automatically drafts formal Rule 3(2)(b) removal notices citing Indian election media guidelines, addressed directly to Meta & YouTube Grievance Officers.',
        targetTab: 'heal' as NavTab,
        cta: 'Draft 24h Takedown Notice',
      },
      {
        num: '04',
        title: 'Live Newsroom Provenance Ticker Broadcast',
        stage: 'L0 Civic Verification',
        tech: 'Newsrooms & UGC Domain Playbook',
        detail:
          'The TV channel runs an on-screen TruthLens verified debunk badge with ELA heatmap proof, halting the political weaponization of the deepfake.',
        targetTab: 'solutions' as NavTab,
        cta: 'Open Journalism Domain Playbook',
      },
    ],
  },
];

export const OverviewView: React.FC<OverviewViewProps> = ({
  lang,
  health,
  apiInfo,
  baseUrl,
  onRefreshHealth,
  onNavigate,
  onOpenDomain,
}) => {
  const tr = t(lang);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('sharers');
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [activeStoryId, setActiveStoryId] = useState<string>('priya');
  const [activeStoryStep, setActiveStoryStep] = useState<number>(0);
  const [flowViewMode, setFlowViewMode] = useState<'story' | 'diagram'>('story');

  const activeStory = USE_CASE_STORIES.find((s) => s.id === activeStoryId) ?? USE_CASE_STORIES[0];
  const activeStepData = activeStory.steps[activeStoryStep] ?? activeStory.steps[0];
  const activeNode = CAUSAL_NODES.find((n) => n.id === selectedNodeId) ?? CAUSAL_NODES[2];

  return (
    <div className="space-y-8">
      {/* Hero Master Showcase */}
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#0c1538] via-[#070e28] to-[#030718] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] animate-border-glow">
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#10D4A2]/15 blur-3xl animate-pulse-ring" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#10D4A2]/40 bg-[#10D4A2]/10 px-4 py-1.5 text-xs font-bold tracking-wider text-[#10D4A2] shadow-[0_0_15px_rgba(16,212,162,0.2)]">
              <Sparkles className="h-4 w-4 animate-spin text-[#10D4A2]" style={{ animationDuration: '6s' }} />
              {tr.badge}
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-[1.1]">
              {lang === 'en' ? (
                <>
                  Break the{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10D4A2] via-[#00e8ac] to-sky-400 text-glow-emerald">
                    Deepfake Loop.
                  </span>
                </>
              ) : (
                <span className="text-[#10D4A2] text-glow-emerald">{tr.tagline}</span>
              )}
            </h1>

            <p className="text-base leading-relaxed text-slate-300 sm:text-xl font-normal max-w-lg">
              {lang === 'en'
                ? 'Deepfakes go viral in 2 hours. Takedowns take 2 days. TruthLens stops synthetic outrage before it spreads — powered by Google Gemini and Donella Meadows systems leverage points.'
                : tr.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('detect')}
                className="btn-neon-emerald inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer shadow-lg"
              >
                <ScanSearch className="h-4 w-4 text-[#030715]" />
                {tr.quickActions.scanNow}
              </button>
              <button
                onClick={() => setShowVideoModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/10 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-sky-200 transition hover:bg-sky-500/20 hover:border-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.2)] whitespace-nowrap cursor-pointer"
              >
                <Video className="h-4 w-4 text-sky-400 animate-pulse" />
                <span>Watch 25s Demo Video</span>
              </button>
              <button
                onClick={() => onNavigate('dampen')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-amber-200 transition hover:bg-amber-500/20 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] whitespace-nowrap cursor-pointer"
              >
                <Flame className="h-4 w-4 text-amber-400" />
                <span>15s Virality Friction</span>
              </button>
            </div>
          </div>

          {/* Interactive Hero Visual Showcase: Forensic Laser Scanner & Live Stat Badges */}
          <div className="relative w-full lg:w-[480px] flex flex-col items-center">
            <div className="group relative w-full aspect-[16/10] overflow-hidden rounded-2xl border border-white/20 bg-[#040816] shadow-2xl transition hover:scale-[1.02] duration-300">
              <img
                src="/reactions/hero_forensic_scanner.png"
                alt="TruthLens Real-time Multimodal Forensic Laser Split Scanner"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040816] via-transparent to-transparent opacity-60" />

              {/* Floating Live Detection Pill Overlay */}
              <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-2 rounded-xl bg-black/75 px-3 py-1.5 text-xs backdrop-blur-md border border-emerald-500/30 text-emerald-300 shadow-lg">
                <span className="h-2 w-2 rounded-full bg-[#10D4A2] animate-pulse" />
                <span>Authentic Provenance (C2PA)</span>
              </div>

              <div className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-2 rounded-xl bg-black/75 px-3 py-1.5 text-xs backdrop-blur-md border border-rose-500/40 text-rose-300 shadow-lg">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                <span>ELA Splice Anomaly Flagged</span>
              </div>
            </div>

            {/* Quick KPI Strip Beneath Hero Graphic */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
              <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-2.5 text-center">
                <div className="text-[10px] text-rose-300 uppercase font-bold tracking-wider">The Asymmetry</div>
                <div className="font-display text-base font-extrabold text-rose-400">2h vs 2 Days</div>
                <div className="text-[9px] text-slate-400">Viral in 2h &bull; Takedown in 2d</div>
              </div>
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-2.5 text-center">
                <div className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">Edge Forensics</div>
                <div className="font-display text-base font-extrabold text-[#10D4A2]">&lt;1.8s Real-Time</div>
                <div className="text-[9px] text-slate-400">Zero-Cloud ELA Heatmap</div>
              </div>
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-2.5 text-center">
                <div className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Cognitive Pause</div>
                <div className="font-display text-base font-extrabold text-amber-300">15s Friction</div>
                <div className="text-[9px] text-slate-400">Drops R₀ Virality by 82%</div>
              </div>
              <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 p-2.5 text-center">
                <div className="text-[10px] text-sky-300 uppercase font-bold tracking-wider">Court Proof</div>
                <div className="font-display text-base font-extrabold text-sky-400">Sec 63 BSA</div>
                <div className="text-[9px] text-slate-400">1-Click 1930 Cyber Cell</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Demo & Funding Pitch Walkthrough Showcase (Video + Step-by-Step Upload Guide) */}
      <section className="relative overflow-hidden rounded-3xl border border-sky-500/25 bg-[#070e28]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Video className="h-4 w-4" />
              <span>25-Second Investor Pitch Trailer &bull; Systems Thesis</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
              Watch 25 Seconds That Break the Deepfake Loop
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Detection alone is dead on arrival. See how TruthLens intercepts synthetic outrage from creation to courtroom.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/truthlens_demo_walkthrough.mp4"
              download="truthlens_product_pitch_walkthrough.mp4"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-sky-400" />
              <span>Download MP4</span>
            </a>
            <button
              onClick={() => onNavigate('solutions')}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition cursor-pointer"
            >
              <Building2 className="h-4 w-4" />
              <span>Explore 6 Domains</span>
            </button>
            <button
              onClick={() => onNavigate('detect')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#10D4A2] px-4 py-2 text-xs font-bold text-[#050919] hover:bg-[#00e8ac] transition shadow-[0_0_15px_rgba(16,212,162,0.3)] cursor-pointer"
            >
              <ScanSearch className="h-4 w-4" />
              <span>Launch Live Forensics</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12 items-center">
          {/* Left Column: Embedded 720p HD Video Player */}
          <div className="lg:col-span-7 space-y-3">
            <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-black shadow-[0_0_35px_rgba(56,189,248,0.2)]">
              <video
                src="/truthlens_demo_walkthrough.mp4"
                poster="/deck/slide1.png"
                controls
                playsInline
                className="w-full aspect-video object-cover"
              />
              <div className="absolute top-3 left-3 pointer-events-none inline-flex items-center gap-1.5 rounded-lg bg-black/80 px-2.5 py-1 text-[11px] font-semibold text-sky-300 border border-sky-500/30 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                <span>25s Full Product Walkthrough</span>
              </div>
              <div className="absolute top-3 right-3 pointer-events-none inline-flex items-center gap-1.5 rounded-lg bg-black/80 px-2.5 py-1 text-[11px] font-semibold text-[#10D4A2] border border-[#10D4A2]/30 backdrop-blur-md">
                <Volume2 className="h-3 w-3 text-[#10D4A2]" />
                <span>Voice Narration (EN-IN)</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1 text-[#10D4A2]">
                <CheckCircle2 className="h-3.5 w-3.5" /> 720p HD Native Render
              </span>
              <span>Audio/Video Forensics &bull; Virality Damper &bull; Section 63 BSA</span>
            </div>
          </div>

          {/* Right Column: 4-Step "How to Upload & Scan" Guide for Pitch Demos */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#10D4A2] flex items-center gap-1.5">
              <UploadCloud className="h-4 w-4" /> Live Pitch Demonstration: How to Upload
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => onNavigate('detect')}
                className="group cursor-pointer rounded-xl border border-white/10 bg-[#050919]/80 p-3 hover:border-[#10D4A2]/50 hover:bg-[#08122f] transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#10D4A2]/15 text-xs font-bold text-[#10D4A2]">
                    1
                  </span>
                  <div className="text-sm font-semibold text-white group-hover:text-[#10D4A2] transition">
                    Drop Image, Paste Link or Audio
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400 pl-8.5">
                  In <span className="text-white font-medium">Detect &amp; Heatmap</span>, drag &amp; drop any suspicious image, click 1-click test presets, or paste a live URL.
                </p>
              </div>

              <div
                onClick={() => onNavigate('detect')}
                className="group cursor-pointer rounded-xl border border-white/10 bg-[#050919]/80 p-3 hover:border-sky-400/50 hover:bg-[#08122f] transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/15 text-xs font-bold text-sky-400">
                    2
                  </span>
                  <div className="text-sm font-semibold text-white group-hover:text-sky-300 transition">
                    Zero-Cloud Error Level Analysis (ELA)
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400 pl-8.5">
                  Computes 64-bit dHash, SHA-256, and pixel recompression anomalies in &lt;2.0s right inside the browser.
                </p>
              </div>

              <div
                onClick={() => onNavigate('dampen')}
                className="group cursor-pointer rounded-xl border border-white/10 bg-[#050919]/80 p-3 hover:border-amber-400/50 hover:bg-[#08122f] transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-xs font-bold text-amber-300">
                    3
                  </span>
                  <div className="text-sm font-semibold text-white group-hover:text-amber-200 transition">
                    15s Cognitive Cooling Virality Dampener
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400 pl-8.5">
                  Simulates 24h harm curve, throttles forward streaks, and reduces R₀ reproduction rate below 1.0.
                </p>
              </div>

              <div
                onClick={() => onNavigate('heal')}
                className="group cursor-pointer rounded-xl border border-white/10 bg-[#050919]/80 p-3 hover:border-rose-400/50 hover:bg-[#08122f] transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/15 text-xs font-bold text-rose-300">
                    4
                  </span>
                  <div className="text-sm font-semibold text-white group-hover:text-rose-200 transition">
                    1-Click Cyber Cell &amp; BSA 63 Certificate
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400 pl-8.5">
                  Generates court-ready Section 63 BSA legal certificate and autofills Cyber Cell (1930 / cybercrime.gov.in) complaint.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Reinforcing Loops (Pitch Slide 2) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> Systems Failure Modes
            </div>
            <h2 className="mt-0.5 font-display text-2xl font-bold text-white">
              The Asymmetry: Why Detection Alone is Dead on Arrival
            </h2>
            <p className="text-sm text-slate-400">
              Deepfakes exploit human fear and algorithmic outrage. If you only detect, you&apos;ve already lost.
            </p>
          </div>
          <span className="hidden sm:inline-flex rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-300">
            Causal Systems Architecture
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: '1. The Outrage Firehose',
              punchline: 'Lies sprint across India in 2 hours while truth is still tying its shoelaces.',
              icon: Flame,
              image: '/reactions/loop1_virality.png',
              alt: 'Reaction: WhatsApp forward storm radiating to groups',
              flow: 'AI Tool → Shocking Fake → Algorithm Boosts → More Shares',
              detail:
                'Outrage-optimized feeds and WhatsApp forwards achieve exponential reach within 2 hours, long before manual platform moderation can respond.',
              accent: 'border-amber-500/35 bg-gradient-to-b from-amber-950/20 to-[#0b1229]/80 shadow-[0_0_25px_rgba(245,158,11,0.1)]',
              badge: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
              iconColor: 'text-amber-400',
              reactionCaption: 'Forwarded 5x+ • Rapid group virality',
            },
            {
              title: '2. The Shame & Silence Spiral',
              punchline: 'Extortionists monetize panic. TruthLens arms victims with instant proof.',
              icon: HeartHandshake,
              image: '/reactions/loop2_mental_health.png',
              alt: 'Reaction: Victim overwhelmed by notifications in distress',
              flow: 'Victim Sees Fake → Anxiety / Shame → Withdrawal → Deeper Harm',
              detail:
                'Women, students, and creators suffer acute psychological trauma and silence while non-consensual morphed content circulates.',
              accent: 'border-rose-500/35 bg-gradient-to-b from-rose-950/20 to-[#0b1229]/80 shadow-[0_0_25px_rgba(244,63,94,0.1)]',
              badge: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
              iconColor: 'text-rose-400',
              reactionCaption: 'Acute distress & panic • Isolation cycle',
            },
            {
              title: '3. The Liar’s Dividend',
              punchline: 'When any video can be faked, genuine crimes get dismissed in court.',
              icon: ShieldAlert,
              image: '/reactions/loop3_trust_collapse.png',
              alt: 'Reaction: Shattered trust shield dividing society and victims',
              flow: 'No One Trusts Media → Real Victims Ignored → Society Divides',
              detail:
                'When synthetic forgery saturates KYC, newsrooms, and courts, both real evidence and institutional trust break down.',
              accent: 'border-sky-500/35 bg-gradient-to-b from-sky-950/20 to-[#0b1229]/80 shadow-[0_0_25px_rgba(56,189,248,0.1)]',
              badge: 'text-sky-300 bg-sky-500/15 border-sky-500/30',
              iconColor: 'text-sky-400',
              reactionCaption: 'Shattered evidence • Institutional polarization',
            },
          ].map((loop) => {
            const Icon = loop.icon;
            return (
              <div
                key={loop.title}
                className={`overflow-hidden rounded-2xl border transition hover:scale-[1.02] duration-200 ${loop.accent}`}
              >
                {/* Visual Graphic Representation */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/50 border-b border-white/10">
                  <img
                    src={loop.image}
                    alt={loop.alt}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1229] via-transparent to-transparent opacity-80" />
                  <span className="absolute bottom-2.5 left-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-300 backdrop-blur-sm border border-white/10">
                    {loop.reactionCaption}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${loop.badge}`}>
                      <Icon className="h-3 w-3" />
                      Reinforcing Loop
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold text-white flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${loop.iconColor}`} />
                    {loop.title}
                  </h3>
                  <div className="mt-1 text-[11px] font-semibold text-slate-300 italic">
                    &ldquo;{loop.punchline}&rdquo;
                  </div>
                  <div className="mt-2.5 rounded-xl bg-black/40 p-2.5 font-mono text-[11px] text-slate-200 border border-white/5">
                    {loop.flow}
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-400">{loop.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Story Explorer: How TruthLens Operates in the Real World */}
      <section className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-[#08102e]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10D4A2]">
              <Sparkles className="h-4 w-4" />
              <span>🔥 From Panic to Justice &bull; 4-Stage Crisis Interceptor</span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
              3 Real-World Attacks. 3 Instant Takedowns.
            </h2>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              See how Priya, Vikram, and Ananya stopped viral blackmail, &rupee;18L CFO audio scams, and election disinformation in under 2 minutes flat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-white/10 bg-[#050919] p-1">
              <button
                onClick={() => setFlowViewMode('story')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  flowViewMode === 'story'
                    ? 'bg-[#10D4A2] text-[#050919]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Swipe Crisis Deck
              </button>
              <button
                onClick={() => setFlowViewMode('diagram')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  flowViewMode === 'diagram'
                    ? 'bg-sky-400 text-[#050919]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Architecture Map
              </button>
            </div>
          </div>
        </div>

        {flowViewMode === 'diagram' ? (
          /* High-Resolution Pipeline Architecture Flowchart Display */
          <div className="space-y-4">
            <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl">
              <img
                src="/reactions/interactive_usecase_flow.png"
                alt="TruthLens End-to-End Forensics and Systems Leverage Pipeline"
                className="w-full object-contain transition group-hover:scale-[1.01] duration-300"
              />
              <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-xl bg-black/80 px-3 py-1.5 text-xs font-semibold text-[#10D4A2] border border-[#10D4A2]/30 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#10D4A2] animate-pulse" />
                <span>4-Stage Causal Intervention Architecture</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4 pt-1">
              <div className="rounded-xl border border-sky-500/20 bg-[#050919] p-3">
                <div className="text-[10px] font-mono text-sky-400 uppercase">Stage 01: Ingestion</div>
                <div className="text-sm font-semibold text-white mt-0.5">&lt; 50ms Sandbox</div>
                <p className="text-xs text-slate-400 mt-1">Zero PII isolation &bull; SHA-256 + 64-bit dHash calculated.</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-[#050919] p-3">
                <div className="text-[10px] font-mono text-[#10D4A2] uppercase">Stage 02: Edge Forensics</div>
                <div className="text-sm font-semibold text-white mt-0.5">&lt; 1.8s ELA Scan</div>
                <p className="text-xs text-slate-400 mt-1">Error Level Analysis heatmap + SciPy 11.2 kHz voice FFT.</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-[#050919] p-3">
                <div className="text-[10px] font-mono text-amber-300 uppercase">Stage 03: Amplification</div>
                <div className="text-sm font-semibold text-white mt-0.5">15s Cooling Friction</div>
                <p className="text-xs text-slate-400 mt-1">R₀ virality reproduction drops from 3.4 to 0.65.</p>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-[#050919] p-3">
                <div className="text-[10px] font-mono text-rose-300 uppercase">Stage 04: Legal Proof</div>
                <div className="text-sm font-semibold text-white mt-0.5">Court Certificate</div>
                <p className="text-xs text-slate-400 mt-1">Section 63 BSA + 1930 Cyber Cell + Sec 67C ISP freeze.</p>
              </div>
            </div>
          </div>
        ) : (
          /* Sleek Card Layout Swipe / Deck Carousel */
          <div className="space-y-6">
            {/* Persona Switcher Tabs */}
            <div className="grid gap-3 sm:grid-cols-3">
              {USE_CASE_STORIES.map((story) => {
                const isSelected = story.id === activeStory.id;
                return (
                  <button
                    key={story.id}
                    onClick={() => {
                      setActiveStoryId(story.id);
                      setActiveStoryStep(0);
                    }}
                    className={`rounded-2xl border p-4 text-left transition duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-[#10D4A2] bg-[#10D4A2]/15 shadow-[0_0_25px_rgba(16,212,162,0.25)] ring-1 ring-[#10D4A2]/50'
                        : 'border-white/10 bg-[#050919]/70 hover:border-white/20 hover:bg-[#07112d]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${story.badgeColor}`}>
                        {story.badge}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {story.location}
                      </span>
                    </div>
                    <div className="mt-2.5 font-display text-base font-bold text-white flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-[#10D4A2]" />
                      {story.persona}
                    </div>
                    <div className="text-xs text-slate-300">{story.role}</div>
                  </button>
                );
              })}
            </div>

            {/* Crisis Incident Context Card */}
            <div className="rounded-2xl border border-white/10 bg-[#050919]/90 p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" /> Real-World Attack Crisis
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">
                    {activeStory.crisisTitle}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {activeStory.crisisDesc}
                  </p>
                </div>
              </div>

              {/* Before vs After Impact Comparison Strip */}
              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-white/10">
                <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                    Without TruthLens (Whack-a-Mole)
                  </div>
                  <p className="mt-1 text-xs text-rose-200/90 leading-relaxed">
                    {activeStory.impactWithout}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#10D4A2]">
                    With TruthLens (Systems Intervention)
                  </div>
                  <p className="mt-1 text-xs text-emerald-200/90 leading-relaxed">
                    {activeStory.impactWith}
                  </p>
                </div>
              </div>
            </div>

            {/* Sleek Card Layout Swipe Deck */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-white">
                    Resolution Card Deck:
                  </span>
                  <span className="text-xs text-slate-400">
                    Step {activeStoryStep + 1} of 4 &bull; {activeStepData.stage}
                  </span>
                </div>

                {/* Swipe / Card Navigation Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-xl border border-white/10">
                    {activeStory.steps.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setActiveStoryStep(dotIdx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          dotIdx === activeStoryStep
                            ? 'w-6 bg-[#10D4A2] shadow-[0_0_8px_rgba(16,212,162,0.6)]'
                            : 'w-2 bg-white/20 hover:bg-white/40'
                        }`}
                        aria-label={`Jump to step ${dotIdx + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveStoryStep((prev) => (prev > 0 ? prev - 1 : 3))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#050919] text-slate-300 hover:text-white hover:border-white/25 transition cursor-pointer"
                      aria-label="Previous Journey Card"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setActiveStoryStep((prev) => (prev < 3 ? prev + 1 : 0))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#10D4A2]/40 bg-[#10D4A2]/15 text-[#10D4A2] hover:bg-[#10D4A2]/25 transition cursor-pointer"
                      aria-label="Next Journey Card"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontally Swipeable Card Deck Track */}
              <div className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar">
                {activeStory.steps.map((st, idx) => {
                  const isCurrent = idx === activeStoryStep;
                  return (
                    <div
                      key={st.num}
                      onClick={() => setActiveStoryStep(idx)}
                      className={`min-w-[280px] sm:min-w-[330px] flex-1 max-w-[380px] flex-shrink-0 snap-center rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer select-none ${
                        isCurrent
                          ? 'border-[#10D4A2] bg-gradient-to-b from-[#0a1c42] to-[#050f29] shadow-[0_0_30px_rgba(16,212,162,0.25)] scale-[1.02] ring-1 ring-[#10D4A2]/50'
                          : 'border-white/10 bg-[#060d24]/75 opacity-75 hover:opacity-100 hover:border-white/25'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${
                            isCurrent
                              ? 'bg-[#10D4A2] text-[#050919] shadow-[0_0_12px_rgba(16,212,162,0.4)]'
                              : 'bg-white/10 text-slate-300'
                          }`}>
                            STEP {st.num}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                            {st.stage}
                          </span>
                        </div>

                        <div>
                          <div className="text-[11px] font-mono text-[#10D4A2] font-semibold">
                            {st.tech}
                          </div>
                          <h4 className="mt-1 font-display text-base font-bold text-white leading-snug">
                            {st.title}
                          </h4>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-300">
                          {st.detail}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#10D4A2]" />
                          Verified
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate(st.targetTab);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-md cursor-pointer ${
                            isCurrent
                              ? 'bg-[#10D4A2] text-[#050919] hover:bg-[#00e8ac] shadow-[0_0_15px_rgba(16,212,162,0.3)]'
                              : 'bg-white/10 text-slate-200 hover:bg-white/20'
                          }`}
                        >
                          <span>{st.cta}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
                <span>👈 Swipe or click cards to step through {activeStory.persona.split(' ')[0]}&apos;s crisis resolution</span>
                <span className="hidden sm:inline">Use Prev/Next buttons for guided walkthrough</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Interactive Donella Meadows Causal Graph & Leverage Points */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10D4A2]">
              <Layers className="h-4 w-4" />
              Donella Meadows Systems Law — Stop Whacking Moles. Change the Structure.
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-white">
              Causal Intervention Graph: Strike at the Source of Virality
            </h2>
          </div>
          <span className="text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            Click any node in the causal chain to inspect TruthLens&apos;s intervention
          </span>
        </div>

        {/* Chain Nodes */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAUSAL_NODES.map((node, idx) => {
            const isSelected = node.id === activeNode.id;
            const Icon = node.icon;
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`group relative flex flex-col items-start overflow-hidden rounded-2xl border text-left transition duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-[#10D4A2] bg-[#10D4A2]/15 shadow-[0_0_25px_rgba(16,212,162,0.3)] scale-[1.02]'
                    : `border-white/10 bg-[#050919]/60 hover:border-white/30 hover:bg-white/[0.04] ${node.glowColor}`
                }`}
              >
                {/* Visual Node Diagram */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40 border-b border-white/10">
                  <img
                    src={node.image}
                    alt={node.label}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050919] via-transparent to-transparent opacity-70" />
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-black/75 backdrop-blur-md px-2 py-0.5 font-mono text-[10px] font-extrabold text-[#10D4A2] border border-[#10D4A2]/30 flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    NODE {node.step}
                  </span>
                  <span className={`absolute top-2.5 right-2.5 rounded-full border px-2 py-0.5 text-[10px] font-bold backdrop-blur-md bg-black/60 ${node.badgeColor}`}>
                    {node.leverage.split(' — ')[0]}
                  </span>
                </div>

                <div className="p-4 w-full">
                  {node.id === AI_RECOMMENDED_NODE && (
                    <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      <Sparkles className="h-3 w-3" />
                      AI PICK • MAX HARM REDUCTION
                    </span>
                  )}
                  <div className="font-display text-base font-bold text-white">
                    {node.label}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{node.sub}</div>
                </div>

                {idx < CAUSAL_NODES.length - 1 && (
                  <ArrowRight className="pointer-events-none absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-slate-500 lg:block z-10" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Node Intervention Detail */}
        <div className="flex flex-col justify-between gap-5 rounded-2xl border border-[#10D4A2]/30 bg-gradient-to-r from-[#07132a] via-[#050919] to-[#07132a] p-5 sm:flex-row sm:items-center shadow-lg">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="rounded-lg bg-[#10D4A2]/20 border border-[#10D4A2]/40 px-2.5 py-1 font-mono text-xs font-bold text-[#10D4A2]">
                {activeNode.leverage}
              </span>
              <span className="font-display text-lg font-bold text-white">
                {activeNode.leverageTitle}
              </span>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-300">{activeNode.leverageDesc}</p>
          </div>
          <button
            onClick={() => onNavigate(activeNode.targetTab)}
            className="btn-neon-emerald shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm cursor-pointer"
          >
            Launch Module
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 6 High-Impact Deployment Verticals */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#10D4A2] flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> 6 Real-World Battlegrounds
            </div>
            <h2 className="mt-0.5 font-display text-2xl font-bold text-white">
              Where Synthetic Media Meets High-Stakes Reality
            </h2>
            <p className="text-sm text-slate-400">
              From WhatsApp student extortion to ₹18L CFO voice clones &mdash; battle-tested policy gates ready for deployment.
            </p>
          </div>
          <button
            onClick={() => onNavigate('solutions')}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-[#10D4A2] hover:bg-white/10 transition cursor-pointer"
          >
            Open All 6 Interactive Playbooks
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {VERTICAL_SUMMARY.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onOpenDomain(item.id)}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0b1229]/80 text-left transition hover:border-[#10D4A2]/50 hover:bg-[#111b3a]/90 hover:scale-[1.02] duration-200 cursor-pointer shadow-lg"
              >
                {/* Visual Domain Thumbnail */}
                <div className="relative aspect-[16/8] w-full overflow-hidden bg-black/40 border-b border-white/10">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1229] via-transparent to-transparent opacity-80" />
                  <div className={`absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-xl bg-black/75 backdrop-blur-md border border-white/15 ${item.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`absolute top-3 right-3 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-md bg-black/60 ${item.badgeBg}`}>
                    {item.tag}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-[#10D4A2] transition">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{item.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 inline-flex items-center gap-2 text-xs font-bold text-[#10D4A2]">
                    Run Live Domain Simulator
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Powered by Google AI + Live Backend Health */}
      <section className="grid gap-6 lg:grid-cols-12">
        {/* Google AI Stack Card */}
        <div className="glass-panel overflow-hidden rounded-3xl lg:col-span-7 flex flex-col justify-between border border-white/10 shadow-2xl">
          {/* Visual Constellation Header Graphic */}
          <div className="relative aspect-[16/6] w-full overflow-hidden bg-black/50 border-b border-white/10">
            <img
              src="/reactions/google_ai_constellation.png"
              alt="Google AI Constellation Architecture: Gemini Multimodal, Nano Banana, Gemini Live, Gemma Edge"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1229] via-transparent to-transparent opacity-80" />
            <div className="absolute top-3 left-4 inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-400 border border-sky-400/30">
              <Brain className="h-4 w-4" />
              Powered by Google AI • asia-south1 DPDP
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-display text-xl font-bold text-white">
                Gemini Detects. Our Systems Engine Understands.
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                Sub-2s edge speed meets multimodal reasoning &mdash; zero cloud egress for user privacy, sovereign to India in asia-south1.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  name: 'Gemini API Multimodal',
                  detail: 'Artifacts, lighting azimuth, face-blend seams & metadata mismatch.',
                  icon: Sparkles,
                  color: 'text-amber-400',
                  badge: 'Cloud Vertex AI',
                },
                {
                  name: 'Nano Banana',
                  detail: 'Creates safe synthetic demo fakes to train users & simulate spread.',
                  icon: ShieldAlert,
                  color: 'text-rose-400',
                  badge: 'Synthetic Engine',
                },
                {
                  name: 'Gemini Live Voice Coach',
                  detail: 'Hindi & English crisis companion — talks victims out of panic.',
                  icon: Radio,
                  color: 'text-sky-400',
                  badge: 'Voice Stream',
                },
                {
                  name: 'Gemma On-Device + Cloud Run',
                  detail: 'Private offline edge checks + Vertex AI, Firestore & BigQuery (asia-south1).',
                  icon: Cpu,
                  color: 'text-[#10D4A2]',
                  badge: 'On-Device Edge',
                },
              ].map((stack) => {
                const Icon = stack.icon;
                return (
                  <div
                    key={stack.name}
                    className="rounded-2xl border border-white/10 bg-[#050919]/70 p-4 transition hover:border-[#10D4A2]/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Icon className={`h-4 w-4 ${stack.color}`} />
                        {stack.name.split(' ')[0]}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        {stack.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{stack.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Telemetry Hub Card */}
        <div className="glass-panel overflow-hidden rounded-3xl lg:col-span-5 flex flex-col justify-between border border-white/10 shadow-2xl">
          {/* Visual Server Rack Graphic */}
          <div className="relative aspect-[16/7] w-full overflow-hidden bg-black/50 border-b border-white/10">
            <img
              src="/reactions/server_telemetry_hub.png"
              alt="TruthLens Live Telemetry Rack and Edge Service Blades"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1229] via-transparent to-transparent opacity-80" />
            <div className="absolute top-3 left-4 inline-flex items-center gap-2 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#10D4A2] border border-[#10D4A2]/30">
              <Activity className="h-4 w-4" />
              Live Edge Telemetry (/health)
            </div>
            <button
              onClick={onRefreshHealth}
              className="absolute top-3 right-4 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/75 backdrop-blur-md px-3 py-1 text-xs text-slate-300 hover:text-white transition cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>

          <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
            <div className="space-y-2 text-xs">
              {[
                { label: 'Redis Cache & Cooling Queue', val: health?.services.redis ?? 'ready' },
                { label: 'Postgres Case & Telemetry DB', val: health?.services.postgres ?? 'ready' },
                { label: 'Qdrant Vector Vault (:6333)', val: health?.services.qdrant ?? 'truthlens_vault' },
                { label: 'Multimodal Edge Workers', val: health?.services.edge_workers ?? 'active' },
                { label: 'OpenWA WhatsApp Gateway', val: health?.services.openwa_gateway ?? 'ready (:2785)' },
              ].map((svc) => (
                <div
                  key={svc.label}
                  className="flex items-center justify-between rounded-xl bg-[#050919]/80 px-3.5 py-2 border border-white/5"
                >
                  <span className="text-slate-300 font-medium">{svc.label}</span>
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] text-[#10D4A2]">
                    <span className="h-2 w-2 rounded-full bg-[#10D4A2] animate-pulse" />
                    {svc.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
              <div className="text-[11px] text-slate-400">
                Team: <span className="text-slate-200 font-semibold">Gaurav Singh &amp; Ankita Sinha</span>
                {apiInfo && <span className="ml-2 font-mono text-[#10D4A2]">v{apiInfo.version}</span>}
              </div>
              <a
                href={`${baseUrl}/download/truthlens.apk`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#10D4A2]/40 bg-[#10D4A2]/15 px-3 py-1.5 text-xs font-bold text-[#10D4A2] hover:bg-[#10D4A2]/25"
              >
                <Download className="h-3.5 w-3.5" />
                {tr.downloadApk}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Video Pitch Modal Player */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-sky-500/40 bg-[#070e28] p-4 sm:p-6 shadow-[0_0_50px_rgba(56,189,248,0.3)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                  <Play className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-white">
                    TruthLens Product Demo Walkthrough
                  </h3>
                  <p className="text-xs text-slate-400">
                    Multimodal Synthetic Media Defense &amp; Counter-Virality Platform
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/truthlens_demo_walkthrough.mp4"
                  download="truthlens_demo_walkthrough.mp4"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <Download className="h-3.5 w-3.5 text-sky-400" />
                  MP4
                </a>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black aspect-video">
              <video
                src="/truthlens_demo_walkthrough.mp4"
                poster="/deck/slide1.png"
                controls
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#10D4A2]" />
                <span>Ready for Live Demos &amp; Pitch Screen Sharing</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    onNavigate('detect');
                  }}
                  className="rounded-lg bg-[#10D4A2] px-3 py-1.5 font-bold text-[#050919] hover:bg-[#00e8ac] transition cursor-pointer"
                >
                  Try Live Upload &amp; Scan
                </button>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    onNavigate('solutions');
                  }}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-semibold text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Explore 6 Domains
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
