
import React from 'react';
import Header from './Header';
import PortfolioOverview from './PortfolioOverview';
import Holdings from './Holdings';
import NetWorthChart from './NetWorthChart';
import MarketNews from './MarketNews';
import GameControls from './GameControls';
import { Separator } from '@/components/ui/separator';

interface DashboardProps {
  onEndGame?: () => void;
}

const Dashboard = ({ onEndGame }: DashboardProps) => {
  return (
    <div className="bg-dashboard-background min-h-screen text-white">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          <div className="md:col-span-8 space-y-6">
            <PortfolioOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Holdings />
              <MarketNews />
            </div>
          </div>
          <div className="md:col-span-4 space-y-6">
            <NetWorthChart />
            <GameControls onEndGame={onEndGame} />
          </div>
        </div>
        <div className="mt-6 py-6">
          <Separator className="bg-[#1A2B45]" />
          <div className="flex justify-between items-center pt-4 text-dashboard-text-secondary text-sm">
            <div>© 2025 Portfolio Panic</div>
            <div>v1.0.0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
