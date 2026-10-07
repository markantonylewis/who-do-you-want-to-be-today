// @ts-nocheck -- canvas costume artwork
// The 9 original costumes, drawn in the same flat premium style (helpers and the
// face safe zones live in premiumCostumeDrawers.ts). Nothing covers eyes or mouth.
import { CharacterId } from '../types';
import {
  drawPremiumCostume,
  setOutlineFor,
  ellipse,
  path,
  line,
  shape,
  star,
  animalEars,
  animalFace,
  foreheadCap,
  cheeks,
  nose,
  brimHat,
  headband,
  sparklePair,
  OUTLINE,
} from './premiumCostumeDrawers';

type Ctx = CanvasRenderingContext2D;

/** Rounded hard-hat dome sitting on a brim that stays above the eyebrows. */
function helmetDome(ctx: Ctx, s: number, fill: string, top: number) {
  shape(ctx, fill, () => {
    ctx.moveTo(-s * 0.5, -s * 0.12);
    ctx.bezierCurveTo(-s * 0.52, top, s * 0.52, top, s * 0.5, -s * 0.12);
  });
}

export function drawCostume(ctx: Ctx, characterId: CharacterId, s: number) {
  ctx.save();
  setOutlineFor(s);
  const lw = Math.max(1.5, s * 0.022);

  switch (characterId) {
    case 'firefighter': {
      // Neck flap behind, at the sides only.
      path(ctx, [[-s * 0.6, -s * 0.12], [-s * 0.66, s * 0.42], [-s * 0.42, s * 0.36], [-s * 0.4, -s * 0.06]], '#1f2937');
      path(ctx, [[s * 0.6, -s * 0.12], [s * 0.66, s * 0.42], [s * 0.42, s * 0.36], [s * 0.4, -s * 0.06]], '#1f2937');
      helmetDome(ctx, s, '#dc2626', -s * 1.02);
      line(ctx, [[0, -s * 0.74], [0, -s * 0.2]], '#991b1b', lw * 1.6);
      // Brim: wide at the back and sides, slim at the front, all above the eyebrows.
      shape(ctx, '#dc2626', () => {
        ctx.moveTo(-s * 0.78, -s * 0.1);
        ctx.quadraticCurveTo(-s * 0.6, -s * 0.22, 0, -s * 0.2);
        ctx.quadraticCurveTo(s * 0.6, -s * 0.22, s * 0.78, -s * 0.1);
        ctx.quadraticCurveTo(s * 0.5, s * 0.0, 0, -s * 0.06);
        ctx.quadraticCurveTo(-s * 0.5, s * 0.0, -s * 0.78, -s * 0.1);
      });
      // Front shield badge.
      shape(ctx, '#facc15', () => {
        ctx.moveTo(-s * 0.16, -s * 0.62);
        ctx.lineTo(s * 0.16, -s * 0.62);
        ctx.lineTo(s * 0.16, -s * 0.4);
        ctx.quadraticCurveTo(0, -s * 0.24, -s * 0.16, -s * 0.4);
      });
      star(ctx, 0, -s * 0.47, s * 0.08, s * 0.035, '#dc2626', 5, null);
      break;
    }

    case 'police_officer': {
      brimHat(ctx, s, '#1e3a8a', '#ffffff', 'cap');
      // Checked band.
      for (let i = 0; i < 8; i += 1) {
        if (i % 2 === 0) path(ctx, [[-s * 0.45 + i * s * 0.1125, -s * 0.3], [-s * 0.45 + (i + 1) * s * 0.1125, -s * 0.3], [-s * 0.45 + (i + 1) * s * 0.1125, -s * 0.16], [-s * 0.45 + i * s * 0.1125, -s * 0.16]], '#111827', null);
      }
      line(ctx, [[-s * 0.45, -s * 0.3], [s * 0.45, -s * 0.3]], OUTLINE, lw);
      line(ctx, [[-s * 0.45, -s * 0.16], [s * 0.45, -s * 0.16]], OUTLINE, lw);
      // Peak, above the eyebrows.
      shape(ctx, '#111827', () => {
        ctx.moveTo(-s * 0.44, -s * 0.12);
        ctx.quadraticCurveTo(0, s * 0.02, s * 0.44, -s * 0.12);
        ctx.quadraticCurveTo(0, -s * 0.06, -s * 0.44, -s * 0.12);
      });
      star(ctx, 0, -s * 0.52, s * 0.13, s * 0.06, '#facc15', 6);
      break;
    }

    case 'builder': {
      helmetDome(ctx, s, '#facc15', -s * 0.98);
      path(ctx, [[-s * 0.08, -s * 0.72], [s * 0.08, -s * 0.72], [s * 0.1, -s * 0.16], [-s * 0.1, -s * 0.16]], '#eab308');
      ellipse(ctx, 0, -s * 0.1, s * 0.68, s * 0.09, '#facc15');
      path(ctx, [[-s * 0.3, -s * 0.36], [s * 0.3, -s * 0.36], [s * 0.3, -s * 0.26], [-s * 0.3, -s * 0.26]], '#f97316', null);
      break;
    }

    case 'doctor': {
      // Head mirror on a headband, high on the forehead.
      line(ctx, [[0, -s * 0.12], [0, -s * 0.3]], OUTLINE, lw * 1.4);
      headband(ctx, s, '#e2e8f0');
      ellipse(ctx, 0, -s * 0.45, s * 0.2, s * 0.2, '#cbd5e1');
      ellipse(ctx, 0, -s * 0.45, s * 0.12, s * 0.12, '#f8fafc');
      ellipse(ctx, 0, -s * 0.45, s * 0.04, s * 0.04, '#1f2937', null);
      // Stethoscope ear tips at the sides.
      ellipse(ctx, -s * 0.5, s * 0.12, s * 0.06, s * 0.06, '#1f2937');
      ellipse(ctx, s * 0.5, s * 0.12, s * 0.06, s * 0.06, '#1f2937');
      line(ctx, [[-s * 0.5, s * 0.18], [-s * 0.56, s * 0.6]], '#1f2937', lw * 1.4);
      line(ctx, [[s * 0.5, s * 0.18], [s * 0.56, s * 0.6]], '#1f2937', lw * 1.4);
      break;
    }

    case 'lion': {
      // Flat outlined mane around the top and sides (never below the cheeks).
      const tufts = 13;
      for (let i = 0; i < tufts; i += 1) {
        const a = Math.PI * (0.92 + (1.16 * i) / (tufts - 1));
        ellipse(ctx, Math.cos(a) * s * 0.66, s * 0.12 + Math.sin(a) * s * 0.66, s * 0.17, s * 0.17, i % 2 ? '#c2410c' : '#ea580c');
      }
      animalEars(ctx, s * 0.9, '#f59e0b', '#fde68a');
      foreheadCap(ctx, s, '#f59e0b');
      cheeks(ctx, s, '#f59e0b');
      nose(ctx, s, '#7c2d12');
      break;
    }

    case 'tiger': {
      animalFace(ctx, s, '#f97316', '#fff7ed', '#1f2937', { stripes: true });
      [-1, 1].forEach((side) => {
        line(ctx, [[side * s * 0.38, s * 0.28], [side * s * 0.52, s * 0.3]], '#1f2937', lw * 1.3);
        line(ctx, [[side * s * 0.38, s * 0.38], [side * s * 0.52, s * 0.4]], '#1f2937', lw * 1.3);
      });
      break;
    }

    case 'dog': {
      // Floppy ears beside the face.
      shape(ctx, '#78350f', () => {
        ctx.moveTo(-s * 0.42, -s * 0.2);
        ctx.quadraticCurveTo(-s * 0.82, -s * 0.12, -s * 0.66, s * 0.48);
        ctx.quadraticCurveTo(-s * 0.48, s * 0.56, -s * 0.36, s * 0.1);
      });
      shape(ctx, '#78350f', () => {
        ctx.moveTo(s * 0.42, -s * 0.2);
        ctx.quadraticCurveTo(s * 0.82, -s * 0.12, s * 0.66, s * 0.48);
        ctx.quadraticCurveTo(s * 0.48, s * 0.56, s * 0.36, s * 0.1);
      });
      foreheadCap(ctx, s, '#d97706');
      ellipse(ctx, s * 0.2, -s * 0.32, s * 0.12, s * 0.09, '#78350f', null);
      nose(ctx, s, '#1f2937');
      break;
    }

    case 'dinosaur': {
      // Row of spikes over a green hood.
      [-0.36, -0.18, 0, 0.18, 0.36].forEach((x, i) => {
        const h = i === 2 ? 0.86 : i % 2 ? 0.76 : 0.64;
        path(ctx, [[s * (x - 0.11), -s * 0.4], [s * x, -s * h], [s * (x + 0.11), -s * 0.4]], '#f97316');
      });
      foreheadCap(ctx, s, '#22c55e');
      [-0.24, 0, 0.24].forEach((x) => ellipse(ctx, s * x, -s * 0.28, s * 0.06, s * 0.05, '#86efac', null));
      cheeks(ctx, s, '#22c55e');
      break;
    }

    case 'star': {
      headband(ctx, s, '#a855f7');
      line(ctx, [[0, -s * 0.14], [0, -s * 0.4]], OUTLINE, lw * 1.4);
      star(ctx, 0, -s * 0.62, s * 0.3, s * 0.13, '#facc15');
      star(ctx, -s * 0.38, -s * 0.32, s * 0.11, s * 0.05, '#fde047');
      star(ctx, s * 0.38, -s * 0.32, s * 0.11, s * 0.05, '#fde047');
      sparklePair(ctx, s, '#fef9c3');
      star(ctx, -s * 0.47, s * 0.34, s * 0.08, s * 0.035, '#fde047');
      star(ctx, s * 0.47, s * 0.34, s * 0.08, s * 0.035, '#fde047');
      break;
    }

    default:
      drawPremiumCostume(ctx, characterId, s);
      break;
  }

  ctx.restore();
}
