// @ts-nocheck -- uses the shared canvas costume drawers
import React, { useEffect, useRef } from 'react';
import { drawCostume } from '../utils/costumeDrawers';
import { CharacterId } from '../types';

/**
 * Small picture of a costume on the cartoon face, drawn with the same artwork the
 * child wears and the same face proportions as the in-game cartoon face.
 */
export const CostumeThumb: React.FC<{ id: CharacterId; size?: number; className?: string }> = ({
  id,
  size = 80,
  className,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;
    c.width = size * dpr;
    c.height = size * dpr;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const s = size * 0.5; // costume size
    const cx = size / 2;
    const top = size * 0.52; // forehead anchor
    const lw = Math.max(1.5, s * 0.022);
    // Face (same proportions as the game's cartoon face)
    ctx.fillStyle = '#fde4c3';
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(cx, top + s * 0.27, s * 0.39, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Eyebrows, eyes, nose, mouth
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.22, top + s * 0.08); ctx.lineTo(cx - s * 0.1, top + s * 0.09);
    ctx.moveTo(cx + s * 0.22, top + s * 0.08); ctx.lineTo(cx + s * 0.1, top + s * 0.09);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#713f12';
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.arc(cx + side * s * 0.16, top + s * 0.2, s * 0.07, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.fillStyle = '#3b2412';
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.arc(cx + side * s * 0.16, top + s * 0.2, s * 0.04, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = '#713f12';
    ctx.beginPath();
    ctx.arc(cx, top + s * 0.36, s * 0.09, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // Costume
    try {
      ctx.save();
      ctx.translate(cx, top);
      drawCostume(ctx, id, s);
      ctx.restore();
    } catch {
      // Artwork failure never shows an error to the child.
    }
  }, [id, size]);
  return <canvas ref={ref} style={{ width: size, height: size }} className={className} aria-hidden="true" />;
};
