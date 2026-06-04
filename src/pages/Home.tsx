import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Truck, Award, ShieldCheck, Heart, Instagram } from 'lucide-react';
import { PRODUCTS, REVIEWS } from '../constants';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const featuredProducts = PRODUCTS.filter(p => p.popular).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section - Split Layout */}
      <section className="relative min-h-[90vh] lg:h-[100vh] grid grid-cols-12 gap-0 overflow-hidden bg-brand-timber">
        <div className="col-span-12 lg:col-span-12 p-4 md:p-8 lg:p-24 flex flex-col justify-center items-center z-20 pt-40 text-center relative">
          <div className="absolute inset-0 z-0 h-full w-full pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="max-w-4xl w-full"
          >
            <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
              <span className="h-[1px] w-6 md:w-12 bg-brand-rust"></span>
              <span className="text-brand-rust text-[9px] md:text-sm font-black uppercase tracking-[0.4em] italic">The Authentic Cut</span>
              <span className="h-[1px] w-6 md:w-12 bg-brand-rust"></span>
            </div>
            
            <h1 className="text-[12vw] md:text-7xl lg:text-9xl font-black leading-[1] lg:leading-[0.85] mb-6 lg:mb-12 tracking-tighter text-brand-cream uppercase italic">
              The Real<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-rust to-brand-spiced">Taste of Jozi.</span>
            </h1>
            
            <p className="text-base md:text-xl text-brand-cream/80 mb-10 lg:mb-14 max-w-xl mx-auto font-bold leading-relaxed italic px-4">
              "Authentic, hand-cured, and spiced to perfection. This is not just biltong—it's a Johannesburg legacy."
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 px-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link 
                  to="/shop" 
                  className="bg-brand-rust text-white px-10 md:px-12 py-5 md:py-6 font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-brand-spiced transition-all shadow-3xl rounded-sm italic block text-center"
                >
                  Shop Now
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link 
                  to="/about" 
                  className="border-2 border-brand-cream/20 text-brand-cream px-10 md:px-12 py-5 md:py-6 font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-brand-cream hover:text-brand-timber transition-all rounded-sm italic block text-center"
                >
                  Our Heritage
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Hero Background Elements */}
        <div className="absolute inset-0 z-10 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-timber via-transparent to-brand-timber"></div>
            <img 
               src="/images/hero.png" 
               alt="Biltong Hanging"
               className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
        </div>
      </section>

      {/* Feature Strip - Butcher's Warmth */}
      <section className="bg-brand-rust py-16 md:py-24 text-white border-y border-white/10 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 md:gap-y-16 lg:gap-x-12 relative z-10">
          <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-2 items-center lg:items-start text-center lg:text-left group cursor-default">
            <div className="text-[10px] font-black uppercase tracking-widest text-brand-cream/60 italic group-hover:text-white transition-colors">Origin</div>
            <div className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-black italic leading-none tracking-tight uppercase group-hover:text-brand-timber transition-colors">Jozi Crafted</div>
            <div className="text-[10px] text-white/90 mt-1 uppercase font-black tracking-widest italic group-hover:text-white transition-colors">A-Grade Beef Only</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-2 lg:border-l lg:border-white/10 lg:pl-10 items-center lg:items-start text-center lg:text-left group cursor-default">
            <div className="text-[10px] font-black uppercase tracking-widest text-brand-cream/60 italic group-hover:text-white transition-colors">Standard</div>
            <div className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-black italic leading-none tracking-tight uppercase group-hover:text-brand-timber transition-colors">Butcher's Quality</div>
            <div className="text-[10px] text-white/90 mt-1 uppercase font-black tracking-widest italic group-hover:text-white transition-colors">Traditional Mastery</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-2 lg:border-l lg:border-white/10 lg:pl-10 items-center lg:items-start text-center lg:text-left group cursor-default">
            <div className="text-[10px] font-black uppercase tracking-widest text-brand-cream/60 italic group-hover:text-white transition-colors">Reach</div>
            <div className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-black italic leading-none tracking-tight uppercase group-hover:text-brand-timber transition-colors">Nationwide</div>
            <div className="text-[10px] text-white/90 mt-1 uppercase font-black tracking-widest italic group-hover:text-white transition-colors">Delivery Over R500*</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col gap-2 lg:border-l lg:border-white/10 lg:pl-10 items-center lg:items-start text-center lg:text-left group cursor-default">
            <div className="text-[10px] font-black uppercase tracking-widest text-brand-cream/60 italic group-hover:text-white transition-colors">Flavor</div>
            <div className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-black italic leading-none tracking-tight uppercase group-hover:text-brand-timber transition-colors">Secret Spice</div>
            <div className="text-[10px] text-white/90 mt-1 uppercase font-black tracking-widest italic group-hover:text-white transition-colors">Heritage Recipe</div>
          </motion.div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 space-y-6 md:space-y-0">
            <div className="max-w-xl">
              <span className="text-brand-rust text-xs font-black uppercase tracking-[0.3em] mb-4 block italic">Crowd Favorites</span>
              <h2 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic text-brand-timber">
                Crafted for Perfection,<br />Curated for You.
              </h2>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/shop" className="group flex items-center space-x-2 text-brand-timber hover:text-brand-rust transition-colors border-b-2 border-brand-timber/10 pb-2">
                <span className="uppercase text-xs font-black tracking-[0.2em] italic">View All Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Flyer Column */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-brand-surface rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative group aspect-[3/4] flex-grow"
              >
                <img 
                  src="/images/best_sellers_promo.jpg" 
                  alt="Our Best Sellers Flyer" 
                  className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-700"
                />
              </motion.div>
              {/* Quick links to products mentioned on the flyer */}
              <div className="bg-brand-paper p-6 rounded-2xl border border-brand-timber/5 space-y-3 shadow-md">
                <span className="text-[10px] text-brand-rust font-black uppercase tracking-widest block italic">Featured in Flyer:</span>
                <div className="flex flex-col gap-2">
                  <Link 
                    to="/product/bt-01" 
                    className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-brand-timber hover:text-brand-rust transition-colors italic border-b border-brand-timber/10 pb-1"
                  >
                    <span>Beef Biltong (Chilli) • R35/Pack</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link 
                    to="/product/sp-03" 
                    className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-brand-timber hover:text-brand-rust transition-colors italic"
                  >
                    <span>Babalas Mix • R120/Tub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Products Column */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 h-full">
                {featuredProducts.slice(0, 3).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Africut - Bento Grid Style */}
      <section className="py-24 px-6 lg:px-12 bg-brand-paper">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
             <span className="text-brand-rust text-xs font-black uppercase tracking-[0.3em] mb-4 block italic">The Africut Standard</span>
             <h2 className="text-4xl lg:text-7xl font-black tracking-tighter mb-4 uppercase italic text-brand-timber">Why Meat Lovers Choose Us</h2>
             <p className="text-brand-timber/80 max-w-2xl mx-auto leading-relaxed font-medium italic text-lg">
               We don't just dry meat. We craft experiences using traditional methods passed down through generations, optimized for the modern connoisseur.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <motion.div 
               whileHover={{ y: -12 }}
               className="bg-white p-10 rounded-[3rem] shadow-sm border border-brand-timber/5 flex flex-col space-y-6 group hover:shadow-2xl transition-all duration-500"
             >
                <div className="w-14 h-14 bg-brand-paper rounded-2xl flex items-center justify-center text-brand-rust group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter uppercase italic text-brand-timber group-hover:text-brand-rust transition-colors">Authentic Drying</h3>
                <p className="text-brand-timber/90 text-sm leading-relaxed font-medium italic">
                  Slow-cured in temperature-controlled environments to ensure perfect texture and moisture levels in every bite.
                </p>
             </motion.div>
             <motion.div 
               whileHover={{ y: -12 }}
               className="bg-brand-timber p-10 rounded-[3rem] shadow-2xl flex flex-col space-y-6 text-white group transform lg:-translate-y-4"
             >
                <div className="w-14 h-14 bg-brand-rust rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                  <Star className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter uppercase italic text-brand-rust group-hover:text-white transition-colors">A-Grade Cuts</h3>
                <p className="text-brand-cream/90 text-sm leading-relaxed font-medium italic">
                  We source only the finest grass-fed beef from trusted local farmers. No filler, no shortcuts, just pure quality.
                </p>
             </motion.div>
             <motion.div 
               whileHover={{ y: -12 }}
               className="bg-white p-10 rounded-[3rem] shadow-sm border border-brand-timber/5 flex flex-col space-y-6 group hover:shadow-2xl transition-all duration-500"
             >
                <div className="w-14 h-14 bg-brand-paper rounded-2xl flex items-center justify-center text-brand-rust group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <Truck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter uppercase italic text-brand-timber group-hover:text-brand-rust transition-colors">Express Delivery</h3>
                <p className="text-brand-timber/90 text-sm leading-relaxed font-medium italic">
                  From our Johannesburg kitchen to your door within 24-48 hours. Freshly packed on the day of dispatch.
                </p>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Experience Section - Large Image Layout */}
      <section className="relative py-32 overflow-hidden bg-brand-timber">
        <div className="absolute inset-0 z-0">
           <img 
              src="/images/hero.png" 
              alt="Curing Room" 
              className="w-full h-full object-cover grayscale opacity-30"
              referrerPolicy="no-referrer"
           />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-timber via-brand-timber/80 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-center gap-16">
            <div className="order-2 lg:order-1 relative">
               <motion.div 
                 whileHover={{ rotate: 0, scale: 1.02 }}
                 className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl skew-y-3 transition-all duration-700 hover:skew-y-0"
               >
                 <img src="/images/board.png" alt="Biltong Board" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </motion.div>
               <motion.div 
                 whileHover={{ rotate: 0, scale: 1.05 }}
                 className="absolute -bottom-10 -right-10 w-2/3 aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-brand-timber -skew-y-3 hidden sm:block transition-all duration-700 hover:-skew-y-0"
               >
                   <img src="/images/packets.png" alt="Delivery Packaging" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               </motion.div>
            </div>
            <div className="order-1 lg:order-2 space-y-10">
               <div>
                  <span className="text-brand-rust text-[10px] font-black uppercase tracking-[0.3em] mb-4 block italic">The Johannesburg Craft</span>
                  <h2 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic text-brand-cream">
                    Handcrafted in Jozi.<br />Devoured Nationwide.
                  </h2>
                  <p className="text-brand-cream/80 leading-relaxed text-lg mb-8 font-medium italic">
                    At Africut, we believe in the transparency of our process. From the selection of spice pods to the precision of the cut, every step is handled with mastery in our Johannesburg facility.
                  </p>
                  <Link 
                    to="/about" 
                    className="inline-flex items-center space-x-4 group text-brand-cream font-black uppercase tracking-[0.2em] text-xs italic"
                  >
                    <span className="border-b-4 border-brand-rust pb-1 group-hover:border-brand-cream transition-colors">See Our Process</span>
                  </Link>
               </div>
               <div className="grid grid-cols-2 gap-8 pt-8 border-t border-brand-cream/10">
                  <div>
                    <p className="text-5xl font-black text-brand-rust mb-1 italic tracking-tighter">100%</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-brand-cream/40 italic leading-none">Natural Spices</p>
                  </div>
                  <div>
                    <p className="text-5xl font-black text-brand-rust mb-1 italic tracking-tighter">24h</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-brand-cream/40 italic leading-none">Fast Dispatch</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-brand-timber text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="text-center mb-20">
              <span className="text-brand-rust text-xs font-black uppercase tracking-[0.3em] mb-4 block italic">Customer Reviews</span>
              <h2 className="text-4xl lg:text-7xl font-black tracking-tighter uppercase italic leading-none">Approved by Connoisseurs</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {REVIEWS.map(review => (
                <motion.div 
                  key={review.id}
                  whileHover={{ y: -5 }}
                  className="bg-brand-surface p-10 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col"
                >
                  <div className="flex space-x-1 text-brand-rust mb-6">
                    {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-brand-cream/80 italic mb-10 leading-relaxed font-medium">
                    "{review.comment}"
                  </p>
                  <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between">
                     <span className="text-sm font-black uppercase italic tracking-tight text-white">{review.user}</span>
                     <span></span>
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Instagram Feed / CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="flex flex-col items-center text-center space-y-6 mb-16">
              <Instagram className="w-12 h-12 text-brand-rust" />
              <h2 className="text-4xl lg:text-7xl font-black tracking-tighter uppercase italic leading-[0.9] text-brand-timber">Join Our Herd @Africut</h2>
              <p className="text-brand-timber/90 max-w-xl mx-auto font-medium italic">
                Tag us in your snacks and show us how you enjoy your Africut cuts. Use #AfricutCuts for a chance to be featured.
              </p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                '/images/board.png',
                '/images/hero.png',
                '/images/fatty.png',
                '/images/packets.png'
              ].map((url, i) => (
                <div key={i} className="aspect-square bg-brand-paper rounded-2xl overflow-hidden relative group">
                  <img 
                    src={url} 
                    alt="Social feed biltong" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-timber/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Instagram className="text-white w-8 h-8" />
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Final Newsletter CTA Block */}
      <section className="pb-32 px-6 lg:px-12 bg-white">
         <div className="max-w-7xl mx-auto bg-brand-rust rounded-[4rem] p-12 lg:p-24 overflow-hidden relative shadow-3xl">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none select-none italic text-[15vw] font-black text-white leading-none -skew-y-12">
               JOZI
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="text-white">
                  <h2 className="text-4xl lg:text-7xl font-black tracking-tighter leading-[0.9] mb-6 uppercase italic">
                    Hungry yet?<br />Get 15% Off Your First Order.
                  </h2>
                  <p className="text-white/80 max-w-md text-lg leading-relaxed font-medium italic">
                    Join our exclusive membership for early access to limited edition drops, subscription discounts, and biltong news.
                  </p>
               </div>
               <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-white rounded-2xl px-8 py-5 text-brand-timber font-black italic focus:outline-none focus:ring-4 focus:ring-white/20"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-brand-timber text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl italic"
                  >
                    Join The Herd
                  </motion.button>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
