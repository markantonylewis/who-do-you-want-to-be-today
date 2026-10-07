import React, { useState } from 'react';
import { saveParentSettings, getParentSettings } from '../utils/parentSettings';
import { requestCamera, requestMic, isInIframe, hasSpeechRecognition } from '../utils/permissions';
import { primeNarratorAudio } from '../utils/speechService';

type Step = 'camera' | 'mic' | 'name';

/**
 * One-time grown-up setup, shown before the first game.
 * Big buttons sit at the bottom so it works one-handed in well under 30 seconds.
 */
export const ParentSetup: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [step, setStep] = useState<Step>('camera');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [name, setName] = useState(getParentSettings().childName || '');
  const embedded = typeof window !== 'undefined' && isInIframe();

  const choose = async (kind: 'camera' | 'mic', allow: boolean) => {
    primeNarratorAudio(); // this tap also switches sound on for iPhone
    setNote(null);
    let ok = false;
    if (allow) {
      setBusy(true);
      ok = kind === 'camera' ? await requestCamera() : hasSpeechRecognition() && (await requestMic());
      setBusy(false);
      if (!ok) {
        setNote(
          kind === 'camera'
            ? 'The camera is not available, so a cartoon face will wear the costumes. You can change this later in Parent Settings.'
            : 'The microphone is not available, so your child will tap pictures instead. You can change this later in Parent Settings.'
        );
      }
    }
    saveParentSettings(kind === 'camera' ? { cameraEnabled: ok } : { micEnabled: ok });
    if (allow && !ok) {
      setTimeout(() => setStep(kind === 'camera' ? 'mic' : 'name'), 2200);
    } else {
      setStep(kind === 'camera' ? 'mic' : 'name');
    }
  };

  const finish = () => {
    primeNarratorAudio();
    saveParentSettings({ childName: name.trim().slice(0, 20), setupComplete: true });
    onDone();
  };

  const stepIndex = ['camera', 'mic', 'name'].indexOf(step);
  const primary =
    'w-full py-4 rounded-2xl bg-amber-500 border-b-[6px] border-amber-700 text-white font-black text-lg active:translate-y-1 active:border-b-2 transition-transform disabled:opacity-60';
  const secondary =
    'w-full py-3.5 rounded-2xl bg-white border-2 border-b-[5px] border-slate-300 text-slate-700 font-black text-base active:translate-y-1 active:border-b-2 transition-transform';

  return (
    <div
      id="parent-setup"
      className="fixed inset-0 z-[60] bg-gradient-to-b from-amber-100 to-orange-100 flex flex-col text-slate-900"
    >
      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-4 max-w-md w-full mx-auto flex flex-col gap-4">
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? 'bg-amber-500' : 'bg-amber-200'}`} />
          ))}
        </div>
        <p className="text-xs font-black uppercase tracking-wider text-amber-800">Grown-up setup</p>

        {step === 'camera' && (
          <>
            <h1 className="text-2xl font-black">Use the camera?</h1>
            <p className="text-base">The costume is drawn on your child's face, like a filter.</p>
            {embedded && (
              <p className="text-sm bg-sky-50 border border-sky-200 rounded-xl p-3">
                This preview can't use the camera. Open the app in a new tab to allow it.
              </p>
            )}
          </>
        )}

        {step === 'mic' && (
          <>
            <h1 className="text-2xl font-black">Use the microphone?</h1>
            <p className="text-base">Your child says the words out loud. Without it, they tap the right picture instead.</p>
            <p className="text-sm text-slate-600">Speech is checked as it happens and never recorded.</p>
          </>
        )}

        {step === 'name' && (
          <>
            <h1 className="text-2xl font-black">Child's name</h1>
            <p className="text-base">Optional. Used only in your progress report.</p>
            <input
              id="setup-child-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="e.g. Mia"
              className="w-full px-4 py-3 text-lg rounded-xl border-2 border-amber-300 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </>
        )}

        {note && <p className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3">{note}</p>}
      </div>

      <div className="px-6 pb-8 pt-2 max-w-md w-full mx-auto flex flex-col gap-2.5">
        {(step === 'camera' || step === 'mic') && (
          <>
            <button id={`setup-allow-${step}`} className={primary} disabled={busy} onClick={() => choose(step, true)}>
              {step === 'camera' ? 'Allow camera' : 'Allow microphone'}
            </button>
            <button id={`setup-skip-${step}`} className={secondary} disabled={busy} onClick={() => choose(step, false)}>
              Not now
            </button>
          </>
        )}
        {step === 'name' && (
          <button id="setup-start" className={primary} onClick={finish}>
            Start playing
          </button>
        )}
      </div>
    </div>
  );
};
