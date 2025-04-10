import React from 'react';
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, TrendingDown, Wallet, PieChart, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useGame } from '@/context/GameContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PortfolioOverview = () => {
  const { portfolio, calculatePortfolioValue, formatCurrency, assetData, assetPrices, gameResult } = useGame();
  
  // Calculate portfolio metrics
  const portfolioValue = calculatePortfolioValue();
  const initialCash = 10000; // Starting cash
  const invested = portfolioValue - portfolio.cash;
  const returns = portfolioValue - initialCash;
  const returnPercentage = ((portfolioValue - initialCash) / initialCash) * 100;
  
  // Calculate portfolio risk level
  const calculateRiskLevel = () => {
    // Determine risk based on asset allocation
    let riskScore = 0;
    let totalInvested = 0;
    
    // Calculate total invested amount
    Object.entries(assetData.quantities).forEach(([asset, quantity]) => {
      if (quantity && quantity > 0) {
        const assetValue = quantity * assetPrices[asset as keyof typeof assetPrices];
        totalInvested += assetValue;
      }
    });
    
    if (totalInvested === 0) return 'Low'; // All cash
    
    // Calculate risk weights based on asset allocations
    const cryptoValue = (assetData.quantities.crypto || 0) * assetPrices.crypto;
    const stocksValue = (assetData.quantities.stocks || 0) * assetPrices.stocks;
    const oilValue = (assetData.quantities.oil || 0) * assetPrices.oil;
    const goldValue = (assetData.quantities.gold || 0) * assetPrices.gold;
    
    // Apply risk weights (crypto highest, gold lowest)
    riskScore += (cryptoValue / totalInvested) * 5; // Highest risk
    riskScore += (stocksValue / totalInvested) * 3; // Medium-high risk
    riskScore += (oilValue / totalInvested) * 2;    // Medium risk
    riskScore += (goldValue / totalInvested) * 1;   // Low risk
    
    // Add risk for short positions
    Object.values(assetData.shorts).forEach(position => {
      if (position && position.active) {
        riskScore += 2; // Shorts add significant risk
      }
    });
    
    // Categorize risk level
    if (riskScore >= 4) return 'Very High';
    if (riskScore >= 3) return 'High';
    if (riskScore >= 2) return 'Medium';
    if (riskScore >= 1) return 'Low';
    return 'Very Low';
  };
  
  const riskLevel = calculateRiskLevel();
  
  // Determine most and least valuable holdings
  const calculateTopHoldings = () => {
    const holdings = Object.entries(assetData.quantities)
      .filter(([_, quantity]) => quantity && quantity > 0)
      .map(([asset, quantity]) => ({
        asset,
        quantity,
        value: quantity! * assetPrices[asset as keyof typeof assetPrices]
      }))
      .sort((a, b) => b.value - a.value);
    
    return {
      top: holdings.length > 0 ? holdings[0] : null,
      bottom: holdings.length > 0 ? holdings[holdings.length - 1] : null
    };
  };
  
  const topHoldings = calculateTopHoldings();
  
  // Calculate diversification percentage
  const calculateDiversification = () => {
    const assetTypes = Object.keys(assetPrices).length;
    const ownedAssetTypes = Object.entries(assetData.quantities)
      .filter(([_, quantity]) => quantity && quantity > 0)
      .length;
    
    return Math.round((ownedAssetTypes / assetTypes) * 100);
  };
  
  const diversificationPercentage = calculateDiversification();
  
  // Check if portfolio has any active shorts
  const hasShorts = Object.values(assetData.shorts).some(position => position && position.active);
  
  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h2 className="text-[#A3B1C6] text-sm font-medium">Current Portfolio Value</h2>
            <div className="flex items-end gap-3">
              <div className="text-4xl font-bold text-white">{formatCurrency(portfolioValue)}</div>
              <div className={`flex items-center mb-1 ${returns >= 0 ? 'text-dashboard-positive' : 'text-dashboard-negative'}`}>
                {returns >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                <span className="text-sm font-medium">{returns >= 0 ? '+' : ''}{returnPercentage.toFixed(1)}%</span>
              </div>
            </div>
            
            {/* Risk indicator */}
            <div className="flex items-center gap-2 mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-[#A3B1C6]">
                      <span>Risk Level:</span>
                      <span className={`font-medium ${
                        riskLevel === 'Very High' ? 'text-dashboard-negative' :
                        riskLevel === 'High' ? 'text-dashboard-negative/70' :
                        riskLevel === 'Medium' ? 'text-[#FFD700]' :
                        'text-dashboard-positive'
                      }`}>{riskLevel}</span>
                      {riskLevel === 'High' || riskLevel === 'Very High' ? 
                        <AlertTriangle size={12} className="text-dashboard-negative" /> : null}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Based on your asset allocation and trading activity</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Diversification indicator */}
              <div className="w-px h-3 bg-[#1A2B45]"></div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-[#A3B1C6]">
                      <span>Diversification:</span>
                      <span className={`font-medium ${
                        diversificationPercentage >= 75 ? 'text-dashboard-positive' :
                        diversificationPercentage >= 50 ? 'text-[#FFD700]' :
                        'text-dashboard-negative'
                      }`}>{diversificationPercentage}%</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of available asset types in your portfolio</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Short position indicator */}
              {hasShorts && (
                <>
                  <div className="w-px h-3 bg-[#1A2B45]"></div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 text-xs text-dashboard-negative">
                          <span>Short Positions</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You have active short positions in your portfolio</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <MetricCard 
              icon={<DollarSign size={20} className="text-dashboard-accent" />}
              label="INVESTED" 
              value={formatCurrency(invested)} 
              percentage={Math.round((invested / portfolioValue) * 100)}
              tooltip="Amount of your portfolio invested in assets"
            />
            <MetricCard 
              icon={returns >= 0 ? 
                <TrendingUp size={20} className="text-dashboard-positive" /> : 
                <TrendingDown size={20} className="text-dashboard-negative" />
              }
              label="RETURNS" 
              value={`${returns >= 0 ? '+' : ''}${formatCurrency(returns)}`} 
              percentage={Math.abs(returnPercentage)}
              isPositive={returns >= 0}
              isNegative={returns < 0}
              tooltip="Net profit or loss since starting"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <MetricCard 
              icon={<Wallet size={20} className="text-[#A3B1C6]" />}
              label="AVAILABLE CASH" 
              value={formatCurrency(portfolio.cash)} 
              percentage={Math.round((portfolio.cash / portfolioValue) * 100)}
              tooltip="Cash available for new investments"
            />
            <div className="bg-[#0A1629] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="text-[#A3B1C6] text-xs font-medium">PORTFOLIO BREAKDOWN</div>
                <div className="mt-1 space-y-1.5">
                  {topHoldings.top && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#A3B1C6]">Largest: {topHoldings.top.asset}</span>
                      <span className="text-xs text-white">{formatCurrency(topHoldings.top.value)}</span>
                    </div>
                  )}
                  {Object.values(assetData.shorts).some(position => position && position.active) && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#A3B1C6]">Short Positions</span>
                      <span className="text-xs text-dashboard-negative">Active</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#A3B1C6]">Cash</span>
                    <span className="text-xs text-white">{formatCurrency(portfolio.cash)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex -space-x-1">
                  {/* Asset type indicators */}
                  {Object.entries(assetData.quantities).filter(([_, quantity]) => quantity && quantity > 0).map(([asset]) => {
                    let bgColor;
                    switch(asset) {
                      case 'stocks': bgColor = 'bg-[#A2AAAD]'; break;
                      case 'oil': bgColor = 'bg-gray-700'; break;
                      case 'gold': bgColor = 'bg-[#FFD700]'; break;
                      case 'crypto': bgColor = 'bg-[#F7931A]'; break;
                      default: bgColor = 'bg-gray-500';
                    }
                    
                    return (
                      <div key={asset} className={`w-4 h-4 rounded-full ${bgColor} border border-[#0A1629]`}></div>
                    );
                  })}
                </div>
                <PieChart size={16} className="text-[#A3B1C6]" />
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
  percentage,
  isPositive = false,
  isNegative = false,
  tooltip
}: { 
  icon: React.ReactNode;
  label: string; 
  value: string; 
  percentage?: number;
  isPositive?: boolean;
  isNegative?: boolean;
  tooltip?: string;
}) => {
  let textColor = "text-white";
  if (isPositive) textColor = "text-dashboard-positive";
  if (isNegative) textColor = "text-dashboard-negative";
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-[#0A1629] rounded-lg p-4 flex items-center justify-between cursor-help">
            <div>
              <div className="text-[#A3B1C6] text-xs font-medium">{label}</div>
              <div className={`text-xl font-bold ${textColor}`}>{value}</div>
              {percentage !== undefined && (
                <div className="text-xs text-[#A3B1C6] mt-0.5">{percentage}% of portfolio</div>
              )}
            </div>
            <div className="rounded-full bg-[#132237] p-2">
              {icon}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PortfolioOverview;
