import React, { useEffect, useState } from "react";
import { useMarketTwinStore } from "../store/marketTwinStore";
import { getLatestMessage, reactToMessage } from "../api/client";
import { MessageSquare, Mail, Bell, Monitor, HandIcon, MousePointerClick, XCircle, ShoppingBag, LogOut, CheckCircle } from "lucide-react";

export default function ChannelSimulator() {
  const { 
    latestGeneratedMessage, 
    currentCustomerId, 
    setProcessingResult,
    setLatestMessage,
    setError,
    error 
  } = useMarketTwinStore();
  
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Clear toast automatically
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  useEffect(() => {
    const fetchLatest = async () => {
      if (!currentCustomerId) return;
      try {
        const response = await getLatestMessage(currentCustomerId);
        setLatestMessage(response);
      } catch (err) {
        console.error("Failed to load message", err);
      }
    };
    fetchLatest();
  }, [currentCustomerId, setLatestMessage]);

  useEffect(() => {
    if (latestGeneratedMessage && latestGeneratedMessage.channel) {
      setActiveTab(latestGeneratedMessage.channel);
    }
  }, [latestGeneratedMessage]);

  const TABS = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
    { id: "email", label: "Email", icon: Mail },
    { id: "push", label: "Push", icon: Bell },
    { id: "website", label: "Website", icon: Monitor },
  ];

  const handleInteraction = async (action) => {
    if (!currentCustomerId) return;
    setActionLoading(true);
    try {
      const response = await reactToMessage(currentCustomerId, action);
      
      const payload = {
        event_type: action,
        source: activeTab,
        customer_id: currentCustomerId
      };
      
      setProcessingResult(response, payload);
      setToast(`Reaction "${action}" successfully processed.`);
    } catch (e) {
      setError(e.message || "Failed to process reaction");
    } finally {
      setActionLoading(false);
    }
  };

  const renderCreativeContent = () => {
    if (!currentCustomerId) {
      return (
        <div className="text-center text-gray-400 p-6 flex flex-col items-center">
          <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm">No active customer. Use Storefront or Run Demo first.</p>
        </div>
      );
    }

    if (!latestGeneratedMessage) {
      return (
        <div className="text-center text-gray-400 p-6 flex flex-col items-center">
          <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm">No generated message yet. Abandon a cart or Run Demo.</p>
        </div>
      );
    }

    const creative = latestGeneratedMessage;
    
    // Check if the current tab matches the message channel to avoid confusion
    if (activeTab !== creative.channel) {
       return (
        <div className="text-center text-gray-400 p-6 flex flex-col items-center">
          <Monitor className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm">No message generated for {activeTab}. Check {creative.channel}.</p>
        </div>
      );
    }

    if (activeTab === "whatsapp") {
      return (
        <div className="flex flex-col space-y-2 h-full justify-end pb-4 w-full">
          <div className="self-end bg-emerald-100 text-emerald-900 px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm relative">
            <p className="text-sm">{creative.message || creative.body || "Your personalized message is ready."}</p>
            <div className="text-right text-[10px] text-emerald-600/60 mt-1">10:42 AM</div>
          </div>
          <div className="self-end w-full max-w-[85%]">
            <button className="w-full bg-white border border-gray-200 shadow-sm text-emerald-600 font-medium py-2 rounded-xl text-sm flex justify-center items-center gap-1 hover:bg-gray-50">
              <MessageSquare className="w-3 h-3" /> {creative.cta || "Continue"}
            </button>
          </div>
          <div className="self-center mt-4 px-2 py-1 bg-white/60 rounded shadow-sm text-[10px] text-gray-500 font-mono flex items-center border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            source: live_backend
          </div>
        </div>
      );
    }

    if (activeTab === "email") {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full w-full relative">
          <div className="bg-gray-50 p-3 border-b border-gray-200 text-xs">
            <div className="flex text-gray-500 mb-1"><span className="w-12">From:</span> <span className="font-medium text-gray-900">MarketTwin Team</span></div>
            <div className="flex text-gray-500 mb-1"><span className="w-12">To:</span> <span className="font-medium text-gray-900">{currentCustomerId}@demo.com</span></div>
            <div className="flex text-gray-500"><span className="w-12">Subj:</span> <span className="font-bold text-gray-900 truncate">{creative.subject || "Personalized offer"}</span></div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-3 text-lg">{creative.title || creative.subject || "Special Offer"}</h3>
            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed mb-6">{creative.body || creative.message || "Your personalized message is ready."}</p>
            <button className="w-full bg-brand-600 text-white font-medium py-3 rounded-xl text-sm shadow-md hover:bg-brand-700 transition">
              {creative.cta || "Continue"}
            </button>
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
            <div className="px-2 py-1 bg-white rounded shadow-sm text-[10px] text-gray-500 font-mono flex items-center border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
              source: live_backend
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "push") {
      return (
        <div className="flex flex-col justify-center h-full space-y-4 w-full">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/40 relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-brand-500 rounded p-1">
                <Bell className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-500">MarketTwin App • Now</span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{creative.title || creative.subject || "Notification"}</h3>
            <p className="text-gray-600 text-xs leading-snug">{creative.body || creative.message || "Your personalized message is ready."}</p>
          </div>
          <div className="self-center mt-4 px-2 py-1 bg-white/60 rounded shadow-sm text-[10px] text-gray-500 font-mono flex items-center border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            source: live_backend
          </div>
        </div>
      );
    }

    if (activeTab === "website") {
      return (
        <div className="flex flex-col h-full bg-white relative w-full overflow-hidden rounded-2xl border border-gray-200">
          <div className="h-12 border-b border-gray-200 flex items-center px-4 justify-between bg-gray-50 shrink-0">
            <div className="w-16 h-3 bg-gray-200 rounded-full"></div>
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-brand-600 to-indigo-700 p-4 text-center text-white shadow-inner flex flex-col items-center shrink-0">
            <p className="text-xs text-brand-100 mb-3">{creative.banner || creative.body || creative.message || "Your personalized message is ready."}</p>
            <button className="bg-white text-brand-700 w-full font-bold py-1.5 rounded-lg text-xs hover:bg-gray-50">
              {creative.cta || "Continue"}
            </button>
          </div>
          <div className="p-4 space-y-4 flex-1 bg-white">
            <div className="w-full h-24 bg-gray-100 rounded-xl"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 bg-gray-100 rounded-xl"></div>
              <div className="h-20 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/80 backdrop-blur rounded shadow-sm text-[10px] text-gray-500 font-mono flex items-center border border-gray-100 z-10">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            source: live_backend
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen relative">
      {/* Notifications */}
      {toast && (
        <div className="fixed top-4 right-4 bg-emerald-100 text-emerald-800 px-4 py-2 rounded shadow flex items-center z-50">
          <CheckCircle className="w-5 h-5 mr-2" />
          {toast}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-rose-100 text-rose-800 px-4 py-2 rounded shadow flex items-center z-50">
          <XCircle className="w-5 h-5 mr-2" />
          <span className="flex-1 mr-4">{error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800"><XCircle className="w-4 h-4"/></button>
        </div>
      )}

      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Delivery Channels Simulator</h1>
        <p className="text-gray-500 mt-2">Preview live generated creatives and simulate user reactions.</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-5 py-3 font-medium text-sm border-b-2 transition-colors ${
                isActive ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Phone/Device Mockup */}
        <div className="flex justify-center items-center">
          <div className="w-[320px] h-[600px] bg-white border-8 border-gray-900 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
            <div className="bg-gray-900 h-6 w-1/2 mx-auto rounded-b-xl absolute top-0 left-1/4 z-10"></div>
            
            <div className="flex-1 bg-gray-100 relative p-4 pt-12 flex flex-col justify-center items-center">
              {renderCreativeContent()}
            </div>
          </div>
        </div>

        {/* Interaction Controls */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <HandIcon className="w-5 h-5 mr-2 text-brand-500" />
            Simulate Reaction
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Clicking these buttons will dispatch a reaction event to the backend API, allowing you to test how the digital twin behaves when the user reacts to messages.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleInteraction("clicked")}
              disabled={actionLoading || !latestGeneratedMessage || latestGeneratedMessage.channel !== activeTab}
              className="flex flex-col items-center justify-center p-6 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-blue-700"
            >
              <MousePointerClick className="w-8 h-8 mb-2" />
              <span className="font-semibold">Clicked Link</span>
            </button>
            <button 
              onClick={() => handleInteraction("ignored")}
              disabled={actionLoading || !latestGeneratedMessage || latestGeneratedMessage.channel !== activeTab}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <XCircle className="w-8 h-8 mb-2" />
              <span className="font-semibold">Ignored Message</span>
            </button>
            <button 
              onClick={() => handleInteraction("purchased")}
              disabled={actionLoading || !latestGeneratedMessage || latestGeneratedMessage.channel !== activeTab}
              className="flex flex-col items-center justify-center p-6 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-emerald-700"
            >
              <ShoppingBag className="w-8 h-8 mb-2" />
              <span className="font-semibold">Purchased</span>
            </button>
            <button 
              onClick={() => handleInteraction("unsubscribed")}
              disabled={actionLoading || !latestGeneratedMessage || latestGeneratedMessage.channel !== activeTab}
              className="flex flex-col items-center justify-center p-6 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-rose-700"
            >
              <LogOut className="w-8 h-8 mb-2" />
              <span className="font-semibold">Unsubscribed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
