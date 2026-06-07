import React from 'react';

/**
 * Standard container representing a separate logical segment or widget on pages.
 */
const SectionCard = ({ title, subtitle, actions, children, className = "" }) => {
  return (
    <div className={`bg-dark-900 border border-dark-800 rounded-2xl p-6 ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between border-b border-dark-800 pb-4 mb-5 select-none">
          <div>
            {title && <h3 className="font-bold text-white text-base tracking-wide">{title}</h3>}
            {subtitle && <p className="text-xs text-dark-300 mt-1.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default SectionCard;
