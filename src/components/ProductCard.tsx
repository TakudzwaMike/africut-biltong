import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      viewport={{ once: true }}
      className="group relative flex flex-col h-full bg-brand-surface border border-white/5 rounded-2xl overflow-hidden hover:border-brand-rust/50 transition-all duration-500 shadow-2xl hover:shadow-brand-rust/20"
    >
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
            onClick={() => addToCart(product, 100, product.flavors[0])}
            className="w-full bg-brand-rust text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-2 shadow-2xl hover:bg-brand-spiced transition-all transform active:scale-95"
          >
            <span>Fresh Batch Add</span>
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
