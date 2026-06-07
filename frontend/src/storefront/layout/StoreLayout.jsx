import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, Package, User, LogOut, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useCartAbandonment } from '../hooks/useCartAbandonment';
import { useTrackEvent } from '../hooks/useTrackEvent';

const StoreLayout = () => {
  useCartAbandonment();
  const { trackEvent } = useTrackEvent();
  const navigate = useNavigate();
  const itemsCount = useCartStore(state => state.items.reduce((acc, item) => acc + item.qty, 0));
  
  const [userEmail, setUserEmail] = useState(localStorage.getItem('mt_user_email') || '');
  const [userName, setUserName] = useState(localStorage.getItem('mt_user_name') || '');
  const [userId, setUserId] = useState(localStorage.getItem('mt_user_id') || '');
  const [isIdentified, setIsIdentified] = useState(!!localStorage.getItem('mt_user_email'));

  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customId, setCustomId] = useState('');

  const handleSelectIdentity = async (seededEmail, seededName, seededId) => {
    localStorage.setItem('mt_user_email', seededEmail);
    localStorage.setItem('mt_user_name', seededName);
    localStorage.setItem('mt_user_id', seededId);
    
    setUserEmail(seededEmail);
    setUserName(seededName);
    setUserId(seededId);
    setIsIdentified(true);

    // Track session_start linking the device_id to the selected customer email/id
    await trackEvent('session_start', {
      login_method: 'seeded_identity',
      city: seededId === 'CUST_001' ? 'Mumbai' : 'Bengaluru',
      device_type: seededId === 'CUST_001' ? 'Mobile' : 'Desktop'
    });
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail || !customName) return;

    localStorage.setItem('mt_user_email', customEmail);
    localStorage.setItem('mt_user_name', customName);
    if (customId) {
      localStorage.setItem('mt_user_id', customId);
      setUserId(customId);
    } else {
      localStorage.removeItem('mt_user_id');
      setUserId('');
    }

    setUserEmail(customEmail);
    setUserName(customName);
    setIsIdentified(true);

    // Track session start linking device to custom email/id
    await trackEvent('session_start', {
      login_method: 'custom_identity',
      custom_user: true
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('mt_user_email');
    localStorage.removeItem('mt_user_name');
    localStorage.removeItem('mt_user_id');
    setIsIdentified(false);
    setUserEmail('');
    setUserName('');
    setUserId('');
    useCartStore.getState().clearCart();
    navigate('/store');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/store" className="flex items-center gap-2 text-indigo-600">
                <Store className="h-8 w-8" />
                <span className="text-xl font-bold tracking-tight">MarketTwin Store</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              {isIdentified && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
                    <User className="h-4 w-4 text-indigo-600" />
                    <span className="font-semibold">{userName}</span>
                    <span className="text-xs text-gray-500">({userEmail})</span>
                  </div>
                  <Link to="/store" className="text-gray-600 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors">
                    <Package className="h-5 w-5" /> Products
                  </Link>
                  <Link to="/store/cart" className="text-gray-600 hover:text-indigo-600 flex items-center gap-1 relative font-medium transition-colors">
                    <ShoppingCart className="h-5 w-5" /> Cart
                    {itemsCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {itemsCount}
                      </span>
                    )}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1 text-sm font-medium"
                    title="Change identity"
                  >
                    <LogOut className="h-4 w-4" /> Reset
                  </button>
                </>
              )}
              <Link to="/" className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
                Control Room
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Identity Prompt Screen */}
      {!isIdentified ? (
        <div className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border p-8 md:p-12 space-y-8 animate-in zoom-in duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-2">
                <User className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">Who is browsing?</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Before entering the storefront, choose or enter an identity to relate this session to the Identity Resolution engine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Seeded Identities */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Seeded Identities</h3>
                
                <button
                  onClick={() => handleSelectIdentity('EMAIL_991', 'Alice (Mumbai)', 'CUST_001')}
                  className="w-full text-left p-4 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all flex justify-between items-center group"
                >
                  <div>
                    <h4 className="font-extrabold text-indigo-900">Alice (Mumbai)</h4>
                    <p className="text-xs text-indigo-700 mt-1">CUST_001 | EMAIL_991</p>
                    <p className="text-[10px] text-gray-500 mt-1">Prefers: Headphones, Electronics</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleSelectIdentity('EMAIL_CUST2', 'Bob (Bengaluru)', 'CUST_002')}
                  className="w-full text-left p-4 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all flex justify-between items-center group"
                >
                  <div>
                    <h4 className="font-extrabold text-indigo-900">Bob (Bengaluru)</h4>
                    <p className="text-xs text-indigo-700 mt-1">CUST_002 | EMAIL_CUST2</p>
                    <p className="text-[10px] text-gray-500 mt-1">Prefers: Laptops, Books</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Custom Identity Form */}
              <div className="space-y-4 border-t md:border-t-0 md:border-l md:pl-6 pt-6 md:pt-0">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Custom Identity</h3>
                
                <form onSubmit={handleCustomSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name</label>
                    <input 
                      type="text" 
                      required 
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email / Identifier</label>
                    <input 
                      type="email" 
                      required 
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Loyalty ID (Optional)</label>
                    <input 
                      type="text" 
                      value={customId}
                      onChange={(e) => setCustomId(e.target.value)}
                      placeholder="LOYAL_007"
                      className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-150 transition-colors"
                  >
                    Enter Storefront
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <Outlet />
        </main>
      )}

      <footer className="bg-white border-t py-6 text-center text-sm text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          MarketTwin Demo E-Commerce Platform &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default StoreLayout;
