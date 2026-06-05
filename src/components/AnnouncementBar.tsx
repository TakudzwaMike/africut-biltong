import React from 'react';
import { Truck, MapPin, Award } from 'lucide-react';

const AnnouncementBar = () => {
  return (
    <div className="bg-brand-rust text-white py-1.5 px-4 fixed top-0 w-full z-[60] border-b border-white/5">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar whitespace-nowrap gap-8">
        <div className="flex items-center space-x-2 flex-shrink-0">
          <MapPin className="w-2.5 h-2.5" />
          <span className="text-[8px] font-black uppercase tracking-widest italic">Johannesburg Crafted</span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Truck className="w-2.5 h-2.5" />
          <span className="text-[8px] font-black uppercase tracking-widest italic">Gauteng Delivery Over R500</span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Award className="w-2.5 h-2.5" />
          <span className="text-[8px] font-black uppercase tracking-widest italic">Butcher's Quality Guaranteed</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
