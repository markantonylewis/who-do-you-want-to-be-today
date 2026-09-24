import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const IDS = ["firefighter", "police_officer", "builder", "doctor", "lion", "tiger", "dog", "dinosaur", "star"] as const;

export const interpretToddler = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      transcript: z.string().min(1).max(500),
      customWords: z.record(z.string(), z.array(z.string().max(60)).max(50)).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { characterId: null as string | null };
    const custom = Object.entries(data.customWords ?? {})
      .filter(([, w]) => w.length)
      .map(([id, w]) => `- ${id}: ${w.join(", ")}`)
      .join("\n");
    const prompt = `You help understand a 2-4 year old toddler in a dress-up voice app. They were asked "What would you like to be today?"
Allowed characters: firefighter (fireman, fire engine, wee-woo, fifi), police_officer (policeman, police car, popo, paman), builder (digger, hammer, bob, bida), doctor (docka, stethoscope), lion (roar, wion, waw), tiger (tigger, tiga, grr), dog (puppy, woof, doggy), dinosaur (dino, t-rex, nosa), star (twinkle; mic often hears "car", "tar", "are", "start").
${custom ? `Parent-trained pronunciations (strongly favor):\n${custom}\n` : ""}Toddler speech rules: dropped s-clusters, k/g -> t/d, r/l -> w, syllable deletion, sound effects.
Transcript: "${data.transcript}"
Reply ONLY with JSON: {"characterId": one of ${IDS.join(", ")} or null, "confidence": number, "understoodWord": string}. Use null if unrelated.`;
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) {
        console.error("AI gateway error", res.status, await res.text());
        return { characterId: null as string | null };
      }
      const json = await res.json();
      const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
      const id = IDS.includes(parsed.characterId) ? (parsed.characterId as string) : null;
      return { characterId: id };
    } catch (e) {
      console.error(e);
      return { characterId: null as string | null };
    }
  });
