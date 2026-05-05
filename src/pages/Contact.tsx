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
                  <p className="text-lg font-black text-brand-cream tracking-tighter italic">hello@africutbiltong.co.za</p>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-brand-rust">
                    <Phone className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-black tracking-widest italic">Call Us</span>
                  </div>
                  <p className="text-lg font-black text-brand-cream tracking-tighter italic">+27 (81) 645-0133</p>
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
                  <p className="text-lg font-black text-brand-cream tracking-tighter italic">Nationwide Delivery</p>
               </div>
            </div>

            <div className="pt-12 border-t border-white/5">
               <p className="text-[10px] uppercase font-black tracking-widest text-brand-cream/20 mb-6 italic">The Social Rack</p>
               <div className="flex space-x-8">
                  <a href="#" className="flex items-center space-x-2 text-brand-cream/60 hover:text-brand-rust transition-colors group">
                    <Instagram className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest italic">Instagram</span>
                  </a>
                  <a href="#" className="flex items-center space-x-2 text-brand-cream/60 hover:text-brand-rust transition-colors group">
                    <Facebook className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest italic">Facebook</span>
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
