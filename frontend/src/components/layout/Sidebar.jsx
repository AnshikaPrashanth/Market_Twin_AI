import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FlaskConical, 
  Cpu, 
  Network, 
  Activity,
  Boxes,
  Store,
  PieChart,
  BarChart,
  Smartphone
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Command Center', path: '/', icon: LayoutDashboard },
    { name: 'Customer Twin', path: '/twin', icon: Cpu },
    { name: 'Audience Intelligence', path: '/audience', icon: PieChart },
    { name: 'Measurement Dashboard', path: '/measurement', icon: BarChart },
    { name: 'Channel Simulator', path: '/simulator', icon: Smartphone },
    { name: 'Storefront Simulator', path: '/store', icon: Store },
  ];

  return (
    <aside className="w-64 bg-dark-900 border-r border-dark-800 text-dark-100 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-dark-800 gap-3">
        <div className="p-1.5 bg-brand-500 rounded-lg text-white">
          <Boxes size={22} className="animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-md">MarketTwin AI</h1>
          <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">Control Panel</p>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-brand-500 text-white font-medium shadow-lg shadow-brand-500/20' 
                  : 'hover:bg-dark-800/60 text-dark-300 hover:text-white'
              }`}
            >
              <Icon 
                size={18} 
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-dark-400 group-hover:text-white'
                }`} 
              />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Meta */}
      <div className="p-4 border-t border-dark-800 text-center text-xs text-dark-500 font-semibold uppercase tracking-wider">
        MarketTwin AI Engine v1.0
      </div>
    </aside>
  );
};

export default Sidebar;
