import React from 'react';
import SectionCard from '../common/SectionCard';
import { Award, User, ShoppingBag, Eye, Moon } from 'lucide-react';

/**
 * Renders details about the custom segment mapped to the digital twin.
 */
const SegmentCard = ({ segment }) => {
  const getInfo = (name) => {
    switch (name) {
      case 'Premium Loyalist':
        return { 
          icon: Award, 
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          desc: 'Top-tier VIP segment. Customer lifetime spend exceeds 20,000 threshold. Extremely valuable profile.'
        };
      case 'High Intent Cart Abandoner':
        return { 
          icon: ShoppingBag, 
          color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
          desc: 'High intent metrics combined with recent cart abandonments. High expected conversion lift from immediate coupon triggers.'
        };
      case 'Window Shopper':
        return { 
          icon: Eye, 
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          desc: 'Frequent page views but low cart conversion counts. Responds well to social proof highlight notifications.'
        };
      case 'Dormant Customer':
        return { 
          icon: Moon, 
          color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
          desc: 'No activity registered for more than 30 days. Profile queued for winback retargeting email campaigns.'
        };
      default:
        return { 
          icon: User, 
          color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
          desc: 'Normal engagement profile. General campaign marketing tracks active.'
        };
    }
  };

  const { icon: Icon, color, desc } = getInfo(segment);

  return (
    <SectionCard title="Active Behavioral Segment" subtitle="System rule-based categorization">
      <div className="flex flex-col gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border ${color}`}>
            <Icon size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-base leading-tight">{segment || 'Standard Customer'}</h4>
            <span className="text-[10px] text-dark-400 uppercase font-bold tracking-wider">Dynamic Rule Match</span>
          </div>
        </div>
        <p className="text-xs text-dark-300 leading-relaxed bg-dark-950 p-3.5 border border-dark-850 rounded-xl">
          {desc}
        </p>
      </div>
    </SectionCard>
  );
};

export default SegmentCard;
