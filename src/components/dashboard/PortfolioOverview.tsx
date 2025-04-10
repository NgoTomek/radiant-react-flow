import React from 'react';
import { ArrowUp, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useGame } from '@/context/GameContext';

const PortfolioOverview = () => {
  const { portfolio, calculatePortfolioValue, formatCurrency, gameResult } = useGame();
  
  // Calculate portfolio metrics
  const portfolioValue = calculatePortfolioValue();
  const initialCash = 10000; // Starting cash
  const invested = portfolioValue - portfolio.cash;
  const returns = portfolioValue - initialCash;
  const returnPercentage = ((portfolioValue - initialCash) / initialCash) * 100;
  
  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h2 className="text-[#A3B1C6] text-sm font-medium">Current Portfolio Value</h2>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-bold text-white">{formatCurrency(portfolioValue)}</div>
              <div className="flex items-center text-dashboard-positive mb-1">
                <ArrowUp size={16} />
                <span className="text-sm font-medium">+{returnPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <MetricCard 
              icon={<DollarSign size={20} className="text-dashboard-accent" />}
              label="INVESTED" 
              value={formatCurrency(invested)} 
            />
            <MetricCard 
              icon={<TrendingUp size={20} className="text-dashboard-positive" />}
              label="RETURNS" 
              value={`${returns >= 0 ? '+' : ''}${formatCurrency(returns)}`} 
              isPositive={returns >= 0}
              isNegative={returns < 0}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <MetricCard 
              icon={<Wallet size={20} className="text-[#A3B1C6]" />}
              label="AVAILABLE CASH" 
              value={formatCurrency(portfolio.cash)} 
            />
            <div className="bg-[#0A1629] rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="text-[#A3B1C6] text-xs font-medium">TOTAL NET WORTH</div>
                <div className="text-xl font-bold text-white">{formatCurrency(portfolioValue)}</div>
              </div>
              <div className="flex items-center text-dashboard-positive">
                <ArrowUp size={14} />
                <span className="text-xs font-medium">+{returnPercentage.toFixed(1)}%</span>
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
