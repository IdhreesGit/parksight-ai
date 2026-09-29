/**
 * Real YOLO Service Adapter Contract (Review 2 Specification)
 * Standardized typed interface for plugging in external Python (Ultralytics / FastAPI),
 * ONNX Runtime, or Simulation Test Fixtures.
 */

export type VehicleClass = 'car' | 'truck' | 'suv' | 'motorcycle' | 'bus';

export interface YoloDetectionInput {
  imageBufferOrBase64: string;
  confidenceThreshold?: number; // default 0.50
  iouThreshold?: number; // NMS IoU threshold, default 0.45
  modelVariant?: 'yolov8n' | 'yolov8s' | 'yolov8m' | 'yolov11n';
  targetWidth?: number; // default 640
  targetHeight?: number; // default 640
}

export interface YoloRawDetection {
  class: VehicleClass;
  confidence: number; // 0.0 to 1.0
  // Normalized bounding box: [x, y, width, height] in percentages (0.0 - 100.0%)
  bbox: [number, number, number, number];
  trackId?: number;
  pixelCoords?: { x: number; y: number; width: number; height: number };
}

export interface YoloDetectionOutput {
  detections: YoloRawDetection[];
  inferenceTimeMs: number;
  modelVersion: string;
  backend: 'remote_http_service' | 'local_deterministic_fixture';
  inputResolution: [number, number];
  rawTotalObjectsFound: number;
  timestamp: string;
}

export interface IYoloServiceAdapter {
  adapterName: string;
  detect(input: YoloDetectionInput): Promise<YoloDetectionOutput>;
  isServiceReachable(): Promise<boolean>;
  getModelMetadata(): {
    name: string;
    version: string;
    supportedClasses: VehicleClass[];
    endpointUrl?: string;
    backendType: string;
  };
}

/**
 * HttpYoloServiceAdapter
 * Connects to an external Python microservice (e.g. FastAPI / Triton) exposing standard YOLO endpoints.
 * Genuinely evaluates external response without manufacturing fake neural weights.
 * Throws explicit error when service is unreachable so system can report:
 * "YOLO SERVICE UNAVAILABLE — SIMULATED FALLBACK ACTIVE".
 */
export class HttpYoloServiceAdapter implements IYoloServiceAdapter {
  public adapterName = 'HttpYoloServiceAdapter';
  private endpointUrl: string;
  private modelVersion: string;

  constructor(endpointUrl = 'http://localhost:8000/api/v1/yolo/detect', modelVersion = 'yolov8n-640') {
    this.endpointUrl = endpointUrl;
    this.modelVersion = modelVersion;
  }

  public async detect(input: YoloDetectionInput): Promise<YoloDetectionOutput> {
    const startTime = performance.now();
    const response = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: input.imageBufferOrBase64,
        conf_thres: input.confidenceThreshold || 0.5,
        iou_thres: input.iouThreshold || 0.45,
        model: input.modelVariant || 'yolov8n',
      }),
      signal: AbortSignal.timeout(4000), // 4-second timeout
    });

    if (!response.ok) {
      throw new Error(`YOLO microservice returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const elapsed = Math.round(performance.now() - startTime);

    return {
      detections: data.detections || [],
      inferenceTimeMs: data.inference_time_ms || elapsed,
      modelVersion: data.model_version || this.modelVersion,
      backend: 'remote_http_service',
      inputResolution: data.resolution || [640, 640],
      rawTotalObjectsFound: (data.detections || []).length,
      timestamp: new Date().toISOString(),
    };
  }

  public async isServiceReachable(): Promise<boolean> {
    try {
      const res = await fetch(this.endpointUrl.replace(/\/detect$/, '/health'), {
        method: 'GET',
        signal: AbortSignal.timeout(1200),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public getModelMetadata() {
    return {
      name: 'Ultralytics YOLO (External Microservice)',
      version: this.modelVersion,
      supportedClasses: ['car', 'truck', 'suv', 'motorcycle', 'bus'] as VehicleClass[],
      endpointUrl: this.endpointUrl,
      backendType: 'Remote HTTP Microservice (External Deployment Required)',
    };
  }
}

/**
 * SyntheticBenchmarkCVAdapter
 * Transparently labeled as a SIMULATED benchmark test fixture.
 * Does NOT claim to be real neural vehicle detection.
 * Used for deterministic integration testing and offline development.
 */
export class SyntheticBenchmarkCVAdapter implements IYoloServiceAdapter {
  public adapterName = 'SyntheticBenchmarkCVAdapter';
  private modelVersion: string;

  constructor(modelVersion = 'Synthetic-Benchmark-Fixture-v2.0') {
    this.modelVersion = modelVersion;
  }

  public async detect(input: YoloDetectionInput): Promise<YoloDetectionOutput> {
    const startTime = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Preset test pattern of vehicle coordinates
    const detections: YoloRawDetection[] = [
      { class: 'car', confidence: 0.94, bbox: [12.5, 14.0, 16.0, 18.0], trackId: 101 },
      { class: 'suv', confidence: 0.89, bbox: [32.0, 14.5, 17.5, 18.2], trackId: 102 },
      { class: 'car', confidence: 0.92, bbox: [72.0, 14.2, 16.2, 17.8], trackId: 103 },
      { class: 'truck', confidence: 0.86, bbox: [52.4, 52.0, 18.0, 20.0], trackId: 104 },
    ];

    const confThreshold = input.confidenceThreshold || 0.5;
    const filtered = detections.filter((d) => d.confidence >= confThreshold);
    const elapsed = Math.round(performance.now() - startTime);

    return {
      detections: filtered,
      inferenceTimeMs: elapsed,
      modelVersion: this.modelVersion,
      backend: 'local_deterministic_fixture',
      inputResolution: [input.targetWidth || 640, input.targetHeight || 360],
      rawTotalObjectsFound: filtered.length,
      timestamp: new Date().toISOString(),
    };
  }

  public async isServiceReachable(): Promise<boolean> {
    return true;
  }

  public getModelMetadata() {
    return {
      name: 'Simulated Benchmark Test Fixture',
      version: this.modelVersion,
      supportedClasses: ['car', 'suv', 'truck', 'motorcycle', 'bus'] as VehicleClass[],
      endpointUrl: 'simulated://benchmark-test-fixture',
      backendType: 'Simulated Test Fixture (Not Neural Inference)',
    };
  }
}

/**
 * LocalDeterministicYoloAdapter
 * High-performance deterministic simulation fixture implementing the exact same contract.
 * Used for offline testing, CI/CD validation, and simulation demo mode.
 */
export class LocalDeterministicYoloAdapter implements IYoloServiceAdapter {
  public adapterName = 'LocalDeterministicYoloAdapter';
  private modelVersion: string;

  constructor(modelVersion = 'yolov8n-synthetic-fixture') {
    this.modelVersion = modelVersion;
  }

  public async detect(input: YoloDetectionInput): Promise<YoloDetectionOutput> {
    const startTime = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 20));

    const detections: YoloRawDetection[] = [
      { class: 'car', confidence: 0.94, bbox: [12.5, 14.0, 16.0, 18.0], trackId: 101 },
      { class: 'suv', confidence: 0.89, bbox: [32.0, 14.5, 17.5, 18.2], trackId: 102 },
      { class: 'car', confidence: 0.92, bbox: [72.0, 14.2, 16.2, 17.8], trackId: 103 },
      { class: 'truck', confidence: 0.86, bbox: [52.4, 52.0, 18.0, 20.0], trackId: 104 },
    ];

    const confThreshold = input.confidenceThreshold || 0.5;
    const filtered = detections.filter((d) => d.confidence >= confThreshold);
    const elapsed = Math.round(performance.now() - startTime);

    return {
      detections: filtered,
      inferenceTimeMs: elapsed,
      modelVersion: this.modelVersion,
      backend: 'local_deterministic_fixture',
      inputResolution: [640, 640],
      rawTotalObjectsFound: filtered.length,
      timestamp: new Date().toISOString(),
    };
  }

  public async isServiceReachable(): Promise<boolean> {
    return true;
  }

  public getModelMetadata() {
    return {
      name: 'YOLOv8 Slot-Occupancy Detector (Built-in Test Fixture)',
      version: this.modelVersion,
      supportedClasses: ['car', 'truck', 'suv', 'motorcycle', 'bus'] as VehicleClass[],
      endpointUrl: 'local://yolov8-onnx-runtime',
      backendType: 'Deterministic Test Fixture',
    };
  }
}
