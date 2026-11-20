# TruthLens — Break the Deepfake Loop

> **Systems Thinking + Google Gemini AI to stop deepfake virality, protect mental health, and restore institutional trust.**
>
> Built for **Google AI Startup Buildathon 2026 (India • Hypothetica)** by **Gaurav Singh (Jaipur)** & **Ankita Sinha (Bengaluru - Remote)**.

---

## 🎬 25-Second Investor Pitch Video & Funding Demo

TruthLens features an in-app **720p HD Product Demo & Pitch Walkthrough** (`/truthlens_demo_walkthrough.mp4`) with synchronized Indian-English voice narration and an ambient cybernetic tech score:

- **Hook:** *"What if a viral deepfake destroyed your reputation before you even woke up?"*
- **Problem Asymmetry:** Damage spreads in 2 hours; legal takedowns take 2 whole days.
- **Breakthrough:** Systems leverage points (Donella Meadows) + Google Gemini multimodal reasoning.
- **Forensics & Action:** Zero-cloud Error Level Analysis (ELA) <2s, Origin Vault (Qdrant), 15s Cognitive Cooling friction, Section 63 BSA 2023 court certificates, and 1-click Cyber Cell (`1930` / `cybercrime.gov.in`) reporting.

> **Accessing the Video in App:**
> 1. In the **Overview** tab, click **"Watch 25s Pitch Video"** or play the embedded theater.
> 2. Direct download button for the **720p MP4 Video** is available right on the page.
> *(Official slide presentation is submitted as a separate PPT to judges).*

---

## Why TruthLens?

Deepfakes do not fail because of a missing classifier — they ride **three reinforcing feedback loops** where damage goes viral in **2 hours** while manual takedowns take **2 days**:

1. **Virality Loop:** AI Tool → Shocking Fake → Algorithm Boosts → More Shares
2. **Mental Health Loop:** Victim Sees Fake → Anxiety / Shame → Withdrawal → Deeper Harm
3. **Trust Collapse Loop:** No One Trusts Media → Real Victims Ignored → Society Divides

**India is ground zero:** WhatsApp forwards spread fakes fastest, and women and creators are the most targeted.

Guided by **Donella Meadows' Leverage Points** ("change the structure, not the symptom"), TruthLens maps every fake as a causal graph (`Creator → Platform → Sharers → Victim`), and the AI picks the **one intervention with maximum harm reduction**, rather than playing detection whack-a-mole:

| Leverage Point | Stage | Mechanism |
| --- | --- | --- |
| **L0 — Edge Forensics** | Pre-Broadcast / Zero Cloud Cost | Error Level Analysis (ELA) heatmap, 64-bit dHash, Google SynthID, C2PA, IPTC AI metadata, and SciPy 11.2 kHz FFT voice vocoder shelf + glottal pulse kurtosis. |
| **L1 — At Creation** | Protect Originals | **Origin Derivative Vault** (Qdrant Vector DB `truthlens_vault`) seals SHA-256 + 64-bit dHash before media is faked, matching cropped/re-encoded derivatives within Hamming distance `≤ 10`. |
| **L2 — At Amplification** | Dampen Virality & Outrage | **15-second Cognitive Cooling** WhatsApp pre-share friction, Donella Meadows 24h stock-and-flow virality simulator, outrage-bait exposure streak guardrails, and coordinated bot/astroturfing downranking. |
| **L3 — At Victim** | Heal, Debunk & Enforce | **Gemini Live Crisis Coach** (English & हिंदी), 512×512 WhatsApp warning sticker cards, court-ready **Section 63 BSA 2023** dossier + **Section 67C IT Act / Sec 94 BNSS** CGNAT preservation notice, and **Rule 3(2)(b) IT Rules 2021** 24-hour intermediary takedowns. |

---

## 6 High-Impact Deployment Domains

TruthLens operates at the intersection of real-time synthetic media forensics, identity liveness, and algorithmic content hygiene across six verticals:

1. **Fintech, Banking & Remote KYC Onboarding** — Synthetic identity & virtual-camera injection defense during passive liveness checks; real-time voice-clone & video impersonation gating for high-value wire transfers, SIM swaps, and account recovery.
2. **Social Media, Messaging & Consumer Wellbeing** — Pre-share deepfake labeling (malicious impersonation vs. benign AI creative edits), outrage-bait streak cool-downs, and coordinated bot/astroturfing suppression.
3. **Enterprise Security & Remote Hiring** — Live video-conferencing Executive Impersonation Protection (BEC 2.0 on Zoom/Meet/Teams) and remote interview proxy-candidate face-swap/prompting verification.
4. **Journalism, Newsrooms & Civic Integrity** — Sub-2-second breaking-news UGC provenance verification (ELA + C2PA + SynthID) and election/public-figure speech defense.
5. **E-Commerce, Insurance & Gig Marketplaces** — Fraudulent delivery/insurance damage claim tamper detection and low-friction driver/seller Qdrant perceptual identity re-verification.
6. **Legal, Compliance & Digital Forensics** — Auditable evidentiary chain-of-custody validation, Section 63 BSA 2023 certification, Section 67C / Section 94 BNSS telecom preservation, and 24-hour Rule 3(2)(b) takedowns.

---

## Powered by Google AI

- **Gemini API Multimodal:** Artifact, lighting azimuth, face-blend boundary, and metadata mismatch reasoning.
- **Nano Banana:** Generates safe, zero-PII demo fakes to train users and simulate viral spread.
- **Gemini Live:** Bilingual Hindi/English voice crisis companion that guides victims out of panic.
- **Gemma On-Device:** Private, zero-cloud local forensic verification where photos never leave the user's device.
- **Google Cloud (`asia-south1` DPDP Compliant):** Cloud Run, Vertex AI, Firestore, and BigQuery.

---

## TruthLens API Reference & Integration Manual (v2.2.0)

### Service URLs

| Service | URL |
| --- | --- |
| **Base URL (FastAPI)** | <http://100.70.108.107:8000> |
| **Swagger UI** | <http://100.70.108.107:8000/docs> |
| **OpenWA Gateway** | <http://100.70.108.107:2785> |
| **Qdrant Vector DB** | <http://100.70.108.107:6333> |
| **Mixpost Hub** | <http://100.70.108.107:9000/mixpost> |
| **Android APK** | <http://100.70.108.107:8000/download/truthlens.apk> |

> **Note:** `100.70.108.107` is a Tailscale address. Your machine must be on the same Tailscale network to reach it. If it is unreachable, the React app falls back to its built-in **Edge Demo** engine automatically.

### 1. System & Mobile App Delivery

| Method | Endpoint | Payload / Description |
| --- | --- | --- |
| `GET` | `/demo` | Mobile-first PWA web interface with Material 3 bottom navigation and offline shell. |
| `GET` | `/download/truthlens.apk` | Direct download of the compiled and signed Android APK (v1.0.0). |
| `GET` | `/manifest.json` | PWA web manifest defining standalone Android launch properties. |
| `GET` | `/sw.js` | Service worker caching the core UI shell for instant offline loading. |
| `GET` | `/health` | System healthcheck confirming Redis, Postgres, and edge worker status. |
| `GET` | `/api/info` | Returns systems leverage points, supported modalities, and active architecture. |

### 2. Multimodal Edge Forensics (Zero Cloud Costs)

| Method | Endpoint | Payload / Description |
| --- | --- | --- |
| `POST` | `/api/detect` | Multipart `file`. Runs Error Level Analysis (ELA) heatmap + 64-bit dHash. |
| `POST` | `/api/detect/watermark` | Multipart `file`. Checks Google SynthID, C2PA manifest, and IPTC AI metadata. |
| `POST` | `/api/detect/audio` | Multipart voice note (`.opus` / `.wav` / `.mp3`). SciPy FFT vocoder shelf cutoff (11.2 kHz), glottal pulse kurtosis/skewness, crest factor, and waveform amplitude array. |

### 3. Origin Derivative Vault (Qdrant Vector DB)

| Method | Endpoint | Payload / Description |
| --- | --- | --- |
| `POST` | `/api/vault/register` | Multipart `file` + `owner_id` + `title`. Registers SHA-256 and 64-bit dHash vector in Qdrant collection `truthlens_vault`. |
| `POST` | `/api/vault/verify` | Multipart `file`. Computes perceptual hash and queries Qdrant for derivative matches within Hamming distance ≤ 10. |

### 4. Virality Damping & Cognitive Cooling

| Method | Endpoint | Payload / Description |
| --- | --- | --- |
| `POST` | `/api/amplify/pre-share-check` | JSON: `chat_id`, `message_text`, `forward_count`, `has_media`, `media_hash`. Evaluates velocity and triggers 15s cognitive cooling friction. |
| `POST` | `/api/amplify/log-decision` | JSON: `check_id`, `decision` (`abandon` \| `shared_anyway`), `seconds_paused`. Telemetry for behavioral friction effectiveness. |
| `GET` | `/api/amplify/telemetry` | Aggregated metrics: abandonment rate, dampening factor, total interventions. |
| `POST` | `/api/simulate` | JSON: `hours`, `p_forward`, `friction_enabled`, `cooling_delay_seconds`. Computes the Donella Meadows stock-and-flow 24-hour virality curve. |

### 5. Grassroots Debunking & Court-Ready Evidence

| Method | Endpoint | Payload / Description |
| --- | --- | --- |
| `POST` | `/api/debunk/sticker-card` | Multipart `file`. Auto-generates a high-contrast WhatsApp warning sticker card (PNG base64) + 1-tap counter-narrative text snippet. |
| `POST` | `/api/legal/evidence-dossier` | Multipart `file` + `victim_name` + `suspect_identifier`. Generates Section 63 BSA 2023 certificate, Cyber Cell complaint letter, and Section 67C IT Act / Sec 94 BNSS emergency preservation notice targeting Jamtara/Mewat ISP CGNAT and cell tower dumps. |
| `POST` | `/api/takedown/generate` | JSON: victim details, infringing URL. Generates a Rule 3(2)(b) IT Rules 2021 24-hour intermediary takedown notice. |

### Example `curl` Requests

```bash
BASE=http://100.70.108.107:8000

# Health & info
curl $BASE/health
curl $BASE/api/info

# Image forensics
curl -X POST $BASE/api/detect           -F "file=@sample.jpg"
curl -X POST $BASE/api/detect/watermark -F "file=@sample.jpg"

# Voice note forensics
curl -X POST $BASE/api/detect/audio -F "file=@voice_note.opus"

# Origin Vault
curl -X POST $BASE/api/vault/register -F "file=@original.jpg" -F "owner_id=ankita" -F "title=Official Portrait"
curl -X POST $BASE/api/vault/verify   -F "file=@suspect_copy.jpg"

# Cognitive cooling
curl -X POST $BASE/api/amplify/pre-share-check -H "Content-Type: application/json" \
  -d '{"chat_id":"grp-1","message_text":"URGENT forward!","forward_count":5,"has_media":true,"media_hash":"9e4c3a1f82b07d55"}'
curl -X POST $BASE/api/amplify/log-decision -H "Content-Type: application/json" \
  -d '{"check_id":"chk-123","decision":"abandon","seconds_paused":15}'
curl $BASE/api/amplify/telemetry

# Virality simulation
curl -X POST $BASE/api/simulate -H "Content-Type: application/json" \
  -d '{"hours":24,"p_forward":0.42,"friction_enabled":true,"cooling_delay_seconds":15}'

# Debunk & legal
curl -X POST $BASE/api/debunk/sticker-card -F "file=@fake.jpg"
curl -X POST $BASE/api/legal/evidence-dossier -F "file=@fake.jpg" -F "victim_name=Ankita Sinha" -F "suspect_identifier=+91-98XXXXXX42"
curl -X POST $BASE/api/takedown/generate -H "Content-Type: application/json" \
  -d '{"victim_name":"Ankita Sinha","victim_email":"ankita@example.in","platform":"Instagram","infringing_url":"https://instagram.com/p/xyz","description":"Morphed image"}'
```

---

## How to Run

### Prerequisites

- **Node.js 20+** and **npm** (check with `node -v` and `npm -v`)
- *(Optional)* **Tailscale**, connected to the team network, to use the live backend at `100.70.108.107`

### 1. Clone & install

```bash
git clone <your-repo-url> Truthlens
cd Truthlens
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

Open **<http://localhost:5173>** in your browser. To open it on a phone on the same Wi-Fi, use the `Network:` URL that Vite prints.

### 3. Pick an engine mode

Use the toggle in the top-right of the app:

- **Edge Demo** (default): everything runs in the browser (real ELA heatmaps, SHA-256, 64-bit dHash, virality simulation, sticker and legal document generation). No backend or network is needed, so this is the safest mode for a stage demo.
- **Live Server**: calls the FastAPI backend at `http://100.70.108.107:8000`. You can change the base URL in **API & Gateway → Server Routing**. If a request fails or times out, that call falls back to the Edge engine.

### 4. Check the backend (optional)

```bash
curl http://100.70.108.107:8000/health
```

Or, in the app, open **API & Gateway** and click **GET /health** in the Live JSON Probe Console.

> **CORS & the dev proxy:** in `npm run dev`, the app calls same-origin `/api/*`, `/health` and `/download/*`, and Vite forwards them to the backend, so there are no CORS problems locally. To point at a different backend, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`. For production builds (or if you type a custom URL in the app), the browser calls the backend directly, so FastAPI must allow your frontend origin in `CORSMiddleware`.

### 5. Production build

```bash
npm run build     # type-checks with tsc, then bundles into dist/
npm run preview   # serves the production build locally
```

You can deploy the `dist/` folder to any static host (Firebase Hosting, Cloud Run + nginx, Netlify, etc.).

### Install the Android app

Download the APK on an Android phone that is connected to Tailscale: <http://100.70.108.107:8000/download/truthlens.apk>

---

## Project Structure

```text
├── public/
│   ├── truthlens_demo_walkthrough.mp4 # 720p HD pitch video with synchronized narration & soundtrack
│   ├── deck/                          # 5-Slide pitch deck PNGs + official PDF download
│   │   ├── slide1.png ... slide5.png
│   │   └── truthlens_pitch_deck.pdf
│   ├── reactions/                     # High-res illustrated reaction & causal graph artwork
│   │   ├── hero_forensic_scanner.png  # Biometric laser split-scanner hero artwork
│   │   ├── loop1_virality.png ... loop3_trust_collapse.png
│   │   ├── node1_creator.png ... node4_victim.png
│   │   ├── domain1_fintech.png ... domain6_legal.png
│   │   ├── google_ai_constellation.png
│   │   └── server_telemetry_hub.png
│   ├── manifest.json                  # Standalone PWA manifest
│   └── sw.js                          # Offline shell Service Worker
├── src/
│   ├── components/
│   │   ├── OverviewView.tsx           # Hero split-scanner, 25s Video Theater, 3 Loops, Causal Graph & Health
│   │   ├── PitchDeckView.tsx          # 5-Slide interactive carousel + 25s Pitch Video stage + PDF/MP4 download
│   │   ├── ForensicsView.tsx          # ELA Split Viewer, URL scanning, SynthID/C2PA & 11.2 kHz Audio FFT
│   │   ├── VaultView.tsx              # Qdrant Origin Vault & 64-bit Hamming Matrix
│   │   ├── DampenView.tsx             # 15s Cognitive Cooling, 24h Simulator & Outrage Guardrail
│   │   ├── HealLegalView.tsx          # 1-Click Cyber Cell (1930 / cybercrime.gov.in), BSA 63 & Rule 3(2)(b)
│   │   ├── SolutionsView.tsx          # 6 Industry Verticals & Live Policy Gate Simulators
│   │   └── SystemApiView.tsx          # Live 18-Endpoint API Probe Console & Gateways
│   ├── lib/
│   │   ├── api.ts                     # TruthLens v2.2.0 Client (Live API + Edge Fallback)
│   │   ├── forensics.ts               # Client-side ELA, dHash, SHA-256, Sticker & Legal Engine
│   │   └── i18n.ts                    # English & Hindi (हिंदी) localization
│   ├── types/truthlens.ts             # Strict TypeScript domain & API contracts
│   ├── App.tsx                        # Responsive Cybernetic Sidebar + Mobile Material 3 Shell
│   └── main.tsx                       # App entry & Service Worker registration
├── BACKEND_API_REQUESTS.md            # Backend developer specifications & mock schema
└── package.json
```

---

## 🚀 Live Demo & Investor Walkthrough Guide

To test or present TruthLens live to judges and investors:

1. **Watch the Pitch Video:**
   - Go to **Overview** → Click **"Watch 25s Pitch Video"** or switch to the **Pitch Deck** view.
   - Enjoy the synchronized narration and soundtrack explaining the core systems thesis.
2. **How to Upload & Scan Media:**
   - Navigate to **Detect & Heatmap** (`/detect`).
   - **Option A (Instant 1-Click Presets):** Click *"Shocking Morph (AI Deepfake)"* or *"C2PA Signed (Authentic Camera)"* under Nano Banana Presets to see instantaneous ELA heatmap generation and metadata badges without uploading local files.
   - **Option B (Drag & Drop):** Drag any suspect image directly onto the dropzone.
   - **Option C (Image URL):** Paste any direct image link (`http(s)://...jpg`) into the URL bar and click **Analyze Link**.
   - **Option D (Voice Notes):** Toggle to **Voice Note FFT** to test synthetic voice vocoder cutoff at 11.2 kHz.
3. **Simulate WhatsApp Virality Damping:**
   - Navigate to **Amplify & Dampen** (`/dampen`).
   - Trigger the **15-second Cognitive Cooling** countdown and inspect the Donella Meadows 24h harm reduction curve.
4. **Generate Court-Ready Legal Dossiers:**
   - Navigate to **Heal & Legal** (`/heal`).
   - Fill in victim details to auto-generate a **Section 63 BSA 2023** certificate, an **Indian Cyber Cell Complaint Letter**, and direct emergency links to **1930** and **cybercrime.gov.in**.

---

## Roadmap (from the pitch deck)

- [x] **Detect:** upload an image **or paste a link** → Real / AI / Manipulated score in <2 seconds, with an ELA heatmap
- [x] **Protect:** Origin Vault invisible fingerprint ("My Real Vault" with Qdrant vector distance)
- [x] **Heal & Enforce:** AI companion, evidence kit, takedown draft, Section 63 BSA certificate, and direct Cyber Cell (`1930` / `cybercrime.gov.in` / Tele-MANAS `14416`) integration
- [x] **Simulate:** "What if I share this?", showing 24h harm if 100 people share with Donella Meadows stock-and-flow curves
- [x] **Video Pitch Theater:** 25s synced video walkthrough with audio score & voice narration (Slide deck submitted separately as official PPT)
- [x] **Dual Localization:** Full English & Hindi (हिंदी) UI with soothing cybernetic glow theme
- [ ] **Chrome extension** (manifest prepared; standalone extension in progress)
- [ ] **8 Additional Indian languages** (EN + HI completed; regional language pack pending backend tokenization)
- [ ] Direct Gemini Live WebSocket streaming for real-time crisis audio coaching

**Methods:** Causal Inference (Erica) • Systems Dynamics (Schemo) • Gemini Multimodal

---

## Team

- **Gaurav Singh** (Jaipur) — *Systems Architecture, Backend APIs & Forensic Algorithms*
- **Ankita Sinha** (Bengaluru - Remote) — *Frontend UI/UX, Legal Compliance & AI Integration*
