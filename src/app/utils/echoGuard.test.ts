import { describe, it, expect, beforeEach } from 'vitest';
import { beginPrompt, setWordTimings, endPrompt, childTokens, markWordSpoken, resetEchoGuard, ECHO_MARGIN_MS } from './echoGuard';

const PROMPT = "You're a fireman. Can you say fireman?";
const words = [
  { word: "You're", start: 0, end: 0.3 },
  { word: 'a', start: 0.3, end: 0.4 },
  { word: 'fireman.', start: 0.4, end: 1.0 },
  { word: 'Can', start: 1.2, end: 1.4 },
  { word: 'you', start: 1.4, end: 1.5 },
  { word: 'say', start: 1.5, end: 1.7 },
  { word: 'fireman?', start: 1.7, end: 2.3 },
];

describe('echo guard', () => {
  beforeEach(() => resetEchoGuard());

  it('drops prompt words like "can you say" while the narrator talks', () => {
    beginPrompt(PROMPT, ['fireman'], 0);
    setWordTimings(words, 0);
    expect(childTokens('can you say', 1600)).toEqual([]);
  });

  it('blocks the target word while the narrator says it (plus margin)', () => {
    beginPrompt(PROMPT, ['fireman'], 0);
    setWordTimings(words, 0);
    expect(childTokens('fireman', 800)).toEqual([]);
    expect(childTokens('fireman', 1000 + ECHO_MARGIN_MS - 10)).toEqual([]);
  });

  it('accepts an early target word between the narrator saying it', () => {
    beginPrompt(PROMPT, ['fireman'], 0);
    setWordTimings(words, 0);
    // 1000 + 600 = 1600 end of first window; second starts at 1550 → gap? use 1000ms window check later
    beginPrompt("You're a fireman. Now look at the pictures here.", ['fireman'], 0);
    setWordTimings(words.slice(0, 3), 0);
    expect(childTokens('fireman', 2500)).toEqual(['fireman']);
    expect(childTokens("you're a fireman", 2500)).toEqual(['fireman']);
  });

  it('blocks guard words for the whole prompt when there are no timings', () => {
    beginPrompt(PROMPT, ['fireman'], 0);
    expect(childTokens('fireman', 500)).toEqual([]);
    endPrompt(3000);
    expect(childTokens('fireman', 3000 + ECHO_MARGIN_MS - 10)).toEqual([]);
    expect(childTokens('fireman', 3000 + ECHO_MARGIN_MS + 10)).toEqual(['fireman']);
  });

  it('lets other words through (they are the child, not the narrator)', () => {
    beginPrompt(PROMPT, ['fireman'], 0);
    setWordTimings(words, 0);
    expect(childTokens('dinosaur', 500)).toEqual(['dinosaur']);
  });

  it('uses device word events when there are no timestamps', () => {
    beginPrompt(PROMPT, ['fireman'], 0);
    markWordSpoken('fireman', 400);
    expect(childTokens('fireman', 600)).toEqual([]);
    expect(childTokens('fireman', 3000)).toEqual(['fireman']);
  });
});
