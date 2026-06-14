import React from 'react';
import { Send, ShieldAlert, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarketTwinStore } from '../store/marketTwinStore';

export default function SmsInbox() {
  const { messageHistory, currentCustomerId } = useMarketTwinStore();
  const smsHistory = messageHistory.filter(msg => msg.channel === 'sms' || msg.channel === 'push');

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none relative p-8">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <Send className="w-8 h-8 mr-3 text-amber-500" /> SMS & Push Gateway
        </h1>
        <p className="text-gray-400 mt-2">Latest campaign dispatch status and engagement funnel.</p>
      </header>

      {smsHistory.length > 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Latest Dispatches</h2>
          <div className="space-y-4">
            {smsHistory.slice().reverse().map((msg, idx) => (
              <div key={idx} className="bg-[#1F2937] p-6 rounded-xl border border-gray-700/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">MarketTwin Demo Store</h3>
                      <p className="text-xs text-gray-400">To: {currentCustomerId}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Delivered via {msg.channel.toUpperCase()}</span>
                </div>
                <div className="pl-14">
                  <h4 className="text-white font-bold mb-2">{msg.title || "Offer Alert"}</h4>
                  <p className="text-gray-300 text-sm mb-4">{msg.content || msg.text}</p>
                  <Link to="/store" className="inline-block bg-amber-600 text-white px-4 py-2 rounded font-semibold text-sm cursor-pointer hover:bg-amber-500 transition-colors">
                    {msg.call_to_action || "Shop Now"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl text-center py-16">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Message Rejected by AI</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          The Next Best Action engine evaluated SMS and Push channels but rejected them due to low predicted channel affinity for this customer.
        </p>

        <div className="bg-[#1F2937] p-4 rounded-xl border border-gray-700 max-w-sm mx-auto text-left">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-3 border-b border-gray-700 pb-2">AI Channel Evaluation</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Target Customer:</span>
              <span className="text-white font-mono">CUST_007</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-2">
              <span className="text-gray-400">Channel:</span>
              <span className="text-amber-400 font-bold">SMS</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Affinity Score:</span>
              <span className="text-white">0.0%</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-2">
              <span className="text-gray-400">Channel:</span>
              <span className="text-amber-400 font-bold">Push</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Affinity Score:</span>
              <span className="text-white">0.2%</span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-2">
              <span className="text-gray-400">Evaluation Result:</span>
              <span className="flex items-center text-rose-400 font-bold"><XCircle className="w-4 h-4 mr-1" /> REJECTED</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400">Engine Action:</span>
              <span className="text-blue-400 font-bold">Route to WhatsApp/Email</span>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
