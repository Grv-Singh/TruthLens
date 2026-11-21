# TruthLens Backend API Reference (v2.2.0)

**Base URL**: `http://100.70.108.107:8000` (Direct) or `http://192.168.1.216:8000` (LAN)  
**Interactive Docs**: `http://100.70.108.107:8000/docs` (Swagger UI)  
**OpenWA Gateway**: `http://100.70.108.107:2785` | **Mixpost**: `http://100.70.108.107:9000/mixpost`

---

## 1. System & App Delivery
- `GET /` & `GET /demo`: Mobile-first responsive Web App UI (PWA).
- `GET /health`: Healthcheck endpoint (`{"status": "healthy"}`).
- `GET /api/info`: Architectural system overview & leverage points.
- `GET /manifest.json`: Progressive Web App (PWA) manifest.
- `GET /sw.js`: PWA Service Worker for offline shell caching.
- `GET /download/truthlens.apk`: Standalone Android APK download (`Content-Type: application/vnd.android.package-archive`).

---

## 2. Multimodal Edge Forensics (Zero Cloud Costs)
- `POST /api/detect`:
  - **Payload**: `multipart/form-data` with `file`.
  - **Output**: Error Level Analysis (ELA) compression heatmap (base64 PNG) + 64-bit dHash + MD5/SHA-256.
- `POST /api/detect/watermark`:
  - **Payload**: `multipart/form-data` with `file`.
  - **Output**: Google SynthID, C2PA, and IPTC `trainedAlgorithmicMedia` provenance detection.
- `POST /api/detect/audio`:
  - **Payload**: `multipart/form-data` with `file` (`.opus`, `.wav`, `.mp3`, `.ogg`, `.m4a`).
  - **Output**: SciPy FFT vocoder shelf detection (11.2 kHz cutoff), glottal pulse kurtosis/skewness, crest factor, digital silence detection, waveform peaks array (for mobile visualizer).

---

## 3. Origin Derivative Vault (Qdrant Vector DB)
- `POST /api/vault/register`:
  - **Payload**: `file` (`multipart/form-data`), `owner_id` (string), `title` (string).
  - **Output**: SHA-256 hash, 64-bit dHash vector registered in Qdrant collection `truthlens_vault`.
- `POST /api/vault/verify`:
  - **Payload**: `file` (`multipart/form-data`).
  - **Output**: Hamming distance check against registered originals to identify manipulated derivatives.

---

## 4. Pre-Share Cognitive Cooling & Virality Simulation
- `POST /api/amplify/pre-share-check`:
  - **Payload**: JSON `{"chat_id": str, "message_text": str, "forward_count": int, "has_media": bool, "media_hash": str}`.
  - **Output**: Virality velocity, affective polarity index, cognitive cooling friction requirement (`requires_friction: bool`, `delay_seconds: 15`).
- `POST /api/amplify/log-decision`:
  - **Payload**: JSON `{"check_id": str, "decision": "abandon" | "shared_anyway", "seconds_paused": int}`.
  - **Output**: Friction telemetry log confirmation.
- `GET /api/amplify/telemetry`:
  - **Output**: Virality damping stats (total checked, abandoned vs forwarded, damping %).
- `POST /api/simulate`:
  - **Payload**: JSON `{"hours": 24, "p_forward": 0.45, "friction_enabled": true, "cooling_delay_seconds": 15}`.
  - **Output**: Donella Meadows stock-and-flow time-series curve for infected nodes vs intervention damping.

---

## 5. Grassroots WhatsApp Counter-Narrative & Debunking
- `POST /api/debunk/sticker-card`:
  - **Payload**: `multipart/form-data` with `file`.
  - **Output**: High-contrast WhatsApp warning sticker card (PNG base64) + ready-to-paste 1-tap WhatsApp counter-narrative text snippet.

---

## 6. Court Evidence & Jamtara/Mewat IPDR Legal Pack
- `POST /api/legal/evidence-dossier`:
  - **Payload**: `file` (`multipart/form-data`), `victim_name` (string), `suspect_identifier` (string).
  - **Output**:
    1. Section 63 Bharatiya Sakshya Adhiniyam (BSA) 2023 Electronic Evidence Certificate.
    2. Formal Police Cyber Cell Complaint Letter.
    3. Section 67C IT Act & Section 94 BNSS Emergency Telecom Preservation Notice for ISP CGNAT port mapping & Tower Cell ID dumps.
- `POST /api/takedown/generate`:
  - **Payload**: JSON with victim details and platform name.
  - **Output**: IT Rules 2021 statutory Rule 3(2)(b) 24-hour takedown notice.
