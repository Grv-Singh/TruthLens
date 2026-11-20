import React from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Gavel,
  Landmark,
  Newspaper,
  ShieldCheck,
  ShoppingBag,
  Users,
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

      {/* Active Vertical Detail */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-6 space-y-5">
        <div>
          <h3 className="font-display text-xl font-bold text-white">{active.title}</h3>
          <p className="mt-1 text-sm text-slate-300">{active.tagline}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
};
