import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  Bot,
  Clock,
  Flame,
  Forward,
  HeartPulse,
  Send,
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
  PreShareCheckResult,
  SharedMediaContext,
  SimulationResponse,
  TelemetryResponse,
} from '../types/truthlens';
import type { TruthLensClient } from '../lib/api';

interface DampenViewProps {
  client: TruthLensClient;
  sharedMedia: SharedMediaContext;
}

export const DampenView: React.FC<DampenViewProps> = ({ client, sharedMedia }) => {
  // Pre-share check form state
  const [chatId, setChatId] = useState('wa-group-jaipur-family-91');
  const [messageText, setMessageText] = useState(
    'URGENT BREAKING!! Forward to everyone immediately before it gets deleted! Shocking leaked video!!'
  );
  const [forwardCount, setForwardCount] = useState(5);
  const [hasMedia, setHasMedia] = useState(true);

  const [checkResult, setCheckResult] = useState<PreShareCheckResult | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [decisionBanner, setDecisionBanner] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);

  // Donella Meadows 24h Simulator state
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

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleRunPreShareCheck = async () => {
    setDecisionBanner(null);
    const res = await client.preShareCheck({
      chat_id: chatId,
      message_text: messageText,
      forward_count: forwardCount,
      has_media: hasMedia,
      media_hash: sharedMedia.dhash || '9e4c3a1f82b07d55',
    });
    setCheckResult(res);
    setCountdown(res.friction_triggered ? res.cooling_delay_seconds : 0);
  };

  const handleLogDecision = async (decision: 'abandon' | 'shared_anyway') => {
    if (!checkResult) return;
    const paused = Math.max(1, checkResult.cooling_delay_seconds - countdown);
    await client.logDecision({
      check_id: checkResult.check_id,
      decision,
      seconds_paused: paused,
    });
    const updated = await client.getTelemetry();
    setTelemetry(updated);
    setDecisionBanner(
      decision === 'abandon'
        ? `Virality Loop Broken! Logged decision="abandon" after ${paused}s pause. Projected ${checkResult.projected_24h_reach.toLocaleString()} exposures averted.`
        : `Logged decision="shared_anyway" after ${paused}s pause. Context warning label attached.`
    );
    setCheckResult(null);
    setCountdown(0);
  };

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
          L2 — At Amplification • Virality Damping, Cognitive Cooling &amp; Digital Wellbeing
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-white">
          Warn BEFORE You Share — Break the Virality &amp; Outrage Loops
        </h2>
      </div>

      {/* Live Telemetry KPI Strip */}
      {telemetry && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-[#0b1229]/90 p-4">
            <div className="text-xs text-slate-400">Abandonment Rate</div>
            <div className="mt-1 font-display text-2xl font-bold text-[#10D4A2] tabular-nums">
              {telemetry.abandonment_rate}%
            </div>
            <div className="text-[11px] text-slate-400">
              {telemetry.abandoned_count} forwards stopped
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0b1229]/90 p-4">
            <div className="text-xs text-slate-400">Dampening Factor</div>
            <div className="mt-1 font-display text-2xl font-bold text-sky-400 tabular-nums">
              {telemetry.dampening_factor}x
            </div>
            <div className="text-[11px] text-slate-400">GET /api/amplify/telemetry</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0b1229]/90 p-4">
            <div className="text-xs text-slate-400">Total Interventions</div>
            <div className="mt-1 font-display text-2xl font-bold text-white tabular-nums">
              {telemetry.total_interventions}
            </div>
            <div className="text-[11px] text-slate-400">
              Avg pause {telemetry.avg_pause_seconds}s
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0b1229]/90 p-4">
            <div className="text-xs text-slate-400">24h Harm Prevented</div>
            <div className="mt-1 font-display text-2xl font-bold text-amber-400 tabular-nums">
              {simResult?.harm_prevented_pct ?? 78.4}%
            </div>
            <div className="text-[11px] text-slate-400">
              R₀: {simResult?.r0_unmitigated} → {simResult?.r0_dampened}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: WhatsApp 15s Pre-Share Friction + Donella Meadows 24h Curve */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* WhatsApp Pre-Share Cognitive Cooling Simulator */}
        <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Forward className="h-4 w-4 text-[#10D4A2]" />
              WhatsApp Pre-Share Friction Test
            </h3>
            <code className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-amber-300">
              /amplify/pre-share-check
            </code>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300">Chat / Group ID</label>
              <input
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#050919] px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300">Forwarded Message Text</label>
              <textarea
                rows={3}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#050919] px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex justify-between">
                  <label className="text-slate-300">Forward Chain Count</label>
                  <span className="font-mono font-bold text-amber-400">{forwardCount}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={forwardCount}
                  onChange={(e) => setForwardCount(Number(e.target.value))}
                  className="mt-1 w-full accent-amber-400"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-slate-300 cursor-pointer pt-3">
                <input
                  type="checkbox"
                  checked={hasMedia}
                  onChange={(e) => setHasMedia(e.target.checked)}
                  className="accent-[#10D4A2]"
                />
                Has Media
              </label>
            </div>

            <button
              onClick={handleRunPreShareCheck}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-[#050919] hover:bg-amber-400 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              Attempt WhatsApp Forward
            </button>
          </div>

          {decisionBanner && (
            <div className="rounded-xl border border-[#10D4A2]/35 bg-[#10D4A2]/10 p-3 text-xs text-[#10D4A2]">
              {decisionBanner}
            </div>
          )}

          {/* Active 15s Cognitive Cooling Friction Card */}
          {checkResult && (
            <div className="rounded-2xl border border-rose-500/45 bg-gradient-to-b from-rose-950/60 to-[#050919] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                  <Clock className="h-4 w-4" />
                  {checkResult.risk_level} • Velocity {checkResult.velocity_score}/100
                </div>
                <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 font-mono text-sm font-bold text-rose-200 tabular-nums">
                  {countdown}s
                </span>
              </div>

              <div className="font-display text-base font-bold text-white">
                {checkResult.warning_headline}
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {checkResult.warning_body}
              </p>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-1000"
                  style={{
                    width: `${
                      checkResult.cooling_delay_seconds > 0
                        ? ((checkResult.cooling_delay_seconds - countdown) /
                            checkResult.cooling_delay_seconds) *
                          100
                        : 100
                    }%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => handleLogDecision('abandon')}
                  className="rounded-xl bg-[#10D4A2] px-3 py-2 text-xs font-bold text-[#050919] hover:bg-[#00e8ac] cursor-pointer"
                >
                  Pause &amp; Abandon Share
                </button>
                <button
                  onClick={() => handleLogDecision('shared_anyway')}
                  disabled={countdown > 0}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    countdown > 0
                      ? 'border-white/10 bg-white/5 text-slate-500 cursor-not-allowed'
                      : 'border-rose-500/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 cursor-pointer'
                  }`}
                >
                  {countdown > 0 ? `Unlock in ${countdown}s` : 'Share Anyway'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Donella Meadows Stock-and-Flow 24-Hour Virality Simulator */}
        <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-[#10D4A2]" />
                Donella Meadows Stock-and-Flow 24h Virality Simulator
              </h3>
              <p className="text-xs text-slate-400">
                &ldquo;What if I share this?&rdquo; — 24h harm if 100 people share •{' '}
                <code className="text-[#10D4A2]">POST /api/simulate</code>
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
                <span className="text-slate-400">Forward Prob (p)</span>
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
                <span className="text-slate-400">Horizon</span>
                <span className="font-mono text-white">{hours}h</span>
              </div>
              <label className="mt-1.5 inline-flex items-center gap-2 text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={frictionEnabled}
                  onChange={(e) => setFrictionEnabled(e.target.checked)}
                  className="accent-[#10D4A2]"
                />
                Cooling Active
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
                    name="With TruthLens Cognitive Cooling"
                    stroke="#10d4a2"
                    fill="rgba(16,212,162,0.25)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
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
              Coordinated Bot &amp; Astroturfing Suppression
            </h3>
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-300">
              Election &amp; Breaking News
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Combines media forgery score with account verification trust to separate benign AI
            creative edits from coordinated synthetic disinformation campaigns.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div>
              <div className="flex justify-between">
                <span className="text-slate-300">Media Forgery Score</span>
                <span className="font-mono text-rose-400">{botForgeryScore}/100</span>
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
                <span className="text-slate-300">Account Verification Trust</span>
                <span className="font-mono text-[#10D4A2]">{accountTrustScore}/100</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={accountTrustScore}
                onChange={(e) => setAccountTrustScore(Number(e.target.value))}
                className="mt-1 w-full accent-[#10D4A2]"
              />
            </div>
          </div>

          <div className={`rounded-xl border p-3.5 text-xs ${suppressionAction.color}`}>
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                {suppressionAction.label}
              </span>
              <span className="font-mono font-bold tabular-nums">
                Risk {suppressionRank}/100
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
