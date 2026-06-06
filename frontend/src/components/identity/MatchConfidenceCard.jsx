import React from 'react';
import SectionCard from '../common/SectionCard';
import { ShieldCheck } from 'lucide-react';

/**
 * Renders the matching metrics report of the identity resolution engine.
 */
const MatchConfidenceCard = ({ matchType = "Deterministic", score = 100 }) => {
  const isHigh = score >= 70;
  
  return (
    <SectionCard title="Match Resolution Analysis" subtitle="Heuristics engine confidence metrics">
      <div className="flex flex-col gap-6 select-none">
        {/* Confidence Progress Header */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div 
              className={`p-4 rounded-full border ${
                isHigh ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              <ShieldCheck size={28} />
            </div>
          </div>
          <div>
            <h4 className="font-extrabold text-white text-sm">Resolution Confidence</h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-extrabold ${isHigh ? 'text-emerald-400' : 'text-amber-400'}`}>
                {score}%
              </span>
              <span className="text-[10px] uppercase font-extrabold text-dark-300">
                ({matchType})
              </span>
            </div>
          </div>
        </div>

        {/* Weights Details Table */}
        <div className="space-y-3 pt-3 border-t border-dark-800">
          <div className="flex justify-between text-xs">
            <span className="text-dark-400 font-medium">Deterministic match</span>
            <span className="text-white font-bold bg-dark-800 px-2 py-0.5 rounded border border-dark-750">
              Email / Phone hashes (100%)
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-dark-400 font-medium">Probabilistic Device match</span>
            <span className="text-white font-bold text-brand-400">+30 pts</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-dark-400 font-medium">Probabilistic Category overlap</span>
            <span className="text-white font-bold text-brand-400">+25 pts</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-dark-400 font-medium">Probabilistic Time overlap</span>
            <span className="text-white font-bold text-brand-400">+20 pts</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-dark-400 font-medium">Probabilistic City match</span>
            <span className="text-white font-bold text-brand-400">+15 pts</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};

export default MatchConfidenceCard;
