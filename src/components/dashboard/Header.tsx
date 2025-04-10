
import React from 'react';
import { Bell } from 'lucide-react';

const Header = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">PORTFOLIO PANIC</h1>
        <div className="bg-dashboard-accent text-white text-xs font-bold px-2 py-0.5 rounded-sm">
          0:52
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-dashboard-card flex items-center justify-center">
          <Bell size={18} className="text-dashboard-text-secondary" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-dashboard-accent">
            <img 
              src="/lovable-uploads/9de91aef-66c0-44d3-b82f-65828d7d56e7.png" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
