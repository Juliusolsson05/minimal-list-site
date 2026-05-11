import { GoogleGenAI, Schema } from '@google/genai';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OR_TEXT_MODEL = 'google/gemini-2.5-flash';
const OR_IMAGE_MODEL = 'google/gemini-2.5-flash-image';
const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';

type Provider = 'openrouter' | 'gemini';

interface ProviderError {
  provider: Provider;
  message: string;
}

class AIProviderError extends Error {
  constructor(public errors: ProviderError[]) {
    super(`All AI providers failed: ${errors.map(e => e.provider).join(', ')}`);
  }
}

export interface GenerateJSONOptions {
  prompt: string;
  // Optional input image as a data URL (e.g. "data:image/jpeg;base64,...")
  imageDataUrl?: string;
  // Google Schema with Type.OBJECT etc. — converted internally for OpenRouter
  schema: Schema;
  // Identifier for OpenRouter's json_schema response_format
  schemaName?: string;
}

export interface GenerateImageOptions {
  prompt: string;
  // Input image as a data URL (e.g. "data:image/jpeg;base64,...")
  inputImageDataUrl?: string;
}

export async function generateJSON<T = unknown>(opts: GenerateJSONOptions): Promise<T> {
  const errors: ProviderError[] = [];

  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await callOpenRouterJSON<T>(opts);
    } catch (err) {
      errors.push({ provider: 'openrouter', message: errorMessage(err) });
      console.warn('OpenRouter JSON failed; trying Gemini fallback');
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGeminiJSON<T>(opts);
    } catch (err) {
      errors.push({ provider: 'gemini', message: errorMessage(err) });
    }
  }

  throw new AIProviderError(errors);
}

export async function generateImage(opts: GenerateImageOptions): Promise<string> {
  const errors: ProviderError[] = [];

  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await callOpenRouterImage(opts);
    } catch (err) {
      errors.push({ provider: 'openrouter', message: errorMessage(err) });
      console.warn('OpenRouter image failed; trying Gemini fallback');
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGeminiImage(opts);
    } catch (err) {
      errors.push({ provider: 'gemini', message: errorMessage(err) });
    }
  }

  throw new AIProviderError(errors);
}

async function callOpenRouterJSON<T>(opts: GenerateJSONOptions): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY!;

  const content: Array<Record<string, unknown>> = [];
  if (opts.imageDataUrl) {
    content.push({ type: 'image_url', image_url: { url: opts.imageDataUrl } });
  }
  content.push({ type: 'text', text: opts.prompt });

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OR_TEXT_MODEL,
      messages: [{ role: 'user', content }],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: opts.schemaName || 'response',
          strict: false,
          schema: googleSchemaToJsonSchema(opts.schema),
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter returned no content');
  return JSON.parse(text) as T;
}

async function callGeminiJSON<T>(opts: GenerateJSONOptions): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const ai = new GoogleGenAI({ apiKey });

  const parts: Array<Record<string, unknown>> = [];
  if (opts.imageDataUrl) {
    const { mimeType, data } = parseDataUrl(opts.imageDataUrl);
    parts.push({ inlineData: { mimeType, data } });
  }
  parts.push({ text: opts.prompt });

  const response = await ai.models.generateContent({
    model: GEMINI_TEXT_MODEL,
    contents: { parts: parts as never },
    config: {
      responseMimeType: 'application/json',
      responseSchema: opts.schema,
    },
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned no text');
  return JSON.parse(text) as T;
}

async function callOpenRouterImage(opts: GenerateImageOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY!;

  const content: Array<Record<string, unknown>> = [{ type: 'text', text: opts.prompt }];
  if (opts.inputImageDataUrl) {
    content.push({ type: 'image_url', image_url: { url: opts.inputImageDataUrl } });
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OR_IMAGE_MODEL,
      modalities: ['image', 'text'],
      messages: [{ role: 'user', content }],
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const url: string | undefined = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error('OpenRouter returned no image');
  return url;
}

async function callGeminiImage(opts: GenerateImageOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const ai = new GoogleGenAI({ apiKey });

  const parts: Array<Record<string, unknown>> = [];
  if (opts.inputImageDataUrl) {
    const { mimeType, data } = parseDataUrl(opts.inputImageDataUrl);
    parts.push({ inlineData: { mimeType, data } });
  }
  parts.push({ text: opts.prompt });

  const response = await ai.models.generateContent({
    model: GEMINI_IMAGE_MODEL,
    contents: { parts: parts as never },
  });

  const responseParts = response.candidates?.[0]?.content?.parts;
  if (responseParts) {
    for (const part of responseParts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error('Gemini returned no image');
}

// @google/genai's Type enum produces uppercase strings ("OBJECT", "STRING", etc.).
// JSON Schema (used by OpenRouter response_format) expects lowercase types.
function googleSchemaToJsonSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(googleSchemaToJsonSchema);
  if (schema && typeof schema === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema)) {
      if (key === 'type' && typeof value === 'string') {
        out[key] = value.toLowerCase();
      } else {
        out[key] = googleSchemaToJsonSchema(value);
      }
    }
    return out;
  }
  return schema;
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const [header, data] = dataUrl.split(',');
  const mimeType = header.split(';')[0].split(':')[1] || 'image/jpeg';
  return { mimeType, data };
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
