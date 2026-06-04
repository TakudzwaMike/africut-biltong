import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, Clock, Zap, ShoppingBag } from "lucide-react";
import { PRODUCTS } from "../constants";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { cn } from "../lib/utils";

function getTimeUntilNextFriday() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
  const nextFriday = new Date(now);
  nextFriday.setDate(now.getDate() + (dayOfWeek === 5 ? 0 : daysUntilFriday));
  nextFriday.setHours(23, 59, 59, 0);
  const diff = nextFriday.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const isFriday = dayOfWeek === 5;
  return { hours, minutes, seconds, isFriday };
}

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart();
  const activeCategory = searchParams.get("category") || "all";

  const [countdown, setCountdown] = useState(getTimeUntilNextFriday());
  useEffect(() => {
    const timer = setInterval(() => setCountdown(getTimeUntilNextFriday()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    return PRODUCTS
      .filter(p => p.id !== "chilli-deal" && p.id !== "sub-pack-monthly")
      .filter(product => {
        const matchesCategory = activeCategory === "all" || product.category === activeCategory;
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
  }, [activeCategory, searchQuery]);

  const chilliDeal = PRODUCTS.find(p => p.id === "chilli-deal");

  const categories = [
    { id: "all", name: "All Cuts" },
    { id: "biltong", name: "Beef Biltong" },
    { id: "game", name: "Wild Game" },
    { id: "droewors", name: "Droewors" },
    { id: "snapstix", name: "Snapstix" },
    { id: "specialty", name: "Specialties" },
  ];

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="pt-40 pb-24 px-6 lg:px-12 bg-brand-timber min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col space-y-4 mb-10">
            <span className="text-brand-rust text-[10px] font-black uppercase tracking-[0.4em] italic">The Africut Butcher&apos;s Larder</span>
            <h1 className="text-5xl lg:text-9xl font-black tracking-tighter text-brand-cream uppercase italic leading-none">Fresh Cuts.</h1>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:items-center justify-between bg-brand-surface p-5 rounded-[2rem] shadow-3xl border border-white/5">
            <div className="flex overflow-x-auto no-scrollbar space-x-2 p-1">
              {categories.map(cat => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchParams(cat.id === "all" ? {} : { category: cat.id })}
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
            <div className="flex items-center space-x-4 px-2">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-rust" strokeWidth={3} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-timber border border-white/10 rounded-full py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest text-brand-cream placeholder:text-brand-cream/20 focus:ring-2 focus:ring-brand-rust focus:border-brand-rust transition-all outline-none italic"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Friday Special Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 rounded-[2.5rem] overflow-hidden border border-brand-rust/20 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            <div className="md:col-span-4 relative aspect-video md:aspect-auto overflow-hidden min-h-[220px]">
              <img src="/images/friday_special_promo.jpg" alt="Friday Daily Special" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-timber/80 hidden md:block" />
            </div>
            <div className="md:col-span-8 bg-brand-surface p-8 md:p-10 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-brand-rust" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-rust italic">
                    {countdown.isFriday ? "Today Only!" : "Coming This Friday"}
                  </span>
                </div>
                <h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-brand-cream leading-none mb-2">
                  {"Don't Miss Out!"}<br />
                  <span className="text-brand-rust">This Friday</span> Daily Special.
                </h3>
                <p className="text-brand-cream/50 text-sm font-medium italic">
                  Bold flavour. 100% Beef. High in protein. Made with care. Unbeatable prices, one day only. Grab it before it is gone!
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-brand-rust flex-shrink-0" />
                <div className="flex items-center gap-2">
                  {[
                    { val: pad(countdown.hours), label: "Hrs" },
                    { val: pad(countdown.minutes), label: "Min" },
                    { val: pad(countdown.seconds), label: "Sec" },
                  ].map((t, i) => (
                    <React.Fragment key={t.label}>
                      {i > 0 && <span className="text-brand-rust font-black text-xl">:</span>}
                      <div className="bg-brand-timber rounded-xl p-3 text-center min-w-[52px]">
                        <span className="text-2xl font-black text-brand-cream tabular-nums">{t.val}</span>
                        <span className="block text-[8px] text-brand-cream/30 uppercase font-black tracking-widest">{t.label}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                <span className="text-[10px] text-brand-cream/30 font-black uppercase italic tracking-widest hidden sm:block">
                  until {countdown.isFriday ? "special ends" : "next Friday special"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chilli Deal Banner */}
        {chilliDeal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
              <div className="md:col-span-4 relative aspect-video md:aspect-auto overflow-hidden min-h-[220px]">
                <img src="/images/chilli_deal.jpg" alt="Beef Biltong Chilli 3-Pack Deal" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-timber/80 hidden md:block" />
              </div>
              <div className="md:col-span-8 bg-brand-surface p-8 md:p-10 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-rust italic block mb-2">Limited Offer</span>
                  <h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-brand-cream leading-none mb-2">
                    Beef Biltong Chilli<br />
                    <span className="text-brand-rust">Buy 3</span> for only <span className="text-brand-rust">R85</span>
                    <span className="text-brand-cream/30 text-xl line-through ml-3">R105</span>
                  </h3>
                  <p className="text-brand-cream/50 text-sm font-medium italic">
                    100% Beef. Spicy and Tasty. High in Protein. No Added MSG. Perfect for snacks, road trips and more!
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addToCart(chilliDeal, 300, "Chilli", 1)}
                  className="self-start bg-brand-rust text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 hover:bg-brand-spiced transition-all shadow-2xl italic cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Grab the 3-Pack Deal - R85</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results count */}
        <div className="flex items-center mb-10 text-brand-cream/20 text-[10px] font-black tracking-[0.2em] uppercase italic">
          <span className="h-[1px] w-8 bg-brand-rust mr-3" />
          <span>Products Found: {filteredProducts.length}</span>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              key={activeCategory}
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
                <div className="absolute inset-0 rounded-full border-t-2 border-brand-rust animate-spin opacity-20" />
              </div>
              <div className="max-w-md">
                <h3 className="text-3xl font-black text-brand-cream mb-4 tracking-tighter uppercase italic">No Products Found.</h3>
                <p className="text-brand-cream/40 text-sm font-medium italic">Our butchers could not find a matching cut. Try searching for Original, Chilli, or Sticks.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSearchParams({}); setSearchQuery(""); }}
                className="bg-brand-rust text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-brand-spiced transition-all shadow-2xl italic cursor-pointer"
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
