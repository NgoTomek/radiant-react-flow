import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/context/GameContext';

// Changed time ranges to round-based ranges
const timeRanges = ['1R', '3R', '5R', 'ALL'];

const NetWorthChart = () => {
  const [activeRange, setActiveRange] = useState('ALL');
  const { priceHistory, calculatePortfolioValue, formatCurrency, round, portfolio, portfolioHistory, totalRounds } = useGame();
  
  // Create chart data from actual portfolio history
  const portfolioValue = calculatePortfolioValue();
  const initialValue = 10000; // Starting value
  const returnPercentage = ((portfolioValue - initialValue) / initialValue) * 100;
  
  // Create chart data from the portfolioHistory with proper round labeling
  const chartData = useMemo(() => {
    if (!portfolioHistory || portfolioHistory.length === 0) {
      return [{ name: 'Start', value: initialValue, round: 0 }];
    }
    
    // Map each value in portfolio history to a data point with proper round label
    return portfolioHistory.map((value, index) => {
      // Different label formats:
      // - Index 0 is "Start" (initial value)
      // - Other indices correspond to the round number
      const roundLabel = index === 0 ? 'Start' : `R${index}`;
      
      return {
        name: roundLabel,
        value: Math.round(value),
        round: index
      };
    });
  }, [portfolioHistory, initialValue]);
  
  // Check if portfolio is up or down for highlighting
  const isPositiveReturn = returnPercentage >= 0;
  
  // Filter data based on selected round range
  const filteredData = useMemo(() => {
    if (activeRange === 'ALL' || chartData.length <= 1) {
      return chartData;
    }
    
    let roundsToShow: number;
    switch (activeRange) {
      case '1R':
        roundsToShow = 1;
        break;
      case '3R':
        roundsToShow = 3;
        break;
      case '5R':
        roundsToShow = 5;
        break;
      default:
        roundsToShow = chartData.length;
    }
    
    // For 1R, 3R, 5R - show the most recent N rounds, starting with "Start"
    // Always include "Start" (index 0) plus the most recent N rounds
    const result = [chartData[0]]; // Always include the starting point
    
    // Get the most recent rounds up to the specified number, but not exceeding current round
    const endRound = Math.min(round, chartData.length - 1);
    const startRound = Math.max(1, endRound - roundsToShow + 1);
    
    for (let i = startRound; i <= endRound; i++) {
      if (chartData[i]) {
        result.push(chartData[i]);
      }
    }
    
    return result;
  }, [chartData, activeRange, round]);

  // Calculate min/max values for chart display with padding
  const dataMin = Math.min(...filteredData.map(d => d.value));
  const dataMax = Math.max(...filteredData.map(d => d.value));
  const yDomain = [
    Math.max(0, dataMin - (dataMax - dataMin) * 0.1), // Lower bound with 10% padding
    dataMax + (dataMax - dataMin) * 0.1 // Upper bound with 10% padding
  ];

  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
      <CardHeader className="pb-0 pt-6 px-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Portfolio Value</h3>
            <div className="flex items-center mt-1">
              <span className="text-[#A3B1C6] text-sm mr-2">Return:</span>
              <span className={`text-sm font-medium ${isPositiveReturn ? 'text-dashboard-positive' : 'text-dashboard-negative'}`}>
                {isPositiveReturn ? '+' : ''}{returnPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="bg-[#0A1629] rounded-full p-1 flex space-x-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  activeRange === range 
                    ? 'bg-dashboard-accent text-white' 
                    : 'text-[#A3B1C6] hover:text-white'
                }`}
                onClick={() => setActiveRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-[#A3B1C6] text-sm">Current</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
          </div>
          <div className="text-[#A3B1C6] text-sm">
            <p>Round {round}/{totalRounds}</p>
            <p>History: {portfolioHistory.length} values</p>
          </div>
        </div>
        
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 5, left: 5, bottom: 5 }}
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
                domain={yDomain}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#A3B1C6', fontSize: 10 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
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
                labelFormatter={(label) => label === 'Start' ? 'Starting Value' : `Round ${label.replace('R', '')}`}
              />
              <ReferenceLine 
                y={initialValue} 
                stroke="#A3B1C6" 
                strokeDasharray="3 3" 
                label={{ 
                  value: 'Initial', 
                  position: 'right', 
                  fill: '#A3B1C6',
                  fontSize: 10 
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#FF6B00" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)" 
                activeDot={{ r: 6, fill: '#FF6B00', stroke: '#FFFFFF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Volatility indicators or insights */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {returnPercentage > 10 && (
            <Badge className="bg-dashboard-accent/20 text-dashboard-accent">
              Strong Performance
            </Badge>
          )}
          {returnPercentage < -10 && (
            <Badge className="bg-dashboard-negative/20 text-dashboard-negative">
              High Volatility
            </Badge>
          )}
          {portfolioValue > initialValue * 1.3 && (
            <Badge className="bg-dashboard-positive/20 text-dashboard-positive">
              +30% Benchmark Reached
            </Badge>
          )}
          {filteredData.length >= 2 &&
           Math.abs(filteredData[filteredData.length - 1]?.value - filteredData[filteredData.length - 2]?.value) / 
           filteredData[filteredData.length - 2]?.value > 0.05 && (
            <Badge className="bg-[#3A7BFF]/20 text-[#3A7BFF]">
              Recent Price Swing
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NetWorthChart;
