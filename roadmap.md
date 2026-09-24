# Roadmap

## Migrate "Who Am I Today?" from AI Studio (in progress)

Source: AI Studio app — voice-first costume dress-up + vocabulary adventure for toddlers.
- Real-time AR face filters (camera permission)
- Voice interaction (microphone permission)
- Server-side Gemini API (AI captions/vocabulary coaching)

### Tasks
- [x] Get the AI Studio source code (copied from Who_do_you_want_to_be repo)
- [x] Assess the source (framework, file structure, how Gemini is called)
- [x] Map AI Studio pieces to this stack (React 19 + TanStack Start + Tailwind v4)
  - AR face filters → MediaPipe Face Landmarker in browser (dynamically imported, client-only)
  - Gemini calls → Lovable AI Gateway server-side (key stays server-side)
  - Voice → browser speech APIs / Lovable AI speech-to-text
- [x] Rebuild app at `/` (replace placeholder index route)
- [ ] Verify camera + mic flows in preview
- [ ] Optional: warm AI narrator voice (currently device voice)
