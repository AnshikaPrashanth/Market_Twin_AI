import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle } from 'lucide-react';
import { useTrackEvent } from '../hooks/useTrackEvent';
import { useCartStore } from '../store/cartStore';

const StoreCheckoutPage = () => {
  const navigate = useNavigate();
  const { trackEvent } = useTrackEvent();
  const { items, getTotal, clearCart } = useCartStore();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    trackEvent('checkout_started', {
      cart_size: items.length,
      cart_value: getTotal()
    });
  }, [trackEvent, items.length, getTotal]);

  const handleEmailBlur = () => {
    if (email && email.includes('@')) {
      trackEvent('email_entered', { email });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      trackEvent('purchase', {
        email,
        cart_size: items.length,
        cart_value: getTotal(),
        items: items.map(i => i.id)
      });
      
      setSuccess(true);
      clearCart();
      setIsSubmitting(false);
      
      // Redirect to home after 3 seconds
      setTimeout(() => navigate('/store'), 3000);
    }, 1500);
  };

  if (items.length === 0 && !success) {
    navigate('/store/cart');
    return null;
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-16 flex flex-col items-center text-center animate-in zoom-in duration-500">
        <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Thank you for your purchase. Your order has been processed and your MarketTwin digital twin has been updated.
        </p>
        <p className="text-sm text-gray-400">Redirecting to store...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
          <div className="font-medium text-gray-700">Total to Pay</div>
          <div className="text-3xl font-extrabold text-indigo-600">${getTotal().toFixed(2)}</div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-shadow outline-none"
              placeholder="you@example.com"
            />
            <p className="mt-2 text-xs text-gray-500">We'll use this to send your receipt and link to your digital twin.</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-shadow outline-none"
                  placeholder="0000 0000 0000 0000"
                />
                <CreditCard className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-shadow outline-none"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-shadow outline-none"
                placeholder="123"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 mt-8 ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Processing Payment...</span>
            ) : (
              <>Pay ${getTotal().toFixed(2)}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StoreCheckoutPage;
