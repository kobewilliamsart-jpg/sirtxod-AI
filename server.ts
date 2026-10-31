import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'sirtxod-AI',
    version: '2.3.0',
    engine: 'local-browser-tts',
    quota: 'none',
  });
});

// App version endpoint for checking updates
app.get('/api/version', (req, res) => {
  res.json({
    version: '2.3.0',
    app: 'sirtxod-AI',
    buildDate: '2026-10-28',
    changelog: 'Free unlimited in-browser neural TTS (no API key, no quota). Word limit raised to 10,000.',
  });
});

async function startServer() {
  // Mount Vite middlewares in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`sirtxod-AI Neural TTS server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
