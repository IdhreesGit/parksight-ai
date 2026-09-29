# ParkSight AI — Smart Parking Platform (Review 2)

## 1. Project Overview

ParkSight AI is an academic AI engineering prototype designed to address parking-space search and occupancy visibility.

The platform demonstrates computer-vision occupancy analysis with external YOLO integration, parking-bay IoU geometry, temporal occupancy stabilization, explainable recommendations, analytics, prediction, anomaly detection, navigation, and human feedback.

Local neural model weights are not bundled with the web application. YOLO inference is accessed through an external HTTP service. When that service is unavailable, the system clearly reports a simulated/test fallback.

---

## 2. The Problem

Drivers may spend unnecessary time searching for available parking spaces when current parking occupancy is not visible.

Key challenges include:

- Unstable single-frame detection
- Temporary visual occlusion
- Difficult-to-trust recommendations
- Limited occupancy visibility
- Privacy concerns around camera imagery

---

## 3. Key Features

1. **Computer Vision Occupancy Analysis**  
   Supports image/frame processing and external YOLO detection.

2. **Parking-Bay IoU Logic**  
   Uses geometric overlap between vehicle bounding boxes and parking-bay polygons.

3. **Temporal Stability Filtering**  
   Requires multiple consistent frames before confirming occupancy changes.

4. **Explainable Recommendations**  
   Uses transparent multi-factor prototype scoring.

5. **Indoor Navigation**  
   Generates prototype waypoint routes from entrance to parking bay.

6. **Short-Term Prediction**  
   Uses Holt's Double Exponential Smoothing for occupancy forecasting.

7. **Rule-Based Anomaly Detection**  
   Detects rapid occupancy changes, state chatter, saturation, and camera failures.

8. **Human Feedback Loop**  
   Supports parking-status disputes and recommendation feedback.

9. **Gemini Scene Inspection**  
   Provides multimodal environmental analysis when configured.

10. **Privacy by Design**  
    Avoids facial recognition and unnecessary personal-data storage.

---

## 4. Architecture Pipeline

```text
Camera / Uploaded Image / Video Frame
                ↓
1. Data Acquisition & Decode
                ↓
2. Pre-processing & Normalization
                ↓
3. YOLO / Computer Vision Vehicle Detection
                ↓
4. Spatial Bay IoU Occupancy Logic
   (≥0.45 Occupied, ≤0.15 Available)
                ↓
5. Temporal Stability Filter
   (3-Frame Confirmation)
                ↓
6. Authoritative Parking State Store
                ↓
       ┌────────┼──────────┬─────────────┐
       ↓        ↓          ↓             ↓
   Dashboard  Events   Analytics   Rule Anomalies
                       & Prediction       ↓
                           ↓        Human Feedback
                    Recommendations
                           ↓
                   Indoor Navigation
```

---

## 5. Real vs Simulated Systems

| Subsystem | Status | Description |
|---|---|---|
| Frame Ingest | SIMULATED / TEST | Processes uploaded frames and test inputs |
| YOLO Integration | INTEGRATION READY | Connects to external YOLO HTTP service |
| YOLO Fallback | SIMULATED | Used when external YOLO is unavailable |
| Gemini Scene Inspection | REAL WHEN CONFIGURED | Uses server-side Gemini API |
| Digital Twin Simulation | SIMULATED | Deterministic parking-traffic simulation |
| Recommendation Engine | PROTOTYPE | Transparent heuristic scoring |
| Demand Prediction | PROTOTYPE | Holt's Double Exponential Smoothing |
| Anomaly Detection | REAL (RULES) | Deterministic threshold-based rules |
| Indoor Navigation | PROTOTYPE | Vector waypoint routing |

---

## 6. Computer Vision & Bay Occupancy Logic

### Spatial IoU

```text
IoU =
Area(BoundingBox ∩ BayPolygon)
--------------------------------
Area(BayPolygon)
```

### Classification

- IoU ≥ 0.45 → Candidate Occupied
- IoU ≤ 0.15 → Candidate Available
- 0.15 < IoU < 0.45 → Indeterminate / Low Confidence

The system does not derive IoU from previous parking-bay status.

### Temporal Filtering

Three consecutive compatible detection cycles are required before committing an occupancy state change.

This helps reduce temporary changes caused by visual noise, shadows, or passing objects.

---

## 7. Recommendation Scoring

The prototype uses a transparent 100-point scoring model:

```text
Score =
Availability     25
Distance         25
Accessibility    15
EV Alignment     15
Aisle Condition  10
Stability        10
--------------------
Total            100
```

Distance uses a decay function based on walking distance.

Hard constraints such as accessibility and EV requirements can filter incompatible bays before scoring.

Scores are explicitly presented as **Prototype Heuristic Scores**.

---

## 8. Short-Term Prediction

ParkSight uses Holt's Double Exponential Smoothing.

The prototype provides occupancy forecasts for:

- +10 minutes
- +20 minutes
- +30 minutes

Confidence intervals are derived from recent forecasting residuals.

The implementation is documented as double exponential smoothing rather than full seasonal Holt-Winters.

---

## 9. Rule-Based Anomaly Detection

The system includes deterministic operational rules for:

- Rapid occupancy changes
- Parking-bay state chatter
- High facility occupancy
- Camera heartbeat timeout
- EV infrastructure mismatch

Each detected anomaly can provide:

- What happened
- Why it was flagged
- Recommended action

---

## 10. REST API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/parking` | Parking lots and bays |
| GET | `/api/occupancy` | Occupancy metrics |
| POST | `/api/recommendations` | Parking recommendations |
| POST | `/api/recommendations/feedback` | Recommendation feedback |
| GET | `/api/navigation/route` | Navigation route |
| GET | `/api/analytics` | Analytics data |
| GET | `/api/prediction` | Forecast data |
| GET | `/api/alerts` | System alerts |
| POST | `/api/alerts/:id/read` | Acknowledge alert |
| POST | `/api/feedback` | Parking-status feedback |
| POST | `/api/detection/analyze` | Detection analysis |
| POST | `/api/detection/propagate` | Propagate detections |
| POST | `/api/simulation/settings` | Simulation controls |
| POST | `/api/simulation/step` | Simulation step |
| POST | `/api/simulation/reset` | Reset simulation |
| GET | `/api/system-status` | Subsystem health |

---

## 11. Automated Testing

The project includes an automated test harness covering:

- Occupancy calculation
- Temporal hysteresis
- Recommendation scoring
- Fallback handling
- Navigation
- Event management
- Spatial IoU
- Prediction
- Deterministic simulation
- Computer-vision pipeline
- Review 2 technical integrity checks

Run:

```bash
npm test
```

---

## 12. Running Locally

Install dependencies:

```bash
npm install
```

Configure `.env` when using Gemini:

```env
GEMINI_API_KEY="your-gemini-api-key"
```

Start development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Build:

```bash
npm run build
```

---

## 13. Project Status

ParkSight AI is an academic prototype and demonstration system.

It combines:

- Computer vision architecture
- Parking occupancy logic
- Simulation
- Explainable recommendations
- Prediction
- Anomaly detection
- Navigation
- Human feedback
- Responsible AI practices

---

## 14. YOLO Integration

The project uses a modular YOLO integration architecture.

The web application communicates with an external YOLO inference service through HTTP.

When the service is unavailable, the system does not falsely report real YOLO detection. Instead, it clearly identifies the simulated/test fallback.

---

## 15. Privacy

ParkSight AI follows a privacy-by-design approach.

The prototype:

- Does not perform facial recognition
- Avoids storing unnecessary personal information
- Treats vehicle imagery as transient processing input
- Clearly separates real and simulated data paths

---

## 16. Limitations

The current project does not bundle a local YOLO neural model runtime.

Real YOLO inference therefore requires a compatible external inference service.

The parking simulation, recommendation scoring, prediction, and navigation modules are prototype implementations and require further real-world validation before production deployment.

---

## 17. Project Purpose

ParkSight AI demonstrates how computer vision, data processing, AI-assisted reasoning, and software engineering can be combined to explore a real-world parking problem.

The project is intended for academic evaluation, experimentation, and future extension.
