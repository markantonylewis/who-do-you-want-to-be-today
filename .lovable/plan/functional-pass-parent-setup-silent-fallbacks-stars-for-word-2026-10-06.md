# Functional pass: parent setup, silent fallbacks, stars for words, no text for the child

Keep the current look. Only remove text or emoji where a rule requires it.

## 1. One-time parent setup (new)
- A full-screen setup that appears before the first game, then never again (it's remembered on the device).
- Four steps, each with one big thumb-reachable button at the bottom:
  1. Welcome, with a line saying no recordings are kept and only results are saved on this device.
  2. Camera: one line saying why, then "Allow camera" / "Skip". This asks the phone for permission.
  3. Microphone: same as step 2. This tap also switches on sound for iPhone.
  4. Child's name (optional), then "Start".
- Saved settings: `setupComplete`, `cameraEnabled`, `micEnabled`, `childName`. All can be changed in Parent Settings (a new "Camera and microphone" section, plus a "Run setup again" button).
- Removed from the child's screen: the "Turn on camera" card, the start-camera prompt, the Camera pill and the camera error banner.
- In the embedded preview the camera can't be used, so the camera step says "open in a new tab". Only the parent sees this.

## 2. Silent fallbacks
- If the speech recognizer gets `not-allowed` or `service-not-allowed`, it stops for good instead of restarting, reports "mic unavailable", and the app switches to tap mode for the rest of the session.
- If the camera is off, denied or fails, the child gets the cartoon face. Nothing is shown to the child.
- Narrator errors already fall back to the device voice. That stays.

## 3. Stars for trying words
- The star is no longer given for picking a costume.
- The voice mechanic stays exactly as it is now: not right on the 1st go → "Well done" → second go; not right on the 2nd go → "Well done" → move on; right on either go → "Perfect" → move on.
- Mic on: a star for any genuine try (clear, good try or not yet). Silence on both goes earns no star.
- Mic off (tap mode): the narrator says "Press the fire engine!" and the child taps one of the 3–4 pictures. The correct picture earns a star. The mic-on flow (child picks a picture, then says it) is unchanged.
- Top bar shows only earned stars as icons, with no digits. The session limit keeps counting costume rounds in the background.

## 4. Word-attempt tracking
- Each attempt is saved as: word, costume, said or tapped, result, timestamp. It's stored on this device only and no audio is kept.
- Results (for the parent log only; the child never hears them):
  - clear: perfect on the 1st go
  - good try: perfect on the 2nd go, or a close near-miss
  - not yet: tried but didn't get it
  - didn't try: silent on both goes
- Attempts are saved for free users too. The report stays premium.
- The existing Progress report keeps working: old entries map perfect → clear and needs-practice → not yet. Wording stays honest ("practising", "getting clearer").

## 5. No text or upsells on child screens
- Costume cards: artwork only, no name, with an aria-label.
- Picture choices: the illustration only, no caption.
- The prompt pill becomes a large replay-speaker button that repeats the last line.
- Top bar: the star count is shown as star shapes or a fill (no "0/5" digits). Start-over and Parents become icon-only. Emoji are replaced with simple drawn icons.
- Locked premium costumes are never shown to the child, and nothing locked appears there.

## 6. Speech matching fix (`findCharacter`)
Steps, in order:
1. Parent-trained words, matched as whole words or phrases.
2. Exact name, id or plural, checked across all characters, as whole words within the sentence.
3. Near-misses: 3 letters or shorter match only as a whole word. Longer ones may match inside the phrase.
4. If more than one costume matches, pick the longest matched phrase.

Result: "a dog" gives Dog, "are" no longer gives Star, and "doctor" still gives Doctor. Unit tests will cover these cases.

## 7. Parent gate and settings
- The press-and-hold bypass is removed.
- New challenge: a written multiplication such as "What is 7 × 8?", entered on a number pad. This is beyond a 4–6-year-old.
- 3 wrong answers lock the gate for 60 seconds, with a countdown.
- The 🔒 emoji is replaced with a drawn icon.
- Settings: ✕ and tapping outside now cancel and throw away changes. A clear "Save" button keeps them. Changes are made to a draft and only saved on Save.

## Files to change
- `src/app/App.tsx`: setup gate, star logic, tap mode, attempt logging, removing locked costumes
- `src/app/components/ParentSetup.tsx` (new)
- `src/app/components/CostumeCanvas.tsx`: remove the camera card, pill and banner; start the camera from saved settings; text-free top bar
- `src/app/components/CharacterBar.tsx`: artwork-only cards
- `src/app/components/VocabularyBanner.tsx`: replay button, captionless pictures, tap-to-answer
- `src/app/components/ListeningIndicator.tsx`: remove any visible text
- `src/app/components/ParentalGateModal.tsx`: new challenge and lockout
- `src/app/components/ParentSettingsModal.tsx`: draft, Save and Cancel; camera and mic section; Run setup again
- `src/app/components/ProgressReport.tsx`: read the new result labels
- `src/app/utils/speechService.ts`: permanent-denial stop and mic-unavailable callback
- `src/app/utils/parentSettings.ts`: new fields
- `src/app/utils/progressStore.ts`: new attempt shape and migration of old entries
- `src/app/data/characters.ts`: findCharacter rewrite, plus a test file
- `roadmap.md`

## Conflicts and decisions needed
1. **Tap mode for pictures.** Today the child picks a picture to start the word. With the mic off, a "tap the correct picture" quiz needs a target word first. Proposal: the narrator says "Press the fire engine" and the child taps one of the 3–4 pictures. Mic on stays as it is now (child picks, then says the word). Is that right?
2. **"Good try" threshold.** Today there are only two results, perfect and needs-practice. Proposal: clear = exact match first time; good try = a near-miss match, or a match on the second attempt; not yet = no match. Agree?
3. **Star counter vs session length.** The top-bar "0/5" counts costume rounds that end the session. Proposal: keep the session limit hidden in the background and show only stars earned as icons. OK?
4. **Child's name.** Should the narrator use it ("Well done, Mia!")? That needs one ElevenLabs fetch per name per voice (cached afterwards). Default: not used yet, stored for the report only.
5. **Rule conflicts in existing features** (flagged, not changed unless you say so): the "Premium pack" test switch, the padlock in Parent Settings and the Progress-tab upsell are fine because they are behind the gate. The Voice trainer modal and the session wrap-up screen contain child-visible text and emoji, and the wrap-up says "Go find Mommy or Daddy" on screen. Should I strip the text from those in this pass too? Proposal: yes for the wrap-up, leave the trainer (parent-only).
6. **Free vs premium tracking.** The rules say tracking is "for the premium report". Saving attempts for free users too means the report is full the moment they upgrade. Confirm that's fine.
