import React, { useEffect, useState } from "react";
import { useMarketTwinStore } from "../store/marketTwinStore";
import { getAudienceSegments } from "../api/client";
import { ShieldCheck, TrendingUp, Users, Activity, BarChart3, Target } from "lucide-react";
import SourceBadge from "../components/ui/SourceBadge";

export default function CommandCenter() {
  const { liveEvents, latestTwin, currentCustomerId, metricsSummary, refreshMetrics } = useMarketTwinStore();
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await refreshMetrics();
        const segmentsData = await getAudienceSegments();
        setSegments(segmentsData);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    };
    fetchDashboardData();
  }, [refreshMetrics]);

  const metrics = metricsSummary || {};
  const sources = metrics.sources || {};

  // KPI Calculations based on live state
  const kpiActiveCustomer = currentCustomerId || "None";
  const kpiIntentScore = latestTwin?.intent_score ?? 0;
  const kpiJourneyStage = latestTwin?.journey_stage || "Not started";
  const kpiLiveEvents = liveEvents.length;
  
  let kpiRevenueRisk = 0;
  if (latestTwin?.raw_counters?.cart_value !== undefined) {
    kpiRevenueRisk = latestTwin.raw_counters.cart_value;
  } else if (latestTwin?.raw_counters?.total_spend !== undefined) {
    kpiRevenueRisk = latestTwin.raw_counters.total_spend;
  }
  
  let expectedRecovery = metrics.revenue_recovered || 0;

  // L2 and L4 Data from latest twin and processing result
  const l3Action = latestTwin?.latest_prediction?.nba?.best_action || "Pending";
  const l2Channel = latestTwin?.latest_prediction?.channel?.best_channel || "Pending";
  const finalChannel = latestTwin?.latest_processing?.final_channel || "Pending";

  return (
    <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen">
      <header className="mb-4 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Intelligence Command Center</h1>
        <p className="text-gray-400 mt-2">Real-time omnichannel customer intelligence overview.</p>
      </header>

      {/* System Flow Strip */}
      <div className="bg-[#1F2937] border border-gray-700/50 rounded-xl p-3 flex justify-between items-center text-xs font-mono text-gray-400 tracking-wider">
        <span>Storefront</span> <span className="text-brand-500">→</span>
        <span>Event Engine</span> <span className="text-brand-500">→</span>
        <span>Identity Resolver</span> <span className="text-brand-500">→</span>
        <span className="text-white font-bold">Customer Twin</span> <span className="text-brand-500">→</span>
        <span>NBA Engine</span> <span className="text-brand-500">→</span>
        <span>Channel Dispatcher</span> <span className="text-brand-500">→</span>
        <span>Measurement</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard title="Active Customer ID" value={kpiActiveCustomer} icon={Users} color="text-blue-400" />
        <KpiCard title="Intent Score" value={`${kpiIntentScore}%`} icon={Target} color="text-emerald-400" />
        <KpiCard title="Journey Stage" value={kpiJourneyStage.toUpperCase()} icon={Activity} color="text-indigo-400" />
        <KpiCard title="Live Events" value={kpiLiveEvents.toString()} icon={BarChart3} color="text-purple-400" />
        <KpiCard title="Revenue Risk" value={`₹${kpiRevenueRisk.toLocaleString()}`} icon={TrendingUp} color="text-rose-400" />
        <KpiCard title="Recommended Action" value={l3Action.replace(/_/g, ' ')} icon={ShieldCheck} color="text-amber-400" className="capitalize" />
        <KpiCard title="Predicted Channel" value={l2Channel} icon={ShieldCheck} color="text-blue-400" className="capitalize" />
        <KpiCard title="Final Channel" value={finalChannel} icon={ShieldCheck} color="text-emerald-400" className="capitalize" />
        <KpiCard title="Expected Recovery" value={`₹${expectedRecovery.toLocaleString()}`} icon={TrendingUp} color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Event Feed */}
        <div className="col-span-1 xl:col-span-3 bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-3"></span>
            Live Event Feed
          </h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {liveEvents.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No live events yet. Use Storefront or Run Demo.</p>
            ) : (
              liveEvents.map((ev, i) => (
                <div key={ev.id || i} className="flex flex-col p-3 rounded-lg bg-[#1F2937] border border-gray-700/50 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-brand-300">{ev.event_type || "event_processed"}</span>
                    <span className="text-xs text-gray-500">
                      {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs mb-1 font-mono">Customer: {ev.customer_id || "unknown"}</div>
                  <div className="text-gray-400 text-xs mb-1">Source: {ev.source || "website"}</div>
                  
                  {(ev.final_action || ev.final_channel) && (
                    <div className="flex items-center gap-2 mt-1">
                      {ev.final_action && <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Action: {ev.final_action.replace(/_/g, ' ')}</span>}
                      {ev.final_channel && <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Channel: {ev.final_channel}</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        </div>
      </div>
  );
}

function KpiCard({ title, value, icon: Icon, color, className = "" }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
      <div className={`p-3 rounded-xl bg-gray-800/50 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col items-start w-full min-w-0">
        <p className="text-sm font-medium text-gray-400 w-full truncate flex justify-between">
          {title}
        </p>
        <div className="flex items-center mt-1 w-full">
          <p className={`text-xl font-bold text-white tracking-tight truncate w-full ${className}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
