import React from 'react';

/**
 * Standard badge component displaying status tags.
 */
const StatusBadge = ({ text, type = "info" }) => {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    error: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    info: "bg-brand-500/10 text-brand-400 border border-brand-500/20",
    neutral: "bg-dark-800 text-dark-300 border border-dark-700",
  };

  return (
    <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase tracking-wider inline-flex items-center justify-center ${styles[type] || styles.neutral}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
