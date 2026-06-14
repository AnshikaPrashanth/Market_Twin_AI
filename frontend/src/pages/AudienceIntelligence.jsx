import React, { useEffect, useState, useCallback } from "react";
import { getAudienceSegments, getFatigueHeatmap } from "../api/client";
import { useMarketTwinStore } from "../store/marketTwinStore";
import { Users, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";

export default function AudienceIntelligence() {
  const [segments, setSegments] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { latestProcessingResult, liveEvents } = useMarketTwinStore();

  const fetchAudienceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const segData = await getAudienceSegments();
      setSegments(segData || []);
      const heatData = await getFatigueHeatmap();
      setHeatmap(heatData || []);
    } catch (e) {
      console.error("Failed to load audience data", e);
      setError("Unable to load audience intelligence from backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudienceData();
  }, [fetchAudienceData]);

  // Refetch when certain events occur or events list length changes
  useEffect(() => {
    const triggerEvents = [
      "cart_abandoned", "purchase", "email_sent", "whatsapp_sent", 
      "push_sent", "email_click", "whatsapp_click", "unsubscribe"
    ];

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
      fetchAudienceData();
    }
  }, [latestProcessingResult, liveEvents.length, fetchAudienceData]);

  if (error) {
    return (
      <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-rose-400 flex items-center"><AlertCircle className="mr-2" /> {error}</div>
      </div>
    );
  }

  if (loading && segments.length === 0) {
    return (
      <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-gray-400 flex items-center"><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading audience data...</div>
      </div>
    );
  }

  // Format heatmap data for rendering
  const channels = ["WhatsApp", "Email", "Push", "Website"]; // Ensuring stable columns
  const segmentNames = [...new Set((heatmap || []).map(h => h.segment))];
  if (segmentNames.length === 0 && segments.length > 0) {
     segments.forEach(s => segmentNames.push(s.segment));
  }
  
  const getFatigueColor = (val) => {
    if (val >= 70) return "bg-rose-500 text-white"; // Saturated
    if (val >= 40) return "bg-amber-400 text-gray-900"; // Caution
    return "bg-emerald-300 text-gray-900"; // Safe (0-39)
  };

  const getFatigueLabel = (val) => {
    if (val >= 70) return "Saturated";
    if (val >= 40) return "Caution";
    return "Safe";
  };

  return (
    <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
              <Users className="w-8 h-8 mr-3 text-purple-500" /> Aggregated Segment Intelligence
            </h1>
            <p className="text-gray-400 mt-2 flex items-center">
              Deep dive into cohort-level segment metrics and channel fatigue.
              <span className="ml-3 text-[10px] uppercase font-bold tracking-wider bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">Demo Cohort Analytics</span>
            </p>
          </div>
        </div>
      </header>

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl mb-8">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Rule-Based Demo Segmentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-400">
          <div className="bg-[#1F2937] p-3 rounded-lg border border-gray-700/50">
            <strong className="text-white block mb-1">High Intent Cart Abandoners</strong>
            intent {'>'} 70% AND cart abandoned
          </div>
          <div className="bg-[#1F2937] p-3 rounded-lg border border-gray-700/50">
            <strong className="text-white block mb-1">Premium Loyalists</strong>
            high LTV AND low churn
          </div>
          <div className="bg-[#1F2937] p-3 rounded-lg border border-gray-700/50">
            <strong className="text-white block mb-1">Window Shoppers</strong>
            browsing high, cart activity low
          </div>
          <div className="bg-[#1F2937] p-3 rounded-lg border border-gray-700/50">
            <strong className="text-white block mb-1">Deal Seekers</strong>
            coupon-sensitive users
          </div>
          <div className="bg-[#1F2937] p-3 rounded-lg border border-gray-700/50">
            <strong className="text-white block mb-1">Dormant Customers</strong>
            inactive with high churn risk
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Segment Table */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-6">Audience Segments Details</h2>
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-gray-400 uppercase bg-[#1F2937] rounded-t-lg border-b border-gray-800">
              <tr>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Avg LTV</th>
                <th className="px-4 py-3">Avg Intent</th>
                <th className="px-4 py-3">Avg Churn</th>
                <th className="px-4 py-3">Avg Fatigue</th>
                <th className="px-4 py-3">Best Channel</th>
                <th className="px-4 py-3 text-right">Opp. (₹)</th>
                <th className="px-4 py-3 text-right">Strategy</th>
              </tr>
            </thead>
            <tbody>
              {segments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500 italic">No segments available.</td>
                </tr>
              ) : (
                segments.map((seg, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-[#1F2937]/50">
                    <td className="px-4 py-4 font-medium text-white">{seg.segment || "Unknown"}</td>
                    <td className="px-4 py-4 text-gray-300">{seg.size != null ? seg.size : "N/A"}</td>
                    <td className="px-4 py-4 text-emerald-400">{seg.avg_ltv != null ? `₹${seg.avg_ltv}` : "N/A"}</td>
                    <td className="px-4 py-4 text-gray-300">{seg.avg_intent != null ? `${seg.avg_intent}%` : "N/A"}</td>
                    <td className="px-4 py-4 text-rose-400">{seg.avg_churn != null ? `${seg.avg_churn}%` : "N/A"}</td>
                    <td className="px-4 py-4 text-amber-400">{seg.avg_fatigue != null ? `${seg.avg_fatigue}%` : "N/A"}</td>
                    <td className="px-4 py-4 text-blue-400 uppercase">{seg.best_channel || "N/A"}</td>
                    <td className="px-4 py-4 text-emerald-400 font-mono text-right">{seg.revenue_opportunity != null ? seg.revenue_opportunity.toLocaleString() : "0"}</td>
                    <td className="px-4 py-4 text-brand-300 text-xs font-semibold text-right">{seg.recommended_strategy || "None"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Fatigue Heatmap */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" /> Channel Contact Fatigue
          </h2>
          <p className="text-xs text-gray-400 mb-6">Percentage of audience segment showing signs of marketing fatigue per channel.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead>
                <tr>
                  <th className="px-2 py-3 text-left text-xs text-gray-400 font-medium w-48">Segment</th>
                  {channels.map(ch => (
                    <th key={ch} className="px-2 py-3 text-xs text-gray-400 font-medium">{ch}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {segmentNames.length === 0 ? (
                  <tr>
                    <td colSpan={channels.length + 1} className="px-4 py-8 text-center text-gray-500 italic">No heatmap data available.</td>
                  </tr>
                ) : (
                  segmentNames.map(segName => (
                    <tr key={segName} className="border-t border-gray-800">
                      <td className="px-2 py-4 text-left text-xs font-medium text-gray-300">{segName}</td>
                      {channels.map(ch => {
                        const item = heatmap.find(h => h.segment === segName && h.channel.toLowerCase() === ch.toLowerCase());
                        const val = item ? item.fatigue : 0;
                        const label = getFatigueLabel(val);
                        return (
                          <td key={ch} className="px-2 py-2">
                            <div className={`w-20 h-10 mx-auto rounded-lg flex flex-col items-center justify-center font-bold text-[10px] ${getFatigueColor(val)}`}>
                              <span>{val}%</span>
                              <span className="font-normal opacity-80 uppercase text-[8px] tracking-wider">{label}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
