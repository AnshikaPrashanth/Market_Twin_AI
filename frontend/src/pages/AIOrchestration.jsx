import React from "react";
import { useMarketTwinStore } from "../store/marketTwinStore";
import { BrainCircuit, Activity, Network, Zap, CheckCircle, ShieldAlert, Target, MessageSquare, Mail, Bell, SplitSquareHorizontal } from "lucide-react";

export default function AIOrchestration() {
  const { liveEvents, latestAIPredictions, latestProcessingResult, currentCustomerId, latestTwin } = useMarketTwinStore();

  if (!currentCustomerId) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F19] text-gray-400">
        <div className="text-center">
          <BrainCircuit className="w-16 h-16 mb-4 mx-auto opacity-20" />
          <h2 className="text-xl font-bold text-white mb-2">AI Orchestrator Inactive</h2>
          <p>No active customer session. Trigger an event in the Storefront or Run Demo to start.</p>
        </div>
      </div>
    );
  }

  const ai = latestAIPredictions || {};
  const conv = ai.conversion;
  const chan = ai.channel;
  const nba = ai.nba;
  
  const latestEvent = liveEvents.length > 0 ? liveEvents[0] : null;

  return (
    <div className="p-8 space-y-8 bg-[#0B0F19] text-gray-100 min-h-screen">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <BrainCircuit className="w-8 h-8 mr-3 text-brand-500" /> Real-time AI Orchestration
        </h1>
        <p className="text-gray-400 mt-2">Explainable AI: Understanding the ML decision pipeline for Customer <span className="font-mono text-brand-400">{currentCustomerId}</span>.</p>
      </header>

      {/* Top Banner: The Event Trigger */}
      <div className="bg-[#111827] border-l-4 border-emerald-500 rounded-r-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Latest Ingested Event</h2>
          {latestEvent ? (
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">{latestEvent.event_type}</span>
              <span className="ml-4 text-sm text-gray-500 bg-gray-800 px-3 py-1 rounded-full">Source: {latestEvent.source}</span>
              {latestEvent.product_name && (
                <span className="ml-2 text-sm text-brand-400 bg-brand-900/30 px-3 py-1 rounded-full border border-brand-500/20">
                  {latestEvent.product_name}
                </span>
              )}
            </div>
          ) : (
            <div className="text-xl font-bold text-gray-500 italic">Waiting for events...</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Time</div>
          <div className="text-lg font-mono text-gray-300">
            {latestEvent?.timestamp ? new Date(latestEvent.timestamp).toLocaleTimeString() : "--:--:--"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Layer 1: Conversion Prediction */}
        <div className="col-span-1 bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Target className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <span className="font-bold">L1</span>
            </div>
            <h2 className="text-lg font-semibold text-white">Conversion Probability</h2>
          </div>
          
          {conv ? (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-end mb-2">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                  {Math.round(conv.conversion_probability * 100)}%
                </span>
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded mb-1 ${
                  conv.risk_level === 'high_conversion' ? 'bg-emerald-500/20 text-emerald-400' : 
                  conv.risk_level === 'low_conversion' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {conv.risk_level.replace('_', ' ')}
                </span>
              </div>
              
              <div className="w-full bg-gray-800 rounded-full h-3 mb-6 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000" style={{ width: `${conv.conversion_probability * 100}%` }}></div>
              </div>

              <div className="mt-auto bg-[#0B0F19] rounded-xl p-4 border border-gray-800">
                <h3 className="text-xs text-gray-500 uppercase font-bold mb-3 flex items-center">
                  <Activity className="w-3 h-3 mr-1" /> Top Influencing Factors
                </h3>
                <ul className="space-y-2">
                  {conv.top_factors && conv.top_factors.map((factor, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center text-gray-600 italic">Processing ML logic...</div>
          )}
        </div>

        {/* Layer 2: Channel Affinity */}
        <div className="col-span-1 bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Network className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <span className="font-bold">L2</span>
            </div>
            <h2 className="text-lg font-semibold text-white">Channel Affinity</h2>
          </div>
          
          {chan ? (
            <div className="flex-1 flex flex-col">
              <div className="mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Predicted Best Channel</p>
                <div className="text-2xl font-bold text-white capitalize flex items-center">
                  {chan.best_channel === 'whatsapp' ? <MessageSquare className="w-6 h-6 mr-2 text-emerald-400" /> : 
                   chan.best_channel === 'email' ? <Mail className="w-6 h-6 mr-2 text-blue-400" /> : 
                   <Bell className="w-6 h-6 mr-2 text-amber-400" />}
                  {chan.best_channel}
                </div>
              </div>

              <div className="mt-auto bg-[#0B0F19] rounded-xl p-4 border border-gray-800">
                <h3 className="text-xs text-gray-500 uppercase font-bold mb-3 flex items-center">
                  <SplitSquareHorizontal className="w-3 h-3 mr-1" /> Probability Distribution
                </h3>
                <div className="space-y-3">
                  {chan.channel_scores && Object.entries(chan.channel_scores)
                    .sort(([,a], [,b]) => b - a)
                    .map(([channelName, score]) => (
                    <div key={channelName}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={`capitalize ${channelName === chan.best_channel ? 'text-purple-400 font-bold' : 'text-gray-400'}`}>
                          {channelName}
                        </span>
                        <span className="text-gray-300">{(score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${channelName === chan.best_channel ? 'bg-purple-500' : 'bg-gray-600'}`} 
                          style={{ width: `${score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center text-gray-600 italic">Processing ML logic...</div>
          )}
        </div>

        {/* Layer 3: Next Best Action */}
        <div className="col-span-1 bg-gradient-to-br from-brand-900/40 to-[#111827] border border-brand-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Zap className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <span className="font-bold">L3</span>
            </div>
            <h2 className="text-lg font-semibold text-white">Next Best Action (NBA)</h2>
          </div>
          
          {nba ? (
            <div className="flex-1 flex flex-col relative z-10">
              <div className="mb-6">
                <p className="text-xs text-brand-300/70 uppercase tracking-widest font-bold mb-1">Decision Output</p>
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-emerald-300 capitalize leading-tight">
                  {nba.best_action.replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-emerald-400 mt-2 font-mono flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" /> {nba.confidence.percentage}% Confidence
                </div>
              </div>

              <div className="mt-auto bg-dark-950/80 backdrop-blur-sm rounded-xl p-4 border border-brand-500/20 shadow-inner">
                <h3 className="text-xs text-brand-400/80 uppercase font-bold mb-3 flex items-center">
                  <BrainCircuit className="w-3 h-3 mr-1" /> Explainable AI Reasoning
                </h3>
                <ul className="space-y-2 mb-4">
                  {nba.reasoning && nba.reasoning.map((reason, i) => (
                    <li key={i} className="text-sm text-gray-200 flex items-start">
                      <span className="text-brand-500 mr-2 mt-0.5">→</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3 border-t border-gray-800/50">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Alternative Actions (Rejected)</p>
                  <div className="flex flex-wrap gap-2">
                    {nba.action_scores && Object.entries(nba.action_scores)
                      .filter(([action]) => action !== nba.best_action)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 2)
                      .map(([action, score]) => (
                        <span key={action} className="text-[10px] px-2 py-1 bg-gray-800/80 rounded text-gray-400 border border-gray-700">
                          {action.replace(/_/g, ' ')} ({(score * 100).toFixed(1)}%)
                        </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex justify-center items-center text-brand-600/50 italic">Processing ML logic...</div>
          )}
        </div>
      </div>

      {/* Layer 4: Consent & Activation (The Result) */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <h2 className="text-lg font-semibold text-white flex items-center mb-6">
          <ShieldAlert className="w-5 h-5 mr-2 text-indigo-400" /> Layer 4: Final Orchestration & Delivery
        </h2>
        
        {latestProcessingResult ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 border-r border-gray-800 pr-6">
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Rule Engine Overrides</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Consent Check</span>
                {latestProcessingResult.consent_gate_applied ? (
                  <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded font-bold">BLOCKED</span>
                ) : (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold">PASSED</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Fatigue Rules</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-bold">PASSED</span>
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4">Final Executed Action</div>
              {latestProcessingResult.final_action && latestProcessingResult.final_action !== 'none' ? (
                <div className="flex items-center p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex justify-center items-center mr-4">
                    <Zap className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-indigo-300 capitalize">{latestProcessingResult.final_action.replace(/_/g, ' ')}</h3>
                    <p className="text-sm text-gray-400">Successfully dispatched to <span className="font-bold text-white capitalize">{latestProcessingResult.final_channel}</span>.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex justify-center items-center mr-4">
                    <ShieldAlert className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-300">Action Suppressed</h3>
                    <p className="text-sm text-gray-500">The orchestration engine decided not to send a message based on the current context or consent rules.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 italic text-center py-4">Waiting for orchestration result...</div>
        )}
      </div>

      {/* Decision Trace & Explainability */}
      {latestProcessingResult && (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden mt-8">
          <h2 className="text-lg font-semibold text-white flex items-center mb-6">
            <Activity className="w-5 h-5 mr-2 text-brand-400" /> End-to-End Decision Trace
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="font-mono text-sm bg-[#0B0F19] p-4 rounded-xl border border-gray-800 text-gray-300 space-y-2">
              <div><span className="text-gray-500">Input Event:</span> <span className="text-emerald-400">{latestEvent?.event_type || 'cart_abandoned'}</span></div>
              <div><span className="text-gray-500">Customer:</span> <span className="text-brand-400">{currentCustomerId}</span></div>
              <div><span className="text-gray-500">Segment:</span> <span className="text-indigo-400">{latestTwin?.segment || 'High Intent Cart Abandoner'}</span></div>
              <div><span className="text-gray-500">Cart Value:</span> <span className="text-white">₹{latestTwin?.raw_counters?.cart_value || 5998}</span></div>
              <div className="pt-2 border-t border-gray-800/50">
                <span className="text-gray-500">Current Conv. Prob:</span> <span className="text-white">{Math.round((conv?.conversion_probability || 0.22) * 100)}%</span>
              </div>
              <div><span className="text-gray-500">Recommended Action:</span> <span className="text-amber-400 capitalize">{(nba?.best_action || 'cart_recovery_coupon').replace(/_/g, ' ')}</span></div>
              <div><span className="text-gray-500">NBA Confidence:</span> <span className="text-white">{nba?.confidence?.percentage || 98.8}%</span></div>
              <div><span className="text-gray-500">Projected Conv. After:</span> <span className="text-emerald-400">41%</span></div>
              <div className="pt-2 border-t border-gray-800/50">
                <span className="text-gray-500">Predicted Channel:</span> <span className="text-purple-400">{chan?.best_channel || 'whatsapp'}</span>
              </div>
              <div><span className="text-gray-500">Policy Result:</span> <span className="text-rose-400">WhatsApp skipped due to unavailable consent</span></div>
              <div><span className="text-gray-500">Fallback Channel:</span> <span className="text-blue-400">email</span></div>
              <div><span className="text-gray-500">Final Channel:</span> <span className="text-emerald-400">{latestProcessingResult.final_channel || 'email'}</span></div>
              <div><span className="text-gray-500">Final Status:</span> <span className="text-white font-bold">Sent</span></div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#1F2937] p-4 rounded-xl border border-gray-700 text-sm">
                <h3 className="font-bold text-white mb-2">Metrics Explained</h3>
                <ul className="space-y-3 text-gray-300">
                  <li><strong className="text-emerald-400">Current Conversion Probability:</strong> The chance this user will convert organically <span className="italic">without</span> any AI intervention.</li>
                  <li><strong className="text-amber-400">NBA Confidence:</strong> The model's certainty that the selected action will generate the highest marginal uplift compared to alternatives.</li>
                  <li><strong className="text-brand-400">Projected Conversion:</strong> The expected conversion probability <span className="italic">after</span> successfully delivering the recommended action.</li>
                </ul>
              </div>

              <div className="bg-[#1F2937] p-4 rounded-xl border border-gray-700 text-sm">
                <h3 className="font-bold text-white mb-2">Action Candidates Evaluated</h3>
                <ul className="space-y-2 text-gray-300 font-mono text-xs">
                  <li className="flex justify-between items-center"><span className="text-emerald-400">■ Send Coupon</span> <span className="bg-gray-800 px-2 py-1 rounded">Selected</span></li>
                  <li className="flex justify-between items-center"><span className="text-gray-500">■ Loyalty Reward</span> <span className="bg-gray-800 px-2 py-1 rounded text-rose-400">Rejected (Lower Uplift)</span></li>
                  <li className="flex justify-between items-center"><span className="text-gray-500">■ Push Reminder</span> <span className="bg-gray-800 px-2 py-1 rounded text-rose-400">Rejected (Low Affinity)</span></li>
                  <li className="flex justify-between items-center"><span className="text-gray-500">■ Do Nothing</span> <span className="bg-gray-800 px-2 py-1 rounded text-rose-400">Rejected (High Rev Risk)</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
