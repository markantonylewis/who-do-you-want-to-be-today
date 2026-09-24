import { CharacterId } from '../types';

export const STORAGE_KEY_TRAINED_WORDS = 'toddler_custom_voice_training';

export interface CharacterTrainingItem {
  id: CharacterId;
  name: string;
  iconEmoji: string;
  defaultExamples: string[];
}

export const CHARACTER_TRAINING_METADATA: CharacterTrainingItem[] = [
  { id: 'star', name: 'Star', iconEmoji: '⭐', defaultExamples: ['tar', 'tah', 'car', 'twinkle', 'twinko', 'starry'] },
  { id: 'firefighter', name: 'Fireman', iconEmoji: '🧑‍🚒', defaultExamples: ['fifi', 'fire', 'fia', 'pie-man', 'wee-woo'] },
  { id: 'police_officer', name: 'Policeman', iconEmoji: '👮', defaultExamples: ['popo', 'cop', 'paman', 'po-po', 'woo-woo'] },
  { id: 'builder', name: 'Builder', iconEmoji: '👷', defaultExamples: ['bida', 'bobo', 'digga', 'ham', 'builda'] },
  { id: 'doctor', name: 'Doctor', iconEmoji: '🩺', defaultExamples: ['docka', 'doc', 'dada', 'docta', 'medic'] },
  { id: 'lion', name: 'Lion', iconEmoji: '🦁', defaultExamples: ['waw', 'wion', 'rawr', 'roar', 'kitty'] },
  { id: 'tiger', name: 'Tiger', iconEmoji: '🐯', defaultExamples: ['tiga', 'tigger', 'grr', 'tiger'] },
  { id: 'dog', name: 'Dog', iconEmoji: '🐶', defaultExamples: ['pup', 'puppy', 'woof', 'dodo', 'doggy'] },
  { id: 'dinosaur', name: 'Dinosaur', iconEmoji: '🦖', defaultExamples: ['dino', 'dida', 'nosa', 'rawr', 'rex'] },
];

export function getCustomTrainedWords(): Record<CharacterId, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRAINED_WORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading custom trained words:', e);
  }

  // Return empty mapping by default (defaults are in characters.ts nearMisses)
  return {
    star: [],
    firefighter: [],
    police_officer: [],
    builder: [],
    doctor: [],
    lion: [],
    tiger: [],
    dog: [],
    dinosaur: [],
  };
}

export function saveCustomTrainedWords(words: Record<CharacterId, string[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRAINED_WORDS, JSON.stringify(words));
  } catch (e) {
    console.warn('Error saving custom trained words:', e);
  }
}

export function addCustomWord(charId: CharacterId, newWord: string): Record<CharacterId, string[]> {
  const current = getCustomTrainedWords();
  const clean = newWord.trim().toLowerCase().replace(/[^a-z0-9 -]/g, '');
  if (!clean) return current;

  const existing = current[charId] || [];
  if (!existing.includes(clean)) {
    current[charId] = [...existing, clean];
    saveCustomTrainedWords(current);
  }
  return current;
}

export function removeCustomWord(charId: CharacterId, wordToRemove: string): Record<CharacterId, string[]> {
  const current = getCustomTrainedWords();
  const existing = current[charId] || [];
  current[charId] = existing.filter(w => w !== wordToRemove.trim().toLowerCase());
  saveCustomTrainedWords(current);
  return current;
}
