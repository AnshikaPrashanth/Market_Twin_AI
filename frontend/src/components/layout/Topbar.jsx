import React, { useEffect, useState } from 'react';
import { useTwinStore } from '../../store/twinStore';
import { getHealth } from '../../api/healthApi';
import { Database, User, ShieldAlert } from 'lucide-react';

const Topbar = () => {
  const { 
    selectedCustomerId, 
    customerList, 
    selectCustomer,
    eventsList
  } = useTwinStore();

  const [dbHealthy, setDbHealthy] = useState(false);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const data = await getHealth();
        setDbHealthy(data.status === 'healthy');
      } catch (err) {
        setDbHealthy(false);
      } finally {
        setLoadingHealth(false);
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-dark-900 border-b border-dark-800 text-dark-100 flex items-center justify-between px-8 select-none">
      {/* Active Customer Selector Dropdown */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-dark-400">
          <User size={18} />
          <span className="text-sm font-medium">Customer Context:</span>
        </div>
        <select
          value={selectedCustomerId}
          onChange={(e) => selectCustomer(e.target.value)}
          className="bg-dark-800 border border-dark-700 text-white rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-brand-500 cursor-pointer hover:bg-dark-750 transition-colors"
        >
          {customerList.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      {/* Backend & Context Indicators */}
      <div className="flex items-center gap-6">
        <div className="text-sm">
          <span className="text-dark-400 font-medium">Profile Events: </span>
          <span className="text-white font-bold bg-dark-850 px-2.5 py-1 rounded-md ml-1 border border-dark-700">
            {eventsList.length}
          </span>
        </div>

        <div className="flex items-center gap-2 border-l border-dark-800 pl-6">
          <Database size={16} className={dbHealthy ? "text-emerald-400 animate-pulse" : "text-rose-400"} />
          <span className="text-xs font-semibold text-dark-300">SQLite State:</span>
          {loadingHealth ? (
            <span className="w-2.5 h-2.5 rounded-full bg-dark-600 animate-pulse" />
          ) : dbHealthy ? (
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <ShieldAlert size={12} className="text-rose-400" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
