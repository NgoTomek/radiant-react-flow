
import React from 'react';
import { ArrowDown, ArrowUp, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PortfolioOverview = () => {
  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h2 className="text-[#A3B1C6] text-sm font-medium">Current Portfolio Value</h2>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-bold text-white">$29,500</div>
              <div className="flex items-center text-dashboard-positive mb-1">
                <ArrowUp size={16} />
                <span className="text-sm font-medium">+3.8%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <MetricCard 
              icon={<DollarSign size={20} className="text-dashboard-accent" />}
              label="INVESTED" 
              value="$20,000" 
            />
            <MetricCard 
              icon={<TrendingUp size={20} className="text-dashboard-positive" />}
              label="RETURNS" 
              value="+$9,500" 
              isPositive={true}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <MetricCard 
              icon={<Wallet size={20} className="text-[#A3B1C6]" />}
              label="AVAILABLE CASH" 
              value="$1,050" 
            />
            <div className="bg-[#0A1629] rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-[#A3B1C6] text-xs font-medium">TOTAL NET WORTH</div>
                <div className="text-xl font-bold text-white">$30,550</div>
              </div>
              <div className="flex items-center text-dashboard-positive">
                <ArrowUp size={14} />
                <span className="text-xs font-medium">+52.8%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MetricCard = ({ 
  icon,
  label, 
  value, 
  isPositive = false,
  isNegative = false
}: { 
  icon: React.ReactNode;
  label: string; 
  value: string; 
  isPositive?: boolean;
  isNegative?: boolean;
}) => {
  let textColor = "text-white";
  if (isPositive) textColor = "text-dashboard-positive";
  if (isNegative) textColor = "text-dashboard-negative";
  
  return (
    <div className="bg-[#0A1629] rounded-lg p-4 flex items-center justify-between">
      <div>
        <div className="text-[#A3B1C6] text-xs font-medium">{label}</div>
        <div className={`text-xl font-bold ${textColor}`}>{value}</div>
      </div>
      <div className="rounded-full bg-[#132237] p-2">
        {icon}
      </div>
    </div>
  );
};

export default PortfolioOverview;
