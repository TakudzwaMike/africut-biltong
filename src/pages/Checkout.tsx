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
        <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6">Your cart is empty.</h2>
        <Link to="/shop" className="bg-brand-rust text-white px-10 py-4 rounded-full font-black uppercase italic tracking-widest text-[10px]">Start Shopping</Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_73239c12b24d20f04440820c385734aa2919d817';

    const handler = (window as any).PaystackPop.setup({
      key: paystackKey,
      email: formData.email,
      amount: Math.round(cartTotal * 100), // in cents
      currency: 'ZAR',
      ref: `AFR-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: `${formData.firstName} ${formData.lastName}`
          },
          {
            display_name: "Phone Number",
            variable_name: "phone_number",
            value: formData.phone
          },
          {
            display_name: "Delivery Address",
            variable_name: "delivery_address",
            value: `${formData.address}, ${formData.city}, ${formData.postalCode}`
          }
        ]
      },
      callback: function(response: any) {
        // Send email with order details via FormSubmit
        const orderSummary = cart.map(item => `${item.quantity}x ${item.name} (${item.selectedWeight}g, ${item.selectedFlavor}) - R${((item.prices[item.selectedWeight] || 0) * item.quantity).toFixed(2)}`).join('\n');
        
        fetch('https://formsubmit.co/ajax/sales@africutbiltong.co.za', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
            order_total: `R${cartTotal.toFixed(2)}`,
            order_details: orderSummary,
            _subject: `New Order Received - R${cartTotal.toFixed(2)}`,
            _template: 'table'
          })
        }).then(res => res.json())
          .then(data => console.log('Order email sent', data))
          .catch(err => console.error('Failed to send email', err));

        setIsOrdered(true);
        clearCart();
      },
      onClose: function() {
        alert('Payment was cancelled. Please try again to complete your order.');
      }
    });

    handler.openIframe();
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
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">Order Placed Successfully!</h1>
            <p className="text-brand-cream/40 font-medium italic">Thank you for your purchase. We've sent a confirmation email with your order details.</p>
          </div>
          <Link 
            to="/" 
            className="inline-block bg-brand-rust text-white px-12 py-5 rounded-full font-black uppercase italic tracking-widest text-xs shadow-3xl hover:bg-brand-spiced transition-all"
          >
            Back to Home
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
           <span>Back to Shop</span>
        </Link>

        <h1 className="text-6xl font-black tracking-tighter mb-16 uppercase italic leading-none">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-12">
              <section className="space-y-8">
                <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
                  <span className="w-8 h-8 rounded-full bg-brand-rust text-white flex items-center justify-center font-black text-xs italic">01</span>
                  <h3 className="text-xs font-black uppercase tracking-widest italic">Customer Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-cream/30 italic">Email Address</label>
                      <input 
                        required
                        type="email" 
                        className="w-full bg-brand-surface border border-white/5 rounded-2xl p-5 text-sm font-medium italic focus:border-brand-rust/50 focus:outline-none transition-all placeholder:text-brand-cream/10"
                        placeholder="e.g. customer@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-brand-cream/30 italic">Phone Number</label>
                      <input 
                        required
                        type="tel" 
                        className="w-full bg-brand-surface border border-white/5 rounded-2xl p-5 text-sm font-medium italic focus:border-brand-rust/50 focus:outline-none transition-all placeholder:text-brand-cream/10"
                        placeholder="e.g. +27 82 123 4567"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
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
                  <h3 className="text-xs font-black uppercase tracking-widest italic">Shipping Address</h3>
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

              <div className="space-y-4">
                {cartTotal < 250 && (
                  <div className="bg-brand-rust/20 border border-brand-rust/50 rounded-2xl p-4 text-center">
                    <p className="text-brand-cream font-black uppercase tracking-widest text-xs italic">
                      Minimum order value is R250.
                    </p>
                    <p className="text-brand-cream/50 font-medium text-[10px] uppercase tracking-wider italic mt-1">
                      Please add R{(250 - cartTotal).toFixed(2)} more to your cart to checkout.
                    </p>
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={cartTotal < 250}
                  className={`w-full py-8 rounded-3xl font-black uppercase italic tracking-[0.2em] text-sm shadow-3xl transition-all transform active:scale-[0.98] flex items-center justify-center space-x-4 ${
                    cartTotal < 250 
                      ? 'bg-brand-timber border border-white/5 text-brand-cream/20 cursor-not-allowed' 
                      : 'bg-brand-rust text-white hover:bg-brand-spiced cursor-pointer'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Pay Now</span>
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-brand-surface border border-white/5 p-10 rounded-[3rem] sticky top-32">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-rust italic mb-10 pb-4 border-b border-white/5">Order Summary</h4>
              
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
                <span className="text-[10px] font-black uppercase tracking-widest italic">Order Total</span>
                <span className="text-5xl font-black text-brand-rust italic tracking-tighter leading-none">R{cartTotal.toFixed(2)}</span>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-[9px] font-black uppercase tracking-widest text-brand-cream/20 italic">
                   <Truck className="w-4 h-4 text-brand-rust" />
                   <span>Gauteng dispatch</span>
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
