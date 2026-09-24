// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React from 'react';
import { motion } from 'motion/react';

interface ListeningIndicatorProps {
  isListening: boolean;
  isSpeaking: boolean;
  label?: string;
  compact?: boolean;
  onClick?: () => void;
}

export const ListeningIndicator: React.FC<ListeningIndicatorProps> = ({
  isListening,
  isSpeaking,
  compact = false,
  onClick,
}) => {
  const sizeClasses = compact
    ? 'w-11 h-11 sm:w-12 sm:h-12 text-xl'
    : 'w-14 h-14 sm:w-16 sm:h-16 text-2xl sm:text-3xl';

  return (
    <div
      id="voice-listening-indicator"
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none shrink-0"
      title={isSpeaking ? 'Speaking...' : isListening ? 'Listening... Tap to talk' : 'Tap to talk'}
    >
      {/* Outer pulsing ripples when listening */}
      {isListening && (
        <>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="absolute -inset-2 rounded-full bg-emerald-400/40 pointer-events-none"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
            className="absolute -inset-1 rounded-full bg-emerald-400/50 pointer-events-none"
          />
        </>
      )}

      {/* Outer audio pulse when AI guide is speaking */}
      {isSpeaking && (
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
          className="absolute -inset-2 rounded-full bg-amber-400/50 pointer-events-none"
        />
      )}

      {/* Main Friendly Character / Mic Bubble */}
      <motion.div
        whileTap={{ scale: 0.92 }}
        animate={
          isSpeaking
            ? { y: [0, -3, 0] }
            : isListening
            ? { scale: [1, 1.05, 1] }
            : { scale: 1 }
        }
        transition={{ repeat: Infinity, duration: isSpeaking ? 0.6 : 1.2 }}
        className={`${sizeClasses} rounded-full flex flex-col items-center justify-center shadow-lg border-2 sm:border-3 transition-all duration-300 ${
          isSpeaking
            ? 'bg-amber-400 border-amber-200 text-white'
            : isListening
            ? 'bg-emerald-500 border-emerald-200 text-white ring-2 ring-emerald-300'
            : 'bg-white hover:bg-amber-50 border-amber-300 text-amber-900'
        }`}
      >
        <span>
          {isSpeaking ? '🗣️' : isListening ? '👂' : '🎤'}
        </span>

        {/* Dynamic sound wave bars */}
        {isListening && !compact && (
          <div className="flex items-center gap-0.5 mt-0.5">
            {[0.4, 0.8, 1, 0.6, 0.3].map((heightScale, idx) => (
              <motion.div
                key={idx}
                animate={{ scaleY: [0.3, heightScale * 1.5, 0.3] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  delay: idx * 0.12,
                  ease: 'easeInOut',
                }}
                className="w-0.5 h-2 bg-white rounded-full origin-center"
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
