# sirtxod-AI Neural TTS Studio (free, no quota)

Speech is generated **in the user's browser** with open-source models:
- English: Kokoro-82M (WebGPU, falls back to WASM)
- Other languages: Meta MMS-TTS via transformers.js

Models download once from the Hugging Face CDN and are cached by the browser. No API key, no server cost, no usage limits.

## Run
1. `npm install`
2. `npm run dev`

## Deploy
`npm run build` then `npm start` (or host `dist/` on any static host; the server only serves files and /api/version).
