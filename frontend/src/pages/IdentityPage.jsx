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
  const { selectedCustomerId, eventsList, identitiesList, twinState, isLoading } = useTwinStore();

  if (isLoading || !twinState) {
    return <LoadingSpinner text="Compiling identity maps..." />;
  }

  // Calculate highest confidence from identities
  let highestConfidence = 0;
  let bestMatchSource = "Unknown";
  let isDeterministic = false;

  if (identitiesList && identitiesList.length > 0) {
    identitiesList.forEach(link => {
      if (link.confidence_score > highestConfidence) {
        highestConfidence = link.confidence_score;
        bestMatchSource = link.matched_by;
      }
    });
    isDeterministic = highestConfidence === 100;
  } else {
    // Fallback if no identities exist (e.g. initial seeded state without links)
    isDeterministic = selectedCustomerId === 'CUST_001' || selectedCustomerId === 'CUST_002';
    highestConfidence = isDeterministic ? 100 : 85;
    bestMatchSource = isDeterministic ? "Deterministic" : "Probabilistic";
  }

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
            identities={identitiesList}
            events={eventsList}
          />
        </div>

        {/* Match heuristics weights table */}
        <div className="lg:col-span-1">
          <MatchConfidenceCard 
            matchType={isDeterministic ? "Deterministic Match" : "Probabilistic Match"}
            score={highestConfidence}
            matchSource={bestMatchSource}
            identities={identitiesList}
          />
        </div>

      </div>
    </div>
  );
};

export default IdentityPage;
