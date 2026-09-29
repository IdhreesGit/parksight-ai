# ParkSight AI — Smart Parking Platform (Review 2)

> **Academic Portfolio / AI Systems Prototype**  
> An advanced smart-parking platform providing computer-vision occupancy analysis with external YOLO integration, digital twin state simulation, explainable multi-factor recommendations, indoor navigation routing, and predictive time-series analytics.

---

## 1. PROJECT OVERVIEW
**ParkSight AI** is an academic AI engineering prototype built to address urban parking congestion, wasted fuel, and driver frustration. The platform provides computer-vision occupancy analysis with external YOLO integration, connecting vehicle detection telemetry to an end-to-end data pipeline with spatial IoU polygon matching, real-time bay occupancy classification, transparent driver recommendations, and operational anomaly detection. Local neural model weights are not bundled directly in the web runtime; instead, ParkSight integrates with external YOLO microservices (via standard HTTP endpoints) and automatically falls back safely to deterministic benchmark fixtures when offline.

---

## 2. THE PROBLEM
- **Urban Congestion**: Cruising for parking accounts for up to 30% of traffic congestion in dense campus and commercial districts.
- **Sensor Fragility**: Traditional single-frame computer vision suffers from optical flicker (glare, shadows, pedestrian occlusion) leading to erratic vacancy reporting.
- **Black-Box Guidance**: Typical smart parking solutions suggest spaces without explaining why, failing to accommodate electric vehicle charging needs, ADA mobility constraints, or walking distances.
- **Privacy Intrusion**: Conventional systems often capture invasive biometric or license-plate records.

---

## 3. KEY FEATURES
1. **Computer Vision & Occupancy Analysis**: Ingests image or video frames, normalizes inputs, interfaces with external YOLO inference services (or test benchmarks), and calculates spatial polygon Intersection-over-Union (IoU) to classify stall occupancy without fabricating model weights.
2. **Occupancy State Machine & Temporal Hysteresis**: Implements a 3-frame confirmation counter (`confirmed_available` &harr; `candidate_occupied` &harr; `confirmed_occupied`) eliminating single-frame sensor chatter.
3. **End-to-End Pipeline Propagation**: Detection results from uploaded frames or camera streams can be propagated directly into global parking state, dashboard KPIs, alerts, and recommendations.
4. **Explainable Multi-Factor Recommendations**: Transparent 100-point additive scoring combining availability, metric distance decay, ADA priority, EV charging alignment, and section congestion.
5. **Indoor Parking Navigation**: Turn-by-turn guidance and 2D vector waypoint routing from facility entrance gates to the designated parking stall.
6. **Time-Series Prediction**: Short-term occupancy forecasting (+10m, +20m, +30m) via Holt's Double Exponential Smoothing with dynamic 95% confidence intervals.
7. **Rule-Based Anomaly Detection**: Automated triggers for rapid occupancy surges (>15% in <60s), sensor chatter, facility saturation (>92%), and camera feed drops with explicit explanations: *What happened*, *Why flagged*, and *Recommended action*.
8. **Human Feedback Loop**: Crowd-sourced status dispute reporting and recommendation usefulness verification (`YES` / `NO`) stored in a calibration queue.
9. **Multimodal Scene Inspection**: Server-side Google Gemini 3.8 Flash evaluation of environmental conditions (lighting, glare, weather, obstructions).
10. **Privacy by Design**: Ephemeral frame processing, zero facial recognition, and synthetic license plate masking (`SIM-***42` / `REAL-***88`).

---

## 4. ARCHITECTURE PIPELINE
```
Camera / Uploaded Image / Video Frame
              ↓
    1. Data Acquisition & Decode
              ↓
    2. Pre-processing & Normalization (CLAHE, 640x360)
              ↓
    3. YOLO / Computer Vision Vehicle Detection
              ↓
    4. Spatial Bay IoU Overlap Logic (≥0.45 Occupied, ≤0.20 Available)
              ↓
    5. Temporal Stability Filter (3-Frame Confirmation Hysteresis)
              ↓
    6. Authoritative Digital Twin State Store
              ↓
    ┌─────────┼──────────┬──────────────┐
    ↓         ↓          ↓              ↓
Dashboard   Events   Analytics     Rule Anomalies
                       & Holt        & Dispatch
                     Prediction         ↓
                         ↓        Human Feedback
                   Recommendations
                         ↓
                  Indoor Navigation
```

---

## 5. REAL VS. SIMULATED SUBSYSTEMS

| Subsystem | Status | Description |
| :--- | :--- | :--- |
| **Pixel Vision / Frame Ingest** | `SIMULATED / TEST ANALYZER` | Canvas frame decoding and spatial IoU polygon evaluation; relies on YOLO adapter or benchmark test fixtures for bounding boxes (does not perform standalone neural vehicle detection without an external YOLO model). |
| **YOLO Microservice Interface** | `INTEGRATION READY` | Modular `HttpYoloServiceAdapter` connecting to external FastAPI/Ultralytics service; automatically reports `YOLO SERVICE UNAVAILABLE — SIMULATED FALLBACK ACTIVE` when offline. |
| **Gemini Scene Audit** | `REAL` | Server-side Gemini 3.8 Flash multimodal inspection passing base64 image data via `@google/genai`. |
| **Digital Twin Sim** | `SIMULATED` | Seedable Mulberry32 PRNG traffic dynamics, diurnal curves, and 3-frame temporal filter. |
| **Recommendation Engine**| `PROTOTYPE` | Transparent heuristic 100-point objective function with explainable weights. |
| **Demand Prediction** | `PROTOTYPE` | Holt's Double Exponential Smoothing (Level + Trend) computed over accumulated buffer. |
| **Anomaly Detection** | `REAL (RULES)` | Deterministic threshold-based operational rule engine (not black-box ML). |
| **Indoor Navigation** | `PROTOTYPE` | Vector waypoint route calculation from entrance to bay coordinates. |

---

## 6. COMPUTER VISION & BAY OCCUPANCY LOGIC
- **Spatial Overlap Evaluation**:
  $$\text{IoU} = \frac{\text{Area}(\text{BoundingBox} \cap \text{BayPolygon})}{\text{Area}(\text{BayPolygon})}$$
- **Classification Boundaries**:
  - $\text{IoU} \ge 0.45$: Candidate Occupied
  - $\text{IoU} \le 0.15$: Candidate Available
  - $0.15 < \text{IoU} < 0.45$: Indeterminate / Low Confidence (never falsely assumed available)
- **Zero Synthetic IoU Rule**: IoU is calculated strictly from geometric bounding box overlap; occupancy is never derived from existing or prior bay status.
- **Temporal Filter**: Requires 3 consecutive clock cycles of agreement before committing a state change to prevent false triggering from shadows or passing pedestrians.

---

## 7. RECOMMENDATION SCORING FORMULA
$$\text{Score} = S_{\text{avail}} (25) + S_{\text{dist}} (25) + S_{\text{ADA}} (15) + S_{\text{EV}} (15) + S_{\text{aisle}} (10) + S_{\text{stability}} (10)$$
- **Distance Decay**: $S_{\text{dist}} = 25 \times \max\left(0, 1 - \frac{d}{d_{\text{max}}}\right)^{1.1}$
- **Hard Constraints**: Strict ADA compliance and Level-2 EV requirements filter out non-compliant stalls prior to scoring.
- Scores are explicitly labeled in the UI as **Prototype Heuristic Scores**.

---

## 8. SHORT-TERM PREDICTION METHODOLOGY
- **Model**: Holt's Double Exponential Smoothing (Level + Trend Extrapolation)
  - Level: $S_t = \alpha Y_t + (1 - \alpha)(S_{t-1} + b_{t-1})$
  - Trend: $b_t = \beta (S_t - S_{t-1}) + (1 - \beta) b_{t-1}$
  - Forecast: $F_{t+m} = S_t + m \cdot b_t$
- **Horizons**: Evaluated at +10 min, +20 min, and +30 min with dynamic 95% confidence intervals derived from rolling squared residuals.
- **Terminology**: Explicitly documented as Holt's double exponential smoothing rather than claiming full seasonal Holt-Winters without periodic harmonic decomposition.

---

## 9. RULE-BASED ANOMALY DETECTION
1. `RULE_RAPID_OCCUPANCY_DELTA`: Delta $> 15\%$ within a 60-second window.
2. `RULE_BAY_FLICKER_CHATTER`: More than 2 state toggles in consecutive cycles.
3. `RULE_FACILITY_MAX_CAPACITY`: Overall facility occupancy $\ge 92\%$.
4. `RULE_CAMERA_HEARTBEAT_TIMEOUT`: RTSP camera stream socket timeout ($> 3000\text{ms}$).
5. `RULE_EV_INFRASTRUCTURE_MISMATCH`: Non-EV vehicle parked in an active charger stall.

---

## 10. REST API REFERENCE

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/parking` | Returns catalog of lots and all 96 parking bays |
| `GET` | `/api/occupancy` | Returns aggregate facility occupancy metrics |
| `POST` | `/api/recommendations` | Computes ranked bay recommendations & explanations |
| `POST` | `/api/recommendations/feedback` | Records driver acceptance (`YES`/`NO`) and rating |
| `GET` | `/api/navigation/route` | Returns indoor waypoint coordinates & turn-by-turn steps |
| `GET` | `/api/analytics` | Returns occupancy timeline & forecast details |
| `GET` | `/api/prediction` | Returns Holt forecast series (+10m, +20m, +30m) |
| `GET` | `/api/alerts` | Returns system alerts & anomaly status |
| `POST` | `/api/alerts/:id/read` | Acknowledges an active alert |
| `POST` | `/api/feedback` | Submits driver/attendant bay status dispute |
| `POST` | `/api/detection/analyze` | Executes CV frame inference & Gemini inspection |
| `POST` | `/api/detection/propagate` | Propagates real detections into live parking state |
| `POST` | `/api/simulation/settings` | Updates simulation speed, running state, and preset |
| `POST` | `/api/simulation/step` | Advances 1 deterministic simulation cycle |
| `POST` | `/api/simulation/reset` | Restores deterministic baseline ground truth |
| `GET` | `/api/system-status` | Returns subsystem health (`REAL YOLO ONLINE`, `SIMULATED FALLBACK`, etc.) |

---

## 11. AUTOMATED TEST SUITE
The project includes an 11-suite automated test harness in `src/tests/runTests.ts` (67 automated assertions):
- **Suite 1**: Occupancy calculation & aggregate percentage
- **Suite 2**: 3-frame temporal hysteresis state machine
- **Suite 3**: Recommendation scoring & hard constraints
- **Suite 4**: Unavailable spaces handling & fallback warnings
- **Suite 5**: Indoor navigation waypoint generation
- **Suite 6**: Duplicate events & buffer bounds
- **Suite 7**: Spatial IoU overlap & indeterminate boundary thresholding
- **Suite 8**: Holt double exponential smoothing & confidence intervals
- **Suite 9**: Seedable Mulberry32 PRNG determinism
- **Suite 10**: 6-stage computer vision pipeline verification
- **Suite 11**: Review 2 Technical Integrity & Credibility Verification (Real YOLO vs. Fallback, pure IoU geometry, zero synthetic IoU, source label preservation)

Run tests locally with:
```bash
npm test
```

---

## 12. RUNNING LOCALLY
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure environment** in `.env`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key"
   ```
3. **Start Full-Stack Development Server**:
   ```bash
   npm run dev
   ```
4. **Run Verification Tests**:
   ```bash
   npm test
   ```
5. **Build for Production**:
   ```bash
   npm run build
   ```
