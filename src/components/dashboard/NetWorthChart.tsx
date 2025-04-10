import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useGame } from '@/context/GameContext';

const timeRanges = ['1D', '1W', '1M', '3M', 'ALL'];

const NetWorthChart = () => {
  const [activeRange, setActiveRange] = useState('ALL');
  const { priceHistory, calculatePortfolioValue, formatCurrency } = useGame();
  
  // Create chart data from portfolio history
  const portfolioValue = calculatePortfolioValue();
  const initialValue = 10000; // Starting value
  const returnPercentage = ((portfolioValue - initialValue) / initialValue) * 100;
  
  // Create sample historical data based on price history
  // In a real implementation, this would track portfolio value over time
  const chartData = useMemo(() => {
    // Use the longest price history as a reference
    const maxHistoryLength = Math.max(
      priceHistory.stocks?.length || 0,
      priceHistory.oil?.length || 0,
      priceHistory.gold?.length || 0,
      priceHistory.crypto?.length || 0
    );
    
    if (maxHistoryLength <= 1) {
      return [{ name: 'Start', value: initialValue }];
    }
    
    // Create data points based on price history trends
    return Array.from({ length: maxHistoryLength }).map((_, index) => {
      // Simulate portfolio value based on asset price trends
      let simulatedValue;
      if (index === 0) {
        simulatedValue = initialValue;
      } else if (index === maxHistoryLength - 1) {
        simulatedValue = portfolioValue;
      } else {
        // Create a somewhat realistic curve between start and current
        const progress = index / (maxHistoryLength - 1);
        const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        simulatedValue = initialValue + (portfolioValue - initialValue) * progress * randomFactor;
      }
      
      return {
        name: index === 0 ? 'Start' : `Round ${index}`,
        value: Math.round(simulatedValue)
      };
    });
  }, [priceHistory, portfolioValue, initialValue]);

  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
      <CardHeader className="p-6 pb-0">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Net Worth History</h2>
          <div className="flex gap-1 bg-[#0A1629] rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeRange === range
                    ? 'bg-dashboard-accent text-white'
                    : 'text-[#A3B1C6] hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-[#A3B1C6] text-sm">Current</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-[#0A1629] rounded-lg">
            <span className="text-dashboard-positive text-sm font-medium">+{returnPercentage.toFixed(1)}%</span>
          </div>
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#A3B1C6', fontSize: 10 }}
              />
              <YAxis 
                hide={true}
                domain={['dataMin - 2000', 'dataMax + 2000']} 
              />
              <CartesianGrid 
                vertical={false} 
                horizontal={true}
                strokeDasharray="3 3" 
                stroke="#1A2B45"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#132237', 
                  borderColor: '#1A2B45',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
                labelStyle={{ color: '#A3B1C6' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#FF6B00" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetWorthChart;
