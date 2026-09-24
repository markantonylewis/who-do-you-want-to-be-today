import http from 'http';
import path from 'path';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Toddler Speech Interpretation endpoint
app.post('/api/interpret-toddler', async (req, res) => {
  try {
    const { transcript, customWords } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Missing transcript' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ characterId: null, message: 'No Gemini key' });
    }

    let customContext = '';
    if (customWords && typeof customWords === 'object') {
      const entries = Object.entries(customWords)
        .filter(([_, words]) => Array.isArray(words) && words.length > 0)
        .map(([id, words]) => `- ${id}: ${(words as string[]).join(', ')}`);
      if (entries.length > 0) {
        customContext = `\nParent-Trained Custom Pronunciations for this Toddler:\n${entries.join('\n')}\nIf the toddler transcript matches or resembles any of these trained words, strongly favor that character!`;
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are helping understand a 2 to 4-year-old toddler in a dress-up costume voice app.
The child was asked: "What would you like to be today?"
The ONLY allowed character options are:
- "firefighter" (e.g. fireman, firemen, fire engine, water hose, ladder, fifi, fia, wee-woo, pieman)
- "police_officer" (e.g. policeman, policemen, police car, badge, whistle, cop, popo, paman)
- "builder" (e.g. builder, digger, hammer, bricks, construction, bob, bida, bobo, digga, ham)
- "doctor" (e.g. doctor, plaster, stethoscope, thermometer, doc, docka, dada, medic)
- "lion" (e.g. lion, roar, rawr, simba, mane, big cat, waw, wion, kitty)
- "tiger" (e.g. tiger, tigger, stripes, jungle cat, grr, tiga)
- "dog" (e.g. dog, puppy, pup, doggy, woof, bark, bow-wow, dodo)
- "dinosaur" (e.g. dinosaur, dino, t-rex, rawr, spikes, stegosaurus, dida, nosa)
- "star" (e.g. star, twinkle, twinkle star, little star, sky, yellow star, shine, tar, car, sta, ta)
${customContext}

The toddler said (transcribed by mic): "${transcript}".

Task: Identify which of the 9 character options best matches what the child said.
CRITICAL LINGUISTIC RULES FOR TODDLER SPEECH:
1. High-pitch misrecognition: Google Speech Recognition frequently transcribes a child's high-pitch "star" as "car", "are", "tar", "bar", or "start". Match these to "star".
2. Fronting & Cluster Reduction: Toddlers drop 's' from consonant blends ("tar" for star, "pider" for spider), or turn 'k'/'g' into 't'/'d' ("docka" -> "docta").
3. Gliding: Toddlers substitute 'w' for 'r' or 'l' ("wion" / "waw" for lion, "tiga" for tiger).
4. Syllable deletion: "paman" -> policeman, "nosa" -> dinosaur.
5. Sound effects: "wee-woo" -> firefighter, "woof" -> dog, "roar"/"rawr" -> lion or dinosaur, "grr" -> tiger.

If the transcript reasonably matches one of the 9 character concepts, return that characterId.
If it is completely unrelated (e.g. "banana", "cookie", "spaceship", "mama", "no"), return null for characterId.

Return valid JSON:
{
  "characterId": "firefighter" | "police_officer" | "builder" | "doctor" | "lion" | "tiger" | "dog" | "dinosaur" | "star" | null,
  "confidence": number,
  "understoodWord": string
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error interpreting toddler speech:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
});

// In-memory cache for generated TTS audio to ensure zero-latency replays
const ttsAudioCache = new Map<string, string>();

// Gemini TTS endpoint for warm kid voice
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing text' });
    }

    const cacheKey = `${voice}:${text.trim().toLowerCase()}`;
    if (ttsAudioCache.has(cacheKey)) {
      return res.json({ audio: ttsAudioCache.get(cacheKey) });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({ error: 'Gemini API key not configured' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Say with a warm, gentle, friendly smile in an expressive storytelling tone for a preschool toddler: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }, // 'Kore' is warm, maternal, natural and soothing
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Cache up to 100 phrases
      if (ttsAudioCache.size > 100) {
        const firstKey = ttsAudioCache.keys().next().value;
        if (firstKey) ttsAudioCache.delete(firstKey);
      }
      ttsAudioCache.set(cacheKey, base64Audio);
      return res.json({ audio: base64Audio });
    }

    return res.status(500).json({ error: 'No audio generated' });
  } catch (err: any) {
    console.error('Error generating TTS:', err);
    return res.status(500).json({ error: err.message || 'TTS generation failed' });
  }
});

// Set up WebSocket Server for Gemini Live API
const wss = new WebSocketServer({ server, path: '/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to /live WebSocket');

  const ai = getGeminiClient();
  if (!ai) {
    clientWs.send(JSON.stringify({
      type: 'error',
      message: 'GEMINI_API_KEY not configured on server',
    }));
    return;
  }

  let liveSession: any = null;

  try {
    liveSession = await ai.live.connect({
      model: 'gemini-3.1-flash-live-preview',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
        },
        systemInstruction: `You are the cheerful, warm, loving voice guide in "Who Am I Today?", an interactive dress-up app for a 3-year-old child who cannot read.
Your tone is warm, upbeat, patient, and full of joy.
Guidelines:
1. Speak in very short, punchy sentences (3-8 words each).
2. Never speak baby talk or condescend; speak with pure delight.
3. The app library has 9 characters:
   - Occupations: fireman, policeman, builder, doctor
   - Animals: lion, tiger, dog, dinosaur
   - Sky: star
4. In turn 1, greet warmly: "What would you like to be today?"
5. When the child picks a character, cheer and say the vocabulary sentence clearly.
6. When asking the child to repeat an action or item (for example, "squirt water hoses"), ALWAYS and ONLY ask for the singular noun: "Can you say water hose?" NEVER ask them to repeat verbs, sound effects, or action phrases. Only ask about the noun!
7. Praise warmly ("Well done!") and offer simple praise.
8. If the child mentions something outside the library, gently guide them back:
   "Hmm, I don't know that one yet! Do you want to be a fireman, a policeman, a builder, a doctor, a lion, a tiger, a dog, a dinosaur, or a star?"`,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          try {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'audio', audio: audioData }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }
          } catch (e) {
            console.error('Error forwarding Live API message:', e);
          }
        },
        onclose: () => {
          console.log('Gemini Live session closed');
        },
        onerror: (err: any) => {
          console.error('Gemini Live error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'error', message: err?.message || 'Live API error' }));
          }
        },
      },
    });

    clientWs.on('message', (rawData) => {
      try {
        const parsed = JSON.parse(rawData.toString());
        if (parsed.type === 'audio' && parsed.audio && liveSession) {
          liveSession.sendRealtimeInput({
            audio: {
              data: parsed.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (parsed.type === 'text' && parsed.text && liveSession) {
          liveSession.sendRealtimeInput({
            text: parsed.text,
          });
        }
      } catch (err) {
        console.error('Error handling client message:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('Client disconnected from /live');
      if (liveSession && typeof liveSession.close === 'function') {
        liveSession.close();
      }
    });

  } catch (err: any) {
    console.error('Failed to establish Gemini Live connection:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'error',
        message: err?.message || 'Could not connect to Gemini Live',
      }));
    }
  }
});

// Vite Middleware for Dev vs Static Serve for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Who Am I Today server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
