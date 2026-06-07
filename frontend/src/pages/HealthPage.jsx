import React, { useEffect, useState } from 'react';
import { useTwinStore } from '../store/twinStore';
import { getHealth } from '../api/healthApi';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import StatCard from '../components/common/StatCard';
import { Activity, Database, CheckCircle, ShieldAlert, Cpu, Users } from 'lucide-react';

/**
 * Diagnostics control screen showing persistent connections, API roundtrip times,
 * and database mapping statistics.
 */
const HealthPage = () => {
  const { customerList } = useTwinStore();
  const [healthData, setHealthData] = useState(null);
  const [latency, setLatency] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealthDetails = async () => {
    const start = Date.now();
    try {
      const data = await getHealth();
      const duration = Date.now() - start;
      setLatency(duration);
      setHealthData(data);
    } catch (err) {
      setHealthData({
        status: 'offline',
        database: 'offline',
        reason: err.message
      });
      setLatency(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthDetails();
    const timer = setInterval(fetchHealthDetails, 60000); // Check every 60s
    return () => clearInterval(timer);
  }, []);

  const dbConnected = healthData?.database === 'connected';
  const apiHealthy = healthData?.status === 'healthy';

  return (
    <div className="space-y-8 select-none">
      <PageHeader 
        title="Health Diagnostics" 
        subtitle="Real-time operational status, roundtrip latencies, and persistent database mappings"
        actions={
          <button 
            onClick={() => { setLoading(true); fetchHealthDetails(); }}
            className="bg-brand-500 hover:bg-brand-600 px-4 py-2 text-xs font-extrabold rounded-xl transition-colors text-white"
          >
            Execute Diagnostic Ping
          </button>
        }
      />

      {/* Latency and entity counts highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Roundtrip Latency" 
          value={loading ? "..." : `${latency} ms`} 
          icon={Activity} 
          colorClass={latency > 100 ? "text-amber-400" : "text-emerald-400"} 
        />
        <StatCard 
          title="Active Customer Profiles" 
          value={`${customerList.length}`} 
          icon={Users} 
          colorClass="text-sky-400" 
        />
        <StatCard 
          title="Simulated Digital Twins" 
          value={`${customerList.length}`} 
          icon={Cpu} 
          colorClass="text-violet-400" 
        />
      </div>

      {/* Persistence Details cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* API Connection */}
        <SectionCard title="Backend API Integration" subtitle="HTTP connection parameters status checks">
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center bg-dark-950 p-4 border border-dark-850 rounded-xl">
              <span className="text-dark-400 font-medium">Integration Status</span>
              <span className={`flex items-center gap-1.5 ${apiHealthy ? 'text-emerald-400' : 'text-rose-500'}`}>
                {apiHealthy ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                <span>{apiHealthy ? 'ONLINE (Healthy)' : 'OFFLINE'}</span>
              </span>
            </div>
            <div className="flex justify-between items-center bg-dark-950 p-4 border border-dark-850 rounded-xl font-mono text-brand-400">
              <span className="text-dark-400 font-medium font-sans">REST Base URL</span>
              <span>http://127.0.0.1:8000</span>
            </div>
            {healthData?.reason && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl font-mono text-[10px] leading-relaxed">
                {healthData.reason}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Database state details */}
        <SectionCard title="SQLite Database Persistence" subtitle="Persisted SQLite tables status checks">
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between items-center bg-dark-950 p-4 border border-dark-850 rounded-xl">
              <span className="text-dark-400 font-medium">Persistence Engine</span>
              <span className={`flex items-center gap-1.5 ${dbConnected ? 'text-emerald-400' : 'text-rose-500'}`}>
                {dbConnected ? <Database size={14} /> : <ShieldAlert size={14} />}
                <span>{dbConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
              </span>
            </div>
            <div className="flex justify-between items-center bg-dark-950 p-4 border border-dark-850 rounded-xl font-mono text-brand-400">
              <span className="text-dark-400 font-medium font-sans">ORM Model Layer</span>
              <span>SQLAlchemy v2.0</span>
            </div>
          </div>
        </SectionCard>

      </div>
    </div>
  );
};

export default HealthPage;
