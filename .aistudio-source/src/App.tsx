import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CHARACTERS,
  getSingularName,
  getPluralName,
  getIndefiniteArticle,
} from './data/characters';
import { CharacterId, CharacterItem, CharacterAction, AppState } from './types';
import { CostumeCanvas } from './components/CostumeCanvas';
import { CharacterBar } from './components/CharacterBar';
import { VocabularyBanner } from './components/VocabularyBanner';
import { SessionWrapUp } from './components/SessionWrapUp';
import { ParentalGateModal } from './components/ParentalGateModal';
import { ParentSettingsModal } from './components/ParentSettingsModal';
import { ToddlerVoiceTrainerModal } from './components/ToddlerVoiceTrainerModal';
import {
  speakText,
  stopAnySpeech,
  ToddlerSpeechRecognizer,
} from './utils/speechService';
import {
  playMagicTransformation,
  playCharacterSound,
  playSparkle,
} from './utils/audioEffects';
import {
  getParentSettings,
  subscribeParentSettings,
  ParentSettings,
} from './utils/parentSettings';
import {
  hapticCharacterTap,
  hapticActionPress,
  hapticRepeatSuccess,
  hapticRoundComplete,
} from './utils/haptics';

export default function App() {
  const [parentSettings, setParentSettings] = useState<ParentSettings>(getParentSettings());
  const [appState, setAppState] = useState<AppState>('start');
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId | null>(null);
  const [showCharacterCards, setShowCharacterCards] = useState<boolean>(true);
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showMagicBurst, setShowMagicBurst] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<CharacterAction | null>(null);
  const [actionPromptState, setActionPromptState] = useState<'idle' | 'prompting' | 'repeating' | 'celebrated'>('idle');
  const [repeatStage, setRepeatStage] = useState<1 | 2>(1);
  const [actionRepeatStage, setActionRepeatStage] = useState<1 | 2>(1);
  const [showParentGate, setShowParentGate] = useState<boolean>(false);
  const [showParentSettings, setShowParentSettings] = useState<boolean>(false);
  const [showToddlerTrainer, setShowToddlerTrainer] = useState<boolean>(false);

  const isParentScreenActive = showParentGate || showParentSettings || showToddlerTrainer;

  const recognizerRef = useRef<ToddlerSpeechRecognizer | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasWelcomedRef = useRef<boolean>(false);
  const currentCharacter = CHARACTERS.find((c) => c.id === selectedCharacterId) || null;

  // Pause speech & recognition while parent gate or settings are open
  useEffect(() => {
    if (isParentScreenActive) {
      stopAnySpeech();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
    }
  }, [isParentScreenActive]);

  // Filter characters according to Parent Settings
  const availableCharacters = useMemo(() => {
    const enabled = parentSettings.enabledCharacters;
    const filtered = CHARACTERS.filter((c) => enabled.includes(c.id));
    return filtered.length > 0 ? filtered : CHARACTERS;
  }, [parentSettings.enabledCharacters]);

  // Subscribe to Parent Settings updates
  useEffect(() => {
    const unsub = subscribeParentSettings((newSettings) => {
      setParentSettings(newSettings);
    });
    return () => unsub();
  }, []);

  // Initialize ToddlerSpeechRecognizer
  useEffect(() => {
    recognizerRef.current = new ToddlerSpeechRecognizer();
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      stopAnySpeech();
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    };
  }, []);

  // Safe wrapper to speak and manage speaking state
  const speakWithState = useCallback(async (text: string, onDone?: () => void) => {
    setIsSpeaking(true);
    await speakText(
      text,
      () => {
        setIsSpeaking(false);
        if (onDone) onDone();
      },
      {
        voiceId: parentSettings.preferredVoiceURI,
        rate: parentSettings.voiceRate,
      }
    );
  }, [parentSettings.preferredVoiceURI, parentSettings.voiceRate]);

  // Wrap-up message
  const triggerWrapUp = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsListening(false);
    stopAnySpeech();
    setAppState('session_wrap_up');

    let wrapUpText = 'Great job today! Go find Mommy or Daddy and show them what you can be!';
    if (parentSettings.wrapUpRoutine === 'bedtime') {
      wrapUpText = 'Great job today! It is time to wind down for cozy bedtime. Night night!';
    } else if (parentSettings.wrapUpRoutine === 'cleanup') {
      wrapUpText = 'Great job today! Time to wave goodbye to our costumes and go play!';
    }

    speakWithState(wrapUpText);
  }, [parentSettings.wrapUpRoutine, speakWithState]);

  // Start session limit timer if configured
  const startSessionTimerIfNeeded = useCallback(() => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    if (parentSettings.sessionTimeMinutes > 0) {
      sessionTimerRef.current = setTimeout(() => {
        triggerWrapUp();
      }, parentSettings.sessionTimeMinutes * 60 * 1000);
    }
  }, [parentSettings.sessionTimeMinutes, triggerWrapUp]);

  const handleSelectCharacterRef = useRef<(charId: CharacterId) => void>(() => {});

  // Voice listener when picking characters
  const startListeningForChoice = useCallback(() => {
    setIsListening(true);
    if (recognizerRef.current) {
      recognizerRef.current.start((matchedChar, rawTranscript) => {
        if (matchedChar) {
          handleSelectCharacterRef.current(matchedChar.id);
        } else if (rawTranscript.trim().length > 4) {
          // Unrecognized word: guide back to allowed costumes
          if (recognizerRef.current) recognizerRef.current.stop();
          setIsListening(false);
          const sampleNames = availableCharacters.slice(0, 5).map((c) => `a ${c.name.toLowerCase()}`).join(', ');
          const fallbackGuide = `Hmm, I don't know that one yet! Do you want to be ${sampleNames}?`;
          speakWithState(fallbackGuide, () => {
            startListeningForChoice();
          });
        }
      });
    }
  }, [availableCharacters, speakWithState]);

  // Ask what else they want to be and listen again
  const askNextChoice = useCallback(() => {
    setAppState('asking_next');
    setActiveAction(null);
    setActionPromptState('idle');
    speakWithState('What else would you like to be?', () => {
      setAppState('listening_choice');
      setShowCharacterCards(true);
      startListeningForChoice();
    });
  }, [speakWithState, startListeningForChoice]);

  // Step 2 done -> Step 3 ("Well done.") & Step 4 ("Let's see what xxx do. Press a picture")
  const handleSecondRepeatDone = useCallback((char: CharacterItem) => {
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    if (recognizerRef.current) recognizerRef.current.stop();
    setIsListening(false);

    setAppState('vocab_celebrate');
    playSparkle();
    hapticRoundComplete();

    const plural = getPluralName(char);
    // User requested audio sequence:
    // 3. "Well done"
    // 4. "Let's see what xxx do. Press a picture"
    speakWithState('Well done.', () => {
      setTimeout(() => {
        speakWithState(`Let's see what ${plural} do. Press a picture.`, () => {
          // Allow exploration and action picture clicking
          loopTimeoutRef.current = setTimeout(() => {
            const nextRound = roundsCompleted + 1;
            setRoundsCompleted(nextRound);

            if (parentSettings.maxRounds > 0 && nextRound >= parentSettings.maxRounds) {
              triggerWrapUp();
            }
          }, 12000);
        });
      }, 350);
    });
  }, [parentSettings.maxRounds, roundsCompleted, speakWithState, triggerWrapUp]);

  // Step 1 done -> Step 2 ("Well done. Let's try one more time: xxx")
  const handleFirstRepeatDone = useCallback((char: CharacterItem) => {
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    if (recognizerRef.current) recognizerRef.current.stop();
    setIsListening(false);

    playSparkle();
    hapticRepeatSuccess();
    setRepeatStage(2);

    const singular = getSingularName(char);
    // User requested: "Well done. Let's try one more time: xxx"
    speakWithState(`Well done. Let's try one more time: ${singular}.`, () => {
      setIsListening(true);
      if (recognizerRef.current) {
        recognizerRef.current.startActionWordListener(singular, () => {
          handleSecondRepeatDone(char);
        });
      }

      // Forgiving fallback for shy toddlers
      loopTimeoutRef.current = setTimeout(() => {
        handleSecondRepeatDone(char);
      }, 5500);
    });
  }, [handleSecondRepeatDone, speakWithState]);

  // Stage 2 of action repetition: child repeated second time -> celebrate and invite next picture
  const handleActionSecondRepeatDone = useCallback(
    (action: CharacterAction) => {
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
      if (recognizerRef.current) recognizerRef.current.stop();
      setIsListening(false);

      setActionPromptState('celebrated');
      playSparkle();
      hapticRoundComplete();

      // Voice praise: "Well done!"
      speakWithState('Well done!', () => {
        const plural = currentCharacter ? getPluralName(currentCharacter) : 'they';
        speakWithState(`Let's see what else ${plural} do. Press a picture.`, () => {
          setActionPromptState('idle');
          setActiveAction(null);
          setActionRepeatStage(1);
        });
      });
    },
    [currentCharacter, speakWithState]
  );

  // Stage 1 of action repetition: child repeated first time -> "Well done! Let's try one more time: xxx"
  const handleActionFirstRepeatDone = useCallback(
    (action: CharacterAction) => {
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
      if (recognizerRef.current) recognizerRef.current.stop();
      setIsListening(false);

      playSparkle();
      hapticRepeatSuccess();
      setActionRepeatStage(2);

      // User requested: "The voice should say "well done" or "good job" and invite them to try one more time"
      speakWithState(`Well done! Let's try one more time: ${action.targetWord}.`, () => {
        setIsListening(true);
        if (recognizerRef.current) {
          recognizerRef.current.startActionWordListener(action.targetWord, () => {
            handleActionSecondRepeatDone(action);
          });
        }

        // Forgiving fallback timeout for shy toddlers
        loopTimeoutRef.current = setTimeout(() => {
          handleActionSecondRepeatDone(action);
        }, 5500);
      });
    },
    [handleActionSecondRepeatDone, speakWithState]
  );

  // User clicks an example of what the profession does (picture press exploration)
  const handleActionClick = useCallback(
    (action: CharacterAction) => {
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
      stopAnySpeech();
      if (recognizerRef.current) recognizerRef.current.stop();
      setIsListening(false);
      hapticActionPress();

      setActiveAction(action);
      setActionRepeatStage(1);
      setActionPromptState('prompting');

      // Voice prompt: e.g. "Firemen drive fire engines. Can you say fire engine?"
      const promptPhrase = `${action.actionSentence} ${action.repeatPrompt}`;

      speakWithState(promptPhrase, () => {
        setActionPromptState('repeating');
        setIsListening(true);

        // Listen for the child repeating the target word (or forgiving toddler sound)
        if (recognizerRef.current) {
          recognizerRef.current.startActionWordListener(action.targetWord, () => {
            handleActionFirstRepeatDone(action);
          });
        }

        // Forgiving fallback timeout allowing plenty of time for child
        loopTimeoutRef.current = setTimeout(() => {
          handleActionFirstRepeatDone(action);
        }, 5500);
      });
    },
    [handleActionFirstRepeatDone, speakWithState]
  );

  // Clicking the character badge invites child to see what they do
  const handleCharacterBadgeClick = useCallback(() => {
    if (!currentCharacter) return;
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    stopAnySpeech();
    setActiveAction(null);
    setActionPromptState('idle');
    setActionRepeatStage(1);
    const plural = getPluralName(currentCharacter);
    speakWithState(`Let's see what ${plural} do. Press a picture.`);
  }, [currentCharacter, speakWithState]);

  // Handler when a character is chosen (via voice or tap)
  const handleSelectCharacter = useCallback((charId: CharacterId) => {
    const char = CHARACTERS.find((c) => c.id === charId);
    if (!char) return;

    hapticCharacterTap();
    hasWelcomedRef.current = true;

    // If starting from idle start screen, kick off safety session timer if configured
    if (appState === 'start') {
      startSessionTimerIfNeeded();
    }

    // Stop listening during vocabulary routine
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsListening(false);
    stopAnySpeech();
    setActiveAction(null);
    setActionPromptState('idle');
    setActionRepeatStage(1);

    setSelectedCharacterId(charId);
    setShowCharacterCards(false);
    setAppState('transforming');
    setShowMagicBurst(true);
    playMagicTransformation();
    setTimeout(() => {
      playCharacterSound(char.soundType);
    }, 400);

    // After 1.2s of wearing costume, begin the new audio journey
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    loopTimeoutRef.current = setTimeout(() => {
      setShowMagicBurst(false);
      setAppState('vocab_intro');
      setRepeatStage(1);

      const singular = getSingularName(char);
      const article = getIndefiniteArticle(singular);
      // User requested: "you're a xxx. Can you say xxx?"
      const phrase1 = `You're ${article} ${singular}. Can you say ${singular}?`;

      speakWithState(phrase1, () => {
        setAppState('vocab_repeat');
        setRepeatStage(1);
        setIsListening(true);

        if (recognizerRef.current) {
          recognizerRef.current.startActionWordListener(singular, () => {
            handleFirstRepeatDone(char);
          });
        }

        // Forgiving fallback timeout for toddlers
        loopTimeoutRef.current = setTimeout(() => {
          handleFirstRepeatDone(char);
        }, 5500);
      });
    }, 1200);
  }, [appState, handleFirstRepeatDone, speakWithState, startSessionTimerIfNeeded]);

  handleSelectCharacterRef.current = handleSelectCharacter;

  // Initial welcome handler: "Hello there, what would you like to be today. Tap a costume"
  const handleStartApp = useCallback(() => {
    setRoundsCompleted(0);
    setAppState('greeting');
    setShowCharacterCards(true);
    playSparkle();

    startSessionTimerIfNeeded();

    speakWithState('Hello there, what would you like to be today. Tap a costume', () => {
      setAppState('listening_choice');
      startListeningForChoice();
    });
  }, [speakWithState, startListeningForChoice, startSessionTimerIfNeeded]);

  // Reset to initial screen and replay welcome
  const handleRestart = useCallback(() => {
    stopAnySpeech();
    if (recognizerRef.current) recognizerRef.current.stop();
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    setSelectedCharacterId(null);
    setShowCharacterCards(true);
    setRoundsCompleted(0);
    setActiveAction(null);
    setActionPromptState('idle');
    setActionRepeatStage(1);
    handleStartApp();
  }, [handleStartApp]);

  // Trigger initial welcome on load and on first user gesture
  useEffect(() => {
    if (hasWelcomedRef.current) return;

    const triggerWelcome = () => {
      if (hasWelcomedRef.current) return;
      hasWelcomedRef.current = true;
      handleStartApp();
    };

    // Attempt immediately on mount
    triggerWelcome();

    // If browser policy blocked unprompted audio on cold load,
    // trigger on the very first touch/click anywhere before a costume is chosen
    const handleInitialUserGesture = () => {
      window.removeEventListener('pointerdown', handleInitialUserGesture);
      window.removeEventListener('keydown', handleInitialUserGesture);
      if (!selectedCharacterId) {
        triggerWelcome();
      }
    };

    window.addEventListener('pointerdown', handleInitialUserGesture, { once: true });
    window.addEventListener('keydown', handleInitialUserGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleInitialUserGesture);
      window.removeEventListener('keydown', handleInitialUserGesture);
    };
  }, [handleStartApp, selectedCharacterId]);

  return (
    <main
      id="who-am-i-today-root"
      className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200 flex flex-col justify-end select-none"
    >
      {/* 1. PERMANENT LIVE AR MAGIC MIRROR / FACE INTERFACE */}
      {/* Contains mirrored video or cartoon avatar, golden frame, and edge top controls */}
      <div id="ar-camera-layer" className="absolute inset-0 z-0">
        <CostumeCanvas
          selectedCharacter={selectedCharacterId}
          showMagicBurst={showMagicBurst}
          roundsCompleted={roundsCompleted}
          maxRounds={parentSettings.maxRounds}
          onRestart={handleRestart}
          showRestart={appState !== 'start'}
          onOpenParentGate={() => setShowParentGate(true)}
        />
      </div>

      {/* 2. PROTECTED FACE & HAT ZONE: The entire center and upper screen is 100% UNOBSTRUCTED */}

      {/* 3. LOWER DOCKED INTERFACE: The interaction HUD drops down and replaces the costume cards when required */}
      {/* Hidden when parent screen is active so costume cards never obscure settings */}
      {!isParentScreenActive && (
        <footer className="relative z-20 w-full bg-gradient-to-t from-black/65 via-black/25 to-transparent pb-3 pt-4 px-3 sm:px-4 flex flex-col items-center justify-end">
          <AnimatePresence mode="wait">
            {showCharacterCards ? (
              <CharacterBar
                key="character-cards-deck"
                selectedCharacterId={selectedCharacterId}
                characters={availableCharacters}
                onSelect={handleSelectCharacter}
                disabled={appState === 'vocab_intro' || appState === 'vocab_repeat'}
                showCloseButton={Boolean(currentCharacter)}
                onClose={() => setShowCharacterCards(false)}
                isListening={isListening}
                isSpeaking={isSpeaking}
                onMicClick={() => {
                  if (!isSpeaking) startListeningForChoice();
                }}
                onPromptClick={() => {
                  if (!isSpeaking) handleStartApp();
                }}
                promptText={
                  appState === 'start' || appState === 'greeting'
                    ? 'Hello there, what would you like to be today. Tap a costume'
                    : 'What would you like to be? Say or tap!'
                }
              />
            ) : currentCharacter ? (
              <motion.div
                key="docked-interaction-hud"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="w-full max-w-3xl mx-auto"
              >
                <VocabularyBanner
                  character={currentCharacter}
                  stage={
                    appState === 'vocab_repeat'
                      ? 'repeat'
                      : appState === 'vocab_celebrate'
                      ? 'celebrate'
                      : 'intro'
                  }
                  repeatStage={repeatStage}
                  actionRepeatStage={actionRepeatStage}
                  activeAction={activeAction}
                  actionPromptState={actionPromptState}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  onActionClick={handleActionClick}
                  onActionRepeatTap={(act) => {
                    if (actionRepeatStage === 1) {
                      handleActionFirstRepeatDone(act);
                    } else {
                      handleActionSecondRepeatDone(act);
                    }
                  }}
                  onRepeatTap={() => {
                    if (activeAction) {
                      if (actionRepeatStage === 1) {
                        handleActionFirstRepeatDone(activeAction);
                      } else {
                        handleActionSecondRepeatDone(activeAction);
                      }
                    } else if (currentCharacter) {
                      if (repeatStage === 1) {
                        handleFirstRepeatDone(currentCharacter);
                      } else {
                        handleSecondRepeatDone(currentCharacter);
                      }
                    }
                  }}
                  onCharacterBadgeClick={handleCharacterBadgeClick}
                  onShowCards={() => setShowCharacterCards(true)}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </footer>
      )}

      {/* 4. PARENTAL GATE & COMPREHENSIVE SETTINGS (TOP-LEVEL OVERLAYS) */}
      <ParentalGateModal
        isOpen={showParentGate}
        onSuccess={() => {
          setShowParentGate(false);
          setShowParentSettings(true);
        }}
        onCancel={() => setShowParentGate(false)}
      />

      <ParentSettingsModal
        isOpen={showParentSettings}
        onClose={() => setShowParentSettings(false)}
        onOpenVoiceTrainer={() => setShowToddlerTrainer(true)}
        onSettingsSaved={(newSettings) => {
          setParentSettings(newSettings);
        }}
      />

      <ToddlerVoiceTrainerModal
        isOpen={showToddlerTrainer}
        onClose={() => setShowToddlerTrainer(false)}
      />

      {/* 5. SESSION WRAP UP MODAL */}
      <AnimatePresence>
        {appState === 'session_wrap_up' && (
          <SessionWrapUp
            onRestart={handleRestart}
            roundsCompleted={roundsCompleted}
            childName={parentSettings.childName}
            wrapUpRoutine={parentSettings.wrapUpRoutine}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
