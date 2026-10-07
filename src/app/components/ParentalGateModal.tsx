// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { playSparkle, playPop } from '../utils/audioEffects';

interface ParentalGateModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_WRONG = 3;
const LOCKOUT_MS = 60_000;
const LOCK_KEY = 'whoami_gate_lock_until';

function newQuestion(previous?: { a: number; b: number }) {
  const questions = [];
  for (let a = 1; a <= 5; a += 1) {
    for (let b = 1; b <= 5; b += 1) {
      // Also avoid the same multiplication with its numbers swapped.
      if (previous && ((a === previous.a && b === previous.b) || (a === previous.b && b === previous.a))) continue;
      questions.push({ a, b, answer: a * b });
    }
  }
  return questions[Math.floor(Math.random() * questions.length)];
}

function readLock(): number {
  try {
    return Number(localStorage.getItem(LOCK_KEY) || 0);
  } catch {
    return 0;
  }
}

/** Grown-ups only: a written multiplication typed on a number pad, with a lockout after wrong answers. */
export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({ isOpen, onSuccess, onCancel }) => {
  const [q, setQ] = useState(() => newQuestion());
  const [entry, setEntry] = useState('');
  const [wrong, setWrong] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQ((previous) => newQuestion(previous));
      setEntry('');
      setWrong(0);
      setLockedUntil(readLock());
    }
  }, [isOpen]);

  const locked = lockedUntil > now;
  useEffect(() => {
    if (!isOpen || !locked) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [isOpen, locked]);

  const submit = () => {
    if (locked || !entry) return;
    if (Number(entry) === q.answer) {
      playSparkle();
      onSuccess();
      return;
    }
    playPop();
    setShake(true);
    setTimeout(() => setShake(false), 400);
    const w = wrong + 1;
    setEntry('');
    setQ((previous) => newQuestion(previous));
    if (w >= MAX_WRONG) {
      const until = Date.now() + LOCKOUT_MS;
      try { localStorage.setItem(LOCK_KEY, String(until)); } catch { /* ignore */ }
      setLockedUntil(until);
      setNow(Date.now());
      setWrong(0);
    } else {
      setWrong(w);
    }
  };

  const press = (d: string) => {
    if (locked) return;
    setEntry((e) => (e.length >= 3 ? e : e + d));
  };

  if (!isOpen) return null;
  const secondsLeft = Math.ceil((lockedUntil - now) / 1000);

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
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border-4 border-amber-300 p-6 flex flex-col items-center gap-4 text-center text-slate-800"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-900" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-black text-amber-950">Grown-ups only</h2>
          <p className="text-xs text-slate-600 mt-0.5">Type the answer to open settings.</p>
        </div>

        {locked ? (
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 w-full">
            <p className="font-black text-rose-900">Too many wrong answers.</p>
            <p className="text-sm text-rose-800">Try again in {secondsLeft} seconds.</p>
          </div>
        ) : (
          <>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 w-full">
              <div className="text-sm font-bold text-amber-800">What is</div>
              <div className="text-3xl font-black text-amber-950">{q.a} × {q.b}?</div>
              <div
                className={`mt-2 h-12 rounded-xl bg-white border-2 border-amber-300 flex items-center justify-center text-2xl font-black ${shake ? 'animate-shake' : ''}`}
                aria-live="polite"
              >
                {entry || <span className="text-slate-300">?</span>}
              </div>
              {wrong > 0 && (
                <p className="text-xs text-rose-700 mt-1">Not quite. {MAX_WRONG - wrong} tries left.</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 w-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <button key={d} onClick={() => press(d)} className="h-12 rounded-xl border-2 border-b-4 border-slate-300 font-black text-xl active:translate-y-0.5 active:border-b-2">
                  {d}
                </button>
              ))}
              <button onClick={() => setEntry((e) => e.slice(0, -1))} aria-label="Delete" className="h-12 rounded-xl border-2 border-b-4 border-slate-300 font-black text-lg active:translate-y-0.5 active:border-b-2">
                Del
              </button>
              <button onClick={() => press('0')} className="h-12 rounded-xl border-2 border-b-4 border-slate-300 font-black text-xl active:translate-y-0.5 active:border-b-2">
                0
              </button>
              <button onClick={submit} id="parent-gate-submit" className="h-12 rounded-xl bg-amber-500 border-b-4 border-amber-700 text-white font-black text-lg active:translate-y-0.5 active:border-b-2">
                OK
              </button>
            </div>
          </>
        )}

        <button onClick={onCancel} className="text-xs font-bold text-slate-500 hover:text-slate-800 underline">
          Cancel
        </button>
      </motion.div>
    </div>
  );
};
