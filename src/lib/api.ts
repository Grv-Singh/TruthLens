import type {
  ApiInfoResponse,
  AudioDetectResult,
  DebunkStickerResult,
  DetectResult,
  EvidenceDossierResult,
  ExecutionMode,
  HealthResponse,
  PreShareCheckPayload,
  PreShareCheckResult,
  SimulationResponse,
  TakedownNoticeResult,
  TelemetryResponse,
  VaultItem,
  VaultVerifyResult,
  WatermarkResult,
} from '../types/truthlens';
import {
  buildLocalEvidenceDossier,
  buildLocalTakedownNotice,
  computeDHash,
  computeSha256,
  generateLocalDebunkSticker,
  hammingDistanceHex,
  runLocalAudioDetect,
  runLocalEdgeDetect,
  runLocalViralitySimulation,
  runLocalWatermarkCheck,
} from './forensics';

export const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '') || 'http://100.70.108.107:8000';

// Local Qdrant-emulated Origin Vault store for offline/demo resilience
const localVaultStore: VaultItem[] = [
  {
    id: 'vault-seed-001',
    owner_id: 'ankita.sinha@creator.in',
    title: 'Keynote Press Headshot (Verified Original)',
    sha256: '4b7e2f8a19c0d431e2a556f891b22c4a8d10e9b3f771c45602a8d19e77c103ab',
    dhash: 'a4e8c92b71f04d36',
    registered_at: '2026-11-18T09:14:00Z',
    collection: 'truthlens_vault',
  },
  {
    id: 'vault-seed-002',
    owner_id: 'gaurav.singh@jaipur.in',
    title: 'KYC Live Verification Master Frame',
    sha256: '9c1d4a77b82e501f6632a8c1e94b72d0f3185a6e4c09b2817f6a3c5d80e142bc',
    dhash: '7f3c91a4d28e6b10',
    registered_at: '2026-11-19T14:22:00Z',
    collection: 'truthlens_vault',
  },
];

// Local telemetry counters for cognitive cooling
const localTelemetry = {
  total_interventions: 148,
  abandoned_count: 109,
  shared_anyway_count: 39,
  total_pause_seconds: 2146,
};

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 3500
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export class TruthLensClient {
  /** Public backend URL (used for links: APK, Swagger, gateways). */
  baseUrl: string;
  /** Prefix used for fetch() calls. Empty string = same-origin via Vite dev proxy (no CORS). */
  apiBase: string;
  preferredMode: ExecutionMode;

  constructor(baseUrl = DEFAULT_BASE_URL, preferredMode: ExecutionMode = 'edge-demo') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiBase = import.meta.env.DEV && this.baseUrl === DEFAULT_BASE_URL ? '' : this.baseUrl;
    this.preferredMode = preferredMode;
  }

  private get shouldTryLive() {
    return this.preferredMode === 'live';
  }

  // 1. GET /health
  async getHealth(): Promise<HealthResponse> {
    const t0 = performance.now();
    if (this.shouldTryLive) {
      try {
        const res = await fetchWithTimeout(`${this.apiBase}/health`, {}, 2500);
        if (res.ok) {
          const data = await res.json();
          return {
            status: 'healthy',
            version: data.version ?? '2.2.0',
            services: {
              redis: data.redis ?? data.services?.redis ?? 'connected',
              postgres: data.postgres ?? data.services?.postgres ?? 'connected',
              qdrant: data.qdrant ?? data.services?.qdrant ?? 'connected (:6333)',
              edge_workers: data.edge_workers ?? data.services?.edge_workers ?? 'active (4 workers)',
              openwa_gateway: data.openwa ?? 'ready (:2785)',
            },
            latency_ms: Math.round(performance.now() - t0),
            source: 'live',
          };
        }
      } catch {
        // Fall back gracefully
      }
    }
    return {
      status: 'healthy',
      version: '2.2.0',
      services: {
        redis: 'ready (Edge Emulated)',
        postgres: 'ready (Edge Emulated)',
        qdrant: 'truthlens_vault (Edge Vector Index)',
        edge_workers: 'active (On-Device WASM/Canvas)',
        openwa_gateway: 'simulated (:2785)',
      },
      latency_ms: 14,
      source: 'edge-demo',
    };
  }

  // 2. GET /api/info
  async getApiInfo(): Promise<ApiInfoResponse> {
    if (this.shouldTryLive) {
      try {
        const res = await fetchWithTimeout(`${this.apiBase}/api/info`, {}, 2500);
        if (res.ok) {
          const data = await res.json();
          return {
            name: data.name ?? 'TruthLens Systems Engine',
            version: data.version ?? '2.2.0',
            leverage_points: data.leverage_points ?? DEFAULT_API_INFO.leverage_points,
            supported_modalities: data.supported_modalities ?? DEFAULT_API_INFO.supported_modalities,
            architecture: data.architecture ?? DEFAULT_API_INFO.architecture,
            source: 'live',
          };
        }
      } catch {
        // Fallback
      }
    }
    return DEFAULT_API_INFO;
  }

  // 3. POST /api/detect
  async detectImage(file: File): Promise<DetectResult> {
    if (this.shouldTryLive) {
      try {
        const form = new FormData();
        form.append('file', file);
        const t0 = performance.now();
        const res = await fetchWithTimeout(`${this.apiBase}/api/detect`, {
          method: 'POST',
          body: form,
        }, 8000);
        if (res.ok) {
          const data = await res.json();
          const local = await runLocalEdgeDetect(file);
          return {
            verdict: (data.verdict || local.verdict).toUpperCase().replace(/\s+/g, '_'),
            confidence: Number(data.confidence ?? local.confidence),
            manipulation_score: Number(data.manipulation_score ?? data.score ?? local.manipulation_score),
            dhash: data.dhash ?? local.dhash,
            sha256: data.sha256 ?? local.sha256,
            ela_heatmap_url:
              data.ela_heatmap_base64
                ? `data:image/png;base64,${data.ela_heatmap_base64}`
                : data.ela_heatmap_url ?? local.ela_heatmap_url,
            ela_mean_error: Number(data.ela_mean_error ?? local.ela_mean_error),
            ela_peak_zones: data.ela_peak_zones ?? local.ela_peak_zones,
            gemini_notes: data.notes ?? data.gemini_notes ?? local.gemini_notes,
            processing_ms: Math.round(performance.now() - t0),
            source: 'live',
          };
        }
      } catch {
        // Fallback to real client-side ELA + dHash
      }
    }
    return runLocalEdgeDetect(file);
  }

  // 4. POST /api/detect/watermark
  async detectWatermark(file: File): Promise<WatermarkResult> {
    if (this.shouldTryLive) {
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetchWithTimeout(`${this.apiBase}/api/detect/watermark`, {
          method: 'POST',
          body: form,
        }, 6000);
        if (res.ok) {
          const data = await res.json();
          return {
            synthid_detected: Boolean(data.synthid_detected ?? data.synthid?.detected),
            synthid_confidence: Number(data.synthid_confidence ?? data.synthid?.confidence ?? 0),
            c2pa_present: Boolean(data.c2pa_present ?? data.c2pa?.present),
            c2pa_issuer: data.c2pa_issuer ?? data.c2pa?.issuer ?? null,
            iptc_ai_flag: Boolean(data.iptc_ai_flag ?? data.iptc?.ai_generated),
            iptc_digital_source_type: data.iptc_digital_source_type ?? data.iptc?.source_type ?? 'unknown',
            provenance_summary: data.summary ?? data.provenance_summary ?? 'Live provenance inspection complete.',
            source: 'live',
          };
        }
      } catch {
        // Fallback
      }
    }
    return runLocalWatermarkCheck(file);
  }

  // 5. POST /api/detect/audio
  async detectAudio(file: File | null, presetMode?: 'human' | 'clone'): Promise<AudioDetectResult> {
    if (this.shouldTryLive && file) {
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetchWithTimeout(`${this.apiBase}/api/detect/audio`, {
          method: 'POST',
          body: form,
        }, 8000);
        if (res.ok) {
          const data = await res.json();
          const fallback = await runLocalAudioDetect(file, presetMode);
          return {
            verdict: data.verdict ?? fallback.verdict,
            confidence: Number(data.confidence ?? fallback.confidence),
            vocoder_shelf_khz: Number(data.vocoder_shelf_khz ?? data.cutoff_khz ?? 11.2),
            cutoff_detected: Boolean(data.cutoff_detected ?? fallback.cutoff_detected),
            glottal_kurtosis: Number(data.glottal_kurtosis ?? data.kurtosis ?? fallback.glottal_kurtosis),
            glottal_skewness: Number(data.glottal_skewness ?? data.skewness ?? fallback.glottal_skewness),
            crest_factor_db: Number(data.crest_factor_db ?? data.crest_factor ?? fallback.crest_factor_db),
            waveform: Array.isArray(data.waveform) && data.waveform.length > 0 ? data.waveform : fallback.waveform,
            spectrum_bins: fallback.spectrum_bins,
            explanation: data.explanation ?? fallback.explanation,
            source: 'live',
          };
        }
      } catch {
        // Fallback
      }
    }
    return runLocalAudioDetect(file, presetMode);
  }

  // 6. POST /api/vault/register
  async registerVault(file: File, ownerId: string, title: string): Promise<{ item: VaultItem; source: ExecutionMode }> {
    const [sha256, dhash] = await Promise.all([computeSha256(file), computeDHash(file)]);
    const thumbUrl = URL.createObjectURL(file);

    if (this.shouldTryLive) {
      try {
        const form = new FormData();
        form.append('file', file);
        form.append('owner_id', ownerId);
        form.append('title', title);
        const res = await fetchWithTimeout(`${this.apiBase}/api/vault/register`, {
          method: 'POST',
          body: form,
        }, 6000);
        if (res.ok) {
          const data = await res.json();
          const item: VaultItem = {
            id: data.id ?? data.point_id ?? `qdrant-${Date.now()}`,
            owner_id: ownerId,
            title,
            sha256: data.sha256 ?? sha256,
            dhash: data.dhash ?? dhash,
            registered_at: data.registered_at ?? new Date().toISOString(),
            thumbnail_url: thumbUrl,
            collection: 'truthlens_vault',
          };
          localVaultStore.unshift(item);
          return { item, source: 'live' };
        }
      } catch {
        // Fallback
      }
    }

    const item: VaultItem = {
      id: `vault-${Date.now().toString(36)}`,
      owner_id: ownerId,
      title,
      sha256,
      dhash,
      registered_at: new Date().toISOString(),
      thumbnail_url: thumbUrl,
      collection: 'truthlens_vault',
    };
    localVaultStore.unshift(item);
    return { item, source: 'edge-demo' };
  }

  getLocalVaultItems(): VaultItem[] {
    return [...localVaultStore];
  }

  // 7. POST /api/vault/verify
  async verifyVault(file: File): Promise<VaultVerifyResult> {
    const [querySha, queryDhash] = await Promise.all([computeSha256(file), computeDHash(file)]);

    if (this.shouldTryLive) {
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetchWithTimeout(`${this.apiBase}/api/vault/verify`, {
          method: 'POST',
          body: form,
        }, 6000);
        if (res.ok) {
          const data = await res.json();
          const dist = Number(data.hamming_distance ?? 64);
          return {
            match_found: Boolean(data.match_found ?? dist <= 10),
            query_dhash: data.query_dhash ?? queryDhash,
            query_sha256: data.query_sha256 ?? querySha,
            hamming_distance: dist,
            similarity_pct: Number((((64 - dist) / 64) * 100).toFixed(1)),
            threshold: 10,
            matched_record: data.matched_record ?? null,
            verdict: dist === 0 ? 'EXACT_ORIGINAL' : dist <= 10 ? 'DERIVATIVE_MATCH' : 'UNREGISTERED',
            source: 'live',
          };
        }
      } catch {
        // Fallback
      }
    }

    // Search local Qdrant-emulated collection by Hamming distance <= 10
    let bestItem: VaultItem | null = null;
    let bestDist = 64;
    for (const item of localVaultStore) {
      const dist = hammingDistanceHex(queryDhash, item.dhash);
      if (dist < bestDist) {
        bestDist = dist;
        bestItem = item;
      }
    }

    const matchFound = bestItem !== null && bestDist <= 10;
    return {
      match_found: matchFound,
      query_dhash: queryDhash,
      query_sha256: querySha,
      hamming_distance: bestDist,
      similarity_pct: Number((((64 - bestDist) / 64) * 100).toFixed(1)),
      threshold: 10,
      matched_record: matchFound ? bestItem : null,
      verdict: !matchFound ? 'UNREGISTERED' : bestDist === 0 ? 'EXACT_ORIGINAL' : 'DERIVATIVE_MATCH',
      source: 'edge-demo',
    };
  }

  // 8. POST /api/amplify/pre-share-check
  async preShareCheck(payload: PreShareCheckPayload): Promise<PreShareCheckResult> {
    if (this.shouldTryLive) {
      try {
        const res = await fetchWithTimeout(`${this.apiBase}/api/amplify/pre-share-check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }, 4000);
        if (res.ok) {
          const data = await res.json();
          return {
            check_id: data.check_id ?? `chk-${Date.now()}`,
            friction_triggered: Boolean(data.friction_triggered ?? true),
            cooling_delay_seconds: Number(data.cooling_delay_seconds ?? 15),
            risk_level: data.risk_level ?? 'CRITICAL_VIRAL',
            velocity_score: Number(data.velocity_score ?? 88),
            projected_24h_reach: Number(data.projected_24h_reach ?? 4820),
            warning_headline: data.warning_headline ?? 'High-Velocity Forward Detected — Pause 15s',
            warning_body:
              data.warning_body ??
              'This media shows signs of manipulation and viral amplification. Pausing interrupts the virality loop.',
            source: 'live',
          };
        }
      } catch {
        // Fallback
      }
    }

    const urgentKeywords = /urgent|shocking|breaking|viral|leaked|forward|exposed|scam/i.test(
      payload.message_text
    );
    const velocityScore = Math.min(
      99,
      Math.round(payload.forward_count * 12 + (payload.has_media ? 28 : 8) + (urgentKeywords ? 22 : 0))
    );
    const frictionTriggered = velocityScore >= 45 || payload.forward_count >= 3;
    const projectedReach = Math.round(140 * Math.pow(1.62, Math.min(9, payload.forward_count + (payload.has_media ? 2 : 0))));

    return {
      check_id: `chk-${Date.now().toString(36)}`,
      friction_triggered: frictionTriggered,
      cooling_delay_seconds: frictionTriggered ? 15 : 0,
      risk_level: velocityScore >= 75 ? 'CRITICAL_VIRAL' : velocityScore >= 45 ? 'ELEVATED' : 'LOW',
      velocity_score: velocityScore,
      projected_24h_reach: projectedReach,
      warning_headline: frictionTriggered
        ? 'Cognitive Cooling Active — Pause 15 Seconds Before Forwarding'
        : 'Low Virality Velocity — Standard Share Allowed',
      warning_body: frictionTriggered
        ? `Forwarded ${payload.forward_count}x with emotional urgency cues. Sharing now could expose ~${projectedReach.toLocaleString()} people within 24 hours before fact-checkers can respond.`
        : 'No viral cascade signature detected for this message.',
      source: 'edge-demo',
    };
  }

  // 9. POST /api/amplify/log-decision
  async logDecision(payload: {
    check_id: string;
    decision: 'abandon' | 'shared_anyway';
    seconds_paused: number;
  }): Promise<{ ok: boolean; source: ExecutionMode }> {
    localTelemetry.total_interventions += 1;
    localTelemetry.total_pause_seconds += payload.seconds_paused;
    if (payload.decision === 'abandon') {
      localTelemetry.abandoned_count += 1;
    } else {
      localTelemetry.shared_anyway_count += 1;
    }

    if (this.shouldTryLive) {
      try {
        const res = await fetchWithTimeout(`${this.apiBase}/api/amplify/log-decision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }, 3500);
        if (res.ok) return { ok: true, source: 'live' };
      } catch {
        // Fallback
      }
    }
    return { ok: true, source: 'edge-demo' };
  }

  // 10. GET /api/amplify/telemetry
  async getTelemetry(): Promise<TelemetryResponse> {
    if (this.shouldTryLive) {
      try {
        const res = await fetchWithTimeout(`${this.apiBase}/api/amplify/telemetry`, {}, 3000);
        if (res.ok) {
          const data = await res.json();
          const total = Number(data.total_interventions ?? localTelemetry.total_interventions);
          const abandoned = Number(data.abandoned_count ?? localTelemetry.abandoned_count);
          const computedRate = total > 0 ? Number(((abandoned / total) * 100).toFixed(1)) : 0;
          return {
            total_interventions: total,
            abandoned_count: abandoned,
            shared_anyway_count: Number(data.shared_anyway_count ?? localTelemetry.shared_anyway_count),
            abandonment_rate: Number(data.abandonment_rate ?? computedRate),
            dampening_factor: Number(data.dampening_factor ?? Number((computedRate / 100).toFixed(2))),
            avg_pause_seconds: Number(data.avg_pause_seconds ?? 14.5),
            source: 'live',
          };
        }
      } catch {
        // Fallback
      }
    }

    const rate =
      localTelemetry.total_interventions > 0
        ? Number(((localTelemetry.abandoned_count / localTelemetry.total_interventions) * 100).toFixed(1))
        : 0;
    return {
      total_interventions: localTelemetry.total_interventions,
      abandoned_count: localTelemetry.abandoned_count,
      shared_anyway_count: localTelemetry.shared_anyway_count,
      abandonment_rate: rate,
      dampening_factor: Number((rate / 100).toFixed(2)),
      avg_pause_seconds: Number(
        (localTelemetry.total_pause_seconds / Math.max(1, localTelemetry.total_interventions)).toFixed(1)
      ),
      source: 'edge-demo',
    };
  }

  // 11. POST /api/simulate
  async simulateVirality(params: {
    hours: number;
    p_forward: number;
    friction_enabled: boolean;
    cooling_delay_seconds: number;
    seed_sharers?: number;
  }): Promise<SimulationResponse> {
    params = { seed_sharers: 100, ...params };
    if (this.shouldTryLive) {
      try {
        const res = await fetchWithTimeout(`${this.apiBase}/api/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        }, 4000);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.curve) && data.curve.length > 0) {
            return { ...data, source: 'live' };
          }
        }
      } catch {
        // Fallback
      }
    }
    return runLocalViralitySimulation(params);
  }

  // 12. POST /api/debunk/sticker-card
  async generateDebunkSticker(file: File | null, dhash?: string): Promise<DebunkStickerResult> {
    if (this.shouldTryLive && file) {
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetchWithTimeout(`${this.apiBase}/api/debunk/sticker-card`, {
          method: 'POST',
          body: form,
        }, 6000);
        if (res.ok) {
          const data = await res.json();
          const local = await generateLocalDebunkSticker(file, dhash);
          return {
            sticker_png_data_url: data.sticker_png_base64
              ? `data:image/png;base64,${data.sticker_png_base64}`
              : local.sticker_png_data_url,
            counter_narrative_en: data.counter_narrative ?? local.counter_narrative_en,
            counter_narrative_hi: data.counter_narrative_hi ?? local.counter_narrative_hi,
            dhash: data.dhash ?? local.dhash,
            generated_at: new Date().toISOString(),
            source: 'live',
          };
        }
      } catch {
        // Fallback
      }
    }
    return generateLocalDebunkSticker(file, dhash);
  }

  // 13. POST /api/legal/evidence-dossier
  async generateEvidenceDossier(params: {
    file: File | null;
    victimName: string;
    suspectIdentifier: string;
    dhash?: string;
    sha256?: string;
  }): Promise<EvidenceDossierResult> {
    const sha256 =
      params.sha256 ||
      (params.file
        ? await computeSha256(params.file)
        : 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    const dhash =
      params.dhash || (params.file ? await computeDHash(params.file) : '9e4c3a1f82b07d55');

    if (this.shouldTryLive && params.file) {
      try {
        const form = new FormData();
        form.append('file', params.file);
        form.append('victim_name', params.victimName);
        form.append('suspect_identifier', params.suspectIdentifier);
        const res = await fetchWithTimeout(`${this.apiBase}/api/legal/evidence-dossier`, {
          method: 'POST',
          body: form,
        }, 7000);
        if (res.ok) {
          const data = await res.json();
          const local = buildLocalEvidenceDossier({
            victimName: params.victimName,
            suspectIdentifier: params.suspectIdentifier,
            filename: params.file.name,
            sha256,
            dhash,
          });
          return {
            case_reference: data.case_reference ?? local.case_reference,
            sha256: data.sha256 ?? sha256,
            dhash: data.dhash ?? dhash,
            generated_at: data.generated_at ?? local.generated_at,
            section_63_bsa_certificate:
              data.section_63_bsa_certificate ?? local.section_63_bsa_certificate,
            cyber_cell_complaint: data.cyber_cell_complaint ?? local.cyber_cell_complaint,
            section_67c_preservation_notice:
              data.section_67c_preservation_notice ?? local.section_67c_preservation_notice,
            source: 'live',
          };
        }
      } catch {
        // Fallback
      }
    }

    return buildLocalEvidenceDossier({
      victimName: params.victimName,
      suspectIdentifier: params.suspectIdentifier,
      filename: params.file?.name ?? 'preserved_exhibit.png',
      sha256,
      dhash,
    });
  }

  // 14. POST /api/takedown/generate
  async generateTakedown(params: {
    victimName: string;
    victimEmail: string;
    platform: string;
    infringingUrl: string;
    description: string;
    sha256?: string;
  }): Promise<TakedownNoticeResult> {
    if (this.shouldTryLive) {
      try {
        const res = await fetchWithTimeout(`${this.apiBase}/api/takedown/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            victim_name: params.victimName,
            victim_email: params.victimEmail,
            platform: params.platform,
            infringing_url: params.infringingUrl,
            description: params.description,
            sha256: params.sha256,
          }),
        }, 5000);
        if (res.ok) {
          const data = await res.json();
          const local = buildLocalTakedownNotice(params);
          return {
            notice_id: data.notice_id ?? local.notice_id,
            platform: data.platform ?? params.platform,
            deadline_iso: data.deadline_iso ?? local.deadline_iso,
            legal_basis: data.legal_basis ?? local.legal_basis,
            notice_text: data.notice_text ?? data.notice ?? local.notice_text,
            source: 'live',
          };
        }
      } catch {
        // Fallback
      }
    }
    return buildLocalTakedownNotice(params);
  }
}

const DEFAULT_API_INFO: ApiInfoResponse = {
  name: 'TruthLens Systems Engine',
  version: '2.2.0',
  leverage_points: [
    {
      id: 'L1',
      stage: 'At Creation',
      title: 'Origin Derivative Vault (Qdrant)',
      mechanism: 'SHA-256 + 64-bit dHash perceptual vector proof (Hamming distance ≤ 10)',
    },
    {
      id: 'L2',
      stage: 'At Amplification',
      title: 'Cognitive Cooling & Outrage Damping',
      mechanism: '15s WhatsApp pre-share friction + Donella Meadows stock-and-flow simulation',
    },
    {
      id: 'L3',
      stage: 'At Victim',
      title: 'Crisis Coach + Grassroots Debunk + Legal Shield',
      mechanism: 'Gemini Live Hindi/English calm loop, BSA Sec 63, IT Act Sec 67C & Rule 3(2)(b)',
    },
  ],
  supported_modalities: [
    'Image Forensics (ELA + 64-bit dHash)',
    'Provenance (Google SynthID + C2PA + IPTC)',
    'Voice Forensics (SciPy 11.2 kHz FFT Vocoder + Glottal Kurtosis)',
    'Live KYC / Video Call Liveness & Impersonation Telemetry',
  ],
  architecture:
    'Zero-Cloud Edge Forensics (Gemma On-Device + SciPy/OpenCV) + Gemini API Multimodal + Gemini Live + Qdrant Vector DB + OpenWA Gateway + Cloud Run (asia-south1 DPDP)',
  source: 'edge-demo',
};
