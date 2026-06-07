import React, { useEffect, useState } from "react";
import { useDemoStore } from "../store/demoStore";
import { useTwinStore } from "../store/twinStore";
import { getPredictiveTwin } from "../api/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Sliders, Zap, ShieldAlert, CheckCircle, BrainCircuit } from "lucide-react";

export default function CustomerTwin() {
  const { latestProcessingResult } = useDemoStore();
  const { selectedCustomerId, twinState } = useTwinStore();
  const [predictiveData, setPredictiveData] = useState(null);

  // NBA Sandbox local state
  const [sandboxIntent, setSandboxIntent] = useState(twinState?.intent_score || 0);
  const [sandboxChurn, setSandboxChurn] = useState(twinState?.churn_risk || 0);
  const [sandboxFatigue, setSandboxFatigue] = useState(twinState?.fatigue_score || 0);
  const [sandboxStage, setSandboxStage] = useState(twinState?.journey_stage || "browsing");
  const [sandboxAbandonments, setSandboxAbandonments] = useState(twinState?.raw_counters?.abandonments || 0);

  useEffect(() => {
    if (twinState) {
      setSandboxIntent(twinState.intent_score);
      setSandboxChurn(twinState.churn_risk);
      setSandboxFatigue(twinState.fatigue_score);
      setSandboxStage(twinState.journey_stage);
      setSandboxAbandonments(twinState.raw_counters?.abandonments || 0);
    }
  }, [twinState]);

  useEffect(() => {
    if (selectedCustomerId) {
      getPredictiveTwin(selectedCustomerId)
        .then(setPredictiveData)
        .catch((e) => console.error("Failed to load predictive twin", e));
    }
  }, [selectedCustomerId]);

  // Local NBA Rules Simulation
  const evaluateSandboxNBA = () => {
    if (sandboxStage === "converted") return "do_nothing";
    if (sandboxFatigue >= 60) return "cool_down_marketing";
    if (sandboxAbandonments >= 2 && sandboxIntent >= 40 && sandboxFatigue < 60) return "send_coupon";
    if (sandboxIntent >= 70 && sandboxStage === "cart_abandoned") return "send_coupon";
    if (sandboxIntent >= 70 && sandboxFatigue < 30) return "send_whatsapp";
    if (sandboxIntent >= 40 && sandboxFatigue < 30) return "send_email";
    return "do_nothing";
  };

  const sandboxAction = evaluateSandboxNBA();

  // Prepare chart data
  const chartData = predictiveData?.no_action.map((noAct, i) => {
    const withAct = predictiveData.with_action[i];
    return {
      hour: `Hour ${noAct.hour}`,
      "No Action Intent": noAct.intent,
      "No Action Churn": noAct.churn,
      "With Action Intent": withAct.intent,
      "With Action Churn": withAct.churn,
    };
  }) || [];

  if (!selectedCustomerId || !twinState) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F19] text-gray-400">
        Waiting for customer context. Run the demo or trigger an event in the Storefront.
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <BrainCircuit className="w-8 h-8 mr-3 text-brand-500" /> Digital Twin Profile
        </h1>
        <p className="text-gray-400 mt-2">Customer ID: <span className="font-mono text-brand-400">{selectedCustomerId}</span></p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core State */}
        <div className="col-span-1 space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Current Parameters</h2>
            <div className="space-y-4">
              <ParameterBar label="Intent Score" value={twinState.intent_score} color="bg-emerald-500" />
              <ParameterBar label="Churn Risk" value={twinState.churn_risk} color="bg-rose-500" />
              <ParameterBar label="Fatigue Score" value={twinState.fatigue_score} color="bg-amber-500" />
              <ParameterBar label="Conversion Prob." value={twinState.conversion_probability} color="bg-blue-500" />
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between">
              <span className="text-sm text-gray-400">Journey Stage</span>
              <span className="text-sm font-semibold text-brand-400 uppercase tracking-wider">{twinState.journey_stage}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-sm text-gray-400">Preferred Channel</span>
              <span className="text-sm font-semibold text-white uppercase">{twinState.preferred_channel}</span>
            </div>
          </div>

          {/* NBA Result */}
          {latestProcessingResult?.nba_decision && (
            <div className="bg-gradient-to-br from-brand-900/40 to-[#111827] border border-brand-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-24 h-24" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-amber-400" /> Live Decision Engine
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-brand-300/70 uppercase">Raw Action</div>
                  <div className="font-semibold text-lg text-white">{latestProcessingResult.nba_decision.action}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-300/70 uppercase">Confidence</div>
                  <div className="text-sm text-gray-300">{(latestProcessingResult.nba_decision.confidence * 100).toFixed(1)}%</div>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-brand-300/70 uppercase mb-1">Reasoning</div>
                  <p className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-brand-500/50 pl-2">
                    {latestProcessingResult.nba_decision.reason}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Consent Gate Applied</span>
                    {latestProcessingResult.consent_gate_applied ? (
                      <span className="flex items-center text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-1 rounded"><ShieldAlert className="w-3 h-3 mr-1" /> YES</span>
                    ) : (
                      <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded"><CheckCircle className="w-3 h-3 mr-1" /> NO</span>
                    )}
                  </div>
                  <div className="mt-3 bg-dark-900/50 p-3 rounded-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500 uppercase">Final Delivery</span>
                      <span className="text-xs font-bold text-white uppercase">{latestProcessingResult.final_channel || 'NONE'}</span>
                    </div>
                    <div className="font-semibold text-brand-400 text-sm">{latestProcessingResult.final_action}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts & Sandbox */}
        <div className="col-span-2 space-y-6">
          {/* Predictive Twin Chart */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Predictive Twin Trajectory</h2>
              {predictiveData && (
                <div className="text-xs px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full border border-brand-500/30">
                  {predictiveData.impact_summary.cost_of_inaction}
                </div>
              )}
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="hour" stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <YAxis stroke="#9CA3AF" tick={{fill: '#9CA3AF', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                    itemStyle={{ fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="No Action Intent" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="No Action Churn" stroke="#F43F5E" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="With Action Intent" stroke="#10B981" strokeWidth={3} dot={{r: 4}} />
                  <Line type="monotone" dataKey="With Action Churn" stroke="#FBBF24" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">Awaiting simulation data...</div>
            )}
          </div>

          {/* NBA What-If Sandbox */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Sliders className="w-5 h-5 mr-2 text-blue-400" /> NBA What-If Sandbox
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <SandboxSlider label="Intent Score" value={sandboxIntent} onChange={setSandboxIntent} color="emerald" />
                <SandboxSlider label="Churn Risk" value={sandboxChurn} onChange={setSandboxChurn} color="rose" />
                <SandboxSlider label="Fatigue Score" value={sandboxFatigue} onChange={setSandboxFatigue} color="amber" />
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300">Journey Stage</label>
                  <select 
                    value={sandboxStage} 
                    onChange={(e) => setSandboxStage(e.target.value)}
                    className="bg-[#1F2937] border border-gray-700 text-sm rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="browsing">Browsing</option>
                    <option value="cart_active">Cart Active</option>
                    <option value="cart_abandoned">Cart Abandoned</option>
                    <option value="converted">Converted</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-300">Abandonments</label>
                  <input 
                    type="number" min="0" max="10" 
                    value={sandboxAbandonments} 
                    onChange={(e) => setSandboxAbandonments(parseInt(e.target.value) || 0)}
                    className="bg-[#1F2937] border border-gray-700 text-sm rounded-lg px-3 py-1.5 w-20 text-white text-center focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <div className="bg-[#0B0F19] rounded-xl p-6 border border-gray-800 flex flex-col justify-center items-center text-center">
                <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest">Simulated Action</p>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-500 mb-4">
                  {sandboxAction}
                </div>
                <p className="text-xs text-gray-500 px-4">
                  Adjust the sliders on the left to see how the local NBA engine rules react in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParameterBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1 font-medium">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

function SandboxSlider({ label, value, onChange, color }) {
  const colorMap = {
    emerald: "accent-emerald-500",
    rose: "accent-rose-500",
    amber: "accent-amber-500",
  };
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-300">{label}</span>
        <span className="font-mono text-gray-400">{value}</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer ${colorMap[color]}`} 
      />
    </div>
  );
}
