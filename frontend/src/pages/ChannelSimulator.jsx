import React, { useState } from "react";
import { useDemoStore } from "../store/demoStore";
import { useTwinStore } from "../store/twinStore";
import { ingestEvent } from "../api/client";
import { MessageSquare, Mail, Bell, Monitor, HandIcon, MousePointerClick, XCircle, ShoppingBag, LogOut } from "lucide-react";

export default function ChannelSimulator() {
  const { generatedMessage } = useDemoStore();
  const { selectedCustomerId, fetchTwinData, fetchMetricsData, twinState } = useTwinStore();
  const [activeTab, setActiveTab] = useState("whatsapp");

  const TABS = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
    { id: "email", label: "Email", icon: Mail },
    { id: "push", label: "Push Notification", icon: Bell },
    { id: "website", label: "Website Banner", icon: Monitor },
  ];

  const handleInteraction = async (action) => {
    if (!selectedCustomerId) return;
    try {
      let eventType = "";
      if (action === "click") eventType = `${activeTab}_click`;
      if (action === "ignore") eventType = "session_end";
      if (action === "purchase") eventType = "purchase";
      if (action === "unsubscribe") eventType = "unsubscribe";
      if (activeTab === "website" && action === "click") eventType = "banner_click";

      const payload = {
        event_type: eventType,
        source: activeTab,
        customer_id: selectedCustomerId,
        identifiers: { device_id: `DEV_${selectedCustomerId}` },
      };
      console.log("Posting event", selectedCustomerId, payload);
      await ingestEvent(payload);
      fetchTwinData(selectedCustomerId);
      fetchMetricsData();
    } catch (e) {
      console.error("Interaction failed", e);
    }
  };

  const generateDynamicCreative = () => {
    if (!twinState) return null;
    const action = twinState.next_best_action || "do_nothing";
    const fatigue = twinState.fatigue_score || 0;
    
    if (fatigue >= 60) {
      return { blocked: true, blockType: "fatigue", reason: "Outreach blocked because fatigue threshold was exceeded." };
    }
    if (action === "do_nothing") {
      return { blocked: true, blockType: "do_nothing", reason: "No outreach generated because NBA recommended do_nothing." };
    }
    if (action === "reduce_frequency" || action === "cool_down_marketing") {
      return { blocked: true, blockType: "suppressed", reason: "Outreach suppressed to reduce customer fatigue." };
    }

    // Determine message context based on action
    let context = { subject: "", title: "", body: "", cta: "", coupon: false };
    
    if (action === "cart_recovery_coupon" || action === "send_coupon") {
      context.subject = "Don't leave your items behind! 🛒";
      context.title = "Complete your purchase";
      context.body = "We noticed you left some great items in your cart. Use code SAVE20 for 20% off your order if you complete it today!";
      context.cta = "Checkout Now";
      context.coupon = true;
    } else if (action === "recommend_popular_products") {
      context.subject = "Trending right now 🔥";
      context.title = "See what's popular";
      context.body = "Check out these trending products handpicked for you based on what others are buying.";
      context.cta = "Shop Trending";
    } else if (action === "send_whatsapp" || action === "send_push" || action === "send_email") {
      context.subject = "Just for you!";
      context.title = "Exclusive update";
      context.body = "We've got something special waiting for you. Come back and discover your personalized offers.";
      context.cta = "See Offers";
    } else {
      context.subject = "Hello from MarketTwin";
      context.title = "Stay Connected";
      context.body = "Thank you for being a valued customer. Check out our latest updates.";
      context.cta = "Visit Store";
    }

    return { blocked: false, ...context };
  };

  const renderCreativeContent = () => {
    const creative = generateDynamicCreative();
    if (!creative) {
      return (
        <div className="text-center text-gray-400 p-6 flex flex-col items-center">
          <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm">No active generated message. Waiting for twin state.</p>
        </div>
      );
    }

    if (creative.blocked) {
      return (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex flex-col items-center text-center">
          <XCircle className="w-10 h-10 text-rose-400 mb-2" />
          <h3 className="font-bold text-rose-900 mb-1">Outreach Blocked</h3>
          <p className="text-rose-700 text-sm">{creative.reason}</p>
          <div className="mt-4 px-2 py-1 bg-white rounded shadow-sm text-[10px] text-gray-500 font-mono flex items-center border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
            source: template_dynamic
          </div>
        </div>
      );
    }

    if (activeTab === "whatsapp") {
      return (
        <div className="flex flex-col space-y-2 h-full justify-end pb-4 w-full">
          <div className="self-end bg-emerald-100 text-emerald-900 px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm relative">
            <p className="text-sm">{creative.body}</p>
            {creative.coupon && (
              <div className="mt-2 bg-white/50 border border-emerald-200 p-2 rounded text-center text-xs font-bold text-emerald-800">
                🎫 SAVE20
              </div>
            )}
            <div className="text-right text-[10px] text-emerald-600/60 mt-1">10:42 AM</div>
          </div>
          <div className="self-end w-full max-w-[85%]">
            <button className="w-full bg-white border border-gray-200 shadow-sm text-emerald-600 font-medium py-2 rounded-xl text-sm flex justify-center items-center gap-1 hover:bg-gray-50">
              <MessageSquare className="w-3 h-3" /> {creative.cta}
            </button>
          </div>
          <div className="self-center mt-4 px-2 py-1 bg-white/60 rounded shadow-sm text-[10px] text-gray-500 font-mono flex items-center border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            source: template_dynamic
          </div>
        </div>
      );
    }

    if (activeTab === "email") {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full w-full relative">
          <div className="bg-gray-50 p-3 border-b border-gray-200 text-xs">
            <div className="flex text-gray-500 mb-1"><span className="w-12">From:</span> <span className="font-medium text-gray-900">MarketTwin Team</span></div>
            <div className="flex text-gray-500 mb-1"><span className="w-12">To:</span> <span className="font-medium text-gray-900">{selectedCustomerId}@demo.com</span></div>
            <div className="flex text-gray-500"><span className="w-12">Subj:</span> <span className="font-bold text-gray-900 truncate">{creative.subject}</span></div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-3 text-lg">{creative.title}</h3>
            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed mb-6">{creative.body}</p>
            {creative.coupon && (
              <div className="mb-6 border-2 border-dashed border-brand-300 bg-brand-50 rounded-xl p-4 text-center">
                <p className="text-xs text-brand-600 font-semibold mb-1">YOUR EXCLUSIVE CODE</p>
                <p className="text-xl font-black text-brand-700 tracking-wider">SAVE20</p>
              </div>
            )}
            <button className="w-full bg-brand-600 text-white font-medium py-3 rounded-xl text-sm shadow-md hover:bg-brand-700 transition">
              {creative.cta}
            </button>
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-center">
            <div className="px-2 py-1 bg-white rounded shadow-sm text-[10px] text-gray-500 font-mono flex items-center border border-gray-100">
              <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
              source: template_dynamic
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
            <h3 className="font-bold text-gray-900 text-sm mb-1">{creative.title}</h3>
            <p className="text-gray-600 text-xs leading-snug">{creative.body}</p>
          </div>
          <div className="self-center mt-4 px-2 py-1 bg-white/60 rounded shadow-sm text-[10px] text-gray-500 font-mono flex items-center border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            source: template_dynamic
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
            <h3 className="font-bold text-sm mb-1">{creative.title}</h3>
            <p className="text-xs text-brand-100 mb-3">{creative.body}</p>
            {creative.coupon && (
              <div className="bg-white/20 px-3 py-1 rounded text-xs font-bold mb-3 border border-white/30">
                Code: SAVE20
              </div>
            )}
            <button className="bg-white text-brand-700 w-full font-bold py-1.5 rounded-lg text-xs hover:bg-gray-50">
              {creative.cta}
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
            source: template_dynamic
          </div>
        </div>
      );
    }

    return null;
  };

  const creative = generateDynamicCreative();

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Delivery Channels Simulator</h1>
        <p className="text-gray-500 mt-2">Preview generated creatives and simulate user interactions.</p>
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
            Clicking these buttons will dispatch an event back to the ingestion pipeline, simulating how the customer reacted to the creative message.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleInteraction("click")}
              disabled={!creative || creative.blocked}
              className="flex flex-col items-center justify-center p-6 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-blue-700"
            >
              <MousePointerClick className="w-8 h-8 mb-2" />
              <span className="font-semibold">Clicked Link</span>
            </button>
            <button 
              onClick={() => handleInteraction("ignore")}
              disabled={!creative || creative.blocked}
              className="flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
              <XCircle className="w-8 h-8 mb-2" />
              <span className="font-semibold">Ignored Message</span>
            </button>
            <button 
              onClick={() => handleInteraction("purchase")}
              disabled={!creative || (creative.blocked && activeTab !== "website")}
              className="flex flex-col items-center justify-center p-6 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-emerald-700"
            >
              <ShoppingBag className="w-8 h-8 mb-2" />
              <span className="font-semibold">Purchased</span>
            </button>
            <button 
              onClick={() => handleInteraction("unsubscribe")}
              disabled={!creative || creative.blocked}
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
