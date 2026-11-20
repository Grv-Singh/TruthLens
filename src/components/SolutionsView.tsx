import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  Gavel,
  Landmark,
  Newspaper,
  PhoneCall,
  Radio,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Users,
  Video,
} from 'lucide-react';
import type { DomainId, NavTab } from '../types/truthlens';

interface SolutionsViewProps {
  selectedDomain: DomainId;
  onSelectDomain: (d: DomainId) => void;
  onLaunchPresetInForensics: (presetId: string) => void;
  onNavigate: (tab: NavTab) => void;
}

interface DomainConfig {
  id: DomainId;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  pillars: { title: string; detail: string }[];
  apisUsed: string[];
  actionLabel: string;
  actionTarget: { type: 'preset'; presetId: string } | { type: 'tab'; tab: NavTab };
}

const DOMAINS: DomainConfig[] = [
  {
    id: 'fintech',
    title: '1. Fintech, Banking & Remote KYC Onboarding',
    shortTitle: 'Fintech & KYC',
    icon: Landmark,
    tagline:
      'Stop synthetic identity onboarding, virtual-camera injection, and call-center voice cloning on high-value wire transfers.',
    pillars: [
      {
        title: 'Synthetic Identity & Deepfake KYC Defense',
        detail:
          'Blocks face-swapped selfies, AI-generated PAN/Aadhaar documents, and virtual-camera media injection during passive liveness checks using ELA boundary analysis + SynthID + Qdrant duplicate face hashing.',
      },
      {
        title: 'High-Value Transaction & Call Center Authentication',
        detail:
          'Flags real-time AI voice cloning (11.2 kHz vocoder shelf cutoff & glottal kurtosis) or live video impersonation during wire transfers, SIM swaps, and account recovery calls.',
      },
    ],
    apisUsed: ['POST /api/detect', 'POST /api/detect/audio', 'POST /api/vault/verify'],
    actionLabel: 'Test Live KYC Face-Swap Injection in Forensics',
    actionTarget: { type: 'preset', presetId: 'kyc-faceswap' },
  },
  {
    id: 'social',
    title: '2. Social Media, Messaging & Consumer Wellbeing Platforms',
    shortTitle: 'Social & Wellbeing',
    icon: Users,
    tagline:
      'Pre-share deepfake labeling, outrage-bait exposure cool-downs, and coordinated astroturfing bot suppression.',
    pillars: [
      {
        title: 'Viral Misinformation & Deepfake Labeling',
        detail:
          'Scans uploaded videos, images, and voice notes before viral amplification — separating malicious impersonations from benign AI-assisted creative edits.',
      },
      {
        title: 'Outrage-Bait Throttling & Digital Wellbeing Guardrails',
        detail:
          'Detects consecutive exposure streaks to sensationalized, rage-inducing, or manipulated feeds and triggers 15s cognitive cool-downs or context overlays to protect mental health.',
      },
      {
        title: 'Coordinated Bot & Astroturfing Suppression',
        detail:
          'Combines media forgery scores with account verification status to downrank coordinated synthetic campaigns during breaking news or elections.',
      },
    ],
    apisUsed: [
      'POST /api/amplify/pre-share-check',
      'POST /api/simulate',
      'POST /api/debunk/sticker-card',
    ],
    actionLabel: 'Open Virality Cooling & Wellbeing Guardrails (L2)',
    actionTarget: { type: 'tab', tab: 'dampen' },
  },
  {
    id: 'enterprise',
    title: '3. Enterprise Security & Remote Hiring',
    shortTitle: 'Enterprise & Hiring',
    icon: Building2,
    tagline:
      'Protect C-suite video conferences against BEC 2.0 impersonation and eliminate proxy-candidate face-swap interview fraud.',
    pillars: [
      {
        title: 'Executive Impersonation Protection (BEC 2.0)',
        detail:
          'Monitors live Zoom, Google Meet, and Teams streams to alert finance and IT teams if an attacker joins as a real-time deepfake of a CFO/CEO requesting urgent transfers or credential resets.',
      },
      {
        title: 'Remote Interview & Candidate Verification',
        detail:
          'Prevents proxy candidate fraud where applicants deploy real-time face-swap overlays or off-screen AI/human prompting during technical interviews.',
      },
    ],
    apisUsed: ['POST /api/detect', 'POST /api/detect/audio', 'GET /api/amplify/telemetry'],
    actionLabel: 'Analyze CFO Voice Clone & ELA Artifacts',
    actionTarget: { type: 'tab', tab: 'detect' },
  },
  {
    id: 'journalism',
    title: '4. Journalism, Newsrooms & Civic Integrity',
    shortTitle: 'Newsrooms & Civic',
    icon: Newspaper,
    tagline:
      'Rapid breaking-news UGC provenance verification and election/public-figure deepfake defense before broadcast.',
    pillars: [
      {
        title: 'Breaking News UGC Verification',
        detail:
          'Equips investigative desks and fact-checkers with sub-2-second ELA heatmaps, C2PA camera signatures, SynthID checks, and Qdrant archive matching on warzone, disaster, or political clips.',
      },
      {
        title: 'Election & Public Figure Protection',
        detail:
          'Rapidly detects fabricated political speeches, manipulated campaign ads, and non-consensual synthetic defamation — emitting instant WhatsApp debunk cards.',
      },
    ],
    apisUsed: ['POST /api/detect', 'POST /api/detect/watermark', 'POST /api/debunk/sticker-card'],
    actionLabel: 'Inspect Breaking Viral Election Clip in Forensics',
    actionTarget: { type: 'preset', presetId: 'election-deepfake' },
  },
  {
    id: 'commerce',
    title: '5. E-Commerce, Insurance & Gig Marketplaces',
    shortTitle: 'Commerce & Gig',
    icon: ShoppingBag,
    tagline:
      'Catch AI-tampered refund/insurance damage photos and run low-friction driver & seller identity re-verification.',
    pillars: [
      {
        title: 'Fraudulent Claims & Refund Abuse',
        detail:
          'Detects AI-generated or inpainted cracks, dents, and staged damage submitted as fake "proof" of damaged deliveries in e-commerce or fraudulent vehicle/property insurance claims.',
      },
      {
        title: 'Driver & Seller Re-Verification',
        detail:
          'Runs fast, low-friction liveness and Qdrant perceptual dHash verification on ride-share, delivery, and marketplace platforms to ensure the active operator matches the verified identity on file.',
      },
    ],
    apisUsed: ['POST /api/detect', 'POST /api/vault/register', 'POST /api/vault/verify'],
    actionLabel: 'Inspect Tampered Delivery Claim Proof in Forensics',
    actionTarget: { type: 'preset', presetId: 'damage-claim' },
  },
  {
    id: 'legal',
    title: '6. Legal, Compliance & Digital Forensics',
    shortTitle: 'Legal & Compliance',
    icon: Gavel,
    tagline:
      'Auditable evidentiary chain-of-custody validation, Section 63 BSA certificates, Sec 67C preservation, and Rule 3(2)(b) takedowns.',
    pillars: [
      {
        title: 'Evidentiary Chain-of-Custody Validation',
        detail:
          'Assists legal teams, courts, and cybercrime investigators in auditing submitted audio/video recordings for post-capture tampering or generative synthesis with cryptographic SHA-256 + 64-bit dHash sealing.',
      },
      {
        title: 'Statutory Indian Cyber Relief Automation',
        detail:
          'One-click generation of Section 63 BSA 2023 electronic certificates, Section 67C IT Act / Sec 94 BNSS ISP CGNAT & Cell Tower preservation notices, and Rule 3(2)(b) 24-hour intermediary takedowns.',
      },
    ],
    apisUsed: ['POST /api/legal/evidence-dossier', 'POST /api/takedown/generate', 'POST /api/vault/verify'],
    actionLabel: 'Open BSA 63 Dossier & 24h Takedown Suite',
    actionTarget: { type: 'tab', tab: 'heal' },
  },
];

export const SolutionsView: React.FC<SolutionsViewProps> = ({
  selectedDomain,
  onSelectDomain,
  onLaunchPresetInForensics,
  onNavigate,
}) => {
  const active = DOMAINS.find((d) => d.id === selectedDomain) ?? DOMAINS[0];

  // Interactive domain mini-simulator controls
  const [kycVirtualCam, setKycVirtualCam] = useState(true);
  const [wireAmountCr, setWireAmountCr] = useState(1.8);
  const [becFaceSyncMs, setBecFaceSyncMs] = useState(145);
  const [interviewGazeDrift, setInterviewGazeDrift] = useState(68);
  const [ugcHasC2pa, setUgcHasC2pa] = useState(false);
  const [gigHammingDist, setGigHammingDist] = useState(4);

  const handleAction = () => {
    if (active.actionTarget.type === 'preset') {
      onLaunchPresetInForensics(active.actionTarget.presetId);
    } else {
      onNavigate(active.actionTarget.tab);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#10D4A2]">
          <ShieldCheck className="h-4 w-4" />
          Multi-Industry Deployment Matrix • Real-Time Forensics, Liveness &amp; Content Hygiene
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-white">
          6 High-Impact Enterprise &amp; Civic Deployment Verticals
        </h2>
      </div>

      {/* Domain Selector Pills */}
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {DOMAINS.map((d) => {
          const Icon = d.icon;
          const isSelected = d.id === active.id;
          return (
            <button
              key={d.id}
              onClick={() => onSelectDomain(d.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                isSelected
                  ? 'border-[#10D4A2] bg-[#10D4A2]/15 text-white'
                  : 'border-white/10 bg-[#0b1229]/80 text-slate-300 hover:border-white/25'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#10D4A2]' : 'text-slate-400'}`} />
              <span className="truncate">{d.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Active Vertical Detail + Live Domain Guardrail Console */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Capabilities & API Wiring */}
        <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-6 lg:col-span-7 space-y-5">
          <div>
            <h3 className="font-display text-xl font-bold text-white">{active.title}</h3>
            <p className="mt-1 text-sm text-slate-300">{active.tagline}</p>
          </div>

          <div className="space-y-3">
            {active.pillars.map((p) => (
              <div
                key={p.title}
                className="rounded-xl border border-white/8 bg-[#050919]/75 p-4"
              >
                <div className="flex items-center gap-2 font-display text-sm font-bold text-[#10D4A2]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {p.title}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{p.detail}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="flex flex-wrap gap-1.5">
              {active.apisUsed.map((api) => (
                <code
                  key={api}
                  className="rounded-md border border-[#10D4A2]/25 bg-[#10D4A2]/10 px-2 py-1 text-[11px] text-[#10D4A2]"
                >
                  {api}
                </code>
              ))}
            </div>
            <button
              onClick={handleAction}
              className="inline-flex items-center gap-2 rounded-xl bg-[#10D4A2] px-4 py-2.5 text-xs font-bold text-[#050919] hover:bg-[#00e8ac] cursor-pointer"
            >
              {active.actionLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Live Interactive Domain Telemetry Sandbox */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#101a38] to-[#070d20] p-5 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Live Policy Gate Simulator
            </span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-200">
              REAL-TIME SDK
            </span>
          </div>

          {active.id === 'fintech' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-white/10 bg-[#050919]/80 p-4 space-y-3">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span className="flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-sky-400" />
                    Remote KYC Passive Liveness Check
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={kycVirtualCam}
                      onChange={(e) => setKycVirtualCam(e.target.checked)}
                      className="accent-rose-500"
                    />
                    Inject OBS Virtual-Cam
                  </label>
                </div>
                <div
                  className={`rounded-lg p-3 font-mono text-[11px] ${
                    kycVirtualCam
                      ? 'bg-rose-500/15 text-rose-200 border border-rose-500/35'
                      : 'bg-[#10D4A2]/15 text-[#10D4A2] border border-[#10D4A2]/35'
                  }`}
                >
                  {kycVirtualCam
                    ? 'BLOCKED: Virtual-camera frame injection + facial splice ELA delta (91/100). Account onboarding halted.'
                    : 'PASSED: Hardware sensor noise verified + natural micro-saccades + C2PA intact.'}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#050919]/80 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <PhoneCall className="h-4 w-4 text-amber-400" />
                    Call-Center Wire Transfer Gate
                  </span>
                  <span className="font-mono text-amber-300">₹{wireAmountCr.toFixed(1)} Cr</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={5.0}
                  step={0.1}
                  value={wireAmountCr}
                  onChange={(e) => setWireAmountCr(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
                <div className="text-[11px] text-slate-300">
                  {wireAmountCr >= 1.0
                    ? 'High-Risk Threshold: Mandatory SciPy 11.2 kHz Voice-Clone FFT + Secondary Hardware Token active.'
                    : 'Standard Threshold: Passive voice glottal kurtosis monitor running silently.'}
                </div>
              </div>
            </div>
          )}

          {active.id === 'social' && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-[#10D4A2]/30 bg-[#10D4A2]/10 p-4 space-y-1.5">
                <div className="font-bold text-[#10D4A2]">Benign Edit vs. Malicious Deepfake</div>
                <p className="text-slate-200">
                  TruthLens separates creative filters / satire (labeled softly with C2PA) from
                  non-consensual impersonation or financial scams (hard 15s cognitive cooling +
                  WhatsApp debunk sticker).
                </p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1.5">
                <div className="font-bold text-amber-300">Wellbeing &amp; Bot Suppression Live</div>
                <p className="text-slate-200">
                  Exposure streak detector pauses auto-play after 4 consecutive outrage-bait clips,
                  while coordinated bot clusters with low account trust are downranked 90%.
                </p>
              </div>
            </div>
          )}

          {active.id === 'enterprise' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-white/10 bg-[#050919]/80 p-4 space-y-2.5">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span className="flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-rose-400" />
                    Zoom/Meet BEC 2.0 Audio-Lip Drift
                  </span>
                  <span className="font-mono text-rose-300">{becFaceSyncMs} ms</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={240}
                  value={becFaceSyncMs}
                  onChange={(e) => setBecFaceSyncMs(Number(e.target.value))}
                  className="w-full accent-rose-400"
                />
                <div
                  className={`rounded-lg p-2.5 font-mono text-[11px] ${
                    becFaceSyncMs > 90
                      ? 'bg-rose-500/15 text-rose-200'
                      : 'bg-[#10D4A2]/15 text-[#10D4A2]'
                  }`}
                >
                  {becFaceSyncMs > 90
                    ? 'BEC 2.0 ALERT: Real-time face-swap rendering lag detected on CFO feed! Freeze urgent wire request.'
                    : 'CALL AUTHENTIC: Sub-90ms organic audiovisual sync.'}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#050919]/80 p-4 space-y-2.5">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>Proxy Interview Gaze / Prompting Anomaly</span>
                  <span className="font-mono text-amber-300">{interviewGazeDrift}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={95}
                  value={interviewGazeDrift}
                  onChange={(e) => setInterviewGazeDrift(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
                <div className="text-[11px] text-slate-300">
                  {interviewGazeDrift > 55
                    ? 'Flagged for Recruiter: High off-screen prompting / overlay jitter correlation.'
                    : 'Candidate behavioral telemetry within normal technical interview bounds.'}
                </div>
              </div>
            </div>
          )}

          {active.id === 'journalism' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-white/10 bg-[#050919]/80 p-4 space-y-3">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span className="flex items-center gap-1.5">
                    <Radio className="h-4 w-4 text-sky-400" />
                    Newsroom Broadcast Readiness Gate
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-[11px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ugcHasC2pa}
                      onChange={(e) => setUgcHasC2pa(e.target.checked)}
                      className="accent-[#10D4A2]"
                    />
                    C2PA Camera Signed
                  </label>
                </div>
                <div
                  className={`rounded-lg p-3 font-mono text-[11px] ${
                    ugcHasC2pa
                      ? 'bg-[#10D4A2]/15 text-[#10D4A2]'
                      : 'bg-amber-500/15 text-amber-200'
                  }`}
                >
                  {ugcHasC2pa
                    ? 'CLEARED FOR AIR: Hardware C2PA provenance intact + ELA noise uniform + zero SynthID.'
                    : 'HOLD BROADCAST: Stripped metadata on breaking UGC — route to Desk ELA + 11.2 kHz audio verification.'}
                </div>
              </div>
            </div>
          )}

          {active.id === 'commerce' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-white/10 bg-[#050919]/80 p-4 space-y-2.5">
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>Gig Driver Re-Verification (Qdrant dHash)</span>
                  <span className="font-mono text-[#10D4A2]">Hamming d = {gigHammingDist}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={gigHammingDist}
                  onChange={(e) => setGigHammingDist(Number(e.target.value))}
                  className="w-full accent-[#10D4A2]"
                />
                <div
                  className={`rounded-lg p-3 font-mono text-[11px] ${
                    gigHammingDist <= 10
                      ? 'bg-[#10D4A2]/15 text-[#10D4A2]'
                      : 'bg-rose-500/15 text-rose-200'
                  }`}
                >
                  {gigHammingDist <= 10
                    ? `VERIFIED OPERATOR (d=${gigHammingDist} ≤ 10): Shift unlocked in 340ms with zero friction.`
                    : `ACCOUNT SHARING / SPOOF ALERT (d=${gigHammingDist} > 10): Require live challenge re-KYC.`}
                </div>
              </div>
            </div>
          )}

          {active.id === 'legal' && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-300">
                  <ShieldAlert className="h-4 w-4" />
                  Admissible Chain-of-Custody Validation
                </div>
                <p className="text-slate-200">
                  Every scan binds SHA-256 + 64-bit dHash + UTC timestamp directly into a Section 63
                  BSA 2023 certificate, Section 67C IT Act / Sec 94 BNSS ISP CGNAT preservation
                  order, and Rule 3(2)(b) 24-hour intermediary removal notice.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#050919]/80 p-3 flex items-center gap-2 text-slate-300">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                Zero-cloud edge preservation ensures exhibits are hashed before any upload.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
