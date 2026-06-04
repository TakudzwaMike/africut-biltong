import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building, Mail, Phone, MapPin, Users, Gift, Calendar, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

const Corporate = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    orderSize: 'medium',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [refCode, setRefCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.email) return;

    // Generate simulated reference code
    const code = 'AFC-CORP-' + Math.floor(1000 + Math.random() * 9000);
    setRefCode(code);
    setSubmitted(true);
  };

  const services = [
    {
      icon: <Users className="w-6 h-6 text-brand-rust" />,
      title: "Staff Appreciation",
      desc: "Thank your team the right way with a unique premium South African gift."
    },
    {
      icon: <Gift className="w-6 h-6 text-brand-rust" />,
      title: "Client Gifts",
      desc: "Leave a lasting impression with custom-designed premium packaging."
    },
    {
      icon: <Calendar className="w-6 h-6 text-brand-rust" />,
      title: "Events & Conferences",
      desc: "Fuel your events, meetings, and conferences with authentic flavor."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-brand-rust" />,
      title: "Promotions & Launches",
      desc: "Stand out with something memorable and delicious."
    }
  ];

  return (
    <div className="pt-40 pb-24 px-6 lg:px-12 bg-brand-timber min-h-screen text-brand-cream relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 h-full w-full pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-rust/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-brand-rust text-xs font-black uppercase tracking-[0.3em] mb-4 block italic">Partner with the Best</span>
          <h1 className="text-5xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] mb-6">
            Corporate<br/>Orders.
          </h1>
          <p className="text-brand-cream/60 font-medium italic text-lg leading-relaxed">
            Elevate your corporate gifting and event catering with Johannesburg's premium handcrafted biltong. 
            We offer custom branding, bulk rates, and express nationwide delivery.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
          {/* Left Column: Flyer */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              whileHover={{ scale: 1.02, rotate: -0.5 }}
              className="bg-brand-surface rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative group aspect-[2/3] max-w-md mx-auto lg:max-w-none"
            >
              <img 
                src="/images/corporate_promo.jpg" 
                alt="Corporate Orders Flyer" 
                className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-timber/80 via-transparent to-transparent opacity-60"></div>
            </motion.div>

            {/* Quick Contact Box */}
            <div className="bg-brand-surface p-8 rounded-[2rem] border border-white/5 shadow-xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-brand-rust italic">Want to be the first to order?</h3>
              <div className="space-y-3 text-sm font-medium italic text-brand-cream/80">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-brand-rust" />
                  <span>Call/WhatsApp: 063 973 5240</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-rust" />
                  <span>Website: africutbiltong.co.za</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-brand-rust" />
                  <span>Johannesburg, South Africa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form & Success */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-brand-surface p-8 lg:p-12 rounded-[3rem] border border-white/5 shadow-2xl"
                >
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-8">
                    Corporate Request Form
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust italic block">Contact Name *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g. John Doe"
                          className="w-full bg-brand-timber border border-white/10 rounded-xl px-5 py-4 text-sm font-bold placeholder:text-brand-cream/20 focus:ring-2 focus:ring-brand-rust focus:border-brand-rust outline-none transition-all italic text-brand-cream"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust italic block">Company Name *</label>
                        <input 
                          type="text" 
                          required
                          value={formData.company}
                          onChange={e => setFormData({...formData, company: e.target.value})}
                          placeholder="e.g. Acme Corp"
                          className="w-full bg-brand-timber border border-white/10 rounded-xl px-5 py-4 text-sm font-bold placeholder:text-brand-cream/20 focus:ring-2 focus:ring-brand-rust focus:border-brand-rust outline-none transition-all italic text-brand-cream"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust italic block">Work Email *</label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          placeholder="e.g. john@acme.com"
                          className="w-full bg-brand-timber border border-white/10 rounded-xl px-5 py-4 text-sm font-bold placeholder:text-brand-cream/20 focus:ring-2 focus:ring-brand-rust focus:border-brand-rust outline-none transition-all italic text-brand-cream"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust italic block">Contact Number</label>
                        <input 
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          placeholder="e.g. 063 973 5240"
                          className="w-full bg-brand-timber border border-white/10 rounded-xl px-5 py-4 text-sm font-bold placeholder:text-brand-cream/20 focus:ring-2 focus:ring-brand-rust focus:border-brand-rust outline-none transition-all italic text-brand-cream"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust italic block">Estimated Order Value</label>
                      <select 
                        value={formData.orderSize}
                        onChange={e => setFormData({...formData, orderSize: e.target.value})}
                        className="w-full bg-brand-timber border border-white/10 rounded-xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-rust focus:border-brand-rust outline-none transition-all italic text-brand-cream"
                      >
                        <option value="small">Small (Under R1,000)</option>
                        <option value="medium">Medium (R1,000 - R5,000)</option>
                        <option value="large">Large (R5,000 - R15,000)</option>
                        <option value="enterprise">Enterprise (R15,000+)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-brand-rust italic block">Custom Requirements & Preferences</label>
                      <textarea 
                        rows={4}
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        placeholder="Tell us about custom packaging requests, logo printing, choice of biltong cuts, spices, or event date..."
                        className="w-full bg-brand-timber border border-white/10 rounded-xl px-5 py-4 text-sm font-bold placeholder:text-brand-cream/20 focus:ring-2 focus:ring-brand-rust focus:border-brand-rust outline-none transition-all italic text-brand-cream"
                      />
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-brand-rust text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-2 hover:bg-brand-spiced transition-all shadow-3xl italic mt-8 cursor-pointer"
                    >
                      <span>Request Corporate Proposal</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-brand-surface p-12 lg:p-16 rounded-[3rem] border border-white/5 shadow-2xl text-center space-y-6 flex flex-col items-center justify-center min-h-[500px]"
                >
                  <div className="w-20 h-20 bg-green-500/10 rounded-full border border-green-500/20 flex items-center justify-center text-green-400 mb-4 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tight text-brand-cream">
                    Proposal Requested!
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <p className="text-brand-cream/60 font-medium italic leading-relaxed">
                      Thank you, <span className="text-brand-cream font-black">{formData.name}</span>. We've received your request for <span className="text-brand-cream font-black">{formData.company}</span>. 
                      One of our master butchers will contact you shortly to refine your custom biltong experience.
                    </p>
                    <div className="bg-brand-timber p-4 rounded-xl border border-white/5 font-mono text-xs uppercase tracking-widest text-brand-rust inline-block">
                      Reference Code: {refCode}
                    </div>
                    <p className="text-[10px] text-brand-cream/30 font-black uppercase tracking-wider">
                      A confirmation email has been sent to {formData.email}.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', company: '', email: '', phone: '', orderSize: 'medium', message: '' });
                    }}
                    className="border border-white/10 text-brand-cream/60 hover:text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all italic mt-8 cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Section: Services and Checklist */}
        <div className="border-t border-white/10 pt-24 space-y-24">
          {/* Services Grid */}
          <div className="space-y-12">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-center">Perfect For Every Occasion</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((svc, i) => (
                <div key={i} className="bg-brand-surface p-8 rounded-3xl border border-white/5 shadow-lg space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-rust/10 flex items-center justify-center">
                    {svc.icon}
                  </div>
                  <h4 className="text-lg font-black uppercase italic tracking-tight">{svc.title}</h4>
                  <p className="text-brand-cream/50 text-sm leading-relaxed font-medium italic">{svc.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Bullet Grid */}
          <div className="bg-brand-rust rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none select-none italic text-[12vw] font-black text-white leading-none -skew-y-12">
              BULK
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 text-white">
                <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-4">
                  Why Choose<br/>Africut Bulk?
                </h3>
                <p className="text-white/80 font-bold italic text-sm">
                  We match premium South African traditions with business-grade execution.
                </p>
              </div>
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-white/90">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-timber flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-black uppercase tracking-wider text-xs italic">Premium Quality Biltong</h5>
                    <p className="text-[10px] text-white/70 italic mt-0.5">Sourced from certified grass-fed A-grade local beef cuts only.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-timber flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-black uppercase tracking-wider text-xs italic">Custom Packaging Available</h5>
                    <p className="text-[10px] text-white/70 italic mt-0.5">Add your brand logo, corporate colors, and personalized message cards.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-timber flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-black uppercase tracking-wider text-xs italic">Bulk & Wholesale Rates</h5>
                    <p className="text-[10px] text-white/70 italic mt-0.5">Special scaling discounts based on volume, perfect for recurring office snacks.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-timber flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-black uppercase tracking-wider text-xs italic">Nationwide Delivery</h5>
                    <p className="text-[10px] text-white/70 italic mt-0.5">Vacuum-sealed freshness shipped straight to your desk anywhere in SA.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Corporate;
