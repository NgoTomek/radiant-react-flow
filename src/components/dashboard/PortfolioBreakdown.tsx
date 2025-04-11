import React, { useEffect, useState, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { useGame } from '@/context/GameContext';

const PortfolioBreakdown = () => {
  const { assetData, assetPrices, portfolio, calculatePortfolioValue, formatCurrency } = useGame();
  const [chartData, setChartData] = useState<any[]>([]);
  const previousPortfolioRef = useRef(null);
  const previousAssetDataRef = useRef(null);
  
  // Update chart data whenever relevant portfolio data changes
  useEffect(() => {
    // Skip update if the data hasn't meaningfully changed
    if (
      JSON.stringify(previousPortfolioRef.current) === JSON.stringify(portfolio) &&
      JSON.stringify(previousAssetDataRef.current) === JSON.stringify(assetData)
    ) {
      return;
    }
    
    // Update refs
    previousPortfolioRef.current = JSON.parse(JSON.stringify(portfolio));
    previousAssetDataRef.current = JSON.parse(JSON.stringify(assetData));
    
    console.log("Updating portfolio breakdown with new data:", portfolio, assetData);
    
    // Calculate total portfolio value and breakdown
    const portfolioValue = calculatePortfolioValue();
    const cashValue = portfolio.cash;
    
    // Calculate value of each asset
    const assetValues: Record<string, { value: number, color: string, name: string }> = {};
    
    // Add each owned asset to the breakdown
    Object.entries(assetData.quantities).forEach(([asset, quantity]) => {
      if (quantity && quantity > 0) {
        const assetType = asset as 'stocks' | 'oil' | 'gold' | 'crypto';
        const value = quantity * assetPrices[assetType];
        
        console.log(`Asset ${assetType}: ${quantity} units at ${assetPrices[assetType]} = ${value}`);
        
        let color = '';
        let name = '';
        
        switch(assetType) {
          case 'stocks':
            color = '#A2AAAD';
            name = 'Stocks';
            break;
          case 'oil':
            color = '#607D8B';
            name = 'Oil';
            break;
          case 'gold':
            color = '#FFD700';
            name = 'Gold';
            break;
          case 'crypto':
            color = '#F7931A';
            name = 'Crypto';
            break;
        }
        
        assetValues[asset] = { value, color, name };
      }
    });
    
    // Create data array for pie chart
    const data = [
      { name: 'Cash', value: cashValue, color: '#4CAF50' },
      ...Object.values(assetValues)
    ].filter(item => item.value > 0);
    
    // If no assets, just show cash
    if (data.length === 0) {
      data.push({ name: 'Cash', value: cashValue, color: '#4CAF50' });
    }
    
    console.log("Updated chart data:", data);
    setChartData(data);
  }, [assetData, assetPrices, portfolio, calculatePortfolioValue]);
  
  // Force refresh on component mount
  useEffect(() => {
    const portfolioValue = calculatePortfolioValue();
    const cashValue = portfolio.cash;
    
    const data = [{ name: 'Cash', value: cashValue, color: '#4CAF50' }];
    setChartData(data);
    
    // Set initial refs
    previousPortfolioRef.current = JSON.parse(JSON.stringify(portfolio));
    previousAssetDataRef.current = JSON.parse(JSON.stringify(assetData));
  }, []);
  
  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-white font-bold mb-4">Portfolio Breakdown</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={30}
                fill="#8884d8"
                paddingAngle={2}
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                  name
                }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                  
                  return percent > 0.05 ? (
                    <text
                      x={x}
                      y={y}
                      fill="#FFFFFF"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={12}
                    >
                      {name}
                    </text>
                  ) : null;
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: '#0A1629',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#FFFFFF'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                layout="horizontal"
                formatter={(value, entry, index) => <span style={{ color: '#A3B1C6' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          {chartData.slice(0, 4).map((item, index) => (
            <div key={index} className="bg-[#0A1629] p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-[#A3B1C6] text-xs">{item.name}</span>
              </div>
              <div className="mt-1 text-white font-medium">
                {formatCurrency(item.value)}
              </div>
              <div className="text-xs text-[#A3B1C6]">
                {Math.round((item.value / calculatePortfolioValue()) * 100)}% of portfolio
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioBreakdown; 