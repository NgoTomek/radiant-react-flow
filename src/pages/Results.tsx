import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, RotateCcw, Share2, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGame } from '@/context/GameContext';

const Results = () => {
  const navigate = useNavigate();
  const { gameResult, formatCurrency, priceHistory, achievements, startGame } = useGame();
  
  // Ensure we have valid results to display
  useEffect(() => {
    if (gameResult.finalValue === 0) {
      // If no game results, navigate back to main menu
      navigate('/');
    }
  }, [gameResult, navigate]);
  
  // Create a data series for the performance chart based on price history
  const performanceData = React.useMemo(() => {
    // Use the longest history to determine number of data points
    const histories = Object.values(priceHistory);
    const maxLength = Math.max(...histories.map(h => h.length));
    
    // Create chart data points
    const chartData = [];
    for (let i = 0; i < maxLength; i++) {
      // For each round, calculate the portfolio value at that point
      // This is a simplified version since we don't have the actual portfolio history
      let estimatedValue = 10000; // Start with initial cash
      
      if (i === maxLength - 1) {
        // Use actual final value for the last point
        estimatedValue = gameResult.finalValue;
      } else {
        // For other points, use a synthetic growth curve
        const progress = i / (maxLength - 1);
        const growthFactor = 1 + (gameResult.returnPercentage / 100) * progress;
        estimatedValue = Math.round(10000 * growthFactor);
        
        // Add some natural variation
        const variation = (Math.random() * 0.06) - 0.03; // ±3%
        estimatedValue = Math.round(estimatedValue * (1 + variation));
      }
      
      chartData.push({
        round: i + 1,
        value: estimatedValue
      });
    }
    
    return chartData;
  }, [priceHistory, gameResult]);
  
  // Get count of unlocked achievements
  const unlockedAchievements = Object.values(achievements).filter(a => a.unlocked).length;
  const totalAchievements = Object.values(achievements).length;

  // Handle play again
  const handlePlayAgain = () => {
    startGame();
    navigate('/game');
  };
  
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
                    <div className={`flex items-center ${gameResult.returnPercentage >= 0 ? 'text-dashboard-positive' : 'text-dashboard-negative'} ml-2`}>
                      {gameResult.returnPercentage >= 0 ? (
                        <><ArrowUp size={16} />+{gameResult.returnPercentage.toFixed(1)}%</>
                      ) : (
                        <><ArrowDown size={16} />{gameResult.returnPercentage.toFixed(1)}%</>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#0A1629] p-4 rounded-lg">
                  <p className="text-dashboard-text-secondary text-sm">Best Investment</p>
                  <p className="font-bold mt-1">{gameResult.bestAsset || "None"}</p>
                  {gameResult.bestReturn ? (
                    <p className="text-dashboard-positive text-sm">+{gameResult.bestReturn.toFixed(1)}% gain</p>
                  ) : (
                    <p className="text-dashboard-text-secondary text-sm">No investments made</p>
                  )}
                </div>
                
                <div className="bg-[#0A1629] p-4 rounded-lg">
                  <p className="text-dashboard-text-secondary text-sm">Worst Investment</p>
                  <p className="font-bold mt-1">{gameResult.worstAsset || "None"}</p>
                  {gameResult.worstReturn ? (
                    <p className="text-dashboard-negative text-sm">{gameResult.worstReturn.toFixed(1)}% loss</p>
                  ) : (
                    <p className="text-dashboard-text-secondary text-sm">No investments made</p>
                  )}
                </div>
                
                {unlockedAchievements > 0 && (
                  <div className="bg-[#0A1629] p-4 rounded-lg">
                    <p className="text-dashboard-text-secondary text-sm">Achievements</p>
                    <div className="flex items-center mt-1">
                      <Trophy className="text-dashboard-accent mr-2" size={18} />
                      <p className="font-bold">{unlockedAchievements} of {totalAchievements} Unlocked</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/">
            <Button variant="outline" className="w-full bg-[#132237] border-[#1A2B45] text-white hover:bg-[#1A2B45]">
              <Home className="mr-2" size={16} />
              Main Menu
            </Button>
          </Link>
          <Button 
            className="w-full bg-dashboard-accent hover:bg-dashboard-accent-hover"
            onClick={handlePlayAgain}
          >
            <RotateCcw className="mr-2" size={16} />
            Play Again
          </Button>
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
