export type CharacterId =
  | 'firefighter'
  | 'police_officer'
  | 'builder'
  | 'doctor'
  | 'lion'
  | 'tiger'
  | 'dog'
  | 'dinosaur'
  | 'star';

export type CharacterCategory = 'occupation' | 'animal' | 'sky';

export interface VocabularyWord {
  word: string;
  emoji: string;
  actionHint?: string;
}

export interface CharacterAction {
  id: string;
  emoji: string;
  actionTitle: string;    // e.g. "Drive fire engines"
  actionSentence: string; // e.g. "Firemen drive fire engines."
  repeatPrompt: string;   // e.g. "Can you say fire engine?"
  targetWord: string;     // e.g. "fire engine"
  praise: string;         // e.g. "Well done!"
}

export interface CharacterItem {
  id: CharacterId;
  name: string;
  pluralName?: string;
  category: CharacterCategory;
  descriptionSentence: string;
  repeatEncouragement: string;
  cleanModelSentence: string;
  actions: CharacterAction[];
  relatedWords: VocabularyWord[];
  soundType: 'siren' | 'whistle' | 'hammer' | 'heartbeat' | 'lion_roar' | 'tiger_growl' | 'dog_bark' | 'dino_roar' | 'twinkle';
  iconEmoji: string;
  primaryColor: string;
  accentColor: string;
  nearMisses: string[];
}

export type AppState =
  | 'start'              // Landing screen with friendly "Tap to Play"
  | 'greeting'           // App asks: "What would you like to be today?"
  | 'listening_choice'   // Listening to child choose character
  | 'transforming'       // AR face filter turns on, helmet/ears placed
  | 'vocab_intro'        // Says word clearly: "Firefighter! Firefighters put out fires..."
  | 'vocab_repeat'       // Asks child to repeat: "Say it with me: Firefighter!"
  | 'vocab_celebrate'    // "Nice! Firefighter! Look: Fire truck! And hose!"
  | 'asking_next'        // "What else would you like to be?"
  | 'session_wrap_up';   // After 5 rounds / ~5 mins: "Great job today! Go find Mommy or Daddy!"

export interface FaceTrackingState {
  isTracking: boolean;
  opacity: number; // 0 to 1 smooth fade
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  angleRad: number;
  pitchRad: number;
}
