import React from 'react';

/**
 * Standard spinner component shown during initial data loads or processing requests.
 */
const LoadingSpinner = ({ size = "md", text = "Syncing Digital Twin..." }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-[4px]"
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 select-none">
      <div className={`animate-spin rounded-full border-t-brand-500 border-dark-800 ${sizeClasses[size]}`} />
      {text && <p className="text-xs text-dark-400 font-bold mt-4 tracking-wider uppercase">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
