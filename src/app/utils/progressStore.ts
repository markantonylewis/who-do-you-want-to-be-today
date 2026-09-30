// Saves the child's word attempts on this device so parents can see progress over time.
export type AttemptKind = 'costume' | 'picture';
export interface Attempt {
  t: number; // timestamp (ms)
  s: string; // session id
  c: string; // costume id
  w: string; // word attempted
  k: AttemptKind;
  q: 'perfect' | 'needs-practice';
}

const KEY = 'whoami_progress_v1';
const MAX = 5000;
export const SESSION_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function getAttempts(): Attempt[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function recordAttempt(a: Omit<Attempt, 't' | 's'>) {
  if (typeof window === 'undefined') return;
  const all = getAttempts();
  all.push({ ...a, t: Date.now(), s: SESSION_ID });
  localStorage.setItem(KEY, JSON.stringify(all.slice(-MAX)));
}

export function clearAttempts() {
  localStorage.removeItem(KEY);
}

export type Period = 'session' | 'week' | 'month' | 'all';

export function splitByPeriod(all: Attempt[], period: Period): { current: Attempt[]; previous: Attempt[] } {
  if (period === 'session') {
    const ids = [...new Set(all.map((a) => a.s))];
    const last = ids[ids.length - 1];
    const prev = ids[ids.length - 2];
    return { current: all.filter((a) => a.s === last), previous: all.filter((a) => a.s === prev) };
  }
  if (period === 'all') return { current: all, previous: [] };
  const span = (period === 'week' ? 7 : 30) * 86400000;
  const now = Date.now();
  return {
    current: all.filter((a) => a.t > now - span),
    previous: all.filter((a) => a.t <= now - span && a.t > now - 2 * span),
  };
}

export function summarise(list: Attempt[]) {
  const total = list.length;
  const perfect = list.filter((a) => a.q === 'perfect').length;
  const byWord = new Map<string, { n: number; p: number }>();
  const costumes = new Map<string, number>();
  for (const a of list) {
    const w = byWord.get(a.w) || { n: 0, p: 0 };
    w.n++;
    if (a.q === 'perfect') w.p++;
    byWord.set(a.w, w);
    if (a.k === 'costume') costumes.set(a.c, (costumes.get(a.c) || 0) + 1);
  }
  const words = [...byWord.entries()].map(([word, v]) => ({ word, ...v, rate: v.p / v.n }));
  return {
    total,
    perfect,
    rate: total ? Math.round((perfect / total) * 100) : 0,
    sessions: new Set(list.map((a) => a.s)).size,
    strong: words.filter((w) => w.rate >= 0.75).sort((a, b) => b.n - a.n).slice(0, 6),
    practise: words.filter((w) => w.rate < 0.5).sort((a, b) => b.n - a.n).slice(0, 6),
    favourites: [...costumes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3),
  };
}
