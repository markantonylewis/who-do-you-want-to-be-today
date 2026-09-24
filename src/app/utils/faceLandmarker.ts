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

  private initialized = false;

  private smoothValue(current: number, target: number, deltaTime: number, responseTime: number, deadZone: number) {
    const difference = target - current;
    if (Math.abs(difference) <= deadZone) return current;

    const alpha = 1 - Math.exp(-Math.max(deltaTime, 1 / 120) / responseTime);
    return current + difference * alpha;
  }

  public update(target: Partial<FaceTrackingState> | null, deltaTime: number): FaceTrackingState {
    if (!target) {
      // Keep the last stable pose through short detection gaps. Moving toward a
      // default position here makes the accessory visibly jump between frames.
      this.state.isTracking = false;
      return { ...this.state };
    }

    if (!this.initialized) {
      this.state = { ...this.state, ...target, isTracking: true, opacity: 1 };
      this.initialized = true;
      return { ...this.state };
    }

    // Tracking active
    this.state.isTracking = true;
    this.state.opacity = 1;

    // A small dead zone removes landmark shimmer while time-based smoothing
    // keeps the costume responsive at different camera/display frame rates.
    const positionDeadZone = Math.max(1.5, this.state.width * 0.008);
    const sizeDeadZone = Math.max(1.5, this.state.width * 0.006);
    if (target.centerX !== undefined) {
      this.state.centerX = this.smoothValue(this.state.centerX, target.centerX, deltaTime, 0.09, positionDeadZone);
    }
    if (target.centerY !== undefined) {
      this.state.centerY = this.smoothValue(this.state.centerY, target.centerY, deltaTime, 0.09, positionDeadZone);
    }
    if (target.width !== undefined) {
      this.state.width = this.smoothValue(this.state.width, target.width, deltaTime, 0.16, sizeDeadZone);
    }
    if (target.height !== undefined) {
      this.state.height = this.smoothValue(this.state.height, target.height, deltaTime, 0.16, sizeDeadZone);
    }
    if (target.angleRad !== undefined) {
      // Handle angle wrap-around
      let diff = target.angleRad - this.state.angleRad;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) > 0.012) {
        const alpha = 1 - Math.exp(-Math.max(deltaTime, 1 / 120) / 0.12);
        this.state.angleRad += diff * alpha;
      }
    }
    if (target.pitchRad !== undefined) {
      this.state.pitchRad = this.smoothValue(this.state.pitchRad, target.pitchRad, deltaTime, 0.16, 0.01);
    }

    return { ...this.state };
  }
}
