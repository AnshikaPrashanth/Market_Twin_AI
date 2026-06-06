import React from 'react';
import { Mail, Smartphone, Key, Award, User, HelpCircle } from 'lucide-react';

/**
 * Node block representing a single entity within the identity graph display.
 */
const IdentityNode = ({ type, value, label }) => {
  const getIconConfig = (nodeType) => {
    switch (nodeType) {
      case 'email_hash': 
        return { icon: Mail, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'device_id': 
        return { icon: Smartphone, color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
      case 'cookie_id': 
        return { icon: Key, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'loyalty_id': 
        return { icon: Award, color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' };
      case 'customer': 
        return { icon: User, color: 'bg-brand-500/10 text-brand-400 border-brand-500/20 shadow-brand-500/5' };
      default: 
        return { icon: HelpCircle, color: 'bg-dark-850 text-dark-400 border-dark-800' };
    }
  };

  const { icon: Icon, color } = getIconConfig(type);

  return (
    <div className="flex flex-col items-center select-none max-w-[150px]">
      <div className={`p-4 rounded-2xl border flex items-center justify-center shadow-lg transition-transform hover:scale-105 duration-200 ${color}`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-white mt-2 tracking-wide uppercase">{label}</span>
      {value && (
        <span 
          className="text-[10px] text-dark-300 font-mono mt-1 px-2 py-0.5 rounded border border-dark-800 bg-dark-950 truncate max-w-[130px] select-all" 
          title={value}
        >
          {value}
        </span>
      )}
    </div>
  );
};

export default IdentityNode;
