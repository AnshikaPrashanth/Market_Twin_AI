import React from 'react';
import { useTwinStore } from '../store/twinStore';
import PageHeader from '../components/common/PageHeader';
import TwinOverviewCard from '../components/twin/TwinOverviewCard';
import TwinScoresPanel from '../components/twin/TwinScoresPanel';
import SegmentCard from '../components/twin/SegmentCard';
import NextBestActionCard from '../components/twin/NextBestActionCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Visual control center tracking live score recalculations and next-best-action triggers.
 */
const TwinPage = () => {
  const { selectedCustomerId, twinState, isLoading } = useTwinStore();

  if (isLoading || !twinState) {
    return <LoadingSpinner text="Synchronizing Digital Twin models..." />;
  }

  const {
    journey_stage,
    intent_score,
    churn_risk,
    fatigue_score,
    conversion_probability,
    segment,
    preferred_channel,
    next_best_action,
    raw_counters
  } = twinState;

  return (
    <div className="space-y-8 select-none">
      <PageHeader 
        title="Digital Twin Monitor" 
        subtitle="Visual representation of real-time metrics, rules segments, and marketing actions"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Summary overview and next actions suggestions */}
        <div className="lg:col-span-1 space-y-6">
          <TwinOverviewCard 
            customerId={selectedCustomerId}
            journeyStage={journey_stage}
            preferredChannel={preferred_channel}
            rawCounters={raw_counters}
          />
          <NextBestActionCard 
            action={next_best_action}
            preferredChannel={preferred_channel}
          />
        </div>

        {/* Right Side: Recalculated index scores and segment metrics */}
        <div className="lg:col-span-2 space-y-6">
          <TwinScoresPanel 
            intent={intent_score}
            churn={churn_risk}
            fatigue={fatigue_score}
            conversion={conversion_probability}
          />
          <SegmentCard 
            segment={segment}
          />
        </div>

      </div>
    </div>
  );
};

export default TwinPage;
