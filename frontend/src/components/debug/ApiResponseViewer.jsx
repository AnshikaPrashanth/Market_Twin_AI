import React from 'react';
import { useDebugStore } from '../../store/debugStore';
import SectionCard from '../common/SectionCard';
import JsonViewer from './JsonViewer';
import { Code, Clock, Globe } from 'lucide-react';

/**
 * Inspects and pretty-prints the raw JSON payload returned by specific API paths.
 */
const ApiResponseViewer = ({ url = '/api/event' }) => {
  const { rawResponses } = useDebugStore();
  const data = rawResponses[url];

  return (
    <SectionCard title="Raw API Response Inspector" subtitle="Direct inspection of the latest wire transaction payload">
      {data ? (
        <div className="space-y-4 select-none">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
              <Globe size={14} />
              <span>{url}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Code size={14} />
              <span>Transaction Success</span>
            </div>
          </div>
          <JsonViewer data={data} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center text-dark-500 select-none">
          <Clock size={28} className="mb-2 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">Awaiting API Transaction</span>
          <span className="text-[10px] text-dark-400 mt-1 max-w-[220px]">
            Execute request triggers in the Event Lab to capture raw JSON transfers.
          </span>
        </div>
      )}
    </SectionCard>
  );
};

export default ApiResponseViewer;
