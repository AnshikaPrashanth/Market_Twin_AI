import React from 'react';
import SectionCard from '../common/SectionCard';

/**
 * Sub-widget to draw an SVG Circular Progress circle.
 */
const CircularProgress = ({ value, label, colorClass, trailColorClass = "stroke-dark-800" }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center select-none text-center p-4 bg-dark-950/40 border border-dark-850 rounded-2xl">
      <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className={`fill-none stroke-[6.5px] ${trailColorClass}`}
          />
          {/* Colored Active stroke */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className={`fill-none stroke-[7px] transition-all duration-700 ease-out ${colorClass}`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Core Value Text */}
        <div className="absolute text-xl font-extrabold text-white tracking-tight">{value}%</div>
      </div>
      <span className="text-[10px] font-extrabold text-dark-300 uppercase tracking-wider">{label}</span>
    </div>
  );
};

/**
 * Panel grouping all four behavioral metrics.
 */
const TwinScoresPanel = ({ intent = 0, churn = 0, fatigue = 0, conversion = 0 }) => {
  return (
    <SectionCard title="Behavioral Intelligence Scores" subtitle="Real-time recalculated customer metrics">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CircularProgress 
          value={intent} 
          label="Intent Level" 
          colorClass="stroke-emerald-400" 
        />
        <CircularProgress 
          value={churn} 
          label="Churn Risk" 
          colorClass="stroke-rose-500" 
        />
        <CircularProgress 
          value={fatigue} 
          label="Ad Fatigue" 
          colorClass="stroke-amber-400" 
        />
        <CircularProgress 
          value={conversion} 
          label="Conversion Prob." 
          colorClass="stroke-brand-500" 
        />
      </div>
    </SectionCard>
  );
};

export default TwinScoresPanel;
