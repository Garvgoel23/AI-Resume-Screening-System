import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import JDInput from './components/JDInput';
import ResumeDropzone from './components/ResumeDropzone';
import LoadingSpinner from './components/LoadingSpinner';
import ResultsDashboard from './components/ResultsDashboard';
import { analyzeResumes } from './services/api';
import type { CandidateAnalysis } from './types';
import { useTheme } from './contexts/ThemeContext';
import { Sparkles, Target, Zap, Gem, AlertTriangle, Check, Circle, Sun, Moon, ArrowRight } from 'lucide-react';

// ── Typewriter Component ────────────────────────────────────
const Typewriter: React.FC<{ text: string; delay?: number; startDelay?: number }> = ({ text, delay = 60, startDelay = 0 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

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

  return (
    <span>
      {currentText}
      {isStarted && currentIndex < text.length && (
        <span className="cursor-blink inline-block w-[3px] h-[1em] ml-1 align-middle" style={{ background: 'var(--accent-blue)' }} />
      )}
    </span>
  );
};

// ── GitHub Icon SVG ─────────────────────────────────────────
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

// SunIcon / MoonIcon now come from lucide-react import above

type AppState = 'input' | 'loading' | 'results' | 'error';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const inputSectionRef = useRef<HTMLDivElement>(null);

  // ── Input State ────────────────────────────────────────────
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);

  // ── App State ──────────────────────────────────────────────
  const [appState, setAppState] = useState<AppState>('input');
  const [results, setResults] = useState<CandidateAnalysis[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Validation ─────────────────────────────────────────────
  const isReady =
    (jdText.trim().length > 20 || jdFile !== null) && resumeFiles.length > 0;

  // ── Analyze Handler ────────────────────────────────────────
  const handleAnalyze = async () => {
    setAppState('loading');
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const scrollToInput = () => {
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* ── Navigation ──────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 w-full backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--bg-nav)',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            className="flex items-center gap-3 cursor-pointer bg-transparent border-none p-0"
            onClick={handleReset}
            title="Go to Home"
            style={{ outline: 'none' }}
          >
            <img src="/vite.svg" className="w-8 h-8" alt="Logo" />
            <span
              className="font-bold text-xl tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)' }}
            >
              Skill<span className="gradient-text">Match</span>
            </span>
          </button>

          <div className="flex items-center gap-4">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              id="theme-toggle"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={18} />}
            </button>
            <button className="get-started-pill nav-pill hidden sm:flex items-center gap-2" onClick={scrollToInput}>
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">

        {/* ── Input Phase: Hero & Setup ─────────────────────── */}
        {(appState === 'input' || appState === 'error') && (
          <div className="space-y-20 animate-fade-in-up">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl px-8 py-16 lg:py-24 lg:px-16">
              <div className="hero-gradient-bg" />
              <div className="relative z-10 max-w-3xl">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--accent-blue)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Sparkles size={14} /> AI-Powered Recruitment
                </div>

                <h1
                  className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6"
                  style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
                >
                  <Typewriter text="Hire smarter with" delay={50} />
                  <br />
                  <span className="gradient-text inline-block mt-3">
                    <Typewriter text="data-driven insights." delay={60} startDelay={1000} />
                  </span>
                </h1>

                <p
                  className="text-lg lg:text-xl max-w-2xl leading-relaxed mb-12"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Stop manual screening. Let our advanced AI analyze multiple resumes against your job description in seconds and identify your top performers.
                </p>

                <button
                  className="get-started-pill flex items-center gap-2.5"
                  onClick={scrollToInput}
                >
                  <span className="pill-dot" />
                  Get Started
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: <Target size={22} />, title: 'Precision Scoring', desc: 'Weighted matching aligned to your JD requirements' },
                { icon: <Zap size={22} />, title: 'Instant Ranking', desc: 'Identify top candidates in seconds, not hours' },
                { icon: <Gem size={22} />, title: 'Actionable Insights', desc: 'Clear breakdown of strengths & skill gaps' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="feature-card animate-fade-in-up"
                  style={{ animationDelay: `${i * 150}ms`, opacity: 0, animationFillMode: 'forwards' }}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <h3
                    className="font-bold text-base mb-2"
                    style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Main Action Area */}
            <div ref={inputSectionRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start scroll-mt-24">
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

                {/* Mobile CTA */}
                <div className="lg:hidden space-y-6">
                  {appState === 'error' && <ErrorBanner msg={errorMsg} />}
                  <div className="flex flex-col items-center gap-4">
                    <AnalyzeButton isReady={isReady} count={resumeFiles.length} onClick={handleAnalyze} />
                    {!isReady && <ValidationHints jdText={jdText} jdFile={jdFile} count={resumeFiles.length} />}
                  </div>
                </div>
              </div>

              {/* Sidebar (Desktop) */}
              <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
                <div className="saas-card p-8 space-y-6">
                  <h3
                    className="font-bold text-lg pb-4"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border-primary)',
                    }}
                  >
                    Review & Launch
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }} className="font-medium">Job Description</span>
                      <span
                        className="font-bold"
                        style={{ color: jdText || jdFile ? 'var(--accent-blue)' : 'var(--text-muted)' }}
                      >
                        {jdText || jdFile ? <><Check size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Ready</> : <><Circle size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Missing</>}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }} className="font-medium">Total Resumes</span>
                      <span
                        className="font-bold"
                        style={{ color: resumeFiles.length > 0 ? 'var(--accent-blue)' : 'var(--text-muted)' }}
                      >
                        {resumeFiles.length > 0 ? <><Check size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {resumeFiles.length} Queue</> : <><Circle size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Missing</>}
                      </span>
                    </div>
                  </div>

                  {appState === 'error' && <ErrorBanner msg={errorMsg} />}

                  <div className="pt-2">
                    <AnalyzeButton isReady={isReady} count={resumeFiles.length} onClick={handleAnalyze} />
                  </div>

                  {!isReady && <ValidationHints jdText={jdText} jdFile={jdFile} count={resumeFiles.length} />}
                </div>

                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: 'rgba(59, 130, 246, 0.06)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                  }}
                >
                  <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--accent-blue)' }}>
                    "AI screening significantly reduces time-to-hire by automatically identifying relevant experience matches."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Loading Phase ──────────────────────────────────── */}
        {appState === 'loading' && (
          <div className="min-h-[60vh] pt-16 flex items-center justify-center animate-fade-in">
            <LoadingSpinner />
          </div>
        )}

        {/* ── Results Phase ──────────────────────────────────── */}
        {appState === 'results' && (
          <div className="animate-fade-in-up">
            <ResultsDashboard candidates={results} onReset={handleReset} />
          </div>
        )}
      </main>

      {/* ── Footer (ru-ok.in style) ──────────────────────────── */}
      <footer
        className="mt-20 py-16 px-6"
        style={{
          borderTop: '1px solid var(--border-primary)',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
          {/* Large Outline Title */}
          <h2 className="footer-outline-text">SkillMatch</h2>

          {/* Tagline */}
          <p className="text-base max-w-md" style={{ color: 'var(--text-secondary)' }}>
            AI-powered resume screening platform built with precision
          </p>

          {/* Built By */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Built by
            </span>
            <a
              href="https://github.com/Garvgoel23"
              target="_blank"
              rel="noopener noreferrer"
              title="Garvgoel23"
            >
              <img
                src="https://github.com/Garvgoel23.png"
                alt="Garvgoel23"
                className="footer-avatar"
              />
            </a>
          </div>

          {/* Source Button */}
          <a
            href="https://github.com/Garvgoel23/AI-Resume-Screening-System"
            target="_blank"
            rel="noopener noreferrer"
            className="source-btn"
          >
            <GitHubIcon />
            Source
          </a>

          {/* Copyright */}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2026 All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────

const AnalyzeButton: React.FC<{ isReady: boolean; count: number; onClick: () => void }> = ({ isReady, count, onClick }) => (
  <button
    id="analyze-btn"
    onClick={onClick}
    disabled={!isReady}
    className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5"
  >
    <Zap size={18} />
    {isReady
      ? `Analyze ${count} Resume${count !== 1 ? 's' : ''}`
      : 'Complete Setup'}
  </button>
);

const ErrorBanner: React.FC<{ msg: string }> = ({ msg }) => (
  <div
    className="p-4 rounded-xl flex items-start gap-3"
    style={{
      background: 'var(--badge-weak-bg)',
      border: '1px solid var(--badge-weak-border)',
    }}
  >
    <AlertTriangle size={20} className="shrink-0" style={{ color: 'var(--badge-weak-text)' }} />
    <div className="min-w-0 flex-1">
      <p className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--badge-weak-text)' }}>Analysis Failed</p>
      <p className="text-sm break-words" style={{ color: 'var(--badge-weak-text)' }}>{msg}</p>
    </div>
  </div>
);

const ValidationHints: React.FC<{ jdText: string; jdFile: File | null; count: number }> = ({ jdText, jdFile, count }) => (
  <ul className="space-y-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
    {(!jdText.trim() && !jdFile) && (
      <li className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
        Add a brief job description
      </li>
    )}
    {jdText.trim().length > 0 && jdText.trim().length < 20 && (
      <li className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--badge-moderate-text)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--badge-moderate-text)' }} />
        Description is a bit too short
      </li>
    )}
    {count === 0 && (
      <li className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
        Upload at least one candidate resume
      </li>
    )}
  </ul>
);

export default App;
