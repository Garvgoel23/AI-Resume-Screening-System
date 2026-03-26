import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { analyzeRouter } from './routes/analyze';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables — override:true ensures .env always wins over shell env
dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'https://ai-resume-screening-system-pa7i.vercel.app', 'https://skill--match.vercel.app'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', analyzeRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Resume Analyzer API is running' });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   POST /api/upload-jd`);
  console.log(`   POST /api/upload-resumes`);
  console.log(`   POST /api/analyze`);
});

export default app;
