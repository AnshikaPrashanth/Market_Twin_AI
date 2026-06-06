import React from 'react';
import SectionCard from '../common/SectionCard';
import { Send, AlertTriangle, Star, RefreshCw, ShoppingCart, Mail } from 'lucide-react';

/**
 * Renders the Next Best Action decision made by the twin logic.
 */
const NextBestActionCard = ({ action, preferredChannel }) => {
  const getActionConfig = (actionName) => {
    switch (actionName) {
      case 'send_coupon':
        return {
          icon: Send,
          color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
          title: 'Send Discount Coupon',
          channel: preferredChannel || 'WhatsApp',
          reason: 'High cart intent with low fatigue. Shopping cart abandonment detected.',
          confidence: '94%',
          lift: '+18.5% Purchase Prob.'
        };
      case 'cool_down_marketing':
        return {
          icon: AlertTriangle,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5',
          title: 'Cool Down Marketing Contacts',
          channel: 'All Channels',
          reason: 'Fatigue score exceeds 70. High risk of push/email unsubscribes.',
          confidence: '98%',
          lift: '-5.2% Churn Probability'
        };
      case 'invite_to_vip_club':
        return {
          icon: Star,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5',
          title: 'Invite to VIP Loyalty Club',
          channel: 'Email / Direct Call',
          reason: 'Spender exceeds 20,000 threshold. Maximize lifetime value.',
          confidence: '91%',
          lift: '+12.0% Customer LTV'
        };
      case 'trigger_retargeting_campaign':
        return {
          icon: RefreshCw,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          title: 'Trigger Winback Email',
          channel: preferredChannel || 'Email',
          reason: 'Customer profile matches churn risk or dormant conditions.',
          confidence: '78%',
          lift: '+6.4% Re-engagement Rate'
        };
      case 'recommend_checkout':
        return {
          icon: ShoppingCart,
          color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
          title: 'Trigger Checkout Reminder',
          channel: preferredChannel || 'Push Notification',
          reason: 'Active items in shopping cart. Remind user of purchase value.',
          confidence: '85%',
          lift: '+9.2% Cart Recovery'
        };
      default:
        return {
          icon: Mail,
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          title: 'Display Popular Products',
          channel: preferredChannel || 'Email',
          reason: 'Browsing active. Show top-selling audio and laptops categories.',
          confidence: '72%',
          lift: '+3.5% Click-Through Rate'
        };
    }
  };

  const config = getActionConfig(action);
  const Icon = config.icon;

  return (
    <SectionCard title="Next Best Action Recommendation" subtitle="Real-time campaign trigger suggestion">
      <div className="flex flex-col gap-6 select-none">
        
        {/* Recommendation Header */}
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${config.color}`}>
            <Icon size={20} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-base leading-tight">{config.title}</h4>
            <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">
              Channel: {config.channel}
            </span>
          </div>
        </div>

        {/* Reason Block */}
        <div className="text-xs text-dark-350 leading-relaxed bg-dark-950 p-3.5 border border-dark-850 rounded-xl">
          <span className="font-bold text-dark-300 block mb-1">Decision Rationale:</span>
          {config.reason}
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-dark-800 pt-4">
          <div>
            <span className="text-[10px] text-dark-400 uppercase font-bold tracking-wider">Trigger Confidence</span>
            <div className="text-lg font-extrabold text-white mt-1">{config.confidence}</div>
          </div>
          <div>
            <span className="text-[10px] text-dark-400 uppercase font-bold tracking-wider">Expected Lift</span>
            <div className="text-lg font-extrabold text-brand-400 mt-1">{config.lift}</div>
          </div>
        </div>

      </div>
    </SectionCard>
  );
};

export default NextBestActionCard;
