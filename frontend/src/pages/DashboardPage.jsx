import React from 'react';
import { useTwinStore } from '../store/twinStore';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import SectionCard from '../components/common/SectionCard';
import JourneyStageBadge from '../components/twin/JourneyStageBadge';
import EventTimeline from '../components/timeline/EventTimeline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  TrendingUp, AlertTriangle, ShieldCheck, Zap
} from 'lucide-react';

/**
 * Primary overview HUD displaying current active twin scores, segment,
 * and latest activity timelines.
 */
const DashboardPage = () => {
  const { selectedCustomerId, twinState, eventsList, isLoading } = useTwinStore();

  if (isLoading || !twinState) {
    return <LoadingSpinner text="Syncing HUD context..." />;
  }

  const {
    journey_stage,
    intent_score,
    churn_risk,
    fatigue_score,
    conversion_probability,
    segment,
    next_best_action
  } = twinState;

  return (
    <div className="space-y-8 select-none">
      <PageHeader 
        title="Intelligence HUD" 
        subtitle="Global real-time overview of the active customer digital twin and behavior parameters"
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Intent Score" 
          value={`${intent_score}%`} 
          icon={TrendingUp} 
          colorClass="text-emerald-400" 
        />
        <StatCard 
          title="Churn Risk" 
          value={`${churn_risk}%`} 
          icon={AlertTriangle} 
          colorClass={churn_risk > 50 ? "text-rose-500" : "text-dark-300"} 
        />
        <StatCard 
          title="Conversion Prob." 
          value={`${conversion_probability}%`} 
          icon={ShieldCheck} 
          colorClass="text-brand-500" 
        />
        <StatCard 
          title="Next Best Action" 
          value={next_best_action ? next_best_action.replace(/_/g, ' ') : 'None'} 
          icon={Zap} 
          colorClass="text-amber-400 animate-pulse" 
          trend="Automated"
        />
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LHS Panel: Demographics info */}
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title="Active Profile Context" subtitle="Key metrics aggregates">
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between items-center bg-dark-950 p-3.5 border border-dark-850 rounded-xl">
                <span className="text-dark-400 font-medium">Customer Reference</span>
                <span className="text-white font-bold">{selectedCustomerId}</span>
              </div>
              <div className="flex justify-between items-center bg-dark-950 p-3.5 border border-dark-850 rounded-xl">
                <span className="text-dark-400 font-medium">Journey Stage</span>
                <JourneyStageBadge stage={journey_stage} />
              </div>
              <div className="flex justify-between items-center bg-dark-950 p-3.5 border border-dark-850 rounded-xl">
                <span className="text-dark-400 font-medium">Marketing Segment</span>
                <span className="text-brand-400 font-bold">{segment}</span>
              </div>
              <div className="flex justify-between items-center bg-dark-950 p-3.5 border border-dark-850 rounded-xl">
                <span className="text-dark-400 font-medium">Ad Contact Fatigue</span>
                <span className={`font-bold ${fatigue_score > 60 ? 'text-amber-400' : 'text-white'}`}>
                  {fatigue_score}%
                </span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RHS Panel: Scrollable timeline */}
        <div className="lg:col-span-2">
          <SectionCard title="Real-Time Event Stream" subtitle="Chronological timeline of customer actions">
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <EventTimeline events={eventsList.slice(0, 10)} />
            </div>
          </SectionCard>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
