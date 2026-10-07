# Core loop fixes: barge-in listening and costume switching

The "Well done → second go → Perfect" mechanic, star rules and result labels stay exactly as they are.

## A. Listen while the narrator is talking

**What changes for the child:** if they shout "fireman!" while the narrator is still talking, it counts. The narrator stops and goes straight to "Perfect!" or "Well done", the same as now.

1. **Start listening when the prompt starts.** Every narrator line that asks for a word or a costume will start the listener at the same moment the voice starts. Today the listener only starts in the line's "finished" callback. This covers the name practice (first and second go), the picture words (first and second go), "what would you like to be" and "I don't know that one yet".
2. **Ignore the narrator's own voice (echo guard).**
   - The voice server switches to ElevenLabs' *with-timestamps* endpoint. It returns the audio plus the time each word is spoken. The timings are cached on the device next to the audio, so a cached phrase still never goes back to ElevenLabs. Audio cached before this change has no timings yet, so it is fetched once more for the timings and then never again. This is a one-time cost per phrase.
   - When the device voice is the fallback, word timings come from the device's own word-by-word events as they happen.
   - While the narrator is saying the target word or any costume name, plus 600 ms after it, matches are ignored.
   - Any heard phrase that contains other words from the prompt (for example "can you say", "you're a", "let's try") is also ignored. We compare against the words of the line currently playing.
3. **An early correct word.** The narrator stops at once. The flow continues through the existing first-go / second-go handlers, so stars and logging are unchanged. An early valid costume name selects that costume.
4. **Talking that doesn't match is not a miss.** The listener keeps going. The 5.5-second "no answer" timer starts only when the prompt finishes. A "not yet" or "didn't try" result can only happen after that timer.

## B. Switching costume after a wrong pick

1. **Switch at any moment**, including during the dress-up and name practice. Tapping a different costume immediately:
   - stops the narrator and the listener
   - cancels every pending timer
   - dresses the child in the new costume

   Each round gets a round number. Every voice, listener and timer callback checks that number and does nothing if it belongs to an older round. Costume buttons are never disabled during these stages.
2. **An abandoned word** gets no star and no log entry.
3. **Opening the costume tray** pauses the narrator and listening, and cancels the timers. Closing it without choosing goes back to the same stage (the same costume, the same go) and replays that stage's prompt. Tapping the costume the child is already wearing does the same as closing.
4. **An obvious way back to costumes:** the 2×2 grid icon is replaced by a large chunky button (at least 64 px) showing three small costume pictures, fanned out. It works with one tap and has no text. It keeps its aria-label.

## Files

- `src/routes/api/public/tts.ts`: call `/with-timestamps` and return the audio plus word timings as JSON.
- `src/app/utils/speechService.ts`:
  - store timings in the cache with the audio
  - add `speakText` hooks for start, word timing and stop
  - add device-voice `onboundary` support
  - add a recognizer "guard" option (blocked time windows plus prompt-word filter)
  - add a way to start the listener before the speech starts
- `src/app/App.tsx`:
  - add the round/generation id and a `cancelRound()` helper that stops speech, the recognizer and every timer
  - start listeners when each prompt starts, and start the timeout when it ends
  - stop the narrator on an early match
  - tray pause/resume with "replay the current stage"
  - remove `disabled` from CharacterBar
  - track a `setTimeout` list instead of only `loopTimeoutRef`
- `src/app/components/VocabularyBanner.tsx`: the new costume-thumbnail button.
- `src/app/components/CharacterBar.tsx`: allow tapping during any stage, and add a "closed without choosing" callback.
- Tests: unit tests for the echo-guard filter (timing window, prompt-word filter, early match) and for ignoring stale rounds.
- `AGENTS.md`: a rule about round ids and starting listeners when a prompt starts.

## Risks and decisions

- **Speaker echo on phones and tablets (the biggest risk).** The mic hears the speaker. Echo cancellation in the browser's speech recognition is unreliable, especially on iPhone Safari. The timing window and the prompt-word filter stop the narrator from scoring for the child. But:
  - The target word is in every name-practice prompt ("Can you say fireman?"). Inside the guard window a real child saying it at the same moment is ignored. That's the right trade-off.
  - Speaker latency (especially Bluetooth) can shift the echo later than the timings say. The 600 ms margin may need to grow to about 1 s on Bluetooth. We will make it one tunable value.
- **iPhone may duck or distort the narrator** when the mic is open during playback. We saw distortion earlier. Starting the mic during speech could bring it back. If it does on a real device, the fallback is: start listening right after the target word has been spoken (still earlier than now), not at the very start of the line.
- **The recognizer's early guesses** can change mid-phrase. Early matches only act on a word that still matches after the guard checks. This avoids false "Perfect" results.
- **Extra ElevenLabs cost:** each already-cached phrase is fetched once more to get its timings. After that, nothing new.
- **Not testable here:** real echo behaviour needs testing on your iPhone. In this sandbox we can only verify the logic and that the costume switch works.
