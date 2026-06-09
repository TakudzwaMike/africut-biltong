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
          <Link to="/" className="flex flex-col group mb-2">
            <img src="/images/logo.png" alt="Africut Biltong Logo" className="h-24 w-auto object-contain mix-blend-screen self-start -ml-2" />
          </Link>
          <p className="text-brand-cream/70 text-sm leading-relaxed max-w-xs font-medium italic">
            Premium South African biltong, handcrafted in Johannesburg and delivered across Gauteng. Authentic flavors, expertly dried.
          </p>
          <div className="flex flex-col space-y-2 pt-2">
            <a href="tel:+27816450133" className="flex items-center space-x-3 text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">
              <Phone className="w-4 h-4 text-brand-rust" />
              <span>+27 81 645 0133</span>
            </a>
            <a href="mailto:sales@africutbiltong.co.za" className="flex items-center space-x-3 text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic break-all">
              <Mail className="w-4 h-4 text-brand-rust" />
              <span>sales@africutbiltong.co.za</span>
            </a>
          </div>
          <div className="flex space-x-4">
            <a href="https://www.instagram.com/africutbiltongofficial_2026?igsh=MWRmczNscnp6Nzk3NQ%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-rust hover:border-brand-rust transition-all group">
              <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </a>
            <a href="https://www.tiktok.com/@africutbiltongofficial" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-rust hover:border-brand-rust transition-all group">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.8-5.46-.4-2.52.2-5.14 1.73-7.14 1.56-2.04 4.1-3.2 6.64-3.32v4.04c-1.35.03-2.65.68-3.48 1.75-.75.98-1.07 2.27-.85 3.49.25 1.53 1.34 2.8 2.82 3.3.93.31 1.99.3 2.93-.06 1.4-.53 2.37-1.87 2.47-3.36.14-2.82.08-5.65.12-8.48.01-4.04-.01-8.08.01-12.12z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-brand-rust italic">Shop</h4>
          <ul className="space-y-4">
            <li><Link to="/shop" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Shop All</Link></li>
            <li><Link to="/shop?category=game" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Wild Game</Link></li>
            <li><Link to="/shop?category=droewors" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Droëwors</Link></li>
            <li><Link to="/shop?category=snapstix" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Snapstix</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-brand-rust italic">Support</h4>
          <ul className="space-y-4">
            <li><Link to="/faq" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">General FAQ</Link></li>
            <li><Link to="/delivery" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Shipping Info</Link></li>
            <li><Link to="/contact" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Contact Us</Link></li>
            <li><Link to="/bulk" className="text-brand-cream/60 hover:text-white transition-colors text-sm font-medium italic">Bulk Orders</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-8">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-brand-rust italic">Newsletter</h4>
          <p className="text-brand-cream/60 text-sm font-medium italic">Stay updated on our latest products and exclusive drops.</p>
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
              <span>Gauteng Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3 h-3 text-brand-rust" />
              <span>Secure Payment</span>
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
