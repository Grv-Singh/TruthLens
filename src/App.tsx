import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Fingerprint,
  Flame,
  Gavel,
  Globe,
  HelpCircle,
  LayoutDashboard,
  ScanSearch,
  Shield,
  Sparkles,
  Wifi,
} from 'lucide-react';
import type {
  ApiInfoResponse,
  DomainId,
  ExecutionMode,
  HealthResponse,
  Language,
  NavTab,
  SharedMediaContext,
} from './types/truthlens';
import { DEFAULT_BASE_URL, TruthLensClient } from './lib/api';
import { t } from './lib/i18n';
import { OverviewView } from './components/OverviewView';
import { ForensicsView } from './components/ForensicsView';
import { DampenView } from './components/DampenView';
import { HealLegalView } from './components/HealLegalView';
import { SolutionsView } from './components/SolutionsView';

const NAV_ITEMS: {
  id: NavTab;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
    { id: 'overview', icon: LayoutDashboard },
    { id: 'detect', icon: ScanSearch },
    { id: 'dampen', icon: Flame },
    { id: 'heal', icon: Gavel },
  ];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [lang, setLang] = useState<Language>('en');
  const [baseUrl, setBaseUrl] = useState<string>(DEFAULT_BASE_URL);
  const [mode] = useState<ExecutionMode>('live');
  const [selectedDomain, setSelectedDomain] = useState<DomainId>('fintech');
  const [autoPresetId, setAutoPresetId] = useState<string | null>(null);

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [apiInfo, setApiInfo] = useState<ApiInfoResponse | null>(null);

  const [sharedMedia, setSharedMedia] = useState<SharedMediaContext>({
    file: null,
    previewUrl: null,
    filename: '',
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const client = useMemo(() => new TruthLensClient(baseUrl, mode), [baseUrl, mode]);
  const tr = t(lang);

  // Web Share Target API capture from Service Worker Cache
  useEffect(() => {
    const checkShareTarget = async () => {
      const params = new URLSearchParams(window.location.search);
      const isShared = params.get('shared') === '1';
      if ('caches' in window) {
        try {
          const cache = await caches.open('truthlens-share-data');
          const fileResp = await cache.match('/_shared_file');
          if (fileResp) {
            const blob = await fileResp.blob();
            const fileName = decodeURIComponent(fileResp.headers.get('X-File-Name') || 'whatsapp_shared.jpg');
            const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
            const previewUrl = URL.createObjectURL(file);
            setSharedMedia({
              file,
              previewUrl,
              filename: file.name,
            });
            setActiveTab('detect');
            await cache.delete('/_shared_file');
          }
          const textResp = await cache.match('/_shared_text');
          if (textResp) {
            const text = await textResp.text();
            setSharedMedia((prev) => ({
              ...prev,
              text: text.trim(),
            }));
            setActiveTab('detect');
            await cache.delete('/_shared_text');
          }
          const urlText = params.get('text');
          if (urlText) {
            setSharedMedia((prev) => ({
              ...prev,
              text: urlText,
            }));
            setActiveTab('detect');
          }
          if (isShared) {
            window.history.replaceState({}, '', window.location.pathname);
          }
        } catch (e) {
          console.error('[Web Share Target] Error retrieving payload:', e);
        }
      }
    };
    checkShareTarget();

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }, []);

  const refreshHealth = useCallback(async () => {
    const [h, info] = await Promise.all([client.getHealth(), client.getApiInfo()]);
    setHealth(h);
    setApiInfo(info);
  }, [client]);

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  const handleOpenDomain = (domain: DomainId) => {
    setSelectedDomain(domain);
    setActiveTab('solutions');
  };

  const handleLaunchPresetInForensics = (presetId: string) => {
    setAutoPresetId(presetId);
    setActiveTab('detect');
  };

  return (
    <div className="min-h-screen bg-forensic-grid flex flex-col bg-[#050919] text-slate-100">
      {/* Top Utility Header */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-md shadow-xs border-slate-800 bg-[#060b1f]/90">
        <div className="mx-auto flex max-w-[1520px] items-center justify-between gap-3 px-4 py-3 sm:px-8">
          {/* Brand Emblem */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-display text-xl font-extrabold shadow-[0_2px_10px_rgba(37,99,235,0.3)]">
              T
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-white flex items-center justify-center shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>
            <div>
              <div className="font-display text-base font-extrabold tracking-wider flex items-center gap-1.5 text-white">
                TRUTHLENS
                <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-mono font-bold">
                  v2.3.0
                </span>
              </div>
              <div className="font-mono text-[10.5px] font-medium flex items-center gap-1 text-slate-400">
                <Shield className="h-3 w-3 text-emerald-600" />
                Multimodal Systems Defense
              </div>
            </div>
          </div>

          {/* Active Module Indicator (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border bg-slate-800/80 border-slate-700 text-slate-200">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span>{tr.nav[activeTab]}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 font-normal">{tr.navSub[activeTab]}</span>
          </div>

          {/* Right Action & Control Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {deferredPrompt && (
              <button
                onClick={async () => {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') setDeferredPrompt(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-[#10D4A2] hover:bg-emerald-500/20 transition cursor-pointer shadow-xs"
                title="Install TruthLens as Native Android/Desktop App"
              >
                <span className="material-symbols-rounded notranslate text-sm align-middle" translate="no">install_mobile</span>
                <span>Install App</span>
              </button>
            )}

            

            <button
              onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold transition cursor-pointer shadow-xs"
              title="Switch between English and Hindi"
            >
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              {lang === 'en' ? 'हिंदी' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Width Page Area */}
      <main className="mx-auto w-full max-w-[1520px] flex-1 px-4 sm:px-8 py-6 pb-32">
        {activeTab === 'overview' && (
          <OverviewView
            lang={lang}
            health={health}
            apiInfo={apiInfo}
            baseUrl={baseUrl}
            onRefreshHealth={refreshHealth}
            onNavigate={setActiveTab}
            onOpenDomain={handleOpenDomain}
          />
        )}

        {activeTab === 'detect' && (
          <ForensicsView
            client={client}
            sharedMedia={sharedMedia}
            onUpdateSharedMedia={setSharedMedia}
            onNavigate={setActiveTab}
            autoPresetId={autoPresetId}
            onConsumedPreset={() => setAutoPresetId(null)}
          />
        )}

        {activeTab === 'dampen' && (
          <DampenView client={client} sharedMedia={sharedMedia} />
        )}

        {activeTab === 'heal' && (
          <HealLegalView
            client={client}
            lang={lang}
            sharedMedia={sharedMedia}
          />
        )}

        {activeTab === 'solutions' && (
          <SolutionsView
            selectedDomain={selectedDomain}
            onSelectDomain={setSelectedDomain}
            onLaunchPresetInForensics={handleLaunchPresetInForensics}
            onNavigate={setActiveTab}
          />
        )}
      </main>

      {/* Viewport Sticky Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 backdrop-blur-2xl border shadow-[0_16px_40px_-6px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.3)] rounded-full p-1.5 flex items-center gap-1 max-w-[calc(100vw-24px)] overflow-x-auto scrollbar-none transition-all duration-200 bg-[#080e23]/92 border-slate-700/80 shadow-black/40"
        aria-label="Floating Module Selector"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${active
                  ? 'bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} />
              <span>{tr.nav[item.id]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
