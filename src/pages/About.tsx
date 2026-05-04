import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, Heart, MapPin, Truck, ShieldCheck, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-brand-timber min-h-screen text-brand-cream">
      {/* Narrative Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero.png" 
            alt="The Craftsmanship" 
            className="w-full h-full object-cover grayscale-[20%]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-brand-timber/80 backdrop-blur-sm" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
           <span className="text-brand-rust text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-6 block italic">The Heritage Story</span>
           <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-8 italic leading-[0.9] lg:leading-[0.8] uppercase break-words">
              Jozi Crafted.<br />Butcher Born.
           </h1>
           <p className="text-base md:text-lg text-brand-cream/50 leading-relaxed max-w-2xl mx-auto font-medium italic">
             Africut Biltong was born from a simple obsession: to perfect the art of the South African snack. No fillers, no shortcuts—just premium beef and traditional mastery from the heart of Johannesburg.
           </p>
        </div>
      </section>

      {/* The Origin */}
      <section className="py-32 px-6 lg:px-12 bg-brand-surface border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10 order-2 lg:order-1">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-[2px] w-8 bg-brand-rust"></span>
                <span className="text-brand-rust text-[10px] font-black uppercase tracking-[0.3em] italic">The Africut Philosophy</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-10 leading-[0.9] uppercase italic">Heritage in every cut.</h2>
              <div className="space-y-6 text-brand-cream/40 leading-relaxed font-medium italic text-lg">
                <p>
                  Based in the heart of Johannesburg, our founders noticed a gap between commercial, mass-produced "jerky" and the authentic, hand-cured biltong that South Africans have thrived on for centuries. 
                </p>
                <p>
                  We set out to bridge that gap. Africut isn't just about food; it's about a standard of excellence. We select our cuts with the precision of a master butcher and cure them with the patience of a true artisan.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/10">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-brand-rust">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-brand-cream italic underline decoration-brand-rust decoration-2">A-Grade Beef</span>
                </div>
                <p className="text-[11px] text-brand-cream/30 font-black uppercase tracking-tighter italic">Only the finest primal cuts are selected for our drying racks.</p>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-brand-rust">
                  <ShieldCheck className="w-4 h-4 fill-current" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-brand-cream italic underline decoration-brand-rust decoration-2">Halal Sourced</span>
                </div>
                <p className="text-[11px] text-brand-cream/30 font-black uppercase tracking-tighter italic">Our supply chain is fully transparent and certified for your peace of mind.</p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4 opacity-100">
             <div className="space-y-4 pt-12 grayscale-[30%] hover:grayscale-0 transition-all duration-700">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-3xl border border-white/5">
                   <img src="/images/hero.png" alt="Hanging Biltong" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-3xl overflow-hidden shadow-xl border border-white/5">
                   <img src="/images/packets.png" alt="Packaged Biltong" className="w-full h-full object-cover" />
                </div>
             </div>
             <div className="space-y-4 grayscale-[30%] hover:grayscale-0 transition-all duration-700">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-xl border border-white/5">
                   <img src="/images/fatty.png" alt="Curing" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-3xl border border-white/5">
                   <img src="/images/board.png" alt="Final Product" className="w-full h-full object-cover" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* The Process - Timeline */}
      <section className="py-32 px-6 lg:px-12 bg-brand-timber text-brand-cream relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
           <div className="text-center mb-32">
              <span className="text-brand-rust text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">The Crafting Journey</span>
              <h2 className="text-6xl lg:text-9xl font-black tracking-tighter uppercase italic leading-none">The Ritual.</h2>
           </div>

           <div className="space-y-40">
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-12 items-start group">
                  <span className="text-8xl font-black text-brand-rust opacity-20 tracking-tighter italic group-hover:opacity-100 transition-opacity duration-700 leading-none">01</span>
                  <div className="space-y-6">
                     <h3 className="text-4xl font-black tracking-tighter text-brand-cream uppercase italic leading-none">Select & Hand-Slice</h3>
                     <p className="text-brand-cream/40 text-xl leading-relaxed max-w-2xl font-medium italic">
                        Our master butchers hand-select A-grade beef slabs, ensuring the fat-to-meat ratio is precise for either lean or fatty cuts. Each slice is made against the grain for maximum tenderness.
                     </p>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-12 items-start group">
                  <span className="text-8xl font-black text-brand-rust opacity-20 tracking-tighter italic group-hover:opacity-100 transition-opacity duration-700 leading-none">02</span>
                  <div className="space-y-6">
                     <h3 className="text-4xl font-black tracking-tighter text-brand-cream uppercase italic leading-none">Spice Infusion</h3>
                     <p className="text-brand-cream/40 text-xl leading-relaxed max-w-2xl font-medium italic">
                        No chemicals. Just roasted coriander, smoked sea salt, and our secret heritage blend. The meat is massaged by hand and left to marinate, ensuring deep flavor penetration.
                     </p>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-12 items-start group">
                  <span className="text-8xl font-black text-brand-rust opacity-20 tracking-tighter italic group-hover:opacity-100 transition-opacity duration-700 leading-none">03</span>
                  <div className="space-y-6">
                     <h3 className="text-4xl font-black tracking-tighter text-brand-cream uppercase italic leading-none">The Slow Cure</h3>
                     <p className="text-brand-cream/40 text-xl leading-relaxed max-w-2xl font-medium italic">
                        No shortcuts. We use custom, humidity-controlled kilns that mimic the crisp Jozi air. The biltong is checked daily by our curing master until the texture is exactly right.
                     </p>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-40 px-6 lg:px-12 bg-brand-cream text-brand-timber">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
               <div className="flex flex-col items-center text-center space-y-8">
                  <div className="w-20 h-20 rounded-full bg-brand-rust/10 flex items-center justify-center">
                    <Award className="w-10 h-10 text-brand-rust" />
                  </div>
                  <h4 className="text-3xl font-black tracking-tighter uppercase italic leading-none">World Class Quality</h4>
                  <p className="text-brand-timber/50 text-base leading-relaxed font-medium italic">
                    We compete on the global stage. Our biltong is benchmarked against the best charcuterie worldwide using local African expertise.
                  </p>
               </div>
               <div className="flex flex-col items-center text-center space-y-8">
                  <div className="w-20 h-20 rounded-full bg-brand-rust/10 flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-brand-rust" />
                  </div>
                  <h4 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Jozi Crafted</h4>
                  <p className="text-brand-timber/50 text-base leading-relaxed font-medium italic">
                    We source local, employ local, and celebrate the rich, gritty heritage of Johannesburg's food culture.
                  </p>
               </div>
               <div className="flex flex-col items-center text-center space-y-8">
                  <div className="w-20 h-20 rounded-full bg-brand-rust/10 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-brand-rust" />
                  </div>
                  <h4 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Pure & Natural</h4>
                  <p className="text-brand-timber/50 text-base leading-relaxed font-medium italic">
                    No MSG, no artificial colorants, no nitrates. Just pure beef, premium spices, and a heritage recipe.
                  </p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default About;
