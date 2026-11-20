import React from 'react';
import type { NavTab } from '../types/truthlens';

interface WorkflowProgressProps {
  currentTab: 'detect' | 'dampen' | 'heal';
  onNavigate: (tab: NavTab) => void;
  hasScanResult?: boolean;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  currentTab,
  onNavigate,
  hasScanResult = false,
}) => {
  const steps = [
    {
      id: 'detect' as NavTab,
      num: 1,
      label: 'Forensics',
      sub: 'Scan & Detect',
    },
    {
      id: 'dampen' as NavTab,
      num: 2,
      label: 'Virality',
      sub: 'Contagion Damping',
    },
    {
      id: 'heal' as NavTab,
      num: 3,
      label: 'Legal Shield',
      sub: 'BSA Evidence Dossier',
    },
  ];

  const currentIdx = steps.findIndex((s) => s.id === currentTab);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1229]/90 p-2.5 sm:p-3 mb-6 shadow-md">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentIdx || (idx === 0 && hasScanResult && currentIdx > 0);
          const isActive = step.id === currentTab;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => onNavigate(step.id)}
                className={`flex flex-1 items-center gap-2 sm:gap-2.5 rounded-xl p-2 sm:px-3 sm:py-2 transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/20 border border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                    : isDone
                    ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                    : 'opacity-60 hover:opacity-100 hover:bg-white/5'
                }`}
              >
                <div
                  className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : isDone
                      ? 'bg-[#10D4A2]/20 text-[#10D4A2]'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <span className="material-symbols-rounded notranslate text-sm align-middle" translate="no">check</span>
                  ) : (
                    step.num
                  )}
                </div>
                <div className="min-w-0">
                  <div
                    className={`font-display text-xs sm:text-sm font-bold truncate ${
                      isActive ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                    {step.sub}
                  </div>
                </div>
              </button>

              {idx < steps.length - 1 && (
                <div className="text-slate-600 px-0.5 shrink-0">
                  <span className="material-symbols-rounded notranslate text-xs align-middle" translate="no">arrow_forward_ios</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
