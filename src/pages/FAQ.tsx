import React, { useState } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const FAQ = () => {
  const faqs = [
    {
      question: "How long does your biltong stay fresh?",
      answer: "When stored in an airtight container in a cool, dry place, our biltong typically stays fresh for 5-7 days. For longer storage, you can freeze it for up to 3 months—just ensure it's vacuum-sealed."
    },
    {
      question: "Is Africut Biltong Halal-certified?",
      answer: "Yes, our meat is sourced exclusively from Halal-certified suppliers in South Africa. We maintain strict hygiene and separation standards in our Johannesburg facility."
    },
    {
      question: "How fast is Gauteng delivery?",
      answer: "We aim to dispatch all orders within 24 hours. Delivery typically takes 24-48 hours across Gauteng."
    },
    {
      question: "Do you offer bulk or corporate discounts?",
      answer: "Absolutely. We provide curated corporate gift boxes and bulk snack packs for offices and events. Please visit our Corporate/Bulk section or contact us for a custom quote."
    },
    {
      question: "What makes biltong different from jerky?",
      answer: "Jerky is typically lean meat that's been smoked and marinated in high-sugar sauces. Biltong is cured using vinegar and air-dried at lower temperatures, preserving more nutritional value and a much deeper, savory meat flavor."
    },
    {
      question: "Can I choose the fat content of my biltong?",
      answer: "Yes! Many of our products allow you to select your preferred 'cut' (Fatty, Medium, or Lean) to ensure you get exactly what you enjoy most."
    }
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <div className="pt-40 pb-24 bg-brand-timber min-h-screen text-brand-cream">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-24">
          <span className="text-brand-rust text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Knowledge Dispatch</span>
          <h1 className="text-6xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase italic">The Butcher's Truth.</h1>
          <p className="text-brand-cream/40 font-medium italic">Can't find your answer here? <a href="/contact" className="text-brand-rust font-black border-b border-brand-rust/30 hover:border-brand-rust transition-colors underline decoration-brand-rust decoration-2 underline-offset-4">Contact The Herd.</a></p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={cn(
                "bg-brand-surface rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-300",
                activeIndex === index ? "shadow-3xl border-brand-rust/40" : "hover:border-brand-rust/20"
              )}
            >
              <button 
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-10 text-left group"
              >
                <span className="text-2xl font-black tracking-tighter text-brand-cream group-hover:text-brand-rust transition-colors leading-none uppercase italic">{faq.question}</span>
                <div className={cn(
                  "w-12 h-12 rounded-full border border-white/10 flex items-center justify-center transition-all",
                  activeIndex === index ? "bg-brand-rust text-white rotate-180 border-brand-rust" : "bg-brand-timber text-brand-rust group-hover:border-brand-rust group-hover:text-brand-rust"
                )}>
                  <ChevronDown className={cn("w-6 h-6 transition-transform", activeIndex === index ? "" : "-rotate-90")} />
                </div>
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="px-10 pb-10 text-brand-cream/40 text-lg leading-relaxed border-t border-white/5 pt-8 italic font-medium">
                      "{faq.answer}"
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Categories of Questions */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-brand-surface text-brand-cream p-12 lg:p-16 rounded-[3rem] space-y-6 border border-white/5 shadow-3xl">
              <h3 className="text-4xl font-black text-brand-rust tracking-tighter italic uppercase leading-none">Fleet Coverage</h3>
              <p className="text-brand-cream/40 text-sm leading-relaxed font-black uppercase tracking-tighter italic">
                We dispatch from Jozi to all areas within Gauteng. 48 hour reach within Gauteng.
              </p>
           </div>
           <div className="bg-brand-rust text-white p-12 lg:p-16 rounded-[3rem] space-y-6 shadow-3xl">
              <h3 className="text-4xl font-black tracking-tighter italic uppercase leading-none">Wholesale HQ</h3>
              <p className="text-white/80 text-sm leading-relaxed font-black uppercase tracking-tighter italic">
                Stock Africut in your retail space. We offer competitive butcher-direct pricing for verified resellers in Gauteng.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
