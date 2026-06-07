import React from 'react';

/**
 * Clean component formatting raw JSON payloads with indentation.
 */
const JsonViewer = ({ data, title }) => {
  if (!data) {
    return (
      <div className="text-xs text-dark-500 italic py-4 text-center">
        No payload recorded.
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-dark-950 border border-dark-800 rounded-2xl p-4 font-mono select-text">
      {title && (
        <div className="text-[10px] font-bold uppercase tracking-wider text-dark-400 border-b border-dark-800 pb-2 mb-3">
          {title}
        </div>
      )}
      <pre className="text-xs text-brand-400 overflow-x-auto max-h-[300px] leading-relaxed font-mono select-text">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default JsonViewer;
