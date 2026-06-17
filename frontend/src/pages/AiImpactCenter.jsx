import React from 'react';
import { Target, ShieldCheck, Zap, TrendingUp, DollarSign, Activity, CheckCircle, List } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useMarketTwinStore } from '../store/marketTwinStore';

export default function AiImpactCenter() {
  const { currentCustomerId, liveEvents } = useMarketTwinStore();

  const isDemo = currentCustomerId === 'CUST_007' && liveEvents.some(e => e.event_type === 'purchase');

  return (
    <div className="space-y-8 select-none">
      <PageHeader 
        title="AI Impact Center" 
        subtitle="Live oversight of MarketTwin AI's decision orchestration and resulting business value."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total AI Decisions" value={isDemo ? 142 : 0} icon={Activity} color="text-blue-400" />
        <MetricCard title="Campaigns Triggered" value={isDemo ? 1 : 0} icon={Zap} color="text-amber-400" />
        <MetricCard title="Channels Skipped (Policy)" value={isDemo ? 1 : 0} icon={ShieldCheck} color="text-red-400" />
        <MetricCard title="Messages Prevented (Fatigue)" value={isDemo ? 24 : 0} icon={CheckCircle} color="text-emerald-400" />
        <MetricCard title="Revenue Recovered" value={isDemo ? "₹3,499" : "₹0"} icon={DollarSign} color="text-emerald-500" />
        <MetricCard title="Net Uplift" value={isDemo ? "₹3,149" : "₹0"} icon={TrendingUp} color="text-emerald-400" />
        <MetricCard title="ROI" value={isDemo ? "9.0x" : "0.0x"} icon={Target} color="text-purple-400" />
        <MetricCard title="Policy-Safe Decisions" value={isDemo ? 142 : 0} icon={ShieldCheck} color="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl col-span-1 flex flex-col justify-center">
          <h2 className="text-lg font-semibold text-white mb-6">Orchestration Highlights</h2>
          <div className="space-y-6">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Top Winning Action</div>
              <div className="text-xl font-bold text-brand-400">Cart Recovery Coupon</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Best Performing Channel</div>
              <div className="text-xl font-bold text-blue-400">Email</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Explainability Coverage</div>
              <div className="text-xl font-bold text-emerald-400">100%</div>
            </div>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl col-span-2">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <List className="w-5 h-5 mr-2 text-indigo-400" /> Recent Orchestration Decisions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#1F2937] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="p-3 rounded-tl-lg">Customer ID</th>
                  <th className="p-3">Campaign</th>
                  <th className="p-3">Predicted Channel</th>
                  <th className="p-3">Final Channel</th>
                  <th className="p-3">Routing Logic (Reason)</th>
                  <th className="p-3 rounded-tr-lg">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-3 font-mono text-white">CUST_007</td>
                  <td className="p-3">Cart Recovery Coupon</td>
                  <td className="p-3 text-emerald-400">WhatsApp</td>
                  <td className="p-3 text-blue-400">Email</td>
                  <td className="p-3 text-amber-400 text-xs">WhatsApp consent unavailable.</td>
                  <td className="p-3 font-bold text-emerald-400">₹3,499 recovered</td>
                </tr>
                {isDemo && (
                  <>
                    <tr className="hover:bg-gray-800/50 transition-colors">
                      <td className="p-3 font-mono text-white">CUST_042</td>
                      <td className="p-3">Flash Sale Alert</td>
                      <td className="p-3 text-blue-400">SMS</td>
                      <td className="p-3 text-gray-500">None (Suppressed)</td>
                      <td className="p-3 text-red-400 text-xs">High fatigue risk. Marketing cooled down.</td>
                      <td className="p-3 text-gray-400">Churn prevented</td>
                    </tr>
                    <tr className="hover:bg-gray-800/50 transition-colors">
                      <td className="p-3 font-mono text-white">CUST_089</td>
                      <td className="p-3">Welcome Series</td>
                      <td className="p-3 text-emerald-400">Email</td>
                      <td className="p-3 text-emerald-400">Email</td>
                      <td className="p-3 text-emerald-400 text-xs">Primary channel approved.</td>
                      <td className="p-3 text-white">Awaiting interaction</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
      <div className={`p-3 rounded-xl bg-gray-800/50 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col items-start w-full min-w-0">
        <p className="text-xs font-medium text-gray-400 w-full truncate">{title}</p>
        <p className="text-xl font-bold text-white tracking-tight mt-1">{value}</p>
      </div>
    </div>
  );
}
