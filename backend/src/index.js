import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import sessionRoutes from './routes/sessionRoutes.js';
import streamRoutes from './routes/streamRoutes.js';
import webhookRoutes from './github/webhookHandler.js';
import authRoutes from './routes/authRoutes.js';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const candidateEnvFiles = [
  path.join(projectRoot, '.env'),
  path.resolve('.env'),
  path.resolve('..', '.env'),
  path.resolve('backend', '.env')
];

for (const envPath of candidateEnvFiles) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded screenshots statically
app.use('/uploads', express.static(path.resolve('uploads')));

// Serve demo repo assets if needed
app.use('/demo-assets', express.static(path.resolve('..', 'examples', 'demo-bug-repo', 'assets')));

// API Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/sessions', streamRoutes);
app.use('/api/github', webhookRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PatchBridge Backend Agent API',
    version: '1.0.0',
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PatchBridge Agent API running on http://localhost:${PORT}`);
});

export default app;
