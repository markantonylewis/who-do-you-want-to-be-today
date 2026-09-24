// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { playSparkle, playPop } from '../utils/audioEffects';

interface ParentalGateModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const NUMBER_WORDS: { word: string; value: number }[] = [
  { word: 'THREE', value: 3 },
  { word: 'FOUR', value: 4 },
  { word: 'FIVE', value: 5 },
  { word: 'SIX', value: 6 },
  { word: 'SEVEN', value: 7 },
  { word: 'EIGHT', value: 8 },
  { word: 'NINE', value: 9 },
];

export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
}) => {
  const [target, setTarget] = useState<{ word: string; value: number }>(NUMBER_WORDS[0]);
  const [choices, setChoices] = useState<number[]>([]);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a random question whenever gate opens
  useEffect(() => {
    if (isOpen) {
      generateQuestion();
      setHoldProgress(0);
      setIsWrong(false);
    } else {
      clearHold();
    }
  }, [isOpen]);

  const generateQuestion = () => {
    const randomTarget = NUMBER_WORDS[Math.floor(Math.random() * NUMBER_WORDS.length)];
    setTarget(randomTarget);

    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => n !== randomTarget.value);
    // Shuffle pool and take 3 distractors
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const options = [randomTarget.value, shuffled[0], shuffled[1], shuffled[2]].sort(
      () => Math.random() - 0.5
    );
    setChoices(options);
  };

  const handleSelectNumber = (num: number) => {
    if (num === target.value) {
      playSparkle();
      onSuccess();
    } else {
      playPop();
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
        generateQuestion();
      }, 700);
    }
  };

  // Optional 3-second hold fallback for adults
  const startHold = () => {
    clearHold();
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds hold
    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);
      if (elapsed >= duration) {
        clearHold();
        playSparkle();
        onSuccess();
      }
    }, 40);
  };

  const clearHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldProgress(0);
  };

  if (!isOpen) return null;

  return (
    <div
      id="parental-gate-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <motion.div
        id="parental-gate-card"
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border-4 border-amber-300 p-6 flex flex-col items-center gap-4 text-center text-slate-800"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner">
          🔒
        </div>

        <div>
          <h2 className="text-xl font-black text-amber-950">Grown-Ups Only</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            To keep little fingers from changing settings, please answer:
          </p>
        </div>

        {/* Challenge Box */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 w-full flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Tap the number
          </span>
          <span className="text-3xl font-black text-amber-950 tracking-wider">
            {target.word}
          </span>
        </div>

        {/* Number buttons */}
        <div className={`grid grid-cols-4 gap-2.5 w-full ${isWrong ? 'animate-shake' : ''}`}>
          {choices.map((num) => (
            <button
              key={num}
              onClick={() => handleSelectNumber(num)}
              className="h-14 bg-white hover:bg-amber-50 active:bg-amber-100 border-2 border-slate-300 hover:border-amber-400 rounded-2xl font-black text-2xl text-slate-800 shadow-sm transition-transform active:scale-95 flex items-center justify-center"
            >
              {num}
            </button>
          ))}
        </div>

        {/* Alternative hold option */}
        <div className="w-full pt-1 border-t border-slate-100 flex flex-col items-center gap-2">
          <span className="text-[11px] text-slate-500 font-semibold">
            Or press and hold below:
          </span>
          <button
            onMouseDown={startHold}
            onMouseUp={clearHold}
            onMouseLeave={clearHold}
            onTouchStart={startHold}
            onTouchEnd={clearHold}
            className="relative w-full overflow-hidden py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
          >
            {holdProgress > 0 && (
              <div
                className="absolute inset-0 bg-amber-300/60 transition-all pointer-events-none"
                style={{ width: `${holdProgress}%` }}
              />
            )}
            <span className="relative z-10">
              {holdProgress > 0 ? `Holding... (${Math.round(holdProgress)}%)` : 'Hold to Enter Settings'}
            </span>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 underline transition-colors"
        >
          Cancel & Return to Play
        </button>
      </motion.div>
    </div>
  );
};
