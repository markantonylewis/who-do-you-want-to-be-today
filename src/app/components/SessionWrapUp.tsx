// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { playCelebrationFanfare } from '../utils/audioEffects';

interface SessionWrapUpProps {
  onRestart: () => void;
  roundsCompleted: number;
  childName?: string;
  wrapUpRoutine?: 'standard' | 'bedtime' | 'cleanup';
}

export const SessionWrapUp: React.FC<SessionWrapUpProps> = ({
  onRestart,
  roundsCompleted,
  childName,
  wrapUpRoutine = 'standard',
}) => {
  useEffect(() => {
    playCelebrationFanfare();
  }, []);

  const displayName = childName && childName.trim().length > 0 ? childName.trim() : null;

  return (
    <div
      id="session-wrap-up-screen"
      className="fixed inset-0 z-50 bg-gradient-to-b from-amber-200 via-orange-100 to-rose-200 flex flex-col items-center justify-center p-6 text-center select-none"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="max-w-lg w-full bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border-8 border-amber-300 flex flex-col items-center"
      >
        {/* Animated Celebration Medallion */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-7xl sm:text-8xl mb-4"
        >
          {wrapUpRoutine === 'bedtime' ? '🌙⭐' : '🏆✨'}
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-black text-amber-900 mb-4 leading-tight">
          {wrapUpRoutine === 'bedtime'
            ? 'Cozy Bedtime! 💤'
            : wrapUpRoutine === 'cleanup'
            ? 'Playtime Done! 🧸'
            : displayName
            ? `Great Job, ${displayName}!`
            : 'Great Job Today!'}
        </h1>

        <div className="bg-amber-100/80 rounded-2xl p-4 mb-6 border-2 border-amber-300 w-full">
          <p className="text-xl sm:text-2xl font-black text-amber-950">
            {wrapUpRoutine === 'bedtime'
              ? displayName
                ? `Time for bed, ${displayName}!`
                : 'Time for cozy bedtime!'
              : wrapUpRoutine === 'cleanup'
              ? displayName
                ? `Time to pack up, ${displayName}!`
                : 'Time to wave goodbye!'
              : 'Go find Mommy or Daddy! 🏃💨'}
          </p>
          <p className="text-base sm:text-lg font-bold text-amber-800 mt-1">
            {wrapUpRoutine === 'bedtime'
              ? 'Sweet dreams and night night! 🌟'
              : wrapUpRoutine === 'cleanup'
              ? 'Wave goodbye to your costume! ✨'
              : 'Show them what you can be!'}
          </p>
        </div>

        {/* Big visual star counter */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: roundsCompleted }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="text-3xl sm:text-4xl"
            >
              ⭐
            </motion.span>
          ))}
        </div>

        {/* Big Colorful Play Again Button */}
        <motion.button
          id="play-again-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={onRestart}
          className="w-full py-5 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-2xl shadow-xl border-4 border-white flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="text-3xl">🌟</span>
          <span>Play Again!</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
