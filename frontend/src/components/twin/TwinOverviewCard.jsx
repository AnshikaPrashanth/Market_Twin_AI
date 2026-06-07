import React from 'react';
import SectionCard from '../common/SectionCard';
import JourneyStageBadge from './JourneyStageBadge';
import { Eye, ShoppingCart, CreditCard, Calendar } from 'lucide-react';

/**
 * Renders demographic overview profiles and event count aggregations on the Digital Twin dashboard.
 */
const TwinOverviewCard = ({ customerId, journeyStage, preferredChannel, rawCounters = {} }) => {
  const views = rawCounters.views || 0;
  const carts = rawCounters.carts || 0;
  const purchases = rawCounters.purchases || 0;
  const totalSpend = rawCounters.total_spend || 0.0;
  
  // Format Indian Rupees (INR) for local hackathon demo context
  const formattedSpend = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(totalSpend);

  return (
    <SectionCard title="Twin Identity Overview" subtitle="General profile metrics and transactional values">
      <div className="flex flex-col gap-6 select-none">
        
        {/* Identity Context ID & Stage */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Customer Reference</span>
            <div className="text-xl font-extrabold text-white mt-0.5">{customerId}</div>
          </div>
          <JourneyStageBadge stage={journeyStage} />
        </div>

        {/* Aggregated Event counters grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-dark-800 pt-4">
          <div className="flex items-center gap-3 bg-dark-950 p-3 border border-dark-850 rounded-xl">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <Eye size={16} />
            </div>
            <div>
              <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Product Views</span>
              <div className="text-sm font-extrabold text-white mt-0.5">{views}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-dark-950 p-3 border border-dark-850 rounded-xl">
            <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
              <ShoppingCart size={16} />
            </div>
            <div>
              <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Active Cart</span>
              <div className="text-sm font-extrabold text-white mt-0.5">{carts}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-dark-950 p-3 border border-dark-850 rounded-xl">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CreditCard size={16} />
            </div>
            <div>
              <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Purchases</span>
              <div className="text-sm font-extrabold text-white mt-0.5">{purchases}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-dark-950 p-3 border border-dark-850 rounded-xl">
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg">
              <Calendar size={16} />
            </div>
            <div>
              <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Spend Volume</span>
              <div className="text-sm font-extrabold text-white mt-0.5">{formattedSpend}</div>
            </div>
          </div>
        </div>

        {/* Preferred Channel indicator */}
        <div className="flex justify-between items-center bg-dark-950 px-4 py-3 border border-dark-850 rounded-xl text-xs font-semibold">
          <span className="text-dark-400 font-medium">Preferred Channel:</span>
          <span className="text-white capitalize">{preferredChannel || 'None detected'}</span>
        </div>

      </div>
    </SectionCard>
  );
};

export default TwinOverviewCard;
