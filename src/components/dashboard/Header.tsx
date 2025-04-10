import React from 'react';
import { Bell, Clock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  timer: string;
  round: number;
  totalRounds: number;
}

const Header = ({ timer, round, totalRounds }: HeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-white tracking-tight">PORTFOLIO PANIC</h1>
        <div className="bg-dashboard-accent text-white text-xs font-bold px-2 py-1 rounded-sm flex items-center gap-1">
          <Clock size={14} />
          <span>{timer}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1 bg-[#132237] px-3 py-1.5 rounded-md">
          <span className="text-dashboard-text-secondary text-sm">Round</span>
          <span className="text-white font-bold">{round}/{totalRounds}</span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-[#132237] text-dashboard-text-secondary hover:bg-[#1A2B45] hover:text-white">
          <Bell size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full bg-[#132237] text-dashboard-text-secondary hover:bg-[#1A2B45] hover:text-white">
          <HelpCircle size={18} />
        </Button>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-dashboard-accent">
          <img 
            src="/placeholder.svg" 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
