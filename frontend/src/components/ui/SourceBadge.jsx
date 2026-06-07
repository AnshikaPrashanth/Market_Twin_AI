import React from 'react';

const SourceBadge = ({ source }) => {
  if (!source) return null;
  
  const sourceUpper = source.toUpperCase();
  
  let colorClasses = 'bg-gray-800 text-gray-400 border-gray-700';
  
  if (sourceUpper === 'COMPUTED') {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (sourceUpper === 'ESTIMATED') {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (sourceUpper === 'SEEDED') {
    colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (sourceUpper === 'DEMO') {
    colorClasses = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  }

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ml-2 ${colorClasses}`}>
      {sourceUpper}
    </span>
  );
};

export default SourceBadge;
