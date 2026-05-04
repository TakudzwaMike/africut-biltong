import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Truck, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-timber text-brand-cream pt-24 pb-12 px-6 lg:px-12 overflow-hidden relative border-t border-white/5">
      {/* Decorative Background Text */}
      <div className="absolute -bottom-10 -right-20 text-[20vw] font-black text-white/[0.03] pointer-events-none select-none italic leading-none">
        AFRICUT
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
        {/* Brand Column */}
        <div className="space-y-8">
          <Link to="/" className="flex flex-col group">
            <span className="text-3xl font-black tracking-tighter uppercase italic leading-none">AFRICUT</span>
            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-rust -mt-1 italic">Butchers • Jozi</span>
          </Link>
          <p className="text-brand-cream/70 text-sm leading-relaxed max-w-xs font-medium italic">
            Premium South African biltong, handcrafted in Johannesburg and delivered nationwide. Authentic flavors, expertly dried.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-rust hover:border-brand-rust transition-all group">
              <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-rust hover:border-brand-rust transition-all group">
              <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-rust hover:border-brand-rust transition-all group">
              <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-brand-rust italic">The Market</h4>
          <ul className="space-y-4">
            <li><Link to="/shop" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">All Batches</Link></li>
            <li><Link to="/shop?category=game" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Wild Game</Link></li>
            <li><Link to="/shop?category=droewors" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Droëwors</Link></li>
            <li><Link to="/shop?category=snapstix" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Snapstix</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-brand-rust italic">Assistance</h4>
          <ul className="space-y-4">
            <li><Link to="/faq" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">General FAQ</Link></li>
            <li><Link to="/delivery" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Shipment Logs</Link></li>
            <li><Link to="/contact" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Contact Dispatch</Link></li>
            <li><Link to="/bulk" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Bulk Requisitions</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-8">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-brand-rust italic">Herd Intel</h4>
          <p className="text-brand-cream/60 text-sm font-medium italic">Stay updated on our latest batches and exclusive drops.</p>
          <div className="relative group">
            <input 
              type="email" 
              placeholder="Your Email" 
              className="w-full bg-brand-surface border border-white/5 rounded-2xl py-4 px-6 text-sm italic focus:outline-none focus:border-brand-rust/50 transition-all"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-rust hover:text-white transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="pt-4 flex items-center space-x-6 text-[10px] text-brand-cream/20 uppercase font-black tracking-widest italic">
            <div className="flex items-center space-x-2">
              <Truck className="w-3 h-3 text-brand-rust" />
              <span>Jozi Dispatched</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3 h-3 text-brand-rust" />
              <span>Secured Hooks</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-[10px] text-brand-cream/20 uppercase font-black tracking-[0.2em] italic">
        <p>© 2024 Africut Biltong HQ. All Rights Reserved.</p>
        <div className="flex items-center space-x-2">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-brand-rust fill-current" />
          <span>in Johannesburg</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
