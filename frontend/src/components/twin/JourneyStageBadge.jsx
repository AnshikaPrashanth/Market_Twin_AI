import React from 'react';

/**
 * Color-coded badge displaying customer stage status.
 */
const JourneyStageBadge = ({ stage }) => {
  const key = stage ? stage.toLowerCase() : 'anonymous';
  
  const styles = {
    anonymous: "bg-dark-800 text-dark-400 border-dark-700",
    browsing: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    interested: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    cart_active: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    cart_abandoned: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    re_engaged: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    converted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    loyal: "bg-emerald-600/10 text-emerald-300 border-emerald-600/20",
    dormant: "bg-zinc-800 text-zinc-400 border-zinc-700",
    churn_risk: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <span 
      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase tracking-wider inline-flex items-center justify-center border ${
        styles[key] || styles.anonymous
      }`}
    >
      {key.replace('_', ' ')}
    </span>
  );
};

export default JourneyStageBadge;
