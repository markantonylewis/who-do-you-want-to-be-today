// Web Audio API sound effect synthesizer for toddlers
import { isSoundEffectsEnabled } from './parentSettings';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSparkle() {
  if (!isSoundEffectsEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.001, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.35);
    });
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

export function playMagicTransformation() {
  if (!isSoundEffectsEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Whoosh + ascending chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);

    // Followed by sparkles
    setTimeout(() => {
      playSparkle();
    }, 200);
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

export function playCelebrationFanfare() {
  if (!isSoundEffectsEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // C - E - G - C fanfare
    const notes = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 659.25, t: 0.16, d: 0.15 },
      { f: 783.99, t: 0.32, d: 0.18 },
      { f: 1046.50, t: 0.52, d: 0.5 },
    ];
    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);
      gain.gain.setValueAtTime(0.001, now + t);
      gain.gain.exponentialRampToValueAtTime(0.25, now + t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

export function playCharacterSound(type: string) {
  if (!isSoundEffectsEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    switch (type) {
      case 'siren': { // Firefighter siren
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.25);
        osc.frequency.linearRampToValueAtTime(600, now + 0.5);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }
      case 'whistle': { // Police whistle
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.setValueAtTime(1800, now + 0.1);
        osc.frequency.setValueAtTime(1400, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'hammer': { // Builder hammer tap-tap
        [0, 0.15, 0.3].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800, now + offset);
          osc.frequency.exponentialRampToValueAtTime(150, now + offset + 0.08);
          gain.gain.setValueAtTime(0.2, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.1);
        });
        break;
      }
      case 'heartbeat': { // Doctor heartbeat
        [0, 0.18].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(80, now + offset);
          osc.frequency.exponentialRampToValueAtTime(45, now + offset + 0.12);
          gain.gain.setValueAtTime(0.3, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.16);
        });
        break;
      }
      case 'lion_roar': { // Playful lion roar
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.6);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
        break;
      }
      case 'tiger_growl': { // Tiger growl
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.5);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }
      case 'dog_bark': { // Playful puppy woof-woof!
        [0, 0.22].forEach(offset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(350, now + offset);
          osc.frequency.exponentialRampToValueAtTime(220, now + offset + 0.12);
          gain.gain.setValueAtTime(0.22, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.15);
        });
        break;
      }
      case 'dino_roar': { // Big friendly dino stomp roar
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.7);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }
      case 'twinkle': { // Delicate celestial star sparkle chime
        const notes = [659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98]; // E5, G5, B5, C6, E6, G6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.001, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.4);
        });
        setTimeout(() => playSparkle(), 300);
        break;
      }
      default:
        playSparkle();
    }
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

export function playPop() {
  if (!isSoundEffectsEnabled()) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {
    console.warn('Audio play error', e);
  }
}

