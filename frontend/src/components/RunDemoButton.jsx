import React, { useState } from "react";
import { Play, Square } from "lucide-react";
import { useMarketTwinStore } from "../store/marketTwinStore";
import { 
  ingestEvent, 
  resetDemo, 
  addToCart, 
  abandonCart, 
  purchaseCart, 
  reactToMessage, 
  getLatestMessage 
} from "../api/client";

const DEMO_CUSTOMER_ID = "CUST_007";
const DEMO_DEVICE_ID = "D88";
const DEMO_PRODUCT_ID = "P101";
const DEMO_PRODUCT_NAME = "Wireless Headphones";
const DEMO_PRICE = 5998;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function RunDemoButton() {
  const { 
    demoRunning, 
    setDemoRunning, 
    setProcessingResult, 
    hydrateFromReset,
    setCart,
    setLatestMessage,
    clearLiveEvents,
    setError,
    clearError,
    refreshAIPredictions
  } = useMarketTwinStore();
  
  const [stepLabel, setStepLabel] = useState("");

  async function handleRunDemo() {
    setDemoRunning(true);
    clearError();
    setStepLabel("Resetting demo state...");

    try {
      console.log("[RunDemo] START");

      const resetResponse = await resetDemo();
      hydrateFromReset(resetResponse);
      clearLiveEvents();
      
      const customerId = DEMO_CUSTOMER_ID;

      await sleep(800);

      setStepLabel("Step 1: Customer viewed product");
      const productViewPayload = {
        event_type: "product_view",
        source: "website",
        device_id: DEMO_DEVICE_ID,
        properties: {
          product_id: DEMO_PRODUCT_ID,
          product_name: DEMO_PRODUCT_NAME,
          price: DEMO_PRICE
        }
      };
      const viewResponse = await ingestEvent(productViewPayload);
      setProcessingResult(viewResponse, productViewPayload);

      await sleep(1500);

      setStepLabel("Step 2: Customer added item to cart");
      const addResponse = await addToCart(customerId, DEMO_PRODUCT_ID);
      if (addResponse.cart) setCart(addResponse.cart);
      setProcessingResult(addResponse, {
        event_type: "add_to_cart",
        source: "website",
        product_id: DEMO_PRODUCT_ID,
        product_name: DEMO_PRODUCT_NAME
      });

      await sleep(1500);

      setStepLabel("Step 3: Customer abandoned cart");
      const abandon = await abandonCart(customerId);
      if (abandon.cart) setCart(abandon.cart);
      setProcessingResult(abandon, {
        event_type: "cart_abandoned",
        source: "website",
        product_id: DEMO_PRODUCT_ID,
        product_name: DEMO_PRODUCT_NAME
      });

      await sleep(1500);

      setStepLabel("Step 4: AI selected next best action");
      // The backend has already resolved identity, updated twin, and generated NBA during the abandonCart event.
      // We explicitly refresh predictions here to ensure UI is completely synced.
      if (abandon.event_result?.twin) {
        await refreshAIPredictions(customerId, abandon.event_result.twin, abandon.event_result.final_channel);
      }
      
      await sleep(1500);

      setStepLabel("Step 5: Coupon sent through Email");
      const msgResponse = await getLatestMessage(customerId);
      setLatestMessage(msgResponse);
      
      const generatedMessage = msgResponse.generated_message || abandon.event_result?.generated_message;

      await sleep(1500);

      setStepLabel("Step 6: Coupon clicked");
      if (generatedMessage) {
        const clickResponse = await reactToMessage(customerId, "clicked");
        if (clickResponse.cart) setCart(clickResponse.cart);
        if (clickResponse.latest_message) setLatestMessage(clickResponse.latest_message);
        setProcessingResult(clickResponse, {
          event_type: "message_click",
          source: generatedMessage.channel || "email"
        });
      }

      await sleep(1500);

      setStepLabel("Step 7: Conversion measured");
      const purchaseResponse = await purchaseCart(customerId);
      if (purchaseResponse.cart) setCart(purchaseResponse.cart);
      setProcessingResult(purchaseResponse, {
        event_type: "purchase",
        source: "website",
        product_id: DEMO_PRODUCT_ID,
        product_name: DEMO_PRODUCT_NAME
      });

      setStepLabel("Demo complete");
      console.log("[RunDemo] COMPLETE");
    } catch (err) {
      console.error("[RunDemo] FAILED", err);
      setError(err.message || String(err));
      setStepLabel("Demo failed");
    } finally {
      setTimeout(() => setDemoRunning(false), 2000);
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={handleRunDemo}
        disabled={demoRunning}
        className={`flex items-center px-6 py-3 rounded-full font-bold shadow-2xl transition-all ${
          demoRunning 
            ? "bg-gray-800 text-gray-400 cursor-not-allowed" 
            : "bg-gradient-to-r from-emerald-500 to-brand-500 text-white hover:scale-105 hover:shadow-emerald-500/50"
        }`}
      >
        {demoRunning ? (
          <>
            <Square className="w-5 h-5 mr-2 animate-pulse" />
            {stepLabel || "Running..."}
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
