import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useTwinStore } from '../../store/twinStore';

const AppLayout = () => {
  const { fetchTwinData, startPolling, stopPolling } = useTwinStore();

  useEffect(() => {
    // Perform initial sync
    fetchTwinData();
    // Start background refresh polling
    startPolling();
    
    return () => {
      // Clean up timer on unmount
      stopPolling();
    };
  }, []);

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden font-sans text-dark-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-950 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
