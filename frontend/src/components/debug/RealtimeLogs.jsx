import React, { useEffect, useRef } from 'react';
import { useDebugStore } from '../../store/debugStore';
import { Terminal, Trash2 } from 'lucide-react';

/**
 * Scrolling terminal simulator displaying background and HTTP request logs.
 */
const RealtimeLogs = () => {
  const { logs, clearLogs } = useDebugStore();
  const consoleBottomRef = useRef(null);

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="bg-black border border-dark-800 rounded-2xl p-5 flex flex-col h-[280px] font-mono select-none">
      {/* Console Header Control */}
      <div className="flex items-center justify-between border-b border-dark-800 pb-3 mb-3">
        <div className="flex items-center gap-2 text-brand-400">
          <Terminal size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Engine Process Console</span>
        </div>
        <button 
          onClick={clearLogs}
          className="text-dark-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-dark-900 transition-colors"
          title="Wipe Logs"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Logs Scroll container */}
      <div className="flex-1 overflow-y-auto space-y-1.5 text-[10px] text-dark-300">
        {logs.map((log, index) => {
          let typeColor = "text-dark-300";
          if (log.includes("[API Failure]") || log.includes("[API Error]")) {
            typeColor = "text-rose-400 font-bold";
          } else if (log.includes("[API Response]")) {
            typeColor = "text-emerald-400";
          } else if (log.includes("[API Request]")) {
            typeColor = "text-sky-400";
          } else if (log.includes("[Sync Engine]") || log.includes("[System]")) {
            typeColor = "text-brand-400";
          }

          return (
            <div key={index} className={`${typeColor} break-all font-mono leading-relaxed`}>
              {log}
            </div>
          );
        })}
        <div ref={consoleBottomRef} />
      </div>
    </div>
  );
};

export default RealtimeLogs;
