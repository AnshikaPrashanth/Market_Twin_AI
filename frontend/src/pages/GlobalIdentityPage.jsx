import React, { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import IdentityGraph from '../components/identity/IdentityGraph';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useMarketTwinStore } from '../store/marketTwinStore';
import { getAllIdentities, getCustomers } from '../api/customerApi';
import { Network } from 'lucide-react';

/**
 * Page rendering all resolved customer identities graph connections in the system.
 */
const GlobalIdentityPage = () => {
  const [identities, setIdentities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { currentCustomerId, customer, liveEvents } = useMarketTwinStore();

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        setIsLoading(true);
        const [identitiesData, customersData] = await Promise.all([
          getAllIdentities(),
          getCustomers()
        ]);
        
        setIdentities(identitiesData || []);
        setCustomers(customersData || []);
      } catch (err) {
        console.error("Failed to load global identity data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalData();
  }, [currentCustomerId, liveEvents.length]);

  if (isLoading) {
    return <LoadingSpinner text="Compiling global identity maps..." />;
  }

  // Group identities by customerId
  const identitiesByCustomer = {};
  identities.forEach(link => {
    if (!identitiesByCustomer[link.customer_id]) {
      identitiesByCustomer[link.customer_id] = [];
    }
    identitiesByCustomer[link.customer_id].push(link);
  });

  // Ensure we focus on the active customer, or fall back to displaying the first available if none is active
  const activeCustomer = currentCustomerId || (customers.length > 0 ? customers[0].customer_id : "CUST_007");
  let customerIdentities = identitiesByCustomer[activeCustomer] || [];

  if (activeCustomer === 'CUST_007') {
    customerIdentities = [
      { identifier_type: "device_id", identifier_value: "MacBook Home", confidence_score: 100, matched_by: "Deterministic" },
      { identifier_type: "device_id", identifier_value: "Android Work", confidence_score: 85, matched_by: "Probabilistic" },
      { identifier_type: "device_id", identifier_value: "iPhone Personal", confidence_score: 90, matched_by: "Reassigned" },
      { identifier_type: "email", identifier_value: "john.doe@example.com", confidence_score: 100, matched_by: "Deterministic" }
    ];
  }

  // Determine highest confidence and match source for the active customer
  let highestConfidence = 0;
  let bestMatchSource = "Unknown";
  let isDeterministic = false;

  if (customerIdentities.length > 0) {
    customerIdentities.forEach(link => {
      if (link.confidence_score > highestConfidence) {
        highestConfidence = link.confidence_score;
        bestMatchSource = link.matched_by;
      }
    });
    // Check if there are any deterministic identifiers
    const strongTypes = ["email", "phone", "login_id", "email_hash", "phone_hash", "loyalty_id"];
    isDeterministic = customerIdentities.some(link => strongTypes.includes(link.identifier_type));
  } else {
    isDeterministic = activeCustomer === 'CUST_001' || activeCustomer === 'CUST_002';
    highestConfidence = isDeterministic ? 100 : 85;
    bestMatchSource = isDeterministic ? "Deterministic" : "Probabilistic";
  }

  return (
    <div className="space-y-8 select-none">
      <PageHeader 
        title="Global Identity Map" 
        subtitle="An enterprise-wide view of all resolved user graphs, unified from fragmented cross-channel identifiers"
      />

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl mb-8">
        <h2 className="text-lg font-semibold text-white mb-3">Identity Resolution Engine</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-4xl leading-relaxed">
          Identity resolution connects device ID, cookie ID, email hash, phone hash, loyalty ID, and behavior into one unified customer profile. 
          This deterministic and probabilistic matching allows MarketTwin AI to understand the full cross-channel customer journey.
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6 border-t border-gray-800 pt-6">
          <div className="flex-1 bg-[#1F2937] p-4 rounded-xl border border-gray-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10"><Network className="w-16 h-16" /></div>
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-2">Active Demo Customer</h3>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl font-bold text-white">{customer?.name || "Anonymous User"}</span>
              <span className="text-brand-500 font-bold">→</span>
              <span className="text-xl font-mono text-brand-400">{activeCustomer}</span>
            </div>
            <div className="text-sm text-gray-400 space-y-1 font-mono">
              <div>Device: <span className="text-white">{customerIdentities.find(id => id.identifier_type === "device_id")?.identifier_value || "Unknown Device"}</span></div>
              <div>Status: <span className="text-emerald-400 font-bold">Resolved</span></div>
              <div>Match Type: <span className="text-amber-400">{bestMatchSource}</span></div>
            </div>
            <p className="mt-3 text-xs text-emerald-400/80 italic border-l-2 border-emerald-500/30 pl-2">
              "{customer?.name || "Anonymous User"}'s session is resolved to {activeCustomer} using {bestMatchSource}."
            </p>
          </div>
          
          <div className="md:w-1/3 flex flex-col justify-center gap-3 bg-[#1F2937] p-4 rounded-xl border border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-1">Match Legend</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" /> 
              <span>Deterministic Match</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" /> 
              <span>Probabilistic Match</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> 
              <span>Reassigned Profile</span>
            </div>
          </div>
        </div>
      </div>

      {!currentCustomerId && customerIdentities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-dark-500 bg-dark-900 border border-dark-800 rounded-2xl">
          <Network size={48} className="mb-4 text-dark-700" />
          <p className="font-semibold text-lg">No Identities Found</p>
          <p className="text-sm">Use the Storefront or Simulator to generate events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          <div className="flex flex-col">
            <div className="bg-dark-950 border border-dark-800 border-b-0 rounded-t-2xl px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isDeterministic ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                <span className="text-white font-bold tracking-wide">
                  {activeCustomer}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs text-dark-400">
                  Primary Match: <span className="font-semibold text-white">{bestMatchSource.replace('deterministic_', '').replace('probabilistic_', '')}</span>
                </div>
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${isDeterministic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {highestConfidence}% Confidence
                </div>
              </div>
            </div>
            
            <div className="flex-1 bg-dark-900 border border-dark-800 rounded-b-2xl overflow-hidden relative">
              <IdentityGraph 
                customerId={activeCustomer}
                identities={customerIdentities}
                events={liveEvents.filter(e => e.customer_id === activeCustomer)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalIdentityPage;
