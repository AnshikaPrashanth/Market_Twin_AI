import React from 'react';
import { Mail, CheckCircle2, MousePointer, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarketTwinStore } from '../store/marketTwinStore';

export default function EmailInbox() {
  const { messageHistory, currentCustomerId, liveEvents } = useMarketTwinStore();
  const emailHistory = messageHistory.filter(msg => msg.channel === 'email');
  
  // Calculate Engagement metrics dynamically from liveEvents for the active customer
  const sent = liveEvents.filter(e => e.event_type === 'email_sent').length;
  const opened = liveEvents.filter(e => e.event_type === 'email_open').length;
  const clicked = liveEvents.filter(e => e.event_type === 'email_click').length;
  // Conversions should count purchases after an email click. We can just show generic purchases for now or if we want strict:
  const converted = liveEvents.filter(e => e.event_type === 'purchase').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none relative p-8">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <Mail className="w-8 h-8 mr-3 text-blue-500" /> Email Deliverability
        </h1>
        <p className="text-gray-400 mt-2">Latest campaign dispatch status and engagement funnel.</p>
      </header>

      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Latest Dispatches</h2>
        
        {emailHistory.length === 0 ? (
          <div className="bg-[#1F2937] p-8 rounded-xl border border-gray-700/50 mb-6 text-center text-gray-400 italic">
            No emails have been sent to this customer yet.
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {emailHistory.slice().reverse().map((msg, idx) => (
              <div key={idx} className="bg-[#1F2937] p-6 rounded-xl border border-gray-700/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">MarketTwin Demo Store</h3>
                      <p className="text-xs text-gray-400">To: {currentCustomerId}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Delivered</span>
                </div>
                <div className="pl-14">
                  <h4 className="text-white font-bold mb-2">{msg.subject || "Important Update"}</h4>
                  <p className="text-gray-300 text-sm mb-4">{msg.content || msg.text}</p>
                  <Link to="/store" className="inline-block bg-brand-600 text-white px-4 py-2 rounded font-semibold text-sm cursor-pointer hover:bg-brand-500 transition-colors">
                    {msg.call_to_action || "Complete Action"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Engagement Funnel</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-gray-800 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="text-white font-bold">{sent} Sent</div>
            <div className="text-xs text-gray-500 mt-1">Delivered via SendGrid</div>
          </div>
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-gray-800 text-center">
            <Activity className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <div className="text-white font-bold">{opened} Opened</div>
            <div className="text-xs text-gray-500 mt-1">Pixel Tracked</div>
          </div>
          <div className={`p-4 rounded-xl border text-center ${clicked > 0 ? 'bg-[#0B0F19] border-emerald-500/30' : 'bg-[#0B0F19] border-gray-800'}`}>
            <MousePointer className={`w-6 h-6 mx-auto mb-2 ${clicked > 0 ? 'text-emerald-400' : 'text-gray-600'}`} />
            <div className={clicked > 0 ? 'text-white font-bold' : 'text-gray-500 font-bold'}>{clicked} Clicked</div>
            <div className="text-xs text-gray-500 mt-1">{clicked > 0 ? 'Tracked Link Clicked' : 'Waiting for click...'}</div>
          </div>
          <div className={`p-4 rounded-xl border text-center ${converted > 0 ? 'bg-[#0B0F19] border-brand-500/50' : 'bg-[#0B0F19] border-gray-800'}`}>
            <CheckCircle2 className={`w-6 h-6 mx-auto mb-2 ${converted > 0 ? 'text-brand-400' : 'text-gray-600'}`} />
            <div className={converted > 0 ? 'text-white font-bold' : 'text-gray-500 font-bold'}>{converted} Converted</div>
            <div className="text-xs text-gray-500 mt-1">{converted > 0 ? 'Purchase Completed' : 'Waiting for purchase...'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
