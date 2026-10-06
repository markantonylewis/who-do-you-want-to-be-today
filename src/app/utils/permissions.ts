// Asks the browser for camera / microphone once, from a parent's tap.
// Returns true if allowed. Never throws: failures simply mean "off".

export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

async function ask(constraints: MediaStreamConstraints): Promise<boolean> {
  try {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

export const requestCamera = () => ask({ video: { facingMode: 'user' } });
export const requestMic = () => ask({ audio: true });

export function hasSpeechRecognition(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}
