import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isOrdered, setIsOrdered] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });

  if (cart.length === 0 && !isOrdered) {
    return (
      <div className="pt-40 pb-24 px-6 bg-brand-timber min-h-screen text-brand-cream flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6">No Batch Selected.</h2>
        <Link to="/shop" className="bg-brand-rust text-white px-10 py-4 rounded-full font-black uppercase italic tracking-widest text-[10px]">Start Selection</Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate order processing
    setTimeout(() => {
      setIsOrdered(true);
      clearCart();
    }, 1500);
  };

  if (isOrdered) {
    return (
      <div className="pt-40 pb-24 px-6 bg-brand-timber min-h-screen text-brand-cream flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="w-24 h-24 bg-brand-rust rounded-full mx-auto flex items-center justify-center shadow-3xl">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Batch Dispatched.</h1>
            <p className="text-brand-cream/40 font-medium italic">Your order has been recorded in the Jozi archives. Check your email for the shipment manifest.</p>
          </div>
          <Link 
            to="/" 
            className="inline-block bg-brand-rust text-white px-12 py-5 rounded-full font-black uppercase italic tracking-widest text-xs shadow-3xl hover:bg-brand-spiced transition-all"
          >
            Return to HQ
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 bg-brand-timber min-h-screen text-brand-cream">
      <div className="max-w-7xl mx-auto px-6">
        <Link to="/shop" className="inline-flex items-center space-x-2 text-brand-cream/40 hover:text-brand-rust transition-colors mb-12 uppercase text-[10px] font-black tracking-widest italic leading-none">
           <ChevronLeft className="w-4 h-4" />
           <span>Adjust Selection</span>
        </Link>

        <h1 className="text-6xl font-black tracking-tighter mb-16 uppercase italic leading-none">The Disbursement.</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-12">
              <section className="space-y-8">
                <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
                  <span className="w-8 h-8 rounded-full bg-brand-rust text-white flex items-center justify-center font-black text-xs italic">01</span>
                  <h3 className="text-xs font-black uppercase tracking-widest italic">Identity Details</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-cream/30 italic">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-brand-surface border border-white/5 rounded-2xl p-5 text-sm font-medium italic focus:border-brand-rust/50 focus:outline-none transition-all placeholder:text-brand-cream/10"
                      placeholder="e.g. butcher@jozi.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-cream/30 italic">First Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-brand-surface border border-white/5 rounded-2xl p-5 text-sm font-medium italic focus:border-brand-rust/50 focus:outline-none transition-all"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-cream/30 italic">Last Name</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-brand-surface border border-white/5 rounded-2xl p-5 text-sm font-medium italic focus:border-brand-rust/50 focus:outline-none transition-all"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
                  <span className="w-8 h-8 rounded-full bg-brand-rust text-white flex items-center justify-center font-black text-xs italic">02</span>
                  <h3 className="text-xs font-black uppercase tracking-widest italic">Dispatch Location</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-brand-cream/30 italic">Address</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-brand-surface border border-white/5 rounded-2xl p-5 text-sm font-medium italic focus:border-brand-rust/50 focus:outline-none transition-all"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-cream/30 italic">City</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-brand-surface border border-white/5 rounded-2xl p-5 text-sm font-medium italic focus:border-brand-rust/50 focus:outline-none transition-all"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-cream/30 italic">Postal Code</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-brand-surface border border-white/5 rounded-2xl p-5 text-sm font-medium italic focus:border-brand-rust/50 focus:outline-none transition-all"
                        value={formData.postalCode}
                        onChange={e => setFormData({...formData, postalCode: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <button 
                type="submit"
                className="w-full bg-brand-rust text-white py-8 rounded-3xl font-black uppercase italic tracking-[0.2em] text-sm shadow-3xl hover:bg-brand-spiced transition-all transform active:scale-[0.98] flex items-center justify-center space-x-4"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Finalize Batch Disbursement</span>
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-brand-surface border border-white/5 p-10 rounded-[3rem] sticky top-32">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-rust italic mb-10 pb-4 border-b border-white/5">Order Manifest</h4>
              
              <div className="space-y-8 mb-12 max-h-[40vh] overflow-y-auto no-scrollbar pr-4">
                {cart.map(item => (
                  <div key={`${item.id}-${item.selectedWeight}-${item.selectedFlavor}`} className="flex justify-between items-center group">
                    <div className="flex items-center space-x-6">
                       <div className="w-16 h-16 rounded-2xl bg-brand-timber overflow-hidden border border-white/5">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase italic italic tracking-tight">{item.name}</p>
                          <p className="text-[9px] text-brand-cream/30 uppercase font-black tracking-widest italic">{item.quantity}x • {item.selectedWeight}g • {item.selectedFlavor}</p>
                       </div>
                    </div>
                    <p className="text-xs font-black italic">R{((item.prices[item.selectedWeight] || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-10 border-t border-white/5 mb-10">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-cream/30 italic">
                  <span>Subtotal</span>
                  <span>R{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-rust italic">
                  <span>Shipping Cost</span>
                  <span>{cartTotal >= 500 ? 'Free' : 'Calculated at dispatch'}</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-widest italic">Total Disbursement</span>
                <span className="text-5xl font-black text-brand-rust italic tracking-tighter leading-none">R{cartTotal.toFixed(2)}</span>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-[9px] font-black uppercase tracking-widest text-brand-cream/20 italic">
                   <Truck className="w-4 h-4 text-brand-rust" />
                   <span>Nationwide dispatch</span>
                </div>
                <div className="flex items-center space-x-3 text-[9px] font-black uppercase tracking-widest text-brand-cream/20 italic">
                   <ShieldCheck className="w-4 h-4 text-brand-rust" />
                   <span>Secured network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
