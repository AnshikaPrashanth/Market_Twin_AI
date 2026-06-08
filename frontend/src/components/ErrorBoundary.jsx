import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function ErrorBoundary() {
  const error = useRouteError();
  console.error("Router Error:", error);

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 text-gray-100">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-rose-500/20 p-4 rounded-full border border-rose-500/30">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-6">
          An unexpected error occurred in the application. The system has logged the issue.
        </p>
        
        <div className="bg-gray-900 rounded-lg p-4 text-left overflow-x-auto border border-gray-800 mb-8">
          <p className="text-sm text-rose-400 font-mono">
            {error?.statusText || error?.message || "Unknown error"}
          </p>
        </div>

        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition shadow-lg shadow-brand-500/20"
        >
          <Home className="w-5 h-5 mr-2" />
          Return to Command Center
        </Link>
      </div>
    </div>
  );
}
