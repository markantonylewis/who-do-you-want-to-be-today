// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React from 'react';
import { motion } from 'motion/react';
import { CharacterItem, CharacterAction } from '../types';
import { ListeningIndicator } from './ListeningIndicator';
import {
  hapticActionPress,
  hapticRepeatSuccess,
  hapticGentleTick,
} from '../utils/haptics';

interface VocabularyBannerProps {
  character: CharacterItem;
  stage: 'intro' | 'repeat' | 'celebrate';
  repeatStage?: 1 | 2;
  actionRepeatStage?: 1 | 2;
  activeAction?: CharacterAction | null;
  actionPromptState?: 'idle' | 'prompting' | 'repeating' | 'celebrated';
  isListening?: boolean;
  isSpeaking?: boolean;
  onActionClick: (action: CharacterAction) => void;
  onActionRepeatTap?: (action: CharacterAction) => void;
  onRepeatTap?: () => void;
  onShowCards?: () => void;
  onCharacterBadgeClick?: () => void;
}

export const VocabularyBanner: React.FC<VocabularyBannerProps> = ({
  character,
  stage,
  repeatStage = 1,
  actionRepeatStage = 1,
  activeAction,
  actionPromptState = 'idle',
  isListening = false,
  isSpeaking = false,
  onActionClick,
  onActionRepeatTap,
  onRepeatTap,
  onShowCards,
  onCharacterBadgeClick,
}) => {
  const isActionRepeating = Boolean(activeAction && actionPromptState === 'repeating');
  const isCostumeRepeating = stage === 'repeat' && !activeAction;

  return (
    <motion.div
      id="vocabulary-hud"
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border-3 p-2 sm:p-3 flex flex-col gap-2 select-none"
      style={{ borderColor: character.primaryColor }}
    >
      {/* Tier 1: Character Header Bar (Badge & Prompt on left; Mic status & Costumes button on right) */}
      <div className="w-full flex items-center justify-between gap-2 px-1">
        {/* Left: Interactive Character Badge & Prompt indicator */}
        <button
          id="character-badge-btn"
          onClick={() => {
            hapticGentleTick();
            onCharacterBadgeClick?.();
          }}
          className="cursor-pointer flex items-center gap-2 p-1 sm:p-1.5 rounded-2xl hover:bg-slate-100 active:scale-95 transition-all text-left group shrink-0"
          title={`Click to hear about ${character.name}!`}
        >
          <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
            {character.iconEmoji}
          </span>
          <div className="flex flex-col">
            <span
              className="text-xs sm:text-sm font-black uppercase tracking-wide leading-tight"
              style={{ color: character.primaryColor }}
            >
              {character.name}
            </span>
            <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-800 flex items-center gap-1">
              <span>🔊</span>
              <span>
                {isCostumeRepeating
                  ? `Say "${character.name}"!`
                  : isActionRepeating
                  ? `Say "${activeAction?.targetWord}"!`
                  : 'Press a picture'}
              </span>
            </span>
          </div>
        </button>

        {/* Right: Inline Mic Status (shows when listening or speaking) & Costumes switch button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {(isListening || isSpeaking) && (
            <ListeningIndicator
              compact
              isListening={isListening}
              isSpeaking={isSpeaking}
              onClick={() => {
                if (activeAction && onActionRepeatTap) {
                  onActionRepeatTap(activeAction);
                } else if (onRepeatTap) {
                  onRepeatTap();
                }
              }}
            />
          )}

          {onShowCards && (
            <button
              id="hud-show-cards-btn"
              onClick={onShowCards}
              className="cursor-pointer bg-amber-50 hover:bg-amber-100 active:scale-95 border-2 border-amber-300 text-amber-950 text-xs font-black px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl flex items-center gap-1 shadow-sm transition-transform"
              title="Change costume"
            >
              <span className="text-base sm:text-lg">🎭</span>
              <span className="hidden sm:inline">Costumes</span>
            </button>
          )}
        </div>
      </div>

      {/* Tier 2: Dedicated Interactive Pictures Deck (100% unobstructed, side-by-side grid) */}
      <div className="w-full">
        {/* If in initial costume repeat stage, show large prominent repeat banner */}
        {isCostumeRepeating && onRepeatTap ? (
          <div className="w-full">
            <button
              id="costume-repeat-btn"
              onClick={() => {
                hapticActionPress();
                onRepeatTap();
              }}
              className={`w-full cursor-pointer text-white text-xs sm:text-sm font-black py-2.5 px-3 rounded-2xl shadow-md border-2 border-white flex items-center justify-center gap-2 active:scale-95 transition-transform animate-pulse ${
                repeatStage === 2
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600'
              }`}
            >
              <span className="text-base">🎤</span>
              <span>
                {repeatStage === 2
                  ? `Say "${character.name}" one more time!`
                  : `Say "${character.name}"!`}
              </span>
            </button>
          </div>
        ) : (
          /* Picture Press Exploration: Grid giving each picture equal 50% width with zero obstruction */
          <div className="w-full grid grid-cols-2 gap-2 sm:gap-3">
            {character.actions.map((action) => {
              const isActive = activeAction?.id === action.id;
              const isRepeatingThis = isActive && actionPromptState === 'repeating';
              const isCelebratedThis = isActive && actionPromptState === 'celebrated';

              return (
                <button
                  key={action.id}
                  id={`action-btn-${action.id}`}
                  onClick={() => {
                    hapticActionPress();
                    if (isRepeatingThis && onActionRepeatTap) {
                      onActionRepeatTap(action);
                    } else {
                      onActionClick(action);
                    }
                  }}
                  className={`cursor-pointer w-full py-2 px-2 sm:py-2.5 sm:px-3 rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2 border-2 transition-all duration-200 active:scale-95 shadow-xs font-black text-xs sm:text-sm text-center ${
                    isCelebratedThis
                      ? 'bg-amber-300 border-amber-500 text-amber-950 ring-3 ring-amber-400 scale-[1.02]'
                      : isRepeatingThis
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-3 ring-emerald-400 scale-[1.02] animate-pulse'
                      : isActive
                      ? 'bg-amber-200 border-amber-400 text-amber-950'
                      : 'bg-amber-50 hover:bg-amber-100 hover:border-amber-400 border-amber-300 text-slate-900'
                  }`}
                  title={`Click: ${action.actionTitle}`}
                >
                  <span className="text-xl sm:text-2xl shrink-0">{action.emoji}</span>
                  <span className="truncate">
                    {isRepeatingThis ? (
                      <span className="flex items-center justify-center gap-1 text-emerald-950">
                        <span>🗣️</span>
                        <span>
                          {actionRepeatStage === 2
                            ? `Say "${action.targetWord}" one more time!`
                            : `Say "${action.targetWord}"!`}
                        </span>
                      </span>
                    ) : isCelebratedThis ? (
                      <span className="flex items-center justify-center gap-1 text-amber-950">
                        <span>⭐</span>
                        <span>Well done!</span>
                      </span>
                    ) : (
                      action.actionTitle
                    )}
                  </span>
                  {isActive && actionPromptState === 'prompting' && (
                    <span className="text-xs animate-bounce shrink-0">🔊</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

