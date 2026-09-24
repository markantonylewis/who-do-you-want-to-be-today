// @ts-nocheck -- migrated from AI Studio; strict typing to be tightened later
// Haptic feedback utility utilizing the Web Vibration API for tactile toddler engagement
import { isHapticsEnabled, isSensoryCalm } from './parentSettings';

/**
 * Checks if the browser and device support the Vibration API.
 */
export function isHapticsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  );
}

/**
 * Executes a vibration pattern with sensory adaptation and safety checks.
 * @param pattern Single duration in ms or array of [vibrate, pause, vibrate, ...]
 */
export function triggerHaptic(pattern: number | number[]): boolean {
  if (!isHapticsEnabled()) return false;
  if (!isHapticsSupported()) return false;

  try {
    const calm = isSensoryCalm();

    // Scale patterns slightly down if parent selected "Calm / Low-Sensory Mode"
    let finalPattern: number | number[];
    if (calm) {
      if (typeof pattern === 'number') {
        finalPattern = Math.max(15, Math.round(pattern * 0.55));
      } else {
        finalPattern = pattern.map((ms, idx) => {
          // Only scale down active vibration pulses (even indices), keep pauses readable
          return idx % 2 === 0 ? Math.max(15, Math.round(ms * 0.55)) : ms;
        });
      }
    } else {
      finalPattern = pattern;
    }

    return navigator.vibrate(finalPattern);
  } catch (err) {
    // Graceful fallback if device policy or permissions restrict vibration
    console.debug('Haptic feedback not available or blocked by system:', err);
    return false;
  }
}

/**
 * Tactile feedback when a child successfully taps/selects a character costume card.
 * Crisp, playful double-tap that mimics magical costume transformation.
 */
export function hapticCharacterTap(): void {
  triggerHaptic([45, 35, 55]);
}

/**
 * Tactile feedback when a child presses an action picture (e.g. 🚒 Drive fire engines).
 * Clear, satisfying single click vibration for immediate tactile confirmation.
 */
export function hapticActionPress(): void {
  triggerHaptic(50);
}

/**
 * Tactile feedback when a child completes a full vocabulary round.
 * Celebratory fanfare rhythm to boost sensory engagement and reward perseverance.
 */
export function hapticRoundComplete(): void {
  triggerHaptic([60, 40, 80, 40, 130]);
}

/**
 * Tactile feedback when child successfully repeats a target word (or passes repeat stage).
 * Positive, encouraging burst.
 */
export function hapticRepeatSuccess(): void {
  triggerHaptic([40, 30, 60]);
}

/**
 * Subtle tactile tick for interactive micro-interactions (e.g. costume tray close/open).
 */
export function hapticGentleTick(): void {
  triggerHaptic(25);
}
