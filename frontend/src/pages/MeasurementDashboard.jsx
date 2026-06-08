import React, { useEffect, useState, useCallback } from "react";
import { getCohortDrift, getMetricsSummary } from "../api/client";
import { useMarketTwinStore } from "../store/marketTwinStore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Target, TrendingUp, DollarSign, Info, ChevronDown, ChevronUp, AlertCircle, Loader2 } from "lucide-react";

export default function MeasurementDashboard() {
  const { liveEvents, latestProcessingResult, metricsSummary, setMetricsSummary } = useMarketTwinStore();
  const [cohortData, setCohortData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await getMetricsSummary();
      setMetricsSummary(summary);
      const drift = await getCohortDrift();
      setCohortData(drift);
    } catch (e) {
      console.error("Failed to load dashboard metrics", e);
      setError("Unable to load measurement metrics from backend.");
    } finally {
      setLoading(false);
    }
  }, [setMetricsSummary]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Live refresh rule
  useEffect(() => {
    const triggerEvents = ["purchase", "cart_abandoned", "email_click", "whatsapp_click", "banner_click"];
    
    let shouldRefetch = false;
    
    if (latestProcessingResult && triggerEvents.includes(latestProcessingResult.event_type)) {
      shouldRefetch = true;
    } else if (liveEvents.length > 0) {
      const lastEvent = liveEvents[liveEvents.length - 1];
      if (triggerEvents.includes(lastEvent.event_type)) {
        shouldRefetch = true;
      }
    }
    
    if (shouldRefetch) {
      fetchDashboardData();
    }
  }, [latestProcessingResult, liveEvents.length, fetchDashboardData]);

  if (error) {
    return (
      <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-rose-400 flex items-center"><AlertCircle className="mr-2" /> {error}</div>
      </div>
    );
  }

  if (loading && !metricsSummary) {
    return (
      <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-gray-400 flex items-center"><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading metrics...</div>
      </div>
    );
  }

  const metrics = metricsSummary || {};
  const sources = metrics.sources || {};

  return (
    <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen">
      <header className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
            <Target className="w-8 h-8 mr-3 text-emerald-500" /> Business Measurement
          </h1>
          <p className="text-gray-400 mt-2">Impact of MarketTwin AI Next Best Actions.</p>
        </div>
        {metrics.computed_from && (
          <div className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
            Computed from: {metrics.computed_from}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Revenue Recovered" value={metrics.revenue_recovered != null ? `₹${metrics.revenue_recovered.toLocaleString()}` : "₹0"} icon={DollarSign} color="text-emerald-400" source={sources.revenue_recovered} />
        <MetricCard title="Conversion Lift" value={metrics.conversion_lift != null ? `+${metrics.conversion_lift}%` : "N/A"} icon={TrendingUp} color="text-blue-400" source={sources.conversion_lift} />
        <MetricCard title="iROAS" value={metrics.iroas != null ? `${metrics.iroas}x` : "N/A"} icon={Target} color="text-purple-400" source={sources.iroas} />
        <MetricCard title="Cart Recovery Rate" value={metrics.cart_recovery_rate != null ? `${metrics.cart_recovery_rate}%` : "N/A"} icon={TrendingUp} color="text-indigo-400" source={sources.cart_recovery_rate} />
        <MetricCard title="Churn Risk Reduced" value={metrics.churn_risk_reduced != null ? `-${metrics.churn_risk_reduced}%` : "N/A"} icon={Target} color="text-rose-400" source={sources.churn_risk_reduced} />
        <MetricCard title="Fatigue Avoided" value={metrics.fatigue_avoided != null ? `${metrics.fatigue_avoided} msg` : "0 msg"} icon={Target} color="text-amber-400" source={sources.fatigue_avoided} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Cohort Drift Stacked Area Chart */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl h-[450px]">
          <h2 className="text-lg font-semibold text-white mb-6">Cohort Journey Drift (5 Weeks)</h2>
          {(!cohortData || cohortData.length === 0) ? (
            <div className="h-full flex items-center justify-center text-gray-500 italic pb-12">
              No cohort drift data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={cohortData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="week" stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} />
                <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} itemStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Browsing" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Cart Active" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Cart Abandoned" stackId="1" stroke="#F43F5E" fill="#F43F5E" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Recovered" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.8} />
                <Area type="monotone" dataKey="Purchased" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Action Effectiveness Bar Chart */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl h-[450px]">
          <h2 className="text-lg font-semibold text-white mb-6">Interaction Funnel</h2>
          <div className="flex h-full flex-col justify-center px-8 space-y-8">
            <FunnelBar label="Messages Sent" value={metrics.messages_sent || 0} max={metrics.messages_sent || 1} color="bg-blue-500" source={sources.messages_sent} />
            <FunnelBar label="Clicks" value={metrics.clicks || 0} max={metrics.messages_sent || 1} color="bg-brand-500" source={sources.clicks} />
            <FunnelBar label="Conversions" value={metrics.conversions || 0} max={metrics.messages_sent || 1} color="bg-emerald-500" source={sources.conversions} />
          </div>
        </div>
      </div>
      
      <ExplainMetricsPanel metrics={metrics} sources={sources} />
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, source }) {
  let displaySource = source;
  if (source && source.includes("estimated") || source?.includes("seeded") || source?.includes("baseline")) {
    displaySource = "Demo baseline + live overlay";
  }

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
        </div>
        <div className="mt-1">
          <Badge source={displaySource} />
        </div>
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max, color, source }) {
  const percentage = Math.max(5, (value / max) * 100);
  let displaySource = source;
  if (source && source.includes("estimated") || source?.includes("seeded") || source?.includes("baseline")) {
    displaySource = "Demo baseline + live overlay";
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-1 font-medium">
        <div className="flex items-center">
          <span className="text-gray-300 text-sm">{label}</span>
          <span className="ml-2"><Badge source={displaySource} /></span>
        </div>
        <span className="text-white font-mono">{value}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-4">
        <div className={`h-4 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function Badge({ source }) {
  if (!source) return null;
  return (
    <span className="bg-gray-800/80 text-gray-400 border border-gray-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider inline-block">
      {source}
    </span>
  );
}

function ExplainMetricsPanel({ metrics, sources }) {
  const [isOpen, setIsOpen] = useState(false);
  const now = new Date().toLocaleTimeString();

  const details = [
    { label: "Resolved Customers", value: metrics.resolved_customers, source: sources.resolved_customers, formula: "COUNT(customers in SQLite)" },
    { label: "Identity Match Rate", value: metrics.identity_match_rate ? `${metrics.identity_match_rate}%` : null, source: sources.identity_match_rate, formula: "Rule: 84% benchmark" },
    { label: "High Intent Customers", value: metrics.high_intent_customers, source: sources.high_intent_customers, formula: "COUNT(twins WHERE intent_score >= 70)" },
    { label: "Revenue Opportunity", value: metrics.revenue_opportunity ? `₹${metrics.revenue_opportunity.toLocaleString()}` : null, source: sources.revenue_opportunity, formula: "High Intent Customers × ₹2500 AOV × 30% Expected Conv. Rate" },
    { label: "Profile Events", value: metrics.profile_events, source: sources.profile_events, formula: "COUNT(events in SQLite)" },
    { label: "Messages Sent", value: metrics.messages_sent, source: sources.messages_sent, formula: "COUNT(outbound messaging events)" },
    { label: "Clicks", value: metrics.clicks, source: sources.clicks, formula: "COUNT(engagement events)" },
    { label: "Conversions", value: metrics.conversions, source: sources.conversions, formula: "COUNT(events WHERE event_type == 'purchase')" },
    { label: "Revenue Recovered", value: metrics.revenue_recovered ? `₹${metrics.revenue_recovered.toLocaleString()}` : null, source: sources.revenue_recovered, formula: "SUM(purchase value)" },
    { label: "Campaign Cost", value: metrics.campaign_cost ? `₹${metrics.campaign_cost.toLocaleString()}` : null, source: sources.campaign_cost, formula: "MAX(Messages Sent × ₹20, ₹500)" },
    { label: "iROAS", value: metrics.iroas ? `${metrics.iroas}x` : null, source: sources.iroas, formula: "Revenue Recovered / Estimated Campaign Cost" },
    { label: "Conversion Lift", value: metrics.conversion_lift ? `+${metrics.conversion_lift}%` : null, source: sources.conversion_lift, formula: "Rule: +18% based on historical cohort comparison" },
  ];

  return (
    <div className="mt-8 bg-[#111827] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-5 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center text-white font-semibold">
          <Info className="w-5 h-5 mr-3 text-blue-400" />
          Explain Metrics Documentation
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      
      {isOpen && (
        <div className="p-5 border-t border-gray-800 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Metric</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Formula / Logic</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {details.map((row, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-300">{row.label}</td>
                  <td className="px-4 py-3 text-white font-mono">{row.value != null ? row.value : "-"}</td>
                  <td className="px-4 py-3"><Badge source={row.source} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.formula}</td>
                  <td className="px-4 py-3 text-right text-xs">{now}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
