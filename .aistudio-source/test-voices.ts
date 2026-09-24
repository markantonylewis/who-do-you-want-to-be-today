import assert from 'assert';
import {
  resolveVoiceForCuratedId,
  parseVoiceId,
  isMaleVoiceName,
  isFemaleVoiceName,
  isUkVoice,
  isUsVoice,
  CURATED_GOOGLE_VOICES,
  CuratedVoiceId,
} from './src/utils/speechService';

console.log('=== RUNNING VOICE RESOLUTION TESTS ===');

// Mock SpeechSynthesisVoice helper
function mockVoice(name: string, lang: string, voiceURI = name): SpeechSynthesisVoice {
  return {
    name,
    lang,
    voiceURI,
    default: false,
    localService: true,
  } as unknown as SpeechSynthesisVoice;
}

// 1. Test Gender Detection Helpers
console.log('\nTest Suite 1: Gender String Detection');
assert.strictEqual(isFemaleVoiceName('Google UK English Female'), true, 'Google UK English Female must be female');
assert.strictEqual(isMaleVoiceName('Google UK English Female'), false, 'Google UK English Female must NOT be male');

assert.strictEqual(isMaleVoiceName('Google UK English Male'), true, 'Google UK English Male must be male');
assert.strictEqual(isFemaleVoiceName('Google UK English Male'), false, 'Google UK English Male must NOT be female');

assert.strictEqual(isFemaleVoiceName('Google US English'), false, 'Google US English has no explicit female in name');
assert.strictEqual(isMaleVoiceName('Google US English'), false, 'Google US English has no male in name');

assert.strictEqual(isMaleVoiceName('uk_man'), true, 'uk_man is male');
assert.strictEqual(isFemaleVoiceName('uk_man'), false, 'uk_man is not female');
assert.strictEqual(isFemaleVoiceName('uk_woman'), true, 'uk_woman is female');
assert.strictEqual(isMaleVoiceName('uk_woman'), false, 'uk_woman is not male');

assert.strictEqual(isMaleVoiceName('us_man'), true, 'us_man is male');
assert.strictEqual(isFemaleVoiceName('us_man'), false, 'us_man is not female');
assert.strictEqual(isFemaleVoiceName('us_woman'), true, 'us_woman is female');
assert.strictEqual(isMaleVoiceName('us_woman'), false, 'us_woman is not male');

console.log('✔ Gender string detection passed perfectly!');

// 2. Test Voice ID Parsing
console.log('\nTest Suite 2: Voice ID Parsing');
assert.strictEqual(parseVoiceId('uk_man'), 'uk_man');
assert.strictEqual(parseVoiceId('uk_woman'), 'uk_woman');
assert.strictEqual(parseVoiceId('us_man'), 'us_man');
assert.strictEqual(parseVoiceId('us_woman'), 'us_woman');

// Test legacy / full voice names
assert.strictEqual(parseVoiceId('Google UK English Female'), 'uk_woman');
assert.strictEqual(parseVoiceId('Google UK English Male'), 'uk_man');
assert.strictEqual(parseVoiceId('Google US English'), 'us_woman');
assert.strictEqual(parseVoiceId('Puck'), 'us_man');
assert.strictEqual(parseVoiceId('Fenrir'), 'uk_man');
assert.strictEqual(parseVoiceId('Aoede'), 'uk_woman');
assert.strictEqual(parseVoiceId('Kore'), 'us_woman');
console.log('✔ Voice ID parsing passed perfectly!');

// 3. Test Standard Chrome Environment
console.log('\nTest Suite 3: Chrome Desktop Voices (The user reported scenario)');
const standardChromeVoices = [
  mockVoice('Microsoft David - English (United States)', 'en-US'),
  mockVoice('Microsoft Zira - English (United States)', 'en-US'),
  mockVoice('Google US English', 'en-US'),
  mockVoice('Google UK English Female', 'en-GB'),
  mockVoice('Google UK English Male', 'en-GB'),
];

// Test uk_woman
const ukWomanRes = resolveVoiceForCuratedId('uk_woman', standardChromeVoices);
console.log('uk_woman resolved to:', ukWomanRes.voice?.name, 'pitch:', ukWomanRes.pitch);
assert.strictEqual(ukWomanRes.voice?.name, 'Google UK English Female');
assert.strictEqual(ukWomanRes.pitch, 1.0);

// Test uk_man -> MUST NOT BE UK English Female!
const ukManRes = resolveVoiceForCuratedId('uk_man', standardChromeVoices);
console.log('uk_man resolved to:', ukManRes.voice?.name, 'pitch:', ukManRes.pitch);
assert.notStrictEqual(ukManRes.voice?.name, 'Google UK English Female', 'uk_man must NEVER resolve to Google UK English Female!');
assert.strictEqual(ukManRes.voice?.name, 'Google UK English Male', 'uk_man must resolve to Google UK English Male!');
assert.strictEqual(ukManRes.pitch, 1.0);

// Test us_man -> MUST BE A REAL US ENGLISH MAN VOICE!
const usManRes = resolveVoiceForCuratedId('us_man', standardChromeVoices);
console.log('us_man resolved to:', usManRes.voice?.name, 'pitch:', usManRes.pitch);
assert.notStrictEqual(usManRes.voice?.name, 'Google UK English Female', 'us_man must NEVER resolve to Google UK English Female!');
assert.notStrictEqual(usManRes.voice?.name, 'Google US English', 'us_man must NEVER resolve to Google US English (which is a woman)!');
assert.strictEqual(usManRes.voice?.name, 'Microsoft David - English (United States)', 'us_man must resolve to an authentic US English Man voice (e.g. David)!');
assert.strictEqual(usManRes.pitch, 1.0);

// Test us_woman
const usWomanRes = resolveVoiceForCuratedId('us_woman', standardChromeVoices);
console.log('us_woman resolved to:', usWomanRes.voice?.name, 'pitch:', usWomanRes.pitch);
assert.strictEqual(usWomanRes.voice?.name, 'Google US English');
assert.strictEqual(usWomanRes.pitch, 1.0);

console.log('✔ Chrome Desktop environment passed with 100% distinction!');

// 4. Test Environment with Dedicated Google US Male voice (e.g. Android / ChromeOS)
console.log('\nTest Suite 4: Android / ChromeOS with Dedicated Google US Male Voice');
const androidGoogleVoices = [
  mockVoice('Google US English', 'en-US'),
  mockVoice('Google US English Male', 'en-US'),
  mockVoice('Google UK English Female', 'en-GB'),
  mockVoice('Google UK English Male', 'en-GB'),
];

const androidUkMan = resolveVoiceForCuratedId('uk_man', androidGoogleVoices);
assert.strictEqual(androidUkMan.voice?.name, 'Google UK English Male');
assert.strictEqual(androidUkMan.pitch, 1.0);

const androidUsMan = resolveVoiceForCuratedId('us_man', androidGoogleVoices);
assert.strictEqual(androidUsMan.voice?.name, 'Google US English Male');
assert.strictEqual(androidUsMan.pitch, 1.0);

const androidUkWoman = resolveVoiceForCuratedId('uk_woman', androidGoogleVoices);
assert.strictEqual(androidUkWoman.voice?.name, 'Google UK English Female');

const androidUsWoman = resolveVoiceForCuratedId('us_woman', androidGoogleVoices);
assert.strictEqual(androidUsWoman.voice?.name, 'Google US English');

console.log('✔ Android/ChromeOS environment passed!');

// 5. Test Non-Microsoft OS Voices (e.g. macOS Alex / Daniel)
console.log('\nTest Suite 5: macOS Native Voices');
const macVoices = [
  mockVoice('Alex', 'en-US'),
  mockVoice('Samantha', 'en-US'),
  mockVoice('Daniel', 'en-GB'),
  mockVoice('Fiona', 'en-GB'),
];

const macUkMan = resolveVoiceForCuratedId('uk_man', macVoices);
assert.strictEqual(macUkMan.voice?.name, 'Daniel');

const macUsMan = resolveVoiceForCuratedId('us_man', macVoices);
assert.strictEqual(macUsMan.voice?.name, 'Alex');

const macUkWoman = resolveVoiceForCuratedId('uk_woman', macVoices);
assert.strictEqual(macUkWoman.voice?.name, 'Fiona');

const macUsWoman = resolveVoiceForCuratedId('us_woman', macVoices);
assert.strictEqual(macUsWoman.voice?.name, 'Samantha');

console.log('✔ macOS native voices passed!');

// 6. Test Fallback when only female Google voices are present
console.log('\nTest Suite 6: Edge Case - Only Female Google Voices present');
const onlyFemaleGoogleVoices = [
  mockVoice('Google US English', 'en-US'),
  mockVoice('Google UK English Female', 'en-GB'),
];

const fallbackUkMan = resolveVoiceForCuratedId('uk_man', onlyFemaleGoogleVoices);
console.log('fallback uk_man resolved to:', fallbackUkMan.voice?.name, 'pitch:', fallbackUkMan.pitch);
// Even if forced to use the only UK voice available, pitch MUST be deepened to 0.80 to sound male!
assert.strictEqual(fallbackUkMan.pitch, 0.80, 'Must pitch-shift down to male register when only female voice exists');

const fallbackUsMan = resolveVoiceForCuratedId('us_man', onlyFemaleGoogleVoices);
console.log('fallback us_man resolved to:', fallbackUsMan.voice?.name, 'pitch:', fallbackUsMan.pitch);
// When only female voices exist, never force a female voice onto US English Man
assert.strictEqual(fallbackUsMan.voice, null, 'Never force a female voice onto US English Man');

// 7. Verify Gemini TTS mapping in CURATED_GOOGLE_VOICES
console.log('\nTest Suite 7: Gemini TTS Prebuilt Voices');
assert.strictEqual(CURATED_GOOGLE_VOICES.find(v => v.id === 'us_woman')?.geminiVoice, 'Kore');
assert.strictEqual(CURATED_GOOGLE_VOICES.find(v => v.id === 'us_man')?.geminiVoice, 'Puck');
assert.strictEqual(CURATED_GOOGLE_VOICES.find(v => v.id === 'uk_woman')?.geminiVoice, 'Aoede');
assert.strictEqual(CURATED_GOOGLE_VOICES.find(v => v.id === 'uk_man')?.geminiVoice, 'Fenrir');
console.log('✔ Gemini TTS mapping verified (US Woman: Kore, US Man: Puck, UK Woman: Aoede, UK Man: Fenrir)!');

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! No voices default to UK English Woman incorrectly.');
