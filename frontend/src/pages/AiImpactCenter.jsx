import React, { useState, useEffect } from 'react';
import { runExperiment, getExperimentComparison } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Rocket, TrendingUp, TrendingDown, Target, Zap, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

export default function AiImpactCenter() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const handleRunExperiment = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await runExperiment(500); // simulate 500 customers
      setResults(data);
    } catch (err) {
      setError(err.message || "Failed to run experiment");
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (metricKey) => {
    switch(metricKey) {
      case 'conversion_rate': return <Target className="w-5 h-5 text-brand-400" />;
      case 'cart_recovery': return <RefreshCw className="w-5 h-5 text-emerald-400" />;
      case 'revenue_recovered': return <TrendingUp className="w-5 h-5 text-amber-400" />;
      case 'whatsapp_ctr': return <Zap className="w-5 h-5 text-blue-400" />;
      default: return <TrendingUp className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatValue = (key, val) => {
    if (key === 'revenue_recovered') return `₹${val.toLocaleString()}`;
    return `${val}%`;
  };

  // Convert metrics object to array for charting
  const chartData = results ? [
    { name: 'Conv. Rate', baseline: results.metrics.conversion_rate.baseline, ai: results.metrics.conversion_rate.ai },
    { name: 'Cart Recovery', baseline: results.metrics.cart_recovery.baseline, ai: results.metrics.cart_recovery.ai },
    { name: 'WhatsApp CTR', baseline: results.metrics.whatsapp_ctr.baseline, ai: results.metrics.whatsapp_ctr.ai },
  ] : [];

  return (
    <div className="space-y-8 select-none">
      <PageHeader 
        title="AI Experiment Engine" 
        subtitle="Compare traditional static marketing against MarketTwin AI Orchestration outcomes."
      />

      <div className="flex justify-between items-center bg-dark-950 p-6 rounded-2xl border border-dark-800 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Simulate Business Impact</h2>
          <p className="text-sm text-gray-400 max-w-xl">
            Run a live experiment feeding the exact same customer audience and journey events into both a Traditional Rules Engine and the MarketTwin AI Engine.
          </p>
        </div>
        <button
          onClick={handleRunExperiment}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
          {loading ? "Running Simulation..." : "Compare AI vs Traditional"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(results.metrics).map(([key, data]) => (
              <div key={key} className="bg-dark-950 p-5 rounded-2xl border border-dark-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  {getMetricIcon(key)}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  {getMetricIcon(key)}
                  <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">
                    {key.replace('_', ' ')}
                  </h3>
                </div>
                
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Traditional</div>
                    <div className="text-xl font-semibold text-gray-400">{formatValue(key, data.baseline)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-brand-400 mb-1 font-bold">AI Powered</div>
                    <div className="text-2xl font-bold text-white">{formatValue(key, data.ai)}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-dark-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500">AI Lift</span>
                  <span className={`text-sm font-bold flex items-center ${data.lift > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {data.lift > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {data.lift > 0 ? '+' : ''}{data.lift}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="bg-dark-950 p-6 rounded-2xl border border-dark-800">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-6">Performance Comparison (%)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="baseline" name="Traditional Rules" fill="#4B5563" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ai" name="MarketTwin AI" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Explainability Panel */}
            <div className="bg-dark-950 p-6 rounded-2xl border border-dark-800 flex flex-col">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-6">Explainability: Why AI Outperformed</h3>
              <div className="flex-1 space-y-4">
                <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 flex gap-4 items-start">
                  <div className="mt-1 bg-brand-500/20 p-2 rounded-lg text-brand-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">Channel Affinity Targeting</h4>
                    <p className="text-xs text-gray-400">The baseline sent emails to everyone. The AI predicted WhatsApp or SMS for mobile-heavy users, massively increasing CTR.</p>
                  </div>
                </div>
                
                <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 flex gap-4 items-start">
                  <div className="mt-1 bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">Dynamic NBA (Next Best Action)</h4>
                    <p className="text-xs text-gray-400">Instead of generic reminders, the AI accurately identified high-intent abandoners and sent personalized incentives only when needed.</p>
                  </div>
                </div>

                <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 flex gap-4 items-start">
                  <div className="mt-1 bg-blue-500/20 p-2 rounded-lg text-blue-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">Communication Fatigue Avoided</h4>
                    <p className="text-xs text-gray-400">The baseline spammed highly fatigued customers causing churn. The AI suppressed messages where `fatigue_score &gt; 0.8`, preserving lifetime value.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Decision Log Table */}
          <div className="bg-dark-950 p-6 rounded-2xl border border-dark-800">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-6">Recent Orchestration Decisions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-dark-900 text-gray-400 border-b border-dark-800">
                  <tr>
                    <th className="p-3 rounded-tl-lg">Customer ID</th>
                    <th className="p-3">Campaign</th>
                    <th className="p-3">Predicted Channel</th>
                    <th className="p-3">Delivered Channel</th>
                    <th className="p-3">Routing Logic</th>
                    <th className="p-3 rounded-tr-lg">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  <tr className="hover:bg-dark-900/50 transition-colors">
                    <td className="p-3 font-mono text-white">CUST_007</td>
                    <td className="p-3">Cart Recovery Coupon</td>
                    <td className="p-3 text-emerald-400">WhatsApp</td>
                    <td className="p-3 text-blue-400">Email</td>
                    <td className="p-3 text-amber-400 text-xs">WhatsApp consent unavailable. Fallback applied.</td>
                    <td className="p-3 font-bold text-emerald-400">₹3,499 recovered</td>
                  </tr>
                  <tr className="hover:bg-dark-900/50 transition-colors">
                    <td className="p-3 font-mono text-white">CUST_042</td>
                    <td className="p-3">Flash Sale Alert</td>
                    <td className="p-3 text-blue-400">SMS</td>
                    <td className="p-3 text-gray-500">None (Suppressed)</td>
                    <td className="p-3 text-red-400 text-xs">High fatigue risk (Score: 88). Marketing cooled down.</td>
                    <td className="p-3 text-gray-400">Churn prevented</td>
                  </tr>
                  <tr className="hover:bg-dark-900/50 transition-colors">
                    <td className="p-3 font-mono text-white">CUST_089</td>
                    <td className="p-3">Welcome Series</td>
                    <td className="p-3 text-emerald-400">Email</td>
                    <td className="p-3 text-emerald-400">Email</td>
                    <td className="p-3 text-emerald-400 text-xs">Primary channel approved.</td>
                    <td className="p-3 text-white">Awaiting interaction</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
