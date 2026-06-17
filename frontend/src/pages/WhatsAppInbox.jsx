import React from 'react';
import { MessageSquare, ShieldAlert, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarketTwinStore } from '../store/marketTwinStore';

export default function WhatsAppInbox() {
  const { messageHistory, currentCustomerId } = useMarketTwinStore();
  const whatsappHistory = messageHistory.filter(msg => msg.channel === 'whatsapp');

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none relative p-8">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <MessageSquare className="w-8 h-8 mr-3 text-emerald-500" /> WhatsApp Business API
        </h1>
        <p className="text-gray-400 mt-2">Latest campaign dispatch status and engagement funnel.</p>
      </header>

      {whatsappHistory.length > 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Latest Dispatches</h2>
          <div className="space-y-4">
            {whatsappHistory.slice().reverse().map((msg, idx) => (
              <div key={idx} className="bg-[#1F2937] p-6 rounded-xl border border-gray-700/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">MarketTwin Demo Store</h3>
                      <p className="text-xs text-gray-400">To: {currentCustomerId}</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">Delivered</span>
                </div>
                <div className="pl-14">
                  <p className="text-gray-300 text-sm mb-4">{msg.content || msg.text}</p>
                  <Link to="/store" className="inline-block bg-emerald-600 text-white px-4 py-2 rounded font-semibold text-sm cursor-pointer hover:bg-emerald-500 transition-colors">
                    {msg.call_to_action || "Complete Action"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : currentCustomerId === 'CUST_007' ? (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl text-center py-16">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Message Skipped</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            The AI engine predicted WhatsApp as the optimal channel for CUST_007, but the delivery was blocked by the Policy Engine.
          </p>

          <div className="bg-[#1F2937] p-4 rounded-xl border border-gray-700 max-w-sm mx-auto text-left">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-3 border-b border-gray-700 pb-2">Policy Gate Result</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Target Customer:</span>
                <span className="text-white font-mono">CUST_007</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Requested Action:</span>
                <span className="text-white">Cart Recovery Coupon</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400">Consent Check:</span>
                <span className="flex items-center text-rose-400 font-bold"><XCircle className="w-4 h-4 mr-1" /> FAILED</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Reason:</span>
                <span className="text-rose-400 text-xs text-right ml-4">WhatsApp consent not explicitly granted by user.</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-2">
                <span className="text-gray-400">Engine Action:</span>
                <span className="text-blue-400 font-bold">Fallback to Email</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#1F2937] p-8 rounded-xl border border-gray-700/50 mb-6 text-center text-gray-400 italic">
          No WhatsApp messages have been sent to this customer yet.
        </div>
      )}
    </div>
  );
}
