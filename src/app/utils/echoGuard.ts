// Echo guard: lets the child talk over the narrator ("barge-in") without the
// narrator's own voice, picked up by the microphone, ever counting as the child.
//
// - While a prompt is playing (and ECHO_MARGIN_MS after), any heard word that is
//   part of the prompt is dropped, except "guard" words (the target word or a
//   costume name), which are allowed outside the moments the narrator says them.
// - Those moments come from word timings (ElevenLabs timestamps or the device
//   voice's word events), widened by ECHO_MARGIN_MS. With no timings yet, guard
//   words are blocked for the whole prompt.

/** Extra time after the narrator says a guarded word; raise for Bluetooth speakers. */
export const ECHO_MARGIN_MS = 600;

export interface WordTiming {
  word: string;
  start: number; // seconds from audio start
  end: number;
}

interface Win {
  s: number;
  e: number;
}

const state = {
  active: false,
  untimed: false,
  endAt: -Infinity,
  windows: [] as Win[],
  promptSet: new Set<string>(),
  guardSet: new Set<string>(),
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function beginPrompt(text: string, guardWords: string[], now: number) {
  state.active = true;
  state.untimed = true;
  state.windows = [];
  const promptTokens = tokenize(text);
  state.promptSet = new Set(promptTokens);
  const guard = new Set<string>();
  guardWords.forEach((w) => tokenize(w).forEach((t) => guard.add(t)));
  // Only guard words that are actually in this prompt matter for timing.
  state.guardSet = new Set(promptTokens.filter((t) => guard.has(t)));
}

/** Word timings from the natural voice; t0 = moment playback started. */
export function setWordTimings(words: WordTiming[], t0: number) {
  if (!state.active) return;
  state.untimed = false;
  for (const w of words) {
    if (tokenize(w.word).some((t) => state.guardSet.has(t))) {
      state.windows.push({ s: t0 + w.start * 1000 - 150, e: t0 + w.end * 1000 + ECHO_MARGIN_MS });
    }
  }
}

/** Device voice: a word is being spoken right now. */
export function markWordSpoken(word: string, now: number, rate = 1) {
  if (!state.active) return;
  state.untimed = false;
  if (tokenize(word).some((t) => state.guardSet.has(t))) {
    const est = (Math.max(3, word.length) * 90) / (rate || 1);
    state.windows.push({ s: now - 150, e: now + est + ECHO_MARGIN_MS });
  }
}

export function endPrompt(now: number) {
  if (!state.active) return;
  if (state.untimed && state.guardSet.size > 0) state.windows.push({ s: now - 1, e: now + ECHO_MARGIN_MS });
  state.active = false;
  state.untimed = false;
  state.endAt = now;
}

export function isPromptLive(now: number) {
  return state.active || now <= state.endAt + ECHO_MARGIN_MS;
}

export function isGuardBlocked(now: number) {
  return (state.active && state.untimed) || state.windows.some((w) => now >= w.s && now <= w.e);
}

/** Tokens of a heard transcript that may be the child's own words. */
export function childTokens(transcript: string, now: number): string[] {
  const toks = tokenize(transcript);
  if (!isPromptLive(now)) return toks;
  const blocked = isGuardBlocked(now);
  return toks.filter((t) => !state.promptSet.has(t) || (state.guardSet.has(t) && !blocked));
}

/** Test helper. */
export function resetEchoGuard() {
  state.active = false;
  state.untimed = false;
  state.endAt = -Infinity;
  state.windows = [];
  state.promptSet = new Set();
  state.guardSet = new Set();
}
