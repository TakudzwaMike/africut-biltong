import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Tag, Copy, Check, Calendar, Store, Clock, ShoppingBag, Sparkles, MapPin, Phone, HelpCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../constants';

const Subscription = () => {
  const { addToCart } = useCart();
  const [selectedBox, setSelectedBox] = useState('Mixed Biltong & Droëwors Box');
  const [selectedSize, setSelectedSize] = useState(1000); // 1000g = 1kg
  const [selectedFrequency, setSelectedFrequency] = useState('Monthly');
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');

  // Find the sub product in catalog
  const subProduct = PRODUCTS.find(p => p.id === 'sub-pack-monthly') || {
    id: 'sub-pack-monthly',
    name: 'Monthly Subscription Box',
    description: 'A curated selection of premium biltong, droëwors, and snacks delivered monthly.',
    prices: { 500: 370.00, 1000: 699.00, 2000: 1299.00 },
    category: 'specialty' as const,
    flavors: ['Mixed Cures', 'Original Only', 'Chilli Only'],
    image: '/images/subscription_promo.jpg'
  };

  // Adjust price based on size and frequency discount
  const getBasePrice = (size: number) => {
    if (size === 500) return 370.00;
    if (size === 2000) return 1299.00;
    return 699.00; // default 1kg
  };

  const getDiscount = (freq: string) => {
    if (freq === 'Weekly') return 0.15; // 15%
    if (freq === 'Bi-Weekly') return 0.12; // 12%
    return 0.10; // Monthly 10%
  };

  const basePrice = getBasePrice(selectedSize);
  const discountRate = getDiscount(selectedFrequency);
  const singlePrice = basePrice * (1 - discountRate);
  const totalSubPrice = singlePrice * quantity;

  const handleAddSubscription = () => {
    // Construct a custom sub product with computed price map
    const customSubProduct = {
      ...subProduct,
      name: `${selectedBox} (${selectedFrequency})`,
      prices: {
        [selectedSize]: singlePrice
      }
    };
    
    addToCart(customSubProduct, selectedSize, selectedBox, quantity);
  };

  const handleGetDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setDiscountCode('AFRICUTCHOMI10');
    setPromoMessage('Copy your code below and enter it at checkout for 10% off your subscription!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-40 pb-24 px-6 lg:px-12 bg-brand-timber min-h-screen text-brand-cream relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 h-full w-full pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-rust/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-brand-rust text-xs font-black uppercase tracking-[0.3em] mb-4 block italic">Crave More, Save More</span>
          <h1 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] mb-6">
            Subscription<br/>Packs.
          </h1>
          <p className="text-brand-cream/60 font-medium italic text-lg leading-relaxed">
            Never run out of Johannesburg's finest hand-cured biltong. 
            Choose your box, customize your frequency, and get premium biltong delivered straight to your door automatically.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
          {/* Left Column: Flyer */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              whileHover={{ scale: 1.02, rotate: 0.5 }}
              className="bg-brand-surface rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative group aspect-[2/3] max-w-md mx-auto lg:max-w-none"
            >
              <img 
                src="/images/subscription_promo.jpg" 
                alt="Subscribe Now Flyer" 
                className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-timber/80 via-transparent to-transparent opacity-60"></div>
            </motion.div>

            {/* Discount Code Interactive box */}
            <div className="bg-brand-surface p-8 rounded-[2rem] border border-white/5 shadow-xl space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-rust italic mb-2">Subscribe for a Free Discount Code!</h3>
                <p className="text-xs text-brand-cream/60 font-medium italic">
                  Don't miss out on exclusive deals. Sign up below to unlock your code immediately.
                </p>
              </div>

              <AnimatePresence mode="wait">
                {!discountCode ? (
                  <form onSubmit={handleGetDiscount} className="space-y-4">
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full bg-brand-timber border border-white/10 rounded-xl px-5 py-4 text-xs font-bold placeholder:text-brand-cream/20 focus:ring-2 focus:ring-brand-rust focus:border-brand-rust outline-none transition-all italic text-brand-cream"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-brand-rust text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 hover:bg-brand-spiced transition-all shadow-md italic cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Get Discount Code</span>
                    </motion.button>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-brand-timber/50 border border-brand-rust/20 rounded-2xl p-5 text-center space-y-4"
                  >
                    <p className="text-xs text-brand-rust font-black uppercase italic">{promoMessage}</p>
                    <div className="flex items-center justify-between bg-brand-timber border border-white/10 rounded-xl p-3">
                      <span className="font-mono text-sm tracking-widest text-brand-cream font-bold pl-2">{discountCode}</span>
                      <button 
                        onClick={handleCopyCode}
                        className="bg-brand-rust hover:bg-brand-spiced text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Configurator */}
          <div className="lg:col-span-7">
            <div className="bg-brand-surface p-8 lg:p-12 rounded-[3rem] border border-white/5 shadow-2xl space-y-8">
              <div className="border-b border-white/5 pb-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-brand-cream">
                  Configure Your Box
                </h2>
                <p className="text-brand-cream/40 text-xs font-black uppercase tracking-widest italic mt-1">
                  100% customizable • cancel or skip anytime
                </p>
              </div>

              {/* Box Type */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust italic block">1. Choose Biltong Box Style</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Mixed Biltong & Droëwors Box',
                    'Original Beef Biltong Box',
                    'Chilli Fiery Biltong Box',
                    'Wild Game Hunter Box'
                  ].map((box) => (
                    <button
                      key={box}
                      onClick={() => setSelectedBox(box)}
                      className={`px-5 py-4 rounded-xl text-left text-xs font-black uppercase tracking-wider border transition-all italic flex justify-between items-center ${
                        selectedBox === box 
                          ? 'border-brand-cream bg-brand-cream text-brand-timber shadow-lg' 
                          : 'border-white/10 bg-brand-timber/50 text-brand-cream/60 hover:border-brand-rust/50 hover:text-brand-cream'
                      }`}
                    >
                      <span>{box}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Box Size */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust italic block">2. Select Weight / Size</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '500g Pack', val: 500, sub: 'Snack Pack' },
                    { label: '1kg Box', val: 1000, sub: 'Standard Box' },
                    { label: '2kg Box', val: 2000, sub: 'Family Box' }
                  ].map((size) => (
                    <button
                      key={size.val}
                      onClick={() => setSelectedSize(size.val)}
                      className={`py-4 rounded-xl text-center border transition-all flex flex-col justify-center items-center space-y-0.5 ${
                        selectedSize === size.val 
                          ? 'border-brand-rust bg-brand-rust text-white shadow-lg' 
                          : 'border-white/10 bg-brand-timber/50 text-brand-cream/60 hover:border-brand-rust/50 hover:text-brand-cream'
                      }`}
                    >
                      <span className="text-sm font-black uppercase italic">{size.label}</span>
                      <span className="text-[8px] opacity-60 uppercase font-black tracking-tighter">{size.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust italic block">3. Delivery Frequency</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Weekly', sub: 'Save 15%' },
                    { label: 'Bi-Weekly', sub: 'Save 12%' },
                    { label: 'Monthly', sub: 'Save 10%' }
                  ].map((freq) => (
                    <button
                      key={freq.label}
                      onClick={() => setSelectedFrequency(freq.label)}
                      className={`py-4 rounded-xl text-center border transition-all flex flex-col justify-center items-center space-y-0.5 ${
                        selectedFrequency === freq.label 
                          ? 'border-brand-cream bg-brand-cream text-brand-timber shadow-lg' 
                          : 'border-white/10 bg-brand-timber/50 text-brand-cream/60 hover:border-brand-rust/50 hover:text-brand-cream'
                      }`}
                    >
                      <span className="text-sm font-black uppercase italic">{freq.label}</span>
                      <span className={`text-[8px] uppercase font-black tracking-tighter ${
                        selectedFrequency === freq.label ? 'text-brand-rust' : 'text-brand-spiced'
                      }`}>{freq.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity and Total Display */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-white/5 space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-cream/30 italic">Subscription Rate</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-brand-rust italic">R{totalSubPrice.toFixed(2)}</span>
                    <span className="text-[9px] font-black text-brand-cream/30 uppercase tracking-widest">/ {selectedFrequency === 'Weekly' ? 'Week' : selectedFrequency === 'Bi-Weekly' ? '2 Weeks' : 'Month'}</span>
                  </div>
                  <p className="text-[9px] text-green-400 font-bold uppercase tracking-wider italic">
                    Includes {Math.round(discountRate * 100)}% recurring frequency discount!
                  </p>
                </div>
                
                {/* Quantity */}
                <div className="flex items-center bg-brand-timber border border-white/10 rounded-xl px-4 py-2 self-start sm:self-auto">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="text-brand-rust hover:text-brand-spiced transition-colors p-1"
                  >
                    <span className="text-lg font-bold">-</span>
                  </button>
                  <span className="text-xs font-black text-brand-cream w-8 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="text-brand-rust hover:text-brand-spiced transition-colors p-1"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>
              </div>

              {/* Add to Cart button */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddSubscription}
                className="w-full bg-brand-rust text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-2 hover:bg-brand-spiced transition-all shadow-3xl italic cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add Subscription to Cart</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Flyer Context Info */}
        <div className="border-t border-white/10 pt-24 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Friday Specials info */}
          <div className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-rust/10 flex items-center justify-center text-brand-rust">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tight text-brand-cream">Fridays Specials</h3>
                <p className="text-[10px] text-brand-rust font-black uppercase tracking-widest italic">One day only • unbeatable flavors</p>
              </div>
            </div>
            <p className="text-brand-cream/60 text-sm leading-relaxed font-medium italic">
              "Yes chomi, you sleep you lose!" Join us every single Friday at our butchery kitchen for exclusive drops, 
              flash sales, and unmissable prices on premium A-grade biltong and speciality batches. 
              Subscribers get early notifications of the weekly specials sheet straight to their inbox.
            </p>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-cream italic bg-brand-timber/50 p-4 rounded-xl border border-white/5">
              <Sparkles className="w-4 h-4 text-brand-rust" />
              <span>Chilli Biltong Packs starting from only R35!</span>
            </div>
          </div>

          {/* Victoria Yards info */}
          <div className="bg-brand-surface p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-rust/10 flex items-center justify-center text-brand-rust">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tight text-brand-cream">Live on Victoria Yards</h3>
                <p className="text-[10px] text-brand-rust font-black uppercase tracking-widest italic">First Sunday of each month</p>
              </div>
            </div>
            <p className="text-brand-cream/60 text-sm leading-relaxed font-medium italic">
              Come meet our master curing team in person! We set up our stall at Johannesburg's iconic Victoria Yards 
              every First Sunday of the month. Drop by, taste free samples of our game biltong, grab exclusive deals, 
              and enjoy the incredible local creative vibes. Support local, taste heritage.
            </p>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-cream italic bg-brand-timber/50 p-4 rounded-xl border border-white/5">
              <MapPin className="w-4 h-4 text-brand-rust" />
              <span>Victoria Yards, Lorentzville, Johannesburg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
