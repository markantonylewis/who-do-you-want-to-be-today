// @ts-nocheck -- canvas costume artwork
import { CharacterId } from '../types';

type Ctx = CanvasRenderingContext2D;

const outline = '#713f12';

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, fill: string, stroke = outline, width = 3) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (width > 0) ctx.stroke();
}

function path(ctx: Ctx, points: Array<[number, number]>, fill: string, stroke = outline, width = 3) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fill();
  if (width > 0) ctx.stroke();
}

function line(ctx: Ctx, points: Array<[number, number]>, color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.stroke();
}

function star(ctx: Ctx, x: number, y: number, outer: number, inner: number, fill: string, points = 5) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 ? inner : outer;
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function animalEars(ctx: Ctx, s: number, outer: string, inner: string, tall = false) {
  const x = s * 0.42;
  const top = tall ? -s * 1.1 : -s * 0.67;
  const bottom = -s * 0.05;
  path(ctx, [[-x, bottom], [-x * 1.2, top], [-x * 0.25, -s * 0.48]], outer);
  path(ctx, [[x, bottom], [x * 1.2, top], [x * 0.25, -s * 0.48]], outer);
  path(ctx, [[-x * 0.9, -s * 0.12], [-x * 1.02, top + s * 0.17], [-x * 0.38, -s * 0.45]], inner, inner, 0);
  path(ctx, [[x * 0.9, -s * 0.12], [x * 1.02, top + s * 0.17], [x * 0.38, -s * 0.45]], inner, inner, 0);
}

function animalFace(ctx: Ctx, s: number, fur: string, inner: string, nose: string, options: { tall?: boolean; round?: boolean; stripes?: boolean } = {}) {
  animalEars(ctx, s, fur, inner, options.tall);
  // Forehead cap and cheek patches frame the child's real face instead of covering it.
  ctx.fillStyle = fur;
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(3, s * 0.025);
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.56, Math.PI * 1.08, Math.PI * 1.92);
  ctx.lineTo(s * 0.31, -s * 0.05);
  ctx.quadraticCurveTo(0, -s * 0.25, -s * 0.31, -s * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ellipse(ctx, -s * 0.39, s * 0.22, s * 0.18, s * 0.24, fur);
  ellipse(ctx, s * 0.39, s * 0.22, s * 0.18, s * 0.24, fur);
  ellipse(ctx, 0, s * 0.32, s * 0.13, s * 0.09, inner, inner, 0);
  path(ctx, [[-s * 0.07, s * 0.29], [s * 0.07, s * 0.29], [0, s * 0.39]], nose, nose, 0);
  if (options.stripes) {
    [-0.2, 0, 0.2].forEach((x) => line(ctx, [[s * x, -s * 0.5], [s * x * 0.6, -s * 0.24]], nose, s * 0.035));
  }
}

function brimHat(ctx: Ctx, s: number, crown: string, band: string, style: 'soft' | 'tall' | 'cap' = 'soft') {
  const top = style === 'tall' ? -s * 1.05 : -s * 0.78;
  ctx.fillStyle = crown;
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(3, s * 0.025);
  ctx.beginPath();
  ctx.moveTo(-s * 0.45, -s * 0.12);
  ctx.quadraticCurveTo(-s * 0.5, top, 0, top);
  ctx.quadraticCurveTo(s * 0.5, top, s * 0.45, -s * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = band;
  ctx.fillRect(-s * 0.45, -s * 0.25, s * 0.9, s * 0.15);
  ellipse(ctx, 0, -s * 0.08, style === 'cap' ? s * 0.65 : s * 0.72, s * 0.13, crown, outline, Math.max(3, s * 0.025));
}

function headband(ctx: Ctx, s: number, fill: string) {
  ellipse(ctx, 0, -s * 0.08, s * 0.53, s * 0.12, fill, outline, Math.max(3, s * 0.025));
}

function cross(ctx: Ctx, x: number, y: number, s: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.fillRect(x - s * 0.2, y - s * 0.5, s * 0.4, s);
  ctx.fillRect(x - s * 0.5, y - s * 0.2, s, s * 0.4);
}

function roundGlasses(ctx: Ctx, s: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(4, s * 0.035);
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.arc(side * s * 0.24, s * 0.12, s * 0.18, 0, Math.PI * 2);
    ctx.stroke();
  });
  line(ctx, [[-s * 0.06, s * 0.12], [s * 0.06, s * 0.12]], color, s * 0.035);
}

function sparklePair(ctx: Ctx, s: number, color: string) {
  star(ctx, -s * 0.55, -s * 0.45, s * 0.1, s * 0.035, color, 4);
  star(ctx, s * 0.55, -s * 0.28, s * 0.12, s * 0.04, color, 4);
}

/** Draws bespoke face-tracked premium masks and headpieces around the child's visible face. */
export function drawPremiumCostume(ctx: Ctx, characterId: CharacterId, s: number): boolean {
  switch (characterId) {
    case 'cat':
      animalFace(ctx, s, '#f97316', '#fed7aa', '#7c2d12', { stripes: true });
      [-1, 1].forEach((side) => {
        line(ctx, [[side * s * 0.16, s * 0.34], [side * s * 0.58, s * 0.25]], '#713f12', s * 0.018);
        line(ctx, [[side * s * 0.16, s * 0.39], [side * s * 0.6, s * 0.42]], '#713f12', s * 0.018);
      });
      return true;
    case 'rabbit':
      animalFace(ctx, s, '#f8fafc', '#f9a8d4', '#f472b6', { tall: true });
      return true;
    case 'monkey':
      animalEars(ctx, s, '#92400e', '#fbbf24');
      ellipse(ctx, 0, -s * 0.37, s * 0.55, s * 0.36, '#92400e');
      ellipse(ctx, 0, -s * 0.25, s * 0.35, s * 0.2, '#fde68a', '#fde68a', 0);
      ellipse(ctx, -s * 0.39, s * 0.22, s * 0.15, s * 0.2, '#92400e');
      ellipse(ctx, s * 0.39, s * 0.22, s * 0.15, s * 0.2, '#92400e');
      return true;
    case 'elephant':
      animalEars(ctx, s * 1.18, '#94a3b8', '#cbd5e1');
      ellipse(ctx, 0, -s * 0.36, s * 0.52, s * 0.34, '#94a3b8');
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = s * 0.025;
      ctx.beginPath();
      ctx.moveTo(-s * 0.1, s * 0.22);
      ctx.quadraticCurveTo(-s * 0.09, s * 0.68, s * 0.12, s * 0.72);
      ctx.quadraticCurveTo(s * 0.22, s * 0.68, s * 0.11, s * 0.58);
      ctx.lineTo(s * 0.1, s * 0.22);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      return true;
    case 'penguin':
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = s * 0.025;
      ctx.beginPath(); ctx.arc(0, 0, s * 0.59, Math.PI * 1.04, Math.PI * 1.96); ctx.lineTo(s * 0.34, s * 0.02); ctx.quadraticCurveTo(0, -s * 0.18, -s * 0.34, s * 0.02); ctx.closePath(); ctx.fill(); ctx.stroke();
      ellipse(ctx, -s * 0.43, s * 0.2, s * 0.17, s * 0.24, '#111827', '#020617');
      ellipse(ctx, s * 0.43, s * 0.2, s * 0.17, s * 0.24, '#111827', '#020617');
      path(ctx, [[-s * 0.12, s * 0.3], [s * 0.12, s * 0.3], [0, s * 0.45]], '#f59e0b', '#b45309');
      return true;
    case 'owl':
      animalEars(ctx, s, '#78350f', '#fcd34d');
      ellipse(ctx, -s * 0.24, s * 0.08, s * 0.27, s * 0.3, '#fde68a');
      ellipse(ctx, s * 0.24, s * 0.08, s * 0.27, s * 0.3, '#fde68a');
      roundGlasses(ctx, s, '#78350f');
      path(ctx, [[-s * 0.08, s * 0.3], [s * 0.08, s * 0.3], [0, s * 0.45]], '#f59e0b');
      return true;
    case 'frog':
      ellipse(ctx, 0, -s * 0.26, s * 0.57, s * 0.34, '#22c55e', '#166534');
      ellipse(ctx, -s * 0.37, -s * 0.47, s * 0.2, s * 0.2, '#4ade80', '#166534');
      ellipse(ctx, s * 0.37, -s * 0.47, s * 0.2, s * 0.2, '#4ade80', '#166534');
      ellipse(ctx, -s * 0.37, -s * 0.47, s * 0.08, s * 0.08, '#111827', '#111827', 0);
      ellipse(ctx, s * 0.37, -s * 0.47, s * 0.08, s * 0.08, '#111827', '#111827', 0);
      ellipse(ctx, -s * 0.43, s * 0.27, s * 0.13, s * 0.08, '#f9a8d4', '#f9a8d4', 0);
      ellipse(ctx, s * 0.43, s * 0.27, s * 0.13, s * 0.08, '#f9a8d4', '#f9a8d4', 0);
      return true;
    case 'nurse':
    case 'vet': {
      const vet = characterId === 'vet';
      headband(ctx, s, vet ? '#ccfbf1' : '#f8fafc');
      path(ctx, [[-s * 0.28, -s * 0.13], [-s * 0.2, -s * 0.62], [s * 0.2, -s * 0.62], [s * 0.28, -s * 0.13]], vet ? '#14b8a6' : '#ffffff');
      cross(ctx, 0, -s * 0.36, s * 0.24, vet ? '#ffffff' : '#ef4444');
      if (vet) {
        ellipse(ctx, -s * 0.45, -s * 0.38, s * 0.16, s * 0.24, '#92400e');
        ellipse(ctx, s * 0.45, -s * 0.38, s * 0.16, s * 0.24, '#92400e');
      }
      return true;
    }
    case 'farmer':
      brimHat(ctx, s, '#facc15', '#65a30d', 'soft');
      line(ctx, [[-s * 0.45, -s * 0.5], [s * 0.42, -s * 0.18]], '#fde68a', s * 0.045);
      return true;
    case 'chef':
      headband(ctx, s, '#f8fafc');
      [-0.34, 0, 0.34].forEach((x) => ellipse(ctx, s * x, -s * 0.58, s * 0.27, s * 0.34, '#ffffff', '#cbd5e1'));
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-s * 0.46, -s * 0.58, s * 0.92, s * 0.48);
      cross(ctx, 0, -s * 0.28, s * 0.17, '#ef4444');
      return true;
    case 'teacher':
      brimHat(ctx, s, '#7c3aed', '#facc15', 'cap');
      roundGlasses(ctx, s, '#312e81');
      path(ctx, [[-s * 0.14, -s * 0.5], [0, -s * 0.63], [s * 0.14, -s * 0.5], [0, -s * 0.37]], '#facc15', '#facc15', 0);
      return true;
    case 'pirate':
      headband(ctx, s, '#dc2626');
      path(ctx, [[-s * 0.55, -s * 0.12], [-s * 0.42, -s * 0.68], [0, -s * 0.94], [s * 0.42, -s * 0.68], [s * 0.55, -s * 0.12]], '#111827', '#020617');
      star(ctx, 0, -s * 0.51, s * 0.14, s * 0.06, '#f8fafc', 4);
      ellipse(ctx, s * 0.24, s * 0.12, s * 0.2, s * 0.16, '#111827', '#020617');
      line(ctx, [[s * 0.05, s * 0.02], [s * 0.43, s * 0.24]], '#111827', s * 0.04);
      return true;
    case 'astronaut':
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = s * 0.16; ctx.beginPath(); ctx.arc(0, s * 0.05, s * 0.55, Math.PI * 0.74, Math.PI * 2.26); ctx.stroke();
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = s * 0.035; ctx.stroke();
      ellipse(ctx, 0, -s * 0.51, s * 0.31, s * 0.14, '#f8fafc', '#94a3b8');
      star(ctx, 0, -s * 0.51, s * 0.09, s * 0.04, '#ef4444');
      sparklePair(ctx, s, '#fef08a');
      return true;
    case 'princess':
      headband(ctx, s, '#f9a8d4');
      path(ctx, [[-s * 0.42, -s * 0.12], [-s * 0.34, -s * 0.75], [-s * 0.12, -s * 0.4], [0, -s * 0.9], [s * 0.12, -s * 0.4], [s * 0.34, -s * 0.75], [s * 0.42, -s * 0.12]], '#facc15', '#b45309');
      ['#38bdf8', '#f43f5e', '#38bdf8'].forEach((color, i) => ellipse(ctx, (i - 1) * s * 0.23, -s * 0.27, s * 0.055, s * 0.075, color, '#ffffff', 1));
      sparklePair(ctx, s, '#ffffff');
      return true;
    case 'knight':
      ctx.fillStyle = '#94a3b8'; ctx.strokeStyle = '#334155'; ctx.lineWidth = s * 0.035;
      ctx.beginPath(); ctx.arc(0, -s * 0.05, s * 0.56, Math.PI, 0); ctx.lineTo(s * 0.5, s * 0.34); ctx.lineTo(s * 0.34, s * 0.34); ctx.lineTo(s * 0.29, -s * 0.02); ctx.lineTo(-s * 0.29, -s * 0.02); ctx.lineTo(-s * 0.34, s * 0.34); ctx.lineTo(-s * 0.5, s * 0.34); ctx.closePath(); ctx.fill(); ctx.stroke();
      line(ctx, [[-s * 0.28, -s * 0.03], [s * 0.28, -s * 0.03]], '#e2e8f0', s * 0.08);
      path(ctx, [[-s * 0.08, -s * 0.58], [0, -s * 0.93], [s * 0.09, -s * 0.58]], '#ef4444', '#991b1b');
      return true;
    case 'fairy':
      headband(ctx, s, '#f5d0fe');
      path(ctx, [[-s * 0.12, -s * 0.13], [0, -s * 0.78], [s * 0.12, -s * 0.13]], '#a855f7', '#7e22ce');
      star(ctx, 0, -s * 0.74, s * 0.18, s * 0.07, '#facc15');
      ellipse(ctx, -s * 0.56, s * 0.02, s * 0.2, s * 0.4, 'rgba(216,180,254,0.6)', '#a855f7');
      ellipse(ctx, s * 0.56, s * 0.02, s * 0.2, s * 0.4, 'rgba(216,180,254,0.6)', '#a855f7');
      sparklePair(ctx, s, '#fef08a');
      return true;
    case 'superhero':
      ctx.fillStyle = '#2563eb'; ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = s * 0.025;
      ctx.beginPath(); ctx.arc(0, 0, s * 0.55, Math.PI * 1.04, Math.PI * 1.96); ctx.lineTo(s * 0.47, s * 0.12); ctx.lineTo(s * 0.2, s * 0.28); ctx.lineTo(0, s * 0.12); ctx.lineTo(-s * 0.2, s * 0.28); ctx.lineTo(-s * 0.47, s * 0.12); ctx.closePath(); ctx.fill(); ctx.stroke();
      star(ctx, 0, -s * 0.38, s * 0.16, s * 0.07, '#facc15');
      path(ctx, [[-s * 0.6, s * 0.34], [-s * 0.38, s * 0.12], [0, s * 0.42], [s * 0.38, s * 0.12], [s * 0.6, s * 0.34]], '#ef4444', '#991b1b');
      return true;
    case 'pilot':
      brimHat(ctx, s, '#f8fafc', '#111827', 'cap');
      path(ctx, [[-s * 0.18, -s * 0.44], [0, -s * 0.53], [s * 0.18, -s * 0.44], [0, -s * 0.35]], '#facc15', '#b45309');
      line(ctx, [[-s * 0.17, -s * 0.44], [s * 0.17, -s * 0.44]], '#ffffff', s * 0.025);
      return true;
    case 'train_driver':
      brimHat(ctx, s, '#1f2937', '#b91c1c', 'cap');
      ellipse(ctx, 0, -s * 0.42, s * 0.13, s * 0.13, '#facc15', '#b45309');
      line(ctx, [[-s * 0.07, -s * 0.42], [s * 0.07, -s * 0.42]], '#b45309', s * 0.025);
      return true;
    case 'footballer':
      headband(ctx, s, '#15803d');
      ctx.strokeStyle = '#111827'; ctx.lineWidth = s * 0.03;
      ellipse(ctx, 0, -s * 0.5, s * 0.27, s * 0.27, '#f8fafc', '#111827');
      path(ctx, [[0, -s * 0.67], [s * 0.12, -s * 0.58], [s * 0.08, -s * 0.43], [-s * 0.08, -s * 0.43], [-s * 0.12, -s * 0.58]], '#111827', '#111827', 0);
      return true;
    case 'dancer':
      headband(ctx, s, '#e11d48');
      path(ctx, [[-s * 0.45, -s * 0.12], [-s * 0.23, -s * 0.73], [0, -s * 0.46], [s * 0.23, -s * 0.73], [s * 0.45, -s * 0.12]], '#fecdd3', '#e11d48');
      ellipse(ctx, 0, -s * 0.43, s * 0.13, s * 0.13, '#facc15', '#b45309');
      sparklePair(ctx, s, '#ffffff');
      return true;
    case 'clown':
      ['#38bdf8', '#facc15', '#f43f5e', '#4ade80', '#a855f7'].forEach((color, i) => {
        const x = (i - 2) * s * 0.23;
        ellipse(ctx, x, -s * (0.42 + (i % 2) * 0.18), s * 0.2, s * 0.25, color, '#7c2d12');
      });
      ellipse(ctx, 0, s * 0.28, s * 0.12, s * 0.12, '#ef4444', '#991b1b');
      ellipse(ctx, -s * 0.42, s * 0.2, s * 0.12, s * 0.07, '#f9a8d4', '#f9a8d4', 0);
      ellipse(ctx, s * 0.42, s * 0.2, s * 0.12, s * 0.07, '#f9a8d4', '#f9a8d4', 0);
      return true;
    default:
      return false;
  }
}