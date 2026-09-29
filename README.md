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