import React from 'react';
import type { CandidateAnalysis } from '../types';

interface CandidateCardProps {
  candidate: CandidateAnalysis;
  rank: number;
}

const getFitBadge = (fit: string) => {
  switch (fit) {
    case 'Strong Fit':
      return { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200',
        icon: '✓',
        color: '#10b981'
      };
    case 'Moderate Fit':
      return { 
        bg: 'bg-amber-50', 
        text: 'text-amber-700', 
        border: 'border-amber-200',
        icon: '≈',
        color: '#f59e0b'
      };
    case 'Not Fit':
    default:
      return { 
        bg: 'bg-rose-50', 
        text: 'text-rose-700', 
        border: 'border-rose-200',
        icon: '✕',
        color: '#ef4444'
      };
  }
};

const getRankMedal = (rank: number) => {
  if (rank === 1) return { icon: '🥇', label: '1st Place', color: 'bg-amber-400 text-white shadow-amber-300' };
  if (rank === 2) return { icon: '🥈', label: '2nd Place', color: 'bg-slate-300 text-slate-800 shadow-slate-200' };
  if (rank === 3) return { icon: '🥉', label: '3rd Place', color: 'bg-orange-600 text-white shadow-orange-200' };
  return { icon: null, label: null, color: 'bg-slate-100 text-slate-500 border border-slate-200 shadow-none' };
};

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, rank }) => {
  const badgeStyle = getFitBadge(candidate.recommendation);
  const medal = getRankMedal(rank);

  // Circular Progress Calculation
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (candidate.matchScore / 100) * circumference;

  return (
    <div className="saas-card group hover:shadow-lg transition-all duration-500 border-transparent hover:border-slate-200 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-8">
        {/* Main Content Area */}
        <div className="flex flex-col xl:flex-row gap-10 items-start">
          
          {/* Avatar & Score Ring */}
          <div className="flex-shrink-0 relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                style={{ strokeDashoffset: offset }}
                className="text-slate-900 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-outfit font-black text-slate-950 leading-none">{candidate.matchScore}%</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1 leading-none">Match</span>
            </div>
            
            {/* Rank Badge overlay */}
            {medal.icon && (
               <div className={`absolute -top-2 -right-2 w-10 h-10 rounded-full ${medal.color} flex items-center justify-center text-xl shadow-lg border-2 border-white animate-bounce-subtle`}>
                 {medal.icon}
               </div>
            )}
          </div>

          {/* Candidate Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-2xl font-outfit font-black text-slate-950 tracking-tight leading-tight group-hover:text-slate-900 transition-colors">
                  {candidate.candidateName}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} shadow-sm`}>
                    <span className="text-sm font-normal">{badgeStyle.icon}</span>
                    {candidate.recommendation}
                  </span>
                  {medal.label && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Ranked {medal.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Strengths */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 relative group/insight transition-all hover:bg-emerald-50">
                 <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-xs">⭐</div>
                   Key Strengths
                 </h4>
                 <ul className="space-y-3">
                   {candidate.keyStrengths.map((str, idx) => (
                     <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium leading-relaxed">
                       <span className="text-emerald-500 shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       {str}
                     </li>
                   ))}
                   {candidate.keyStrengths.length === 0 && <li className="text-slate-400 italic text-sm">No specific strengths noted.</li>}
                 </ul>
              </div>

              {/* Gaps */}
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 relative group/insight transition-all hover:bg-rose-50">
                 <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-xs">⚠️</div>
                   Potential Gaps
                 </h4>
                 <ul className="space-y-3">
                   {candidate.keyGaps.map((gap, idx) => (
                     <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium leading-relaxed">
                       <span className="text-rose-500 shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                       {gap}
                     </li>
                   ))}
                   {candidate.keyGaps.length === 0 && <li className="text-slate-400 italic text-sm">No significant gaps found.</li>}
                 </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
