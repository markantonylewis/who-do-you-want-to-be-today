import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RecognitionSession } from './recognitionSession';

describe('play-session capture', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts once despite repeated resume calls during play', () => {
    const browser = { start: vi.fn(), abort: vi.fn() };
    const session = new RecognitionSession(browser);
    session.resume();
    session.onStart();
    for (let i = 0; i < 20; i++) session.resume();
    expect(browser.start).toHaveBeenCalledTimes(1);
    expect(browser.abort).not.toHaveBeenCalled();
  });

  it('backs off browser-ended sessions instead of restarting immediately', () => {
    const browser = { start: vi.fn(), abort: vi.fn() };
    const session = new RecognitionSession(browser);
    session.resume(); session.onStart(); session.onEnd();
    vi.advanceTimersByTime(499);
    expect(browser.start).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(browser.start).toHaveBeenCalledTimes(2);
    session.onStart(); session.onEnd();
    vi.advanceTimersByTime(999);
    expect(browser.start).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(browser.start).toHaveBeenCalledTimes(3);
  });

  it('cancels pending restarts when parent, hidden-tab or wrap-up pauses capture', () => {
    const browser = { start: vi.fn(), abort: vi.fn() };
    const session = new RecognitionSession(browser);
    session.resume(); session.onStart(); session.onEnd(); session.pause();
    vi.advanceTimersByTime(60_000);
    expect(browser.start).toHaveBeenCalledTimes(1);
    session.resume(); session.onStart(); session.pause(); session.onEnd();
    vi.advanceTimersByTime(60_000);
    expect(browser.start).toHaveBeenCalledTimes(2);
    expect(browser.abort).toHaveBeenCalledTimes(1);
  });

  it('waits for an abort to end before resuming once', () => {
    const browser = { start: vi.fn(), abort: vi.fn() };
    const session = new RecognitionSession(browser);
    session.resume(); session.onStart(); session.pause(); session.resume();
    expect(browser.start).toHaveBeenCalledTimes(1);
    session.onEnd(); vi.advanceTimersByTime(500);
    expect(browser.start).toHaveBeenCalledTimes(2);
  });
});