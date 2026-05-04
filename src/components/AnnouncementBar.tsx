import React from 'react';
import { Truck, MapPin, Award } from 'lucide-react';

const AnnouncementBar = () => {
  return (
    <div className="bg-brand-rust text-white py-2 px-6 fixed top-0 w-full z-[60] border-b border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
        <div className="flex items-center space-x-2">
          <MapPin className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-widest italic">Johannesburg Crafted</span>
        </div>
        <div className="flex items-center space-x-2">
          <Truck className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-widest italic">Nationwide Delivery over R500</span>
        </div>
        <div className="flex items-center space-x-2">
          <Award className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-widest italic">Butcher's Quality Guaranteed</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
