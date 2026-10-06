// @ts-nocheck -- uses the shared canvas costume drawers
import React, { useEffect, useRef } from 'react';
import { drawCostume } from '../utils/costumeDrawers';
import { CharacterId } from '../types';

/** Small picture of a costume on a simple face, drawn with the same artwork the child wears. */
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
    const head = size * 0.42;
    const cx = size / 2;
    const top = size * 0.42;
    // Face
    ctx.fillStyle = '#fde4c3';
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = Math.max(1.5, size * 0.025);
    ctx.beginPath();
    ctx.arc(cx, top + head * 0.62, head * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3b2412';
    ctx.beginPath();
    ctx.arc(cx - head * 0.22, top + head * 0.6, head * 0.07, 0, Math.PI * 2);
    ctx.arc(cx + head * 0.22, top + head * 0.6, head * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, top + head * 0.78, head * 0.16, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // Costume
    try {
      ctx.save();
      ctx.translate(cx, top);
      drawCostume(ctx, id, head);
      ctx.restore();
    } catch {
      // Artwork failure never shows an error to the child.
    }
  }, [id, size]);
  return <canvas ref={ref} style={{ width: size, height: size }} className={className} aria-hidden="true" />;
};
