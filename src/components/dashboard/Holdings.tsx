import React from 'react';
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';

interface HoldingsProps {
  onAssetClick: (asset: string) => void;
}

const Holdings = ({ onAssetClick }: HoldingsProps) => {
  const { assetPrices, assetData, formatCurrency, priceHistory } = useGame();

  // Create holdings array from game state
  const holdings = Object.keys(assetPrices).map(assetKey => {
    const asset = assetKey as 'stocks' | 'oil' | 'gold' | 'crypto';
    const history = priceHistory[asset] || [];
    const price = assetPrices[asset];
    const quantity = assetData.quantities[asset] || 0;
    const value = quantity * price;
    
    // Calculate change percentage based on price history
    let change = 0;
    if (history.length > 1) {
      const previousPrice = history[history.length - 2];
      change = ((price - previousPrice) / previousPrice) * 100;
    }
    
    // Get color and symbol based on asset type
    let color, symbol;
    switch(asset) {
      case 'stocks':
        color = '#A2AAAD';
        symbol = 'STCK';
        break;
      case 'oil':
        color = '#000000';
        symbol = 'OIL';
        break;
      case 'gold':
        color = '#FFD700';
        symbol = 'GLD';
        break;
      case 'crypto':
        color = '#F7931A';
        symbol = 'BTC';
        break;
      default:
        color = '#A2AAAD';
        symbol = asset.substring(0, 4).toUpperCase();
    }
    
    return {
      id: asset,
      name: asset.charAt(0).toUpperCase() + asset.slice(1),
      symbol,
      price: formatCurrency(price),
      change,
      value: formatCurrency(value),
      color,
      quantity
    };
  });

  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
      <CardHeader className="p-6 pb-0">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Assets</h2>
          <Button variant="ghost" size="sm" className="text-[#A3B1C6] text-sm hover:text-white p-0">
            <span>See All</span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {holdings.map((holding) => (
            <HoldingItem 
              key={holding.id} 
              holding={holding} 
              onClick={() => onAssetClick(holding.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const HoldingItem = ({ holding, onClick }: { 
  holding: { 
    id: string;
    name: string; 
    symbol: string; 
    price: string; 
    change: number; 
    value: string; 
    color: string;
    quantity: number;
  };
  onClick: () => void;
}) => {
  const isNegative = holding.change < 0;
  
  return (
    <div 
      className="flex justify-between items-center hover:bg-[#1A2B45] p-2 rounded-lg transition-colors duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" 
             style={{ backgroundColor: `${holding.color}20`, color: holding.color }}>
          <span className="font-bold text-xs">{holding.symbol}</span>
        </div>
        <div>
          <div className="text-white font-medium">{holding.name}</div>
          <div className="text-[#A3B1C6] text-sm">{holding.price}</div>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <div className="text-white font-medium">{holding.value}</div>
        <div className={`flex items-center ${isNegative ? 'text-dashboard-negative' : 'text-dashboard-positive'}`}>
          {isNegative ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
          <span className="text-xs font-medium">{Math.abs(holding.change).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default Holdings;
