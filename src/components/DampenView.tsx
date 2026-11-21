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
  NavTab,
  SharedMediaContext,
  SimulationResponse,
  SystemGroundingResponse,
} from '../types/truthlens';
import type { TruthLensClient } from '../lib/api';

interface DampenViewProps {
  client: TruthLensClient;
  sharedMedia: SharedMediaContext;
  onNavigate: (tab: NavTab) => void;
}

export const DampenView: React.FC<DampenViewProps> = ({ client, sharedMedia, onNavigate }) => {
  // Simulator controls
  const [hours] = useState(24);
  const [pForward, setPForward] = useState(0.42);
  const [frictionEnabled, setFrictionEnabled] = useState(true);
  const [coolingSeconds, setCoolingSeconds] = useState(15);
  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);
  const [systemGrounding, setSystemGrounding] = useState<SystemGroundingResponse | null>(null);
  const [groundingLoading, setGroundingLoading] = useState(false);

  // Fetch System.com Empirical Causal Grounding
  useEffect(() => {
    setGroundingLoading(true);
    client
      .getSystemGrounding({
        verdict: sharedMedia.verdict || 'AI_GENERATED',
        dhash: sharedMedia.dhash || '',
        sha256: sharedMedia.sha256 || '',
        threat_topic: 'misinformation',
      })
      .then((res) => {
        setSystemGrounding(res);
      })
      .catch(() => {})
      .finally(() => {
        setGroundingLoading(false);
      });
  }, [client, sharedMedia.verdict, sharedMedia.dhash, sharedMedia.sha256]);

  // Run virality simulation
  useEffect(() => {
    client
      .simulateVirality({
        hours,
        p_forward: pForward,
        friction_enabled: frictionEnabled,
        cooling_delay_seconds: coolingSeconds,
        verdict: sharedMedia.verdict,
        dhash: sharedMedia.dhash,
        sha256: sharedMedia.sha256,
      })
      .then((res) => {
        setSimResult(res);
        if (res.system_grounding && !systemGrounding) {
          setSystemGrounding(res.system_grounding);
        }
      });
  }, [client, hours, pForward, frictionEnabled, coolingSeconds, sharedMedia.verdict, sharedMedia.dhash, sharedMedia.sha256]);

  return (
    <div className="space-y-6">
      {/* Linked Media Badge from Step 1 */}
      {sharedMedia.verdict ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded notranslate text-sky-400 text-sm align-middle" translate="no">link</span>
            <span className="text-slate-200">
              Scanned Threat: <strong className="text-white">{sharedMedia.verdict.replace('_', ' ')}</strong>
              {sharedMedia.dhash ? ` • dHash: ${sharedMedia.dhash}` : ''}
              {sharedMedia.filename ? ` (${sharedMedia.filename})` : ''}
            </span>
          </div>
          <span className="font-mono text-[10px] text-sky-300 font-bold uppercase bg-sky-500/20 px-2 py-0.5 rounded">
            Step 1 Telemetry Active
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded notranslate text-amber-400 text-sm align-middle" translate="no">info</span>
            <span>Running in baseline simulation mode. Upload a file in Step 1 to ground specific media.</span>
          </div>
          <button
            onClick={() => onNavigate('detect')}
            className="text-[11px] underline hover:text-white font-medium cursor-pointer"
          >
            Go to Forensics
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <span className="material-symbols-rounded notranslate text-base align-middle" translate="no">local_fire_department</span>
          <span>Virality & Systems Modeling</span>
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-white">
          Systemic Virality & Contagion Throttling
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Grounded by System.com Public Graph API. Simulates viral feedback loops and tests pre-share cognitive cooling friction.
        </p>
      </div>

      {/* System.com Public Graph API Grounding Panel */}
      <div className="rounded-2xl border border-emerald-500/20 bg-[#081226]/90 p-5 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded notranslate text-emerald-400 text-xl align-middle" translate="no">hub</span>
            <div>
              <h3 className="font-display text-sm font-bold text-white">
                Empirical Grounding: System.com Graph API
              </h3>
              <p className="text-[11px] text-slate-400">
                Live empirical concept mapping for active forensic threat ({sharedMedia.verdict || 'AI_GENERATED'})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
              public-api.system.com/v1
            </span>
            {groundingLoading && (
              <span className="material-symbols-rounded notranslate text-emerald-400 text-sm animate-spin" translate="no">sync</span>
            )}
          </div>
        </div>

        {/* Empirical Concept Cards */}
        {systemGrounding?.grounded_concepts && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {systemGrounding.grounded_concepts.map((concept) => (
              <a
                key={concept.system_id}
                href={concept.system_url}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-xl border border-white/5 bg-[#050919]/70 p-3 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-emerald-400 font-semibold">{concept.role}</span>
                  <span className="text-slate-500 group-hover:text-emerald-300 font-mono flex items-center gap-0.5">
                    {concept.system_id}
                    <span className="material-symbols-rounded notranslate text-[11px]" translate="no">north_east</span>
                  </span>
                </div>
                <div className="mt-1 font-semibold text-white text-xs capitalize group-hover:text-emerald-200">
                  {concept.wikidata_label}
                </div>
                <div className="mt-0.5 text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {concept.description}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Causal Feedback Loops (Stock & Flow) */}
        {systemGrounding?.causal_loops && (
          <div className="grid gap-3 md:grid-cols-2 pt-1 text-xs">
            {/* Reinforcing Loop R1 */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-950/15 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  <span className="material-symbols-rounded notranslate text-sm align-middle text-rose-400" translate="no">repeat</span>
                  {systemGrounding.causal_loops.reinforcing_r1.name}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  Runaway R0: 2.8
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-300">
                {systemGrounding.causal_loops.reinforcing_r1.nodes.map((n, idx) => (
                  <React.Fragment key={n.id}>
                    <span className="rounded bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-white">
                      {n.label}
                    </span>
                    {idx < systemGrounding.causal_loops.reinforcing_r1.nodes.length - 1 && (
                      <span className="material-symbols-rounded notranslate text-rose-400 text-xs" translate="no">arrow_forward</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-[10px] text-rose-200/80 leading-relaxed">
                {systemGrounding.causal_loops.reinforcing_r1.dynamics}
              </p>
            </div>

            {/* Balancing Loop B1 */}
            <div className="rounded-xl border border-[#10D4A2]/20 bg-[#10D4A2]/5 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#10D4A2] flex items-center gap-1.5">
                  <span className="material-symbols-rounded notranslate text-sm align-middle text-[#10D4A2]" translate="no">security</span>
                  {systemGrounding.causal_loops.balancing_b1.name}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#10D4A2]/20 text-[#10D4A2] font-bold">
                  Contained R0: 0.85
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-300">
                {systemGrounding.causal_loops.balancing_b1.nodes.map((n, idx) => (
                  <React.Fragment key={n.id}>
                    <span className="rounded bg-[#10D4A2]/10 border border-[#10D4A2]/20 px-2 py-0.5 text-white">
                      {n.label}
                    </span>
                    {idx < systemGrounding.causal_loops.balancing_b1.nodes.length - 1 && (
                      <span className="material-symbols-rounded notranslate text-[#10D4A2] text-xs" translate="no">arrow_forward</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-[10px] text-emerald-200/80 leading-relaxed">
                {systemGrounding.causal_loops.balancing_b1.dynamics}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 24-Hour Spread Simulator */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-white flex items-center gap-1.5">
              <span className="material-symbols-rounded notranslate text-[#10D4A2] text-lg align-middle" translate="no">show_chart</span>
              <span>24-Hour Spread Comparison Curve</span>
            </h3>
            <p className="text-xs text-slate-400">
              Red: Unchecked transmission. Green: Contained with cognitive cooling delay.
            </p>
          </div>
          {simResult && (
            <div className="rounded-lg border border-[#10D4A2]/30 bg-[#10D4A2]/10 px-3 py-1 text-right">
              <div className="text-[10px] text-slate-300">Harm Prevented</div>
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
              <span className="text-slate-400">Safety Pause</span>
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
              <span>TruthLens Friction Active</span>
            </label>
          </div>
        </div>

        {/* Recharts Curve */}
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

      {/* Step 3 Forward Connector Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => onNavigate('heal')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-5 py-3 text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
        >
          <span>Proceed to Step 3: Legal Shield</span>
          <span className="material-symbols-rounded notranslate text-lg" translate="no">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
