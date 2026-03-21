import React, { useState } from 'react';
import JDInput from './components/JDInput';
import ResumeDropzone from './components/ResumeDropzone';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsDashboard from './components/ResultsDashboard';
import { analyzeResumes } from './services/api';
import type { CandidateAnalysis } from './types';
import { useEffect, useState as useTypewriterState } from 'react';

const Typewriter: React.FC<{ text: string; delay?: number; startDelay?: number }> = ({ text, delay = 60, startDelay = 0 }) => {
  const [currentText, setCurrentText] = useTypewriterState('');
  const [currentIndex, setCurrentIndex] = useTypewriterState(0);
  const [isStarted, setIsStarted] = useTypewriterState(false);

  useEffect(() => {
    const mainTimeout = setTimeout(() => setIsStarted(true), startDelay);
    return () => clearTimeout(mainTimeout);
  }, [startDelay]);

  useEffect(() => {
    if (isStarted && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text, isStarted]);

  return <span>{currentText}{isStarted && currentIndex < text.length && <span className="animate-pulse bg-slate-900 w-1 h-5 inline-block align-middle ml-1" />}</span>;
};

type AppState = 'input' | 'loading' | 'results' | 'error';

const App: React.FC = () => {
  // ── Input State ──────────────────────────────────────────────────────────
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);

  // ── App State ─────────────────────────────────────────────────────────────
  const [appState, setAppState] = useState<AppState>('input');
  const [results, setResults] = useState<CandidateAnalysis[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Validation ─────────────────────────────────────────────────────────────
  const isReady =
    (jdText.trim().length > 20 || jdFile !== null) && resumeFiles.length > 0;

  // ── Analyze Handler ────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    setAppState('loading');
    setErrorMsg('');
    try {
      const response = await analyzeResumes(jdText, jdFile, resumeFiles);
      setResults(response.candidates);
      setAppState('results');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (err as Error).message ||
        'Analysis failed. Check the server is running and your GEMINI_API_KEY is set.';
      setErrorMsg(msg);
      setAppState('error');
    }
  };

  const handleReset = () => {
    setAppState('input');
    setResults([]);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen relative bg-slate-50">
      {/* ── Header / Navigation ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/vite.svg" className="w-8 h-8 pointer-events-none" alt="Vite Logo" />
            <span className="font-outfit font-bold text-xl tracking-tight text-slate-900">
              Resume<span className="text-blue-600">Screener</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Gemini branding removed as requested */}
          </div>
        </div>
      </nav>

      {/* ── Main Container ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        
        {/* ── Input Phase: Hero & Setup ───────────────────────────────────── */}
        {(appState === 'input' || appState === 'error') && (
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                ✨ AI-Powered Recruitment
              </div>
              <h1 className="text-5xl lg:text-7xl font-outfit font-black tracking-tight leading-[1.1] text-slate-950 mb-6 drop-shadow-sm">
                <Typewriter text="Hire smarter with" delay={50} /> <br/>
                <span className="gradient-text-light inline-block mt-2">
                  <Typewriter text="data-driven insights." delay={60} startDelay={1000} />
                </span>
              </h1>
              <p className="text-slate-500 text-lg lg:text-xl max-w-2xl leading-relaxed mb-10">
                Stop manual screening. Let our advanced AI analyze multiple resumes against your job description in seconds and identify your top performers.
              </p>
              
              {/* Feature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
                {[
                  { icon: '🎯', title: 'Precision Scoring', desc: 'Weighted matching aligned to your JD' },
                  { icon: '⚡', title: 'Instant Ranking', desc: 'Identify top candidates immediately' },
                  { icon: '💎', title: 'Actionable Insights', desc: 'Clear breakdown of strengths & gaps' },
                ].map((feature, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shadow-sm border border-slate-200">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{feature.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Action Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <JDInput
                    jdText={jdText}
                    jdFile={jdFile}
                    onTextChange={setJdText}
                    onFileChange={setJdFile}
                  />
                  <ResumeDropzone files={resumeFiles} onFilesChange={setResumeFiles} />
                </div>

                {/* Status & Analyze Column for Mobile */}
                <div className="lg:hidden space-y-6">
                  {appState === 'error' && <ErrorBanner msg={errorMsg} />}
                  <div className="flex flex-col items-center gap-4">
                    <AnalyzeButton isReady={isReady} count={resumeFiles.length} onClick={handleAnalyze} />
                    {!isReady && <ValidationHints jdText={jdText} jdFile={jdFile} count={resumeFiles.length} />}
                  </div>
                </div>
              </div>

              {/* Sidebar Action (Desktop) */}
              <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
                <div className="saas-card p-8 space-y-6">
                  <h3 className="font-outfit font-bold text-lg text-slate-900 border-b border-slate-100 pb-4">Review & Launch</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Job Description</span>
                      <span className={jdText || jdFile ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'}>
                        {jdText || jdFile ? '✓ Ready' : '○ Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Total Resumes</span>
                      <span className={resumeFiles.length > 0 ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'}>
                        {resumeFiles.length > 0 ? `✓ ${resumeFiles.length} Queue` : '○ Missing'}
                      </span>
                    </div>
                  </div>

                  {appState === 'error' && <ErrorBanner msg={errorMsg} />}

                  <div className="pt-2">
                    <AnalyzeButton isReady={isReady} count={resumeFiles.length} onClick={handleAnalyze} />
                  </div>
                  
                  {!isReady && <ValidationHints jdText={jdText} jdFile={jdFile} count={resumeFiles.length} />}
                </div>

                <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    "AI screening significantly reduces time-to-hire by automatically identifying relevant experience matches."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Loading Phase ────────────────────────────────────────────────── */}
        {appState === 'loading' && (
          <div className="min-h-[50vh] flex items-center justify-center animate-in fade-in zoom-in duration-500">
            <LoadingSpinner />
          </div>
        )}

        {/* ── Results Phase ─────────────────────────────────────────────────── */}
        {appState === 'results' && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <ResultsDashboard candidates={results} onReset={handleReset} />
          </div>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 mt-20">
        <div className="flex flex-col items-center justify-center">
          <a 
            href="https://github.com/Garvgoel23" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] hover:text-slate-900 transition-all duration-300"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
};

// ── Sub-components for cleaner App.tsx ─────────────────────────────────────

const AnalyzeButton: React.FC<{ isReady: boolean; count: number; onClick: () => void }> = ({ isReady, count, onClick }) => (
  <button
    id="analyze-btn"
    onClick={onClick}
    disabled={!isReady}
    className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5"
  >
    <span>Spark</span>
    {isReady
      ? `Analyze ${count} Resume${count !== 1 ? 's' : ''}`
      : 'Complete Setup'}
  </button>
);

const ErrorBanner: React.FC<{ msg: string }> = ({ msg }) => (
  <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
    <span className="text-red-500 text-xl shrink-0">⚠️</span>
    <div className="min-w-0 flex-1">
      <p className="text-red-700 font-bold text-xs uppercase tracking-wider mb-1">Analysis Failed</p>
      <p className="text-red-600 text-sm break-words">{msg}</p>
    </div>
  </div>
);

const ValidationHints: React.FC<{ jdText: string; jdFile: File | null; count: number }> = ({ jdText, jdFile, count }) => (
  <ul className="space-y-2 mt-4 border-t border-slate-100 pt-4">
    {(!jdText.trim() && !jdFile) && (
      <li className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        Add a brief job description
      </li>
    )}
    {jdText.trim().length > 0 && jdText.trim().length < 20 && (
      <li className="flex items-center gap-2 text-xs text-amber-600 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Description is a bit too short
      </li>
    )}
    {count === 0 && (
      <li className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        Upload at least one candidate resume
      </li>
    )}
  </ul>
);

export default App;
