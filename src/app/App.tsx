// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CHARACTERS,
  getSingularName,
  getPluralName,
  getIndefiniteArticle,
} from './data/characters';
import { actionsFor, isCharacterLocked } from './data/premiumCharacters';
import { CharacterId, CharacterItem, CharacterAction, AppState } from './types';
import { recordAttempt } from './utils/progressStore';
import { getParentSettings as readSettingsForLog } from './utils/parentSettings';

// Remember every word attempt on this device (results only, never audio).
type Result = 'clear' | 'good-try' | 'not-yet' | 'didnt-try';
function logAttempt(costumeId: string | undefined, word: string, kind: 'costume' | 'picture', mode: 'said' | 'tapped', r: Result) {
  const s = readSettingsForLog();
  if (!costumeId || s.trackProgress === false) return;
  recordAttempt({ c: costumeId, w: word, k: kind, m: mode, r });
}
import { CostumeCanvas } from './components/CostumeCanvas';
import { CharacterBar } from './components/CharacterBar';
import { VocabularyBanner } from './components/VocabularyBanner';
import { SessionWrapUp } from './components/SessionWrapUp';
import { ParentalGateModal } from './components/ParentalGateModal';
import { ParentSetup } from './components/ParentSetup';
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
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0); // costume rounds (hidden session limit)
  const [starsEarned, setStarsEarned] = useState<number>(0); // stars for trying words
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
  const [micUnavailable, setMicUnavailable] = useState<boolean>(false);
  const [quizTarget, setQuizTarget] = useState<CharacterAction | null>(null); // tap mode: picture to find

  const setupComplete = parentSettings.setupComplete;
  const isParentScreenActive = showParentGate || showParentSettings || showToddlerTrainer || !setupComplete;
  // Mic on = the parent allowed it and the browser hasn't refused it. Otherwise: tap mode.
  const micOn = parentSettings.micEnabled && !micUnavailable;
  const micOnRef = useRef(micOn);
  micOnRef.current = micOn;

  const recognizerRef = useRef<ToddlerSpeechRecognizer | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasWelcomedRef = useRef<boolean>(false);
  const lastLineRef = useRef<string>('');
  const triedRef = useRef<boolean>(false); // any speech heard during this word's two goes
  const usedQuizRef = useRef<string[]>([]);
  const baseCharacter = CHARACTERS.find((c) => c.id === selectedCharacterId) || null;
  const currentCharacter = useMemo(
    () => (baseCharacter ? { ...baseCharacter, actions: actionsFor(baseCharacter, parentSettings.premiumUnlocked) } : null),
    [baseCharacter, parentSettings.premiumUnlocked]
  );

  // Pause speech & recognition while parent screens are open
  useEffect(() => {
    if (isParentScreenActive) {
      stopAnySpeech();
      if (recognizerRef.current) recognizerRef.current.stop();
      setIsListening(false);
    }
  }, [isParentScreenActive]);

  // Only unlocked, parent-enabled costumes are ever shown to the child.
  const availableCharacters = useMemo(() => {
    const enabled = parentSettings.enabledCharacters;
    const unlocked = CHARACTERS.filter((c) => !isCharacterLocked(c, parentSettings.premiumUnlocked));
    const filtered = unlocked.filter((c) => enabled.includes(c.id));
    return filtered.length > 0 ? filtered : unlocked;
  }, [parentSettings.enabledCharacters, parentSettings.premiumUnlocked]);

  useEffect(() => {
    const unsub = subscribeParentSettings((newSettings) => setParentSettings(newSettings));
    return () => unsub();
  }, []);

  // Re-enabling the mic in settings gives the recognizer another chance.
  useEffect(() => {
    if (parentSettings.micEnabled && micUnavailable && recognizerRef.current && !recognizerRef.current.unavailable) {
      setMicUnavailable(false);
    }
  }, [parentSettings.micEnabled, micUnavailable]);

  useEffect(() => {
    const rec = new ToddlerSpeechRecognizer();
    recognizerRef.current = rec;
    if (rec.unavailable) setMicUnavailable(true);
    // Permanent mic refusal: switch silently to tap mode.
    rec.onUnavailable = () => {
      setMicUnavailable(true);
      setIsListening(false);
    };
    return () => {
      rec.stop();
      stopAnySpeech();
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    };
  }, []);

  const speakWithState = useCallback(async (text: string, onDone?: () => void) => {
    lastLineRef.current = text;
    setIsSpeaking(true);
    await speakText(
      text,
      () => {
        setIsSpeaking(false);
        if (onDone) onDone();
      },
      { voiceId: parentSettings.preferredVoiceURI, rate: parentSettings.voiceRate }
    );
  }, [parentSettings.preferredVoiceURI, parentSettings.voiceRate]);

  // Replay speaker: repeat the last line (no follow-on actions).
  const handleReplay = useCallback(() => {
    if (isSpeaking || !lastLineRef.current) return;
    const line = lastLineRef.current;
    setIsSpeaking(true);
    speakText(line, () => setIsSpeaking(false), { voiceId: parentSettings.preferredVoiceURI, rate: parentSettings.voiceRate });
  }, [isSpeaking, parentSettings.preferredVoiceURI, parentSettings.voiceRate]);

  const awardStar = useCallback(() => setStarsEarned((n) => n + 1), []);

  const stopListening = () => {
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    if (recognizerRef.current) {
      if (recognizerRef.current.heardSpeech) triedRef.current = true;
      recognizerRef.current.stop();
    }
    setIsListening(false);
  };

  const triggerWrapUp = useCallback(() => {
    if (recognizerRef.current) recognizerRef.current.stop();
    setIsListening(false);
    stopAnySpeech();
    setAppState('session_wrap_up');

    let wrapUpText = 'Great job today! Go find your grown-up and show them what you can be!';
    if (parentSettings.wrapUpRoutine === 'bedtime') {
      wrapUpText = 'Great job today! It is time to wind down for cozy bedtime. Night night!';
    } else if (parentSettings.wrapUpRoutine === 'cleanup') {
      wrapUpText = 'Great job today! Time to wave goodbye to our costumes and go play!';
    }
    speakWithState(wrapUpText);
  }, [parentSettings.wrapUpRoutine, speakWithState]);

  const startSessionTimerIfNeeded = useCallback(() => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    if (parentSettings.sessionTimeMinutes > 0) {
      sessionTimerRef.current = setTimeout(() => triggerWrapUp(), parentSettings.sessionTimeMinutes * 60 * 1000);
    }
  }, [parentSettings.sessionTimeMinutes, triggerWrapUp]);

  const handleSelectCharacterRef = useRef<(charId: CharacterId) => void>(() => {});

  // Voice listener when picking costumes (mic on only)
  const startListeningForChoice = useCallback(() => {
    if (!micOnRef.current || !recognizerRef.current) return;
    setIsListening(true);
    recognizerRef.current.start((matchedChar, rawTranscript) => {
      if (matchedChar && availableCharacters.some((c) => c.id === matchedChar.id)) {
        handleSelectCharacterRef.current(matchedChar.id);
      } else if (rawTranscript.trim().length > 4) {
        if (recognizerRef.current) recognizerRef.current.stop();
        setIsListening(false);
        const sampleNames = availableCharacters.slice(0, 5).map((c) => `a ${c.name.toLowerCase()}`).join(', ');
        speakWithState(`Hmm, I don't know that one yet! Do you want to be ${sampleNames}?`, () => {
          startListeningForChoice();
        });
      }
    });
  }, [availableCharacters, speakWithState]);

  const costumeLine = (first: boolean) =>
    micOnRef.current
      ? `${first ? 'Hello there, what would you like to be today.' : 'What else would you like to be today?'} Say it out loud or tap a costume.`
      : `${first ? 'Hello there, what would you like to be today?' : 'What else would you like to be today?'} Tap a costume.`;

  const actionsDoneRef = useRef(0);
  const askNextChoice = useCallback(() => {
    setAppState('asking_next');
    setActiveAction(null);
    setQuizTarget(null);
    setActionPromptState('idle');
    setActionRepeatStage(1);
    setShowCharacterCards(true);
    speakWithState(costumeLine(false), () => {
      setAppState('listening_choice');
      setShowCharacterCards(true);
      startListeningForChoice();
    });
  }, [speakWithState, startListeningForChoice]);

  // ---------- Tap mode (mic off): "Press the fire engine!" ----------
  const askQuiz = useCallback((char: CharacterItem, lead: string) => {
    const pool = char.actions.filter((a) => !usedQuizRef.current.includes(a.id));
    const target = (pool.length ? pool : char.actions)[Math.floor(Math.random() * (pool.length || char.actions.length))];
    usedQuizRef.current.push(target.id);
    setQuizTarget(target);
    setActionRepeatStage(1);
    setActiveAction(null);
    setActionPromptState('idle');
    speakWithState(`${lead} Press the ${target.targetWord}!`);
  }, [speakWithState]);

  const finishPictureRound = useCallback((praise: string, char: CharacterItem | null) => {
    setActionPromptState('celebrated');
    playSparkle();
    hapticRoundComplete();
    actionsDoneRef.current += 1;
    const done = actionsDoneRef.current;
    speakWithState(praise, () => {
      if (done >= 2) {
        if (parentSettings.maxRounds > 0 && roundsCompleted >= parentSettings.maxRounds) {
          triggerWrapUp();
          return;
        }
        askNextChoice();
        return;
      }
      const plural = char ? getPluralName(char) : 'they';
      if (!micOnRef.current && char) {
        askQuiz(char, `Let's see what else ${plural} do.`);
        return;
      }
      speakWithState(`Let's see what else ${plural} do. Press a picture.`, () => {
        setActionPromptState('idle');
        setActiveAction(null);
        setActionRepeatStage(1);
      });
    });
  }, [speakWithState, askNextChoice, askQuiz, parentSettings.maxRounds, roundsCompleted, triggerWrapUp]);

  const handleQuizTap = useCallback((action: CharacterAction) => {
    if (!quizTarget || !currentCharacter || isSpeaking) return;
    hapticActionPress();
    stopAnySpeech();
    const correct = action.id === quizTarget.id;
    setActiveAction(action);
    if (correct) {
      awardStar();
      logAttempt(currentCharacter.id, quizTarget.targetWord, 'picture', 'tapped', actionRepeatStage === 1 ? 'clear' : 'good-try');
      setQuizTarget(null);
      finishPictureRound('Perfect!', currentCharacter);
      return;
    }
    if (actionRepeatStage === 1) {
      setActionRepeatStage(2);
      speakWithState(`Well done. Let's try that one more time. Press the ${quizTarget.targetWord}!`);
      return;
    }
    logAttempt(currentCharacter.id, quizTarget.targetWord, 'picture', 'tapped', 'not-yet');
    setQuizTarget(null);
    finishPictureRound('Well done!', currentCharacter);
  }, [quizTarget, currentCharacter, isSpeaking, actionRepeatStage, awardStar, finishPictureRound, speakWithState]);

  // ---------- Costume name practice (mic on) ----------
  const handleSecondRepeatDone = useCallback((char: CharacterItem, praise = 'Well done.') => {
    stopListening();
    setAppState('vocab_celebrate');
    playSparkle();
    hapticRoundComplete();
    const plural = getPluralName(char);
    speakWithState(praise, () => {
      setTimeout(() => {
        if (!micOnRef.current) {
          askQuiz(char, `Let's see what ${plural} do.`);
          return;
        }
        speakWithState(`Let's see what ${plural} do. Press a picture.`);
      }, 350);
    });
  }, [speakWithState, askQuiz]);

  // Log the costume-name result and award a star for any genuine try.
  const finishNameWord = (char: CharacterItem, r: Result) => {
    logAttempt(char.id, getSingularName(char), 'costume', 'said', r);
    if (r !== 'didnt-try') awardStar();
  };

  const handleFirstRepeatDone = useCallback((char: CharacterItem, pronunciation?: 'perfect' | 'needs-practice') => {
    stopListening();
    if (pronunciation) triedRef.current = true;
    if (pronunciation === 'perfect') {
      finishNameWord(char, 'clear');
      handleSecondRepeatDone(char, 'Perfect!');
      return;
    }
    playSparkle();
    hapticRepeatSuccess();
    setRepeatStage(2);
    const singular = getSingularName(char);
    speakWithState(`Well done. Let's try one more time: ${singular}.`, () => {
      if (!micOnRef.current) {
        finishNameWord(char, triedRef.current ? 'not-yet' : 'didnt-try');
        handleSecondRepeatDone(char);
        return;
      }
      setIsListening(true);
      recognizerRef.current?.startActionWordListener(singular, (q) => {
        triedRef.current = true;
        finishNameWord(char, q === 'perfect' ? 'good-try' : 'not-yet');
        handleSecondRepeatDone(char, q === 'perfect' ? 'Perfect!' : 'Well done!');
      });
      loopTimeoutRef.current = setTimeout(() => {
        if (recognizerRef.current?.heardSpeech) triedRef.current = true;
        finishNameWord(char, triedRef.current ? 'not-yet' : 'didnt-try');
        handleSecondRepeatDone(char, 'Well done!');
      }, 5500);
    });
  }, [handleSecondRepeatDone, speakWithState, awardStar]);

  // ---------- Picture word practice (mic on) ----------
  const finishPictureWord = (action: CharacterAction, r: Result) => {
    logAttempt(currentCharacter?.id, action.targetWord, 'picture', 'said', r);
    if (r !== 'didnt-try') awardStar();
  };

  const handleActionSecondRepeatDone = useCallback(
    (action: CharacterAction, praise: string = 'Well done!') => {
      stopListening();
      finishPictureRound(praise, currentCharacter);
    },
    [currentCharacter, finishPictureRound]
  );

  const handleActionFirstRepeatDone = useCallback(
    (action: CharacterAction, pronunciation?: 'perfect' | 'needs-practice') => {
      stopListening();
      if (pronunciation) triedRef.current = true;
      if (pronunciation === 'perfect') {
        finishPictureWord(action, 'clear');
        handleActionSecondRepeatDone(action, 'Perfect!');
        return;
      }
      playSparkle();
      hapticRepeatSuccess();
      setActionRepeatStage(2);
      speakWithState(`Well done. Let's try that one more time: ${action.targetWord}.`, () => {
        if (!micOnRef.current) {
          finishPictureWord(action, triedRef.current ? 'not-yet' : 'didnt-try');
          handleActionSecondRepeatDone(action, 'Well done!');
          return;
        }
        setIsListening(true);
        recognizerRef.current?.startActionWordListener(action.targetWord, (q) => {
          triedRef.current = true;
          finishPictureWord(action, q === 'perfect' ? 'good-try' : 'not-yet');
          handleActionSecondRepeatDone(action, q === 'perfect' ? 'Perfect!' : 'Well done!');
        });
        loopTimeoutRef.current = setTimeout(() => {
          if (recognizerRef.current?.heardSpeech) triedRef.current = true;
          finishPictureWord(action, triedRef.current ? 'not-yet' : 'didnt-try');
          handleActionSecondRepeatDone(action, 'Well done!');
        }, 5500);
      });
    },
    [handleActionSecondRepeatDone, speakWithState, currentCharacter, awardStar]
  );

  // Child presses a picture
  const handleActionClick = useCallback(
    (action: CharacterAction) => {
      if (!micOnRef.current) {
        handleQuizTap(action);
        return;
      }
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
      stopAnySpeech();
      if (recognizerRef.current) recognizerRef.current.stop();
      setIsListening(false);
      hapticActionPress();
      triedRef.current = false;

      setActiveAction(action);
      setActionRepeatStage(1);
      setActionPromptState('prompting');

      speakWithState(`${action.actionSentence} ${action.repeatPrompt}`, () => {
        if (!micOnRef.current) {
          // Mic dropped out mid-turn: move on quietly, no star.
          finishPictureWord(action, 'didnt-try');
          handleActionSecondRepeatDone(action, 'Well done!');
          return;
        }
        setActionPromptState('repeating');
        setIsListening(true);
        recognizerRef.current?.startActionWordListener(action.targetWord, (q) => handleActionFirstRepeatDone(action, q));
        loopTimeoutRef.current = setTimeout(() => handleActionFirstRepeatDone(action), 5500);
      });
    },
    [handleActionFirstRepeatDone, handleActionSecondRepeatDone, handleQuizTap, speakWithState]
  );

  const handleCharacterBadgeClick = useCallback(() => {
    if (!currentCharacter) return;
    if (quizTarget) {
      handleReplay();
      return;
    }
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    stopAnySpeech();
    setActiveAction(null);
    setActionPromptState('idle');
    setActionRepeatStage(1);
    speakWithState(`Let's see what ${getPluralName(currentCharacter)} do. Press a picture.`);
  }, [currentCharacter, quizTarget, handleReplay, speakWithState]);

  // Costume chosen (voice or tap). No star here: stars are for words.
  const handleSelectCharacter = useCallback((charId: CharacterId) => {
    const char = CHARACTERS.find((c) => c.id === charId);
    if (!char) return;
    if (isCharacterLocked(char, getParentSettings().premiumUnlocked)) return;

    hapticCharacterTap();
    hasWelcomedRef.current = true;
    if (appState === 'start') startSessionTimerIfNeeded();

    if (recognizerRef.current) recognizerRef.current.stop();
    setIsListening(false);
    stopAnySpeech();
    setActiveAction(null);
    setQuizTarget(null);
    setActionPromptState('idle');
    setActionRepeatStage(1);

    actionsDoneRef.current = 0;
    usedQuizRef.current = [];
    triedRef.current = false;
    setRoundsCompleted((n) => n + 1);
    setSelectedCharacterId(charId);
    setShowCharacterCards(false);
    setAppState('transforming');
    setShowMagicBurst(true);
    playMagicTransformation();
    setTimeout(() => playCharacterSound(char.soundType), 400);

    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    loopTimeoutRef.current = setTimeout(() => {
      setShowMagicBurst(false);
      setAppState('vocab_intro');
      setRepeatStage(1);

      const singular = getSingularName(char);
      const article = getIndefiniteArticle(singular);

      if (!micOnRef.current) {
        // Tap mode: no name practice, go straight to the picture game.
        speakWithState(`You're ${article} ${singular}!`, () => {
          setAppState('vocab_celebrate');
          askQuiz(char, `Let's see what ${getPluralName(char)} do.`);
        });
        return;
      }

      speakWithState(`You're ${article} ${singular}. Can you say ${singular}?`, () => {
        if (!micOnRef.current) {
          handleSecondRepeatDone(char);
          return;
        }
        setAppState('vocab_repeat');
        setRepeatStage(1);
        setIsListening(true);
        recognizerRef.current?.startActionWordListener(singular, (q) => handleFirstRepeatDone(char, q));
        loopTimeoutRef.current = setTimeout(() => handleFirstRepeatDone(char), 5500);
      });
    }, 1200);
  }, [appState, askQuiz, handleFirstRepeatDone, handleSecondRepeatDone, speakWithState, startSessionTimerIfNeeded]);

  handleSelectCharacterRef.current = handleSelectCharacter;

  const handleStartApp = useCallback(() => {
    setRoundsCompleted(0);
    setStarsEarned(0);
    setAppState('greeting');
    setShowCharacterCards(true);
    playSparkle();
    startSessionTimerIfNeeded();
    speakWithState(costumeLine(true), () => {
      setAppState('listening_choice');
      startListeningForChoice();
    });
  }, [speakWithState, startListeningForChoice, startSessionTimerIfNeeded]);

  const handleRestart = useCallback(() => {
    stopAnySpeech();
    if (recognizerRef.current) recognizerRef.current.stop();
    if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    setSelectedCharacterId(null);
    setShowCharacterCards(true);
    setActiveAction(null);
    setQuizTarget(null);
    setActionPromptState('idle');
    setActionRepeatStage(1);
    handleStartApp();
  }, [handleStartApp]);

  // Welcome once setup is done (and again on first tap if audio was blocked)
  useEffect(() => {
    if (!setupComplete || hasWelcomedRef.current) return;
    const triggerWelcome = () => {
      if (hasWelcomedRef.current) return;
      hasWelcomedRef.current = true;
      handleStartApp();
    };
    triggerWelcome();
    const handleInitialUserGesture = () => {
      window.removeEventListener('pointerdown', handleInitialUserGesture);
      window.removeEventListener('keydown', handleInitialUserGesture);
      if (!selectedCharacterId) triggerWelcome();
    };
    window.addEventListener('pointerdown', handleInitialUserGesture, { once: true });
    window.addEventListener('keydown', handleInitialUserGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleInitialUserGesture);
      window.removeEventListener('keydown', handleInitialUserGesture);
    };
  }, [handleStartApp, selectedCharacterId, setupComplete]);

  // "Run setup again" from settings: allow a fresh welcome afterwards.
  useEffect(() => {
    if (!setupComplete) hasWelcomedRef.current = false;
  }, [setupComplete]);

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
          starsEarned={starsEarned}
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
                micAvailable={micOn}
                onMicClick={() => {
                  if (!isSpeaking) startListeningForChoice();
                }}
                onPromptClick={handleReplay}
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
                  onReplay={handleReplay}
                  micAvailable={micOn}
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

      {/* One-time grown-up setup before the first game */}
      {!setupComplete && <ParentSetup onDone={() => setParentSettings(getParentSettings())} />}

      {/* 5. SESSION WRAP UP MODAL */}
      <AnimatePresence>
        {appState === 'session_wrap_up' && (
          <SessionWrapUp
            onRestart={handleRestart}
            starsEarned={starsEarned}
            wrapUpRoutine={parentSettings.wrapUpRoutine}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
