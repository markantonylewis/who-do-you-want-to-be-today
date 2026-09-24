import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterId } from '../types';
import {
  CHARACTER_TRAINING_METADATA,
  getCustomTrainedWords,
  addCustomWord,
  removeCustomWord,
} from '../utils/toddlerVoiceTraining';
import { startMicTest } from '../utils/speechService';
import { playSparkle, playPop } from '../utils/audioEffects';

interface ToddlerVoiceTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWordsUpdated?: () => void;
}

export const ToddlerVoiceTrainerModal: React.FC<ToddlerVoiceTrainerModalProps> = ({
  isOpen,
  onClose,
  onWordsUpdated,
}) => {
  const [trainedWords, setTrainedWords] = useState<Record<CharacterId, string[]>>({
    star: [],
    firefighter: [],
    police_officer: [],
    builder: [],
    doctor: [],
    lion: [],
    tiger: [],
    dog: [],
    dinosaur: [],
  });

  const [selectedCharId, setSelectedCharId] = useState<CharacterId>('star');
  const [newWordInput, setNewWordInput] = useState<string>('');

  // Live mic test state
  const [isMicTesting, setIsMicTesting] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [lastDetectedHeard, setLastDetectedHeard] = useState<string>('');
  const [assignedSuccess, setAssignedSuccess] = useState<string | null>(null);
  const stopMicRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTrainedWords(getCustomTrainedWords());
    } else {
      stopTesting();
    }
  }, [isOpen]);

  const stopTesting = () => {
    if (stopMicRef.current) {
      stopMicRef.current();
      stopMicRef.current = null;
    }
    setIsMicTesting(false);
  };

  const handleToggleMic = () => {
    if (isMicTesting) {
      stopTesting();
    } else {
      setLiveTranscript('');
      setLastDetectedHeard('');
      setAssignedSuccess(null);
      setIsMicTesting(true);

      stopMicRef.current = startMicTest(
        (transcript, isFinal) => {
          setLiveTranscript(transcript);
          if (transcript.trim()) {
            setLastDetectedHeard(transcript.trim().toLowerCase());
          }
        },
        (err) => {
          console.warn('Mic test error:', err);
          stopTesting();
        }
      );
    }
  };

  const handleAddWord = (charId: CharacterId, word: string) => {
    const clean = word.trim().toLowerCase();
    if (!clean) return;
    const updated = addCustomWord(charId, clean);
    setTrainedWords({ ...updated });
    setNewWordInput('');
    playSparkle();
    if (onWordsUpdated) onWordsUpdated();
  };

  const handleRemoveWord = (charId: CharacterId, word: string) => {
    const updated = removeCustomWord(charId, word);
    setTrainedWords({ ...updated });
    playPop();
    if (onWordsUpdated) onWordsUpdated();
  };

  const handleAssignLiveHeardToChar = (charId: CharacterId) => {
    if (!lastDetectedHeard) return;
    handleAddWord(charId, lastDetectedHeard);
    const charMeta = CHARACTER_TRAINING_METADATA.find((c) => c.id === charId);
    setAssignedSuccess(`Taught "${lastDetectedHeard}" to ${charMeta?.iconEmoji} ${charMeta?.name}!`);
    setTimeout(() => setAssignedSuccess(null), 3000);
  };

  if (!isOpen) return null;

  const activeChar = CHARACTER_TRAINING_METADATA.find((c) => c.id === selectedCharId)!;
  const userWords = trainedWords[selectedCharId] || [];

  return (
    <div
      id="voice-trainer-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopTesting();
          onClose();
        }
      }}
    >
      <motion.div
        id="voice-trainer-card"
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 p-4 sm:p-6 flex flex-col gap-4 text-slate-800 my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🎓</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-950">
                Teach My Toddler's Words
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-700">
                Train the app to understand your child's unique sounds & pronunciations
              </p>
            </div>
          </div>
          <button
            id="close-voice-trainer-btn"
            onClick={() => {
              stopTesting();
              onClose();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Why Toddlers Need Voice Training info banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <span className="text-xl shrink-0">💡</span>
          <div className="leading-relaxed">
            <strong className="font-bold">Why microphones struggle with toddlers:</strong> Standard microphones expect adult voices. Toddlers speak with a higher musical pitch and use playful word substitutions (like saying <em>"tar"</em> for Star, or <em>"fifi"</em> for Fireman). You can train the app below!
          </div>
        </div>

        {/* Live Mic Voice Tester & Quick Match */}
        <div className="bg-gradient-to-br from-amber-500/10 via-yellow-400/10 to-emerald-500/10 border-2 border-dashed border-amber-300 rounded-2xl p-3 sm:p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              <span className="text-xs sm:text-sm font-black text-amber-950">
                Live Mic Diagnostic (Test with Your Toddler)
              </span>
            </div>
            <button
              id="toggle-mic-test-btn"
              onClick={handleToggleMic}
              className={`px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all flex items-center gap-1.5 ${
                isMicTesting
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <span>{isMicTesting ? '🔴 Stop Listening' : '🟢 Tap to Test Mic'}</span>
            </button>
          </div>

          {isMicTesting && (
            <div className="bg-white rounded-xl p-3 border border-amber-200 flex flex-col gap-2">
              <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
                <span>Say something or have your child talk...</span>
                <span className="animate-ping w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 min-h-[28px] flex items-center">
                {liveTranscript ? (
                  <span className="text-emerald-700">"{liveTranscript}"</span>
                ) : (
                  <span className="text-slate-400 italic">Listening for voice...</span>
                )}
              </div>
            </div>
          )}

          {lastDetectedHeard && (
            <div className="bg-white/80 rounded-xl p-3 border border-emerald-300 flex flex-col gap-2">
              <div className="text-xs font-bold text-slate-700">
                The microphone heard: <span className="text-emerald-800 font-black">"{lastDetectedHeard}"</span>. Link this to a costume:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CHARACTER_TRAINING_METADATA.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleAssignLiveHeardToChar(c.id)}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold rounded-lg border border-amber-300 transition-transform active:scale-95 flex items-center gap-1"
                  >
                    <span>{c.iconEmoji}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {assignedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl px-3 py-1.5 text-xs font-black flex items-center gap-1.5"
              >
                <span>🎉</span>
                <span>{assignedSuccess}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Costume Character Tabs */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase tracking-wider text-amber-900">
            Choose Costume to Train:
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {CHARACTER_TRAINING_METADATA.map((c) => {
              const count = (trainedWords[c.id] || []).length;
              const isSelected = c.id === selectedCharId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCharId(c.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-105'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                  }`}
                >
                  <span>{c.iconEmoji}</span>
                  <span>{c.name}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected ? 'bg-white text-amber-900' : 'bg-amber-200 text-amber-800'
                      }`}
                    >
                      +{count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Costume Training Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeChar.iconEmoji}</span>
              <span className="text-sm font-black text-slate-800">
                {activeChar.name} Trained Words
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Auto-saved for next time
            </span>
          </div>

          {/* Add custom word input */}
          <div className="flex items-center gap-2">
            <input
              id="custom-toddler-word-input"
              type="text"
              value={newWordInput}
              onChange={(e) => setNewWordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddWord(selectedCharId, newWordInput);
              }}
              placeholder={`What does your toddler say for ${activeChar.name}? (e.g. ${activeChar.defaultExamples[0]})`}
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 placeholder:text-slate-400"
            />
            <button
              id="add-custom-word-btn"
              onClick={() => handleAddWord(selectedCharId, newWordInput)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-black rounded-xl transition-transform active:scale-95 shrink-0"
            >
              + Teach Word
            </button>
          </div>

          {/* Custom words list */}
          {userWords.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Your Custom Trained Words:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {userWords.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold"
                  >
                    <span>{word}</span>
                    <button
                      onClick={() => handleRemoveWord(selectedCharId, word)}
                      className="text-emerald-700 hover:text-emerald-950 hover:bg-emerald-200 rounded-full w-4 h-4 flex items-center justify-center font-black"
                      title="Remove word"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Built-in recognized toddler sounds */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Built-in Recognised Toddler Variations:
            </span>
            <div className="flex flex-wrap gap-1">
              {activeChar.defaultExamples.map((ex) => (
                <span
                  key={ex}
                  className="px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-md text-[11px] font-medium"
                >
                  "{ex}"
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-100">
          <button
            id="close-voice-trainer-done-btn"
            onClick={() => {
              stopTesting();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-xl shadow-md transition-all text-center"
          >
            Done & Save Training
          </button>
        </div>
      </motion.div>
    </div>
  );
};
