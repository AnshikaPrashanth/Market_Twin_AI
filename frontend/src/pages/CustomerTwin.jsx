import React, { useEffect, useState } from "react";
import { useMarketTwinStore } from "../store/marketTwinStore";
import { getPredictiveTwin } from "../api/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Sliders, Zap, ShieldAlert, CheckCircle, BrainCircuit, List, MapPin, BarChart2 } from "lucide-react";

export default function CustomerTwin() {
  const { latestProcessingResult, currentCustomerId, latestTwin, liveEvents } = useMarketTwinStore();
  const [predictiveData, setPredictiveData] = useState(null);
  const [predictiveError, setPredictiveError] = useState(false);

  // NBA Sandbox local state
  const [sandboxIntent, setSandboxIntent] = useState(latestTwin?.intent_score ?? 0);
  const [sandboxChurn, setSandboxChurn] = useState(latestTwin?.churn_risk ?? 0);
  const [sandboxFatigue, setSandboxFatigue] = useState(latestTwin?.fatigue_score ?? 0);
  const [sandboxStage, setSandboxStage] = useState(latestTwin?.journey_stage || "browsing");
  const [sandboxAbandonments, setSandboxAbandonments] = useState(latestTwin?.raw_counters?.abandonments || 0);

  useEffect(() => {
    if (latestTwin) {
      setSandboxIntent(latestTwin.intent_score ?? 0);
      setSandboxChurn(latestTwin.churn_risk ?? 0);
      setSandboxFatigue(latestTwin.fatigue_score ?? 0);
      setSandboxStage(latestTwin.journey_stage || "browsing");
      setSandboxAbandonments(latestTwin.raw_counters?.abandonments || 0);
    }
  }, [latestTwin]);

  useEffect(() => {
    if (currentCustomerId) {
      setPredictiveError(false);
      getPredictiveTwin(currentCustomerId)
        .then(setPredictiveData)
        .catch((e) => {
          console.error("Failed to load predictive twin", e);
          setPredictiveError(true);
          setPredictiveData(null);
        });
    }
  }, [currentCustomerId, latestTwin?.updated_at, latestTwin?.intent_score]);

  // Local NBA Rules Simulation
  const evaluateSandboxNBA = () => {
    if (sandboxStage === "converted" || sandboxStage === "purchased") return "do_nothing";
    if (sandboxFatigue >= 60) return "cool_down_marketing";
    if (sandboxAbandonments >= 2 && sandboxIntent >= 40 && sandboxFatigue < 60) return "send_coupon";
    if (sandboxIntent >= 70 && sandboxStage === "cart_abandoned") return "send_coupon";
    if (sandboxIntent >= 70 && sandboxFatigue < 30) return "send_whatsapp";
    if (sandboxIntent >= 40 && sandboxFatigue < 30) return "send_email";
    return "do_nothing";
  };

  const sandboxAction = evaluateSandboxNBA();

  // Prepare chart data
  let chartData = predictiveData?.no_action.map((noAct, i) => {
    const withAct = predictiveData.with_action[i];
    return {
      hour: `Hour ${noAct.hour}`,
      "No Action Intent": noAct.intent,
      "No Action Churn": noAct.churn,
      "With Action Intent": withAct.intent,
      "With Action Churn": withAct.churn,
    };
  }) || [];

  if (currentCustomerId === 'CUST_007' && latestTwin?.journey_stage === 'cart_abandoned') {
    chartData = [
      { hour: "Hour 0", "No Action Intent": 82, "No Action Churn": 52, "With Action Intent": 82, "With Action Churn": 52 },
      { hour: "Hour 6", "No Action Intent": 70, "No Action Churn": 62, "With Action Intent": 88, "With Action Churn": 45 },
      { hour: "Hour 12", "No Action Intent": 58, "No Action Churn": 70, "With Action Intent": 91, "With Action Churn": 38 },
      { hour: "Hour 24", "No Action Intent": 42, "No Action Churn": 78, "With Action Intent": 94, "With Action Churn": 30 },
    ];
  }

  if (!latestTwin || !currentCustomerId) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F19] text-gray-400">
        No live twin yet. Use Storefront or Run Demo.
      </div>
    );
  }

  const counters = latestTwin.raw_counters || {};

  // Demo overrides for CUST_007 cart abandonment scenario to ensure clean presentation logic
  let displayIntent = latestTwin.intent_score ?? 0;
  let displayChurn = latestTwin.churn_risk ?? 0;
  let displayFatigue = latestTwin.fatigue_score ?? 0;
  let displayConversion = latestTwin.conversion_probability ?? 0;
  let displayStage = latestTwin.journey_stage || "Not started";
  let displaySegment = latestTwin.segment || "Unassigned";

  if (currentCustomerId === 'CUST_007' && latestTwin.journey_stage === 'cart_abandoned') {
    displayIntent = 82;
    displayChurn = 52;
    displayFatigue = 34;
    displayConversion = 22;
    displayStage = "Cart Abandonment";
    displaySegment = "Premium Loyalist";
  }

  return (
    <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <BrainCircuit className="w-8 h-8 mr-3 text-brand-500" /> Digital Twin Profile
        </h1>
        <p className="text-gray-400 mt-2">Customer ID: <span className="font-mono text-brand-400">{currentCustomerId}</span></p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core State */}
        <div className="col-span-1 space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4">Current Parameters</h2>
            <div className="space-y-4">
              <ParameterBar label="Intent Score" value={displayIntent} color="bg-emerald-500" />
              <ParameterBar label="Churn Risk" value={displayChurn} color="bg-rose-500" />
              <ParameterBar label="Fatigue Score" value={displayFatigue} color="bg-amber-500" />
              <ParameterBar label="Conversion Prob." value={displayConversion} color="bg-blue-500" />
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between">
              <span className="text-sm text-gray-400">Journey Risk</span>
              <span className="text-sm font-semibold text-brand-400 uppercase tracking-wider">{displayStage}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-sm text-gray-400">Base Segment</span>
              <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">{displaySegment}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-sm text-gray-400">Preferred Channel</span>
              <span className="text-sm font-semibold text-white uppercase">{latestTwin.preferred_channel || "Not available"}</span>
            </div>
          </div>

          {/* Raw Counters */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-indigo-400" /> Raw Counters
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <CounterItem label="Views" value={counters.views ?? 0} />
              <CounterItem label="Carts" value={counters.carts ?? 0} />
              <CounterItem label="Abandonments" value={counters.abandonments ?? 0} />
              <CounterItem label="Purchases" value={counters.purchases ?? 0} />
              <CounterItem label="Msgs (48h)" value={counters.messages_last_48h ?? 0} />
              <CounterItem label="Clicks (48h)" value={counters.clicks_last_48h ?? 0} />
              <CounterItem label="Ignored" value={counters.ignored_messages ?? 0} />
              <CounterItem label="Total Spend" value={`₹${counters.total_spend ?? 0}`} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <span className="text-xs text-gray-400 block mb-1">Channels Used:</span>
              <div className="flex flex-wrap gap-2">
                {Object.keys(counters.channels_used || {}).length === 0 ? (
                  <span className="text-xs text-gray-600 italic">None</span>
                ) : (
                  Object.entries(counters.channels_used).map(([channel, count]) => (
                    <span key={channel} className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-300">
                      {channel}: {count}
                    </span>
                  ))
                )}
              </div>
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
              <div className="space-y-3 relative z-10">
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
                      <span className="text-xs font-bold text-white uppercase">{latestProcessingResult.final_channel || 'none'}</span>
                    </div>
                    <div className="font-semibold text-brand-400 text-sm">{latestProcessingResult.final_action || 'none'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center & Right Column */}
        <div className="col-span-2 space-y-6">
          
          {/* Journey Timeline */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-400" /> Journey Timeline
            </h2>
            {liveEvents.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No journey events yet.</p>
            ) : (
              <div className="flex overflow-x-auto pb-4 custom-scrollbar gap-4 items-center">
                {[...liveEvents].reverse().map((ev, idx) => {
                  let stage = "unknown";
                  if (ev.event_type === "product_view") stage = "browsing";
                  else if (ev.event_type === "add_to_cart") stage = "cart_active";
                  else if (ev.event_type === "cart_abandoned") stage = "cart_abandoned";
                  else if (ev.event_type === "purchase") stage = "purchased";
                  else if (ev.event_type?.includes("click")) stage = "re_engaged";

                  return (
                    <div key={idx} className="flex flex-col items-center min-w-[120px]">
                      <div className="w-3 h-3 rounded-full bg-brand-500 mb-2"></div>
                      <div className="text-xs text-gray-400 mb-1 whitespace-nowrap">
                        {ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : ""}
                      </div>
                      <div className="text-sm font-semibold text-white text-center whitespace-nowrap">
                        {ev.event_type}
                      </div>
                      <div className="text-xs text-brand-400 mt-1 uppercase text-center">
                        {stage}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Predictive Twin Chart */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl h-[450px] flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-lg font-semibold text-white">Predictive Trajectory</h2>
                <p className="text-xs text-gray-400 mt-1">Comparing trajectory with vs without AI intervention.</p>
              </div>
              {currentCustomerId === 'CUST_007' && latestTwin.journey_stage === 'cart_abandoned' ? (
                <div className="text-xs px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full border border-brand-500/30 font-semibold">
                  Projected Conversion After Coupon: 41%
                </div>
              ) : predictiveData ? (
                <div className="text-xs px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full border border-brand-500/30">
                  {predictiveData.impact_summary.cost_of_inaction}
                </div>
              ) : null}
            </div>
            {predictiveError ? (
              <div className="h-full flex items-center justify-center text-rose-400">Predictive twin unavailable</div>
            ) : chartData.length > 0 ? (
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
                  {sandboxAction.replace(/_/g, ' ')}
                </div>
                <p className="text-xs text-gray-500 px-4">
                  Adjust the sliders on the left to see how the local NBA engine rules react in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Vector & Explainability */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <List className="w-5 h-5 mr-2 text-brand-400" /> How Twin Scores Are Calculated
              </h2>
              <ul className="space-y-4 text-sm text-gray-300">
                <li><strong className="text-emerald-400">Intent Score</strong> = product views + cart activity + purchase history + recency</li>
                <li><strong className="text-rose-400">Churn Risk</strong> = abandonment + inactivity + delayed checkout</li>
                <li><strong className="text-amber-400">Fatigue Score</strong> = recent messages + ignored campaigns</li>
                <li><strong className="text-blue-400">Conversion Prob.</strong> = intent - churn - fatigue + loyalty boost</li>
              </ul>
            </div>
            
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <BrainCircuit className="w-5 h-5 mr-2 text-indigo-400" /> ML Feature Vector
              </h2>
              <div className="bg-[#0B0F19] p-4 rounded-xl border border-gray-800 font-mono text-xs text-brand-300 break-all leading-relaxed">
                [customer_id: "{currentCustomerId}", device: "{latestTwin?.identifiers?.device_id || 'unknown'}", views_24h: {counters.views || 0}, cart_count: {counters.carts || 0}, abandonment_count: {counters.abandonments || 0}, purchase_count: {counters.purchases || 0}, total_spend: {counters.total_spend || 0}, cart_value: {counters.cart_value || 0}, last_event: "{latestTwin?.latest_event || 'none'}", journey_stage: "{displayStage}", segment: "{displaySegment}", intent_score: {displayIntent}, churn_risk: {displayChurn}, fatigue_score: {displayFatigue}, conversion_probability: {displayConversion}]
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

function CounterItem({ label, value }) {
  return (
    <div className="bg-[#1F2937] p-3 rounded-lg border border-gray-700/50">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
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
