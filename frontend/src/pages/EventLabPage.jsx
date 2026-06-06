import React, { useState, useEffect } from 'react';
import { useTwinStore } from '../store/twinStore';
import { useEventStore } from '../store/eventStore';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import RealtimeLogs from '../components/debug/RealtimeLogs';
import ApiResponseViewer from '../components/debug/ApiResponseViewer';
import { FlaskConical, Play, CheckCircle, Clock } from 'lucide-react';

/**
 * Event Generation Control Center allowing users to draft, edit, and send
 * real-time payloads to the backend event ingestion endpoints.
 */
const EventLabPage = () => {
  const { selectedCustomerId, eventsList } = useTwinStore();
  const { triggerEvent, isSending, responseTime, lastReceivedResponse, error } = useEventStore();

  // Selected event type preset
  const [selectedPreset, setSelectedPreset] = useState('product_view');

  // Payload textbox state
  const [payloadText, setPayloadText] = useState('');

  // Dynamically resolve identifiers from historical events
  const getDynamicIdentifiers = () => {
    let ids = {
      device_id: selectedCustomerId === 'CUST_001' ? 'DEV_88' : (selectedCustomerId === 'CUST_002' ? 'DEV_99' : 'DEV_RANDOM'),
      email_hash: selectedCustomerId === 'CUST_001' ? 'EMAIL_991' : (selectedCustomerId === 'CUST_002' ? 'EMAIL_CUST2' : undefined),
      phone_hash: selectedCustomerId === 'CUST_001' ? 'PHONE_771' : undefined,
      cookie_id: selectedCustomerId === 'CUST_001' ? 'COOKIE_ABC' : undefined,
      loyalty_id: undefined
    };

    if (eventsList && eventsList.length > 0) {
      // Find the most recent occurrences of any identifiers in the logs
      const reversedEvents = [...eventsList].reverse();
      for (const evt of reversedEvents) {
        const evtIds = evt.identifiers || {};
        if (evtIds.device_id) ids.device_id = evtIds.device_id;
        if (evtIds.email_hash) ids.email_hash = evtIds.email_hash;
        if (evtIds.phone_hash) ids.phone_hash = evtIds.phone_hash;
        if (evtIds.cookie_id) ids.cookie_id = evtIds.cookie_id;
        if (evtIds.loyalty_id) ids.loyalty_id = evtIds.loyalty_id;
      }
    }
    return ids;
  };

  // Presets mapping event parameters
  const eventPresets = {
    product_view: {
      event_type: 'product_view',
      source: 'website',
      identifiers: getDynamicIdentifiers(),
      properties: { product_id: 'P101', category: 'Headphones', price: 2999, city: selectedCustomerId === 'CUST_001' ? 'Mumbai' : 'Bengaluru' }
    },
    add_to_cart: {
      event_type: 'add_to_cart',
      source: 'website',
      identifiers: getDynamicIdentifiers(),
      properties: { product_id: 'P101', category: 'Headphones', price: 2999 }
    },
    remove_from_cart: {
      event_type: 'remove_from_cart',
      source: 'website',
      identifiers: getDynamicIdentifiers(),
      properties: { product_id: 'P101' }
    },
    cart_abandon: {
      event_type: 'cart_abandon',
      source: 'website',
      identifiers: getDynamicIdentifiers(),
      properties: { abandoned_items: 1 }
    },
    purchase: {
      event_type: 'purchase',
      source: 'website',
      identifiers: getDynamicIdentifiers(),
      properties: { product_id: 'P101', category: 'Headphones', price: 2999 }
    },
    email_open: {
      event_type: 'email_open',
      source: 'marketing_hub',
      identifiers: getDynamicIdentifiers(),
      properties: { campaign_id: 'CAM_99' }
    },
    email_click: {
      event_type: 'email_click',
      source: 'marketing_hub',
      identifiers: getDynamicIdentifiers(),
      properties: { campaign_id: 'CAM_99', coupon: 'DISCOUNT_20' }
    },
    whatsapp_click: {
      event_type: 'whatsapp_click',
      source: 'whatsapp_bot',
      identifiers: getDynamicIdentifiers(),
      properties: { message_id: 'MSG_WA_01', coupon: 'DISCOUNT_20' }
    },
    push_click: {
      event_type: 'push_click',
      source: 'mobile_app',
      identifiers: getDynamicIdentifiers(),
      properties: { push_id: 'PUSH_88' }
    },
    session_start: {
      event_type: 'session_start',
      source: 'website',
      identifiers: getDynamicIdentifiers(),
      properties: {}
    },
    session_end: {
      event_type: 'session_end',
      source: 'website',
      identifiers: getDynamicIdentifiers(),
      properties: {}
    }
  };

  // Sync textbox content when preset, customer context, or events list updates
  useEffect(() => {
    const defaultPayload = eventPresets[selectedPreset] || eventPresets.product_view;
    setPayloadText(JSON.stringify(defaultPayload, null, 2));
  }, [selectedPreset, selectedCustomerId, eventsList]);

  const handlePresetSelect = (presetKey) => {
    setSelectedPreset(presetKey);
  };

  const handleSendEvent = async () => {
    try {
      const parsed = JSON.parse(payloadText);
      await triggerEvent(parsed);
    } catch (err) {
      alert(`Invalid JSON Payload: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Event Simulation Lab" 
        subtitle="Simulate real-time omnichannel customer touchpoints and inspect backend resolution metrics"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LHS Column: Presets list and raw editor */}
        <div className="lg:col-span-6 space-y-6">
          <SectionCard title="Ingestion Simulator presets" subtitle="Select standard customer touchpoints to auto-draft payload">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(eventPresets).map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border text-left capitalize transition-colors ${
                    selectedPreset === preset 
                      ? 'bg-brand-500/10 border-brand-500 text-brand-400' 
                      : 'bg-dark-950 border-dark-800 text-dark-300 hover:bg-dark-850'
                  }`}
                >
                  {preset.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="JSON Event Editor" subtitle="Customize properties before firing wire transfer">
            <div className="space-y-4">
              <textarea
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                className="w-full h-[220px] bg-black border border-dark-800 rounded-xl p-4 font-mono text-xs text-brand-400 focus:outline-none focus:border-brand-500 select-text leading-relaxed"
              />
              <button
                onClick={handleSendEvent}
                disabled={isSending}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-dark-800 text-white font-extrabold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/10 select-none"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-t-white border-brand-500 rounded-full animate-spin" />
                ) : (
                  <Play size={14} />
                )}
                <span>Ingest Event Payload</span>
              </button>
            </div>
          </SectionCard>
        </div>

        {/* RHS Column: Real-time logs and json viewer */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Latency & Ingestion Status metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 flex items-center gap-4 select-none">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <CheckCircle size={20} />
              </div>
              <div>
                <span className="text-[10px] text-dark-400 uppercase font-bold tracking-wider">Ingest Status</span>
                <div className="text-sm font-extrabold text-white mt-0.5">
                  {lastReceivedResponse ? 'SUCCESS (201)' : 'AWAITING'}
                </div>
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-5 flex items-center gap-4 select-none">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] text-dark-400 uppercase font-bold tracking-wider">API Latency</span>
                <div className="text-sm font-extrabold text-white mt-0.5">
                  {responseTime !== null ? `${responseTime} ms` : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <RealtimeLogs />
          <ApiResponseViewer url="/api/event" />
        </div>

      </div>
    </div>
  );
};

export default EventLabPage;
