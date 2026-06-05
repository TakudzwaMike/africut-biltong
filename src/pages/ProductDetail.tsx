import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Star, ShoppingBag, Truck, ShieldCheck, Plus, Minus, Zap } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const product = PRODUCTS.find(p => p.id === id);
  const { addToCart } = useCart();

  const defaultWeight = product ? Number(Object.keys(product.prices)[0]) : 250;
  const [selectedWeight, setSelectedWeight] = useState(defaultWeight);
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) setSelectedFlavor(product.flavors[0]);
    window.scrollTo(0, 0);
  }, [product]);

  if (!product) return <div className="pt-40 text-center text-brand-cream font-black uppercase">Product Not Found</div>;

  const weights = Object.keys(product.prices).map(Number).sort((a,b) => a-b);
  const totalPrice = (product.prices[selectedWeight as keyof typeof product.prices] || 0) * quantity;

  return (
    <div className="pt-40 pb-24 px-6 lg:px-12 bg-brand-timber min-h-screen text-brand-cream">
      <div className="max-w-7xl mx-auto">
        <Link to="/shop" className="inline-flex items-center space-x-2 text-brand-cream/40 hover:text-brand-rust transition-colors mb-12 uppercase text-[10px] font-black tracking-widest italic">
           <ChevronLeft className="w-4 h-4" />
           <span>Back to Shop</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
          {/* Image Gallery */}
          <div className="space-y-6">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="aspect-[4/5] bg-brand-surface rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl relative group"
             >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-8 right-8">
                   <div className="w-16 h-16 rounded-full bg-brand-rust text-white flex items-center justify-center font-black italic text-[10px] uppercase shadow-2xl rotate-12">
                      New<br/>Arrival
                   </div>
                </div>
             </motion.div>
             <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-square rounded-2xl bg-brand-surface border border-white/5 overflow-hidden opacity-40 hover:opacity-100 transition-all cursor-pointer">
                     <img src={product.image} alt="detail" className="w-full h-full object-cover" />
                  </div>
                ))}
             </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-10">
               <div className="flex items-center space-x-4 mb-8">
                  <span className="bg-brand-rust/20 text-brand-rust text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-sm border border-brand-rust/30 italic">
                    Certified {product.category}
                  </span>
                  <div className="flex items-center text-brand-rust scale-90 origin-left">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    <span className="ml-3 text-brand-cream/30 font-black uppercase tracking-tighter text-xs italic">120+ Reviews</span>
                  </div>
               </div>
               <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.85] uppercase italic">{product.name}</h1>
               <div className="flex items-baseline space-x-2">
                  <span className="text-5xl font-black text-brand-rust italic">R{totalPrice.toFixed(2)}</span>
                  <span className="text-xs font-black text-brand-cream/30 uppercase italic tracking-widest">Incl. VAT</span>
               </div>
            </div>

            <div className="space-y-12 mb-16">
               {/* Weight Selector */}
               <div>
                  <div className="flex justify-between items-end mb-6">
                    <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust italic">Select Size</label>
                    <span className="text-[10px] text-brand-cream/20 font-black italic uppercase tracking-tighter">Scale Calibration: 100g base</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {weights.map(w => (
                      <button
                        key={w}
                        onClick={() => setSelectedWeight(w)}
                        className={cn(
                          "w-24 h-24 rounded-3xl text-sm font-black uppercase tracking-widest border transition-all flex flex-col items-center justify-center space-y-1",
                          selectedWeight === w 
                            ? "border-brand-rust bg-brand-rust text-white shadow-2xl scale-105" 
                            : "border-white/10 bg-brand-surface text-brand-cream/40 hover:border-brand-rust/50 hover:text-brand-cream"
                        )}
                      >
                        <span className="text-lg">{w >= 1000 ? `${w/1000}kg` : `${w}g`}</span>
                        <span className="text-[9px] opacity-40">Pack</span>
                      </button>
                    ))}
                  </div>
               </div>

               {/* Flavor Selector */}
               <div className="space-y-6">
                  <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust italic block">Select Flavor</label>
                  <div className="grid grid-cols-2 gap-4">
                    {product.flavors.map(f => (
                      <button
                        key={f}
                        onClick={() => setSelectedFlavor(f)}
                        className={cn(
                          "px-8 py-6 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all italic text-center",
                          selectedFlavor === f 
                            ? "border-brand-cream bg-brand-cream text-brand-timber shadow-2xl" 
                            : "border-white/10 bg-brand-surface text-brand-cream/40 hover:border-brand-rust/50 hover:text-brand-cream"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
               </div>

               {/* Quantity and CTA */}
               <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-8 border-t border-white/10">
                  <div className="flex items-center bg-brand-surface rounded-full px-6 py-4 border border-white/10">
                     <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="text-brand-rust hover:text-brand-spiced transition-colors">
                       <Minus className="w-5 h-5" />
                     </button>
                     <input type="number" value={quantity} readOnly className="w-16 text-center bg-transparent font-black text-lg text-brand-cream outline-none" />
                     <button onClick={() => setQuantity(q => q+1)} className="text-brand-rust hover:text-brand-spiced transition-colors">
                       <Plus className="w-5 h-5" />
                     </button>
                  </div>
                  <button 
                    onClick={() => addToCart(product, selectedWeight, selectedFlavor, quantity)}
                    className="flex-1 bg-brand-rust text-white py-6 rounded-full font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-brand-spiced transition-all duration-300 shadow-3xl transform active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
               </div>
            </div>

            {/* Features Info */}
            <div className="grid grid-cols-2 gap-y-12 gap-x-12 pt-12 border-t border-white/10">
               <div className="flex items-start space-x-5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-rust/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-brand-rust" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-1 text-brand-cream italic">Fast Dispatch</h4>
                    <p className="text-[10px] text-brand-cream/30 leading-relaxed font-black uppercase tracking-tighter">Johannesburg to all of Gauteng.</p>
                  </div>
               </div>
               <div className="flex items-start space-x-5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-rust/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-brand-rust" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-1 text-brand-cream italic">Butcher's Quality</h4>
                    <p className="text-[10px] text-brand-cream/30 leading-relaxed font-black uppercase tracking-tighter">A-Grade Only Sourced.</p>
                  </div>
               </div>
            </div>

            {/* Chilli Deal Promo - shown when Chilli flavor selected on Beef Biltong */}
            <AnimatePresence>
              {product.id === 'bt-01' && selectedFlavor === 'Chilli' && (() => {
                const deal = PRODUCTS.find(p => p.id === 'chilli-deal');
                if (!deal) return null;
                return (
                  <motion.div
                    key="chilli-deal-promo"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-6 rounded-[2rem] overflow-hidden border border-brand-rust/30 shadow-2xl"
                  >
                    <div className="grid grid-cols-5 items-stretch">
                      <div className="col-span-2 relative overflow-hidden min-h-[160px]">
                        <img src="/images/chilli_deal.jpg" alt="Chilli 3-Pack Deal" className="w-full h-full object-cover object-top" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-timber/80" />
                      </div>
                      <div className="col-span-3 bg-brand-surface p-5 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-3 h-3 text-brand-rust" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-rust italic">Hot Deal</span>
                          </div>
                          <p className="text-sm font-black uppercase italic tracking-tight text-brand-cream leading-tight">
                            Buy 3 Chilli Packs<br />
                            <span className="text-brand-rust text-lg">R85</span>
                            <span className="text-brand-cream/30 text-xs line-through ml-2">R105</span>
                          </p>
                          <p className="text-[10px] text-brand-cream/50 italic mt-1">Save R20 on the bundle!</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => addToCart(deal, 300, 'Chilli', 1)}
                          className="w-full bg-brand-rust text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-spiced transition-all italic cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Grab the Deal</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

          </div>
        </div>

        {/* Product Tabs / Details */}
        <div className="border-t border-white/10 pt-24 mb-40">
           <div className="max-w-4xl mx-auto">
              <div className="flex space-x-16 mb-16 border-b border-white/10 overflow-x-auto no-scrollbar">
                 <button className="pb-6 text-xs font-black uppercase tracking-[0.2em] border-b-2 border-brand-rust text-brand-rust italic whitespace-nowrap">The Description</button>
                 <button className="pb-6 text-xs font-black uppercase tracking-[0.2em] text-brand-cream/20 hover:text-brand-cream transition-colors italic whitespace-nowrap">The Heritage Process</button>
                 <button className="pb-6 text-xs font-black uppercase tracking-[0.2em] text-brand-cream/20 hover:text-brand-cream transition-colors italic whitespace-nowrap">Nutritional Truth</button>
              </div>
              <div className="prose prose-invert max-w-none text-brand-cream/50 leading-loose italic font-medium text-lg">
                 <p className="text-2xl text-brand-cream font-black leading-tight mb-8">
                    "{product.description}"
                 </p>
                 <p className="mb-8">
                    Hand-rubbed with our proprietary African spice blend, our {product.name} is a testament to the art of biltong making. We use only premium South African beef slabs, ensuring every slice provides the perfect ratio of tenderness to flavor.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 bg-brand-surface p-10 rounded-[2rem] border border-white/5">
                    <div className="space-y-4">
                       <h5 className="text-brand-rust font-black uppercase tracking-widest text-xs italic">Why Africut?</h5>
                       <ul className="space-y-3">
                          <li className="flex items-center gap-3 text-xs uppercase font-black tracking-tighter"><span className="w-1.5 h-1.5 bg-brand-rust rounded-full" /> 100% Premium Jozi Beef</li>
                          <li className="flex items-center gap-3 text-xs uppercase font-black tracking-tighter"><span className="w-1.5 h-1.5 bg-brand-rust rounded-full" /> Hand-Sliced Precision</li>
                          <li className="flex items-center gap-3 text-xs uppercase font-black tracking-tighter"><span className="w-1.5 h-1.5 bg-brand-rust rounded-full" /> Traditional Slow-Dry</li>
                       </ul>
                    </div>
                     <div className="space-y-4">
                        <h5 className="text-brand-rust font-black uppercase tracking-widest text-xs italic">Delivery & Packaging</h5>
                        <p className="text-[10px] text-brand-cream/30 leading-relaxed font-black uppercase tracking-tighter italic">Vacuum-sealed for freshness and delivered in secure boxes within 24-48 hours.</p>
                        <img src="/images/packets.png" alt="Delivery Packaging" className="rounded-xl opacity-60 mt-2" />
                     </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Similar Items */}
        <section className="mb-24">
           <div className="flex justify-between items-end mb-16 border-b border-white/5 pb-8">
              <h2 className="text-5xl font-black tracking-tighter uppercase text-brand-cream italic">Pairs Perfectly.</h2>
              <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest border-b border-brand-rust pb-1 text-brand-rust italic">View All Products</Link>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {PRODUCTS.filter(p => p.id !== product.id).slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
           </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
