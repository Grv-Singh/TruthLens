import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  Bot,
  Flame,
  HeartPulse,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
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

export const DampenView: React.FC<DampenViewProps> = ({ client }) => {
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);

  // 24h Simulator state
  const [hours, setHours] = useState(24);
  const [pForward, setPForward] = useState(0.42);
  const [frictionEnabled, setFrictionEnabled] = useState(true);
  const [coolingSeconds, setCoolingSeconds] = useState(15);
  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);

  // Outrage-Bait Wellbeing Streak & Coordinated Bot Suppression (Domain #2)
  const [outrageStreak, setOutrageStreak] = useState(4);
  const [botForgeryScore, setBotForgeryScore] = useState(86);
  const [accountTrustScore, setAccountTrustScore] = useState(18);

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

  // Coordinated Astroturfing Suppression Matrix Score
  const suppressionRank = Math.min(
    99,
    Math.round(botForgeryScore * 0.65 + (100 - accountTrustScore) * 0.35)
  );
  const suppressionAction =
    suppressionRank >= 72
      ? { label: 'DOWNRANK 90% + CLUSTER QUARANTINE', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' }
      : suppressionRank >= 45
        ? { label: 'ATTACH CONTEXT OVERLAY + THROTTLE', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' }
        : { label: 'BENIGN AI EDIT — ALLOW WITH LABEL', color: 'text-[#10D4A2] bg-[#10D4A2]/15 border-[#10D4A2]/30' };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Flame className="h-4 w-4" />
          L2 — Systems Dynamics • Virality Spread &amp; Digital Wellbeing Guardrails
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-white">
          24h Virality Simulator &amp; Consumer Wellbeing Controls
        </h2>
      </div>

      {/* Live Telemetry KPI Strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#0b1229]/90 p-4">
          <div className="text-xs text-slate-400">Harm Prevented (24h)</div>
          <div className="mt-1 font-display text-2xl font-bold text-[#10D4A2] tabular-nums">
            {simResult?.harm_prevented_pct ?? 78.4}%
          </div>
          <div className="text-[11px] text-slate-400">
            R₀: {simResult?.r0_unmitigated ?? 2.8} → {simResult?.r0_dampened ?? 0.9}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0b1229]/90 p-4">
          <div className="text-xs text-slate-400">Exposures Averted</div>
          <div className="mt-1 font-display text-2xl font-bold text-sky-400 tabular-nums">
            {simResult ? (simResult.peak_unmitigated - simResult.peak_dampened).toLocaleString() : '18,520'}
          </div>
          <div className="text-[11px] text-slate-400">Projected citizens protected</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0b1229]/90 p-4">
          <div className="text-xs text-slate-400">Total Interventions</div>
          <div className="mt-1 font-display text-2xl font-bold text-white tabular-nums">
            {telemetry?.total_interventions ?? 142}
          </div>
          <div className="text-[11px] text-slate-400">
            Average delay {telemetry?.avg_pause_seconds ?? 15}s
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0b1229]/90 p-4">
          <div className="text-xs text-slate-400">Virality Dampening</div>
          <div className="mt-1 font-display text-2xl font-bold text-amber-400 tabular-nums">
            {telemetry?.dampening_factor ?? 4.2}x
          </div>
          <div className="text-[11px] text-slate-400">
            Stock-and-flow differential
          </div>
        </div>
      </div>

      {/* Stock-and-flow 24-Hour Virality Simulator - Full Width */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-[#10D4A2]" />
              Stock-and-flow 24h Virality Differential Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Epidemic contagion modeling for synthetic rumors • Unmitigated vs Dampened reach curve
            </p>
          </div>
          {simResult && (
            <div className="rounded-lg border border-[#10D4A2]/30 bg-[#10D4A2]/10 px-3 py-1.5 text-right">
              <div className="text-[10px] text-slate-300">Exposures Averted</div>
              <div className="font-mono text-sm font-bold text-[#10D4A2] tabular-nums">
                {(simResult.peak_unmitigated - simResult.peak_dampened).toLocaleString()} people
              </div>
            </div>
          )}
        </div>

        {/* Sliders */}
        <div className="grid gap-3 rounded-xl bg-[#050919]/80 p-3.5 sm:grid-cols-3 text-xs">
          <div>
            <div className="flex justify-between">
              <span className="text-slate-400">Forward Probability (p)</span>
              <span className="font-mono text-white">{pForward.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.15}
              max={0.75}
              step={0.01}
              value={pForward}
              onChange={(e) => setPForward(Number(e.target.value))}
              className="mt-1 w-full accent-rose-400"
            />
          </div>

          <div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cooling Delay</span>
              <span className="font-mono text-[#10D4A2]">{coolingSeconds}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={coolingSeconds}
              onChange={(e) => setCoolingSeconds(Number(e.target.value))}
              className="mt-1 w-full accent-[#10D4A2]"
            />
          </div>

          <div className="flex items-center justify-between sm:flex-col sm:items-start sm:justify-center">
            <div className="flex items-center justify-between w-full">
              <span className="text-slate-400">Simulation Horizon</span>
              <span className="font-mono text-white">{hours}h</span>
            </div>
            <label className="mt-1.5 inline-flex items-center gap-2 text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={frictionEnabled}
                onChange={(e) => setFrictionEnabled(e.target.checked)}
                className="accent-[#10D4A2]"
              />
              Cooling Interventions Active
            </label>
          </div>
        </div>

        {/* Dual Curve Chart */}
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
                  name="Unmitigated Deepfake Reach"
                  stroke="#f43f5e"
                  fill="rgba(244,63,94,0.22)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="dampened_reach"
                  name="With Cognitive Cooling"
                  stroke="#10d4a2"
                  fill="rgba(16,212,162,0.25)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Consumer Wellbeing: Outrage-Bait Throttling + Coordinated Bot Suppression (Domain #2) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-rose-400" />
              Outrage-Bait Throttling &amp; Wellbeing Guardrail
            </h3>
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-300">
              Consumer Feeds
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Detects consecutive exposure streaks to sensationalized, rage-inducing, or manipulated
            posts and automatically injects feed cool-downs and context overlays to protect mental
            health.
          </p>

          <div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Consecutive Outrage / Manipulated Posts Seen</span>
              <span className="font-mono font-bold text-amber-400">{outrageStreak} posts</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={outrageStreak}
              onChange={(e) => setOutrageStreak(Number(e.target.value))}
              className="mt-1.5 w-full accent-rose-400"
            />
          </div>

          <div
            className={`rounded-xl border p-4 text-xs ${
              outrageStreak >= 4
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-100'
                : 'border-[#10D4A2]/30 bg-[#10D4A2]/10 text-[#10D4A2]'
            }`}
          >
            {outrageStreak >= 4 ? (
              <div className="space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <AlertOctagon className="h-4 w-4" />
                  FEED COOL-DOWN TRIGGERED (Streak ≥ 4)
                </div>
                <p className="text-slate-200">
                  You&apos;ve encountered {outrageStreak} consecutive high-arousal or synthetic
                  posts. TruthLens paused auto-play, applied neutral context overlays, and
                  downranked sensational outrage triggers for 15 minutes.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Feed hygiene nominal — balanced content diversity maintained.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Bot className="h-4 w-4 text-sky-400" />
              Coordinated Astroturfing Suppression Matrix
            </h3>
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-300">
              Enterprise &amp; Civic
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Suppresses coordinated synthetic bot amplification networks before viral breakout occurs.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bot Likelihood</span>
                <span className="font-mono text-rose-400">{botForgeryScore}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={botForgeryScore}
                onChange={(e) => setBotForgeryScore(Number(e.target.value))}
                className="mt-1 w-full accent-rose-400"
              />
            </div>
            <div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account Trust</span>
                <span className="font-mono text-sky-400">{accountTrustScore}/100</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={accountTrustScore}
                onChange={(e) => setAccountTrustScore(Number(e.target.value))}
                className="mt-1 w-full accent-sky-400"
              />
            </div>
          </div>

          <div className={`rounded-xl border p-4 text-xs ${suppressionAction.color}`}>
            <div className="font-bold flex items-center justify-between">
              <span>ACTION: {suppressionAction.label}</span>
              <span className="font-mono text-sm">{suppressionRank}/100</span>
            </div>
            <p className="mt-1 text-slate-300">
              Synthesized behavioral signals detected in cluster topology. Downranking network
              propagation coefficients across connected edge relays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
