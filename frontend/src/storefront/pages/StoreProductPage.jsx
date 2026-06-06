import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Shield, Truck } from 'lucide-react';
import { useTrackEvent } from '../hooks/useTrackEvent';
import { useCartStore } from '../store/cartStore';
import { products } from './StoreHomePage';

const StoreProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trackEvent } = useTrackEvent();
  const addItem = useCartStore(state => state.addItem);

  const product = products.find(p => p.id === id);

  useEffect(() => {
    if (product) {
      trackEvent('product_view', {
        product_id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        page_type: 'product_detail'
      });
    }
  }, [product, trackEvent]);

  if (!product) {
    return <div className="p-8 text-center">Product not found.</div>;
  }

  const handleAddToCart = () => {
    addItem(product);
    trackEvent('add_to_cart', {
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      source: 'product_page'
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate('/store')}
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
      </button>

      <div className="bg-white rounded-2xl shadow-sm border p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="text-sm font-medium text-indigo-600 mb-2">{product.category}</div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="text-3xl font-bold text-gray-900 mb-6">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Experience premium quality with our state-of-the-art product. Designed for maximum comfort and durability, it seamlessly integrates into your daily life.
            </p>

            <button 
              onClick={handleAddToCart}
              className="w-full py-4 px-8 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 mb-8"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>

            <div className="grid grid-cols-2 gap-4 border-t pt-8">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-5 h-5 text-green-500" />
                2-Year Warranty
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-5 h-5 text-indigo-500" />
                Free Shipping
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProductPage;
