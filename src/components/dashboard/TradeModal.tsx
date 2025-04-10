import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useGame } from '@/context/GameContext';

interface TradeModalProps {
  asset: string;
  onClose: () => void;
}

const TradeModal = ({ asset, onClose }: TradeModalProps) => {
  const { assetPrices, assetData, portfolio, handleTrade, formatCurrency } = useGame();
  
  const [amount, setAmount] = useState(100);
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  
  const assetKey = asset as 'stocks' | 'oil' | 'gold' | 'crypto';
  const price = assetPrices[assetKey];
  const quantity = assetData.quantities[assetKey] || 0;
  const value = quantity * price;
  
  // Calculate how many units the current amount will buy
  const unitsToTrade = amount / price;
  
  // Maximum amount that can be spent
  const maxBuyAmount = portfolio.cash;
  const maxSellAmount = value;
  
  // Handle amount change
  const increaseAmount = () => {
    const maxAmount = action === 'buy' ? maxBuyAmount : maxSellAmount;
    setAmount(prev => Math.min(prev + 100, maxAmount));
  };
  
  const decreaseAmount = () => {
    setAmount(prev => Math.max(prev - 100, 100));
  };
  
  // Handle trade submission
  const submitTrade = () => {
    if (action === 'buy') {
      handleTrade(assetKey, 'buy', amount / price); // Buy specified quantity
    } else {
      // Calculate percentage of holdings to sell
      const percentToSell = amount / (value || 1);
      handleTrade(assetKey, 'sell', Math.min(1, percentToSell)); // Sell percentage of holdings
    }
    onClose();
  };
  
  // Reset amount when switching actions
  useEffect(() => {
    setAmount(100);
  }, [action]);
  
  // Get asset name and symbol
  const getAssetDetails = () => {
    switch(assetKey) {
      case 'stocks':
        return { name: 'Stocks', symbol: 'STCK' };
      case 'oil':
        return { name: 'Oil', symbol: 'OIL' };
      case 'gold':
        return { name: 'Gold', symbol: 'GLD' };
      case 'crypto':
        return { name: 'Bitcoin', symbol: 'BTC' };
      default:
        return { name: assetKey, symbol: assetKey.substring(0, 4).toUpperCase() };
    }
  };
  
  const assetDetails = getAssetDetails();
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#132237] border-[#1A2B45] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Trade {assetDetails.name} ({assetDetails.symbol})</DialogTitle>
          <DialogDescription className="text-dashboard-text-secondary">
            Current Price: {formatCurrency(price)}
            {assetData.quantities[assetKey] > 0 && 
              ` • You Own: ${assetKey === 'crypto' ? assetData.quantities[assetKey]?.toFixed(4) : assetData.quantities[assetKey]} units`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Action Tabs */}
          <div className="flex w-full rounded-lg bg-[#0A1629] p-1">
            <button
              className={`flex-1 py-2 rounded-md transition-colors ${
                action === 'buy' ? 'bg-dashboard-accent text-white' : 'text-[#A3B1C6]'
              }`}
              onClick={() => setAction('buy')}
            >
              Buy
            </button>
            <button
              className={`flex-1 py-2 rounded-md transition-colors ${
                action === 'sell' ? 'bg-dashboard-accent text-white' : 'text-[#A3B1C6]'
              }`}
              onClick={() => setAction('sell')}
              disabled={!assetData.quantities[assetKey]}
            >
              Sell
            </button>
          </div>
          
          {/* Amount Selector */}
          <div className="bg-[#0A1629] p-4 rounded-lg">
            <p className="text-dashboard-text-secondary text-sm mb-1">Amount</p>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={decreaseAmount}
                disabled={amount <= 100}
                className="rounded-full bg-[#1A2B45] text-white hover:bg-[#232E45] disabled:opacity-50"
              >
                <Minus size={18} />
              </Button>
              <div className="flex-1 text-center text-2xl font-bold">{formatCurrency(amount)}</div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={increaseAmount}
                disabled={action === 'buy' ? amount >= maxBuyAmount : amount >= maxSellAmount}
                className="rounded-full bg-[#1A2B45] text-white hover:bg-[#232E45] disabled:opacity-50"
              >
                <Plus size={18} />
              </Button>
            </div>
            <p className="text-dashboard-text-secondary text-sm mt-1">
              {action === 'buy' 
                ? `You will get: ${assetKey === 'crypto' ? unitsToTrade.toFixed(4) : unitsToTrade.toFixed(2)} ${assetDetails.name}`
                : `You will sell: ${assetKey === 'crypto' ? unitsToTrade.toFixed(4) : unitsToTrade.toFixed(2)} ${assetDetails.name}`
              }
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline"
              className="bg-[#0A1629] border-[#1A2B45] text-white hover:bg-[#1A2B45]"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className={action === 'buy' 
                ? "bg-dashboard-positive hover:bg-dashboard-positive/90"
                : "bg-dashboard-negative hover:bg-dashboard-negative/90"
              }
              onClick={submitTrade}
              disabled={action === 'buy' ? amount > maxBuyAmount : amount > maxSellAmount}
            >
              {action === 'buy' ? 'Buy' : 'Sell'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeModal;
