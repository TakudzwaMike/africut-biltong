import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, Search, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';
import { cn } from '../lib/utils';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  
  const activeCategory = searchParams.get('category') || 'all';

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (a.prices[100] || 0) - (b.prices[100] || 0);
      if (sortBy === 'price-high') return (b.prices[100] || 0) - (a.prices[100] || 0);
      return 0; // Default or popular
    });
  }, [activeCategory, searchQuery, sortBy]);

  const categories = [
    { id: 'all', name: 'All Cuts' },
    { id: 'biltong', name: 'Beef Biltong' },
    { id: 'game', name: 'Wild Game' },
    { id: 'droewors', name: 'Droëwors' },
    { id: 'snapstix', name: 'Snapstix' },
    { id: 'specialty', name: 'Specialties' },
  ];

  return (
    <div className="pt-40 pb-24 px-6 lg:px-12 bg-brand-timber min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-16">
          <div className="flex flex-col space-y-4 mb-12">
            <span className="text-brand-rust text-[10px] font-black uppercase tracking-[0.4em] italic">The Africut Butcher's Larder</span>
            <h1 className="text-5xl lg:text-9xl font-black tracking-tighter text-brand-cream uppercase italic leading-none">Fresh Cuts.</h1>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center justify-between bg-brand-surface p-5 rounded-[2rem] shadow-3xl border border-white/5">
            {/* Categories */}
            <div className="flex overflow-x-auto no-scrollbar space-x-2 p-1">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchParams(cat.id === 'all' ? {} : { category: cat.id })}
                  className={cn(
                    "px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border italic",
                    activeCategory === cat.id 
                      ? "bg-brand-rust text-white border-brand-rust shadow-xl" 
                      : "bg-transparent text-brand-cream/30 border-white/10 hover:border-brand-rust/50 hover:text-brand-cream"
                  )}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>

            {/* Search and Sort */}
            <div className="flex items-center space-x-4 px-2">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-rust" strokeWidth={3} />
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-timber border border-white/10 rounded-full py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest text-brand-cream placeholder:text-brand-cream/20 focus:ring-2 focus:ring-brand-rust focus:border-brand-rust transition-all outline-none italic"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-10 text-brand-cream/20 text-[10px] font-black tracking-[0.2em] uppercase italic">
           <div className="flex items-center space-x-3">
              <span className="h-[1px] w-8 bg-brand-rust"></span>
              <span>Products Found: {filteredProducts.length}</span>
           </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div 
              key={`${activeCategory}-${sortBy}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-40 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="w-32 h-32 bg-brand-surface rounded-full flex items-center justify-center shadow-3xl border border-white/5 relative">
                <Search className="w-12 h-12 text-brand-rust/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-brand-rust animate-spin opacity-20"></div>
              </div>
              <div className="max-w-md">
                <h3 className="text-3xl font-black text-brand-cream mb-4 tracking-tighter uppercase italic">No Products Found.</h3>
                <p className="text-brand-cream/40 text-sm font-medium italic">Our butchers couldn't find a matching cut. Try searching for "Original", "Chilli", or "Sticks".</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchParams({});
                  setSearchQuery('');
                  setSortBy('popular');
                }}
                className="bg-brand-rust text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-brand-spiced transition-all shadow-2xl italic"
              >
                Reset Filters
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Shop;
