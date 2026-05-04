import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

const WhatsAppButton = () => {
  const phoneNumber = "27816450133"; // Updated company phone number
  const message = encodeURIComponent("Hello Africut Biltong! I'd like to place an order or inquire about your products.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[150]">
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: 1 
        }}
        transition={{ 
          scale: {
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          },
          opacity: { duration: 0.5 }
        }}
        whileHover={{ scale: 1.1, repeat: 0 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-2xl flex items-center justify-center group cursor-pointer"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-[200px] group-hover:ml-3 transition-all duration-500 whitespace-nowrap font-bold uppercase tracking-widest text-[10px]">
          WhatsApp Order
        </span>
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
      </motion.a>
    </div>
  );
};

export default WhatsAppButton;
