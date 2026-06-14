import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Send, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { getLatestMessage, ingestEvent } from '../api/client';
import { useDemoStore } from '../store/demoStore';

export default function InboxSimulator({ channel, title, icon: IconComponent }) {
  const { demoEnabled, getActiveUser, getActiveIdentifiers } = useDemoStore();
  const activeUser = getActiveUser();
  const activeIdentifiers = getActiveIdentifiers();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState(null);
  const [eventStatus, setEventStatus] = useState(null);

  useEffect(() => {
    if (!demoEnabled || !activeUser) return;

    const pollMessages = async () => {
      try {
        const res = await getLatestMessage(activeUser.id);
        if (res && res.generated_message) {
          // Check if the message channel matches this page's channel (or sms/push grouping)
          const msgChannel = res.generated_message.channel;
          const isMatch = msgChannel === channel || (channel === 'sms' && msgChannel === 'push');
          
          if (isMatch) {
            setMessage(res.generated_message);
          } else {
            setMessage(null);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    pollMessages();
    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [demoEnabled, activeUser, channel]);

  const handleLinkClick = async () => {
    // Send an event with deterministic link
    const identifiers = { ...activeIdentifiers };
    if (channel === 'email') identifiers.email_hash = activeUser.email_hash;
    if (channel === 'whatsapp' || channel === 'sms') identifiers.phone_hash = activeUser.phone_hash;

    const payload = {
      event_type: `${channel}_click`,
      source: channel,
      customer_id: activeUser.id,
      identifiers: identifiers,
      properties: { demo_mode: true }
    };

    setEventStatus('Redirecting to Storefront...');
    try {
      await ingestEvent(payload);
      setMessage(null); // dismiss message
      // Redirect to Storefront as requested
      navigate('/store');
    } catch (e) {
      setEventStatus('Failed to send click event.');
      setTimeout(() => setEventStatus(null), 3000);
    }
  };

  const handleIgnore = () => {
    setMessage(null);
  };

  if (!demoEnabled) {
    return (
      <div className="p-8 text-center text-dark-400 flex flex-col items-center justify-center h-[60vh]">
        <IconComponent size={48} className="mb-4 text-dark-600" />
        <h2 className="text-xl font-bold text-white mb-2">Demo Mode Disabled</h2>
        <p>Turn on Demo Context in the sidebar to simulate {title} notifications.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none relative">
      <PageHeader 
        title={title} 
        subtitle={`Simulated Inbox for ${activeUser.name}`}
      />

      {eventStatus && (
        <div className="absolute top-0 right-0 z-50 bg-brand-600 text-white px-4 py-2 rounded-lg shadow-lg border border-brand-400 font-medium text-sm animate-in fade-in slide-in-from-top-4">
          {eventStatus}
        </div>
      )}

      <div className="bg-dark-950 border border-dark-800 rounded-2xl min-h-[500px] flex flex-col overflow-hidden shadow-xl relative">
        {/* Fake Phone Header */}
        <div className="h-8 bg-dark-900 border-b border-dark-800 flex justify-center items-center">
          <div className="w-16 h-1.5 bg-dark-700 rounded-full"></div>
        </div>

        <div className="flex-1 p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-dark-900 to-dark-950 flex flex-col items-center justify-center relative">
          
          {message ? (
            <div className="w-full max-w-sm bg-dark-900 border border-dark-700 rounded-xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-8 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${channel === 'whatsapp' ? 'bg-emerald-500' : channel === 'email' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${channel === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-400' : channel === 'email' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    <IconComponent size={18} />
                  </div>
                  <span className="text-xs font-bold uppercase text-dark-300">New {channel} Message</span>
                </div>
                <span className="text-xs text-dark-500">Just now</span>
              </div>
              
              {(message.subject || message.title) && (
                <h4 className="text-white font-bold mb-2">{message.subject || message.title}</h4>
              )}
              <p className="text-white text-md leading-relaxed mb-8">{message.body || message.message || message.banner}</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleLinkClick} 
                  className="flex-1 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LinkIcon size={16} /> {message.cta || 'Click Link'}
                </button>
                <button 
                  onClick={handleIgnore} 
                  className="flex-1 bg-dark-800 hover:bg-dark-700 text-white text-sm font-semibold py-2.5 rounded-lg border border-dark-600 transition-colors"
                >
                  Ignore
                </button>
              </div>
              <p className="text-[10px] text-dark-500 mt-4 text-center">Clicking the link will deterministically map your active device to {activeUser.name}.</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-dark-800/50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-dark-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
              <p className="text-dark-400 max-w-sm text-sm">Waiting for the AI Engine to send a {channel} message. Try abandoning a cart in the Storefront!</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
