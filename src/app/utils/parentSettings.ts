// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import { CharacterId } from '../types';

export interface ParentSettings {
  childName: string;
  sessionTimeMinutes: number; // 0 = unlimited, 3, 5, 10, 15
  maxRounds: number; // 0 = unlimited, 3, 5, 8, 10
  enabledCharacters: CharacterId[];
  defaultMirrorMode: 'camera' | 'cartoon';
  soundEffectsEnabled: boolean;
  hapticsEnabled: boolean;
  sensoryMode: 'standard' | 'calm';
  aiInterpreterEnabled: boolean;
  voiceRate: number; // 0.8 to 1.2
  voicePitch: number; // 0.9 to 1.3
  preferredVoiceURI: string;
  wrapUpRoutine: 'standard' | 'bedtime' | 'cleanup';
}

export const ALL_CHARACTER_IDS: CharacterId[] = [
  'firefighter',
  'police_officer',
  'builder',
  'doctor',
  'lion',
  'tiger',
  'dog',
  'dinosaur',
  'star',
];

export const DEFAULT_PARENT_SETTINGS: ParentSettings = {
  childName: '',
  sessionTimeMinutes: 5,
  maxRounds: 5,
  enabledCharacters: [...ALL_CHARACTER_IDS],
  defaultMirrorMode: 'camera',
  soundEffectsEnabled: true,
  hapticsEnabled: true,
  sensoryMode: 'standard',
  aiInterpreterEnabled: true,
  voiceRate: 0.94,
  voicePitch: 1.0,
  preferredVoiceURI: 'us_woman',
  wrapUpRoutine: 'standard',
};

const STORAGE_KEY = 'toddler_costume_parent_settings_v1';

let cachedSettings: ParentSettings | null = null;
const listeners = new Set<(settings: ParentSettings) => void>();

export function getParentSettings(): ParentSettings {
  if (cachedSettings) return cachedSettings;

  if (typeof window === 'undefined') {
    return { ...DEFAULT_PARENT_SETTINGS };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Normalize preferredVoiceURI to one of the 4 curated Google voice IDs
      let voiceId = parsed.preferredVoiceURI || 'us_woman';
      const voiceLower = String(voiceId).toLowerCase();
      if (voiceLower.includes('microsoft')) {
        voiceId = 'us_woman';
      } else if (!['us_woman', 'us_man', 'uk_woman', 'uk_man'].includes(voiceId)) {
        if (voiceLower.includes('uk') && (voiceLower.includes('male') || voiceLower.includes('man'))) {
          voiceId = 'uk_man';
        } else if (voiceLower.includes('uk')) {
          voiceId = 'uk_woman';
        } else if (voiceLower.includes('male') || voiceLower.includes('man')) {
          voiceId = 'us_man';
        } else {
          voiceId = 'us_woman';
        }
      }

      cachedSettings = {
        ...DEFAULT_PARENT_SETTINGS,
        ...parsed,
        preferredVoiceURI: voiceId,
        // Ensure at least 1 character is enabled
        enabledCharacters:
          Array.isArray(parsed.enabledCharacters) && parsed.enabledCharacters.length > 0
            ? parsed.enabledCharacters
            : [...ALL_CHARACTER_IDS],
      };
      return cachedSettings!;
    }
  } catch (err) {
    console.warn('Failed to parse parent settings from localStorage', err);
  }

  cachedSettings = { ...DEFAULT_PARENT_SETTINGS };
  return cachedSettings;
}

export function saveParentSettings(newSettings: Partial<ParentSettings>): ParentSettings {
  const current = getParentSettings();
  const updated: ParentSettings = {
    ...current,
    ...newSettings,
    // Safety check: ensure at least one character is always available for the child
    enabledCharacters:
      newSettings.enabledCharacters && newSettings.enabledCharacters.length > 0
        ? newSettings.enabledCharacters
        : current.enabledCharacters.length > 0
        ? current.enabledCharacters
        : [...ALL_CHARACTER_IDS],
  };

  cachedSettings = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to write parent settings to localStorage', err);
    }
  }

  // Notify all listeners
  listeners.forEach((fn) => {
    try {
      fn(updated);
    } catch (e) {
      console.error(e);
    }
  });

  return updated;
}

export function subscribeParentSettings(callback: (settings: ParentSettings) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function isSoundEffectsEnabled(): boolean {
  return getParentSettings().soundEffectsEnabled;
}

export function isHapticsEnabled(): boolean {
  const settings = getParentSettings();
  return settings.hapticsEnabled !== false;
}

export function isSensoryCalm(): boolean {
  return getParentSettings().sensoryMode === 'calm';
}
