// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { playCelebrationFanfare } from '../utils/audioEffects';

interface SessionWrapUpProps {
  onRestart: () => void;
  starsEarned: number;
  wrapUpRoutine?: 'standard' | 'bedtime' | 'cleanup';
}

const Star: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

/** End-of-session screen: pictures and voice only, no words for the child. */
export const SessionWrapUp: React.FC<SessionWrapUpProps> = ({ onRestart, starsEarned, wrapUpRoutine = 'standard' }) => {
  useEffect(() => {
    playCelebrationFanfare();
  }, []);

  return (
    <div
      id="session-wrap-up-screen"
      className="fixed inset-0 z-50 bg-gradient-to-b from-amber-200 via-orange-100 to-rose-200 flex flex-col items-center justify-center p-6 text-center select-none"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="max-w-lg w-full bg-white/95 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border-8 border-amber-300 flex flex-col items-center gap-8"
      >
        {/* Big picture: moon for bedtime, trophy otherwise */}
        <div aria-hidden="true">
          {wrapUpRoutine === 'bedtime' ? (
            <svg viewBox="0 0 64 64" className="w-28 h-28">
              <path d="M40 8a24 24 0 1 0 16 40A20 20 0 0 1 40 8z" fill="#fde68a" stroke="#713f12" strokeWidth="3" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 64 64" className="w-28 h-28">
              <path d="M18 8h28v14a14 14 0 0 1-28 0z" fill="#fbbf24" stroke="#713f12" strokeWidth="3" strokeLinejoin="round" />
              <path d="M18 12H8a10 10 0 0 0 12 12M46 12h10a10 10 0 0 1-12 12" fill="none" stroke="#713f12" strokeWidth="3" />
              <path d="M28 36h8v10h-8z" fill="#f59e0b" stroke="#713f12" strokeWidth="3" />
              <path d="M20 46h24v8H20z" fill="#b45309" stroke="#713f12" strokeWidth="3" />
            </svg>
          )}
        </div>

        {/* Stars earned */}
        <div className="flex flex-wrap items-center justify-center gap-2" role="img" aria-label={`${starsEarned} stars`}>
          {Array.from({ length: Math.min(starsEarned, 20) }).map((_, i) => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.12 }}>
              <Star className="w-10 h-10" />
            </motion.span>
          ))}
        </div>

        {/* Play again: big icon button */}
        <motion.button
          id="play-again-btn"
          whileTap={{ scale: 0.94 }}
          onClick={onRestart}
          aria-label="Play again"
          className="w-full py-5 rounded-3xl bg-emerald-500 border-b-8 border-emerald-700 text-white shadow-xl flex items-center justify-center cursor-pointer active:border-b-2 active:translate-y-1 transition-transform"
        >
          <svg viewBox="0 0 24 24" className="w-12 h-12" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
};
