import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useTrackEvent } from '../hooks/useTrackEvent';
import { useCartStore } from '../store/cartStore';

const StoreCartPage = () => {
  const navigate = useNavigate();
  const { trackEvent } = useTrackEvent();
  const { items, removeItem, getTotal } = useCartStore();

  useEffect(() => {
    trackEvent('cart_view', {
      cart_size: items.length,
      cart_value: getTotal()
    });
  }, [trackEvent, items.length, getTotal]);

  const handleRemove = (item) => {
    removeItem(item.id);
    trackEvent('remove_from_cart', {
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.qty
    });
  };

  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-16 flex flex-col items-center text-center animate-in fade-in">
        <div className="bg-indigo-50 text-indigo-500 w-24 h-24 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Explore our products and find something you love.
        </p>
        <button 
          onClick={() => navigate('/store')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row items-center gap-6">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-gray-100" />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                <div className="text-indigo-600 font-bold">${item.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-gray-600 font-medium bg-gray-100 px-4 py-1 rounded-full">Qty: {item.qty}</span>
                <button 
                  onClick={() => handleRemove(item)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
          <div className="space-y-4 text-sm text-gray-600 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-indigo-600">${total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/store/checkout')}
            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreCartPage;
