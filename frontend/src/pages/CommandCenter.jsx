import React, { useEffect, useState } from "react";
import { useDemoStore } from "../store/demoStore";
import { useTwinStore } from "../store/twinStore";
import { getSegments } from "../api/client";
import { ShieldCheck, TrendingUp, Users, Activity, BarChart3, Target } from "lucide-react";
import SourceBadge from "../components/ui/SourceBadge";

export default function CommandCenter() {
  const { liveEvents } = useDemoStore();
  const { selectedCustomerId, twinState, dashboardMetrics, fetchMetricsData } = useTwinStore();
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await fetchMetricsData();
        const segmentsData = await getSegments();
        setSegments(segmentsData);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    };
    fetchDashboardData();
  }, []);

  const metrics = dashboardMetrics || {};
  const sources = metrics.sources || {};

  return (
    <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Intelligence Command Center</h1>
        <p className="text-gray-400 mt-2">Real-time omnichannel customer intelligence overview.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Resolved Customers" value={metrics.resolved_customers?.toLocaleString() || "..."} icon={Users} color="text-blue-400" source={sources.resolved_customers} />
        <KpiCard title="Identity Match Rate" value={metrics.identity_match_rate ? `${metrics.identity_match_rate}%` : "..."} icon={ShieldCheck} color="text-indigo-400" source={sources.identity_match_rate} />
        <KpiCard title="High Intent Customers" value={metrics.high_intent_customers?.toLocaleString() || "..."} icon={Target} color="text-emerald-400" source={sources.high_intent_customers} />
        <KpiCard title="Revenue Opportunity" value={metrics.revenue_opportunity != null ? `₹${metrics.revenue_opportunity.toLocaleString()}` : "..."} icon={TrendingUp} color="text-emerald-400" source={sources.revenue_opportunity} />
        <KpiCard title="Active Channels" value={metrics.active_channels || "..."} icon={Activity} color="text-amber-400" source={sources.active_channels} />
        <KpiCard title="Best Audience Today" value={metrics.best_audience_today || "..."} icon={BarChart3} color="text-purple-400" source={sources.best_audience_today} />
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
              <p className="text-gray-500 text-sm italic">Waiting for incoming events...</p>
            ) : (
              liveEvents.map((ev, i) => (
                <div key={i} className="flex flex-col p-3 rounded-lg bg-[#1F2937] border border-gray-700/50 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-brand-300">{ev.event_type}</span>
                    <span className="text-xs text-gray-500">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-gray-400 text-xs">Customer: {ev.customer_id}</div>
                  {ev.properties?.product_id && (
                    <div className="text-gray-500 text-xs mt-1">Product: {ev.properties.product_id}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charts & Audience Overview */}
        <div className="col-span-2 space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Audience Segments Overview</h2>
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
