/**
 * Free, unlimited, in-browser text-to-speech.
 *
 * - English  -> Kokoro-82M (Apache-2.0), runs on WebGPU or WASM
 * - Others   -> Meta MMS-TTS via transformers.js (one small model per language)
 *
 * Models are downloaded once from the Hugging Face CDN and cached by the
 * browser, so there is no API key, no server cost and no usage quota.
 * Output is always a 24 kHz mono 16-bit WAV so the rest of the app
 * (IndexedDB, MP3 export, waveforms) works unchanged.
 */
import { stripSsmlTags } from './audioUtils';

export const OUTPUT_SAMPLE_RATE = 24000;

export type BaseVoice = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

export interface LocalTtsOptions {
  text: string;
  voiceName?: BaseVoice | string;
  language?: string; // BCP-47, e.g. en-US, es-ES
  speed?: number; // 0.5 - 2.0
  pitch?: number; // semitones, -12 .. +12
  onProgress?: (message: string, fraction?: number) => void;
  signal?: AbortSignal;
}

export interface LocalTtsResult {
  wav: ArrayBuffer;
  sampleRate: number;
  durationSeconds: number;
  engine: string;
}

// Gemini voice names -> closest Kokoro voices
const KOKORO_VOICE_MAP: Record<string, { us: string; gb: string }> = {
  Kore: { us: 'af_heart', gb: 'bf_emma' },
  Puck: { us: 'am_puck', gb: 'bm_lewis' },
  Fenrir: { us: 'am_fenrir', gb: 'bm_fable' },
  Zephyr: { us: 'af_sky', gb: 'bf_isabella' },
  Charon: { us: 'am_michael', gb: 'bm_george' },
};

// Language -> MMS-TTS model (Xenova ONNX conversions)
const MMS_MODELS: Record<string, string> = {
  es: 'Xenova/mms-tts-spa',
  fr: 'Xenova/mms-tts-fra',
  de: 'Xenova/mms-tts-deu',
  pt: 'Xenova/mms-tts-por',
  ru: 'Xenova/mms-tts-rus',
  ko: 'Xenova/mms-tts-kor',
  ar: 'Xenova/mms-tts-ara',
  hi: 'Xenova/mms-tts-hin',
  tr: 'Xenova/mms-tts-tur',
  vi: 'Xenova/mms-tts-vie',
  id: 'Xenova/mms-tts-ind',
  pl: 'Xenova/mms-tts-pol',
  nl: 'Xenova/mms-tts-nld',
  sv: 'Xenova/mms-tts-swe',
  it: 'Xenova/mms-tts-ita',
};

export function isLanguageSupported(langCode: string): boolean {
  const base = langCode.toLowerCase().split('-')[0];
  return base === 'en' || base in MMS_MODELS;
}

// ---------- model caches ----------
let kokoroPromise: Promise<any> | null = null;
const mmsPipelines = new Map<string, Promise<any>>();

async function getKokoro(onProgress?: LocalTtsOptions['onProgress']) {
  if (!kokoroPromise) {
    kokoroPromise = (async () => {
      const { KokoroTTS } = await import('kokoro-js');
      const hasWebGpu = typeof navigator !== 'undefined' && !!(navigator as any).gpu;
      const load = (device: 'webgpu' | 'wasm') =>
        KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
          dtype: device === 'webgpu' ? 'fp32' : 'q8',
          device,
          progress_callback: (p: any) => {
            if (p?.status === 'progress' && typeof p.progress === 'number') {
              onProgress?.(
                'Downloading voice model (one-time, cached afterwards)...',
                p.progress / 100
              );
            }
          },
        });
      try {
        return await load(hasWebGpu ? 'webgpu' : 'wasm');
      } catch (err) {
        if (hasWebGpu) return await load('wasm');
        throw err;
      }
    })().catch((err) => {
      kokoroPromise = null; // allow retry
      throw err;
    });
  }
  return kokoroPromise;
}

async function getMms(modelId: string, onProgress?: LocalTtsOptions['onProgress']) {
  if (!mmsPipelines.has(modelId)) {
    const p = (async () => {
      const { pipeline } = await import('@huggingface/transformers');
      return pipeline('text-to-speech', modelId, {
        dtype: 'fp32',
        progress_callback: (pr: any) => {
          if (pr?.status === 'progress' && typeof pr.progress === 'number') {
            onProgress?.('Downloading language model (one-time)...', pr.progress / 100);
          }
        },
      } as any);
    })().catch((err) => {
      mmsPipelines.delete(modelId);
      throw err;
    });
    mmsPipelines.set(modelId, p);
  }
  return mmsPipelines.get(modelId)!;
}

// ---------- helpers ----------
/** Split long text on sentence boundaries so we never hit model length limits. */
export function chunkText(text: string, maxChars = 280): string[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .trim()
    .match(/[^.!?。！？…]+[.!?。！？…]*\s*/g) || [text];
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if ((current + s).length > maxChars && current) {
      chunks.push(current.trim());
      current = '';
    }
    if (s.length > maxChars) {
      // very long sentence: split on commas / spaces
      const parts = s.match(new RegExp(`.{1,${maxChars}}(\\s|$)`, 'g')) || [s];
      parts.forEach((p) => chunks.push(p.trim()));
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

/** Linear resample (also used for pitch shifting). */
function resample(input: Float32Array, ratio: number): Float32Array {
  if (Math.abs(ratio - 1) < 1e-4) return input;
  const outLen = Math.max(1, Math.floor(input.length / ratio));
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = pos - i0;
    out[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return out;
}

function floatTo16(samples: Float32Array): Int16Array {
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function encodeWav(pcm: Int16Array[], sampleRate: number): ArrayBuffer {
  const total = pcm.reduce((n, c) => n + c.length, 0);
  const buffer = new ArrayBuffer(44 + total * 2);
  const view = new DataView(buffer);
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, 'RIFF');
  view.setUint32(4, 36 + total * 2, true);
  w(8, 'WAVE');
  w(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  w(36, 'data');
  view.setUint32(40, total * 2, true);
  let offset = 44;
  for (const c of pcm) {
    new Int16Array(buffer, offset, c.length).set(c);
    offset += c.length * 2;
  }
  return buffer;
}

const pause = (seconds: number) => new Int16Array(Math.floor(seconds * OUTPUT_SAMPLE_RATE));

// ---------- main entry ----------
export async function synthesizeLocal(opts: LocalTtsOptions): Promise<LocalTtsResult> {
  const {
    voiceName = 'Kore',
    language = 'en-US',
    speed = 1,
    pitch = 0,
    onProgress,
    signal,
  } = opts;

  const text = stripSsmlTags(opts.text) || opts.text;
  if (!text.trim()) throw new Error('Text prompt is required.');

  const baseLang = language.toLowerCase().split('-')[0];
  const pitchRatio = Math.pow(2, pitch / 12);
  // Pitch shifting by resampling also changes duration, so compensate in the model speed.
  const modelSpeed = Math.min(2, Math.max(0.5, speed / pitchRatio));

  const chunks = chunkText(text);
  const pcm: Int16Array[] = [];
  let engine = '';

  if (baseLang === 'en') {
    engine = 'Kokoro-82M (local)';
    onProgress?.('Loading voice model...', 0);
    const tts = await getKokoro(onProgress);
    const map = KOKORO_VOICE_MAP[voiceName as string] || KOKORO_VOICE_MAP.Kore;
    const voice = language.toLowerCase() === 'en-gb' ? map.gb : map.us;

    for (let i = 0; i < chunks.length; i++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      onProgress?.(`Synthesizing ${i + 1} / ${chunks.length}...`, i / chunks.length);
      const out = await tts.generate(chunks[i], { voice, speed: modelSpeed });
      const samples = resample(out.audio as Float32Array, (out.sampling_rate / OUTPUT_SAMPLE_RATE) * pitchRatio);
      pcm.push(floatTo16(samples));
      pcm.push(pause(/[.!?]$/.test(chunks[i]) ? 0.25 : 0.12));
    }
  } else {
    const modelId = MMS_MODELS[baseLang];
    if (!modelId) {
      throw new Error(
        `Offline synthesis for "${language}" isn't available yet. Use English or one of: ${Object.keys(
          MMS_MODELS
        ).join(', ')}.`
      );
    }
    engine = `${modelId} (local)`;
    onProgress?.('Loading language model...', 0);
    const synth = await getMms(modelId, onProgress);
    for (let i = 0; i < chunks.length; i++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      onProgress?.(`Synthesizing ${i + 1} / ${chunks.length}...`, i / chunks.length);
      const out = await synth(chunks[i]);
      // MMS has no speed control: fold speed into the resample ratio (changes pitch slightly).
      const ratio = (out.sampling_rate / OUTPUT_SAMPLE_RATE) * pitchRatio * (speed || 1);
      pcm.push(floatTo16(resample(out.audio as Float32Array, ratio)));
      pcm.push(pause(0.2));
    }
  }

  const wav = encodeWav(pcm, OUTPUT_SAMPLE_RATE);
  const durationSeconds = (wav.byteLength - 44) / 2 / OUTPUT_SAMPLE_RATE;
  return { wav, sampleRate: OUTPUT_SAMPLE_RATE, durationSeconds, engine };
}

// ---------- local voice analysis (replaces the Gemini "analyze-voice" call) ----------
export interface LocalVoiceProfile {
  pitchHz: number;
  pitchCategory: string;
  timbre: string;
  cadence: string;
  breathiness: string;
  recommendedBaseVoice: BaseVoice;
  personaPrompt: string;
  pitchShiftSemitones: number;
}

function detectPitch(frame: Float32Array, sr: number): number | null {
  const minLag = Math.floor(sr / 400);
  const maxLag = Math.floor(sr / 70);
  let energy = 0;
  for (let i = 0; i < frame.length; i++) energy += frame[i] * frame[i];
  if (energy / frame.length < 1e-5) return null;
  let best = 0;
  let bestLag = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i + lag < frame.length; i++) sum += frame[i] * frame[i + lag];
    if (sum > best) {
      best = sum;
      bestLag = lag;
    }
  }
  if (!bestLag || best / energy < 0.3) return null;
  return sr / bestLag;
}

export async function analyzeVoiceLocal(blob: Blob, speakerName: string): Promise<LocalVoiceProfile> {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  try {
    const audio = await ctx.decodeAudioData(await blob.arrayBuffer());
    const data = audio.getChannelData(0);
    const sr = audio.sampleRate;
    const frameSize = Math.floor(sr * 0.04);
    const hop = Math.floor(sr * 0.02);
    const pitches: number[] = [];
    let voiced = 0;
    let frames = 0;
    let zcrSum = 0;
    for (let s = 0; s + frameSize < data.length; s += hop) {
      frames++;
      const frame = data.subarray(s, s + frameSize);
      const p = detectPitch(frame, sr);
      if (p) {
        pitches.push(p);
        voiced++;
        let zc = 0;
        for (let i = 1; i < frame.length; i++) if (frame[i - 1] * frame[i] < 0) zc++;
        zcrSum += zc / frame.length;
      }
    }
    pitches.sort((a, b) => a - b);
    const median = pitches.length ? pitches[Math.floor(pitches.length / 2)] : 165;
    const voicedRatio = frames ? voiced / frames : 0.5;
    const brightness = voiced ? zcrSum / voiced : 0.05;

    const pitchCategory =
      median < 105 ? 'Deep Baritone' : median < 140 ? 'Warm Baritone/Tenor' : median < 185 ? 'Neutral Conversational' : median < 230 ? 'Warm Alto' : 'Bright Soprano';

    // Pick the closest base voice by typical fundamental frequency
    const voices: { name: BaseVoice; hz: number }[] = [
      { name: 'Fenrir', hz: 110 },
      { name: 'Charon', hz: 125 },
      { name: 'Puck', hz: 150 },
      { name: 'Kore', hz: 200 },
      { name: 'Zephyr', hz: 225 },
    ];
    const best = voices.reduce((a, b) => (Math.abs(b.hz - median) < Math.abs(a.hz - median) ? b : a));
    const shift = Math.max(-6, Math.min(6, Math.round(12 * Math.log2(median / best.hz))));

    const timbre = brightness > 0.12 ? 'Bright, airy with crisp upper harmonics' : brightness > 0.06 ? 'Balanced, clear resonance' : 'Warm, rounded, low-harmonic body';
    const cadence = voicedRatio > 0.6 ? 'Fast, continuous phrasing' : voicedRatio > 0.4 ? 'Steady conversational pacing' : 'Slow, deliberate pacing with pauses';

    return {
      pitchHz: Math.round(median),
      pitchCategory,
      timbre,
      cadence,
      breathiness: voicedRatio < 0.35 ? 'Breathy / soft-spoken' : 'Clean, forward',
      recommendedBaseVoice: best.name,
      pitchShiftSemitones: shift,
      personaPrompt: `Voice profile of ${speakerName}: ${pitchCategory.toLowerCase()} (~${Math.round(median)} Hz), ${timbre.toLowerCase()}, ${cadence.toLowerCase()}.`,
    };
  } finally {
    ctx.close().catch(() => {});
  }
}
