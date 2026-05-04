import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, weight: number, flavor: string, quantity?: number) => void;
  removeFromCart: (id: string, weight: number, flavor: string) => void;
  updateQuantity: (id: string, weight: number, flavor: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('africut_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('africut_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, weight: number, flavor: string, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedWeight === weight && item.selectedFlavor === flavor);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedWeight === weight && item.selectedFlavor === flavor)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, selectedWeight: weight, selectedFlavor: flavor, quantity }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: string, weight: number, flavor: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedWeight === weight && item.selectedFlavor === flavor)));
  };

  const updateQuantity = (id: string, weight: number, flavor: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => 
      (item.id === id && item.selectedWeight === weight && item.selectedFlavor === flavor)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + (item.price * (item.selectedWeight / 100)) * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, 
      cartTotal, cartCount, isOpen, setIsOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
