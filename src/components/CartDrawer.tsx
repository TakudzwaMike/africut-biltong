import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-brand-timber/60 backdrop-blur-md z-[200]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-paper z-[201] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col border-l border-white/5"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-brand-timber text-brand-cream">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-5 h-5 text-brand-rust" />
                <h2 className="text-xl font-black tracking-tighter uppercase italic">Your Batch</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-rust hover:border-brand-rust transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-brand-timber rounded-3xl flex items-center justify-center border border-white/5 rotate-12">
                    <ShoppingBag className="w-8 h-8 text-brand-rust/40" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-brand-timber font-black uppercase tracking-tighter text-xl italic">Empty Hooks.</p>
                    <p className="text-brand-timber/30 text-xs font-black uppercase tracking-widest leading-loose">We haven't started your selection yet. Jozi is waiting.</p>
                  </div>
                  <Link 
                    to="/shop" 
                    onClick={() => setIsOpen(false)}
                    className="bg-brand-rust text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-spiced transition-all shadow-3xl"
                  >
                    Explore Shop
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={`${item.id}-${item.selectedWeight}-${item.selectedFlavor}`} className="flex space-x-6 group">
                    <div className="w-24 h-24 bg-brand-timber rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-brand-rust/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-black tracking-tight text-brand-timber uppercase italic leading-none mb-1">{item.name}</h3>
                          <p className="text-sm font-black text-brand-rust italic">R{((item.prices[item.selectedWeight] || 0) * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="text-[9px] text-brand-timber/40 uppercase font-black tracking-widest italic">
                          {item.selectedWeight}g • {item.selectedFlavor}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-4 bg-brand-timber/5 px-4 py-2 rounded-xl border border-brand-timber/5">
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedWeight, item.selectedFlavor, item.quantity - 1)} 
                            className="text-brand-timber/40 hover:text-brand-rust transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-black w-4 text-center text-brand-timber">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedWeight, item.selectedFlavor, item.quantity + 1)} 
                            className="text-brand-timber/40 hover:text-brand-rust transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedWeight, item.selectedFlavor)}
                          className="w-8 h-8 rounded-full border border-brand-timber/5 flex items-center justify-center text-brand-timber/20 hover:text-red-500 hover:border-red-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 bg-brand-timber space-y-6 border-t border-white/10">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-cream/40 text-[10px] font-black uppercase tracking-widest italic">Subtotal</span>
                    <span className="text-3xl font-black text-brand-cream tracking-tighter italic">R{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-brand-rust font-black uppercase tracking-widest italic">
                    <span>Shipping</span>
                    <span>{cartTotal >= 500 ? 'Free' : 'Calculated at next step'}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-brand-rust text-white py-6 rounded-2xl flex items-center justify-center space-x-3 group hover:bg-brand-spiced transition-all duration-300 shadow-3xl transform active:scale-[0.98]"
                  >
                    <span className="uppercase font-black tracking-[0.2em] text-xs italic">Secure Disbursement</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center text-[9px] uppercase font-black tracking-widest text-brand-cream/30 hover:text-brand-rust transition-colors italic"
                  >
                    Continue Batch Selection
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
