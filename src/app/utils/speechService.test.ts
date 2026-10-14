import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/toddler.functions', () => ({ interpretToddler: vi.fn() }));
import { interpretToddler } from '@/lib/toddler.functions';
import { ToddlerSpeechRecognizer } from './speechService';
import { resetEchoGuard } from './echoGuard';

class BrowserRecognition {
  static instance: BrowserRecognition;
  start = vi.fn();
  abort = vi.fn();
  onresult?: (event: unknown) => Promise<void>;
  onend?: () => void;
  onerror?: (event: { error: string }) => void;
  constructor() { BrowserRecognition.instance = this; }
}

function createRecognizer() {
  vi.stubGlobal('window', { SpeechRecognition: BrowserRecognition });
  vi.stubGlobal('localStorage', { getItem: () => null });
  resetEchoGuard();
  heard = [];
  return new ToddlerSpeechRecognizer();
}
// Continuous session: each new utterance is appended after the earlier ones.
let heard: unknown[] = [];
function speech(text: string, isFinal = true) {
  heard.push(Object.assign([{ transcript: text, confidence: 0.9 }], { isFinal }));
  return { resultIndex: heard.length - 1, results: [...heard] };
}
/** The browser re-sends an earlier (still open) utterance. */
function resend(index: number) { return { resultIndex: index, results: [...heard] }; }

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); vi.clearAllMocks(); });

describe('game listener routing', () => {
  it('changes costume and word listeners without starting or stopping browser capture per prompt', async () => {
    const rec = createRecognizer();
    const choice = vi.fn(); const word = vi.fn();
    rec.resumeSession();
    rec.start(choice);
    await BrowserRecognition.instance.onresult?.(speech('lion'));
    expect(choice).toHaveBeenCalledTimes(1);
    rec.clearListener();
    await BrowserRecognition.instance.onresult?.(speech('lion'));
    expect(choice).toHaveBeenCalledTimes(1);
    expect(rec.heardSpeech).toBe(false);
    rec.startActionWordListener('digger', word);
    await BrowserRecognition.instance.onresult?.(speech('digger'));
    expect(word).toHaveBeenCalledWith('perfect');
    expect(BrowserRecognition.instance.start).toHaveBeenCalledTimes(1);
    expect(BrowserRecognition.instance.abort).not.toHaveBeenCalled();
  });

  it('drops delayed interpretation from an abandoned costume listener', async () => {
    const rec = createRecognizer(); const old = vi.fn(); const next = vi.fn();
    let resolve: (data: { characterId: string }) => void = () => {};
    vi.mocked(interpretToddler).mockReturnValueOnce(new Promise((r) => { resolve = r; }) as never);
    rec.start(old);
    const pending = BrowserRecognition.instance.onresult?.(speech('unmatched chatter'));
    rec.clearListener(); rec.start(next);
    resolve({ characterId: 'lion' }); await pending;
    expect(old).not.toHaveBeenCalled(); expect(next).not.toHaveBeenCalled();
  });

  it('does not restart a microphone that became unavailable', () => {
    vi.useFakeTimers();
    const rec = createRecognizer(); const unavailable = vi.fn(); rec.onUnavailable = unavailable;
    rec.resumeSession();
    BrowserRecognition.instance.onerror?.({ error: 'not-allowed' });
    BrowserRecognition.instance.onend?.(); rec.resumeSession();
    vi.advanceTimersByTime(60_000);
    expect(rec.unavailable).toBe(true);
    expect(unavailable).toHaveBeenCalledTimes(1);
    expect(BrowserRecognition.instance.start).toHaveBeenCalledTimes(1);
  });

  it('ignores speech that started before a new listener activated', async () => {
    const rec = createRecognizer(); const choice = vi.fn();
    rec.start(vi.fn());
    await BrowserRecognition.instance.onresult?.(speech('fireman', false));
    rec.start(choice);
    await BrowserRecognition.instance.onresult?.(resend(0));
    expect(choice).not.toHaveBeenCalled();
    await BrowserRecognition.instance.onresult?.(speech('lion'));
    expect(choice).toHaveBeenCalledTimes(1);
  });

  it('does not re-pick the current costume by voice while the question is playing', async () => {
    const { beginPrompt, endPrompt } = await import('./echoGuard');
    const rec = createRecognizer(); const choice = vi.fn();
    rec.start(choice, undefined, 'firefighter');
    beginPrompt('What else would you like to be today', ['fireman'], performance.now());
    await BrowserRecognition.instance.onresult?.(speech('fireman'));
    expect(choice).not.toHaveBeenCalled();
    endPrompt(performance.now() - 5000);
    await BrowserRecognition.instance.onresult?.(speech('fireman'));
    expect(choice).toHaveBeenCalledTimes(1);
  });
});
