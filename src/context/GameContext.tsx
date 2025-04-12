// src/context/GameContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { NEWS_EVENTS, MARKET_OPPORTUNITIES, INITIAL_ASSET_PRICES } from '../utils/gameData';
import { calculateMarketStress, generateMarketOpportunity, generateNewsEvent, updateMarketPrices } from '../utils/marketLogic';

// Define types
type AssetType = 'stocks' | 'oil' | 'gold' | 'crypto';
type TradeAction = 'buy' | 'sell' | 'short' | 'cover';

interface Portfolio {
  cash: number;
  netWorth?: number;
}

interface AssetData {
  quantities: {
    [key in AssetType]?: number;
  };
  dollarValues: {
    [key in AssetType]?: number;
  };
  shorts: {
    [key in AssetType]?: {
      value: number;
      price: number;
      active: boolean;
    };
  };
}

interface AssetPrices {
  [key in AssetType]: number;
}

interface AssetTrend {
  direction: 'up' | 'down';
  strength: 1 | 2 | 3;
}

interface AssetTrends {
  [key in AssetType]: AssetTrend;
}

interface PriceHistory {
  [key in AssetType]: number[];
}

interface NewsItem {
  title: string;
  message: string;
  impact: {
    [key in AssetType]?: number;
  };
  tip?: string;
  isCrash?: boolean;
}

interface MarketAlert {
  title: string;
  message: string;
}

interface MarketOpportunity {
  type: string;
  title: string;
  description: string;
  actionText: string;
  asset: AssetType;
  risk: 'low' | 'medium' | 'high';
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'priceAlert' | 'achievement' | 'transaction';
}

interface GameStats {
  tradesExecuted: number;
  profitableTrades: number;
  biggestGain: number;
  biggestLoss: number;
  marketCrashesWeathered: number;
  tradesPerRound: number;
}

interface GameResult {
  finalValue: number;
  returnPercentage: number;
  bestAsset: string;
  worstAsset: string;
  bestReturn: number;
  worstReturn: number;
}

interface Achievement {
  unlocked: boolean;
  title: string;
  description: string;
}

interface Achievements {
  [key: string]: Achievement;
}

interface Settings {
  sound: boolean;
  music: boolean;
  tutorialComplete: boolean;
  darkMode: boolean;
  saveProgress: boolean;
  notifications: boolean;
}

interface GameContextProps {
  // Game state
  gameMode: string;
  setGameMode: (mode: string) => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  round: number;
  totalRounds: number;
  timer: number;
  paused: boolean;
  
  // Portfolio data
  portfolio: Portfolio;
  assetPrices: AssetPrices;
  assetData: AssetData;
  portfolioHistory: number[];
  
  // Market data
  assetTrends: AssetTrends;
  priceHistory: PriceHistory;
  currentNews: {
    message: string;
    impact: {
      [key in AssetType]?: number;
    };
    title?: string;
    tip?: string;
  };
  newsHistory: NewsItem[];
  marketOpportunity: MarketOpportunity | null;
  
  // UI state
  notifications: Notification[];
  showNewsPopup: boolean;
  setShowNewsPopup: (show: boolean) => void;
  newsPopup: NewsItem;
  showMarketAlert: boolean;
  setShowMarketAlert: (show: boolean) => void;
  marketAlert: MarketAlert;
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  
  // Game functions
  startGame: () => void;
  togglePause: () => void;
  handleTrade: (asset: AssetType, action: TradeAction, quantity: any) => boolean;
  handleOpportunity: (opportunity: MarketOpportunity) => void;
  handleEndGame: () => boolean;
  calculatePortfolioValue: () => number;
  
  // Utility functions
  formatCurrency: (value: number) => string;
  formatTime: (seconds: number) => string;
  
  // Results and stats
  gameStats: GameStats;
  gameResult: GameResult;
  achievements: Achievements;
}

// Default asset prices
const defaultAssetPrices: AssetPrices = INITIAL_ASSET_PRICES;

const defaultContext: GameContextProps = {
  gameMode: 'standard',
  setGameMode: () => {},
  difficulty: 'normal',
  setDifficulty: () => {},
  round: 1,
  totalRounds: 10,
  timer: 60,
  paused: false,
  
  portfolio: { cash: 10000 },
  assetPrices: defaultAssetPrices,
  assetData: {
    quantities: {},
    dollarValues: {},
    shorts: {}
  },
  portfolioHistory: [10000],
  
  assetTrends: {
    stocks: { direction: 'up', strength: 1 },
    oil: { direction: 'up', strength: 1 },
    gold: { direction: 'up', strength: 1 },
    crypto: { direction: 'up', strength: 2 }
  },
  priceHistory: {
    stocks: [defaultAssetPrices.stocks],
    oil: [defaultAssetPrices.oil],
    gold: [defaultAssetPrices.gold],
    crypto: [defaultAssetPrices.crypto]
  },
  currentNews: {
    message: "Market news will appear here...",
    impact: {}
  },
  newsHistory: [],
  marketOpportunity: null,
  
  notifications: [],
  showNewsPopup: false,
  setShowNewsPopup: () => {},
  newsPopup: {
    title: '',
    message: '',
    impact: {},
  },
  showMarketAlert: false,
  setShowMarketAlert: () => {},
  marketAlert: {
    title: '',
    message: ''
  },
  settings: {
    sound: true,
    music: true,
    tutorialComplete: false,
    darkMode: true,
    saveProgress: true,
    notifications: true
  },
  updateSettings: () => {},
  
  startGame: () => {},
  togglePause: () => {},
  handleTrade: () => false,
  handleOpportunity: () => {},
  handleEndGame: () => false,
  calculatePortfolioValue: () => 0,
  
  formatCurrency: () => '',
  formatTime: () => '',
  
  gameStats: {
    tradesExecuted: 0,
    profitableTrades: 0,
    biggestGain: 0,
    biggestLoss: 0,
    marketCrashesWeathered: 0,
    tradesPerRound: 0
  },
  gameResult: {
    finalValue: 0,
    returnPercentage: 0,
    bestAsset: '',
    worstAsset: '',
    bestReturn: 0,
    worstReturn: 0
  },
  achievements: {}
};

const GameContext = createContext<GameContextProps>(defaultContext);

export const useGame = () => useContext(GameContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Game mode and difficulty
  const [gameMode, setGameMode] = useState('standard');
  const [difficulty, setDifficulty] = useState('normal');
  
  // Portfolio state
  const [portfolio, setPortfolio] = useState<Portfolio>({ cash: 10000 });
  const [assetPrices, setAssetPrices] = useState<AssetPrices>(defaultAssetPrices);
  const [assetData, setAssetData] = useState<AssetData>({
    quantities: {},
    dollarValues: {},
    shorts: {}
  });
  
  // Add portfolio history state - track one value per round
  const [portfolioHistory, setPortfolioHistory] = useState<number[]>([10000]);
  
  // Track last update time for throttling market changes
  const lastPriceUpdateRef = useRef<number>(Date.now());
  const lastNewsUpdateRef = useRef<number>(Date.now());
  
  // Market state
  const [assetTrends, setAssetTrends] = useState<AssetTrends>({
    stocks: { direction: 'up', strength: 1 },
    oil: { direction: 'up', strength: 1 },
    gold: { direction: 'up', strength: 1 },
    crypto: { direction: 'up', strength: 2 }
  });
  
  const [priceHistory, setPriceHistory] = useState<PriceHistory>({
    stocks: [defaultAssetPrices.stocks],
    oil: [defaultAssetPrices.oil],
    gold: [defaultAssetPrices.gold],
    crypto: [defaultAssetPrices.crypto]
  });
  
  // Game progression
  const [timer, setTimer] = useState(60);
  const [paused, setPaused] = useState(false);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  
  // News system
  const [currentNews, setCurrentNews] = useState({
    message: "Welcome to Portfolio Panic! Market updates will appear here.",
    title: "Market Open",
    impact: {}
  });
  
  // News history - keep track of previous news
  const [newsHistory, setNewsHistory] = useState<NewsItem[]>([]);
  
  // News timer to control frequency
  const [newsCountdown, setNewsCountdown] = useState(120);
  
  const [showNewsPopup, setShowNewsPopup] = useState(false);
  const [newsPopup, setNewsPopup] = useState<NewsItem>({
    title: 'Welcome to Portfolio Panic!',
    message: 'Get ready to make investment decisions as market conditions change.',
    impact: {},
    tip: 'Keep an eye on market trends and news.'
  });
  
  // Market alerts
  const [showMarketAlert, setShowMarketAlert] = useState(false);
  const [marketAlert, setMarketAlert] = useState<MarketAlert>({
    title: '',
    message: ''
  });
  
  // Special opportunities
  const [marketOpportunity, setMarketOpportunity] = useState<MarketOpportunity | null>(null);
  
  // User settings
  const [settings, setSettings] = useState<Settings>({
    sound: true,
    music: true,
    tutorialComplete: false,
    darkMode: true,
    saveProgress: true,
    notifications: true
  });
  
  // Game statistics
  const [gameStats, setGameStats] = useState<GameStats>({
    tradesExecuted: 0,
    profitableTrades: 0,
    biggestGain: 0,
    biggestLoss: 0,
    marketCrashesWeathered: 0,
    tradesPerRound: 0
  });
  
  // Game results
  const [gameResult, setGameResult] = useState<GameResult>({
    finalValue: 0,
    returnPercentage: 0,
    bestAsset: "",
    worstAsset: "",
    bestReturn: 0,
    worstReturn: 0
  });
  
  // Achievements
  const [achievements, setAchievements] = useState<Achievements>({
    firstProfit: { unlocked: false, title: "First Profit", description: "Make your first profitable trade" },
    riskTaker: { unlocked: false, title: "Risk Taker", description: "Invest over 50% in crypto" },
    diversified: { unlocked: false, title: "Diversified Portfolio", description: "Own all available assets" },
    goldHoarder: { unlocked: false, title: "Gold Hoarder", description: "Accumulate 5 units of gold" },
    marketCrash: { unlocked: false, title: "Crash Survivor", description: "End with profit despite a market crash" },
    tenPercent: { unlocked: false, title: "Double Digits", description: "Achieve a 10% return" },
    wealthyInvestor: { unlocked: false, title: "Wealthy Investor", description: "Reach a portfolio value of $15,000" },
    shortMaster: { unlocked: false, title: "Short Master", description: "Make profit from a short position" }
  });
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Timer references
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const marketUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const notificationTimeoutsRef = useRef<number[]>([]);
  
  // Format currency display
  const formatCurrency = useCallback((value: number): string => {
    return '$' + Math.round(value).toLocaleString();
  }, []);
  
  // Format time display (mm:ss)
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);
  
  // Calculate portfolio value
  const calculatePortfolioValue = useCallback((): number => {
    let total = portfolio.cash;
    
    // Add value of all owned assets
    Object.entries(assetData.quantities).forEach(([asset, quantity]) => {
      if (quantity && quantity > 0 && assetPrices[asset as AssetType]) {
        total += quantity * assetPrices[asset as AssetType];
      }
    });
    
    // Add value of short positions
    Object.entries(assetData.shorts).forEach(([asset, position]) => {
      if (position && position.active && assetPrices[asset as AssetType]) {
        const entryPrice = position.price;
        const currentPrice = assetPrices[asset as AssetType];
        const value = position.value;
        
        // Calculate profit/loss (shorts profit when price goes down)
        const priceChange = (entryPrice - currentPrice) / entryPrice;
        const profitLoss = value * priceChange;
        
        total += profitLoss;
      }
    });
    
    return total;
  }, [portfolio, assetData, assetPrices]);
  
  // Add notification
  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' | 'priceAlert' | 'achievement' | 'transaction' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remove notification after 5 seconds
    const timeoutId = window.setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
    
    notificationTimeoutsRef.current.push(timeoutId);
    
    return id;
  }, []);
  
  // Update market prices using imported function
  const updateMarketPricesEffect = useCallback(() => {
    const result = updateMarketPrices(assetPrices, assetTrends);
    
    setAssetPrices(result.prices);
    setAssetTrends(result.trends);
    
    // Update price history
    setPriceHistory(prev => {
      const updatedHistory = { ...prev };
      
      Object.keys(result.prices).forEach(assetKey => {
        const asset = assetKey as AssetType;
        const newPrice = result.prices[asset];
        
        // Only update history if price changed
        if (newPrice !== prev[asset][prev[asset].length - 1]) {
          updatedHistory[asset] = [...(prev[asset] || []), newPrice];
          
          // Keep history manageable - limit to 100 points
          if (updatedHistory[asset].length > 100) {
            updatedHistory[asset] = updatedHistory[asset].slice(-100);
          }
          
          // Notify for significant price changes (>15%)
          const prevPrice = prev[asset][prev[asset].length - 1];
          const priceChange = ((newPrice - prevPrice) / prevPrice) * 100;
          
          if (Math.abs(priceChange) >= 15) {
            addNotification(
              `${asset.charAt(0).toUpperCase() + asset.slice(1)} price ${priceChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(priceChange).toFixed(1)}%!`,
              priceChange > 0 ? 'success' : 'warning'
            );
          }
        }
      });
      
      return updatedHistory;
    });
  }, [assetPrices, assetTrends, addNotification]);
  
  // Set up a fixed interval for price updates
  useEffect(() => {
    // Only run when game is active and not paused
    if (!paused) {
      const priceUpdateInterval = setInterval(() => {
        updateMarketPricesEffect();
      }, 5000); // Fixed 5-second interval
      
      return () => clearInterval(priceUpdateInterval);
    }
  }, [updateMarketPricesEffect, paused]);
  
  // Update portfolio history - now based on round changes
  useEffect(() => {
    // Update portfolio history when round changes
    const currentValue = calculatePortfolioValue();
    
    // Only add a new portfolio value when round changes
    if (round > portfolioHistory.length - 1) {
      setPortfolioHistory(prev => {
        // Add current value for this round
        console.log(`Round ${round}: Adding portfolio value ${currentValue} to history`);
        return [...prev, currentValue];
      });
    } else if (round === portfolioHistory.length - 1) {
      // Update the current round's value
      setPortfolioHistory(prev => {
        const updated = [...prev];
        updated[round] = currentValue;
        return updated;
      });
    }
  }, [round, calculatePortfolioValue, portfolioHistory.length]);
  
  // Generate news 
  const generateGameNewsEvent = useCallback((showPopup = false) => {
    // Get a new news event
    const newsEvent = generateNewsEvent(difficulty);
    
    // If no news was generated, return
    if (!newsEvent) return null;
    
    // Only update history if it's a new message
    if (currentNews.message !== newsEvent.message) {
      // Store previous news in history (limit to 10 items)
      setNewsHistory(prev => {
        const updatedHistory = [
          {
            title: currentNews.title || "Market Update",
            message: currentNews.message,
            impact: currentNews.impact,
            tip: currentNews.tip,
            isCrash: false
          },
          ...prev
        ].slice(0, 9); // Keep only last 9 items
        return updatedHistory;
      });
    }
    
    // Set current news
    setCurrentNews({
      message: newsEvent.message,
      title: newsEvent.title,
      impact: newsEvent.impact,
      tip: newsEvent.tip
    });
    
    // If news should trigger a popup, set the popup content
    if (showPopup) {
      setNewsPopup(newsEvent);
      setShowNewsPopup(true);
    }
    
    // If this is a crash event, update game stats
    if (newsEvent.isCrash) {
      setGameStats(prev => ({
        ...prev,
        marketCrashesWeathered: prev.marketCrashesWeathered + 1
      }));
    }
    
    return newsEvent;
  }, [currentNews, difficulty]);
  
  // Game loop timer
  const startGameTimer = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    
    // Generate initial news without popup
    generateGameNewsEvent(false);
    
    // Set up timer
    gameTimerRef.current = setInterval(() => {
      if (paused) return;
      
      // Decrement news countdown
      setNewsCountdown(prev => {
        const newCount = prev - 1;
        // Generate news rarely - only when countdown reaches zero
        if (newCount <= 0) {
          // Generate news, sometimes with popup for important news
          const newsEvent = generateGameNewsEvent(Math.random() < 0.3);
          
          // Set countdown between 120-240 seconds (2-4 minutes)
          return Math.floor(Math.random() * 120) + 120;
        }
        return newCount;
      });
      
      // Update market prices periodically
      if (Date.now() - lastPriceUpdateRef.current >= 5000) {
        updateMarketPricesEffect();
        lastPriceUpdateRef.current = Date.now();
      }
      
      // Occasionally check for new market opportunities
      if (Math.random() < 0.01 && !marketOpportunity) {
        const opportunity = generateMarketOpportunity();
        if (opportunity) {
          setMarketOpportunity(opportunity);
          addNotification(`New market opportunity: ${opportunity.title}`, 'info');
        }
      }
      
      setTimer(prev => {
        if (prev <= 1) {
          // Time's up for this round
          if (round < totalRounds) {
            // Move to next round
            setRound(r => {
              const nextRound = r + 1;
              addNotification(`Round ${nextRound} starting`, 'info');
              return nextRound;
            });
            
            // Always update the portfolio value at the end of each round
            const currentValue = calculatePortfolioValue();
            setPortfolioHistory(prev => {
              const updated = [...prev];
              // Update current round's value one final time
              if (round < updated.length) {
                updated[round] = currentValue;
              } else {
                updated.push(currentValue);
              }
              return updated;
            });
            
            // Generate news for new round with higher probability
            if (Math.random() < 0.5) {
              const newsEvent = generateGameNewsEvent(Math.random() < 0.5);
            }
            
            // Always update market prices at round change
            updateMarketPricesEffect();
            
            // Check achievements
            checkAchievements();
            
            return 60; // Reset timer
          } else {
            // Game over
            clearInterval(gameTimerRef.current!);
            handleEndGame();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [round, totalRounds, paused, generateGameNewsEvent, updateMarketPricesEffect, calculatePortfolioValue, addNotification, handleEndGame, checkAchievements, marketOpportunity]);
  
  // Check for achievements
  const checkAchievements = useCallback(() => {
    const portfolioValue = calculatePortfolioValue();
    const initialCash = 10000;
    const returnPercentage = ((portfolioValue - initialCash) / initialCash) * 100;
    
    const updatedAchievements = { ...achievements };
    
    // Check for 10% returns
    if (!updatedAchievements.tenPercent.unlocked && returnPercentage >= 10) {
      updatedAchievements.tenPercent.unlocked = true;
      addNotification('Achievement Unlocked: Double Digits', 'achievement');
    }
    
    // Check for wealthy investor
    if (!updatedAchievements.wealthyInvestor.unlocked && portfolioValue >= 15000) {
      updatedAchievements.wealthyInvestor.unlocked = true;
      addNotification('Achievement Unlocked: Wealthy Investor', 'achievement');
    }
    
    // Check for diversified portfolio
    const assetCount = Object.entries(assetData.quantities)
      .filter(([_, quantity]) => quantity && quantity > 0)
      .length;
    
    if (!updatedAchievements.diversified.unlocked && assetCount >= 4) {
      updatedAchievements.diversified.unlocked = true;
      addNotification('Achievement Unlocked: Diversified Portfolio', 'achievement');
    }
    
    // Check for gold hoarder
    const goldAmount = assetData.quantities.gold || 0;
    if (!updatedAchievements.goldHoarder.unlocked && goldAmount >= 5) {
      updatedAchievements.goldHoarder.unlocked = true;
      addNotification('Achievement Unlocked: Gold Hoarder', 'achievement');
    }
    
    // Check for risk taker (crypto > 50% of portfolio)
    const cryptoValue = (assetData.quantities.crypto || 0) * assetPrices.crypto;
    if (!updatedAchievements.riskTaker.unlocked && cryptoValue > portfolioValue * 0.5) {
      updatedAchievements.riskTaker.unlocked = true;
      addNotification('Achievement Unlocked: Risk Taker', 'achievement');
    }
    
    setAchievements(updatedAchievements);
  }, [assetData, assetPrices, achievements, calculatePortfolioValue, addNotification]);
  
  // Handle trading
  const handleTrade = useCallback((asset: AssetType, action: TradeAction, quantity: any): boolean => {
    console.log(`Trade requested: ${action} ${quantity} of ${asset} at price ${assetPrices[asset]}`);
    
    try {
      // Create deep copies to ensure we don't have reference issues
      const updatedPortfolio = { ...portfolio };
      const updatedAssetData = {
        quantities: { ...assetData.quantities },
        dollarValues: { ...assetData.dollarValues },
        shorts: { ...assetData.shorts }
      };
      
      let tradeValue = 0;
      let profitLoss = 0;
      let actualQuantity = 0;
      
      // Initialize asset entries if they don't exist
      if (!updatedAssetData.quantities[asset]) {
        updatedAssetData.quantities[asset] = 0;
      }
      if (!updatedAssetData.dollarValues[asset]) {
        updatedAssetData.dollarValues[asset] = 0;
      }
      
      if (action === 'buy') {
        // Handle BUY action
        // First, determine how many units we're buying
        
        // If quantity is a dollar amount
        if (typeof quantity === 'number' && quantity > 1) {
          // This is a dollar amount to spend
          const maxAffordableUnits = Math.floor(updatedPortfolio.cash / assetPrices[asset]);
          const requestedUnits = Math.floor(quantity / assetPrices[asset]);
          actualQuantity = Math.min(maxAffordableUnits, requestedUnits);
        } 
        // If quantity is a percentage (0-1)
        else if (typeof quantity === 'number' && quantity > 0 && quantity <= 1) {
          const maxAffordableUnits = Math.floor(updatedPortfolio.cash / assetPrices[asset]);
          actualQuantity = Math.floor(maxAffordableUnits * quantity);
        }
        // If quantity is directly specified in units
        else if (typeof quantity === 'object' && quantity.units) {
          actualQuantity = Math.floor(quantity.units);
        }
        // Default case - handle as units
        else {
          actualQuantity = Math.floor(Number(quantity));
        }
        
        // Validate we can buy at least some quantity
        if (isNaN(actualQuantity) || actualQuantity <= 0) {
          console.log('Invalid quantity to buy:', actualQuantity);
          addNotification('Invalid quantity to buy', 'error');
          return false;
        }
        
        // Calculate cost
        tradeValue = actualQuantity * assetPrices[asset];
        
        // Validate enough cash
        if (tradeValue > updatedPortfolio.cash) {
          console.log(`Cannot afford purchase. Cash: ${updatedPortfolio.cash}, Cost: ${tradeValue}`);
          addNotification('Not enough cash for this purchase!', 'error');
          return false;
        }
        
        // Update portfolio
        updatedPortfolio.cash = Math.round((updatedPortfolio.cash - tradeValue) * 100) / 100;
        updatedAssetData.quantities[asset] += actualQuantity;
        updatedAssetData.dollarValues[asset] += tradeValue;
        
        // Add notification
        addNotification(`Bought ${actualQuantity} ${asset} for ${formatCurrency(tradeValue)}`, 'success');
      } 
      else if (action === 'sell') {
        // Handle SELL action
        const currentQuantity = updatedAssetData.quantities[asset] || 0;
        
        // Determine how many units to sell
        if (typeof quantity === 'number' && quantity > 0 && quantity <= 1) {
          // Percentage of holdings
          actualQuantity = Math.floor(currentQuantity * quantity);
        } else {
          // Direct quantity
          actualQuantity = Math.floor(Number(quantity));
        }
        
        // Validate we have enough to sell
        if (actualQuantity <= 0 || actualQuantity > currentQuantity) {
          console.log(`Cannot sell - current quantity: ${currentQuantity}, requested: ${actualQuantity}`);
          addNotification(`Not enough ${asset} to sell!`, 'error');
          return false;
        }
        
        // Calculate return and profit/loss
        tradeValue = Math.round((actualQuantity * assetPrices[asset]) * 100) / 100;
        
        // Calculate profit/loss based on average cost
        const avgCost = (updatedAssetData.dollarValues[asset] || 0) / currentQuantity;
        const costBasis = avgCost * actualQuantity;
        profitLoss = tradeValue - costBasis;
        
        // Update portfolio
        updatedPortfolio.cash += tradeValue;
        updatedAssetData.quantities[asset] = currentQuantity - actualQuantity;
        
        // Update dollar cost average
        if (updatedAssetData.quantities[asset] === 0) {
          updatedAssetData.dollarValues[asset] = 0;
        } else {
          const remainingValue = (updatedAssetData.dollarValues[asset] || 0) - costBasis;
          updatedAssetData.dollarValues[asset] = remainingValue;
        }
        
        // Add notification with profit/loss
        const profitText = profitLoss >= 0 
          ? `Profit: ${formatCurrency(profitLoss)}` 
          : `Loss: ${formatCurrency(Math.abs(profitLoss))}`;
        
        addNotification(`Sold ${actualQuantity} ${asset} for ${formatCurrency(tradeValue)}. ${profitText}`, 
          profitLoss >= 0 ? 'success' : 'warning');
        
        // Check achievement
        if (profitLoss > 0 && !achievements.firstProfit.unlocked) {
          const updatedAchievements = { ...achievements };
          updatedAchievements.firstProfit.unlocked = true;
          setAchievements(updatedAchievements);
          addNotification('Achievement Unlocked: First Profit', 'achievement');
        }
      }
      else if (action === 'short') {
        // Handle SHORT action
        // Check if there's already an active short position
        if (updatedAssetData.shorts[asset]?.active) {
          addNotification(`You already have an active short position on ${asset}`, 'error');
          return false;
        }
        
        // Determine short amount
        let shortAmount = 0;
        if (typeof quantity === 'number') {
          shortAmount = quantity;
        } else {
          shortAmount = parseFloat(quantity);
        }
        
        // Validation
        if (isNaN(shortAmount) || shortAmount <= 0) {
          addNotification('Invalid short amount', 'error');
          return false;
        }
        
        // Check if user has enough cash for margin (50% of position)
        const marginRequired = shortAmount * 0.5;
        if (marginRequired > updatedPortfolio.cash) {
          addNotification('Not enough cash for margin requirement', 'error');
          return false;
        }
        
        // Create short position
        updatedAssetData.shorts[asset] = {
          value: shortAmount,
          price: assetPrices[asset],
          active: true
        };
        
        // Reserve margin
        updatedPortfolio.cash -= marginRequired;
        
        addNotification(`Opened ${formatCurrency(shortAmount)} short position on ${asset}`, 'info');
      }
      else if (action === 'cover') {
        // Handle COVER action
        // Ensure there's an active short position
        if (!updatedAssetData.shorts[asset]?.active) {
          addNotification(`No active short position on ${asset} to cover`, 'error');
          return false;
        }
        
        const shortPosition = updatedAssetData.shorts[asset];
        let coverPercentage = 1; // Default to covering entire position
        
        // If partial coverage is specified (0-1)
        if (typeof quantity === 'number' && quantity > 0 && quantity < 1) {
          coverPercentage = quantity;
        }
        
        // Calculate P/L
        const entryPrice = shortPosition.price;
        const currentPrice = assetPrices[asset];
        const positionValue = shortPosition.value * coverPercentage;
        
        // Shorts profit when price goes down
        profitLoss = positionValue * ((entryPrice - currentPrice) / entryPrice);
        
        // Return margin plus profit/loss
        const marginToReturn = positionValue * 0.5;
        updatedPortfolio.cash += marginToReturn + profitLoss;
        
        // Update or close position
        if (coverPercentage >= 0.999) { // Full coverage
          updatedAssetData.shorts[asset] = {
            value: 0,
            price: 0,
            active: false
          };
        } else { // Partial coverage
          updatedAssetData.shorts[asset] = {
            value: shortPosition.value * (1 - coverPercentage),
            price: shortPosition.price,
            active: true
          };
        }
        
        // Notification
        const resultText = profitLoss >= 0 
          ? `Profit: ${formatCurrency(profitLoss)}` 
          : `Loss: ${formatCurrency(Math.abs(profitLoss))}`;
        
        addNotification(`Covered short position on ${asset}. ${resultText}`, 
          profitLoss >= 0 ? 'success' : 'warning');
        
        // Short master achievement
        if (profitLoss > 0 && !achievements.shortMaster.unlocked) {
          const updatedAchievements = { ...achievements };
          updatedAchievements.shortMaster.unlocked = true;
          setAchievements(updatedAchievements);
          addNotification('Achievement Unlocked: Short Master', 'achievement');
        }
      }
      
      // Commit all changes
      setPortfolio(updatedPortfolio);
      setAssetData(updatedAssetData);
      
      // Update game stats
      setGameStats(prev => {
        const newStats = { ...prev };
        newStats.tradesExecuted += 1;
        newStats.tradesPerRound += 1;
        
        if (action === 'sell' || action === 'cover') {
          if (profitLoss > 0) {
            newStats.profitableTrades += 1;
            if (profitLoss > newStats.biggestGain) {
              newStats.biggestGain = profitLoss;
            }
          } else if (profitLoss < 0) {
            if (Math.abs(profitLoss) > Math.abs(newStats.biggestLoss)) {
              newStats.biggestLoss = profitLoss;
            }
          }
        }
        
        return newStats;
      });
      
      return true;
    } catch (error) {
      console.error("Error in handleTrade:", error);
      addNotification("Trade failed: " + (error instanceof Error ? error.message : "Unknown error"), "error");
      return false;
    }
  }, [portfolio, assetData, assetPrices, formatCurrency, addNotification, achievements]);
