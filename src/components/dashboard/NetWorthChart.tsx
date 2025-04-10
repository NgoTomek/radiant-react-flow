import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/context/GameContext';

const timeRanges = ['1D', '1W', '1M', '3M', 'ALL'];

const NetWorthChart = () => {
  const [activeRange, setActiveRange] = useState('ALL');
  const { priceHistory, calculatePortfolioValue, formatCurrency, round, portfolio } = useGame();
  
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
    
    // Track more realistic portfolio value history
    let cashHistory = [initialValue];
    let investedValue = 0;
    
    // Starting portfolio for simulation
    let simulatedPortfolio = {
      cash: initialValue,
      stocks: 0,
      oil: 0,
      gold: 0,
      crypto: 0
    };
    
    // Simulate investment decisions throughout history
    for (let i = 1; i < maxHistoryLength; i++) {
      // Simulate some trading activity
      const tradeChance = 0.3; // 30% chance of trading each round
      if (Math.random() < tradeChance) {
        // Pick a random asset to trade
        const assets = ['stocks', 'oil', 'gold', 'crypto'];
        const assetToTrade = assets[Math.floor(Math.random() * assets.length)] as keyof typeof simulatedPortfolio;
        
        // Buy or sell decision
        const isBuy = simulatedPortfolio.cash > 0 && Math.random() < 0.7; // More likely to buy
        
        if (isBuy && simulatedPortfolio.cash > 0) {
          // Buy some amount (10-50% of available cash)
          const amountToSpend = simulatedPortfolio.cash * (0.1 + Math.random() * 0.4);
          const price = priceHistory[assetToTrade]?.[i] || priceHistory[assetToTrade]?.[0] || 1;
          
          const quantity = amountToSpend / price;
          simulatedPortfolio[assetToTrade] += quantity;
          simulatedPortfolio.cash -= amountToSpend;
        } 
        else if (!isBuy && simulatedPortfolio[assetToTrade] > 0) {
          // Sell some amount (10-70% of holdings)
          const amountToSell = simulatedPortfolio[assetToTrade] * (0.1 + Math.random() * 0.6);
          const price = priceHistory[assetToTrade]?.[i] || priceHistory[assetToTrade]?.[0] || 1;
          
          const value = amountToSell * price;
          simulatedPortfolio[assetToTrade] -= amountToSell;
          simulatedPortfolio.cash += value;
        }
      }
      
      // Calculate total value after trades
      const totalValue = simulatedPortfolio.cash +
        simulatedPortfolio.stocks * (priceHistory.stocks?.[i] || priceHistory.stocks?.[0] || 0) +
        simulatedPortfolio.oil * (priceHistory.oil?.[i] || priceHistory.oil?.[0] || 0) +
        simulatedPortfolio.gold * (priceHistory.gold?.[i] || priceHistory.gold?.[0] || 0) +
        simulatedPortfolio.crypto * (priceHistory.crypto?.[i] || priceHistory.crypto?.[0] || 0);
      
      cashHistory.push(totalValue);
    }
    
    // If we're in the middle of a game, make the last value match the current portfolio
    if (round > 1 && maxHistoryLength > 0) {
      cashHistory[cashHistory.length - 1] = portfolioValue;
    }
    
    // Create chart data points
    return cashHistory.map((value, index) => ({
      name: index === 0 ? 'Start' : `Round ${index}`,
      value: Math.round(value),
      time: `Day ${index + 1}`
    }));
  }, [priceHistory, portfolioValue, initialValue, round]);

  // Check if portfolio is up or down for highlighting
  const isPositiveReturn = returnPercentage >= 0;
  
  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (activeRange === 'ALL' || chartData.length <= 1) {
      return chartData;
    }
    
    let dataPoints: number;
    switch (activeRange) {
      case '1D':
        dataPoints = 1;
        break;
      case '1W':
        dataPoints = 7;
        break;
      case '1M':
        dataPoints = 30;
        break;
      case '3M':
        dataPoints = 90;
        break;
      default:
        dataPoints = chartData.length;
    }
    
    // Take the most recent N data points
    return chartData.slice(-Math.min(dataPoints, chartData.length));
  }, [chartData, activeRange]);

  // Calculate min/max values for chart display with padding
  const dataMin = Math.min(...filteredData.map(d => d.value));
  const dataMax = Math.max(...filteredData.map(d => d.value));
  const yDomain = [
    Math.max(0, dataMin - (dataMax - dataMin) * 0.1), // Lower bound with 10% padding
    dataMax + (dataMax - dataMin) * 0.1 // Upper bound with 10% padding
  ];

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
          <div className="flex items-center gap-2">
            <Badge 
              className={`px-2 py-1 ${isPositiveReturn 
                ? 'bg-dashboard-positive/20 text-dashboard-positive' 
                : 'bg-dashboard-negative/20 text-dashboard-negative'}`}
            >
              {isPositiveReturn ? '+' : ''}{returnPercentage.toFixed(1)}%
            </Badge>
            <Badge 
              className="px-2 py-1 bg-[#0A1629] text-[#A3B1C6]"
            >
              Cash: {formatCurrency(portfolio.cash)}
            </Badge>
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
          {Math.abs(filteredData[filteredData.length - 1]?.value - filteredData[filteredData.length - 2]?.value) / filteredData[filteredData.length - 2]?.value > 0.05 && (
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
