import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTrackEvent } from '../hooks/useTrackEvent';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export const products = [
  {
    id: 'PROD_101',
    name: 'Wireless Noise-Canceling Headphones',
    price: 299.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
    rating: 4.8
  },
  {
    id: 'PROD_102',
    name: 'Smart Fitness Watch Series 5',
    price: 199.50,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
    rating: 4.6
  },
  {
    id: 'PROD_103',
    name: 'Premium Leather Weekend Bag',
    price: 149.00,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400',
    rating: 4.9
  },
  {
    id: 'PROD_104',
    name: 'Minimalist Mechanical Keyboard',
    price: 129.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400',
    rating: 4.7
  },
  {
    id: 'PROD_105',
    name: 'Ultra-Wide Curved Gaming Monitor',
    price: 449.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400',
    rating: 4.8
  },
  {
    id: 'PROD_106',
    name: 'Ergonomic Memory Foam Office Chair',
    price: 249.00,
    category: 'Home & Office',
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=400',
    rating: 4.5
  },
  {
    id: 'PROD_107',
    name: 'Smart Water Bottle with UV Sterilizer',
    price: 59.99,
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400',
    rating: 4.4
  },
  {
    id: 'PROD_108',
    name: 'Compact Portable Espresso Maker',
    price: 89.50,
    category: 'Home & Office',
    image: 'https://images.unsplash.com/photo-1519082117537-f839b1a04b2c?auto=format&fit=crop&q=80&w=400',
    rating: 4.7
  }
];

const StoreHomePage = () => {
  const { trackEvent } = useTrackEvent();
  const addItem = useCartStore(state => state.addItem);

  const handleProductView = (product) => {
    trackEvent('product_view', {
      product_id: product.id,
      name: product.name,
      price: product.price,
      category: product.category
    });
  };

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    addItem(product);
    trackEvent('add_to_cart', {
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      source: 'quick_add'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-700 text-white p-12 rounded-2xl shadow-lg flex flex-col items-center text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Welcome to MarketTwin Store</h1>
        <p className="text-lg text-indigo-100 mb-8 max-w-2xl">
          Interact with this storefront to see how the backend intelligence engine dynamically processes real-time events.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link 
              key={product.id} 
              to={`/store/product/${product.id}`}
              onClick={() => handleProductView(product)}
              className="group flex flex-col bg-white rounded-xl shadow-sm border hover:shadow-md transition-all overflow-hidden"
            >
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button 
                  onClick={(e) => handleQuickAdd(e, product)}
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1 text-amber-500 mb-2 text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating}</span>
                </div>
                <h3 className="font-semibold text-gray-900 leading-tight mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{product.category}</p>
                <div className="mt-auto text-lg font-bold text-indigo-600">
                  ${product.price.toFixed(2)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreHomePage;
