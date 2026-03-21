import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import CandidateCard from './CandidateCard';
import type { CandidateAnalysis } from '../types';

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
      <p className="text-slate-500 font-medium">No candidates to display. Please try again.</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-200/60">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-[10px] font-bold uppercase tracking-widest mb-4">
            🎯 Rank Analysis Complete
          </div>
          <h2 className="text-4xl md:text-5xl font-outfit font-black text-slate-950 tracking-tight leading-tight">
            Meet your <span className="text-slate-500 underline decoration-slate-200 decoration-4 underline-offset-4">Top Talent.</span>
          </h2>
          <p className="text-slate-500 mt-4 text-base font-medium leading-relaxed">
            AI has processed {candidates.length} candidates. We've identified the best matches based on technical proficiency, experience density, and requirement alignment.
          </p>
        </div>
        <button
          onClick={onReset}
          className="btn-secondary px-6 py-3 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all font-bold text-sm"
        >
          <span>↺</span> New Analysis
        </button>
      </div>

      {/* ── Top Level Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="saas-card p-8 bg-slate-950 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-8 -mt-8 -z-10" />
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-xl shadow-inner text-white">⭐</div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Highest Potential</p>
              <p className="text-lg font-outfit font-bold text-white truncate">{bestCandidate?.candidateName}</p>
              <p className="text-xs font-bold text-slate-300 mt-1">{bestCandidate?.matchScore}% Match Score</p>
            </div>
          </div>
        </div>

        <div className="saas-card p-8 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xl text-slate-900 border border-slate-200">📈</div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Batch Quality</p>
              <p className="text-3xl font-outfit font-black text-slate-950">{avgScore}%</p>
              <p className="text-[10px] font-medium text-slate-500 mt-1">Average compatibility</p>
            </div>
          </div>
        </div>

        <div className="saas-card p-8 border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xl text-slate-900 border border-slate-200">👥</div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Elite Matches</p>
              <p className="text-3xl font-outfit font-black text-slate-950">{fitCounts['Strong Fit'] || 0}</p>
              <p className="text-[10px] font-medium text-slate-500 mt-1 font-bold italic text-emerald-600">Recommended for hire</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Visual Insights Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-outfit font-black text-slate-950 tracking-tight">Candidate Performance Ranking</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total: {candidates.length} Scored</span>
              </div>
           </div>
           
           <div className="grid grid-cols-1 gap-6">
             {sortedCandidates.map((candidate, index) => (
               <CandidateCard key={candidate.candidateName} candidate={candidate} rank={index + 1} />
             ))}
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
           {/* Chart summary */}
           <div className="saas-card p-6 bg-white border-slate-200">
             <h4 className="text-sm font-bold text-slate-950 mb-4 border-b border-slate-100 pb-3 uppercase tracking-wider">Score Distribution</h4>
             <div className="h-[240px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 4, 4]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#0f172a' : '#94a3b8'} />
                      ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
             <p className="text-[10px] text-slate-500 mt-4 leading-relaxed text-center font-medium">
                Distribution of candidate match scores based on JD requirements.
             </p>
           </div>

           {/* Quick AI Summary */}
           <div className="saas-card p-6 bg-slate-50 border-slate-200">
              <h4 className="text-sm font-bold text-slate-950 mb-6 uppercase tracking-wider">Verdict Summary</h4>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">Strong Fits</span>
                    <span className="px-2 py-1 rounded bg-slate-950 text-white font-black">{fitCounts['Strong Fit'] || 0}</span>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">Moderate Fits</span>
                    <span className="px-2 py-1 rounded bg-slate-200 text-slate-900 font-black">{fitCounts['Moderate Fit'] || 0}</span>
                 </div>
                 <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">Not Fit</span>
                    <span className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-400 font-black">{fitCounts['Not Fit'] || 0}</span>
                 </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200">
                 <p className="text-[10px] text-slate-500 italic leading-relaxed">
                   "AI recommendation engine identifies {bestCandidate?.candidateName} as the primary choice for this role with exception alignment."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
