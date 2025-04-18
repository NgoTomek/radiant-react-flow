import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ArrowDown, ArrowUp, AlertTriangle, DollarSign } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TradeModalProps {
  asset: string;
  onClose: () => void;
}

const TradeModal = ({ asset, onClose }: TradeModalProps) => {
  const { 
    assetPrices, 
    assetData, 
    portfolio, 
    handleTrade, 
    formatCurrency, 
    assetTrends, 
    priceHistory 
  } = useGame();
  
  const [amount, setAmount] = useState(100);
  const [action, setAction] = useState<'buy' | 'sell' | 'short' | 'cover'>('buy');
  const [percentageMode, setPercentageMode] = useState(false);
  const [percentage, setPercentage] = useState(10); // Default to 10%
  const [previewUnits, setPreviewUnits] = useState(0);
  const [amountInputMode, setAmountInputMode] = useState<'dollars' | 'units'>('dollars');
  
  const assetKey = asset as 'stocks' | 'oil' | 'gold' | 'crypto';
  const price = assetPrices[assetKey];
  const quantity = assetData.quantities[assetKey] || 0;
  const value = quantity * price;
  
  // Get short position if exists
  const shortPosition = assetData.shorts[assetKey];
  const hasShortPosition = shortPosition && shortPosition.active;
  
  // Calculate how many units the current amount will buy/sell
  const unitsToTrade = amountInputMode === 'dollars' ? amount / price : amount;
  
  // Maximum amount that can be spent
  const maxBuyAmount = portfolio.cash;
  const maxSellAmount = value;
  const maxShortAmount = portfolio.cash * 2; // 2x leverage with 50% margin
  const maxCoverAmount = hasShortPosition ? shortPosition.value : 0;
  
  // Get trend direction for display
  const currentTrend = assetTrends[assetKey];
  const trendDirection = currentTrend?.direction || 'up';
  const trendStrength = currentTrend?.strength || 1;
  
  // Calculate recent price change for display
  const priceChangePercentage = React.useMemo(() => {
    const history = priceHistory[assetKey];
    if (history && history.length >= 2) {
      const previous = history[history.length - 2];
      const current = history[history.length - 1];
      return ((current - previous) / previous) * 100;
    }
    return 0;
  }, [priceHistory, assetKey]);
  
  // Update preview units whenever amount changes
  useEffect(() => {
    if (amountInputMode === 'dollars') {
      setPreviewUnits(Math.floor(amount / price));
    } else {
      setPreviewUnits(amount);
    }
  }, [amount, price, amountInputMode]);
  
  // Handle amount change
  const increaseAmount = () => {
    let maxAmount = maxBuyAmount;
    switch (action) {
      case 'buy':
        maxAmount = maxBuyAmount;
        break;
      case 'sell':
        maxAmount = maxSellAmount;
        break;
      case 'short':
        maxAmount = maxShortAmount;
        break;
      case 'cover':
        maxAmount = maxCoverAmount;
        break;
    }
    
    if (percentageMode) {
      setPercentage(prev => Math.min(prev + 10, 100));
      updateAmountFromPercentage(Math.min(percentage + 10, 100));
    } else if (amountInputMode === 'dollars') {
      setAmount(prev => Math.min(prev + 100, maxAmount));
    } else {
      // Unit mode
      const maxUnits = action === 'buy' ? Math.floor(maxAmount / price) : 
                      (action === 'sell' ? quantity : 0);
      setAmount(prev => Math.min(prev + 1, maxUnits));
    }
  };
  
  const decreaseAmount = () => {
    if (percentageMode) {
      setPercentage(prev => Math.max(prev - 10, 10));
      updateAmountFromPercentage(Math.max(percentage - 10, 10));
    } else if (amountInputMode === 'dollars') {
      setAmount(prev => Math.max(prev - 100, 100));
    } else {
      // Unit mode
      setAmount(prev => Math.max(prev - 1, 1));
    }
  };
  
  // Update amount when percentage changes
  const updateAmountFromPercentage = (newPercentage: number) => {
    let baseValue = 0;
    switch (action) {
      case 'buy':
        baseValue = maxBuyAmount;
        break;
      case 'sell':
        baseValue = maxSellAmount;
        break;
      case 'short':
        baseValue = maxShortAmount;
        break;
      case 'cover':
        baseValue = maxCoverAmount;
        break;
    }
    
    setAmount(Math.floor(baseValue * (newPercentage / 100)));
  };
  
  // Toggle between absolute and percentage modes
  const toggleMode = () => {
    const newMode = !percentageMode;
    setPercentageMode(newMode);
    
    if (newMode) {
      // Calculate current percentage
      let baseValue = 0;
      switch (action) {
        case 'buy':
          baseValue = maxBuyAmount;
          break;
        case 'sell':
          baseValue = maxSellAmount;
          break;
        case 'short':
          baseValue = maxShortAmount;
          break;
        case 'cover':
          baseValue = maxCoverAmount;
          break;
      }
      
      if (baseValue > 0) {
        const calculated = Math.round((amount / baseValue) * 100);
        setPercentage(Math.max(10, Math.min(calculated, 100)));
        updateAmountFromPercentage(calculated);
      } else {
        setPercentage(10);
      }
    }
  };
  
  // Toggle between dollars and units input mode
  const toggleAmountInputMode = () => {
    if (amountInputMode === 'dollars') {
      // Convert current dollar amount to units
      const units = Math.floor(amount / price);
      setAmountInputMode('units');
      setAmount(units);
    } else {
      // Convert current units to dollar amount
      const dollars = Math.floor(amount * price);
      setAmountInputMode('dollars');
      setAmount(dollars);
    }
  };
  
  // Handle trade submission
  const submitTrade = () => {
    if (amount <= 0) return;
    
    if (action === 'buy') {
      if (amountInputMode === 'dollars') {
        // Pass the dollar amount directly
        handleTrade(assetKey, 'buy', amount);
      } else {
        // Pass as an object to indicate units
        handleTrade(assetKey, 'buy', { units: amount });
      }
    } else if (action === 'sell') {
      if (amountInputMode === 'units') {
        handleTrade(assetKey, 'sell', amount);
      } else {
        // Convert dollars to units for sell
        const unitsToSell = Math.min(quantity, Math.floor(amount / price));
        handleTrade(assetKey, 'sell', unitsToSell);
      }
    } else if (action === 'short') {
      handleTrade(assetKey, 'short', amount);
    } else if (action === 'cover') {
      if (shortPosition && shortPosition.active) {
        handleTrade(assetKey, 'cover', percentageMode ? percentage / 100 : 1);
      }
    }
    onClose();
  };
  
  // Reset amount when switching actions
  useEffect(() => {
    setAmount(100);
    setPercentage(10);
    setPercentageMode(false);
    setAmountInputMode('dollars');
  }, [action]);
  
  // Get asset name and symbol
  const getAssetDetails = () => {
    switch(assetKey) {
      case 'stocks':
        return { name: 'Stocks', symbol: 'STCK', color: '#A2AAAD' };
      case 'oil':
        return { name: 'Oil', symbol: 'OIL', color: '#000000' };
      case 'gold':
        return { name: 'Gold', symbol: 'GLD', color: '#FFD700' };
      case 'crypto':
        return { name: 'Bitcoin', symbol: 'BTC', color: '#F7931A' };
      default:
        return { name: assetKey, symbol: assetKey.substring(0, 4).toUpperCase(), color: '#A2AAAD' };
    }
  };
  
  const assetDetails = getAssetDetails();
  
  // Calculate short position profit/loss if exists
  const shortProfitLoss = hasShortPosition ? 
    ((shortPosition.price - price) / shortPosition.price) * shortPosition.value : 0;
  
  // Determine suggested action based on trend
  const suggestedAction = () => {
    if (trendDirection === 'up' && priceChangePercentage > 0) {
      return 'This asset is trending upward. Consider buying or holding.';
    } else if (trendDirection === 'down' && priceChangePercentage < 0) {
      return 'This asset is trending downward. Consider selling or shorting.';
    } else if (trendDirection === 'up' && priceChangePercentage < 0) {
      return 'Conflicting signals. Price is down but trend is up.';
    } else {
      return 'Conflicting signals. Price is up but trend is down.';
    }
  };
  
  // Display trend strength
  const getTrendStrengthDisplay = () => {
    const arrows = [];
    for (let i = 0; i < trendStrength; i++) {
      arrows.push(
        <span key={i}>
          {trendDirection === 'up' ? '↑' : '↓'}
        </span>
      );
    }
    return arrows;
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#132237] border-[#1A2B45] text-white">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">Trade {assetDetails.name} ({assetDetails.symbol})</DialogTitle>
            <div className={`px-2 py-1 rounded-md text-sm ${priceChangePercentage >= 0 ? 'bg-dashboard-positive/20 text-dashboard-positive' : 'bg-dashboard-negative/20 text-dashboard-negative'}`}>
              {priceChangePercentage >= 0 ? <ArrowUp size={14} className="inline mr-1" /> : <ArrowDown size={14} className="inline mr-1" />}
              {Math.abs(priceChangePercentage).toFixed(2)}%
            </div>
          </div>
          <DialogDescription className="text-dashboard-text-secondary">
            <div className="flex justify-between">
              <div>Current Price: {formatCurrency(price)}</div>
              <div className="text-dashboard-accent">Trend: {getTrendStrengthDisplay()}</div>
            </div>
            {assetData.quantities[assetKey] > 0 && 
              <div className="mt-1">
                You Own: {assetKey === 'crypto' ? assetData.quantities[assetKey]?.toFixed(4) : assetData.quantities[assetKey]} units • 
                Value: {formatCurrency(value)}
              </div>
            }
            {hasShortPosition && 
              <div className="mt-1">
                Short Position: {formatCurrency(shortPosition.value)} • 
                P/L: <span className={shortProfitLoss >= 0 ? 'text-dashboard-positive' : 'text-dashboard-negative'}>
                  {formatCurrency(shortProfitLoss)}
                </span>
              </div>
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Action Tabs */}
          <Tabs 
            defaultValue="buy" 
            onValueChange={(value) => setAction(value as 'buy' | 'sell' | 'short' | 'cover')}
            className="w-full"
          >
            <TabsList className="w-full bg-[#0A1629]">
              <TabsTrigger 
                value="buy" 
                className="flex-1 data-[state=active]:bg-dashboard-accent data-[state=active]:text-white"
              >
                Buy
              </TabsTrigger>
              <TabsTrigger 
                value="sell" 
                disabled={!assetData.quantities[assetKey]}
                className="flex-1 data-[state=active]:bg-dashboard-accent data-[state=active]:text-white"
              >
                Sell
              </TabsTrigger>
              <TabsTrigger 
                value="short" 
                className="flex-1 data-[state=active]:bg-dashboard-accent data-[state=active]:text-white"
              >
                Short
              </TabsTrigger>
              <TabsTrigger 
                value="cover" 
                disabled={!hasShortPosition}
                className="flex-1 data-[state=active]:bg-dashboard-accent data-[state=active]:text-white"
              >
                Cover
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="mt-4">
              <div className="bg-[#0A1629] p-4 rounded-lg mb-4">
                <p className="text-dashboard-text-secondary text-sm mb-1">
                  Buy {assetDetails.name} at the current market price.
                </p>
                <p className="text-xs text-dashboard-text-secondary">
                  Available cash: {formatCurrency(portfolio.cash)}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="sell" className="mt-4">
              <div className="bg-[#0A1629] p-4 rounded-lg mb-4">
                <p className="text-dashboard-text-secondary text-sm mb-1">
                  Sell {assetDetails.name} at the current market price.
                </p>
                <p className="text-xs text-dashboard-text-secondary">
                  Available to sell: {assetKey === 'crypto' ? quantity.toFixed(4) : quantity.toFixed(2)} units ({formatCurrency(value)})
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="short" className="mt-4">
              <div className="bg-[#0A1629] p-4 rounded-lg mb-4">
                <p className="text-dashboard-text-secondary text-sm mb-1">
                  Short selling allows you to profit from price declines.
                </p>
                <p className="text-xs text-dashboard-text-secondary">
                  Requires 50% margin • Max position: {formatCurrency(maxShortAmount)}
                </p>
                {hasShortPosition && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-dashboard-negative/10 rounded border border-dashboard-negative/20">
                    <AlertTriangle size={14} className="text-dashboard-negative" />
                    <p className="text-xs text-dashboard-negative">
                      You already have an open short position on this asset
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="cover" className="mt-4">
              <div className="bg-[#0A1629] p-4 rounded-lg mb-4">
                <p className="text-dashboard-text-secondary text-sm mb-1">
                  Close your short position at the current market price.
                </p>
                {hasShortPosition && (
                  <p className="text-xs text-dashboard-text-secondary">
                    Entry price: {formatCurrency(shortPosition.price)} • 
                    Current P/L: <span className={shortProfitLoss >= 0 ? 'text-dashboard-positive' : 'text-dashboard-negative'}>
                      {formatCurrency(shortProfitLoss)}
                    </span>
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Amount Selector */}
          <div className="bg-[#0A1629] p-4 rounded-lg">
            <div className="flex justify-between mb-1">
              <p className="text-dashboard-text-secondary text-sm">Amount</p>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleMode}
                  className="h-6 text-xs text-dashboard-accent hover:text-white hover:bg-[#1A2B45]"
                >
                  {percentageMode ? 'Switch to Absolute' : 'Switch to Percentage'}
                </Button>
                {!percentageMode && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleAmountInputMode}
                    className="h-6 text-xs text-dashboard-accent hover:text-white hover:bg-[#1A2B45]"
                  >
                    {amountInputMode === 'dollars' ? 'Switch to Units' : 'Switch to Dollars'}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={decreaseAmount}
                disabled={percentageMode ? percentage <= 10 : amount <= (amountInputMode === 'dollars' ? 100 : 1)}
                className="rounded-full bg-[#1A2B45] text-white hover:bg-[#232E45] disabled:opacity-50"
              >
                <Minus size={18} />
              </Button>
              <div className="flex-1 text-center">
                {percentageMode ? (
                  <div className="text-2xl font-bold">{percentage}%</div>
                ) : (
                  <div className="text-2xl font-bold">
                    {amountInputMode === 'dollars' ? formatCurrency(amount) : `${amount} units`}
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={increaseAmount}
                disabled={
                  percentageMode ? 
                  percentage >= 100 : 
                  (action === 'buy' ? 
                    (amountInputMode === 'dollars' ? amount >= maxBuyAmount : previewUnits >= Math.floor(maxBuyAmount / price)) : 
                   action === 'sell' ? 
                    (amountInputMode === 'dollars' ? amount >= maxSellAmount : amount >= quantity) : 
                   action === 'short' ? amount >= maxShortAmount :
                   amount >= maxCoverAmount)
                }
                className="rounded-full bg-[#1A2B45] text-white hover:bg-[#232E45] disabled:opacity-50"
              >
                <Plus size={18} />
              </Button>
            </div>
            
            {/* Quick percentage buttons for percentage mode */}
            {percentageMode && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[25, 50, 75, 100].map((percent) => (
                  <Button 
                    key={percent}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPercentage(percent);
                      updateAmountFromPercentage(percent);
                    }}
                    className={`h-7 text-xs ${
                      percentage === percent 
                        ? 'bg-dashboard-accent text-white' 
                        : 'bg-[#1A2B45] text-dashboard-text-secondary'
                    }`}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            )}
            
            {/* Quick amount buttons for dollar mode */}
            {!percentageMode && amountInputMode === 'dollars' && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[250, 500, 1000].map((amt) => (
                  <Button 
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt)}
                    disabled={amt > (action === 'buy' ? maxBuyAmount : action === 'sell' ? maxSellAmount : action === 'short' ? maxShortAmount : maxCoverAmount)}
                    className={`h-7 text-xs ${
                      amount === amt 
                        ? 'bg-dashboard-accent text-white' 
                        : 'bg-[#1A2B45] text-dashboard-text-secondary'
                    }`}
                  >
                    {formatCurrency(amt)}
                  </Button>
                ))}
              </div>
            )}
            
            {/* Quick unit buttons */}
            {!percentageMode && amountInputMode === 'units' && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[1, 2, 5, 10].map((units) => (
                  <Button 
                    key={units}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(units)}
                    disabled={
                      (action === 'buy' && units * price > maxBuyAmount) ||
                      (action === 'sell' && units > quantity)
                    }
                    className={`h-7 text-xs ${
                      amount === units 
                        ? 'bg-dashboard-accent text-white' 
                        : 'bg-[#1A2B45] text-dashboard-text-secondary'
                    }`}
                  >
                    {units} unit{units !== 1 ? 's' : ''}
                  </Button>
                ))}
              </div>
            )}
            
            <div className="flex justify-between mt-3">
              <p className="text-dashboard-text-secondary text-sm">
                {action === 'buy' 
                  ? `You will get: ${amountInputMode === 'units' ? amount : Math.floor(amount / price)} ${assetDetails.name} units`
                  : action === 'sell'
                  ? `You will sell: ${amountInputMode === 'units' ? amount : Math.floor(amount / price)} ${assetDetails.name} units`
                  : action === 'short'
                  ? `Short position size: ${formatCurrency(amount)} (${formatCurrency(amount * 0.5)} margin required)`
                  : `Closing ${percentageMode ? percentage + '%' : 'all'} of your short position`
                }
              </p>
              
              <p className="text-dashboard-text-secondary text-sm">
                {action === 'buy' && `Cost: ${formatCurrency(amountInputMode === 'units' ? amount * price : amount)}`}
                {action === 'sell' && `Return: ${formatCurrency(amountInputMode === 'units' ? amount * price : amount)}`}
              </p>
            </div>
          </div>
          
          {/* Market analysis */}
          <div className="bg-[#0A1629] p-4 rounded-lg">
            <p className="text-dashboard-text-secondary text-sm mb-2">Market Analysis</p>
            <p className="text-white text-sm">{suggestedAction()}</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-[#1A2B45] p-2 rounded-md">
                <p className="text-dashboard-text-secondary">Volatility</p>
                <p className="text-white font-medium">
                  {assetKey === 'crypto' ? 'Very High' : 
                   assetKey === 'oil' ? 'High' : 
                   assetKey === 'stocks' ? 'Medium' : 'Low'}
                </p>
              </div>
              <div className="bg-[#1A2B45] p-2 rounded-md">
                <p className="text-dashboard-text-secondary">Trend</p>
                <p className={`font-medium ${trendDirection === 'up' ? 'text-dashboard-positive' : 'text-dashboard-negative'}`}>
                  {trendDirection === 'up' ? 'Bullish' : 'Bearish'} ({trendStrength}/3)
                </p>
              </div>
              <div className="bg-[#1A2B45] p-2 rounded-md">
                <p className="text-dashboard-text-secondary">Risk</p>
                <p className="text-white font-medium">
                  {assetKey === 'crypto' ? 'High' : 
                   assetKey === 'stocks' ? 'Medium' : 
                   assetKey === 'oil' ? 'Medium' : 'Low'}
                </p>
              </div>
            </div>
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
              className={
                action === 'buy' ? "bg-dashboard-positive hover:bg-dashboard-positive/90" :
                action === 'sell' ? "bg-dashboard-negative hover:bg-dashboard-negative/90" :
                action === 'short' ? "bg-dashboard-negative hover:bg-dashboard-negative/90" :
                "bg-dashboard-positive hover:bg-dashboard-positive/90"
              }
              onClick={submitTrade}
              disabled={
                (action === 'buy' && (
                  amountInputMode === 'dollars' ? 
                    amount > maxBuyAmount || amount <= 0 : 
                    amount <= 0 || amount * price > maxBuyAmount
                )) || 
                (action === 'sell' && (
                  amountInputMode === 'dollars' ? 
                    amount > maxSellAmount || amount <= 0 : 
                    amount > quantity || amount <= 0
                )) || 
                (action === 'short' && (amount > maxShortAmount || amount <= 0 || hasShortPosition)) ||
                (action === 'cover' && (amount > maxCoverAmount || amount <= 0 || !hasShortPosition))
              }
            >
              {action === 'buy' ? 'Buy' : 
               action === 'sell' ? 'Sell' : 
               action === 'short' ? 'Short' : 'Cover'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TradeModal;
