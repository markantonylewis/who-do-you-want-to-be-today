// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import { interpretToddler } from '@/lib/toddler.functions';
// Server voice not yet set up here; the device's built-in voice is used.
const SERVER_TTS_ENABLED = false;
// Speech synthesis, speech recognition, and Gemini Live/TTS client for toddlers

import { CHARACTERS, findCharacter } from '../data/characters';
import { CharacterItem } from '../types';
import { getCustomTrainedWords } from './toddlerVoiceTraining';

let playbackAudioCtx: AudioContext | null = null;
let currentSourceNode: AudioBufferSourceNode | null = null;

function getPlaybackAudioContext(): AudioContext {
  if (!playbackAudioCtx || playbackAudioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    playbackAudioCtx = new AudioContextClass();
  }
  if (playbackAudioCtx.state === 'suspended') {
    playbackAudioCtx.resume();
  }
  return playbackAudioCtx;
}

// Convert Base64 24kHz raw PCM (from Gemini Live / TTS) to AudioBuffer
function pcmToAudioBuffer(base64Data: string, sampleRate = 24000): AudioBuffer {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const ctx = getPlaybackAudioContext();
  const buffer = ctx.createBuffer(1, int16Array.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < int16Array.length; i++) {
    channelData[i] = int16Array[i] / 32768.0;
  }
  return buffer;
}

export function stopAnySpeech() {
  if (currentSourceNode) {
    try {
      currentSourceNode.stop();
    } catch {
      // ignore
    }
    currentSourceNode = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// ----------------------------------------------------
// Natural Voice Management & Selection
// ----------------------------------------------------
const STORAGE_KEY_VOICE = 'who_am_i_selected_voice';
const STORAGE_KEY_RATE = 'who_am_i_voice_rate';

// CRITICAL: Strictly exclude all Microsoft voices and novelty sounds
const BANNED_VOICE_SUBSTRINGS = [
  'microsoft',
  'msteen',
  'fred', 'zarvox', 'albert', 'junior', 'ralph', 'bad news', 'bahh', 'bells', 'boing',
  'cellos', 'deranged', 'good news', 'hysterical', 'pipe organ', 'trinoids', 'whisper'
];

let cachedVoices: SpeechSynthesisVoice[] = [];

export type CuratedVoiceId = 'us_woman' | 'us_man' | 'uk_woman' | 'uk_man';

export interface CuratedVoiceOption {
  id: CuratedVoiceId;
  name: string;
  label: string;
  accent: 'US' | 'UK';
  gender: 'Woman' | 'Man';
  description: string;
  geminiVoice: 'Kore' | 'Puck' | 'Aoede' | 'Fenrir';
}

export const CURATED_GOOGLE_VOICES: CuratedVoiceOption[] = [
  {
    id: 'us_woman',
    name: 'US English Woman',
    label: 'US English Woman',
    accent: 'US',
    gender: 'Woman',
    description: 'Warm, clear & maternal (Google US English)',
    geminiVoice: 'Kore',
  },
  {
    id: 'us_man',
    name: 'US English Man',
    label: 'US English Man',
    accent: 'US',
    gender: 'Man',
    description: 'Friendly, upbeat & encouraging (Google US English)',
    geminiVoice: 'Puck',
  },
  {
    id: 'uk_woman',
    name: 'UK English Woman',
    label: 'UK English Woman',
    accent: 'UK',
    gender: 'Woman',
    description: 'Gentle storybook narrator (Google UK English)',
    geminiVoice: 'Aoede',
  },
  {
    id: 'uk_man',
    name: 'UK English Man',
    label: 'UK English Man',
    accent: 'UK',
    gender: 'Man',
    description: 'Kind, cheerful & patient (Google UK English)',
    geminiVoice: 'Fenrir',
  },
];

export function isUkVoice(v: { name?: string; lang?: string; voiceURI?: string }): boolean {
  const s = `${v.name || ''} ${v.lang || ''} ${v.voiceURI || ''}`.toLowerCase();
  return (
    s.includes('en-gb') ||
    s.includes('en_gb') ||
    s.includes('uk') ||
    s.includes('great britain') ||
    s.includes('united kingdom')
  );
}

export function isUsVoice(v: { name?: string; lang?: string; voiceURI?: string }): boolean {
  const s = `${v.name || ''} ${v.lang || ''} ${v.voiceURI || ''}`.toLowerCase();
  return (
    s.includes('en-us') ||
    s.includes('en_us') ||
    s.includes('united states') ||
    /\bus\b/.test(s)
  );
}

export function isFemaleVoiceName(nameOrId: string): boolean {
  const clean = nameOrId.replace(/[_\-]+/g, ' ').toLowerCase();
  return (
    clean.includes('female') ||
    clean.includes('woman') ||
    clean.includes('girl') ||
    /\b(samantha|karen|victoria|fiona|moira|tessa|veena|kore|aoede|zira)\b/i.test(clean)
  );
}

export function isMaleVoiceName(nameOrId: string): boolean {
  const clean = nameOrId.replace(/[_\-]+/g, ' ').toLowerCase();
  // CRITICAL: If identified as female or contains female indicators, it is not male
  if (isFemaleVoiceName(nameOrId)) {
    return false;
  }
  return (
    /\b(male|man|boy)\b/i.test(clean) ||
    (clean.includes('male') && !clean.includes('female')) ||
    /\b(guy|daniel|george|oliver|arthur|david|rishi|puck|fenrir|alex|nathan|aaron)\b/i.test(clean)
  );
}

export function parseVoiceId(raw: string | null | undefined): CuratedVoiceId {
  if (!raw) return 'us_woman';
  if (raw === 'us_woman' || raw === 'us_man' || raw === 'uk_woman' || raw === 'uk_man') {
    return raw;
  }
  const matchCurated = CURATED_GOOGLE_VOICES.find(
    (cv) =>
      cv.id === raw ||
      cv.name.toLowerCase() === raw.toLowerCase() ||
      cv.geminiVoice.toLowerCase() === raw.toLowerCase()
  );
  if (matchCurated) return matchCurated.id;

  const isUk = isUkVoice({ name: raw });
  const isMale = isMaleVoiceName(raw);
  if (isUk && isMale) return 'uk_man';
  if (isUk && !isMale) return 'uk_woman';
  if (!isUk && isMale) return 'us_man';
  return 'us_woman';
}

export function resolveVoiceForCuratedId(
  id: CuratedVoiceId,
  voices: SpeechSynthesisVoice[]
): { voice: SpeechSynthesisVoice | null; pitch: number } {
  // CRITICAL: Strictly filter out any Microsoft voices
  const safeVoices = voices.filter(
    (v) =>
      !v.name.toLowerCase().includes('microsoft') &&
      !v.voiceURI.toLowerCase().includes('microsoft') &&
      !BANNED_VOICE_SUBSTRINGS.some((banned) => v.name.toLowerCase().includes(banned))
  );

  const googleVoices = safeVoices.filter((v) => v.name.toLowerCase().includes('google'));

  if (id === 'uk_woman') {
    // 1. Google UK English Female
    const gUkFemale = googleVoices.find(
      (v) => isUkVoice(v) && !isMaleVoiceName(v.name)
    ) || googleVoices.find((v) => isUkVoice(v));

    if (gUkFemale) return { voice: gUkFemale, pitch: 1.0 };

    // Fallback: non-Microsoft UK female
    const fallback = safeVoices.find(
      (v) => isUkVoice(v) && !isMaleVoiceName(v.name)
    ) || safeVoices.find((v) => isUkVoice(v));

    return { voice: fallback || null, pitch: 1.0 };
  }

  if (id === 'uk_man') {
    // 1. Google UK English Male (genuine Google UK male voice in Chrome)
    const gUkMale = googleVoices.find(
      (v) => isUkVoice(v) && isMaleVoiceName(v.name)
    );
    if (gUkMale) return { voice: gUkMale, pitch: 1.0 };

    // 2. Any Google male voice
    const anyGoogleMale = googleVoices.find((v) => isMaleVoiceName(v.name));
    if (anyGoogleMale) return { voice: anyGoogleMale, pitch: 1.0 };

    // 3. Fallback: non-Microsoft UK male
    const fallback = safeVoices.find(
      (v) => isUkVoice(v) && isMaleVoiceName(v.name)
    );
    if (fallback) return { voice: fallback, pitch: 1.0 };

    // 4. Any safe male voice
    const anySafeMale = safeVoices.find((v) => isMaleVoiceName(v.name));
    if (anySafeMale) return { voice: anySafeMale, pitch: 1.0 };

    // 5. If only female UK voice is available, deepen pitch to 0.80 for natural male register
    const gUk = googleVoices.find((v) => isUkVoice(v));
    if (gUk) return { voice: gUk, pitch: 0.80 };

    return { voice: null, pitch: 0.80 };
  }

  if (id === 'us_man') {
    // 1. Google US Male voice if present (e.g. Android / ChromeOS Google Speech Services)
    const gUsMale = googleVoices.find(
      (v) => isUsVoice(v) && isMaleVoiceName(v.name)
    );
    if (gUsMale) return { voice: gUsMale, pitch: 1.0 };

    // 2. Any non-Microsoft US Male voice (e.g. macOS Alex, Fred, Aaron)
    const anySafeUsMale = safeVoices.find(
      (v) => isUsVoice(v) && isMaleVoiceName(v.name)
    );
    if (anySafeUsMale) return { voice: anySafeUsMale, pitch: 1.0 };

    // 3. Any high-quality Natural/Online US Male voice (e.g. Microsoft Guy Natural)
    const naturalUsMale = voices.find(
      (v) =>
        isUsVoice(v) &&
        isMaleVoiceName(v.name) &&
        (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'))
    );
    if (naturalUsMale) return { voice: naturalUsMale, pitch: 1.0 };

    // 4. Any US Male voice on the system (e.g. Windows Microsoft David / Mark)
    // CRITICAL: Must be an actual male voice, NEVER fall back to a female voice
    const anyUsMale = voices.find(
      (v) => isUsVoice(v) && isMaleVoiceName(v.name)
    );
    if (anyUsMale) return { voice: anyUsMale, pitch: 1.0 };

    // 5. Any English Male voice available rather than a female voice
    const anyGoogleMale = googleVoices.find((v) => isMaleVoiceName(v.name));
    if (anyGoogleMale) return { voice: anyGoogleMale, pitch: 1.0 };

    const anyMale = voices.find((v) => isMaleVoiceName(v.name));
    if (anyMale) return { voice: anyMale, pitch: 1.0 };

    return { voice: null, pitch: 0.82 };
  }

  // Default: us_woman
  // 1. Google US English (standard female)
  const gUsFemale = googleVoices.find(
    (v) => isUsVoice(v) && !isMaleVoiceName(v.name)
  ) || googleVoices.find((v) => isUsVoice(v));

  if (gUsFemale) return { voice: gUsFemale, pitch: 1.0 };

  // Fallback: non-Microsoft US female
  const fallback = safeVoices.find(
    (v) => isUsVoice(v) && !isMaleVoiceName(v.name)
  ) || safeVoices.find((v) => v.lang.toLowerCase().startsWith('en'));

  return { voice: fallback || null, pitch: 1.0 };
}

export function scoreVoice(v: SpeechSynthesisVoice): number {
  const nameLower = v.name.toLowerCase();
  const langLower = v.lang.toLowerCase();

  // Strictly disqualify Microsoft and novelty voices
  for (const banned of BANNED_VOICE_SUBSTRINGS) {
    if (nameLower.includes(banned)) {
      return -10000;
    }
  }

  // Must be an English voice for clear toddler phonetics
  if (!langLower.startsWith('en')) {
    return -5000;
  }

  let score = 100;

  // Prioritize Google voices directly
  if (nameLower.includes('google')) score += 5000;
  if (nameLower.includes('google us english') || nameLower.includes('google uk english')) score += 2000;

  // Prefer US English then UK
  if (langLower.includes('en-us') || langLower.includes('en_us')) score += 250;
  else if (langLower.includes('en-gb')) score += 150;

  return score;
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  const existing = window.speechSynthesis.getVoices();
  if (existing.length > 0) {
    cachedVoices = existing;
    return Promise.resolve(existing);
  }

  if (cachedVoices.length > 0) {
    return Promise.resolve(cachedVoices);
  }

  return new Promise((resolve) => {
    let resolved = false;

    const finish = (v: SpeechSynthesisVoice[]) => {
      if (resolved) return;
      resolved = true;
      if (v.length > 0) {
        cachedVoices = v;
      }
      try {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      } catch {
        // ignore
      }
      resolve(cachedVoices.length > 0 ? cachedVoices : v);
    };

    const onVoicesChanged = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        finish(v);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

    // Poll every 150ms for up to 1.5s as fallback for asynchronous voice loading
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const current = window.speechSynthesis.getVoices();
      if (current.length > 0 || attempts >= 10) {
        clearInterval(interval);
        finish(current);
      }
    }, 150);
  });
}

// Trigger initial voice load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) {
      cachedVoices = v;
    }
  });
}

export async function getAvailableNaturalVoices(): Promise<SpeechSynthesisVoice[]> {
  const voices = await loadVoices();
  const safe = voices.filter(v => scoreVoice(v) > 0);
  return safe.length > 0 ? safe : voices;
}

export function getSavedVoiceId(): CuratedVoiceId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VOICE);
    return parseVoiceId(raw);
  } catch {
    // ignore
  }
  return 'us_woman';
}

export function setSavedVoiceId(id: CuratedVoiceId): void {
  try {
    localStorage.setItem(STORAGE_KEY_VOICE, id);
  } catch {
    // ignore
  }
}

export const getSavedVoiceName = getSavedVoiceId;
export const setSavedVoiceName = (val: string) => {
  const parsed = parseVoiceId(val);
  setSavedVoiceId(parsed);
};

export const setSelectedVoiceName = setSavedVoiceName;
export const getSelectedVoiceName = getSavedVoiceName;

export function getSavedVoiceRate(): number {
  try {
    const r = localStorage.getItem(STORAGE_KEY_RATE);
    if (r) {
      const val = parseFloat(r);
      if (!isNaN(val) && val >= 0.75 && val <= 1.2) return val;
    }
  } catch {
    // ignore
  }
  return 0.94; // Default warm, clear toddler rate
}

export function setSavedVoiceRate(rate: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_RATE, rate.toString());
  } catch {
    // ignore
  }
}

export const setVoiceRate = setSavedVoiceRate;
export const getVoiceRate = getSavedVoiceRate;

export async function findBestNaturalVoice(preferredId?: string): Promise<SpeechSynthesisVoice | null> {
  const allVoices = await loadVoices();
  if (allVoices.length === 0) return null;

  const targetId = parseVoiceId(preferredId || getSavedVoiceId());
  const resolved = resolveVoiceForCuratedId(targetId, allVoices);
  return resolved.voice;
}

export interface SpeakOptions {
  voiceId?: CuratedVoiceId | string;
  voiceName?: string;
  rate?: number;
  pitch?: number;
  skipServerTTS?: boolean;
}

// Play speech through Gemini TTS if server is available, otherwise top-tier Google Web Speech API
export async function speakText(
  text: string,
  onEnd?: () => void,
  options?: SpeakOptions
): Promise<void> {
  stopAnySpeech();

  // Clean and smooth toddler text with natural breathing punctuation
  const naturalText = text
    .replace(/\bROAR\b/g, 'Roar')
    .replace(/\bGrrr\b/g, 'Grr')
    .trim();

  // Resolve target curated voice
  const rawId = options?.voiceId || options?.voiceName || getSavedVoiceId();
  const targetVoiceId: CuratedVoiceId = parseVoiceId(rawId);
  const curatedVoice = CURATED_GOOGLE_VOICES.find((v) => v.id === targetVoiceId) || CURATED_GOOGLE_VOICES[0];

  // Try Google Gemini server TTS first for lifelike warmth and emotional prosody
  if (SERVER_TTS_ENABLED && !options?.skipServerTTS) {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: naturalText, voice: curatedVoice.geminiVoice }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          const buffer = pcmToAudioBuffer(data.audio, 24000);
          const ctx = getPlaybackAudioContext();
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          currentSourceNode = source;
          source.onended = () => {
            if (currentSourceNode === source) {
              currentSourceNode = null;
            }
            if (onEnd) onEnd();
          };
          source.start();
          return;
        }
      }
    } catch {
      // Fall back to high quality local speech synthesis
    }
  }

  // High Quality Web Speech API fallback (strictly Google / non-Microsoft)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Cancel any previous utterances
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(naturalText);
    const chosenRate = options?.rate ?? getSavedVoiceRate();

    const allVoices = await loadVoices();
    const resolved = resolveVoiceForCuratedId(targetVoiceId, allVoices);

    if (resolved.voice) {
      utterance.voice = resolved.voice;
    }

    utterance.pitch = options?.pitch ?? resolved.pitch ?? 1.0;
    utterance.rate = chosenRate;
    utterance.volume = 1.0;

    let finished = false;
    const safeEnd = () => {
      if (finished) return;
      finished = true;
      if (onEnd) onEnd();
    };

    utterance.onend = safeEnd;
    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance ended with error:', e);
      safeEnd();
    };

    // Chromium garbage collection bug workaround: retain reference on window
    (window as any).__currentUtterance = utterance;

    window.speechSynthesis.speak(utterance);
  } else {
    setTimeout(() => {
      if (onEnd) onEnd();
    }, 1500);
  }
}

// Speech Recognition wrapper with toddler forgiving matching
export class ToddlerSpeechRecognizer {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((character: CharacterItem | null, rawTranscript: string) => void) | null = null;
  private onActionMatchCallback: (() => void) | null = null;
  private targetWord: string = '';
  private onSpeechDetectedCallback: (() => void) | null = null;

  constructor() {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      const userLang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';
      this.recognition.lang = userLang;

      this.recognition.onresult = async (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (this.onSpeechDetectedCallback && transcript.trim().length > 0) {
          this.onSpeechDetectedCallback();
        }

        // 1. If currently listening for an action repetition word (e.g. "fire engine", "digger")
        if (this.onActionMatchCallback && this.targetWord) {
          const clean = transcript.toLowerCase().trim();
          const targetTokens = this.targetWord.split(' ').filter(Boolean);
          const isMatch = targetTokens.some(tok => clean.includes(tok)) || clean.length >= 1;
          if (isMatch) {
            const cb = this.onActionMatchCallback;
            this.onActionMatchCallback = null;
            cb();
            return;
          }
        }

        // 2. Otherwise listening for character selection
        if (this.onResultCallback) {
          const customWords = getCustomTrainedWords();
          // Fast local fuzzy match with trained custom words prioritized
          const localMatch = findCharacter(transcript, customWords);
          if (localMatch) {
            this.onResultCallback(localMatch, transcript);
            return;
          }

          // If toddler said something not immediately matched, check server AI interpreter
          if (transcript.trim().length >= 1) {
            try {
              const data = await interpretToddler({ data: { transcript, customWords } });
              if (data.characterId) {
                const char = CHARACTERS.find(c => c.id === data.characterId);
                if (char && this.onResultCallback) {
                  this.onResultCallback(char, transcript);
                  return;
                }
              }
            } catch {
              // Local match will suffice
            }

            // Fallback if still listening and final
            const isFinal = event.results[event.results.length - 1].isFinal;
            if (isFinal && this.onResultCallback) {
              this.onResultCallback(null, transcript);
            }
          }
        }
      };

      this.recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition error:', e.error);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {
            // Ignore start error if already running
          }
        }
      };
    }
  }

  public start(
    onResult: (character: CharacterItem | null, rawTranscript: string) => void,
    onSpeechDetected?: () => void
  ) {
    this.onResultCallback = onResult;
    this.onActionMatchCallback = null;
    this.targetWord = '';
    this.onSpeechDetectedCallback = onSpeechDetected || null;
    this.isListening = true;

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {
        // Already active
      }
    }
  }

  public startActionWordListener(
    targetWord: string,
    onMatch: () => void,
    onSpeechDetected?: () => void
  ) {
    this.targetWord = targetWord.toLowerCase().trim();
    this.onActionMatchCallback = onMatch;
    this.onResultCallback = null;
    this.onSpeechDetectedCallback = onSpeechDetected || null;
    this.isListening = true;

    if (this.recognition) {
      try {
        this.recognition.start();
      } catch {
        // If recognition is ending/transitioning, attempt start after brief delay
        setTimeout(() => {
          if (this.isListening && this.recognition) {
            try {
              this.recognition.start();
            } catch {
              // already active
            }
          }
        }, 120);
      }
    }
  }

  public stop() {
    this.isListening = false;
    this.onResultCallback = null;
    this.onActionMatchCallback = null;
    this.targetWord = '';
    this.onSpeechDetectedCallback = null;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }
}

// Interactive microphone speech tester for the voice training modal
export function startMicTest(
  onTranscript: (text: string, isFinal: boolean) => void,
  onError?: (err: string) => void
): () => void {
  const SpeechRecognition =
    (window as unknown as { SpeechRecognition: any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (onError) onError('Speech recognition is not supported in this browser.');
    return () => {};
  }

  let active = true;
  const recognizer = new SpeechRecognition();
  recognizer.continuous = true;
  recognizer.interimResults = true;
  recognizer.lang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'en-US';

  recognizer.onresult = (event: any) => {
    let transcript = '';
    let isFinal = false;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
      if (event.results[i].isFinal) isFinal = true;
    }
    if (transcript.trim()) {
      onTranscript(transcript.trim(), isFinal);
    }
  };

  recognizer.onerror = (e: any) => {
    if (e.error !== 'no-speech' && e.error !== 'aborted') {
      if (onError) onError(e.error);
    }
  };

  recognizer.onend = () => {
    if (active) {
      try {
        recognizer.start();
      } catch {
        // already started or aborted
      }
    }
  };

  try {
    recognizer.start();
  } catch (err: any) {
    if (onError) onError(err.message || 'Failed to start mic test');
  }

  return () => {
    active = false;
    try {
      recognizer.stop();
    } catch {
      // ignore
    }
  };
}
