import React, { useState } from "react";
import { useTwinStore } from "../store/twinStore";
import { ingestEvent } from "../api/client";
import { ShoppingCart, Eye, LogOut, CheckCircle } from "lucide-react";

// Demo product catalogue used only to generate simulated customer behavior events.
const PRODUCTS = [
  { id: "P101", name: "Wireless Headphones", price: 2499, image: "🎧" },
  { id: "P102", name: "Running Shoes", price: 3499, image: "👟" },
  { id: "P103", name: "Smart Watch", price: 5999, image: "⌚" },
  { id: "P104", name: "Backpack", price: 1999, image: "🎒" },
];

export default function Storefront() {
  const [cart, setCart] = useState([]);
  const { selectedCustomerId, fetchTwinData, fetchMetricsData } = useTwinStore();

  const handleEvent = async (eventType, properties = {}) => {
    try {
      const payload = {
        event_type: eventType,
        source: "website",
        customer_id: selectedCustomerId,
        identifiers: { device_id: `DEV_${selectedCustomerId}` },
        properties,
      };
      console.log("Posting event", selectedCustomerId, payload);
      await ingestEvent(payload);
      fetchTwinData(selectedCustomerId); // Refetch backend state
      fetchMetricsData(); // Refetch dashboard metrics
    } catch (e) {
      console.error("Storefront event failed", e);
    }
  };

  const viewProduct = (product) => {
    handleEvent("product_view", { product_id: product.id, product_name: product.name, price: product.price });
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    handleEvent("add_to_cart", { product_id: product.id, product_name: product.name, price: product.price });
  };

  const abandonCart = () => {
    if (cart.length === 0) return;
    handleEvent("cart_abandoned", {
      cart_size: cart.length,
      cart_value: cart.reduce((acc, p) => acc + p.price, 0),
    });
    setCart([]);
  };

  const buyNow = () => {
    if (cart.length === 0) return;
    handleEvent("purchase", {
      cart_size: cart.length,
      price: cart.reduce((acc, p) => acc + p.price, 0),
    });
    setCart([]);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen text-gray-900">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopverse Storefront</h1>
          <p className="text-gray-500 mt-1">Simulated e-commerce environment (Customer: {selectedCustomerId})</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-600" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
          <button onClick={abandonCart} className="flex items-center px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition">
            <LogOut className="w-4 h-4 mr-2" /> Abandon Cart
          </button>
          <button onClick={buyNow} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md">
            <CheckCircle className="w-4 h-4 mr-2" /> Buy Now
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRODUCTS.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition">
            <div className="text-6xl text-center mb-4">{p.image}</div>
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="text-brand-600 font-bold mb-4">₹{p.price}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => viewProduct(p)}
                className="flex-1 flex items-center justify-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <Eye className="w-4 h-4 mr-1" /> View
              </button>
              <button
                onClick={() => addToCart(p)}
                className="flex-1 flex items-center justify-center py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
              >
                <ShoppingCart className="w-4 h-4 mr-1" /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
