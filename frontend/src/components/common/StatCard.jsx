import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated stat card designed to present dashboard figures like scores or analytics indicators.
 */
const StatCard = ({ title, value, icon: Icon, colorClass = "text-brand-500", trend, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-dark-900 border border-dark-800 rounded-2xl p-6 flex flex-col justify-between glow-card hover:glow-card-active hover:border-dark-700 transition-all select-none"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-dark-300">{title}</span>
        {Icon && (
          <div className={`p-2 bg-dark-850 rounded-xl ${colorClass}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="h-8 w-24 bg-dark-800 rounded-lg animate-pulse mb-2" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
          {trend && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
