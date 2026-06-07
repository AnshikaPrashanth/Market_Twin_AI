import React, { useEffect, useState } from "react";
import { getSegments, getFatigueHeatmap } from "../api/client";
import { Users, AlertTriangle } from "lucide-react";

export default function AudienceIntelligence() {
  const [segments, setSegments] = useState([]);
  const [heatmap, setHeatmap] = useState([]);

  useEffect(() => {
    getSegments().then(setSegments).catch(console.error);
    getFatigueHeatmap().then(setHeatmap).catch(console.error);
  }, []);

  // Format heatmap data for rendering
  const channels = [...new Set(heatmap.map(h => h.channel))];
  const segmentNames = [...new Set(heatmap.map(h => h.segment))];
  
  const getFatigueColor = (val) => {
    if (val > 70) return "bg-rose-500 text-white";
    if (val > 40) return "bg-amber-400 text-gray-900";
    if (val > 20) return "bg-emerald-300 text-gray-900";
    return "bg-emerald-100 text-gray-700";
  };

  return (
    <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <Users className="w-8 h-8 mr-3 text-purple-500" /> Audience Intelligence
        </h1>
        <p className="text-gray-400 mt-2">Deep dive into segment metrics and channel fatigue.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Segment Table */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <h2 className="text-lg font-semibold text-white mb-6">Audience Segments Details</h2>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#1F2937] rounded-t-lg border-b border-gray-800">
              <tr>
                <th className="px-4 py-3">Segment</th>
                <th className="px-4 py-3">Strategy</th>
                <th className="px-4 py-3 text-right">Opp. (₹)</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-[#1F2937]/50">
                  <td className="px-4 py-4 font-medium text-white">{seg.segment}</td>
                  <td className="px-4 py-4 text-brand-300 text-xs font-semibold">{seg.recommended_strategy}</td>
                  <td className="px-4 py-4 text-emerald-400 font-mono text-right">{seg.revenue_opportunity.toLocaleString()}</td>
                </tr>
              ))}
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
                  <th className="px-2 py-3 text-left text-xs text-gray-400 font-medium">Segment</th>
                  {channels.map(ch => (
                    <th key={ch} className="px-2 py-3 text-xs text-gray-400 font-medium">{ch}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {segmentNames.map(segName => (
                  <tr key={segName} className="border-t border-gray-800">
                    <td className="px-2 py-4 text-left text-xs font-medium text-gray-300">{segName}</td>
                    {channels.map(ch => {
                      const item = heatmap.find(h => h.segment === segName && h.channel === ch);
                      const val = item ? item.fatigue : 0;
                      return (
                        <td key={ch} className="px-2 py-2">
                          <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center font-bold text-xs ${getFatigueColor(val)}`}>
                            {val}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
