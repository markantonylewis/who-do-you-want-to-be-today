// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import { CharacterId } from '../types';

// Helper to draw shiny star
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

export function drawCostume(
  ctx: CanvasRenderingContext2D,
  characterId: CharacterId,
  size: number // base head size in pixels
) {
  // Center is (0, 0) at the forehead top / hairline anchor
  ctx.save();

  switch (characterId) {
    case 'firefighter': {
      // Firefighter Chief Helmet
      const w = size * 1.35;
      const h = size * 0.95;

      // Neck flap behind
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(0, h * 0.1, w * 0.58, h * 0.35, 0, 0, Math.PI);
      ctx.fill();

      // Main Red Helmet Dome
      const domeGrad = ctx.createLinearGradient(0, -h * 0.9, 0, h * 0.1);
      domeGrad.addColorStop(0, '#f87171');
      domeGrad.addColorStop(0.3, '#dc2626');
      domeGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = domeGrad;
      ctx.beginPath();
      ctx.moveTo(-w * 0.46, -h * 0.1);
      ctx.bezierCurveTo(-w * 0.5, -h * 0.75, -w * 0.25, -h * 0.95, 0, -h * 0.95);
      ctx.bezierCurveTo(w * 0.25, -h * 0.95, w * 0.5, -h * 0.75, w * 0.46, -h * 0.1);
      ctx.closePath();
      ctx.fill();

      // Helmet Ridge Top
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.6, w * 0.12, h * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wide Brim
      const brimGrad = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
      brimGrad.addColorStop(0, '#991b1b');
      brimGrad.addColorStop(0.5, '#ef4444');
      brimGrad.addColorStop(1, '#991b1b');
      ctx.fillStyle = brimGrad;
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.1, w * 0.55, h * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = Math.max(3, size * 0.02);
      ctx.strokeStyle = '#7f1d1d';
      ctx.stroke();

      // Gold Chief Shield Badge
      const badgeW = w * 0.26;
      const badgeH = h * 0.4;
      const badgeY = -h * 0.52;

      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = Math.max(2, size * 0.015);
      ctx.beginPath();
      ctx.moveTo(0, badgeY - badgeH * 0.5);
      ctx.lineTo(badgeW * 0.5, badgeY - badgeH * 0.2);
      ctx.lineTo(badgeW * 0.4, badgeY + badgeH * 0.4);
      ctx.lineTo(0, badgeY + badgeH * 0.55);
      ctx.lineTo(-badgeW * 0.4, badgeY + badgeH * 0.4);
      ctx.lineTo(-badgeW * 0.5, badgeY - badgeH * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Star in badge
      ctx.fillStyle = '#b45309';
      drawStar(ctx, 0, badgeY - badgeH * 0.05, 5, badgeW * 0.22, badgeW * 0.1);
      ctx.fill();

      // Reflective stripe on dome
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = Math.max(4, size * 0.025);
      ctx.beginPath();
      ctx.arc(0, -h * 0.1, w * 0.44, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      break;
    }

    case 'police_officer': {
      // Police Service Cap
      const w = size * 1.35;
      const h = size * 0.85;

      // Dark Navy Crown
      const crownGrad = ctx.createLinearGradient(0, -h * 0.85, 0, 0);
      crownGrad.addColorStop(0, '#1e3a8a');
      crownGrad.addColorStop(0.7, '#172554');
      crownGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = crownGrad;
      ctx.beginPath();
      ctx.moveTo(-w * 0.48, -h * 0.2);
      ctx.bezierCurveTo(-w * 0.55, -h * 0.65, -w * 0.3, -h * 0.88, 0, -h * 0.88);
      ctx.bezierCurveTo(w * 0.3, -h * 0.88, w * 0.55, -h * 0.65, w * 0.48, -h * 0.2);
      ctx.closePath();
      ctx.fill();

      // Cap Headband
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.2, w * 0.46, h * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glossy Visor
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.12, w * 0.48, h * 0.16, 0, 0, Math.PI);
      ctx.fill();

      // Visor highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = Math.max(3, size * 0.018);
      ctx.beginPath();
      ctx.arc(0, -h * 0.12, w * 0.42, Math.PI * 0.15, Math.PI * 0.45);
      ctx.stroke();

      // Gold Braided Chin Strap Cord
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = Math.max(4, size * 0.024);
      ctx.beginPath();
      ctx.arc(0, -h * 0.18, w * 0.43, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();

      // Gold buttons on sides
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(-w * 0.42, -h * 0.18, size * 0.035, 0, Math.PI * 2);
      ctx.arc(w * 0.42, -h * 0.18, size * 0.035, 0, Math.PI * 2);
      ctx.fill();

      // Gold Eagle Police Badge
      const badgeY = -h * 0.48;
      const bSize = w * 0.24;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = Math.max(2, size * 0.015);
      ctx.beginPath();
      ctx.arc(0, badgeY, bSize * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Badge star
      ctx.fillStyle = '#1e3a8a';
      drawStar(ctx, 0, badgeY, 6, bSize * 0.35, bSize * 0.16);
      ctx.fill();
      break;
    }

    case 'builder': {
      // Construction Hard Hat
      const w = size * 1.35;
      const h = size * 0.9;

      // Bright Yellow Dome
      const hatGrad = ctx.createLinearGradient(0, -h * 0.9, 0, h * 0.1);
      hatGrad.addColorStop(0, '#fef08a');
      hatGrad.addColorStop(0.3, '#facc15');
      hatGrad.addColorStop(1, '#eab308');
      ctx.fillStyle = hatGrad;
      ctx.beginPath();
      ctx.moveTo(-w * 0.48, -h * 0.12);
      ctx.bezierCurveTo(-w * 0.52, -h * 0.7, -w * 0.3, -h * 0.9, 0, -h * 0.9);
      ctx.bezierCurveTo(w * 0.3, -h * 0.9, w * 0.52, -h * 0.7, w * 0.48, -h * 0.12);
      ctx.closePath();
      ctx.fill();

      // Raised reinforcement ribs on top
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = Math.max(4, size * 0.025);
      [-w * 0.18, 0, w * 0.18].forEach(rx => {
        ctx.beginPath();
        ctx.moveTo(rx * 0.6, -h * 0.88);
        ctx.lineTo(rx, -h * 0.25);
        ctx.stroke();
      });

      // Front Hard Hat Rim
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.12, w * 0.54, h * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.14, w * 0.52, h * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();

      // Builder Emblem / Hammer Logo
      const logoY = -h * 0.5;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, logoY, w * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      // Mini hammer icon
      ctx.rect(-w * 0.02, logoY - h * 0.1, w * 0.04, h * 0.2);
      ctx.rect(-w * 0.08, logoY - h * 0.1, w * 0.16, h * 0.06);
      ctx.fill();
      break;
    }

    case 'doctor': {
      // Doctor's Headband with Reflective Head Mirror & Red Cross
      const w = size * 1.25;
      const h = size * 0.7;

      // White cloth headband across forehead
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = Math.max(2, size * 0.015);
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.05, w * 0.48, h * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Red Cross on right side of headband
      const crossX = w * 0.25;
      const crossY = -h * 0.05;
      const cs = size * 0.06;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(crossX - cs * 0.35, crossY - cs, cs * 0.7, cs * 2);
      ctx.fillRect(crossX - cs, crossY - cs * 0.35, cs * 2, cs * 0.7);

      // Concave Silver Head Mirror on left side
      const mirrorX = -w * 0.18;
      const mirrorY = -h * 0.35;
      const mRadius = size * 0.22;

      // Chrome reflector gradient
      const mirrorGrad = ctx.createRadialGradient(
        mirrorX - mRadius * 0.3,
        mirrorY - mRadius * 0.3,
        mRadius * 0.1,
        mirrorX,
        mirrorY,
        mRadius
      );
      mirrorGrad.addColorStop(0, '#ffffff');
      mirrorGrad.addColorStop(0.4, '#e2e8f0');
      mirrorGrad.addColorStop(0.8, '#94a3b8');
      mirrorGrad.addColorStop(1, '#475569');

      ctx.fillStyle = mirrorGrad;
      ctx.beginPath();
      ctx.arc(mirrorX, mirrorY, mRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = Math.max(3, size * 0.02);
      ctx.stroke();

      // Center peephole
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(mirrorX, mirrorY, mRadius * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Mirror shine spark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(mirrorX - mRadius * 0.45, mirrorY - mRadius * 0.45, mRadius * 0.16, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'lion': {
      // Fluffy Lion Mane framing head + Lion Ears
      const w = size * 1.6;
      const h = size * 1.5;

      // Golden Mane Tuft Circles around perimeter
      const tuftCount = 14;
      const maneRadiusX = w * 0.58;
      const maneRadiusY = h * 0.52;

      for (let i = 0; i < tuftCount; i++) {
        const angle = (i / tuftCount) * Math.PI * 2;
        const tx = Math.cos(angle) * maneRadiusX;
        const ty = Math.sin(angle) * maneRadiusY + h * 0.1;
        const tuftR = size * 0.26;

        const tuftGrad = ctx.createRadialGradient(tx, ty, tuftR * 0.2, tx, ty, tuftR);
        tuftGrad.addColorStop(0, '#fde047');
        tuftGrad.addColorStop(0.6, '#f97316');
        tuftGrad.addColorStop(1, '#c2410c');

        ctx.fillStyle = tuftGrad;
        ctx.beginPath();
        ctx.arc(tx, ty, tuftR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rounded Lion Ears
      [-w * 0.42, w * 0.42].forEach(ex => {
        // Outer ear
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(ex, -h * 0.35, size * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Inner soft ear
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(ex, -h * 0.35, size * 0.11, 0, Math.PI * 2);
        ctx.fill();
      });

      // Fluffy Forehead Hair Tuft
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-size * 0.12, -h * 0.25);
      ctx.quadraticCurveTo(0, -h * 0.42, size * 0.12, -h * 0.25);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'tiger': {
      // Tiger Ears & Tiger Forehead / Cheek Whiskers
      const w = size * 1.45;
      const h = size * 0.9;

      // Tiger Ears
      [-w * 0.4, w * 0.4].forEach(ex => {
        // Outer orange ear
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(ex, -h * 0.35, size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Black stripes on ear
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = Math.max(3, size * 0.02);
        ctx.beginPath();
        ctx.moveTo(ex - size * 0.1, -h * 0.45);
        ctx.lineTo(ex + size * 0.1, -h * 0.35);
        ctx.moveTo(ex - size * 0.08, -h * 0.28);
        ctx.lineTo(ex + size * 0.12, -h * 0.22);
        ctx.stroke();

        // Soft white inner fluff
        ctx.fillStyle = '#fafaf9';
        ctx.beginPath();
        ctx.arc(ex, -h * 0.32, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
      });

      // Tiger Forehead King "王" / Tribal Stripes
      ctx.fillStyle = '#18181b';
      const fY = -h * 0.2;
      // Center stripe
      ctx.beginPath();
      ctx.ellipse(0, fY - size * 0.08, size * 0.025, size * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      // Left and right angled stripes
      ctx.beginPath();
      ctx.ellipse(-size * 0.12, fY, size * 0.025, size * 0.07, -0.5, 0, Math.PI * 2);
      ctx.ellipse(size * 0.12, fY, size * 0.025, size * 0.07, 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'dog': {
      // Floppy Puppy Ears + Cute Puppy Button Nose
      const w = size * 1.5;
      const h = size * 1.1;

      // Left Floppy Ear
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, -h * 0.25);
      ctx.bezierCurveTo(-w * 0.6, -h * 0.1, -w * 0.55, h * 0.35, -w * 0.38, h * 0.4);
      ctx.bezierCurveTo(-w * 0.25, h * 0.4, -w * 0.2, 0, -w * 0.28, -h * 0.25);
      ctx.closePath();
      ctx.fill();

      // Right Floppy Ear
      ctx.beginPath();
      ctx.moveTo(w * 0.3, -h * 0.25);
      ctx.bezierCurveTo(w * 0.6, -h * 0.1, w * 0.55, h * 0.35, w * 0.38, h * 0.4);
      ctx.bezierCurveTo(w * 0.25, h * 0.4, w * 0.2, 0, w * 0.28, -h * 0.25);
      ctx.closePath();
      ctx.fill();

      // Inner ear lighter tone
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(-w * 0.38, h * 0.12, size * 0.08, size * 0.2, -0.2, 0, Math.PI * 2);
      ctx.ellipse(w * 0.38, h * 0.12, size * 0.08, size * 0.2, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Cute Puppy Nose (placed slightly lower at nose bridge)
      const noseY = h * 0.48;
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.ellipse(0, noseY, size * 0.12, size * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nose shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-size * 0.04, noseY - size * 0.03, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'dinosaur': {
      // Dinosaur Spikes along crest & reptile horn crest
      const w = size * 1.35;
      const h = size * 1.1;

      // Curved Green Crest Base
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.22, w * 0.45, h * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Triangular Lime-Green Spikes sticking up
      const spikePositions = [
        { x: -w * 0.32, y: -h * 0.22, angle: -0.6, size: size * 0.22 },
        { x: -w * 0.18, y: -h * 0.35, angle: -0.3, size: size * 0.28 },
        { x: 0, y: -h * 0.42, angle: 0, size: size * 0.34 }, // center tall spike
        { x: w * 0.18, y: -h * 0.35, angle: 0.3, size: size * 0.28 },
        { x: w * 0.32, y: -h * 0.22, angle: 0.6, size: size * 0.22 },
      ];

      spikePositions.forEach(sp => {
        ctx.save();
        ctx.translate(sp.x, sp.y);
        ctx.rotate(sp.angle);

        // Spike Gradient
        const sGrad = ctx.createLinearGradient(0, -sp.size, 0, 0);
        sGrad.addColorStop(0, '#facc15'); // bright yellow spike tip
        sGrad.addColorStop(0.4, '#84cc16'); // lime green
        sGrad.addColorStop(1, '#16a34a'); // deep dino green

        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.moveTo(-sp.size * 0.4, 0);
        ctx.lineTo(0, -sp.size);
        ctx.lineTo(sp.size * 0.4, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = Math.max(2, size * 0.015);
        ctx.stroke();

        ctx.restore();
      });

      // Dino reptile scales / dots on forehead
        ctx.fillStyle = '#84cc16';
        [-size * 0.15, 0, size * 0.15].forEach(dx => {
          ctx.beginPath();
          ctx.arc(dx, -h * 0.12, size * 0.04, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }
    case 'star': {
      // Golden Celestial Star Headdress
      const w = size * 1.35;
      const h = size * 1.1;

      // 1. Luminous Golden Aura Halo
      const haloGrad = ctx.createRadialGradient(0, -h * 0.45, size * 0.1, 0, -h * 0.45, size * 0.72);
      haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      haloGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.22)');
      haloGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(0, -h * 0.45, size * 0.72, 0, Math.PI * 2);
      ctx.fill();

      // 2. Crown Headband Base
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.12, w * 0.46, h * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();

      const bandGrad = ctx.createLinearGradient(-w * 0.45, 0, w * 0.45, 0);
      bandGrad.addColorStop(0, '#eab308');
      bandGrad.addColorStop(0.5, '#fef08a');
      bandGrad.addColorStop(1, '#eab308');
      ctx.fillStyle = bandGrad;
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.14, w * 0.44, h * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Band jewels
      [-w * 0.28, -w * 0.14, 0, w * 0.14, w * 0.28].forEach((bx, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(bx, -h * 0.14, size * 0.035, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 3. Main Giant 5-Pointed Star
      const starCx = 0;
      const starCy = -h * 0.48;
      const outerR = size * 0.54;
      const innerR = size * 0.26;

      const starGrad = ctx.createLinearGradient(0, starCy - outerR, 0, starCy + innerR);
      starGrad.addColorStop(0, '#fef9c3'); // bright starlight cream
      starGrad.addColorStop(0.3, '#fde047'); // sunny star yellow
      starGrad.addColorStop(0.7, '#facc15'); // rich gold
      starGrad.addColorStop(1, '#ca8a04'); // deep amber shadow

      ctx.fillStyle = starGrad;
      drawStar(ctx, starCx, starCy, 5, outerR, innerR);
      ctx.fill();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = Math.max(3, size * 0.022);
      ctx.lineJoin = 'round';
      ctx.stroke();

      // 4. Star 3D Facet Lines & Shading
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / 5;
      for (let i = 0; i < 5; i++) {
        const outerX = starCx + Math.cos(rot) * outerR;
        const outerY = starCy + Math.sin(rot) * outerR;
        rot += step;
        const innerX = starCx + Math.cos(rot) * innerR;
        const innerY = starCy + Math.sin(rot) * innerR;
        rot += step;

        // Shadow facet
        ctx.fillStyle = 'rgba(180, 83, 9, 0.18)';
        ctx.beginPath();
        ctx.moveTo(starCx, starCy);
        ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
        ctx.closePath();
        ctx.fill();

        // Highlight line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(starCx, starCy);
        ctx.lineTo(outerX, outerY);
        ctx.stroke();
      }

      // 5. Center Diamond Sparkle Jewel
      ctx.fillStyle = '#ffffff';
      drawStar(ctx, starCx, starCy, 4, size * 0.13, size * 0.04);
      ctx.fill();

      // 6. Floating Stardust Sparkles
      const floatingStars = [
        { x: -w * 0.42, y: -h * 0.28, r1: size * 0.11, r2: size * 0.04 },
        { x: w * 0.42, y: -h * 0.32, r1: size * 0.12, r2: size * 0.04 },
        { x: -w * 0.26, y: -h * 0.82, r1: size * 0.09, r2: size * 0.035 },
        { x: w * 0.28, y: -h * 0.80, r1: size * 0.09, r2: size * 0.035 },
      ];

      floatingStars.forEach(fs => {
        const fGrad = ctx.createRadialGradient(fs.x, fs.y, 0, fs.x, fs.y, fs.r1);
        fGrad.addColorStop(0, '#ffffff');
        fGrad.addColorStop(0.5, '#fef08a');
        fGrad.addColorStop(1, '#facc15');
        ctx.fillStyle = fGrad;
        drawStar(ctx, fs.x, fs.y, 4, fs.r1, fs.r2);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // 7. Cute Star Face Stickers on Cheeks
      const cheekLeftX = -size * 0.32;
      const cheekRightX = size * 0.32;
      const cheekY = size * 0.22;

      ctx.fillStyle = '#fde047';
      drawStar(ctx, cheekLeftX, cheekY, 5, size * 0.08, size * 0.035);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1;
      ctx.stroke();

      drawStar(ctx, cheekRightX, cheekY, 5, size * 0.08, size * 0.035);
      ctx.fill();
      ctx.stroke();

      break;
    }
  }

  ctx.restore();
}
