// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CURATED_GOOGLE_VOICES,
  CuratedVoiceId,
  getSavedVoiceId,
  setSavedVoiceId,
  getSavedVoiceRate,
  setSavedVoiceRate,
  speakText,
  stopAnySpeech,
  loadVoices,
} from '../utils/speechService';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenToddlerTrainer?: () => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenToddlerTrainer,
}) => {
  const [selectedVoiceId, setSelectedVoiceId] = useState<CuratedVoiceId>('us_woman');
  const [rate, setRateState] = useState<number>(0.94);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    loadVoices();
    setSelectedVoiceId(getSavedVoiceId());
    setRateState(getSavedVoiceRate());
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectVoice = (id: CuratedVoiceId) => {
    setSelectedVoiceId(id);
    setSavedVoiceId(id);
    handleTestVoice(id);
  };

  const handleRateChange = (newRate: number) => {
    setRateState(newRate);
    setSavedVoiceRate(newRate);
  };

  const handleTestVoice = async (voiceIdOverride?: CuratedVoiceId) => {
    stopAnySpeech();
    const targetId = voiceIdOverride || selectedVoiceId;
    setPlayingVoiceId(targetId);
    setIsTesting(true);
    await speakText(
      'Hello there, what would you like to be today. Say it out loud or tap a costume.',
      () => {
        setIsTesting(false);
        setPlayingVoiceId(null);
      },
      {
        voiceId: targetId,
        rate,
      }
    );
  };

  return (
    <div
      id="voice-settings-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopAnySpeech();
          onClose();
        }
      }}
    >
      <motion.div
        id="voice-settings-card"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-300 p-6 flex flex-col gap-4 text-slate-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950">
                Companion Voice Settings
              </h2>
              <p className="text-xs font-semibold text-amber-700">
                Natural ElevenLabs voices for toddlers
              </p>
            </div>
          </div>
          <button
            id="close-voice-settings-btn"
            onClick={() => {
              stopAnySpeech();
              onClose();
            }}
            className="cursor-pointer text-slate-400 hover:text-slate-600 bg-amber-50 hover:bg-amber-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold active:scale-95 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* 4 Curated Google Voice Options */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <span>🗣️</span>
              <span>ElevenLabs Voices</span>
            </label>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              4 Natural Voices
            </span>
          </div>

          <div id="voice-selection-list" className="flex flex-col gap-2">
            {CURATED_GOOGLE_VOICES.map((gv) => {
              const isSelected = selectedVoiceId === gv.id;
              const isCurrentlyPlaying = isTesting && playingVoiceId === gv.id;

              return (
                <div
                  key={gv.id}
                  id={`voice-option-${gv.id}`}
                  onClick={() => handleSelectVoice(gv.id)}
                  className={`cursor-pointer p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-amber-50/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{isSelected ? '🌟' : '🗣️'}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-slate-800 truncate">
                          {gv.label}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-black uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded-md shrink-0">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {gv.accent} Accent • {gv.gender} • {gv.description}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectVoice(gv.id);
                    }}
                    className={`shrink-0 px-3 py-1.5 text-xs font-black rounded-xl border transition-colors flex items-center gap-1 ${
                      isCurrentlyPlaying
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-200'
                    }`}
                  >
                    <span>{isCurrentlyPlaying ? '🔊' : '▶️'}</span>
                    <span>{isCurrentlyPlaying ? 'Speaking...' : 'Test'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Speed Adjustment */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-amber-100">
          <label className="text-xs font-black text-slate-700">
            Voice Cadence & Pacing
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Gentle (Slow)', value: 0.88 },
              { label: 'Natural Toddler', value: 0.94 },
              { label: 'Brisk', value: 1.0 },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleRateChange(opt.value)}
                className={`cursor-pointer py-1.5 px-2 rounded-xl text-xs font-bold text-center border-2 transition-all ${
                  Math.abs(rate - opt.value) < 0.03
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toddler Speech Recognition Training */}
        {onOpenToddlerTrainer && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">👶</span>
              <div className="text-left">
                <div className="text-xs font-black text-amber-950">
                  Toddler Voice Training
                </div>
                <div className="text-[11px] font-semibold text-amber-800">
                  Teach the app your child's sounds & words
                </div>
              </div>
            </div>
            <button
              id="open-toddler-trainer-from-voice-btn"
              onClick={() => {
                stopAnySpeech();
                onClose();
                onOpenToddlerTrainer();
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-sm transition-transform active:scale-95 shrink-0"
            >
              Train Words 🎓
            </button>
          </div>
        )}

        {/* Done Button */}
        <div className="pt-2">
          <button
            id="save-voice-settings-btn"
            onClick={() => {
              stopAnySpeech();
              onClose();
            }}
            className="cursor-pointer w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-md border-2 border-amber-500/30 active:scale-98 transition-transform"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
