
import React from 'react';
import Header from './Header';
import PortfolioOverview from './PortfolioOverview';
import Holdings from './Holdings';
import NetWorthChart from './NetWorthChart';

const Dashboard = () => {
  return (
    <div className="bg-dashboard-background min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <PortfolioOverview />
            <Holdings />
          </div>
          <div>
            <NetWorthChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
