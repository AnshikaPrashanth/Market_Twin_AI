import React from 'react';
import TimelineEvent from './TimelineEvent';
import { HelpCircle } from 'lucide-react';

/**
 * Iterates over customer event logs and renders a vertical, styled card timeline.
 */
const EventTimeline = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center select-none border border-dashed border-dark-800 rounded-2xl p-6 bg-dark-900/50">
        <HelpCircle size={32} className="text-dark-500 mb-3" />
        <p className="text-sm font-extrabold text-white">No Ingested Events Found</p>
        <p className="text-xs text-dark-300 mt-1.5 max-w-[260px]">
          Head over to the Event Lab page to trigger mock customer actions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {events.map((event, index) => (
        <TimelineEvent 
          key={event.event_id || index} 
          event={event} 
          index={index} 
        />
      ))}
    </div>
  );
};

export default EventTimeline;
