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
  TelemetryResponse,
} from '../types/truthlens';
import type { TruthLensClient } from '../lib/api';

interface DampenViewProps {
  client: TruthLensClient;
  sharedMedia: SharedMediaContext;
  onNavigate: (tab: NavTab) => void;
}

export const DampenView: React.FC<DampenViewProps> = ({ client, sharedMedia, onNavigate }) => {
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);

  // Simulator controls
  const [hours] = useState(24);
  const [pForward, setPForward] = useState(0.42);
  const [frictionEnabled, setFrictionEnabled] = useState(true);
  const [coolingSeconds, setCoolingSeconds] = useState(15);
  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Linked Media Badge from Step 1 */}
      {sharedMedia.verdict && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded notranslate text-sky-400 text-sm align-middle" translate="no">link</span>
            <span className="text-slate-200">
              Scanned Threat: <strong className="text-white">{sharedMedia.verdict.replace('_', ' ')}</strong>
              {sharedMedia.dhash ? ` • dHash: ${sharedMedia.dhash}` : ''}
            </span>
          </div>
          <span className="font-mono text-[10px] text-sky-300 font-bold uppercase bg-sky-500/20 px-2 py-0.5 rounded">
            Step 1 Telemetry Linked
          </span>
        </div>
      )}

      {/* Title */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <span className="material-symbols-rounded notranslate text-base align-middle" translate="no">local_fire_department</span>
          <span>Virality Control</span>
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-white">
          Pre-Share Contagion Throttling
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Simulate spread velocity before forwarding and test pre-share friction controls.
        </p>
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
    </div>
  );
};
