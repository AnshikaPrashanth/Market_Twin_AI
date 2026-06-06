import React from 'react';
import { useTwinStore } from '../store/twinStore';
import PageHeader from '../components/common/PageHeader';
import IdentityGraph from '../components/identity/IdentityGraph';
import MatchConfidenceCard from '../components/identity/MatchConfidenceCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Page rendering the resolved customer identities graph connections.
 */
const IdentityPage = () => {
  const { selectedCustomerId, eventsList, twinState, isLoading } = useTwinStore();

  if (isLoading || !twinState) {
    return <LoadingSpinner text="Compiling identity maps..." />;
  }

  // Pre-seeded customer reference IDs are deterministic, while simulated are probabilistic matches
  const isDeterministic = selectedCustomerId === 'CUST_001' || selectedCustomerId === 'CUST_002';

  return (
    <div className="space-y-8 select-none">
      <PageHeader 
        title="Identity Resolution Panel" 
        subtitle="Unify fragmented browser cookie logs, hardware device IDs, and email credentials"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph representation layout */}
        <div className="lg:col-span-2">
          <IdentityGraph 
            customerId={selectedCustomerId}
            events={eventsList}
          />
        </div>

        {/* Match heuristics weights table */}
        <div className="lg:col-span-1">
          <MatchConfidenceCard 
            matchType={isDeterministic ? "Deterministic Match" : "Probabilistic Match"}
            score={isDeterministic ? 100 : 85}
          />
        </div>

      </div>
    </div>
  );
};

export default IdentityPage;
