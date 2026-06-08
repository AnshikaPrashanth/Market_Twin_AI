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
  
  let kpiRevenue = 0;
  if (metrics.revenue_recovered !== undefined) {
    kpiRevenue = metrics.revenue_recovered;
  } else if (latestTwin?.raw_counters?.total_spend !== undefined) {
    kpiRevenue = latestTwin.raw_counters.total_spend;
  }
  
  const kpiPreferredChannel = latestTwin?.preferred_channel || "Not available";

  return (
    <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Intelligence Command Center</h1>
        <p className="text-gray-400 mt-2">Real-time omnichannel customer intelligence overview.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Active Customer" value={kpiActiveCustomer} icon={Users} color="text-blue-400" source={latestTwin ? "live twin" : "demo baseline"} />
        <KpiCard title="Intent Score" value={`${kpiIntentScore}%`} icon={Target} color="text-emerald-400" source={latestTwin ? "live twin" : "demo baseline"} />
        <KpiCard title="Journey Stage" value={kpiJourneyStage.toUpperCase()} icon={Activity} color="text-indigo-400" source={latestTwin ? "live twin" : "demo baseline"} />
        <KpiCard title="Live Events" value={kpiLiveEvents.toString()} icon={BarChart3} color="text-purple-400" source="live twin" />
        <KpiCard title="Revenue Recovered" value={`₹${kpiRevenue.toLocaleString()}`} icon={TrendingUp} color="text-emerald-400" source={sources.revenue_recovered || (latestTwin ? "live twin" : "demo baseline")} />
        <KpiCard title="Preferred Channel" value={kpiPreferredChannel} icon={ShieldCheck} color="text-amber-400" source={latestTwin ? "live twin" : "demo baseline"} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Event Feed */}
        <div className="col-span-1 bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
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
                  <div className="text-gray-400 text-xs mb-1">Customer: {ev.customer_id || "unknown_customer"}</div>
                  <div className="text-gray-400 text-xs mb-1">Source: {ev.source || "unknown"}</div>
                  
                  {(ev.final_action || ev.final_channel) && (
                    <div className="flex items-center gap-2 mt-1">
                      {ev.final_action && <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Action: {ev.final_action}</span>}
                      {ev.final_channel && <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Channel: {ev.final_channel}</span>}
                    </div>
                  )}

                  {(ev.product_name || ev.product_id) && (
                    <div className="text-gray-500 text-xs mt-1">Product: {ev.product_name || ev.product_id}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charts & Audience Overview */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Demo Baseline Analytics (Audience Segments)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-[#1F2937] rounded-t-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Segment</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Avg Intent</th>
                    <th className="px-4 py-3">Avg Churn</th>
                    <th className="px-4 py-3">Fatigue</th>
                    <th className="px-4 py-3 rounded-tr-lg">Best Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((seg, i) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-[#1F2937]/50">
                      <td className="px-4 py-3 font-medium text-white">{seg.segment}</td>
                      <td className="px-4 py-3 text-gray-300">{seg.size}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${seg.avg_intent > 70 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-300'}`}>
                          {seg.avg_intent}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-rose-400">{seg.avg_churn}</td>
                      <td className="px-4 py-3 text-amber-400">{seg.avg_fatigue}</td>
                      <td className="px-4 py-3 text-blue-400">{seg.best_channel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color, source }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-2xl p-5 shadow-lg flex items-center space-x-4">
      <div className={`p-3 rounded-xl bg-gray-800/50 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col items-start w-full min-w-0">
        <p className="text-sm font-medium text-gray-400 w-full truncate flex justify-between">
          {title}
        </p>
        <div className="flex items-center mt-1">
          <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
          <SourceBadge source={source} />
        </div>
      </div>
    </div>
  );
}
