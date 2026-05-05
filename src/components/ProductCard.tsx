import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, ShoppingBag, X, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<number>(Object.keys(product.prices).map(Number).sort((a,b) => a-b)[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavors[0]);
  const [quantity, setQuantity] = useState(1);

  const handleConfirmAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedWeight, selectedFlavor, quantity);
    setIsSelecting(false);
    setQuantity(1);
  };

  const weights = Object.keys(product.prices).map(Number).sort((a,b) => a-b);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={isSelecting ? {} : { scale: 1.02 }}
      viewport={{ once: true }}
      className="group relative flex flex-col h-full bg-brand-surface border border-white/5 rounded-2xl overflow-hidden hover:border-brand-rust/50 transition-all duration-500 shadow-2xl hover:shadow-brand-rust/20 min-h-[450px]"
    >
      {/* Selection Overlay */}
      <AnimatePresence>
        {isSelecting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-40 bg-brand-timber p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-rust italic">Select Options</h4>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsSelecting(false); }}
                className="text-brand-cream/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
              {/* Weight Selector */}
              <div className="space-y-3">
                <label className="text-[9px] uppercase font-black tracking-widest text-brand-cream/30 italic">Select Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {weights.map(w => (
                    <button
                      key={w}
                      onClick={(e) => { e.stopPropagation(); setSelectedWeight(w); }}
                      className={cn(
                        "py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all italic",
                        selectedWeight === w 
                          ? "bg-brand-rust text-white border-brand-rust" 
                          : "bg-white/5 text-brand-cream/40 border-white/10 hover:border-brand-rust/50"
                      )}
                    >
                      {w >= 1000 ? `${w/1000}kg` : `${w}g`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flavor Selector */}
              <div className="space-y-3">
                <label className="text-[9px] uppercase font-black tracking-widest text-brand-cream/30 italic">Select Flavor</label>
                <div className="grid grid-cols-1 gap-2">
                  {product.flavors.map(f => (
                    <button
                      key={f}
                      onClick={(e) => { e.stopPropagation(); setSelectedFlavor(f); }}
                      className={cn(
                        "py-2.5 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all italic text-left flex justify-between items-center",
                        selectedFlavor === f 
                          ? "bg-brand-cream text-brand-timber border-brand-cream" 
                          : "bg-white/5 text-brand-cream/40 border-white/10 hover:border-brand-rust/50"
                      )}
                    >
                      <span>{f}</span>
                      {selectedFlavor === f && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="text-[9px] uppercase font-black tracking-widest text-brand-cream/30 italic">Quantity</label>
                <div className="flex items-center space-x-4 bg-white/5 w-fit rounded-xl p-2 border border-white/10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }}
                    className="text-brand-cream/40 hover:text-brand-rust transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-black text-brand-cream w-8 text-center">{quantity}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setQuantity(q => q + 1); }}
                    className="text-brand-cream/40 hover:text-brand-rust transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-cream/30 italic">Total</span>
                <span className="text-2xl font-black text-brand-rust italic">R{((product.prices[selectedWeight as keyof typeof product.prices] || 0) * quantity).toFixed(2)}</span>
              </div>
              <button 
                onClick={handleConfirmAdd}
                className="w-full bg-brand-rust text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-2 shadow-2xl hover:bg-brand-spiced transition-all"
              >
                <span>Confirm Add</span>
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative aspect-[4/5] overflow-hidden">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
            referrerPolicy="no-referrer"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          {product.popular && (
            <motion.span 
              whileHover={{ scale: 1.1 }}
              className="bg-brand-rust text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-xl italic"
            >
              Butcher's Choice
            </motion.span>
          )}
          {product.category === 'snapstix' && (
            <motion.span 
              whileHover={{ scale: 1.1 }}
              className="bg-brand-rust text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-xl flex items-center gap-1 italic"
            >
              <Plus className="w-3 h-3 rotate-45" /> High Protein
            </motion.span>
          )}
          {product.category === 'game' && (
            <motion.span 
              whileHover={{ scale: 1.1 }}
              className="bg-brand-rust text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-xl flex items-center gap-1 italic"
            >
              <Plus className="w-3 h-3 rotate-45" /> Wild Cut
            </motion.span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
           <button className="w-10 h-10 bg-brand-timber/80 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-brand-rust border border-white/10 transition-colors">
              <Heart className="w-5 h-5" />
           </button>
        </div>

        {/* Quick Add Button */}
        <div className="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsSelecting(true); }}
            className="w-full bg-brand-rust text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-2 shadow-2xl hover:bg-brand-spiced transition-all transform active:scale-95"
          >
            <span>Add to Cart</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] text-brand-rust font-black uppercase tracking-widest italic">{product.category}</p>
          <div className="text-right">
            <span className="text-2xl font-black text-brand-cream tracking-tighter italic">R{product.prices[100]}</span>
            <span className="text-[10px] text-brand-cream/30 ml-1 font-black uppercase">/ 100g</span>
          </div>
        </div>
        <Link to={`/product/${product.id}`} className="block group-hover:text-brand-rust transition-colors mb-4">
          <h3 className="text-xl font-black tracking-tighter leading-none text-brand-cream uppercase italic">{product.name}</h3>
        </Link>
        <p className="text-sm text-brand-cream/40 line-clamp-2 leading-relaxed mb-6 font-medium italic">
          "{product.description}"
        </p>
        
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
           <span className="text-[10px] text-brand-cream/20 font-black uppercase tracking-widest italic">Johannesburg Crafted</span>
           <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-brand-surface bg-brand-timber flex items-center justify-center">
                   <div className="w-full h-full rounded-full bg-brand-rust/20"></div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
