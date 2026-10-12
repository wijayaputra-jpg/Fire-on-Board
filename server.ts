import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory cache for synthesized audio clips
const audioCache = new Map<string, string>();

app.post('/api/tts', async (req, res) => {
  try {
    const { text, role, style } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    const isCaptain = role === 'captain';
    const voiceName = isCaptain ? 'Fenrir' : 'Kore';
    const defaultStyle = isCaptain
      ? 'Urgent, disciplined ship captain speaking into a marine VHF radio during an engine room fire emergency at sea, clear digit-by-digit coordinate recitation'
      : 'Calm, authoritative, professional maritime search and rescue coordination officer in an operations room';

    const cacheKey = `${role}:${text}`;
    if (audioCache.has(cacheKey)) {
      return res.json({
        audioBase64: audioCache.get(cacheKey),
        mimeType: 'audio/wav',
        cached: true,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: style || defaultStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('No audio data received from Gemini TTS model');
    }

    audioCache.set(cacheKey, base64Audio);

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      cached: false,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during TTS';
    const isRateLimited =
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('limit: 3');

    if (isRateLimited) {
      console.warn('Gemini TTS rate limit active. Delegating to client speech engine.');
      return res.status(200).json({
        fallback: true,
        rateLimited: true,
        message: 'Gemini free-tier quota reached, using client audio engine',
      });
    }

    console.warn('TTS warning:', errorMessage);
    return res.status(200).json({
      fallback: true,
      error: errorMessage,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
