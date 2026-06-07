import React from 'react';
import IdentityNode from './IdentityNode';
import { Network } from 'lucide-react';

/**
 * Visualizes the resolved graph connections surrounding a customer.
 * Discovers nodes dynamically by scanning the properties of events.
 */
const IdentityGraph = ({ customerId, events = [] }) => {
  // Extract all distinct identifiers from the events list
  const uniqueIdentifiers = {
    email_hash: new Set(),
    phone_hash: new Set(),
    device_id: new Set(),
    cookie_id: new Set(),
    loyalty_id: new Set()
  };

  events.forEach((evt) => {
    const ids = evt.identifiers || {};
    if (ids.email_hash) uniqueIdentifiers.email_hash.add(ids.email_hash);
    if (ids.phone_hash) uniqueIdentifiers.phone_hash.add(ids.phone_hash);
    if (ids.device_id) uniqueIdentifiers.device_id.add(ids.device_id);
    if (ids.cookie_id) uniqueIdentifiers.cookie_id.add(ids.cookie_id);
    if (ids.loyalty_id) uniqueIdentifiers.loyalty_id.add(ids.loyalty_id);
  });

  // Convert Set items into node objects
  const nodes = [];
  Object.entries(uniqueIdentifiers).forEach(([type, set]) => {
    set.forEach((value) => {
      nodes.push({ type, value });
    });
  });

  // Fallback defaults for pre-seeded demo customer contexts if no events ingested yet
  if (nodes.length === 0) {
    if (customerId === 'CUST_001') {
      nodes.push({ type: 'device_id', value: 'DEV_88' });
      nodes.push({ type: 'email_hash', value: 'EMAIL_991' });
      nodes.push({ type: 'phone_hash', value: 'PHONE_771' });
      nodes.push({ type: 'cookie_id', value: 'COOKIE_ABC' });
    } else if (customerId === 'CUST_002') {
      nodes.push({ type: 'device_id', value: 'DEV_99' });
      nodes.push({ type: 'email_hash', value: 'EMAIL_CUST2' });
    }
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
          {nodes.filter(n => ['device_id', 'cookie_id'].includes(n.type)).map((n, idx) => (
            <IdentityNode key={idx} type={n.type} value={n.value} label={n.type.replace('_', ' ')} />
          ))}
          {nodes.filter(n => ['device_id', 'cookie_id'].includes(n.type)).length === 0 && (
            <span className="text-xs text-dark-500 font-semibold italic">No Device Identifiers</span>
          )}
        </div>

        {/* Center column: Resolved customer ID */}
        <div className="relative flex items-center justify-center p-8 border border-dashed border-dark-800 rounded-full bg-dark-950/20">
          <IdentityNode type="customer" value={customerId} label="Unified Customer ID" />
        </div>

        {/* Right column: Profile Credentials */}
        <div className="flex flex-col gap-6 items-center">
          {nodes.filter(n => ['email_hash', 'phone_hash', 'loyalty_id'].includes(n.type)).map((n, idx) => (
            <IdentityNode key={idx} type={n.type} value={n.value} label={n.type.replace('_', ' ')} />
          ))}
          {nodes.filter(n => ['email_hash', 'phone_hash', 'loyalty_id'].includes(n.type)).length === 0 && (
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
