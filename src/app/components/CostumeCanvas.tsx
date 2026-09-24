// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CharacterId } from '../types';
import { getFaceLandmarker, LandmarkSmoother, isFaceLandmarkerReady } from '../utils/faceLandmarker';
import { FaceLandmarker } from '@mediapipe/tasks-vision';
import { drawCostume } from '../utils/costumeDrawers';
import { getParentSettings, subscribeParentSettings, ParentSettings } from '../utils/parentSettings';

interface CostumeCanvasProps {
  selectedCharacter: CharacterId | null;
  onCameraReady?: () => void;
  showMagicBurst?: boolean;
  roundsCompleted?: number;
  maxRounds?: number;
  onRestart?: () => void;
  showRestart?: boolean;
  onOpenParentGate?: () => void;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

export const CostumeCanvas: React.FC<CostumeCanvasProps> = ({
  selectedCharacter,
  onCameraReady,
  showMagicBurst,
  roundsCompleted = 0,
  maxRounds = 5,
  onRestart,
  showRestart = false,
  onOpenParentGate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraPermissionStatus, setCameraPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string | null>(null);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);
  const [isLandmarkerLoading, setIsLandmarkerLoading] = useState<boolean>(true);
  const [isFaceDetected, setIsFaceDetected] = useState<boolean>(false);

  const [parentSettings, setParentSettings] = useState<ParentSettings>(getParentSettings());
  const [useCartoonAvatar, setUseCartoonAvatar] = useState<boolean>(() => {
    return getParentSettings().defaultMirrorMode === 'cartoon';
  });
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const isDetectingRef = useRef<boolean>(false);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastTimestampRef = useRef<number>(0);
  const lastTrackedLandmarksRef = useRef<{
    centerX: number;
    centerY: number;
    width: number;
    height: number;
    angleRad: number;
    pitchRad: number;
  } | null>(null);
  const lastFaceSeenAtRef = useRef<number>(0);

  const smootherRef = useRef<LandmarkSmoother>(new LandmarkSmoother());
  const sparklesRef = useRef<SparkleParticle[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const animFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if running inside iframe preview
  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }
  }, []);

  // Pre-load MediaPipe Face Landmarker once in background
  useEffect(() => {
    let isMounted = true;
    getFaceLandmarker()
      .then((lm) => {
        if (isMounted) {
          landmarkerRef.current = lm;
          setIsLandmarkerLoading(false);
        }
      })
      .catch((err) => {
        console.warn('FaceLandmarker preload notice:', err);
        if (isMounted) {
          setIsLandmarkerLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Subscribe to parent settings
  useEffect(() => {
    const unsub = subscribeParentSettings((newSettings) => {
      setParentSettings(newSettings);
    });
    return () => unsub();
  }, []);

  // Sparkle burst on costume change (adapted for sensory mode)
  useEffect(() => {
    if (showMagicBurst && canvasRef.current) {
      const isCalm = parentSettings.sensoryMode === 'calm';
      const colors = isCalm
        ? ['#fde68a', '#bae6fd', '#bbf7d0', '#ffffff']
        : ['#fbbf24', '#f43f5e', '#38bdf8', '#4ade80', '#a855f7', '#ffffff'];
      const newSparkles: SparkleParticle[] = [];
      const cx = canvasRef.current.width * 0.5;
      const cy = canvasRef.current.height * 0.38;

      const particleCount = isCalm ? 14 : 45;
      const speedBase = isCalm ? 4 : 8;

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * speedBase + 2;
        newSparkles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (isCalm ? 1 : 2),
          size: isCalm ? Math.random() * 8 + 4 : Math.random() * 14 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: isCalm ? 0.7 : 1,
          life: 1,
        });
      }
      sparklesRef.current = newSparkles;
    }
  }, [showMagicBurst, parentSettings.sensoryMode]);

  // Periodic blinking for cartoon avatar
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Camera start helper with detailed diagnostic and fallback handling
  const startCamera = useCallback(async () => {
    setCameraErrorMessage(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        const msg = 'Camera access is not supported in this browser environment or requires HTTPS.';
        setCameraErrorMessage(msg);
        setCameraPermissionStatus('denied');
        setUseCartoonAvatar(true);
        setIsCameraActive(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const playVideo = async () => {
          try {
            await videoRef.current?.play();
            setIsCameraActive(true);
            setCameraPermissionStatus('granted');
            setUseCartoonAvatar(false);
            setCameraErrorMessage(null);
            if (onCameraReady) onCameraReady();
          } catch (playErr) {
            console.warn('Video play error:', playErr);
          }
        };

        videoRef.current.onloadedmetadata = playVideo;
        if (videoRef.current.readyState >= 1) {
          playVideo();
        }
      }
    } catch (err: any) {
      console.warn('Camera stream could not start, defaulting to cartoon avatar:', err);
      let msg = 'Camera could not be started.';
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied or blocked by your browser/iframe.';
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        msg = 'No camera was found on your device.';
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        msg = 'Camera is currently in use by another application.';
      }
      setCameraErrorMessage(msg);
      setCameraPermissionStatus('denied');
      setUseCartoonAvatar(true);
      setIsCameraActive(false);
    }
  }, [onCameraReady]);

  // Attempt initial camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [startCamera]);

  // Synchronous, non-blocking AR render loop
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      animFrameIdRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();
    const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = now;

    // Synchronize canvas resolution to actual CSS pixel bounds
    const rect = container.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animFrameIdRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    let targetLandmarks: {
      centerX: number;
      centerY: number;
      width: number;
      height: number;
      angleRad: number;
      pitchRad: number;
    } | null = null;

    // MediaPipe face tracking on live camera feed (synchronous and mutex-locked)
    const landmarker = landmarkerRef.current;
    if (
      !useCartoonAvatar &&
      isCameraActive &&
      video &&
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      landmarker &&
      !isDetectingRef.current
    ) {
      // Only process when a new video frame is available
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        isDetectingRef.current = true;

        try {
          // Strictly monotonically increasing timestamp
          const monotonicTimestamp = Math.max(now, lastTimestampRef.current + 1);
          lastTimestampRef.current = monotonicTimestamp;

          const results = landmarker.detectForVideo(video, monotonicTimestamp);

          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            const forehead = landmarks[10];
            const chin = landmarks[152];
            const leftTemple = landmarks[234];
            const rightTemple = landmarks[454];

            if (forehead && chin && leftTemple && rightTemple) {
              const containerAspect = w / h;
              const videoAspect = video.videoWidth / video.videoHeight;
              let scale = 1;
              let offsetX = 0;
              let offsetY = 0;

              if (containerAspect > videoAspect) {
                scale = w / video.videoWidth;
                offsetY = (h - video.videoHeight * scale) / 2;
              } else {
                scale = h / video.videoHeight;
                offsetX = (w - video.videoWidth * scale) / 2;
              }

              // Mirrored horizontal position: (1 - normX)
              const videoPxX = (1 - forehead.x) * video.videoWidth;
              const videoPxY = forehead.y * video.videoHeight;
              const screenX = offsetX + videoPxX * scale;
              const screenY = offsetY + videoPxY * scale;

              const templeLx = (1 - leftTemple.x) * video.videoWidth * scale;
              const templeLy = leftTemple.y * video.videoHeight * scale;
              const templeRx = (1 - rightTemple.x) * video.videoWidth * scale;
              const templeRy = rightTemple.y * video.videoHeight * scale;

              const headWidth = Math.hypot(templeRx - templeLx, templeRy - templeLy);
              const headHeight = Math.abs(chin.y - forehead.y) * video.videoHeight * scale;
              const angleRad = Math.atan2(templeLy - templeRy, templeLx - templeRx);

              targetLandmarks = {
                centerX: screenX,
                centerY: screenY,
                width: headWidth,
                height: headHeight,
                angleRad,
                pitchRad: (chin.y - forehead.y) * 0.5,
              };

              lastTrackedLandmarksRef.current = targetLandmarks;
              lastFaceSeenAtRef.current = now;

              setIsFaceDetected(true);
            }
          } else {
            setIsFaceDetected(false);
          }
        } catch (detectErr) {
          console.warn('Face detection error during frame:', detectErr);
        } finally {
          isDetectingRef.current = false;
        }
      }
    }

    // requestAnimationFrame commonly runs faster than the camera. Reuse the
    // latest measured pose instead of substituting the avatar pose between
    // camera frames, which caused the accessory to shake back and forth.
    if (
      !targetLandmarks &&
      !useCartoonAvatar &&
      isCameraActive &&
      lastTrackedLandmarksRef.current &&
      now - lastFaceSeenAtRef.current < 750
    ) {
      targetLandmarks = lastTrackedLandmarksRef.current;
    }

    // Fallback to toddler cartoon avatar anchor coordinates
    if (!targetLandmarks && (useCartoonAvatar || !isCameraActive)) {
      const headDiameter = Math.min(Math.min(w * 0.35, 230), Math.max(160, h * 0.30));
      const avatarCenterY = h * 0.44;
      const avatarForeheadY = avatarCenterY - headDiameter * 0.36;

      targetLandmarks = {
        centerX: w * 0.5,
        centerY: avatarForeheadY,
        width: headDiameter,
        height: headDiameter,
        angleRad: 0,
        pitchRad: 0,
      };
    }

    // Update smooth filter
    const trackingState = smootherRef.current.update(targetLandmarks, deltaTime);

    // Render AR costume accessory if selected
    if (selectedCharacter) {
      ctx.save();
      const renderX = trackingState.centerX;
      const renderY = trackingState.centerY;
      const renderAngle = trackingState.angleRad;
      const costumeSize = Math.max(130, trackingState.width * 1.35);

      ctx.translate(renderX, renderY);
      ctx.rotate(renderAngle);

      drawCostume(ctx, selectedCharacter, costumeSize);
      ctx.restore();
    }

    // Render Sparkle Particles
    if (sparklesRef.current.length > 0) {
      ctx.save();
      sparklesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16;
        p.life -= deltaTime * 1.6;
        p.alpha = Math.max(0, p.life);

        if (p.alpha > 0) {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size * 0.6, p.y);
          ctx.lineTo(p.x + p.size * 0.6, p.y);
          ctx.moveTo(p.x, p.y - p.size * 0.6);
          ctx.lineTo(p.x, p.y + p.size * 0.6);
          ctx.stroke();
        }
      });
      sparklesRef.current = sparklesRef.current.filter((p) => p.life > 0);
      ctx.restore();
    }

    animFrameIdRef.current = requestAnimationFrame(processFrame);
  }, [isCameraActive, selectedCharacter, useCartoonAvatar]);

  useEffect(() => {
    animFrameIdRef.current = requestAnimationFrame(processFrame);
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [processFrame]);

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div
      id="costume-canvas-container"
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-sky-200 via-amber-50 to-orange-100 select-none"
    >
      {/* 1. Real Camera Feed (Mirrored) */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-500 ${
          isCameraActive && !useCartoonAvatar ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 2. Interactive Toddler Cartoon Face (Aligned with canvas coordinates at y=44%) */}
      {(!isCameraActive || useCartoonAvatar) && (
        <div
          id="cartoon-avatar-face"
          className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center"
        >
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 border-4 border-amber-300 shadow-2xl flex flex-col items-center justify-center">
            {/* Ears */}
            <div className="absolute -left-3.5 top-20 w-7 h-10 bg-amber-200 border-2 border-amber-300 rounded-full" />
            <div className="absolute -right-3.5 top-20 w-7 h-10 bg-amber-200 border-2 border-amber-300 rounded-full" />

            {/* Eyebrows */}
            <div className="flex justify-between w-28 sm:w-36 mb-2">
              <div className="w-8 sm:w-10 h-2 bg-amber-900/60 rounded-full rotate-6" />
              <div className="w-8 sm:w-10 h-2 bg-amber-900/60 rounded-full -rotate-6" />
            </div>

            {/* Eyes */}
            <div className="flex justify-between w-28 sm:w-36 mb-2.5">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-full flex items-center justify-center shadow-inner border border-amber-200 overflow-hidden">
                {isBlinking ? (
                  <div className="w-7 h-1.5 bg-amber-950 rounded-full" />
                ) : (
                  <div className="w-5 h-5 bg-amber-950 rounded-full flex items-start justify-end p-0.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>

              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-full flex items-center justify-center shadow-inner border border-amber-200 overflow-hidden">
                {isBlinking ? (
                  <div className="w-7 h-1.5 bg-amber-950 rounded-full" />
                ) : (
                  <div className="w-5 h-5 bg-amber-950 rounded-full flex items-start justify-end p-0.5">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Rosy Cheeks & Button Nose */}
            <div className="flex items-center justify-between w-36 sm:w-44 px-2">
              <div className="w-7 h-4 bg-rose-300/70 rounded-full blur-[1px]" />
              <div className="w-3.5 h-2.5 bg-amber-300 rounded-full shadow-sm" />
              <div className="w-7 h-4 bg-rose-300/70 rounded-full blur-[1px]" />
            </div>

            {/* Happy Smile */}
            <div className="mt-2 w-12 h-6 border-b-4 border-amber-900 rounded-b-full bg-rose-400/30" />
          </div>
        </div>
      )}

      {/* 3. AR Canvas (Draws costume & magical sparkles on top) */}
      <canvas
        id="costume-ar-canvas"
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* 4. Magic Mirror Whimsical Golden Frame */}
      <div className="absolute inset-2 sm:inset-3 rounded-3xl border-4 sm:border-6 border-amber-400/50 shadow-2xl pointer-events-none ring-2 ring-white/40" />

      {/* 5. TOP EDGE CONTROLS BAR */}
      <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
        {/* Left: App Title & Camera Live Status */}
        <div className="flex items-center gap-2">
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full shadow-md border-2 border-amber-300 flex items-center gap-1.5">
            <span className="text-base">✨</span>
            <span className="text-xs sm:text-sm font-black text-amber-950 tracking-tight">
              Who Am I Today?
            </span>
          </div>

          {/* Camera Status Badge */}
          {isCameraActive && !useCartoonAvatar && (
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{isFaceDetected ? 'Face Tracked 🎯' : 'Looking for Face...'}</span>
            </div>
          )}

          {isLandmarkerLoading && (
            <div className="hidden lg:flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
              <span>✨ Magic Face Loading...</span>
            </div>
          )}
        </div>

        {/* Right: Stars, Camera Switch, Restart & Parent Settings */}
        <div className="flex items-center gap-2">
          {/* Stars Tracker */}
          {parentSettings.maxRounds > 0 ? (
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full shadow-md border-2 border-amber-300">
              <span className="text-sm">⭐</span>
              <span className="text-xs sm:text-sm font-black text-amber-950">
                {roundsCompleted}/{maxRounds}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full shadow-md border-2 border-amber-300">
              <span className="text-sm">⭐</span>
              <span className="text-xs sm:text-sm font-black text-amber-950">
                Play
              </span>
            </div>
          )}

          {/* Camera / Avatar Switch Button */}
          {cameraPermissionStatus === 'denied' || !isCameraActive ? (
            <button
              id="enable-camera-button"
              onClick={startCamera}
              className="cursor-pointer bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white text-xs sm:text-sm font-black px-2.5 sm:px-3 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1 active:scale-95 transition-transform"
              title="Turn on Camera"
            >
              <span>📸</span>
              <span>Camera</span>
            </button>
          ) : (
            <button
              id="toggle-mirror-mode"
              onClick={() => setUseCartoonAvatar(!useCartoonAvatar)}
              className="cursor-pointer bg-white/95 hover:bg-white text-amber-950 text-xs sm:text-sm font-black px-2.5 sm:px-3 py-1 rounded-full shadow-md border-2 border-amber-300 flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span>{useCartoonAvatar ? '📸 Camera' : '🎭 Cartoon'}</span>
            </button>
          )}

          {/* Start Over Button */}
          {showRestart && onRestart && (
            <button
              id="header-restart-btn"
              onClick={onRestart}
              className="cursor-pointer bg-white/95 hover:bg-white text-amber-900 text-xs sm:text-sm font-black px-2.5 sm:px-3 py-1 rounded-full shadow-md border-2 border-amber-300 active:scale-95 transition-transform"
              title="Start Over"
            >
              🏠
            </button>
          )}

          {/* Parent & Grown-Up Settings with Toddler-Proof Gate */}
          <button
            id="open-parent-gate-btn"
            onClick={onOpenParentGate}
            className="cursor-pointer bg-white/95 hover:bg-white text-amber-950 text-xs sm:text-sm font-black px-2.5 sm:px-3 py-1 rounded-full shadow-md border-2 border-amber-300 flex items-center gap-1 active:scale-95 transition-transform"
            title="Parent & Grown-Up Settings (Locked)"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Parents</span>
            <span className="text-[10px]">🔒</span>
          </button>
        </div>
      </div>

      {/* 6. Helpful Camera Diagnostics Banner (If camera permission is blocked or denied) */}
      {(cameraPermissionStatus === 'denied' || cameraErrorMessage) && (
        <div
          id="camera-diagnostic-banner"
          className="absolute bottom-24 sm:bottom-28 left-4 right-4 max-w-lg mx-auto z-20 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-amber-300 shadow-xl p-3 sm:p-4 flex flex-col gap-2 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-amber-950 font-black text-xs sm:text-sm">
            <span>📷</span>
            <span>Why is the Camera face not showing?</span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
            {cameraErrorMessage ||
              'Your browser or iframe preview has camera access restricted, so we are using the Toddler Cartoon face.'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <button
              id="retry-camera-btn"
              onClick={startCamera}
              className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow transition-all active:scale-95"
            >
              📸 Retry Camera
            </button>
            {isInIframe && (
              <button
                id="open-new-tab-btn"
                onClick={openInNewTab}
                className="cursor-pointer bg-sky-500 hover:bg-sky-600 text-white font-black text-xs px-3 py-1.5 rounded-full shadow transition-all active:scale-95 flex items-center gap-1"
                title="Open in top-level browser tab to allow camera"
              >
                <span>↗️ Open in New Tab</span>
              </button>
            )}
            <button
              id="dismiss-camera-hint-btn"
              onClick={() => setCameraErrorMessage(null)}
              className="cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-full transition-all"
            >
              Keep Cartoon
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
