import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const VOICES: Record<string, string> = {
  us_woman: "EXAVITQu4vr4xnSDxMaL", // Sarah
  us_man: "iP95p4xoKVk53GoZ742B", // Chris
  uk_woman: "pFZP5JQG7iQjIQuC4Bku", // Lily
  uk_man: "JBFqnCBsd6RMkjVDRZzb", // George
};

const Body = z.object({ text: z.string().min(1).max(600), voice: z.string().max(20) });

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env["ELEVENLABS_API_KEY"];
        if (!key) return new Response("Voice service not connected", { status: 503 });
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Bad request", { status: 400 });
        const voiceId = VOICES[parsed.data.voice] ?? VOICES["us_woman"];
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
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
        return new Response(res.body, {
          headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" },
        });
      },
    },
  },
});
