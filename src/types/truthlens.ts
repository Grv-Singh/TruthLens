export type NavTab =
  | 'overview'
  | 'deck'
  | 'detect'
  | 'vault'
  | 'dampen'
  | 'heal'
  | 'solutions'
  | 'system';

export type DomainId =
  | 'fintech'
  | 'social'
  | 'enterprise'
  | 'journalism'
  | 'commerce'
  | 'legal';

export type Language = 'en' | 'hi';

export type ExecutionMode = 'live' | 'edge-demo';

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'offline';
  version?: string;
  services: {
    redis: string;
    postgres: string;
    qdrant: string;
    edge_workers: string;
    openwa_gateway?: string;
  };
  latency_ms?: number;
  source: ExecutionMode;
}

export interface ApiInfoResponse {
  name: string;
  version: string;
  leverage_points: {
    id: string;
    stage: string;
    title: string;
    mechanism: string;
  }[];
  supported_modalities: string[];
  architecture: string;
  source: ExecutionMode;
}

export interface DetectResult {
  verdict: 'REAL' | 'AI_GENERATED' | 'MANIPULATED';
  confidence: number;
  manipulation_score: number;
  dhash: string;
  sha256: string;
  ela_heatmap_url: string;
  ela_mean_error: number;
  ela_peak_zones: string[];
  gemini_notes: string[];
  processing_ms: number;
  source: ExecutionMode;
}

export interface WatermarkResult {
  synthid_detected: boolean;
  synthid_confidence: number;
  c2pa_present: boolean;
  c2pa_issuer: string | null;
  iptc_ai_flag: boolean;
  iptc_digital_source_type: string;
  provenance_summary: string;
  source: ExecutionMode;
}

export interface AudioDetectResult {
  verdict: 'HUMAN_VOICE' | 'SYNTHETIC_CLONE' | 'SUSPICIOUS_VOCODER';
  confidence: number;
  vocoder_shelf_khz: number;
  cutoff_detected: boolean;
  glottal_kurtosis: number;
  glottal_skewness: number;
  crest_factor_db: number;
  waveform: number[];
  spectrum_bins: { freqKhz: number; magnitudeDb: number }[];
  explanation: string;
  source: ExecutionMode;
}

export interface VaultItem {
  id: string;
  owner_id: string;
  title: string;
  sha256: string;
  dhash: string;
  registered_at: string;
  thumbnail_url?: string;
  collection: string;
}

export interface VaultVerifyResult {
  match_found: boolean;
  query_dhash: string;
  query_sha256: string;
  hamming_distance: number;
  similarity_pct: number;
  threshold: number;
  matched_record: VaultItem | null;
  verdict: 'EXACT_ORIGINAL' | 'DERIVATIVE_MATCH' | 'UNREGISTERED';
  source: ExecutionMode;
}

export interface PreShareCheckPayload {
  chat_id: string;
  message_text: string;
  forward_count: number;
  has_media: boolean;
  media_hash: string;
}

export interface PreShareCheckResult {
  check_id: string;
  friction_triggered: boolean;
  cooling_delay_seconds: number;
  risk_level: 'LOW' | 'ELEVATED' | 'CRITICAL_VIRAL';
  velocity_score: number;
  projected_24h_reach: number;
  warning_headline: string;
  warning_body: string;
  source: ExecutionMode;
}

export interface TelemetryResponse {
  total_interventions: number;
  abandoned_count: number;
  shared_anyway_count: number;
  abandonment_rate: number;
  dampening_factor: number;
  avg_pause_seconds: number;
  source: ExecutionMode;
}

export interface SimulationPoint {
  hour: number;
  unmitigated_reach: number;
  dampened_reach: number;
  active_sharers_unmitigated: number;
  active_sharers_dampened: number;
}

export interface SimulationResponse {
  hours: number;
  p_forward: number;
  friction_enabled: boolean;
  cooling_delay_seconds: number;
  r0_unmitigated: number;
  r0_dampened: number;
  peak_unmitigated: number;
  peak_dampened: number;
  harm_prevented_pct: number;
  curve: SimulationPoint[];
  source: ExecutionMode;
}

export interface DebunkStickerResult {
  sticker_png_data_url: string;
  counter_narrative_en: string;
  counter_narrative_hi: string;
  dhash: string;
  generated_at: string;
  source: ExecutionMode;
}

export interface EvidenceDossierResult {
  case_reference: string;
  sha256: string;
  dhash: string;
  generated_at: string;
  section_63_bsa_certificate: string;
  cyber_cell_complaint: string;
  section_67c_preservation_notice: string;
  source: ExecutionMode;
}

export interface TakedownNoticeResult {
  notice_id: string;
  platform: string;
  deadline_iso: string;
  legal_basis: string;
  notice_text: string;
  source: ExecutionMode;
}

export interface SharedMediaContext {
  file: File | null;
  previewUrl: string | null;
  filename: string;
  dhash?: string;
  sha256?: string;
  verdict?: DetectResult['verdict'];
}
