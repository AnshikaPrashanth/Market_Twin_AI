import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, ShoppingCart, ShoppingBag, Trash2, Mail, MessageSquare, Bell, ArrowRightLeft, ShieldAlert
} from 'lucide-react';

/**
 * Single card renderer inside the chronological customer event timeline.
 */
const TimelineEvent = ({ event, index }) => {
  const getIconConfig = (type) => {
    switch (type) {
      case 'product_view': 
        return { icon: Eye, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
      case 'add_to_cart': 
        return { icon: ShoppingCart, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
      case 'remove_from_cart': 
        return { icon: Trash2, color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' };
      case 'purchase': 
        return { icon: ShoppingBag, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'email_sent':
      case 'email_open':
      case 'email_click': 
        return { icon: Mail, color: 'text-brand-400 bg-brand-500/10 border-brand-500/20' };
      case 'whatsapp_sent':
      case 'whatsapp_click': 
        return { icon: MessageSquare, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'push_sent':
      case 'push_click': 
        return { icon: Bell, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'cart_abandon': 
        return { icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      default: 
        return { icon: ArrowRightLeft, color: 'text-dark-300 bg-dark-800 border-dark-700' };
    }
  };

  const { icon: Icon, color } = getIconConfig(event.event_type);
  const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = new Date(event.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="flex gap-4 relative group select-none"
    >
      {/* Icon Node & Line connector */}
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-xl border flex items-center justify-center z-10 ${color}`}>
          <Icon size={16} />
        </div>
        <div className="w-[1px] flex-1 bg-dark-800 group-last:bg-transparent min-h-[40px]" />
      </div>

      {/* Card Content */}
      <div className="flex-1 bg-dark-900 border border-dark-800 rounded-2xl p-4 mb-4 hover:border-dark-700 transition-all hover:bg-dark-850">
        <div className="flex items-center justify-between gap-4 mb-1.5">
          <span className="font-extrabold text-white text-sm capitalize">{event.event_type.replace(/_/g, ' ')}</span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-dark-300 bg-dark-800 px-2 py-0.5 rounded-full border border-dark-750">
            <span>{date}</span>
            <span>•</span>
            <span>{time}</span>
          </div>
        </div>
        <div className="text-xs text-dark-300">
          <span className="font-medium text-dark-400">Channel: </span>
          <span className="font-semibold text-white capitalize mr-4">{event.source}</span>
          {event.properties && Object.keys(event.properties).length > 0 && (
            <div className="mt-2.5 p-2.5 bg-dark-950 rounded-lg border border-dark-800 font-mono text-[10px] text-brand-400 overflow-x-auto">
              {JSON.stringify(event.properties, null, 2)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineEvent;
