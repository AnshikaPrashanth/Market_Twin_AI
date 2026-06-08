import React, { useEffect, useState } from "react";
import { useMarketTwinStore } from "../store/marketTwinStore";
import { ingestEvent, addToCart, removeFromCart, abandonCart, purchaseCart, loginCustomer, registerCustomer } from "../api/client";
import { ShoppingCart, Eye, LogOut, CheckCircle, Trash2, XCircle, User, Mail, Lock, Phone, MapPin, Loader2 } from "lucide-react";

export default function Storefront() {
  const { currentCustomerId, customer, products, cart, loadProductsIfNeeded, loginAsCustomer, setProcessingResult, error, setError, loading } = useMarketTwinStore();
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [authForm, setAuthForm] = useState({
    name: "", email: "", password: "", phone: "", city: "",
    consent_email: true, consent_whatsapp: true, consent_push: false
  });
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    loadProductsIfNeeded();
  }, [loadProductsIfNeeded]);

  // Clear toast automatically
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleViewProduct = async (product) => {
    setActionLoading(true);
    try {
      const payload = {
        event_type: "product_view",
        source: "website",
        customer_id: currentCustomerId,
        identifiers: { device_id: "D88" },
        properties: {
          product_id: product.product_id,
          product_name: product.name,
          price: product.price
        }
      };
      const response = await ingestEvent(payload);
      setProcessingResult(response, payload);
      setToast(`Viewed ${product.name}`);
    } catch (e) {
      setError(e.message || "Failed to view product");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    setActionLoading(true);
    try {
      const response = await addToCart(currentCustomerId, product.product_id);
      setProcessingResult(response, { event_type: "add_to_cart", properties: { product_id: product.product_id } });
      setToast(`Added ${product.name} to cart`);
    } catch (e) {
      setError(e.message || "Failed to add to cart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFromCart = async (product) => {
    setActionLoading(true);
    try {
      const response = await removeFromCart(currentCustomerId, product.product_id);
      setProcessingResult(response, { event_type: "remove_from_cart", properties: { product_id: product.product_id } });
    } catch (e) {
      setError(e.message || "Failed to remove from cart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAbandon = async () => {
    if (!cart?.items?.length) {
      setError("Add an item before abandoning cart.");
      return;
    }
    setActionLoading(true);
    try {
      const response = await abandonCart(currentCustomerId);
      setProcessingResult(response, { event_type: "cart_abandoned" });
      setToast("Cart abandoned");
    } catch (e) {
      setError(e.message || "Failed to abandon cart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!cart?.items?.length) {
      setError("Add an item before purchase.");
      return;
    }
    setActionLoading(true);
    try {
      const response = await purchaseCart(currentCustomerId);
      setProcessingResult(response, { event_type: "purchase" });
      setToast("Purchase completed!");
    } catch (e) {
      setError(e.message || "Failed to complete purchase");
    } finally {
      setActionLoading(false);
    }
  };

  const cartItemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await loginCustomer({ identifier: authForm.email, password: authForm.password });
      if (res && res.customer_id) {
        await loginAsCustomer(res.customer_id);
      }
    } catch (e) {
      setError(e.message || "Invalid credentials");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const payload = {
        name: authForm.name,
        email: authForm.email,
        password: authForm.password,
        phone: authForm.phone,
        city: authForm.city,
        device_id: "D88",
        consent: {
          email: authForm.consent_email,
          whatsapp: authForm.consent_whatsapp,
          push: authForm.consent_push
        }
      };
      const res = await registerCustomer(payload);
      if (res && res.customer_id) {
        await loginAsCustomer(res.customer_id);
      }
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Storefront...</div>;
  }

  if (!currentCustomerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        {error && (
          <div className="fixed top-4 right-4 bg-rose-100 text-rose-800 px-4 py-2 rounded shadow flex items-center z-50">
            <XCircle className="w-5 h-5 mr-2" />
            <span className="flex-1 mr-4">{error}</span>
            <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800"><XCircle className="w-4 h-4"/></button>
          </div>
        )}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Shopverse</h1>
            <p className="text-gray-500 mt-2">Sign in to continue to Storefront</p>
          </div>
          
          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input required type="text" className="pl-10 w-full rounded-lg border border-gray-300 p-2.5 focus:ring-brand-500 focus:border-brand-500 outline-none" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} placeholder="rahul@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input required type="password" className="pl-10 w-full rounded-lg border border-gray-300 p-2.5 focus:ring-brand-500 focus:border-brand-500 outline-none" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={authLoading} className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-white bg-brand-600 hover:bg-brand-700 font-medium transition disabled:opacity-50">
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setAuthMode("register")} className="text-sm text-brand-600 hover:underline">Don't have an account? Create one</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input required type="text" className="pl-10 w-full rounded-lg border border-gray-300 p-2 focus:ring-brand-500 focus:border-brand-500 outline-none" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} placeholder="Rahul Sharma" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input required type="email" className="pl-10 w-full rounded-lg border border-gray-300 p-2 focus:ring-brand-500 focus:border-brand-500 outline-none" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} placeholder="rahul@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input required type="tel" className="pl-10 w-full rounded-lg border border-gray-300 p-2 focus:ring-brand-500 focus:border-brand-500 outline-none" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: e.target.value})} placeholder="9876543210" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input required type="text" className="pl-10 w-full rounded-lg border border-gray-300 p-2 focus:ring-brand-500 focus:border-brand-500 outline-none" value={authForm.city} onChange={e => setAuthForm({...authForm, city: e.target.value})} placeholder="Bangalore" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input required type="password" className="pl-10 w-full rounded-lg border border-gray-300 p-2 focus:ring-brand-500 focus:border-brand-500 outline-none" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} placeholder="••••••••" />
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t mt-4">
                <span className="block text-sm font-medium text-gray-700 mb-2">Communication Preferences</span>
                <div className="flex gap-4">
                  <label className="flex items-center text-sm text-gray-600"><input type="checkbox" checked={authForm.consent_email} onChange={e => setAuthForm({...authForm, consent_email: e.target.checked})} className="mr-2 rounded text-brand-600" /> Email</label>
                  <label className="flex items-center text-sm text-gray-600"><input type="checkbox" checked={authForm.consent_whatsapp} onChange={e => setAuthForm({...authForm, consent_whatsapp: e.target.checked})} className="mr-2 rounded text-brand-600" /> WhatsApp</label>
                  <label className="flex items-center text-sm text-gray-600"><input type="checkbox" checked={authForm.consent_push} onChange={e => setAuthForm({...authForm, consent_push: e.target.checked})} className="mr-2 rounded text-brand-600" /> Push</label>
                </div>
              </div>
              <button type="submit" disabled={authLoading} className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-white bg-brand-600 hover:bg-brand-700 font-medium transition disabled:opacity-50 mt-4">
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setAuthMode("login")} className="text-sm text-gray-500 hover:underline">Already have an account? Sign in</button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen text-gray-900 relative">
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

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopverse Storefront</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, <span className="font-semibold">{customer?.name || "Customer"}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleAbandon} 
            disabled={actionLoading}
            className="flex items-center px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition disabled:opacity-50"
          >
            <LogOut className="w-4 h-4 mr-2" /> Abandon Cart
          </button>
          <button 
            onClick={handleBuyNow} 
            disabled={actionLoading}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Buy Now
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Product Catalog */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          {!products || products.length === 0 ? (
            <div className="bg-white p-6 rounded shadow border text-center text-gray-500">
              Unable to load products from backend.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <div key={p.product_id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition">
                  <div className="text-6xl text-center mb-4">{p.image}</div>
                  <div className="text-sm text-gray-400 mb-1">{p.category}</div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="text-brand-600 font-bold mb-4">₹{p.price}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProduct(p)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </button>
                    <button
                      onClick={() => handleAddToCart(p)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-gray-600" />
                Your Cart
              </h2>
              {cartItemCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {cartItemCount} items
                </span>
              )}
            </div>

            {!cart ? (
              <p className="text-gray-500">Unable to load cart.</p>
            ) : cart.items?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">Your cart is empty.</p>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium uppercase tracking-wider">
                  Status: {cart.status}
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium uppercase tracking-wider">
                    Status: {cart.status}
                  </span>
                </div>
                {cart.items.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-gray-500 text-xs">₹{item.price} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold text-sm mr-3">₹{item.price * item.quantity}</span>
                      <button 
                        onClick={() => handleRemoveFromCart(item)}
                        disabled={actionLoading}
                        className="text-gray-400 hover:text-rose-500 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{cart.cart_value}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
