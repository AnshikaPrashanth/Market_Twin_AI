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

const DEMO_CUSTOMER_ID = "CUST_DEMO_001";
const DEMO_DEVICE_ID = "D88";
const DEMO_PRODUCT_ID = "P101";
const DEMO_PRODUCT_NAME = "Wireless Headphones";
const DEMO_PRICE = 2499;

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
    clearError
  } = useMarketTwinStore();
  
  const [stepLabel, setStepLabel] = useState("");

  async function handleRunDemo() {
    setDemoRunning(true);
    clearError();
    setStepLabel("Resetting...");

    try {
      console.log("[RunDemo] START");

      const resetResponse = await resetDemo();
      console.log("[RunDemo] reset response", resetResponse);

      hydrateFromReset(resetResponse);
      clearLiveEvents();

      const customerId = resetResponse.customer?.customer_id || DEMO_CUSTOMER_ID;

      await sleep(800);

      setStepLabel("Viewing product...");
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
      console.log("[RunDemo] product_view start", productViewPayload);
      const viewResponse = await ingestEvent(productViewPayload);
      console.log("[RunDemo] product_view response", viewResponse);
      setProcessingResult(viewResponse, productViewPayload);

      await sleep(900);

      setStepLabel("Adding to cart...");
      console.log("[RunDemo] add_to_cart start");
      const addResponse = await addToCart(customerId, DEMO_PRODUCT_ID);
      console.log("[RunDemo] add_to_cart response", addResponse);
      if (addResponse.cart) setCart(addResponse.cart);
      setProcessingResult(addResponse, {
        event_type: "add_to_cart",
        source: "website",
        product_id: DEMO_PRODUCT_ID,
        product_name: DEMO_PRODUCT_NAME
      });

      await sleep(900);

      setStepLabel("Abandoning cart...");
      console.log("[RunDemo] abandon 1 start");
      const abandon1 = await abandonCart(customerId);
      console.log("[RunDemo] abandon 1 response", abandon1);
      if (abandon1.cart) setCart(abandon1.cart);
      setProcessingResult(abandon1, {
        event_type: "cart_abandoned",
        source: "website",
        product_id: DEMO_PRODUCT_ID,
        product_name: DEMO_PRODUCT_NAME
      });

      await sleep(900);

      setStepLabel("Triggering recovery...");
      console.log("[RunDemo] abandon 2 start");
      const abandon2 = await abandonCart(customerId);
      console.log("[RunDemo] abandon 2 response", abandon2);
      if (abandon2.cart) setCart(abandon2.cart);
      setProcessingResult(abandon2, {
        event_type: "cart_abandoned",
        source: "website",
        product_id: DEMO_PRODUCT_ID,
        product_name: DEMO_PRODUCT_NAME
      });

      await sleep(900);

      setStepLabel("Loading recovery message...");
      console.log("[RunDemo] latest message start");
      const msgResponse = await getLatestMessage(customerId);
      console.log("[RunDemo] latest message response", msgResponse);
      setLatestMessage(msgResponse);

      const generatedMessage =
        msgResponse.generated_message ||
        abandon2.event_result?.generated_message ||
        abandon2.generated_message;

      if (!generatedMessage) {
        throw new Error("No recovery message generated after cart abandonment.");
      }

      await sleep(900);

      setStepLabel("Clicking message...");
      console.log("[RunDemo] click start");
      const clickResponse = await reactToMessage(customerId, "clicked");
      console.log("[RunDemo] click response", clickResponse);
      if (clickResponse.cart) setCart(clickResponse.cart);
      if (clickResponse.latest_message) setLatestMessage(clickResponse.latest_message);
      setProcessingResult(clickResponse, {
        event_type: "message_click",
        source: generatedMessage.channel || "email"
      });

      await sleep(900);

      setStepLabel("Purchasing...");
      console.log("[RunDemo] purchase start");
      const purchaseResponse = await purchaseCart(customerId);
      console.log("[RunDemo] purchase response", purchaseResponse);
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
      setDemoRunning(false);
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
