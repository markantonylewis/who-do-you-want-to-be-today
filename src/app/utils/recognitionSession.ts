/** Owns browser capture only; changing game listeners never starts/stops capture. */
export class RecognitionSession {
  private wanted = false;
  private state: 'idle' | 'starting' | 'running' | 'stopping' = 'idle';
  private retry: ReturnType<typeof setTimeout> | null = null;
  private delay = 500;
  private startedAt = 0;

  constructor(private recognition: { start(): void; abort(): void }) {}

  resume() {
    if (this.wanted) return;
    this.wanted = true;
    this.delay = 500;
    if (this.state === 'idle') this.startCapture();
  }

  pause() {
    this.wanted = false;
    if (this.retry !== null) clearTimeout(this.retry);
    this.retry = null;
    if (this.state === 'starting' || this.state === 'running') {
      this.state = 'stopping';
      try { this.recognition.abort(); } catch { this.state = 'idle'; }
    }
  }

  onStart() {
    if (!this.wanted) {
      this.state = 'stopping';
      try { this.recognition.abort(); } catch { this.state = 'idle'; }
      return;
    }
    this.state = 'running';
    this.startedAt = Date.now();
  }

  onEnd() {
    if (this.state === 'running' && Date.now() - this.startedAt >= 10_000) this.delay = 500;
    this.state = 'idle';
    if (this.wanted) this.scheduleRestart();
  }

  private scheduleRestart() {
    if (this.retry !== null || !this.wanted) return;
    this.retry = setTimeout(() => {
      this.retry = null;
      this.startCapture();
    }, this.delay);
    this.delay = Math.min(this.delay * 2, 8_000);
  }

  private startCapture() {
    if (!this.wanted || this.state !== 'idle') return;
    this.state = 'starting';
    try { this.recognition.start(); } catch {
      this.state = 'idle';
      this.scheduleRestart();
    }
  }
}