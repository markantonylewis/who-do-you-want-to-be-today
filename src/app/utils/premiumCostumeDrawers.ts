// @ts-nocheck -- canvas costume artwork
// One flat style for all 32 costumes: flat fills, one outline colour and width,
// no gradients, gloss or shine.
//
// Coordinates: (0, 0) is the hairline/forehead anchor, `s` is the costume size.
// Face safe zones (nothing may be drawn here, on camera or cartoon face):
//   eyes:  |x| < 0.30s and 0.04s < y < 0.40s
//   mouth: |x| < 0.20s and 0.37s < y < 0.85s
// Approved exceptions: transparent owl/teacher glasses, pirate patch,
// open-eye superhero mask, large clown nose and hanging elephant trunk.
// Headwear ends at y <= 0.02s; cheek pieces start at |x| >= 0.32s.
import { CharacterId } from '../types';

type Ctx = CanvasRenderingContext2D;

export const OUTLINE = '#713f12';
let LW = 3;
/** Outline width for the current costume size. */
export function setOutlineFor(s: number) {
  LW = Math.max(1.5, s * 0.022);
}

export function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, fill: string, stroke: string | null = OUTLINE) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = LW; ctx.stroke(); }
}

export function path(ctx: Ctx, points: Array<[number, number]>, fill: string, stroke: string | null = OUTLINE) {
  ctx.fillStyle = fill;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = LW; ctx.stroke(); }
}

export function line(ctx: Ctx, points: Array<[number, number]>, color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
}

/** Fill + outline whatever path the callback builds. */
export function shape(ctx: Ctx, fill: string, build: () => void, stroke: string | null = OUTLINE) {
  ctx.fillStyle = fill;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  build();
  ctx.closePath();
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = LW; ctx.stroke(); }
}

export function star(ctx: Ctx, x: number, y: number, outer: number, inner: number, fill: string, points = 5, stroke: string | null = OUTLINE) {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  path(ctx, pts, fill, stroke);
}

export function animalEars(ctx: Ctx, s: number, outer: string, inner: string, tall = false) {
  const x = s * 0.42;
  const top = tall ? -s * 1.05 : -s * 0.67;
  path(ctx, [[-x, -s * 0.12], [-x * 1.2, top], [-x * 0.25, -s * 0.48]], outer);
  path(ctx, [[x, -s * 0.12], [x * 1.2, top], [x * 0.25, -s * 0.48]], outer);
  path(ctx, [[-x * 0.92, -s * 0.2], [-x * 1.04, top + s * 0.17], [-x * 0.4, -s * 0.46]], inner, null);
  path(ctx, [[x * 0.92, -s * 0.2], [x * 1.04, top + s * 0.17], [x * 0.4, -s * 0.46]], inner, null);
}

/** Forehead cap that stops above the eyebrows. */
export function foreheadCap(ctx: Ctx, s: number, fill: string) {
  shape(ctx, fill, () => {
    ctx.arc(0, 0, s * 0.56, Math.PI * 1.06, Math.PI * 1.94);
    ctx.lineTo(s * 0.5, -s * 0.02);
    ctx.quadraticCurveTo(0, -s * 0.2, -s * 0.5, -s * 0.02);
  });
}

/** Cheek pieces beside the face, clear of eyes and mouth. */
export function cheeks(ctx: Ctx, s: number, fill: string, stroke: string | null = OUTLINE) {
  ellipse(ctx, -s * 0.47, s * 0.34, s * 0.13, s * 0.17, fill, stroke);
  ellipse(ctx, s * 0.47, s * 0.34, s * 0.13, s * 0.17, fill, stroke);
}

/** Small animal nose between the eyes and mouth. */
export function nose(ctx: Ctx, s: number, fill: string) {
  path(ctx, [[-s * 0.055, s * 0.28], [s * 0.055, s * 0.28], [0, s * 0.345]], fill);
}

export function animalFace(ctx: Ctx, s: number, fur: string, inner: string, noseFill: string, options: { tall?: boolean; stripes?: boolean } = {}) {
  animalEars(ctx, s, fur, inner, options.tall);
  foreheadCap(ctx, s, fur);
  cheeks(ctx, s, fur);
  nose(ctx, s, noseFill);
  if (options.stripes) {
    [-0.2, 0, 0.2].forEach((x) => line(ctx, [[s * x, -s * 0.5], [s * x * 0.7, -s * 0.22]], noseFill, s * 0.035));
  }
}

export function brimHat(ctx: Ctx, s: number, crown: string, band: string, style: 'soft' | 'tall' | 'cap' = 'soft') {
  const top = style === 'tall' ? -s * 1.05 : -s * 0.8;
  shape(ctx, crown, () => {
    ctx.moveTo(-s * 0.45, -s * 0.16);
    ctx.quadraticCurveTo(-s * 0.5, top, 0, top);
    ctx.quadraticCurveTo(s * 0.5, top, s * 0.45, -s * 0.16);
  });
  path(ctx, [[-s * 0.45, -s * 0.3], [s * 0.45, -s * 0.3], [s * 0.45, -s * 0.16], [-s * 0.45, -s * 0.16]], band);
  ellipse(ctx, 0, -s * 0.1, style === 'cap' ? s * 0.6 : s * 0.72, s * 0.1, crown);
}

export function headband(ctx: Ctx, s: number, fill: string) {
  ellipse(ctx, 0, -s * 0.1, s * 0.53, s * 0.1, fill);
}

function cross(ctx: Ctx, x: number, y: number, s: number, fill: string) {
  path(ctx, [
    [x - s * 0.18, y - s * 0.5], [x + s * 0.18, y - s * 0.5], [x + s * 0.18, y - s * 0.18], [x + s * 0.5, y - s * 0.18],
    [x + s * 0.5, y + s * 0.18], [x + s * 0.18, y + s * 0.18], [x + s * 0.18, y + s * 0.5], [x - s * 0.18, y + s * 0.5],
    [x - s * 0.18, y + s * 0.18], [x - s * 0.5, y + s * 0.18], [x - s * 0.5, y - s * 0.18], [x - s * 0.18, y - s * 0.18],
  ], fill);
}

/** Unfilled round frames: the real or cartoon eyes remain visible through them. */
function roundGlasses(ctx: Ctx, s: number) {
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = LW;
  ctx.beginPath();
  [-1, 1].forEach((side) => {
    ctx.moveTo(side * s * 0.16 + s * 0.115, s * 0.2);
    ctx.arc(side * s * 0.16, s * 0.2, s * 0.115, 0, Math.PI * 2);
  });
  ctx.stroke();
  line(ctx, [[-s * 0.045, s * 0.2], [0, s * 0.175], [s * 0.045, s * 0.2]], OUTLINE, LW);
  [-1, 1].forEach((side) => line(ctx, [[side * s * 0.275, s * 0.2], [side * s * 0.43, s * 0.15]], OUTLINE, LW));
}

/** Flat domino mask with genuinely transparent openings, not painted-on eyes. */
function eyeMask(ctx: Ctx, s: number) {
  ctx.beginPath();
  ctx.moveTo(-s * 0.39, s * 0.1);
  ctx.quadraticCurveTo(-s * 0.2, s * 0.045, 0, s * 0.12);
  ctx.quadraticCurveTo(s * 0.2, s * 0.045, s * 0.39, s * 0.1);
  ctx.lineTo(s * 0.33, s * 0.29);
  ctx.quadraticCurveTo(s * 0.16, s * 0.35, s * 0.06, s * 0.28);
  ctx.lineTo(0, s * 0.34);
  ctx.lineTo(-s * 0.06, s * 0.28);
  ctx.quadraticCurveTo(-s * 0.16, s * 0.35, -s * 0.33, s * 0.29);
  ctx.closePath();
  [-1, 1].forEach((side) => {
    ctx.moveTo(side * s * 0.16 + s * 0.105, s * 0.2);
    ctx.ellipse(side * s * 0.16, s * 0.2, s * 0.105, s * 0.095, 0, 0, Math.PI * 2);
    ctx.closePath();
  });
  ctx.fillStyle = '#2563eb';
  ctx.fill('evenodd');
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = LW;
  ctx.stroke();
}

export function sparklePair(ctx: Ctx, s: number, color: string) {
  star(ctx, -s * 0.6, -s * 0.5, s * 0.1, s * 0.04, color, 4);
  star(ctx, s * 0.6, -s * 0.32, s * 0.12, s * 0.045, color, 4);
}

/** Classic black-and-white football. */
function football(ctx: Ctx, x: number, y: number, r: number) {
  ellipse(ctx, x, y, r, r, '#ffffff');
  const pent = (cx: number, cy: number, pr: number) => {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      pts.push([cx + Math.cos(a) * pr, cy + Math.sin(a) * pr]);
    }
    path(ctx, pts, '#111827', null);
  };
  pent(x, y, r * 0.32);
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    line(ctx, [[x + Math.cos(a) * r * 0.32, y + Math.sin(a) * r * 0.32], [x + Math.cos(a) * r * 0.72, y + Math.sin(a) * r * 0.72]], '#111827', LW * 0.8);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    pent(x + Math.cos(a) * r * 0.98, y + Math.sin(a) * r * 0.98, r * 0.3);
    ctx.restore();
  }
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = LW;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

/** Draws bespoke face-tracked premium masks and headpieces around the child's visible face. */
export function drawPremiumCostume(ctx: Ctx, characterId: CharacterId, s: number): boolean {
  setOutlineFor(s);
  switch (characterId) {
    case 'cat':
      animalFace(ctx, s, '#f97316', '#fed7aa', '#7c2d12', { stripes: true });
      [-1, 1].forEach((side) => {
        line(ctx, [[side * s * 0.4, s * 0.3], [side * s * 0.7, s * 0.24]], OUTLINE, LW * 0.8);
        line(ctx, [[side * s * 0.4, s * 0.38], [side * s * 0.72, s * 0.42]], OUTLINE, LW * 0.8);
      });
      return true;
    case 'rabbit':
      animalFace(ctx, s, '#f8fafc', '#f9a8d4', '#f472b6', { tall: true });
      return true;
    case 'monkey':
      animalEars(ctx, s, '#92400e', '#fbbf24');
      foreheadCap(ctx, s, '#92400e');
      ellipse(ctx, 0, -s * 0.3, s * 0.3, s * 0.13, '#fde68a', null);
      cheeks(ctx, s, '#92400e');
      nose(ctx, s, '#451a03');
      return true;
    case 'elephant':
      // Big flat ears and the owner-approved trunk hanging from the nose.
      ellipse(ctx, -s * 0.62, -s * 0.12, s * 0.24, s * 0.34, '#94a3b8');
      ellipse(ctx, s * 0.62, -s * 0.12, s * 0.24, s * 0.34, '#94a3b8');
      ellipse(ctx, -s * 0.62, -s * 0.12, s * 0.14, s * 0.22, '#f9a8d4', null);
      ellipse(ctx, s * 0.62, -s * 0.12, s * 0.14, s * 0.22, '#f9a8d4', null);
      foreheadCap(ctx, s, '#94a3b8');
      shape(ctx, '#94a3b8', () => {
        ctx.moveTo(-s * 0.09, s * 0.27);
        ctx.bezierCurveTo(-s * 0.12, s * 0.49, -s * 0.13, s * 0.76, s * 0.08, s * 0.81);
        ctx.quadraticCurveTo(s * 0.29, s * 0.84, s * 0.28, s * 0.63);
        ctx.quadraticCurveTo(s * 0.2, s * 0.57, s * 0.17, s * 0.67);
        ctx.quadraticCurveTo(s * 0.07, s * 0.75, s * 0.09, s * 0.27);
      });
      [0.4, 0.49, 0.58].forEach((y) => line(ctx, [[-s * 0.045, s * y], [s * 0.055, s * y]], OUTLINE, LW * 0.8));
      return true;
    case 'penguin':
      // Black cap and outer cheeks, white face patch around the eyes and cheeks, orange beak.
      ellipse(ctx, -s * 0.58, s * 0.28, s * 0.13, s * 0.26, '#1f2937');
      ellipse(ctx, s * 0.58, s * 0.28, s * 0.13, s * 0.26, '#1f2937');
      foreheadCap(ctx, s, '#1f2937');
      shape(ctx, '#ffffff', () => {
        ctx.moveTo(-s * 0.48, -s * 0.03);
        ctx.bezierCurveTo(-s * 0.5, -s * 0.36, -s * 0.2, -s * 0.5, 0, -s * 0.3);
        ctx.bezierCurveTo(s * 0.2, -s * 0.5, s * 0.5, -s * 0.36, s * 0.48, -s * 0.03);
        ctx.quadraticCurveTo(0, -s * 0.2, -s * 0.48, -s * 0.03);
      });
      cheeks(ctx, s, '#ffffff');
      path(ctx, [[-s * 0.06, s * 0.27], [s * 0.06, s * 0.27], [0, s * 0.35]], '#f59e0b');
      return true;
    case 'owl':
      // Feather tufts, brow and transparent round glasses.
      path(ctx, [[-s * 0.48, -s * 0.12], [-s * 0.6, -s * 0.7], [-s * 0.18, -s * 0.42]], '#78350f');
      path(ctx, [[s * 0.48, -s * 0.12], [s * 0.6, -s * 0.7], [s * 0.18, -s * 0.42]], '#78350f');
      foreheadCap(ctx, s, '#92400e');
      [-0.26, 0, 0.26].forEach((x) => path(ctx, [[s * (x - 0.08), -s * 0.3], [s * (x + 0.08), -s * 0.3], [s * x, -s * 0.2]], '#fcd34d', null));
      cheeks(ctx, s, '#fde68a');
      path(ctx, [[-s * 0.05, s * 0.27], [s * 0.05, s * 0.27], [0, s * 0.35]], '#f59e0b');
      roundGlasses(ctx, s);
      return true;
    case 'frog':
      foreheadCap(ctx, s, '#22c55e');
      ellipse(ctx, -s * 0.34, -s * 0.48, s * 0.19, s * 0.19, '#4ade80');
      ellipse(ctx, s * 0.34, -s * 0.48, s * 0.19, s * 0.19, '#4ade80');
      ellipse(ctx, -s * 0.34, -s * 0.48, s * 0.08, s * 0.08, '#111827', null);
      ellipse(ctx, s * 0.34, -s * 0.48, s * 0.08, s * 0.08, '#111827', null);
      cheeks(ctx, s, '#f9a8d4', null);
      return true;
    case 'nurse':
    case 'vet': {
      const vet = characterId === 'vet';
      if (vet) {
        ellipse(ctx, -s * 0.47, -s * 0.36, s * 0.15, s * 0.24, '#92400e');
        ellipse(ctx, s * 0.47, -s * 0.36, s * 0.15, s * 0.24, '#92400e');
      }
      path(ctx, [[-s * 0.3, -s * 0.12], [-s * 0.22, -s * 0.62], [s * 0.22, -s * 0.62], [s * 0.3, -s * 0.12]], vet ? '#14b8a6' : '#ffffff');
      headband(ctx, s, vet ? '#ccfbf1' : '#f8fafc');
      cross(ctx, 0, -s * 0.38, s * 0.26, vet ? '#ffffff' : '#ef4444');
      return true;
    }
    case 'farmer':
      brimHat(ctx, s, '#facc15', '#65a30d', 'soft');
      line(ctx, [[-s * 0.38, -s * 0.55], [s * 0.36, -s * 0.34]], '#ca8a04', LW);
      return true;
    case 'chef':
      [-0.32, 0, 0.32].forEach((x) => ellipse(ctx, s * x, -s * 0.62, s * 0.26, s * 0.3, '#ffffff'));
      path(ctx, [[-s * 0.44, -s * 0.62], [s * 0.44, -s * 0.62], [s * 0.44, -s * 0.12], [-s * 0.44, -s * 0.12]], '#ffffff');
      headband(ctx, s, '#f8fafc');
      cross(ctx, 0, -s * 0.36, s * 0.18, '#ef4444');
      return true;
    case 'teacher':
      // Mortarboard with tassel and transparent round glasses.
      headband(ctx, s, '#4c1d95');
      path(ctx, [[-s * 0.36, -s * 0.12], [-s * 0.36, -s * 0.38], [s * 0.36, -s * 0.38], [s * 0.36, -s * 0.12]], '#7c3aed');
      path(ctx, [[0, -s * 0.72], [s * 0.62, -s * 0.5], [0, -s * 0.3], [-s * 0.62, -s * 0.5]], '#7c3aed');
      line(ctx, [[0, -s * 0.5], [s * 0.5, -s * 0.44], [s * 0.52, -s * 0.18]], '#facc15', LW * 1.2);
      ellipse(ctx, s * 0.52, -s * 0.16, s * 0.05, s * 0.07, '#facc15');
      roundGlasses(ctx, s);
      return true;
    case 'pirate':
      // Pirate hat, bandana and the owner-approved one-eye patch.
      headband(ctx, s, '#dc2626');
      path(ctx, [[-s * 0.6, -s * 0.16], [-s * 0.42, -s * 0.68], [0, -s * 0.94], [s * 0.42, -s * 0.68], [s * 0.6, -s * 0.16]], '#1f2937');
      ellipse(ctx, 0, -s * 0.55, s * 0.1, s * 0.09, '#f8fafc');
      line(ctx, [[-s * 0.14, -s * 0.36], [s * 0.14, -s * 0.24]], '#f8fafc', LW * 1.4);
      line(ctx, [[s * 0.14, -s * 0.36], [-s * 0.14, -s * 0.24]], '#f8fafc', LW * 1.4);
      path(ctx, [[s * 0.5, -s * 0.12], [s * 0.72, s * 0.04], [s * 0.6, -s * 0.18]], '#dc2626');
      line(ctx, [[-s * 0.42, s * 0.035], [s * 0.16, s * 0.2], [s * 0.43, s * 0.27]], '#1f2937', LW * 1.4);
      shape(ctx, '#1f2937', () => {
        ctx.moveTo(s * 0.04, s * 0.105);
        ctx.lineTo(s * 0.28, s * 0.105);
        ctx.quadraticCurveTo(s * 0.3, s * 0.33, s * 0.16, s * 0.33);
        ctx.quadraticCurveTo(s * 0.02, s * 0.32, s * 0.04, s * 0.105);
      });
      return true;
    case 'astronaut':
      // Helmet ring around the face (open at the front), with antenna light.
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = s * 0.17 + LW * 2;
      ctx.beginPath(); ctx.arc(0, s * 0.18, s * 0.66, Math.PI * 0.82, Math.PI * 2.18); ctx.stroke();
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = s * 0.17;
      ctx.beginPath(); ctx.arc(0, s * 0.18, s * 0.66, Math.PI * 0.82, Math.PI * 2.18); ctx.stroke();
      ellipse(ctx, 0, -s * 0.48, s * 0.2, s * 0.09, '#2563eb');
      star(ctx, 0, -s * 0.48, s * 0.07, s * 0.03, '#facc15');
      sparklePair(ctx, s, '#fef08a');
      return true;
    case 'princess':
      headband(ctx, s, '#f9a8d4');
      path(ctx, [[-s * 0.42, -s * 0.14], [-s * 0.34, -s * 0.75], [-s * 0.12, -s * 0.42], [0, -s * 0.9], [s * 0.12, -s * 0.42], [s * 0.34, -s * 0.75], [s * 0.42, -s * 0.14]], '#facc15');
      ['#38bdf8', '#f43f5e', '#38bdf8'].forEach((c, i) => ellipse(ctx, (i - 1) * s * 0.23, -s * 0.28, s * 0.055, s * 0.075, c));
      sparklePair(ctx, s, '#ffffff');
      return true;
    case 'knight':
      // Helmet with a wide open face.
      shape(ctx, '#94a3b8', () => {
        ctx.arc(0, -s * 0.05, s * 0.6, Math.PI, 0);
        ctx.lineTo(s * 0.6, s * 0.5); ctx.lineTo(s * 0.4, s * 0.5); ctx.lineTo(s * 0.36, -s * 0.06);
        ctx.lineTo(-s * 0.36, -s * 0.06); ctx.lineTo(-s * 0.4, s * 0.5); ctx.lineTo(-s * 0.6, s * 0.5);
      });
      line(ctx, [[0, -s * 0.62], [0, -s * 0.12]], '#cbd5e1', LW * 1.6);
      path(ctx, [[-s * 0.08, -s * 0.6], [0, -s * 0.95], [s * 0.09, -s * 0.6]], '#ef4444');
      return true;
    case 'fairy':
      ellipse(ctx, -s * 0.66, -s * 0.1, s * 0.18, s * 0.36, '#e9d5ff');
      ellipse(ctx, s * 0.66, -s * 0.1, s * 0.18, s * 0.36, '#e9d5ff');
      headband(ctx, s, '#f5d0fe');
      path(ctx, [[-s * 0.06, -s * 0.14], [0, -s * 0.66], [s * 0.06, -s * 0.14]], '#a855f7');
      star(ctx, 0, -s * 0.74, s * 0.17, s * 0.07, '#facc15');
      sparklePair(ctx, s, '#fef08a');
      return true;
    case 'superhero':
      // Forehead cowl and star, with an open-eye mask below.
      shape(ctx, '#2563eb', () => {
        ctx.arc(0, 0, s * 0.57, Math.PI * 1.04, Math.PI * 1.96);
        ctx.lineTo(s * 0.55, s * 0.0);
        ctx.quadraticCurveTo(0, -s * 0.22, -s * 0.55, s * 0.0);
      });
      star(ctx, 0, -s * 0.36, s * 0.17, s * 0.075, '#facc15');
      path(ctx, [[-s * 0.55, -s * 0.02], [-s * 0.78, s * 0.5], [-s * 0.52, s * 0.42]], '#ef4444');
      path(ctx, [[s * 0.55, -s * 0.02], [s * 0.78, s * 0.5], [s * 0.52, s * 0.42]], '#ef4444');
      eyeMask(ctx, s);
      return true;
    case 'pilot':
      brimHat(ctx, s, '#f8fafc', '#1f2937', 'cap');
      path(ctx, [[-s * 0.2, -s * 0.46], [0, -s * 0.56], [s * 0.2, -s * 0.46], [0, -s * 0.37]], '#facc15');
      return true;
    case 'train_driver':
      brimHat(ctx, s, '#1f2937', '#b91c1c', 'cap');
      ellipse(ctx, 0, -s * 0.45, s * 0.12, s * 0.12, '#facc15');
      return true;
    case 'footballer':
      // White sweatband with a coloured stripe, and a classic football on top.
      ellipse(ctx, 0, -s * 0.1, s * 0.55, s * 0.11, '#ffffff');
      path(ctx, [[-s * 0.53, -s * 0.13], [s * 0.53, -s * 0.13], [s * 0.53, -s * 0.07], [-s * 0.53, -s * 0.07]], '#2563eb', null);
      football(ctx, 0, -s * 0.48, s * 0.27);
      return true;
    case 'dancer':
      headband(ctx, s, '#e11d48');
      path(ctx, [[-s * 0.45, -s * 0.14], [-s * 0.23, -s * 0.73], [0, -s * 0.46], [s * 0.23, -s * 0.73], [s * 0.45, -s * 0.14]], '#fecdd3');
      ellipse(ctx, 0, -s * 0.43, s * 0.12, s * 0.12, '#facc15');
      sparklePair(ctx, s, '#ffffff');
      return true;
    case 'clown':
      ['#38bdf8', '#facc15', '#f43f5e', '#4ade80', '#a855f7'].forEach((c, i) => {
        ellipse(ctx, (i - 2) * s * 0.23, -s * (0.42 + (i % 2) * 0.18), s * 0.2, s * 0.24, c);
      });
      ellipse(ctx, 0, s * 0.31, s * 0.13, s * 0.13, '#ef4444');
      cheeks(ctx, s, '#f9a8d4', null);
      return true;
    default:
      return false;
  }
}
