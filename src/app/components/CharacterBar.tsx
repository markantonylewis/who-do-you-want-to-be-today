// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React from 'react';
import { motion } from 'motion/react';
import { CHARACTERS } from '../data/characters';
import { CharacterId, CharacterItem } from '../types';
import { ListeningIndicator } from './ListeningIndicator';
import { hapticCharacterTap } from '../utils/haptics';
import { CostumeThumb } from './CostumeThumb';
import { ReplayButton } from './ReplayButton';

interface CharacterBarProps {
  selectedCharacterId: CharacterId | null;
  onSelect: (characterId: CharacterId) => void;
  disabled?: boolean;
  promptText?: string;
  isListening?: boolean;
  isSpeaking?: boolean;
  onMicClick?: () => void;
  onPromptClick?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
  characters?: CharacterItem[];
  micAvailable?: boolean;
}

export const CharacterBar: React.FC<CharacterBarProps> = ({
  selectedCharacterId,
  onSelect,
  disabled = false,
  promptText,
  isListening = false,
  isSpeaking = false,
  onMicClick,
  onPromptClick,
  showCloseButton = false,
  onClose,
  characters = CHARACTERS,
  micAvailable = true,
}) => {
  const displayCharacters = characters.length > 0 ? characters : CHARACTERS;

  return (
    <motion.div
      id="character-bar-container"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 90, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="w-full flex flex-col items-center gap-1.5"
    >
      {/* Replay speaker + mic status (no text for the child) */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between px-3">
        <ReplayButton onClick={onPromptClick || onMicClick} />

        <div className="flex items-center gap-2">
          {onMicClick && micAvailable && (
            <ListeningIndicator
              compact
              isListening={isListening}
              isSpeaking={isSpeaking}
              onClick={onMicClick}
            />
          )}
          {showCloseButton && onClose && (
            <button
              id="close-character-bar-btn"
              onClick={onClose}
              aria-label="Back to the mirror"
              className="cursor-pointer bg-white/95 hover:bg-white text-amber-950 border-2 border-b-4 border-amber-300 rounded-full w-11 h-11 shadow-md active:translate-y-0.5 active:border-b-2 transition-transform flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Big Tap Costume Cards */}
      <div className="relative w-full">
      <button
        type="button"
        aria-label="More costumes left"
        onClick={() => document.getElementById('character-selection-bar')?.scrollBy({ left: -300, behavior: 'smooth' })}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border-2 border-amber-300 shadow-md text-amber-950 font-black active:scale-95"
      >‹</button>
      <button
        type="button"
        aria-label="More costumes right"
        onClick={() => document.getElementById('character-selection-bar')?.scrollBy({ left: 300, behavior: 'smooth' })}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 border-2 border-amber-300 shadow-md text-amber-950 font-black active:scale-95"
      >›</button>
      <div
        id="character-selection-bar"
        onWheel={(e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY; }}
        className="w-full overflow-x-auto py-1.5 px-12 no-scrollbar flex items-center gap-3 sm:gap-4 [justify-content:safe_center] snap-x"
      >
        {displayCharacters.map((char, index) => {
          const isSelected = selectedCharacterId === char.id;
          return (
            <motion.button
              key={char.id}
              id={`character-btn-${char.id}`}
              aria-label={char.name}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              disabled={disabled}
              onClick={() => {
                hapticCharacterTap();
                onSelect(char.id);
              }}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-24 sm:w-24 sm:h-28 rounded-3xl p-2 transition-all duration-200 shadow-md border-4 active:scale-95 ${
                isSelected
                  ? 'scale-105 shadow-xl ring-4 ring-amber-400 border-white'
                  : 'bg-white/90 border-amber-200 hover:bg-white'
              }`}
              style={{
                backgroundColor: isSelected ? char.primaryColor : undefined,
              }}
            >
              <CostumeThumb id={char.id} size={72} />
            </motion.button>
          );
        })}
      </div>
      </div>
    </motion.div>
  );
};
