import React from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Twitter, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'motion/react';

const Contact = () => {
  return (
    <div className="pt-40 pb-24 bg-brand-timber min-h-screen text-brand-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          
          {/* Info Side */}
          <div className="space-y-16">
            <div>
              <span className="text-brand-rust text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Customer Support</span>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9] uppercase italic">
                Whatever you need,<br />The Herd is here.
              </h1>
              <p className="text-brand-cream/40 text-lg leading-relaxed max-w-md font-medium italic">
                Questions about an order? Bulk order inquiries? Or just want to talk about biltong? Drop us a message and our team will get back to you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-brand-rust">
                    <Mail className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-black tracking-widest italic">Email Us</span>
                  </div>
                  <p className="text-lg font-black text-brand-cream tracking-tighter italic">sales@africutbiltong.co.za</p>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-brand-rust">
                    <Phone className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-black tracking-widest italic">Call Us</span>
                  </div>
                  <p className="text-lg font-black text-brand-cream tracking-tighter italic">+27 81 645 0133</p>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-brand-rust">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-black tracking-widest italic">Our Location</span>
                  </div>
                  <p className="text-lg font-black text-brand-cream tracking-tighter italic">Johannesburg, South Africa</p>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-brand-rust">
                    <Truck className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-black tracking-widest italic">Delivery</span>
                  </div>
                  <p className="text-lg font-black text-brand-cream tracking-tighter italic">Gauteng Delivery</p>
               </div>
            </div>

            <div className="pt-12 border-t border-white/5">
               <p className="text-[10px] uppercase font-black tracking-widest text-brand-cream/20 mb-6 italic">The Social Rack</p>
               <div className="flex space-x-8">
                  <a href="https://www.instagram.com/africutbiltongofficial_2026?igsh=MWRmczNscnp6Nzk3NQ%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-brand-cream/60 hover:text-brand-rust transition-colors group">
                    <Instagram className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest italic">Instagram</span>
                  </a>
                  <a href="https://www.tiktok.com/@africutbiltongofficial" target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-brand-cream/60 hover:text-brand-rust transition-colors group">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.52.2-5.14 1.73-7.14 1.56-2.04 4.1-3.2 6.64-3.32v4.04c-1.35.03-2.65.68-3.48 1.75-.75.98-1.07 2.27-.85 3.49.25 1.53 1.34 2.8 2.82 3.3.93.31 1.99.3 2.93-.06 1.4-.53 2.37-1.87 2.47-3.36.14-2.82.08-5.65.12-8.48.01-4.04-.01-8.08.01-12.12z" />
                    </svg>
                    <span className="text-xs font-black uppercase tracking-widest italic">TikTok</span>
                  </a>
               </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-brand-surface p-12 lg:p-16 rounded-[3rem] shadow-3xl border border-white/5">
             <h2 className="text-4xl font-black tracking-tighter mb-12 text-brand-cream leading-tight uppercase italic">Send Us A Message.</h2>
             <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust ml-1 italic">Your Name</label>
                      <input 
                        type="text" 
                        placeholder="Thabo Molefe" 
                        className="w-full bg-brand-timber border border-white/10 rounded-2xl p-5 text-sm font-black text-brand-cream placeholder:text-brand-cream/20 focus:ring-2 focus:ring-brand-rust focus:border-brand-rust outline-none italic"
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust ml-1 italic">Your Email</label>
                      <input 
                        type="email" 
                        placeholder="thabo@gmail.com" 
                        className="w-full bg-brand-timber border border-white/10 rounded-2xl p-5 text-sm font-black text-brand-cream placeholder:text-brand-cream/20 focus:ring-2 focus:ring-brand-rust focus:border-brand-rust outline-none italic"
                      />
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust ml-1 italic">Subject</label>
                   <select className="w-full bg-brand-timber border border-white/10 rounded-2xl p-5 text-sm font-black text-brand-cream focus:ring-2 focus:ring-brand-rust focus:border-brand-rust outline-none italic appearance-none">
                      <option className="bg-brand-surface text-brand-cream">General Inquiry</option>
                      <option className="bg-brand-surface text-brand-cream">Bulk / Corporate Quote</option>
                      <option className="bg-brand-surface text-brand-cream">Order Tracking</option>
                      <option className="bg-brand-surface text-brand-cream">Reseller Inquiry</option>
                   </select>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust ml-1 italic">Your Message</label>
                   <textarea border-0 
                     rows={5}
                     placeholder="Tell us what you need Thabo..." 
                     className="w-full bg-brand-timber border border-white/10 rounded-3xl p-5 text-sm font-black text-brand-cream placeholder:text-brand-cream/20 focus:ring-2 focus:ring-brand-rust focus:border-brand-rust outline-none resize-none italic"
                   />
                </div>
                <button className="w-full bg-brand-rust text-white py-7 rounded-full font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 group hover:bg-brand-spiced transition-all duration-300 shadow-3xl transform active:scale-[0.98] italic">
                   <span>Send Message</span>
                   <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
             </form>

             <div className="mt-12 flex items-center justify-center space-x-10 text-[9px] text-brand-cream/20 font-black tracking-widest border-t border-white/5 pt-10 uppercase italic">
                <div className="flex items-center space-x-2">
                   <ShieldCheck className="w-4 h-4" />
                   <span>Private & Secure Sourcing</span>
                </div>
                <div className="flex items-center space-x-2">
                   <Send className="w-4 h-4" />
                   <span>Fast Dispatch Response</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
