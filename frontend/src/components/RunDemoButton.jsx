import React, { useState } from "react";
import { Play, Square } from "lucide-react";
import { useDemoStore } from "../store/demoStore";
import { useTwinStore } from "../store/twinStore";
import { ingestEvent } from "../api/client";

export default function RunDemoButton() {
  const { demoRunning, setDemoRunning, setLatestProcessingResult, setGeneratedMessage, addLiveEvent } = useDemoStore();
  const { selectedCustomerId, fetchTwinData, fetchMetricsData } = useTwinStore();
  const [demoProgress, setDemoProgress] = useState(0);

  const DEMO_DEVICE_ID = "DEMO_" + Math.floor(Math.random() * 100000);

  const runScenario = async () => {
    if (demoRunning) return;
    setDemoRunning(true);
    setDemoProgress(0);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const fireEvent = async (eventType, properties = {}) => {
      try {
        const payload = {
          event_type: eventType,
          source: "website",
          customer_id: selectedCustomerId,
          identifiers: { device_id: `DEV_${selectedCustomerId}`, email_hash: `user_${selectedCustomerId}@demo.com` },
          properties,
        };
        console.log("Posting event", selectedCustomerId, payload);
        const response = await ingestEvent(payload);
        
        fetchTwinData(selectedCustomerId);
        fetchMetricsData();
        setLatestProcessingResult(response);
        if (response.generated_message) setGeneratedMessage(response.generated_message);
        
        addLiveEvent({
          event_type: eventType,
          timestamp: new Date().toISOString(),
          customer_id: response.customer_id,
          properties,
        });

        return response;
      } catch (e) {
        console.error("Demo event failed", e);
      }
    };

    try {
      // 1. product_view
      setDemoProgress(1);
      await fireEvent("product_view", { product_id: "P101", product_name: "Wireless Headphones", price: 2499 });
      await sleep(1000);

      // 2. add_to_cart
      setDemoProgress(2);
      await fireEvent("add_to_cart", { product_id: "P101", product_name: "Wireless Headphones", price: 2499 });
      await sleep(1000);

      // 3. cart_abandoned (1st)
      setDemoProgress(3);
      await fireEvent("cart_abandoned", { cart_size: 1, cart_value: 2499 });
      await sleep(1000);

      // 4. cart_abandoned (2nd - triggers repeated abandonment)
      setDemoProgress(4);
      const res = await fireEvent("cart_abandoned", { cart_size: 1, cart_value: 2499 });
      await sleep(1500);

      // 5. Channel message sent (based on final_channel)
      setDemoProgress(5);
      const channel = res?.final_channel || "email";
      await fireEvent(`${channel}_sent`, { campaign: "recovery" });
      await sleep(1000);

      // 6. Channel click
      setDemoProgress(6);
      await fireEvent(`${channel}_click`, { campaign: "recovery" });
      await sleep(1200);

      // 7. Purchase
      setDemoProgress(7);
      await fireEvent("purchase", { cart_size: 1, price: 2499 });

    } finally {
      setDemoRunning(false);
      setDemoProgress(0);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={runScenario}
        disabled={demoRunning}
        className={`flex items-center px-6 py-3 rounded-full font-bold shadow-2xl transition-all ${
          demoRunning 
            ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
            : "bg-gradient-to-r from-emerald-500 to-brand-500 text-white hover:scale-105 hover:shadow-emerald-500/50"
        }`}
      >
        {demoRunning ? (
          <>
            <Square className="w-5 h-5 mr-2 animate-pulse" />
            Running... {demoProgress}/7
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            ▶ Run Demo
          </>
        )}
      </button>
    </div>
  );
}
