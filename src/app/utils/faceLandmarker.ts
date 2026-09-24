// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { FaceTrackingState } from '../types';

let faceLandmarkerInstance: FaceLandmarker | null = null;
let initPromise: Promise<FaceLandmarker | null> | null = null;

const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export function isFaceLandmarkerReady(): boolean {
  return Boolean(faceLandmarkerInstance);
}

export async function getFaceLandmarker(): Promise<FaceLandmarker | null> {
  if (faceLandmarkerInstance) return faceLandmarkerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(WASM_PATH);

      try {
        faceLandmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MODEL_PATH,
            delegate: 'GPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        return faceLandmarkerInstance;
      } catch (gpuErr) {
        console.warn('GPU delegate failed or WebGL2 not supported, attempting CPU delegate fallback:', gpuErr);
        faceLandmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MODEL_PATH,
            delegate: 'CPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        return faceLandmarkerInstance;
      }
    } catch (err) {
      console.error('Failed to initialize MediaPipe FaceLandmarker:', err);
      // Allow re-trying on next attempt
      initPromise = null;
      faceLandmarkerInstance = null;
      return null;
    }
  })();

  return initPromise;
}

// Low-pass filter smoothing helper
export class LandmarkSmoother {
  private state: FaceTrackingState = {
    isTracking: false,
    opacity: 1, // Keep visible so costume appears immediately
    centerX: 0.5,
    centerY: 0.35,
    width: 0.3,
    height: 0.3,
    angleRad: 0,
    pitchRad: 0,
  };

  private smoothingFactor = 0.32; // Responsive yet smooth for toddler wiggles

  public update(target: Partial<FaceTrackingState> | null, deltaTime: number): FaceTrackingState {
    if (!target) {
      // Landmark not detected on this frame: gently float back to default center-top
      this.state.isTracking = false;
      this.state.centerX += (0.5 - this.state.centerX) * 0.05;
      this.state.centerY += (0.35 - this.state.centerY) * 0.05;
      this.state.angleRad += (0 - this.state.angleRad) * 0.05;
      return { ...this.state };
    }

    // Tracking active
    this.state.isTracking = true;
    this.state.opacity = 1;

    // Lerp coordinates
    if (target.centerX !== undefined) {
      this.state.centerX += (target.centerX - this.state.centerX) * this.smoothingFactor;
    }
    if (target.centerY !== undefined) {
      this.state.centerY += (target.centerY - this.state.centerY) * this.smoothingFactor;
    }
    if (target.width !== undefined) {
      this.state.width += (target.width - this.state.width) * this.smoothingFactor;
    }
    if (target.height !== undefined) {
      this.state.height += (target.height - this.state.height) * this.smoothingFactor;
    }
    if (target.angleRad !== undefined) {
      // Handle angle wrap-around
      let diff = target.angleRad - this.state.angleRad;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.state.angleRad += diff * this.smoothingFactor;
    }
    if (target.pitchRad !== undefined) {
      this.state.pitchRad += (target.pitchRad - this.state.pitchRad) * this.smoothingFactor;
    }

    return { ...this.state };
  }
}
