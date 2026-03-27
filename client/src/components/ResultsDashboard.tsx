import React, { useMemo } from 'react';
import CandidateCard from './CandidateCard';
import type { CandidateAnalysis } from '../types';
import { Target, RotateCcw, Star, TrendingUp, Users } from 'lucide-react';

// ── Radial Score Chart ──────────────────────────────────────
const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316'];

const RadialScoreChart: React.FC<{ data: { name: string; score: number }[] }> = ({ data }) => {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 14;
  const gap = 4;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, i) => {
          const radius = (size / 2) - (strokeWidth + gap) * i - strokeWidth;
          if (radius < 20) return null;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (item.score / 100) * circumference;
          const color = CHART_COLORS[i % CHART_COLORS.length];

          return (
            <g key={item.name}>
              {/* Track */}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke="var(--border-primary)"
                strokeWidth={strokeWidth}
                opacity={0.4}
              />
              {/* Score Arc */}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
              />
            </g>
          );
        })}
        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text-primary)" fontSize="22" fontWeight="900" fontFamily="'Outfit', sans-serif">
          {data.length}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontWeight="700" letterSpacing="0.1em">
          CANDIDATES
        </text>
      </svg>

      {/* Legend */}
      <div className="w-full space-y-2">
        {data.map((item, i) => {
          const color = CHART_COLORS[i % CHART_COLORS.length];
          return (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
              </div>
              <span className="font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>{item.score}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ResultsDashboardProps {
  candidates: CandidateAnalysis[];
  onReset: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ candidates, onReset }) => {
  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [candidates]);

  const chartData = useMemo(() => {
    return sortedCandidates.map(c => ({
      name: c.candidateName || 'Unknown',
      score: c.matchScore || 0,
    }));
  }, [sortedCandidates]);

  const bestCandidate = sortedCandidates[0];
  const avgScore = Math.round(
    sortedCandidates.reduce((acc, c) => acc + (c.matchScore || 0), 0) / (sortedCandidates.length || 1)
  );

  const fitCounts = useMemo(() => {
    return sortedCandidates.reduce((acc, c) => {
      acc[c.recommendation] = (acc[c.recommendation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [sortedCandidates]);

  if (!candidates || candidates.length === 0) return (
    <div className="saas-card p-12 text-center">
      <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No candidates to display. Please try again.</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in-up">

      {/* ── Dashboard Header ── */}
      <div
        className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <Target size={12} /> Rank Analysis Complete
          </div>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tight leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
          >
            Meet your <span className="gradient-text">Top Talent.</span>
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            AI has processed {candidates.length} candidates. We've identified the best matches based on technical proficiency, experience density, and requirement alignment.
          </p>
        </div>
        <button
          onClick={onReset}
          className="btn-secondary px-6 py-3 flex items-center justify-center gap-2 font-bold text-sm"
        >
          <RotateCcw size={16} /> New Analysis
        </button>
      </div>

      {/* ── Top Level Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Best Candidate - Accent Card */}
        <div
          className="saas-card p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-indigo))',
            border: 'none',
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 -z-10" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-inner" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}><Star size={22} /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Highest Potential</p>
              <p className="text-lg font-bold truncate" style={{ fontFamily: "'Outfit', sans-serif", color: '#ffffff' }}>{bestCandidate?.candidateName}</p>
              <p className="text-xs font-bold mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{bestCandidate?.matchScore}% Match Score</p>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="saas-card saas-card-hover p-8">
          <div className="flex items-start gap-5">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            ><TrendingUp size={22} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Batch Quality</p>
              <p className="text-3xl font-black" style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)' }}>{avgScore}%</p>
              <p className="text-[10px] font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>Average compatibility</p>
            </div>
          </div>
        </div>

        {/* Strong Fits */}
        <div className="saas-card saas-card-hover p-8">
          <div className="flex items-start gap-5">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            ><Users size={22} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Elite Matches</p>
              <p className="text-3xl font-black" style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)' }}>{fitCounts['Strong Fit'] || 0}</p>
              <p className="text-[10px] font-bold italic mt-1" style={{ color: 'var(--badge-strong-text)' }}>Recommended for hire</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Candidates & Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3
              className="text-xl font-black tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif", color: 'var(--text-primary)' }}
            >
              Candidate Performance Ranking
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total: {candidates.length} Scored</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {sortedCandidates.map((candidate, index) => (
              <CandidateCard key={candidate.candidateName} candidate={candidate} rank={index + 1} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Chart */}
          <div className="saas-card p-6">
            <h4
              className="text-sm font-bold mb-6 pb-3 uppercase tracking-wider"
              style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)' }}
            >
              Score Distribution
            </h4>
            <RadialScoreChart data={chartData} />
          </div>

          {/* Verdict Summary */}
          <div className="saas-card p-6" style={{ background: 'var(--bg-elevated)' }}>
            <h4 className="text-sm font-bold mb-6 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Verdict Summary</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>Strong Fits</span>
                <span
                  className="px-2 py-1 rounded font-black"
                  style={{ background: 'var(--accent-blue)', color: '#ffffff' }}
                >
                  {fitCounts['Strong Fit'] || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>Moderate Fits</span>
                <span
                  className="px-2 py-1 rounded font-black"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
                >
                  {fitCounts['Moderate Fit'] || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>Not Fit</span>
                <span
                  className="px-2 py-1 rounded font-black"
                  style={{ background: 'var(--badge-weak-bg)', color: 'var(--badge-weak-text)', border: '1px solid var(--badge-weak-border)' }}
                >
                  {fitCounts['Not Fit'] || 0}
                </span>
              </div>
            </div>
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <p className="text-[10px] italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                "AI recommendation engine identifies {bestCandidate?.candidateName} as the primary choice for this role with exceptional alignment."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
