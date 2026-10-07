import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const VOICES: Record<string, string> = {
  us_woman: "EXAVITQu4vr4xnSDxMaL", // Sarah
  us_man: "iP95p4xoKVk53GoZ742B", // Chris
  uk_woman: "pFZP5JQG7iQjIQuC4Bku", // Lily
  uk_man: "JBFqnCBsd6RMkjVDRZzb", // George
  mark: "BN2oC5lFPoQBvCp33GzZ", // "Mark Lewis British Man" — the parent's own cloned voice
};

const Body = z.object({ text: z.string().min(1).max(600), voice: z.string().max(20) });

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

// Turn per-character timings into per-word timings (used by the echo guard).
function toWords(a: Alignment | undefined) {
  const out: { word: string; start: number; end: number }[] = [];
  if (!a?.characters) return out;
  let cur = "";
  let s = 0;
  let e = 0;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) out.push({ word: cur, start: s, end: e });
      cur = "";
    } else {
      if (!cur) s = a.character_start_times_seconds[i] ?? 0;
      cur += ch;
      e = a.character_end_times_seconds[i] ?? s;
    }
  });
  if (cur) out.push({ word: cur, start: s, end: e });
  return out;
}

export const Route = createFileRoute("/api/public/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["ELEVENLABS_API_KEY"];
        if (!key) return new Response("Voice service not connected", { status: 503 });
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Bad request", { status: 400 });
        const voiceId = VOICES[parsed.data.voice] ?? VOICES["us_woman"];
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: { "xi-api-key": key, "Content-Type": "application/json" },
            body: JSON.stringify({
              text: parsed.data.text,
              model_id: "eleven_turbo_v2_5",
              voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true, speed: 0.95 },
            }),
          },
        );
        if (!res.ok) {
          const err = await res.text();
          console.error(`ElevenLabs TTS failed [${res.status}]: ${err}`);
          return new Response(err, { status: res.status });
        }
        const data = (await res.json()) as { audio_base64: string; alignment?: Alignment };
        return Response.json(
          { audio: data.audio_base64, words: toWords(data.alignment) },
          { headers: { "Cache-Control": "public, max-age=86400" } },
        );
      },
    },
  },
});
