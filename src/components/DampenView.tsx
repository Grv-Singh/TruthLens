import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  SharedMediaContext,
  SimulationResponse,
  TelemetryResponse,
} from '../types/truthlens';
import type { TruthLensClient } from '../lib/api';

interface DampenViewProps {
  client: TruthLensClient;
  sharedMedia: SharedMediaContext;
}

interface CausalDomain {
  id: string;
  name: string;
  topic: string;
  reinforcingLoop: string[];
  balancingIntervention: string[];
  systemicImpact: string;
}

const CAUSAL_DOMAINS: CausalDomain[] = [
  {
    id: 'banking',
    name: 'Banking Panic',
    topic: 'Fake Bank Run & Currency Expiry Rumors',
    reinforcingLoop: [
      'Panic message shared in group chats',
      'Sudden ATM & branch cash runs',
      'Liquidity alarm spreads online'
    ],
    balancingIntervention: [
      'Official RBI fact-check tag',
      '15-second forward cooling delay',
      'Direct factual context card'
    ],
    systemicImpact: 'Prevents bank branch panics and halts liquidity runs.'
  },
  {
    id: 'health',
    name: 'Health Scams',
    topic: 'Fake Cures & Chemical Poison Warnings',
    reinforcingLoop: [
      'Viral home-cure advisory forwarded',
      'Emergency room overcrowding',
      'Delayed hospital care'
    ],
    balancingIntervention: [
      'Medical database verification tag',
      'Official health advisory link',
      '1-click debunk message'
    ],
    systemicImpact: 'Prevents toxic remedy ingestion and protects ER beds.'
  },
  {
    id: 'civic',
    name: 'Civic & Voice Clone',
    topic: 'AI Voice Note Claiming Curfew / Riot',
    reinforcingLoop: [
      'Cloned audio sent in closed groups',
      'Anger-driven fast re-shares',
      'Offline unrest and panic'
    ],
    balancingIntervention: [
      'AI clone audio detected & flagged',
      'Forwarding speed throttled',
      'Official administration advisory'
    ],
    systemicImpact: 'Halts viral spread before offline disruption occurs.'
  }
];

export const DampenView: React.FC<DampenViewProps> = ({ client }) => {
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);
  const [activeDomainId, setActiveDomainId] = useState<string>('banking');

  // Simulator controls
  const [hours] = useState(24);
  const [pForward, setPForward] = useState(0.42);
  const [frictionEnabled, setFrictionEnabled] = useState(true);
  const [coolingSeconds, setCoolingSeconds] = useState(15);
  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);

  // Wellbeing & Bot Shields
  const [outrageStreak, setOutrageStreak] = useState(4);
  const [botLikelihood, setBotLikelihood] = useState(86);

  const activeDomain = CAUSAL_DOMAINS.find(d => d.id === activeDomainId) || CAUSAL_DOMAINS[0];

  useEffect(() => {
    client.getTelemetry().then(setTelemetry);
  }, [client]);

  useEffect(() => {
    client
      .simulateVirality({
        hours,
        p_forward: pForward,
        friction_enabled: frictionEnabled,
        cooling_delay_seconds: coolingSeconds,
      })
      .then(setSimResult);
  }, [client, hours, pForward, frictionEnabled, coolingSeconds]);

  const avertedCount = simResult
    ? Math.max(0, simResult.peak_unmitigated - simResult.peak_dampened)
    : 18520;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <span className="material-symbols-rounded notranslate text-base align-middle" translate="no">local_fire_department</span>
          <span>Virality Control</span>
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-white">
          Real-Time Contagion Damping
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Compare unchecked rumor spread against TruthLens active dampening.
        </p>
      </div>

      {/* 3 Clear Metric Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#0b1229]/90 p-4">
          <div className="text-xs text-slate-400">Harm Stopped</div>
          <div className="mt-1 font-display text-3xl font-bold text-[#10D4A2] tabular-nums">
            {simResult?.harm_prevented_pct ?? 78}%
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Peak rumor spread prevented</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0b1229]/90 p-4">
          <div className="text-xs text-slate-400">Users Protected</div>
          <div className="mt-1 font-display text-3xl font-bold text-sky-400 tabular-nums">
            {avertedCount.toLocaleString()}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">People spared from fake news</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#0b1229]/90 p-4">
          <div className="text-xs text-slate-400">Dampening Force</div>
          <div className="mt-1 font-display text-3xl font-bold text-amber-400 tabular-nums">
            {telemetry?.dampening_factor ?? 4.2}x
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Reduction in viral velocity</div>
        </div>
      </div>

      {/* Visual Spread vs Protection Flow */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-rounded notranslate text-sky-400 text-lg align-middle" translate="no">hub</span>
              <span>Rumor Category</span>
            </h3>
            <p className="text-xs text-slate-400">Select a real-world scenario to see how contagion is broken.</p>
          </div>

          <div className="inline-flex rounded-xl border border-white/10 bg-[#050919] p-1">
            {CAUSAL_DOMAINS.map((dom) => (
              <button
                key={dom.id}
                onClick={() => setActiveDomainId(dom.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  activeDomainId === dom.id
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {dom.name}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side: How it spreads vs How we stop it */}
        <div className="rounded-xl border border-white/10 bg-[#050919]/70 p-4 space-y-4">
          <div className="text-xs text-slate-300 font-semibold">
            Scenario: <span className="text-white">{activeDomain.topic}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Unchecked Spread */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-rounded notranslate text-sm align-middle" translate="no">warning</span>
                  <span>Uncontrolled Viral Spread</span>
                </span>
                <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] uppercase font-mono">DANGER</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {activeDomain.reinforcingLoop.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-200">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-500/30 font-mono text-[10px] text-rose-200">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TruthLens Dampening */}
            <div className="rounded-xl border border-[#10D4A2]/30 bg-[#10D4A2]/10 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#10D4A2]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-rounded notranslate text-sm align-middle" translate="no">verified_user</span>
                  <span>TruthLens Containment</span>
                </span>
                <span className="rounded bg-[#10D4A2]/20 px-2 py-0.5 text-[10px] uppercase font-mono">ACTIVE</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {activeDomain.balancingIntervention.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-200">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#10D4A2]/30 font-mono text-[10px] text-[#10D4A2]">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 text-xs text-slate-300 flex items-center gap-2">
            <span className="material-symbols-rounded notranslate text-[#10D4A2] text-sm" translate="no">check_circle</span>
            <span><strong>Result:</strong> {activeDomain.systemicImpact}</span>
          </div>
        </div>
      </div>

      {/* 24-Hour Spread Simulator */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-rounded notranslate text-[#10D4A2] text-lg align-middle" translate="no">show_chart</span>
              <span>24-Hour Spread Comparison</span>
            </h3>
            <p className="text-xs text-slate-400">
              Red line: Runaway fake news. Green line: Contained by TruthLens.
            </p>
          </div>
          {simResult && (
            <div className="rounded-lg border border-[#10D4A2]/30 bg-[#10D4A2]/10 px-3 py-1 text-right">
              <div className="text-[10px] text-slate-300">Spread Reduction</div>
              <div className="font-mono text-sm font-bold text-[#10D4A2]">
                -{simResult.harm_prevented_pct ?? 78}%
              </div>
            </div>
          )}
        </div>

        {/* Sliders */}
        <div className="grid gap-3 rounded-xl bg-[#050919]/80 p-3.5 sm:grid-cols-3 text-xs">
          <div>
            <div className="flex justify-between">
              <span className="text-slate-400">Forwarding Speed</span>
              <span className="font-mono text-white font-bold">{Math.round(pForward * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.15}
              max={0.75}
              step={0.01}
              value={pForward}
              onChange={(e) => setPForward(Number(e.target.value))}
              className="mt-1 w-full accent-rose-400 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between">
              <span className="text-slate-400">Safety Delay</span>
              <span className="font-mono text-[#10D4A2] font-bold">{coolingSeconds}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={coolingSeconds}
              onChange={(e) => setCoolingSeconds(Number(e.target.value))}
              className="mt-1 w-full accent-[#10D4A2] cursor-pointer"
            />
          </div>

          <div className="flex items-center sm:justify-center">
            <label className="inline-flex items-center gap-2 text-slate-200 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={frictionEnabled}
                onChange={(e) => setFrictionEnabled(e.target.checked)}
                className="accent-[#10D4A2] h-4 w-4"
              />
              <span>TruthLens Protection Active</span>
            </label>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 w-full">
          {simResult && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simResult.curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="hour"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `${v}h`}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050919',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="unmitigated_reach"
                  name="Without Protection"
                  stroke="#f43f5e"
                  fill="rgba(244,63,94,0.22)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="dampened_reach"
                  name="With TruthLens"
                  stroke="#10d4a2"
                  fill="rgba(16,212,162,0.25)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2 Interactive Protection Features */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Outrage Feed Guard */}
        <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-rounded notranslate text-rose-400 text-base align-middle" translate="no">health_and_safety</span>
              <span>Feed Auto-Cool Guard</span>
            </h4>
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono text-rose-300">
              ACTIVE
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Sensitivity Trigger:</span>
            <span className="font-mono text-amber-300 font-bold">{outrageStreak} toxic posts</span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            value={outrageStreak}
            onChange={(e) => setOutrageStreak(Number(e.target.value))}
            className="w-full accent-rose-400 cursor-pointer"
          />
          <div className="rounded-lg bg-[#050919] p-2.5 text-xs text-slate-300 flex items-center gap-2">
            <span className="material-symbols-rounded notranslate text-[#10D4A2] text-sm" translate="no">timer</span>
            <span>Pauses feed auto-play for 15m after {outrageStreak} consecutive rage posts.</span>
          </div>
        </div>

        {/* Bot Cluster Blocker */}
        <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-rounded notranslate text-sky-400 text-base align-middle" translate="no">smart_toy</span>
              <span>Bot Network Shield</span>
            </h4>
            <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-mono text-sky-300">
              SHIELD ON
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Bot Detection Threshold:</span>
            <span className="font-mono text-rose-400 font-bold">{botLikelihood}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={99}
            value={botLikelihood}
            onChange={(e) => setBotLikelihood(Number(e.target.value))}
            className="w-full accent-sky-400 cursor-pointer"
          />
          <div className="rounded-lg bg-[#050919] p-2.5 text-xs text-slate-300 flex items-center gap-2">
            <span className="material-symbols-rounded notranslate text-[#10D4A2] text-sm" translate="no">shield</span>
            <span>Automatically isolates coordinated bot accounts from retweeting rumors.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
