import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, RotateCcw, Share2, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGame } from '@/context/GameContext';

const Results = () => {
  const { gameResult, formatCurrency, priceHistory } = useGame();
  
  // Create a data series for the performance chart based on price history
  const performanceData = priceHistory.stocks?.map((price, index) => ({
    round: index + 1,
    value: 20000 + index * 1000 + Math.random() * 2000
  })) || [];
  
  // Add final value
  performanceData.push({
    round: performanceData.length + 1,
    value: gameResult.finalValue
  });

  return (
    <div className="min-h-screen bg-dashboard-background text-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Game Over!</h1>
          <p className="text-dashboard-text-secondary">Your final portfolio performance</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#132237] border-none rounded-xl overflow-hidden col-span-1 lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Portfolio Performance</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceData}
                    margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="round" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#A3B1C6', fontSize: 10 }}
                      label={{ value: 'Round', position: 'insideBottom', fill: '#A3B1C6', offset: -5 }}
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
                      labelFormatter={(value) => `Round ${value}`}
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
          
          <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Final Stats</h2>
              
              <div className="space-y-4">
                <div className="bg-[#0A1629] p-4 rounded-lg">
                  <p className="text-dashboard-text-secondary text-sm">Final Portfolio Value</p>
                  <div className="flex items-center mt-1">
                    <p className="text-2xl font-bold">{formatCurrency(gameResult.finalValue)}</p>
                    <div className="flex items-center text-dashboard-positive ml-2">
                      <ArrowUp size={16} />
                      <span className="text-sm">+{gameResult.returnPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#0A1629] p-4 rounded-lg">
                  <p className="text-dashboard-text-secondary text-sm">Best Investment</p>
                  <p className="font-bold mt-1">{gameResult.bestAsset}</p>
                  <p className="text-dashboard-positive text-sm">+{gameResult.bestReturn.toFixed(1)}% gain</p>
                </div>
                
                <div className="bg-[#0A1629] p-4 rounded-lg">
                  <p className="text-dashboard-text-secondary text-sm">Worst Investment</p>
                  <p className="font-bold mt-1">{gameResult.worstAsset}</p>
                  <p className="text-dashboard-negative text-sm">{gameResult.worstReturn.toFixed(1)}% loss</p>
                </div>
                
                <div className="bg-[#0A1629] p-4 rounded-lg">
                  <p className="text-dashboard-text-secondary text-sm">Achievement Unlocked</p>
                  <div className="flex items-center mt-1">
                    <Trophy className="text-dashboard-accent mr-2" size={18} />
                    <p className="font-bold">Market Master</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/" className="block">
            <Button variant="outline" className="w-full bg-[#132237] border-[#1A2B45] text-white hover:bg-[#1A2B45]">
              <Home className="mr-2" size={16} />
              Main Menu
            </Button>
          </Link>
          <Link to="/game" className="block">
            <Button className="w-full bg-dashboard-accent hover:bg-dashboard-accent-hover">
              <RotateCcw className="mr-2" size={16} />
              Play Again
            </Button>
          </Link>
          <Button variant="outline" className="bg-[#132237] border-[#1A2B45] text-white hover:bg-[#1A2B45]">
            <Share2 className="mr-2" size={16} />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
