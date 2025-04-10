
import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

const PortfolioOverview = () => {
  return (
    <div className="bg-dashboard-card rounded-xl p-6 mb-4">
      <div className="flex flex-col">
        <h2 className="text-dashboard-text-secondary text-sm mb-2">Current Portfolio Value</h2>
        <div className="flex items-end gap-3 mb-4">
          <div className="text-4xl font-bold text-white">$2,560</div>
          <div className="flex items-center text-dashboard-negative mb-1">
            <ArrowDown size={16} />
            <span className="text-sm font-medium">3.8%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <MetricCard label="INVESTED" value="$2,875" />
          <MetricCard label="RETURNS" value="-$315" isNegative={true} />
          <MetricCard label="AVAILABLE" value="$540" />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ 
  label, 
  value, 
  isNegative = false 
}: { 
  label: string; 
  value: string; 
  isNegative?: boolean;
}) => {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-dashboard-text-secondary font-medium">{label}</span>
      <span className={`text-lg font-bold ${isNegative ? 'text-dashboard-negative' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
};

export default PortfolioOverview;
