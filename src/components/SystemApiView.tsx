import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  Play,
  Server,
  Terminal,
  Wifi,
} from 'lucide-react';
import type { ExecutionMode } from '../types/truthlens';
import type { TruthLensClient } from '../lib/api';

interface SystemApiViewProps {
  client: TruthLensClient;
  baseUrl: string;
  mode: ExecutionMode;
  onChangeBaseUrl: (url: string) => void;
  onChangeMode: (m: ExecutionMode) => void;
}

const ENDPOINT_GROUPS = [
  {
    category: '1. System & Mobile App Delivery',
    endpoints: [
      { method: 'GET', path: '/demo', desc: 'Mobile-first PWA Web Interface with Material 3 bottom navigation and offline shell.' },
      { method: 'GET', path: '/download/truthlens.apk', desc: 'Direct download of compiled and signed Android APK (v1.0.0).' },
      { method: 'GET', path: '/manifest.json', desc: 'PWA web manifest defining standalone Android launch properties.' },
      { method: 'GET', path: '/sw.js', desc: 'Service worker caching core UI shell for instant offline loading.' },
      { method: 'GET', path: '/health', desc: 'System healthcheck confirming Redis, Postgres, and edge workers status.' },
      { method: 'GET', path: '/api/info', desc: 'Returns systems leverage points, supported modalities, and active architecture.' },
    ],
  },
  {
    category: '2. Multimodal Edge Forensics (Zero Cloud Costs)',
    endpoints: [
      { method: 'POST', path: '/api/detect', desc: 'Multipart file. Runs Error Level Analysis (ELA) heatmap + 64-bit dHash.' },
      { method: 'POST', path: '/api/detect/watermark', desc: 'Multipart file. Checks Google SynthID, C2PA manifest, and IPTC AI metadata.' },
      { method: 'POST', path: '/api/detect/audio', desc: 'Multipart voice note (.opus/.wav/.mp3). SciPy FFT vocoder shelf cutoff (11.2 kHz), glottal pulse kurtosis/skewness, crest factor, waveform.' },
    ],
  },
  {
    category: '3. Origin Derivative Vault (Qdrant Vector DB)',
    endpoints: [
      { method: 'POST', path: '/api/vault/register', desc: 'Multipart file + owner_id + title. Registers SHA-256 and 64-bit dHash vector in Qdrant collection truthlens_vault.' },
      { method: 'POST', path: '/api/vault/verify', desc: 'Multipart file. Computes perceptual hash and queries Qdrant for derivative matches within Hamming distance ≤ 10.' },
    ],
  },
  {
    category: '4. Virality Damping & Cognitive Cooling',
    endpoints: [
      { method: 'POST', path: '/api/amplify/pre-share-check', desc: 'JSON: chat_id, message_text, forward_count, has_media, media_hash. Evaluates velocity and triggers 15s cognitive cooling friction.' },
      { method: 'POST', path: '/api/amplify/log-decision', desc: 'JSON: check_id, decision (abandon | shared_anyway), seconds_paused. Behavioral friction telemetry.' },
      { method: 'GET', path: '/api/amplify/telemetry', desc: 'Aggregated telemetry metrics: abandonment rate, dampening factor, total interventions.' },
      { method: 'POST', path: '/api/simulate', desc: 'JSON: hours, p_forward, friction_enabled, cooling_delay_seconds. Donella Meadows stock-and-flow 24-hour virality curve.' },
    ],
  },
  {
    category: '5. Grassroots Debunking & Court-Ready Evidence',
    endpoints: [
      { method: 'POST', path: '/api/debunk/sticker-card', desc: 'Multipart file. Auto-generates high-contrast WhatsApp warning sticker card (PNG base64) + 1-tap counter-narrative.' },
      { method: 'POST', path: '/api/legal/evidence-dossier', desc: 'Multipart file + victim_name + suspect_identifier. Generates Section 63 BSA 2023 cert, Cyber Cell complaint, Sec 67C/94 BNSS preservation notice.' },
      { method: 'POST', path: '/api/takedown/generate', desc: 'JSON: victim details, infringing URL. Generates Rule 3(2)(b) IT Rules 2021 24-hour intermediary takedown notice.' },
    ],
  },
];

export const SystemApiView: React.FC<SystemApiViewProps> = ({
  client,
  baseUrl,
  mode,
  onChangeBaseUrl,
  onChangeMode,
}) => {
  const [urlInput, setUrlInput] = useState(baseUrl);
  const [consoleOutput, setConsoleOutput] = useState<string>(
    '// Click any quick test button below to inspect live JSON responses from TruthLens v2.2.0'
  );
  const [testing, setTesting] = useState(false);

  const runProbe = async (label: string, fn: () => Promise<unknown>) => {
    setTesting(true);
    try {
      const data = await fn();
      setConsoleOutput(`// ${label}\n${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      setConsoleOutput(`// Error calling ${label}\n${String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  const hostOnly = (() => {
    try {
      return new URL(baseUrl).hostname;
    } catch {
      return '100.70.108.107';
    }
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#10D4A2]">
            <Server className="h-4 w-4" />
            TruthLens API Reference &amp; Integration Hub • v2.2.0
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold text-white">
            Live Backend Endpoints, Gateways &amp; Mobile Delivery
          </h2>
        </div>

        <a
          href={`${baseUrl}/download/truthlens.apk`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#10D4A2] px-4 py-2.5 text-xs font-bold text-[#050919] hover:bg-[#00e8ac]"
        >
          <Download className="h-4 w-4" />
          Download Android APK (v1.0.0)
        </a>
      </div>

      {/* Connection Settings + External Gateways */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Wifi className="h-4 w-4 text-[#10D4A2]" />
              Server Routing &amp; Execution Mode
            </span>
            <div className="inline-flex rounded-lg border border-white/10 bg-[#050919] p-0.5 text-[11px]">
              <button
                onClick={() => onChangeMode('live')}
                className={`rounded-md px-2.5 py-1 font-semibold cursor-pointer ${
                  mode === 'live' ? 'bg-[#10D4A2] text-[#050919]' : 'text-slate-400'
                }`}
              >
                Live API
              </button>
              <button
                onClick={() => onChangeMode('edge-demo')}
                className={`rounded-md px-2.5 py-1 font-semibold cursor-pointer ${
                  mode === 'edge-demo' ? 'bg-amber-400 text-[#050919]' : 'text-slate-400'
                }`}
              >
                Edge Demo
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-[#050919] px-3 py-2 font-mono text-xs text-white"
            />
            <button
              onClick={() => onChangeBaseUrl(urlInput)}
              className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 cursor-pointer"
            >
              Apply URL
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            In <strong className="text-slate-200">Live API</strong> mode, every call hits{' '}
            <code className="text-[#10D4A2]">{baseUrl}</code> with automatic zero-downtime fallback
            to our local Edge Forensics engine if the Tailscale host is unreachable.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 lg:col-span-6">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3">
            Connected Infrastructure Gateways
          </div>
          <div className="grid gap-2 sm:grid-cols-2 text-xs">
            {[
              { name: 'Swagger UI Docs', url: `${baseUrl}/docs` },
              { name: 'OpenWA Gateway', url: `http://${hostOnly}:2785` },
              { name: 'Mixpost Social Hub', url: `http://${hostOnly}:9000/mixpost` },
              { name: 'Qdrant Vector DB', url: `http://${hostOnly}:6333/dashboard` },
            ].map((gw) => (
              <a
                key={gw.name}
                href={gw.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#050919]/80 px-3 py-2.5 hover:border-[#10D4A2]/50"
              >
                <div>
                  <div className="font-semibold text-white">{gw.name}</div>
                  <div className="font-mono text-[10px] text-slate-400 truncate max-w-[175px]">
                    {gw.url}
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-[#10D4A2] shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Probe Console */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10D4A2]">
            <Terminal className="h-4 w-4" />
            Live JSON Probe Console
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={testing}
              onClick={() => runProbe('GET /health', () => client.getHealth())}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 font-mono text-[11px] text-white hover:bg-white/20 cursor-pointer"
            >
              <Play className="h-3 w-3 text-[#10D4A2]" /> GET /health
            </button>
            <button
              disabled={testing}
              onClick={() => runProbe('GET /api/info', () => client.getApiInfo())}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 font-mono text-[11px] text-white hover:bg-white/20 cursor-pointer"
            >
              <Play className="h-3 w-3 text-[#10D4A2]" /> GET /api/info
            </button>
            <button
              disabled={testing}
              onClick={() => runProbe('GET /api/amplify/telemetry', () => client.getTelemetry())}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 font-mono text-[11px] text-white hover:bg-white/20 cursor-pointer"
            >
              <Play className="h-3 w-3 text-[#10D4A2]" /> GET /api/amplify/telemetry
            </button>
            <button
              disabled={testing}
              onClick={() =>
                runProbe('POST /api/simulate', () =>
                  client.simulateVirality({
                    hours: 24,
                    p_forward: 0.42,
                    friction_enabled: true,
                    cooling_delay_seconds: 15,
                  })
                )
              }
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 font-mono text-[11px] text-white hover:bg-white/20 cursor-pointer"
            >
              <Play className="h-3 w-3 text-sky-400" /> POST /api/simulate
            </button>
          </div>
        </div>
        <pre className="max-h-56 overflow-auto rounded-xl border border-white/10 bg-[#050919] p-4 font-mono text-xs text-[#10D4A2]">
          {consoleOutput}
        </pre>
      </div>

      {/* Full Endpoint Reference Table */}
      <div className="space-y-4">
        {ENDPOINT_GROUPS.map((grp) => (
          <div
            key={grp.category}
            className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5"
          >
            <h3 className="font-display text-base font-bold text-white mb-3">{grp.category}</h3>
            <div className="divide-y divide-white/5 text-xs">
              {grp.endpoints.map((ep) => (
                <div
                  key={ep.path}
                  className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span
                    className={`w-14 shrink-0 rounded px-2 py-0.5 text-center font-mono text-[11px] font-bold ${
                      ep.method === 'GET'
                        ? 'bg-[#10D4A2]/15 text-[#10D4A2]'
                        : 'bg-sky-500/15 text-sky-300'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="w-60 shrink-0 font-mono text-slate-100">{ep.path}</code>
                  <span className="text-slate-400">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
