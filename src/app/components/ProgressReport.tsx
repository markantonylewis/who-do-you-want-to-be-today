// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { CHARACTERS } from '../data/characters';
import { getAttempts, clearAttempts, splitByPeriod, summarise, Period } from '../utils/progressStore';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'session', label: 'Last session' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'all', label: 'All time' },
];

export const ProgressReport: React.FC<{ childName?: string; period: Period; onPeriodChange: (p: Period) => void }> = ({
  childName,
  period,
  onPeriodChange,
}) => {
  const [version, setVersion] = useState(0);
  const all = useMemo(() => getAttempts(), [version]);
  const { current, previous } = splitByPeriod(all, period);
  const now = summarise(current);
  const before = summarise(previous);
  const change = previous.length ? now.rate - before.rate : null;
  const name = childName?.trim() || 'Your child';
  const costumeName = (id: string) => CHARACTERS.find((c) => c.id === id)?.name || id;

  const words = new Set(current.map((a) => a.w)).size;
  const sentence = !now.total
    ? `No words practised ${period === 'session' ? 'yet' : 'in this period'}. Play a session and the report will fill in.`
    : `${name} practised ${words} different word${words === 1 ? '' : 's'}${period !== 'session' ? ` across ${now.sessions} session${now.sessions === 1 ? '' : 's'}` : ''}. ` +
      (now.rate >= 70 ? 'Most words are coming out clearly.' : now.rate >= 35 ? 'Many words are getting clearer.' : 'Still practising, which is exactly how it should be.') +
      (change === null
        ? ''
        : change >= 10
          ? ' Words are getting clearer than in the period before.'
          : change <= -10
            ? ' A little less clear than before, which is normal from day to day.'
            : ' About the same as the period before.') +
      (now.favourites.length ? ` Favourite costume: ${costumeName(now.favourites[0][0])}.` : '');

  return (
    <div className="flex flex-col gap-4 py-1">
      <div className="flex flex-wrap gap-1.5">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => onPeriodChange(p.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black ${period === p.id ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <h3 className="font-black text-amber-950 mb-1">Report</h3>
        <p className="text-sm text-amber-950 leading-relaxed">{sentence}</p>
      </div>

      {now.total > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <h4 className="font-black text-emerald-900 text-sm mb-2">Said clearly</h4>
            {now.strong.length ? (
              <ul className="text-sm text-emerald-950 space-y-1">
                {now.strong.map((w) => <li key={w.word}>{w.word} <span className="opacity-60">({w.p}/{w.n})</span></li>)}
              </ul>
            ) : <p className="text-xs text-emerald-900">Keep playing to see strong words here.</p>}
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
            <h4 className="font-black text-sky-900 text-sm mb-2">Worth practising</h4>
            {now.practise.length ? (
              <ul className="text-sm text-sky-950 space-y-1">
                {now.practise.map((w) => <li key={w.word}>{w.word} <span className="opacity-60">({w.p}/{w.n})</span></li>)}
              </ul>
            ) : <p className="text-xs text-sky-900">Nothing tricky right now.</p>}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Progress is saved on this device only. It counts each first try at a costume name or picture word.
      </p>
      {all.length > 0 && (
        <button
          onClick={() => { if (confirm('Delete all saved progress on this device?')) { clearAttempts(); setVersion((v) => v + 1); } }}
          className="self-start text-xs font-black text-rose-700 underline"
        >
          Delete saved progress
        </button>
      )}
    </div>
  );
};
