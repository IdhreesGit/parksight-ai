# ParkSight AI — Smart Parking Platform (Review 2)

> **Academic Portfolio / AI Systems Prototype**  
> An advanced smart-parking platform providing computer-vision occupancy analysis with external YOLO integration, digital twin state simulation, explainable multi-factor recommendations, indoor navigation routing, and predictive time-series analytics.

---

## 1. PROJECT OVERVIEW

**ParkSight AI** is an academic AI engineering prototype built to address urban parking congestion, wasted fuel, and driver frustration.

The platform provides computer-vision occupancy analysis with external YOLO integration, connecting vehicle detection telemetry to an end-to-end data pipeline with spatial IoU polygon matching, real-time bay occupancy classification, transparent driver recommendations, and operational anomaly detection.

Local neural model weights are not bundled directly in the web runtime. Instead, ParkSight integrates with external YOLO microservices through standard HTTP endpoints and automatically falls back safely to deterministic benchmark fixtures when the external service is unavailable.

---

## 2. THE PROBLEM

- **Urban Parking Friction:** Drivers may spend unnecessary time searching for available parking spaces when current occupancy is not visible.

- **Sensor Fragility:** Single-frame computer vision can be affected by glare, shadows, and temporary occlusion, causing unstable vacancy reporting.

- **Black-Box Guidance:** Parking recommendations can be difficult to trust when the system does not explain why a particular space was selected.

- **Privacy Concerns:** Parking systems may process images containing faces or vehicle-identifying information, creating unnecessary privacy risks.

---

## 3. KEY FEATURES

1. **Computer Vision & Occupancy Analysis:** Ingests image or video frames, normalizes inputs, interfaces with external YOLO inference services or benchmark fixtures, and calculates spatial polygon Intersection-over-Union (IoU) to classify parking-bay occupancy.

2. **Occupancy State Machine & Temporal Hysteresis:** Uses a three-frame confirmation process to reduce unstable state changes caused by temporary detection noise.

3. **End-to-End Pipeline Propagation:** Detection results can be propagated into parking state, dashboard KPIs, alerts, analytics, and recommendations.

4. **Explainable Multi-Factor Recommendations:** Uses a transparent prototype scoring model considering availability, distance, accessibility, EV alignment, aisle conditions, and state stability.

5. **Indoor Parking Navigation:** Provides prototype turn-by-turn guidance and 2D vector waypoint routing from facility entrance areas to selected parking bays.

6. **Time-Series Prediction:** Provides short-term occupancy forecasting at +10, +20, and +30 minutes using Holt's Double Exponential Smoothing.

7. **Rule-Based Anomaly Detection:** Detects operational conditions such as rapid occupancy changes, state chatter, facility saturation, and camera feed failures.

8. **Human Feedback Loop:** Supports parking-status dispute reporting and recommendation usefulness feedback.

9. **Multimodal Scene Inspection:** Uses server-side Google Gemini multimodal analysis for environmental conditions such as lighting, glare, weather, and obstructions.

10. **Privacy by Design:** Uses ephemeral frame processing, avoids facial recognition, and avoids unnecessary storage of personal identifying information.

---

## 4. ARCHITECTURE PIPELINE

```text
Camera / Uploaded Image / Video Frame
                ↓
1. Data Acquisition & Decode
                ↓
2. Pre-processing & Normalization
                ↓
3. YOLO / Computer Vision Vehicle Detection
                ↓
4. Spatial Bay IoU Overlap Logic
   (≥0.45 Occupied, ≤0.15 Available)
                ↓
5. Temporal Stability Filter
   (3-Frame Confirmation Hysteresis)
                ↓
6. Authoritative Digital Twin State Store
                ↓
       ┌────────┼──────────┬──────────────┐
       ↓        ↓          ↓              ↓
   Dashboard  Events   Analytics    Rule Anomalies
                       & Holt          & Dispatch
                      Prediction           ↓
                          ↓          Human Feedback
                    Recommendations
                          ↓
                  Indoor Navigation