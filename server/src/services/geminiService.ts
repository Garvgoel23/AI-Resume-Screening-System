import { GoogleGenAI } from '@google/genai';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CandidateAnalysis {
  candidateName: string;
  matchScore: number;        // 0–100
  keyStrengths: string[];    // 2–3 points
  keyGaps: string[];         // 2–3 points
  recommendation: 'Strong Fit' | 'Moderate Fit' | 'Not Fit';
}

interface ResumeInput {
  fileName: string;
  text: string;
}

// ── Gemini client (lazy singleton) ────────────────────────────────────────────
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }
  if (!client) {
    console.log(`🔑 Gemini (Multimodal Live SDK) initialized with key (${apiKey.substring(0, 12)}...)`);
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

// ── Retry helper for rate limits ──────────────────────────────────────────────
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Analyses multiple resumes against a job description using Gemini 3 Flash Preview.
 *
 * Uses the latest @google/genai SDK as requested.
 */
export async function analyzeResumesWithGemini(
  jdText: string,
  resumes: ResumeInput[]
): Promise<CandidateAnalysis[]> {
  const ai = getClient();
  const modelName = 'gemini-3-flash-preview';

  // Build the structured prompt
  const resumeBlocks = resumes
    .map((r, i) => `--- RESUME ${i + 1}: ${r.fileName} ---\n${r.text || '[No text could be extracted]'}`)
    .join('\n\n');

  const prompt = `
You are an expert technical recruiter and hiring manager.
Your task is to analyze each candidate resume against the provided Job Description.

INSTRUCTIONS:
- Return ONLY a valid JSON array. No markdown, no code fences, no extra text.
- Each object in the array must have EXACTLY these fields:
  {
    "candidateName": "Full name extracted from resume, or 'Unknown Candidate N' if not found",
    "matchScore": <integer 0-100 representing overall fit>,
    "keyStrengths": ["strength 1", "strength 2", "strength 3"],
    "keyGaps": ["gap 1", "gap 2", "gap 3"],
    "recommendation": "Strong Fit" | "Moderate Fit" | "Not Fit"
  }
- matchScore guidelines: 80-100 = Strong Fit, 50-79 = Moderate Fit, 0-49 = Not Fit
- recommendation must match the matchScore range above
- keyStrengths and keyGaps must each have 2-3 items, written as concise phrases
- Analyze ALL ${resumes.length} resumes provided

=== JOB DESCRIPTION ===
${jdText}

=== RESUMES TO ANALYZE ===
${resumeBlocks}
`.trim();

  // ── Retry loop with exponential backoff for rate limits ────────────────────
  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 10000; 

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      console.log(`🤖 Sending to Gemini [${modelName}] (attempt ${attempt}/${MAX_RETRIES + 1})...`);
      
      const result = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });

      // result.text is used in the new @google/genai SDK
      // If it fails, we fall back to generic text extraction
      const responseText = result.text || '';
      
      console.log('✅ Gemini response received, parsing JSON...');

      // Parse the JSON array
      let candidates: CandidateAnalysis[] = JSON.parse(responseText);

      if (!Array.isArray(candidates)) {
        throw new Error('Gemini did not return a JSON array as expected.');
      }

      // Sanitize and clamp entries
      candidates = candidates.map((c, i) => ({
        candidateName: c.candidateName || `Unknown Candidate ${i + 1}`,
        matchScore: Math.min(100, Math.max(0, Math.round(c.matchScore ?? 0))),
        keyStrengths: Array.isArray(c.keyStrengths) ? c.keyStrengths.slice(0, 3) : [],
        keyGaps: Array.isArray(c.keyGaps) ? c.keyGaps.slice(0, 3) : [],
        recommendation: (['Strong Fit', 'Moderate Fit', 'Not Fit'].includes(c.recommendation)
          ? c.recommendation
          : c.matchScore >= 80 ? 'Strong Fit' : c.matchScore >= 50 ? 'Moderate Fit' : 'Not Fit') as CandidateAnalysis['recommendation'],
      }));

      // Sort by score descending
      candidates.sort((a, b) => b.matchScore - a.matchScore);

      return candidates;
    } catch (err) {
      const error = err as Error;
      const isRateLimit = error.message.includes('429') || error.message.toLowerCase().includes('rate limit');
      const isModelError = error.message.includes('404') || error.message.includes('503');

      if ((isRateLimit || isModelError) && attempt <= MAX_RETRIES) {
        const delayMs = Math.min(BASE_DELAY_MS * attempt, 30000);
        console.warn(`⏳ API error [${modelName}]. Retrying in ${Math.round(delayMs / 1000)}s... (${error.message})`);
        await sleep(delayMs);
        continue;
      }

      console.error('❌ Gemini analysis failed definitively:', error.message);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  throw new Error('AI analysis failed after all retry attempts. Please try again later.');
}
