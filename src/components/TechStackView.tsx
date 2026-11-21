import React, { useState } from 'react';

interface TechItem {
  name: string;
  category: 'infra' | 'backend' | 'database' | 'ai' | 'frontend';
  categoryLabel: string;
  role: string;
  tier: string;
  logo: React.ReactNode;
}

export const TechStackView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'infra' | 'backend' | 'database' | 'ai' | 'frontend'>('all');

  const STACK: TechItem[] = [
    // 0. TruthLens Core Platform
    {
      name: 'TruthLens Core Platform',
      category: 'frontend',
      categoryLabel: 'Multimodal Middleware System',
      role: 'Unified 3-stage defense pipeline: Edge Forensics -> System.com Virality Throttling -> Court-Ready Legal Shield.',
      tier: 'TruthLens Middleware v2.3.0',
      logo: (
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(16,212,162,0.3)] border border-white/10 bg-[#070e24]">
          <img src="/icon-192.png" alt="TruthLens Logo" className="h-full w-full object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-white flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </span>
        </div>
      ),
    },
    // 1. Hardware & Infrastructure
    {
      name: 'Proxmox VE 9.2.4',
      category: 'infra',
      categoryLabel: 'Bare-Metal Virtualization',
      role: 'Type-1 bare-metal hypervisor managing isolated LXC containers and hardware resource allocation.',
      tier: 'Proxmox Host Node (100.70.108.107)',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#E57000]">
          <path d="M50 5 L88 27 L88 73 L50 95 L12 73 L12 27 Z" fill="#E57000" opacity="0.2"/>
          <path d="M50 15 L78 32 L78 68 L50 85 L22 68 L22 32 Z" fill="#E57000"/>
          <circle cx="50" cy="50" r="14" fill="#0b1229"/>
        </svg>
      ),
    },
    {
      name: 'Debian 12 (Bookworm)',
      category: 'infra',
      categoryLabel: 'Operating System',
      role: 'Production Linux rootfs for host and CT 216 Buildathon container.',
      tier: 'Host & Container OS',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7">
          <circle cx="50" cy="50" r="45" fill="#D70A53" opacity="0.2"/>
          <path d="M50 20 C33 20 20 33 20 50 C20 67 33 80 50 80 C60 80 68 75 73 68 C71 69 68 70 65 70 C54 70 45 61 45 50 C45 39 54 30 65 30 C68 30 71 31 73 32 C68 25 60 20 50 20 Z" fill="#D70A53"/>
        </svg>
      ),
    },
    {
      name: 'Tailscale & WireGuard',
      category: 'infra',
      categoryLabel: 'Zero-Trust Mesh VPN',
      role: 'Peer-to-peer encrypted mesh connecting Pixel local agent, Proxmox hypervisor, and VPS gateway.',
      tier: 'Mesh Network',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-white">
          <circle cx="30" cy="30" r="12" fill="white"/>
          <circle cx="70" cy="30" r="12" fill="white" opacity="0.4"/>
          <circle cx="50" cy="50" r="12" fill="white"/>
          <circle cx="30" cy="70" r="12" fill="white" opacity="0.4"/>
          <circle cx="70" cy="70" r="12" fill="white"/>
        </svg>
      ),
    },
    {
      name: 'Nginx Reverse Proxy',
      category: 'infra',
      categoryLabel: 'Edge Gateway',
      role: 'SSL termination, HTTP/2 proxying, and CORS handling for lens.truthortrust.com on VPS 204.152.193.100.',
      tier: 'Public Edge Gateway',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#009639]">
          <path d="M50 5 L88 27 L88 73 L50 95 L12 73 L12 27 Z" fill="#009639"/>
          <path d="M35 30 L65 70 M35 70 L35 30 M65 70 L65 30" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none"/>
        </svg>
      ),
    },
    {
      name: 'Docker & Compose',
      category: 'infra',
      categoryLabel: 'Container Orchestration',
      role: 'Microservice container runtime running truthlens-backend and companion service isolation.',
      tier: 'Container Runtime (CT 216)',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#2496ED]">
          <rect x="25" y="35" width="12" height="10" rx="2" fill="#2496ED"/>
          <rect x="40" y="35" width="12" height="10" rx="2" fill="#2496ED"/>
          <rect x="55" y="35" width="12" height="10" rx="2" fill="#2496ED"/>
          <rect x="40" y="22" width="12" height="10" rx="2" fill="#2496ED"/>
          <path d="M10 55 C15 50 85 50 90 60 C85 85 25 85 10 55 Z" fill="#2496ED" opacity="0.8"/>
        </svg>
      ),
    },

    // 2. Backend & Forensics
    {
      name: 'Python 3.11 / 3.13',
      category: 'backend',
      categoryLabel: 'Core Language Runtime',
      role: 'Primary runtime for mathematical, cryptographic, audio, and visual forensic analysis engines.',
      tier: 'Backend Runtime',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7">
          <path d="M50 10 C30 10 25 20 25 30 L25 40 L50 40 L50 45 L15 45 C5 45 5 60 15 65 L20 65 L20 55 C20 45 30 45 40 45 L65 45 C75 45 75 35 75 25 C75 10 65 10 50 10 Z" fill="#3776AB"/>
          <path d="M50 90 C70 90 75 80 75 70 L75 60 L50 60 L50 55 L85 55 C95 55 95 40 85 35 L80 35 L80 45 C80 55 70 55 60 55 L35 55 C25 55 25 65 25 75 C25 90 35 90 50 90 Z" fill="#FFD43B"/>
        </svg>
      ),
    },
    {
      name: 'FastAPI (ASGI)',
      category: 'backend',
      categoryLabel: 'REST API Framework',
      role: 'High-throughput async endpoints for file streaming, ELA generation, and legal dossier compilation.',
      tier: 'Web Framework',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#05998B]">
          <circle cx="50" cy="50" r="45" fill="#05998B"/>
          <path d="M48 20 L25 55 L45 55 L42 80 L75 42 L52 42 Z" fill="white"/>
        </svg>
      ),
    },
    {
      name: 'SciPy (FFT / DSP)',
      category: 'backend',
      categoryLabel: 'Audio DSP Engine',
      role: 'Fast Fourier Transform spectral analysis detecting 11.2 kHz vocoder cutoff in voice notes.',
      tier: 'Audio Forensics',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#0054A6]">
          <path d="M15 50 Q 32 15 50 50 T 85 50" stroke="#0054A6" strokeWidth="10" fill="none" strokeLinecap="round"/>
          <circle cx="50" cy="50" r="10" fill="#0054A6"/>
        </svg>
      ),
    },
    {
      name: 'Pillow (PIL) & OpenCV',
      category: 'backend',
      categoryLabel: 'Computer Vision',
      role: 'JPEG quantization residual extraction for Error Level Analysis and watermark boundary scanning.',
      tier: 'Image Forensics',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7">
          <circle cx="35" cy="35" r="20" fill="#ED1C24" opacity="0.8"/>
          <circle cx="65" cy="35" r="20" fill="#00AEEF" opacity="0.8"/>
          <circle cx="50" cy="65" r="20" fill="#8DC63F" opacity="0.8"/>
        </svg>
      ),
    },
    {
      name: 'ImageHash (dHash)',
      category: 'backend',
      categoryLabel: 'Perceptual Hashing',
      role: '64-bit gradient difference hashing for re-compression and aspect-ratio resistant fingerprinting.',
      tier: 'Provenance Cryptography',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 stroke-sky-400 stroke-2 fill-none">
          <rect x="20" y="20" width="60" height="60" rx="8" stroke="currentColor" strokeWidth="6"/>
          <path d="M35 50 L45 60 L65 40" stroke="#10D4A2" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      name: 'C2PA & IPTC Standards',
      category: 'backend',
      categoryLabel: 'Content Authenticity',
      role: 'Parsing digital manifest claims, cryptographically signed metadata, and generative AI tags.',
      tier: 'Standard Provenance',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-amber-400">
          <path d="M50 15 L80 30 L80 70 L50 85 L20 70 L20 30 Z" fill="none" stroke="#F59E0B" strokeWidth="6"/>
          <circle cx="50" cy="50" r="15" fill="#F59E0B"/>
        </svg>
      ),
    },

    // 3. Databases & Vector Storage
    {
      name: 'Qdrant Vector DB',
      category: 'database',
      categoryLabel: 'Vector Similarity Engine',
      role: 'Sub-millisecond perceptual hash similarity search (Hamming distance) in truthlens_vault collection.',
      tier: 'Vector Database (:6333)',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#DC2626]">
          <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="#DC2626"/>
          <circle cx="50" cy="50" r="16" fill="white"/>
        </svg>
      ),
    },
    {
      name: 'PostgreSQL 16',
      category: 'database',
      categoryLabel: 'Relational Database',
      role: 'Court-admissible Section 63 BSA evidence storage, custody hash logs, and victim cases.',
      tier: 'Relational Database (:5432)',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#336791]">
          <circle cx="50" cy="50" r="45" fill="#336791"/>
          <ellipse cx="50" cy="50" rx="28" ry="18" fill="white" opacity="0.3"/>
          <circle cx="40" cy="45" r="5" fill="white"/>
          <circle cx="60" cy="45" r="5" fill="white"/>
        </svg>
      ),
    },
    {
      name: 'Redis 7',
      category: 'database',
      categoryLabel: 'In-Memory Cache',
      role: 'Pre-share cooling queue buffer, rate limiting, and 24-hour simulation token caching.',
      tier: 'In-Memory Cache (:6379)',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#D82C20]">
          <path d="M50 15 L85 32 L50 50 L15 32 Z" fill="#D82C20"/>
          <path d="M15 42 L50 60 L85 42 L85 52 L50 70 L15 52 Z" fill="#D82C20" opacity="0.8"/>
          <path d="M15 62 L50 80 L85 62 L85 72 L50 90 L15 72 Z" fill="#D82C20" opacity="0.6"/>
        </svg>
      ),
    },

    // 4. AI & Systems Science
    {
      name: 'Google Gemini 2.5 Flash',
      category: 'ai',
      categoryLabel: 'Multimodal AI Reasoning',
      role: 'Inspects image seams, synthetic texture artifacts, and conducts nuanced fact-checking on forwarded claims.',
      tier: 'Google Gemini API',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7">
          <path d="M50 10 C50 32 68 50 90 50 C68 50 50 68 50 90 C50 68 32 50 10 50 C32 50 50 32 50 10 Z" fill="url(#gemini-grad)"/>
          <defs>
            <linearGradient id="gemini-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4285F4"/>
              <stop offset="50%" stopColor="#9B72CB"/>
              <stop offset="100%" stopColor="#D96570"/>
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      name: 'System.com Public Graph API',
      category: 'ai',
      categoryLabel: 'Causal Systems Science',
      role: 'Empirically grounds detected threats to causal concepts: Misinformation (0fazMvEU0I), Panic (_kuR2Q_mGJ), Trust (EFzegW3LNu).',
      tier: 'public-api.system.com/v1',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#10D4A2]">
          <circle cx="50" cy="50" r="45" fill="#08182B" stroke="#10D4A2" strokeWidth="4"/>
          <circle cx="35" cy="40" r="10" fill="#10D4A2"/>
          <circle cx="68" cy="35" r="7" fill="#10D4A2" opacity="0.7"/>
          <circle cx="55" cy="70" r="12" fill="#10D4A2"/>
          <line x1="35" y1="40" x2="68" y2="35" stroke="#10D4A2" strokeWidth="3"/>
          <line x1="35" y1="40" x2="55" y2="70" stroke="#10D4A2" strokeWidth="3"/>
        </svg>
      ),
    },

    // 5. Frontend & Edge Delivery
    {
      name: 'React 19 & TypeScript',
      category: 'frontend',
      categoryLabel: 'Client Framework',
      role: 'Strictly typed interactive interface with real-time custody chain handoff and responsive UI.',
      tier: 'Frontend Architecture',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#61DAFB]">
          <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#61DAFB" strokeWidth="5" transform="rotate(30 50 50)"/>
          <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#61DAFB" strokeWidth="5" transform="rotate(90 50 50)"/>
          <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#61DAFB" strokeWidth="5" transform="rotate(150 50 50)"/>
          <circle cx="50" cy="50" r="8" fill="#61DAFB"/>
        </svg>
      ),
    },
    {
      name: 'Vite 6',
      category: 'frontend',
      categoryLabel: 'Build Tooling & Bundler',
      role: 'Ultra-fast HMR and minified production rollup packaging assets in under 5.5s.',
      tier: 'Build Engine',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7">
          <path d="M50 10 L88 28 L50 92 L12 28 Z" fill="#646CFF"/>
          <path d="M52 20 L30 52 L48 52 L42 80 L70 42 L52 42 Z" fill="#FFD427"/>
        </svg>
      ),
    },
    {
      name: 'Tailwind CSS',
      category: 'frontend',
      categoryLabel: 'Design System',
      role: 'Utility-first dark-mode styling with high-contrast forensic telemetry formatting.',
      tier: 'UI Styling',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#38BDF8]">
          <path d="M25 45 C30 35 40 33 48 38 C54 42 58 46 64 46 C70 46 76 40 78 35 C74 45 66 49 58 45 C52 41 48 37 42 37 C34 37 28 42 25 45 Z" fill="#38BDF8"/>
          <path d="M10 65 C15 55 25 53 33 58 C39 62 43 66 49 66 C55 66 61 60 63 55 C59 65 51 69 43 65 C37 61 33 57 27 57 C19 57 13 62 10 65 Z" fill="#38BDF8"/>
        </svg>
      ),
    },
    {
      name: 'Recharts',
      category: 'frontend',
      categoryLabel: 'Data Visualization',
      role: 'Interactive SVG rendering for 24-hour stock-and-flow virality curves and acoustic frequency bins.',
      tier: 'Visualization Engine',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7">
          <rect x="15" y="55" width="16" height="30" rx="3" fill="#10D4A2"/>
          <rect x="42" y="30" width="16" height="55" rx="3" fill="#38BDF8"/>
          <rect x="69" y="15" width="16" height="70" rx="3" fill="#F43F5E"/>
        </svg>
      ),
    },
    {
      name: 'PWA WebAPK & Service Worker',
      category: 'frontend',
      categoryLabel: 'Mobile App Architecture',
      role: 'Web Share Target API receiver, offline UI cache, and standalone Android launcher minting.',
      tier: 'Progressive Web App',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#5A0FC8]">
          <circle cx="50" cy="50" r="45" fill="#5A0FC8"/>
          <path d="M30 45 L50 25 L70 45 M50 25 L50 75" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      ),
    },
    {
      name: 'Vercel Edge Mirror',
      category: 'frontend',
      categoryLabel: 'Global CDN & Mirror',
      role: 'Zero-configuration global edge proxy at truth-lens-lac-delta.vercel.app with automatic Git deploys.',
      tier: 'Edge Mirror Deployment',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-white">
          <path d="M50 15 L90 85 L10 85 Z" fill="white"/>
        </svg>
      ),
    },
    {
      name: 'Umami Analytics',
      category: 'infra',
      categoryLabel: 'Privacy Telemetry',
      role: 'Self-hosted, GDPR/DPDP-compliant privacy telemetry capturing pre-share friction and user abandonment.',
      tier: 'CT 213 (analytics.a31:3005)',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 fill-[#10D4A2]">
          <circle cx="50" cy="50" r="45" fill="#111827"/>
          <circle cx="50" cy="50" r="28" fill="#10D4A2"/>
          <circle cx="50" cy="50" r="14" fill="#111827"/>
        </svg>
      ),
    },
    {
      name: 'Beszel Systems Hub',
      category: 'infra',
      categoryLabel: 'Resource Monitoring',
      role: 'Lightweight agent streaming host/container CPU, RAM, and disk IOPS metrics.',
      tier: 'CT 213 (beszel.a31:8090)',
      logo: (
        <svg viewBox="0 0 100 100" className="h-7 w-7 stroke-amber-400 stroke-2 fill-none">
          <circle cx="50" cy="50" r="45" fill="#18181B"/>
          <path d="M25 60 L40 40 L60 65 L75 35" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  const filteredItems = filter === 'all' ? STACK : STACK.filter((item) => item.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(16,212,162,0.3)] border border-white/10 bg-[#070e24]">
          <img src="/icon-192.png" alt="TruthLens Logo" className="h-full w-full object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white flex items-center justify-center shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <span className="material-symbols-rounded notranslate text-base align-middle" translate="no">layers</span>
            <span>Full Architecture Directory</span>
          </div>
          <h2 className="mt-0.5 font-display text-2xl font-bold text-white sm:text-3xl">
            Technology &amp; Infrastructure Stack
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-300">
            From bare-metal Proxmox hypervisor to edge multimodal forensics and court-proof legal dossier.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: 'all' as const, label: `All Tools (${STACK.length})` },
          { id: 'infra' as const, label: 'Hardware & Infrastructure' },
          { id: 'backend' as const, label: 'Backend & Forensics' },
          { id: 'database' as const, label: 'Databases & Memory' },
          { id: 'ai' as const, label: 'AI & Systems Science' },
          { id: 'frontend' as const, label: 'Frontend & Edge' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              filter === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stack Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.name}
            className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#081226]/85 p-4.5 hover:border-emerald-500/40 hover:bg-[#0c1836] transition-all shadow-md"
          >
            <div className="space-y-3">
              {/* Top row: Logo + Tier pill */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/50 border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                  {item.logo}
                </div>
                <span className="font-mono text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md truncate max-w-[190px]">
                  {item.tier}
                </span>
              </div>

              {/* Title & Category */}
              <div>
                <h3 className="font-display text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {item.name}
                </h3>
                <div className="text-[11px] font-mono text-emerald-400 font-medium">
                  {item.categoryLabel}
                </div>
              </div>

              {/* Role */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.role}
              </p>
            </div>

            {/* Bottom active badge */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10.5px]">
              <span className="inline-flex items-center gap-1.5 text-slate-400 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Production Live
              </span>
              <span className="text-slate-500 font-mono text-[10px]">
                TruthLens Core
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
