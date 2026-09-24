import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CHARACTERS } from '../data/characters';
import { CharacterId } from '../types';
import {
  ParentSettings,
  getParentSettings,
  saveParentSettings,
  DEFAULT_PARENT_SETTINGS,
  ALL_CHARACTER_IDS,
} from '../utils/parentSettings';
import {
  CURATED_GOOGLE_VOICES,
  CuratedVoiceId,
  loadVoices,
  setSelectedVoiceName,
  getSelectedVoiceName,
  setVoiceRate,
  getVoiceRate,
  speakText,
  stopAnySpeech,
} from '../utils/speechService';
import { getCustomTrainedWords } from '../utils/toddlerVoiceTraining';
import { playSparkle, playPop } from '../utils/audioEffects';

interface ParentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceTrainer: () => void;
  onSettingsSaved?: (settings: ParentSettings) => void;
}

type TabType = 'profile' | 'costumes' | 'speech' | 'voice_sensory';

export const ParentSettingsModal: React.FC<ParentSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenVoiceTrainer,
  onSettingsSaved,
}) => {
  const [settings, setSettings] = useState<ParentSettings>(getParentSettings());
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [trainedWordsCount, setTrainedWordsCount] = useState<number>(0);
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const current = getParentSettings();
      // Ensure preferredVoiceURI is one of the 4 curated Google voice IDs
      const validIds = CURATED_GOOGLE_VOICES.map((v) => v.id);
      if (!validIds.includes(current.preferredVoiceURI as any)) {
        current.preferredVoiceURI = 'us_woman';
        saveParentSettings(current);
      }
      setSettings(current);

      // Count trained custom words
      const words = getCustomTrainedWords();
      const count = Object.values(words).reduce((acc, list) => acc + list.length, 0);
      setTrainedWordsCount(count);

      // Warm up browser voices asynchronously
      loadVoices();
    } else {
      stopAnySpeech();
      setIsTestingVoice(false);
      setTestingVoiceId(null);
    }
  }, [isOpen]);

  const updateSetting = <K extends keyof ParentSettings>(key: K, value: ParentSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAndClose = () => {
    const saved = saveParentSettings(settings);
    // Apply voice rate and preferred voice to speech service
    setVoiceRate(settings.voiceRate);
    setSelectedVoiceName(settings.preferredVoiceURI);
    playSparkle();
    setShowSavedToast(true);
    if (onSettingsSaved) onSettingsSaved(saved);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 400);
  };

  const handleResetDefaults = () => {
    setSettings({ ...DEFAULT_PARENT_SETTINGS });
    playPop();
  };

  const toggleCharacter = (charId: CharacterId) => {
    const currentList = settings.enabledCharacters;
    if (currentList.includes(charId)) {
      // Don't allow disabling all characters
      if (currentList.length <= 1) return;
      updateSetting(
        'enabledCharacters',
        currentList.filter((id) => id !== charId)
      );
    } else {
      updateSetting('enabledCharacters', [...currentList, charId]);
    }
  };

  const handlePresetCostumes = (type: 'all' | 'helpers' | 'animals') => {
    if (type === 'all') {
      updateSetting('enabledCharacters', [...ALL_CHARACTER_IDS]);
    } else if (type === 'helpers') {
      updateSetting('enabledCharacters', ['firefighter', 'police_officer', 'builder', 'doctor']);
    } else if (type === 'animals') {
      updateSetting('enabledCharacters', ['lion', 'tiger', 'dog', 'dinosaur', 'star']);
    }
    playPop();
  };

  const testVoiceSample = (targetVoiceId?: string, targetRate?: number) => {
    stopAnySpeech();
    const chosenVoice = targetVoiceId !== undefined ? targetVoiceId : settings.preferredVoiceURI;
    const chosenRate = targetRate !== undefined ? targetRate : settings.voiceRate;
    setTestingVoiceId(chosenVoice);
    setIsTestingVoice(true);
    const greeting = 'Hello there! What would you like to be today? Tap a costume!';
    speakText(
      greeting,
      () => {
        setIsTestingVoice(false);
        setTestingVoiceId(null);
      },
      {
        voiceId: chosenVoice,
        rate: chosenRate,
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      id="parent-settings-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleSaveAndClose();
        }
      }}
    >
      <motion.div
        id="parent-settings-card"
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 p-4 sm:p-6 flex flex-col gap-3 text-slate-800 my-auto max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">👨‍👩‍👧</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-950">
                Parent & Educator Settings
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-700">
                Customise the tablet experience for your child
              </p>
            </div>
          </div>
          <button
            id="close-parent-settings-btn"
            onClick={handleSaveAndClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-lg transition-colors"
            title="Save & Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-2xl bg-amber-50 p-1 border border-amber-200 overflow-x-auto gap-1 shrink-0">
          <button
            id="tab-profile-btn"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span>👶</span>
            <span>Child & Time</span>
          </button>

          <button
            id="tab-costumes-btn"
            onClick={() => setActiveTab('costumes')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'costumes'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span>🎭</span>
            <span>Costumes Tray</span>
          </button>

          <button
            id="tab-speech-btn"
            onClick={() => setActiveTab('speech')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'speech'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span>🎓</span>
            <span>Toddler Speech</span>
            {trainedWordsCount > 0 && (
              <span className="text-[10px] bg-white text-amber-900 px-1.5 py-0.5 rounded-full font-black">
                {trainedWordsCount}
              </span>
            )}
          </button>

          <button
            id="tab-voice-sensory-btn"
            onClick={() => setActiveTab('voice_sensory')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'voice_sensory'
                ? 'bg-amber-500 text-white shadow-md'
                : 'text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span>🎙️</span>
            <span>Voice & Sensory</span>
          </button>
        </div>

        {/* Scrollable Tab Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-4">

        {/* TAB 1: CHILD PROFILE & TIME LIMITS */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-4 py-1">
            {/* Child's Name */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>👶</span>
                <span>Child's Name (Personalized Companion)</span>
              </label>
              <input
                id="child-name-input"
                type="text"
                value={settings.childName}
                onChange={(e) => updateSetting('childName', e.target.value)}
                placeholder="e.g. Leo, Maya, Oliver (optional)"
                maxLength={20}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400"
              />
              <div className="text-xs text-amber-800 bg-amber-50 rounded-xl p-2.5 border border-amber-200 leading-relaxed">
                💡 <strong>How this works:</strong> Displays your child's name visually on the celebration wrap-up screen and badges (no names are spoken in the audio).
              </div>
            </div>

            {/* Session Screen Time Limit */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>⏱️</span>
                  <span>Screen Time Session Limit</span>
                </label>
                <span className="text-xs font-black text-amber-800">
                  {settings.sessionTimeMinutes === 0
                    ? 'Unlimited'
                    : `${settings.sessionTimeMinutes} Minutes`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: '3 Mins', val: 3 },
                  { label: '5 Mins', val: 5 },
                  { label: '10 Mins', val: 10 },
                  { label: '15 Mins', val: 15 },
                  { label: 'No Limit', val: 0 },
                ].map((item) => {
                  const isSel = settings.sessionTimeMinutes === item.val;
                  return (
                    <button
                      key={item.val}
                      onClick={() => updateSetting('sessionTimeMinutes', item.val)}
                      className={`py-2 px-1 text-xs font-black rounded-xl border transition-all ${
                        isSel
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500">
                When time expires, the app warmly wraps up with a cheerful invitation to show parents their costume!
              </p>
            </div>

            {/* Max Costumes per Session */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>⭐</span>
                  <span>Max Costumes per Play Session</span>
                </label>
                <span className="text-xs font-black text-amber-800">
                  {settings.maxRounds === 0 ? 'Unlimited' : `${settings.maxRounds} Costumes`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '3 Costumes', val: 3 },
                  { label: '5 Costumes', val: 5 },
                  { label: '8 Costumes', val: 8 },
                  { label: 'Unlimited', val: 0 },
                ].map((item) => {
                  const isSel = settings.maxRounds === item.val;
                  return (
                    <button
                      key={item.val}
                      onClick={() => updateSetting('maxRounds', item.val)}
                      className={`py-2 px-1 text-xs font-black rounded-xl border transition-all ${
                        isSel
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session Wrap-Up Message Style */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>🌙</span>
                <span>Session Wrap-up Routine</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standard', title: 'Standard', desc: 'Find Mommy or Daddy' },
                  { id: 'bedtime', title: 'Bedtime', desc: 'Cozy sleep wind-down' },
                  { id: 'cleanup', title: 'Tidy Time', desc: 'Wave goodbye & pack up' },
                ].map((item) => {
                  const isSel = settings.wrapUpRoutine === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        updateSetting('wrapUpRoutine', item.id as ParentSettings['wrapUpRoutine'])
                      }
                      className={`p-2.5 text-left rounded-xl border transition-all ${
                        isSel
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      <div className="text-xs font-black">{item.title}</div>
                      <div className={`text-[10px] mt-0.5 ${isSel ? 'text-white/80' : 'text-slate-500'}`}>
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COSTUMES TRAY */}
        {activeTab === 'costumes' && (
          <div className="flex flex-col gap-4 py-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Select Costumes for Child's Tray ({settings.enabledCharacters.length} Active)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Toggle on/off which costumes appear when your child picks up the tablet.
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handlePresetCostumes('all')}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold"
                >
                  All
                </button>
                <button
                  onClick={() => handlePresetCostumes('helpers')}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold"
                >
                  Helpers
                </button>
                <button
                  onClick={() => handlePresetCostumes('animals')}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold"
                >
                  Animals
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CHARACTERS.map((char) => {
                const isEnabled = settings.enabledCharacters.includes(char.id);
                return (
                  <button
                    key={char.id}
                    onClick={() => toggleCharacter(char.id)}
                    className={`p-3 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                      isEnabled
                        ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                        : 'bg-slate-100/80 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{char.iconEmoji}</span>
                      <div>
                        <div className="text-xs font-black text-slate-900">{char.name}</div>
                        <div className="text-[10px] font-semibold text-slate-500 capitalize">
                          {char.category}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                        isEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {isEnabled ? '✓' : '✕'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TODDLER SPEECH & AI */}
        {activeTab === 'speech' && (
          <div className="flex flex-col gap-4 py-1">
            {/* Direct access to Voice Training tool */}
            <div className="bg-gradient-to-br from-amber-500/10 via-yellow-400/10 to-emerald-500/10 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🎓</span>
                <div>
                  <h3 className="text-sm font-black text-amber-950">
                    Toddler Speech Recognition Trainer
                  </h3>
                  <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                    Test the mic live with your child and map their unique sounds (e.g. <em>"tar"</em>, <em>"fifi"</em>, <em>"wion"</em>).
                  </p>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/90 border border-amber-300 rounded-full text-xs font-bold text-amber-900">
                    <span>✨</span>
                    <span>{trainedWordsCount} Custom Pronunciations Trained</span>
                  </div>
                </div>
              </div>
              <button
                id="open-trainer-from-settings-btn"
                onClick={() => {
                  onClose();
                  onOpenVoiceTrainer();
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-transform active:scale-95 shrink-0 text-center"
              >
                Launch Voice Trainer 🎓
              </button>
            </div>

            {/* AI Assistant Toggle */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-800">
                    AI Toddler Speech Interpreter (Gemini Flash)
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Forgives common toddler speech patterns (substitutions like 'w' for 'r', dropping initial consonants, animal sounds like 'wee-woo' or 'rawr').
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('aiInterpreterEnabled', !settings.aiInterpreterEnabled)}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                  settings.aiInterpreterEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    settings.aiInterpreterEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: VOICE & SENSORY */}
        {activeTab === 'voice_sensory' && (
          <div className="flex flex-col gap-4 py-1">
            {/* 4 Curated Google Voice Options */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>🗣️</span>
                  <span>Companion Google Voice</span>
                </label>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-full">
                  4 Options
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CURATED_GOOGLE_VOICES.map((gv) => {
                  const isSelected = settings.preferredVoiceURI === gv.id;
                  const isCurrentlyPlaying = isTestingVoice && testingVoiceId === gv.id;

                  return (
                    <div
                      key={gv.id}
                      id={`voice-option-${gv.id}`}
                      onClick={() => {
                        updateSetting('preferredVoiceURI', gv.id);
                        setSelectedVoiceName(gv.id);
                        testVoiceSample(gv.id, settings.voiceRate);
                      }}
                      className={`cursor-pointer p-3 rounded-xl border-2 transition-all text-left flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-slate-800">{gv.label}</span>
                            {isSelected && (
                              <span className="text-[10px] font-black uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded-md">
                                Selected
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">{gv.description}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {gv.accent} • {gv.gender}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSetting('preferredVoiceURI', gv.id);
                            setSelectedVoiceName(gv.id);
                            testVoiceSample(gv.id, settings.voiceRate);
                          }}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors flex items-center gap-1 ${
                            isCurrentlyPlaying
                              ? 'bg-amber-600 text-white border-amber-700'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-200'
                          }`}
                        >
                          <span>{isCurrentlyPlaying ? '🔊' : '▶️'}</span>
                          <span>{isCurrentlyPlaying ? 'Speaking...' : 'Test Voice'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Speaking Rate */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span>🐢</span>
                  <span>Companion Speaking Pace</span>
                </label>
                <span className="text-xs font-black text-amber-800">
                  {settings.voiceRate <= 0.88
                    ? 'Gentle & Slow (Toddler Friendly)'
                    : settings.voiceRate >= 1.05
                    ? 'Brisk'
                    : 'Normal'}
                </span>
              </div>
              <input
                id="voice-rate-slider"
                type="range"
                min="0.75"
                max="1.15"
                step="0.05"
                value={settings.voiceRate}
                onChange={(e) => {
                  const newRate = parseFloat(e.target.value);
                  updateSetting('voiceRate', newRate);
                  setVoiceRate(newRate);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>0.75x (Very Slow)</span>
                <span>0.95x (Recommended)</span>
                <span>1.15x (Fast)</span>
              </div>
            </div>

            {/* Sensory Mode Toggle */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-800">
                    Calm / Low-Sensory Mode
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Softens animations, reduces flashing particle bursts, and keeps audio gentle for sensitive or bedtime play.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  updateSetting('sensoryMode', settings.sensoryMode === 'calm' ? 'standard' : 'calm')
                }
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                  settings.sensoryMode === 'calm' ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    settings.sensoryMode === 'calm' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound Effects Toggle */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-800">
                    Sound Effects & Chimes
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Enables transformation whooshes, animal sounds (woof, roar), and chime fanfares.
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('soundEffectsEnabled', !settings.soundEffectsEnabled)}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                  settings.soundEffectsEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    settings.soundEffectsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Tactile / Haptic Feedback (Vibration) Toggle */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📳</span>
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
                    <span>Tactile Haptic Feedback (Vibration)</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                      Sensory Engagement
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Provides gentle tactile vibrations when your child taps a costume, presses an action picture, or completes a vocabulary round.
                  </p>
                </div>
              </div>
              <button
                id="toggle-haptics-btn"
                onClick={() => updateSetting('hapticsEnabled', !settings.hapticsEnabled)}
                className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                  settings.hapticsEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Default Mirror Mode */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>🪞</span>
                <span>Default Mirror Representation</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSetting('defaultMirrorMode', 'camera')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    settings.defaultMirrorMode === 'camera'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-2xl">📸</span>
                  <div>
                    <div className="text-xs font-black">Live Camera Mirror</div>
                    <div className="text-[10px] opacity-80">Augmented reality face</div>
                  </div>
                </button>

                <button
                  onClick={() => updateSetting('defaultMirrorMode', 'cartoon')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    settings.defaultMirrorMode === 'cartoon'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-2xl">🎭</span>
                  <div>
                    <div className="text-xs font-black">Cartoon Mirror Avatar</div>
                    <div className="text-[10px] opacity-80">Animated toddler character</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-100 shrink-0 bg-white mt-auto">
          <button
            onClick={handleResetDefaults}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 underline transition-colors"
          >
            Reset All Defaults
          </button>

          <button
            id="save-parent-settings-btn"
            onClick={handleSaveAndClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Save & Return to Child Mode</span>
            {showSavedToast && <span>✓</span>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
