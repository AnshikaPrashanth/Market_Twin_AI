import React from 'react';
import IdentityNode from './IdentityNode';
import { Network } from 'lucide-react';

/**
 * Visualizes the resolved graph connections surrounding a customer.
 * Discovers nodes dynamically by scanning the properties of events.
 */
const IdentityGraph = ({ customerId, events = [], identities = [] }) => {
  const nodes = [];

  // If we have explicit database identity links, use them directly as they represent the true state
  if (identities && identities.length > 0) {
    identities.forEach(link => {
      // Avoid duplicate types if they have the same value (should be unique in DB anyway)
      nodes.push({
        type: link.identifier_type,
        value: link.identifier_value,
        confidence: link.confidence_score,
        matchedBy: link.matched_by
      });
    });
  } else {
    // Fallback: Extract all distinct identifiers from the events list
    const uniqueIdentifiers = {
      email: new Set(),
      phone: new Set(),
      login_id: new Set(),
      email_hash: new Set(),
      phone_hash: new Set(),
      device_id: new Set(),
      cookie_id: new Set(),
      browser_id: new Set(),
      loyalty_id: new Set()
    };

    events.forEach((evt) => {
      const ids = evt.identifiers || {};
      if (ids.email) uniqueIdentifiers.email.add(ids.email);
      if (ids.phone) uniqueIdentifiers.phone.add(ids.phone);
      if (ids.login_id) uniqueIdentifiers.login_id.add(ids.login_id);
      if (ids.email_hash) uniqueIdentifiers.email_hash.add(ids.email_hash);
      if (ids.phone_hash) uniqueIdentifiers.phone_hash.add(ids.phone_hash);
      if (ids.device_id) uniqueIdentifiers.device_id.add(ids.device_id);
      if (ids.cookie_id) uniqueIdentifiers.cookie_id.add(ids.cookie_id);
      if (ids.browser_id) uniqueIdentifiers.browser_id.add(ids.browser_id);
      if (ids.loyalty_id) uniqueIdentifiers.loyalty_id.add(ids.loyalty_id);
    });

    Object.entries(uniqueIdentifiers).forEach(([type, set]) => {
      set.forEach((value) => {
        nodes.push({ type, value, confidence: 100, matchedBy: 'legacy_event' });
      });
    });

    // Removed static seeded defaults as they conflict with dynamic resolution
  }

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 min-h-[400px] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <Network className="text-brand-500" size={18} />
        <h3 className="font-bold text-white text-base">Identity Resolution Map</h3>
      </div>

      {/* Nodes Map Grid */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 py-8 relative">
        
        {/* Left column: Hardware & Browser Trackers */}
        <div className="flex flex-col gap-6 items-center">
          {nodes.filter(n => ['device_id', 'cookie_id', 'browser_id'].includes(n.type)).map((n, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <IdentityNode type={n.type} value={n.value} label={n.type.replace('_', ' ')} />
              {n.matchedBy && n.matchedBy !== 'legacy_event' && (
                <span className="text-[9px] text-brand-400 mt-1 max-w-[120px] text-center">{n.matchedBy.replace('deterministic_', '')}</span>
              )}
            </div>
          ))}
          {nodes.filter(n => ['device_id', 'cookie_id', 'browser_id'].includes(n.type)).length === 0 && (
            <span className="text-xs text-dark-500 font-semibold italic">No Device Identifiers</span>
          )}
        </div>

        {/* Center column: Resolved customer ID */}
        <div className="relative flex items-center justify-center p-8 border border-dashed border-dark-800 rounded-full bg-dark-950/20">
          <IdentityNode type="customer" value={customerId} label="Unified Customer ID" />
        </div>

        {/* Right column: Profile Credentials */}
        <div className="flex flex-col gap-6 items-center">
          {nodes.filter(n => ['email', 'phone', 'login_id', 'email_hash', 'phone_hash', 'loyalty_id'].includes(n.type)).map((n, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <IdentityNode type={n.type} value={n.value} label={n.type.replace('_', ' ')} />
              {n.matchedBy && n.matchedBy !== 'legacy_event' && (
                <span className="text-[9px] text-brand-400 mt-1 max-w-[120px] text-center">{n.matchedBy.replace('deterministic_', '')}</span>
              )}
            </div>
          ))}
          {nodes.filter(n => ['email', 'phone', 'login_id', 'email_hash', 'phone_hash', 'loyalty_id'].includes(n.type)).length === 0 && (
            <span className="text-xs text-dark-500 font-semibold italic">No Profile Credentials</span>
          )}
        </div>

      </div>

      <div className="text-[10px] text-center text-dark-400 font-bold uppercase tracking-wider mt-4">
        Dynamic Identity bindings resolved from incoming event streams
      </div>
    </div>
  );
};

export default IdentityGraph;
