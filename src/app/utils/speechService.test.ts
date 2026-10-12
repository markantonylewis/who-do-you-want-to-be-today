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
  resetEchoGuard();
  return new ToddlerSpeechRecognizer();
}
function speech(text: string) {
  return { resultIndex: 0, results: [Object.assign([{ transcript: text, confidence: 0.9 }], { isFinal: true })] };
}

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
});