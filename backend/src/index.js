import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import sessionRoutes from './routes/sessionRoutes.js';
import streamRoutes from './routes/streamRoutes.js';

// Load root .env or fallback to local directory
const rootEnv = path.resolve('..', '.env');
const localEnv = path.resolve('.env');
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else {
  dotenv.config({ path: localEnv });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded screenshots statically
app.use('/uploads', express.static(path.resolve('uploads')));

// Serve demo repo assets if needed
app.use('/demo-assets', express.static(path.resolve('..', 'examples', 'demo-bug-repo', 'assets')));

// API Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/sessions', streamRoutes);

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
