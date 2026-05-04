import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, setIsOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Shop All', path: '/shop' },
    { name: 'Gifts', path: '/shop?category=gifts' },
    { name: 'Corporate', path: '/corporate' },
    { name: 'Subscription', path: '/subscription' },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <nav className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-300 px-6 lg:px-12",
        isScrolled ? "top-0 py-4 bg-brand-timber/95 backdrop-blur-md shadow-2xl border-b border-white/5" : "top-8 py-6 bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-brand-cream"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img src="/images/logo.png" alt="Africut Biltong Logo" className="h-12 lg:h-16 w-auto object-contain mix-blend-screen" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="relative text-xs font-black uppercase tracking-widest text-brand-cream/70 hover:text-brand-rust transition-all duration-300 group"
              >
                <span>{link.name}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-rust transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5 text-brand-cream">
            <button className="hover:text-brand-rust transition-all duration-300 p-1 hover:scale-110 active:scale-95">
              <Search className="w-5 h-5" />
            </button>
            <button className="hover:text-brand-rust transition-all duration-300 p-1 hover:scale-110 active:scale-95">
              <User className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsOpen(true)}
              className="relative p-2 hover:bg-white/5 rounded-full transition-all group hover:scale-110 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-1 right-1 bg-brand-rust text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full group-hover:animate-pulse">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-brand-timber z-[100] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
               <img src="/images/logo.png" alt="Africut Biltong Logo" className="h-10 w-auto object-contain mix-blend-screen" />
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-brand-cream">
                 <X className="w-8 h-8" />
               </button>
            </div>
            <div className="flex flex-col space-y-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="text-2xl font-black uppercase tracking-widest text-brand-cream/60 hover:text-brand-rust"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="mt-auto pt-8 border-t border-white/10 space-y-4">
              <p className="text-sm text-brand-cream/40 uppercase tracking-widest font-black">Africut Butcher Craft</p>
              <div className="flex space-x-6 text-brand-cream">
                <Search className="w-6 h-6" />
                <User className="w-6 h-6" />
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
