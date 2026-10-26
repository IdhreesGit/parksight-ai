# ParkSight AI — Smart Parking Platform (Review 3)

## 1. Project Overview

**ParkSight AI** is an AI Immersion Programme academic engineering project (**Task 01 — C29**, Rathinam Technical Campus, Coimbatore) designed to address parking-space search inefficiency and real-time occupancy visibility.

The platform integrates a React 19 + TypeScript + Vite frontend with an Express backend providing computer-vision occupancy analysis via an external YOLO HTTP adapter, 2D parking-bay polygon IoU geometry, 3-frame temporal hysteresis stabilization, explainable 100-point heuristic recommendations, entrance-aware indoor waypoint navigation, Holt's Double Exponential Smoothing forecasts, rule-based anomaly detection, and human-in-the-loop dispute feedback.

Local neural model weights are not bundled with the web application. Live YOLO neural inference is accessed through an external HTTP service (`YOLO_SERVICE_URL`). When that external service is unavailable, the system never fabricates live AI results—it explicitly reports **`YOLO SERVICE UNAVAILABLE — SIMULATED FALLBACK ACTIVE`**.

---

## 2. The Problem

Drivers spend unnecessary time cruising parking aisles when current stall availability is not visible at facility entrances.

Key operational challenges addressed:

- Unstable single-frame optical detection (pedestrian shadows, glare, transient headlights)
- Temporary visual occlusion and boundary straddling (`0.15 < IoU < 0.45`)
- Opaque "black-box" parking recommendations that drivers cannot verify
- Discrepancies between available, occupied, reserved, and maintenance stall counts
- Privacy concerns around camera imagery and license plates

---

## 3. Key Features & Review 3 Improvements

1. **Computer Vision Occupancy Analysis & PNG Preset Pipeline**  
   Processes uploaded frames and offscreen-rendered 640×360 PNG test scenes through an external YOLO HTTP adapter with explicit simulated fallback labeling.

2. **Spatial Parking-Bay IoU Geometry**  
   Computes exact 2D bounding-box-to-bay-polygon overlap without leaking prior stall status into IoU scores.

3. **3-Frame Temporal Stability State Machine**  
   Requires 3 consecutive matching observations (`confirmed_available` ↔ `candidate_occupied` ↔ `confirmed_occupied`) before committing transitions, while protecting `reserved` and `maintenance` stalls from automated CV overwrite.

4. **Verified Multi-Lot & 4×24 Section Capacity Accounting**  
   Enforces `availableBays + occupiedBays + reservedBays + maintenanceBays === totalBays` across all 4 campus facilities (`campus-deck`: 96 bays across 4 symmetrical 24-bay sections including `West Deck`; `north-lot`: 120; `south-lot`: 80; `visitor-deck`: 45) and preserves non-parkable stalls across simulation resets.

5. **Explainable 100-Point Recommendations & Entrance-Aware Routing**  
   Evaluates hard constraints (ADA, Level 2 EV, walking radius) and computes gate-specific walking distances from `Main Entrance (North)`, `East Walkway`, `South Ramp`, and `West Transit Center`.

6. **Short-Term Occupancy Prediction (Holt's Double Exponential Smoothing)**  
   Forecasts `+10m`, `+20m`, and `+30m` occupancy horizons with interactive level smoothing (`α`) and residual-derived 95% confidence bounds.

7. **Seedable Digital Twin Simulation**  
   Deterministic Mulberry32 PRNG traffic generator with live seed control and 6 operational benchmark presets (`morning_rush`, `midday_turnover`, `evening_exodus`, `night_lull`, `camera_failure`, `unusual_spike`).

8. **Rule-Based Anomaly Detection & Human Feedback Loop**  
   Flags surges, bay state chatter, saturation, and camera heartbeat drops with structured explanations, alongside crowd-sourced status dispute overrides.

9. **Server-Side Gemini Multimodal Scene Inspection**  
   Uses `@google/genai` (`gemini-3.8-flash`) with structured JSON schema on the Express backend when `GEMINI_API_KEY` is configured, falling back transparently when offline.

10. **Privacy by Design**  
    Processes frames transiently in memory, masks license identifiers, and performs zero facial recognition.

---

## 4. Architecture Pipeline

```text
Camera / Uploaded Image / 640x360 PNG Test Frame
                        ↓
        1. Data Acquisition & Frame Decode
                        ↓
        2. Pre-processing & Normalization
                        ↓
        3. External YOLO Adapter / Sim Fallback
                        ↓
        4. Spatial Bay IoU Occupancy Logic
           (≥0.45 Occupied, ≤0.15 Available, 0.15–0.45 Unknown)
                        ↓
        5. Temporal Stability Filter
           (3-Frame Hysteresis Confirmation)
                        ↓
        6. Authoritative Parking State Store
                        ↓
       ┌────────┼──────────┬─────────────┐
       ↓        ↓          ↓             ↓
   Dashboard  Events   Analytics   Rule Anomalies
   & 2D Map            & Holt (α)        ↓
                           ↓        Human Feedback
                    Recommendations
                           ↓
                   Indoor Navigation
```

---

## 5. Real vs Simulated Systems (Academic Transparency)

| Subsystem | Status | Description |
|---|---|---|
| Spatial 2D IoU & Hysteresis | REAL | Deterministic geometric overlap and 3-frame state machine |
| External YOLO Integration | INTEGRATION READY | HTTP adapter (`YOLO_SERVICE_URL`); requires external YOLO server for live neural inference |
| YOLO Offline Fallback | SIMULATED | Explicitly labeled `YOLO SERVICE UNAVAILABLE — SIMULATED FALLBACK ACTIVE` when external YOLO is unreachable |
| Gemini Scene Inspection | REAL WHEN CONFIGURED | Server-side `@google/genai` (`gemini-3.8-flash`) multimodal scene inspection |
| Digital Twin Traffic | SIMULATED | Mulberry32 PRNG arrival/departure simulation across 96 bays |
| Recommendation Engine | PROTOTYPE | Transparent 100-point multi-factor heuristic objective function |
| Demand Prediction | PROTOTYPE | Holt's Double Exponential Smoothing (`S_t`, `b_t`) with configurable `α` |
| Anomaly Detection | REAL (RULES) | Deterministic threshold rules over rolling telemetry |
| Indoor Navigation | PROTOTYPE | Entrance-aware 2D vector waypoint & ramp routing |

---

## 6. REST API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Service health check, runtime mode, and external YOLO configuration flag |
| GET | `/api/parking` | Authoritative 96-bay state, 4 facility lots, recent events, and active mode |
| GET | `/api/lots` | Multi-lot directory with verified `available + occupied + reserved + maintenance = total` math |
| GET | `/api/occupancy` | Live occupancy metrics (supports `?lotId=campus-deck\|north-lot\|south-lot\|visitor-deck`) |
| POST | `/api/recommendations` | Entrance-aware 100-point heuristic recommendations & hard constraint filtering |
| POST | `/api/recommendations/feedback` | Driver recommendation acceptance & rating feedback |
| GET | `/api/navigation/route` | Turn-by-turn indoor waypoint routing (`?bayId=&entrance=`) |
| GET | `/api/analytics` | Historical & diurnal time-series telemetry (`?range=today\|7d\|30d`) |
| GET | `/api/prediction` | Holt's Double Exponential Smoothing (`?horizon=10\|20\|30&alpha=0.1..0.8`) |
| GET | `/api/alerts` | Rule-based anomaly & operations alerts |
| POST | `/api/alerts/:id/read` | Acknowledge operational alert |
| POST | `/api/feedback` | Crowd-sourced bay status dispute override |
| POST | `/api/detection/analyze` | 6-stage CV pipeline with external YOLO adapter + honest fallback |
| POST | `/api/detection/propagate` | Propagate CV detections into authoritative store (protects reserved/maintenance stalls) |
| POST | `/api/vision/gemini-inspect` | Server-side Gemini 3.8 Flash multimodal environmental inspection (PNG/JPEG/WebP) |
| POST | `/api/simulation/settings` | Digital Twin speed, scenario presets, and Mulberry32 PRNG seed control |
| POST | `/api/simulation/step` | Advance deterministic simulation by 1 tick (+2 simulated minutes) |
| POST | `/api/simulation/reset` | Reset baseline while preserving reserved & maintenance bay allocations |
| GET | `/api/system-status` | Genuine subsystem health audit (`ONLINE` / `SIMULATED FALLBACK` / `NOT CONFIGURED`) |
| GET | `/api/observability` | Rolling API latency, tick rate, event counter, and error telemetry |

---

## 7. Running Locally & Verification

```bash
# Install dependencies
npm install

# Start full-stack Express + Vite server on port 3000
npm run dev

# Run 12-suite automated verification harness
npm test

# Type-check client and server TypeScript
npm run lint

# Build production SPA bundle and start Node 22 native TypeScript server
npm run build
npm start
```

Optional `.env` configuration (see `.env.example`):

```env
GEMINI_API_KEY="your-gemini-api-key"
YOLO_SERVICE_URL="http://localhost:8000/api/v1/yolo/detect"
```

---

## 8. Deployment & Vercel Serverless Support

- **Container / Node 22 Runtime**: Runs as a unified Express + SPA server via `npm run build && npm start` (`node server.ts` on port `3000`).
- **Vercel Serverless Compatibility (`vercel.json` + `api/index.ts`)**: Earlier static-only deployments (`https://parksight-ai-six.vercel.app`) served pre-rendered frontend assets without mounting Express, causing `/api/*` endpoints to return HTTP `404`. Review 3 includes `api/index.ts` and `vercel.json` rewrites so redeploying this repository to Vercel mounts the full Express `/api/*` router as a Vercel Serverless Function alongside the static Vite `dist/` bundle (with poll-driven simulation ticks when `process.env.VERCEL` is active). Because serverless functions keep in-memory state per warm lambda instance rather than across cold starts, full multi-instance persistence requires an external database or a single-container host.
