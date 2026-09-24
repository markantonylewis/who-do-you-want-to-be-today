// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React from 'react';
import { motion } from 'motion/react';
import { CHARACTERS } from '../data/characters';
import { CharacterId, CharacterItem } from '../types';
import { ListeningIndicator } from './ListeningIndicator';
import { hapticCharacterTap } from '../utils/haptics';

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
      {/* Sleek Top Hint Strip */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between px-3">
        <button
          id="character-bar-prompt-pill"
          onClick={onPromptClick || onMicClick}
          className="bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full shadow-md border-2 border-amber-300 flex items-center gap-1.5 animate-pulse cursor-pointer hover:bg-white active:scale-95 transition-all text-left"
          title="Tap to hear prompt"
        >
          <span className="text-base">🌟</span>
          <span className="text-xs sm:text-sm font-black text-amber-950">
            {promptText || 'Hello there, what would you like to be today. Tap a costume'}
          </span>
          <span className="text-xs text-amber-700">🔊</span>
        </button>

        <div className="flex items-center gap-2">
          {onMicClick && (
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
              className="cursor-pointer bg-white/95 hover:bg-white text-amber-950 border-2 border-amber-300 rounded-full px-3 py-1 text-xs font-black shadow-md active:scale-95 transition-transform flex items-center gap-1"
              title="Return to mirror"
            >
              <span>🪞</span>
              <span>Mirror</span>
            </button>
          )}
        </div>
      </div>

      {/* Big Tap Costume Cards */}
      <div
        id="character-selection-bar"
        className="w-full overflow-x-auto py-1.5 px-3 no-scrollbar flex items-center gap-3 sm:gap-4 justify-start md:justify-center"
      >
        {displayCharacters.map((char, index) => {
          const isSelected = selectedCharacterId === char.id;
          return (
            <motion.button
              key={char.id}
              id={`character-btn-${char.id}`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              animate={
                !selectedCharacterId && index === 0
                  ? { y: [0, -4, 0] }
                  : undefined
              }
              transition={
                !selectedCharacterId && index === 0
                  ? { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                  : undefined
              }
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
              <span className="text-3xl sm:text-4xl filter drop-shadow">
                {char.iconEmoji}
              </span>
              <span
                className={`mt-1 text-xs sm:text-sm font-black tracking-wide text-center leading-tight ${
                  isSelected ? 'text-white' : 'text-slate-800'
                }`}
              >
                {char.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
