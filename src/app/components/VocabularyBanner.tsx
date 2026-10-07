// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React from 'react';
import { motion } from 'motion/react';
import { CharacterItem, CharacterAction } from '../types';
import { ListeningIndicator } from './ListeningIndicator';
import { CostumeThumb } from './CostumeThumb';
import { ReplayButton } from './ReplayButton';
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
  onReplay?: () => void;
  micAvailable?: boolean;
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
  onReplay,
  micAvailable = true,
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
      {/* Tier 1: costume badge, replay speaker, mic status, back to costumes (icons only) */}
      <div className="w-full flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <button
            id="character-badge-btn"
            onClick={() => {
              hapticGentleTick();
              onCharacterBadgeClick?.();
            }}
            aria-label={character.name}
            className="cursor-pointer rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shrink-0"
          >
            <CostumeThumb id={character.id} size={52} />
          </button>
          <ReplayButton onClick={onReplay} />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {micAvailable && (isListening || isSpeaking) && (
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
              aria-label="Costumes"
              className="relative cursor-pointer bg-amber-50 hover:bg-amber-100 border-2 border-b-[6px] border-amber-400 w-20 h-16 rounded-2xl shadow-md active:translate-y-1 active:border-b-2 transition-transform overflow-hidden"
            >
              {/* Three little costume pictures, fanned out like cards */}
              {(trayThumbs.length ? trayThumbs : [character.id]).slice(0, 3).map((id, i, arr) => {
                const offset = i - (arr.length - 1) / 2;
                return (
                  <span
                    key={id}
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/2"
                    style={{ transform: `translate(calc(-50% + ${offset * 18}px), -50%) rotate(${offset * 12}deg)`, zIndex: i === 1 ? 2 : 1 }}
                  >
                    <CostumeThumb id={id} size={40} />
                  </span>
                );
              })}
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
              aria-label={`Say ${character.name}`}
              onClick={() => {
                hapticActionPress();
                onRepeatTap();
              }}
              className={`w-full cursor-pointer text-white text-xs sm:text-sm font-black py-2.5 px-3 rounded-2xl shadow-md border-2 border-white flex items-center justify-center gap-2 active:scale-95 transition-transform ${
                repeatStage === 2
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600'
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-hidden="true">
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M6 11a6 6 0 0 0 12 0M12 17v4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
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
                  className={`cursor-pointer w-full py-3 px-2 sm:py-4 sm:px-3 rounded-2xl border-b-4 flex items-center justify-center gap-1.5 sm:gap-2 border-2 transition-all duration-200 active:scale-95 shadow-xs font-black text-xs sm:text-sm text-center ${
                    isCelebratedThis
                      ? 'bg-amber-300 border-amber-500 text-amber-950 ring-3 ring-amber-400 scale-[1.02]'
                      : isRepeatingThis
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-3 ring-emerald-400 scale-[1.02]'
                      : isActive
                      ? 'bg-amber-200 border-amber-400 text-amber-950'
                      : 'bg-amber-50 hover:bg-amber-100 hover:border-amber-400 border-amber-300 text-slate-900'
                  }`}
                  aria-label={action.targetWord}
                >
                  {/* Picture only (placeholder art until the flat illustrations are drawn) */}
                  <span className="text-4xl sm:text-5xl leading-none" aria-hidden="true">{action.emoji}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

