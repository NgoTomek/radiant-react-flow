// src/context/GameContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { NEWS_EVENTS, MARKET_OPPORTUNITIES } from '../utils/gameData';

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
  
  // Game functions
  startGame: () => void;
  togglePause: () => void;
  handleTrade: (asset: AssetType, action: string, quantity: any) => void;
  handleOpportunity: (opportunity: MarketOpportunity) => void;
  handleEndGame: () => void;
  calculatePortfolioValue: () => number;
  
  // Utility functions
  formatCurrency: (value: number) => string;
  formatTime: (seconds: number) => string;
  
  // Results and stats
  gameStats: GameStats;
  gameResult: GameResult;
  achievements: Achievements;
}

// Default values
const defaultAssetPrices: AssetPrices = {
  stocks: 240,
  oil: 65,
  gold: 1850,
  crypto: 29200
};

const defaultContext: GameContextProps = {
  gameMode: 'standard',
  setGameMode: () => {},
  difficulty: 'normal',
  setDifficulty: () => {},
  round: 1,
  totalRounds: 5,
  timer: 60,
  paused: false,
  
  portfolio: { cash: 10000 },
  assetPrices: defaultAssetPrices,
  assetData: {
    quantities: {},
    dollarValues: {},
    shorts: {}
  },
  
  assetTrends: {
    stocks: { direction: 'up', strength: 1 },
    oil: { direction: 'up', strength: 1 },
    gold: { direction: 'up', strength: 1 },
    crypto: { direction: 'up', strength: 2 }
  },
  priceHistory: {
    stocks: [240],
    oil: [65],
    gold: [1850],
    crypto: [29200]
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
    saveProgress: true
  },
  
  startGame: () => {},
  togglePause: () => {},
  handleTrade: () => {},
  handleOpportunity: () => {},
  handleEndGame: () => {},
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
  
  // Market state
  const [assetTrends, setAssetTrends] = useState<AssetTrends>({
    stocks: { direction: 'up', strength: 1 },
    oil: { direction: 'up', strength: 1 },
    gold: { direction: 'up', strength: 1 },
    crypto: { direction: 'up', strength: 2 }
  });
  
  const [priceHistory, setPriceHistory] = useState<PriceHistory>({
    stocks: [240],
    oil: [65],
    gold: [1850],
    crypto: [29200]
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
  const [newsCountdown, setNewsCountdown] = useState(10);
  
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
    saveProgress: true
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
    
    notificationTimeoutRef.current.push(timeoutId);
    
    return id;
  }, []);
  
  // Update market prices
  const updateMarketPrices = useCallback((newsImpact?: any) => {
    setAssetPrices(prevPrices => {
      const updatedPrices = { ...prevPrices };
      const updatedHistory = { ...priceHistory };
      const updatedTrends = { ...assetTrends };
      
      // Update each asset with random price movement
      Object.keys(updatedPrices).forEach((assetKey) => {
        const asset = assetKey as AssetType;
        const currentTrend = updatedTrends[asset];
        
        // Base volatility depends on asset type
        let volatility = 0;
        switch(asset) {
          case 'stocks': volatility = 0.15; break;
          case 'oil': volatility = 0.18; break;
          case 'gold': volatility = 0.12; break;
          case 'crypto': volatility = 0.25; break;
        }
        
        // Adjust volatility based on trend strength
        volatility *= currentTrend.strength;
        
        // Generate random price change
        let change = (Math.random() * volatility * 2) - volatility;
        
        // Apply trend bias (up or down)
        if (currentTrend.direction === 'up') {
          change += volatility * 0.3;
        } else {
          change -= volatility * 0.3;
        }
        
        // Apply news impact if provided
        if (newsImpact && newsImpact[asset]) {
          change += (newsImpact[asset] - 1);
        }
        
        // Apply price change with minimum values
        let minPrice = 10;
        if (asset === 'crypto') minPrice = 1000;
        if (asset === 'gold') minPrice = 500;
        if (asset === 'oil') minPrice = 10;
        if (asset === 'stocks') minPrice = 50;
        
        const newPrice = Math.max(minPrice, Math.round(updatedPrices[asset] * (1 + change)));
        updatedPrices[asset] = newPrice;
        
        // Update price history
        if (updatedHistory[asset]) {
          updatedHistory[asset] = [...updatedHistory[asset], newPrice];
        } else {
          updatedHistory[asset] = [newPrice];
        }
        
        // Randomly change trend (15% chance)
        if (Math.random() < 0.15) {
          updatedTrends[asset] = {
            direction: Math.random() > 0.5 ? 'up' : 'down',
            strength: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3
          };
        }
        
        // Notify of significant price changes (> 10%)
        const priceChange = (newPrice - (updatedHistory[asset][updatedHistory[asset].length - 2] || newPrice)) / 
          (updatedHistory[asset][updatedHistory[asset].length - 2] || newPrice) * 100;
        
        if (Math.abs(priceChange) >= 10) {
          const direction = priceChange > 0 ? 'increased' : 'decreased';
          addNotification(
            `${asset.charAt(0).toUpperCase() + asset.slice(1)} price ${direction} by ${Math.abs(priceChange).toFixed(1)}%!`,
            priceChange > 0 ? 'success' : 'warning'
          );
        }
      });
      
      // Update state
      setPriceHistory(updatedHistory);
      setAssetTrends(updatedTrends);
      
      return updatedPrices;
    });
    
    // Randomly generate market opportunity (15% chance per round)
    if (Math.random() < 0.15 && !marketOpportunity) {
      const opportunities = MARKET_OPPORTUNITIES;
      const randomOpportunity = opportunities[Math.floor(Math.random() * opportunities.length)];
      setMarketOpportunity(randomOpportunity);
      
      // Notify about the opportunity
      addNotification(`Special market opportunity: ${randomOpportunity.title}`, 'info');
    }
    
  }, [priceHistory, assetTrends, addNotification, marketOpportunity]);
  
  // Generate news
  const generateNewsEvent = useCallback(() => {
    const newsEvents = NEWS_EVENTS;
    
    // 10% chance for a market crash event
    const isCrash = Math.random() < 0.1;
    
    let newsEvent;
    if (isCrash) {
      const crashEvents = newsEvents.filter(event => event.isCrash);
      newsEvent = crashEvents[Math.floor(Math.random() * crashEvents.length)];
      
      // Update game stats for crash
      setGameStats(prev => ({
        ...prev,
        marketCrashesWeathered: prev.marketCrashesWeathered + 1
      }));
      
      // Show alert
      setMarketAlert({
        title: "MARKET CRASH!",
        message: "Major market downturn in progress. Consider defensive positions."
      });
      setShowMarketAlert(true);
    } else {
      const regularEvents = newsEvents.filter(event => !event.isCrash);
      newsEvent = regularEvents[Math.floor(Math.random() * regularEvents.length)];
    }
    
    // Store previous news in history (limit to 10 items)
    setNewsHistory(prev => {
      const updatedHistory = [
        {
          title: currentNews.title || "Market Update",
          message: currentNews.message,
          impact: currentNews.impact,
          tip: currentNews.tip
        },
        ...prev
      ].slice(0, 9); // Keep only last 9 items
      return updatedHistory;
    });
    
    // Set current news
    setCurrentNews({
      message: newsEvent.message,
      title: newsEvent.title,
      impact: newsEvent.impact,
      tip: newsEvent.tip
    });
    
    // Show news popup only for market crash or other important events
    if (isCrash || Math.random() < 0.3) { // Show popup only 30% of the time
      setNewsPopup(newsEvent);
      setShowNewsPopup(true);
    }
    
    // Update market based on news
    updateMarketPrices(newsEvent.impact);
    
    return newsEvent;
  }, [updateMarketPrices, currentNews]);
  
  // Game loop timer
  const startGameTimer = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    
    // Generate initial news
    generateNewsEvent();
    
    // Set up timer
    gameTimerRef.current = setInterval(() => {
      if (paused) return;
      
      // Decrement news countdown
      setNewsCountdown(prev => {
        const newCount = prev - 1;
        // Generate news approximately every 10 seconds
        if (newCount <= 0) {
          generateNewsEvent();
          return 10; // Reset countdown
        }
        return newCount;
      });
      
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
            
            // Generate news for new round (always for round transition)
            generateNewsEvent();
            
            // Update market prices
            updateMarketPrices();
            
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
      
      // Random market updates during each round (5% chance per second - reduced frequency)
      if (Math.random() < 0.05) {
        updateMarketPrices();
      }
      
    }, 1000);
    
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [round, totalRounds, paused, generateNewsEvent, updateMarketPrices]);
  
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
  
  // Initialize game
  const initializeGame = useCallback(() => {
    // Reset portfolio
    setPortfolio({ cash: 10000 });
    
    // Reset asset data
    setAssetData({
      quantities: {},
      dollarValues: {},
      shorts: {}
    });
    
    // Reset asset prices
    setAssetPrices(defaultAssetPrices);
    
    // Reset price history
    setPriceHistory({
      stocks: [defaultAssetPrices.stocks],
      oil: [defaultAssetPrices.oil],
      gold: [defaultAssetPrices.gold],
      crypto: [defaultAssetPrices.crypto]
    });
    
    // Reset trends
    setAssetTrends({
      stocks: { direction: 'up', strength: 1 },
      oil: { direction: 'up', strength: 1 },
      gold: { direction: 'up', strength: 1 },
      crypto: { direction: 'up', strength: 2 }
    });
    
    // Reset news and history
    setCurrentNews({
      message: "Welcome to Portfolio Panic! Market updates will appear here.",
      title: "Market Open",
      impact: {}
    });
    setNewsHistory([]);
    setNewsCountdown(10);
    
    // Reset game progress
    setRound(1);
    setTimer(60); // 60 seconds per round
    setPaused(false);
    
    // Reset game stats
    setGameStats({
      tradesExecuted: 0,
      profitableTrades: 0,
      biggestGain: 0,
      biggestLoss: 0,
      marketCrashesWeathered: 0,
      tradesPerRound: 0
    });
    
    // Clear notifications
    setNotifications([]);
    
    // Reset game result
    setGameResult({
      finalValue: 0,
      returnPercentage: 0,
      bestAsset: "",
      worstAsset: "",
      bestReturn: 0,
      worstReturn: 0
    });
    
    // Clear timeouts
    notificationTimeoutsRef.current.forEach(id => clearTimeout(id));
    notificationTimeoutsRef.current = [];
    
    // Welcome notification
    addNotification('Game started! Make smart investment decisions.', 'info');
    
    // Show welcome popup
    setNewsPopup({
      title: 'Welcome to Portfolio Panic!',
      message: 'Make strategic investment decisions to maximize your portfolio value.',
      impact: {},
      tip: 'Watch market trends closely and diversify your portfolio to manage risk.'
    });
    setShowNewsPopup(true);
    
  }, [addNotification]);
  
  // Reference to notification timeouts for cleanup
  const notificationTimeoutRef = useRef<number[]>([]);
  
  // Start game
  const startGame = useCallback(() => {
    initializeGame();
    startGameTimer();
  }, [initializeGame, startGameTimer]);
  
  // Toggle pause
  const togglePause = useCallback(() => {
    setPaused(prev => {
      const newPaused = !prev;
      
      if (newPaused) {
        addNotification('Game paused', 'info');
      } else {
        addNotification('Game resumed', 'info');
      }
      
      return newPaused;
    });
  }, [addNotification]);
  
  // Handle trading
  const handleTrade = useCallback((asset: AssetType, action: string, quantity: number | any) => {
    let updatedPortfolio = { ...portfolio };
    let updatedAssetData = { ...assetData };
    let tradeValue = 0;
    let profitLoss = 0;
    
    // Convert percentage to actual quantity if needed
    let actualQuantity = quantity;
    if (typeof quantity === 'number' && quantity <= 1 && quantity > 0) {
      // If quantity is between 0 and 1, treat it as a percentage
      if (action === 'buy') {
        actualQuantity = Math.floor((portfolio.cash * quantity) / assetPrices[asset]);
      } else if (action === 'sell' && updatedAssetData.quantities[asset]) {
        actualQuantity = Math.floor(updatedAssetData.quantities[asset]! * quantity);
      } else if (action === 'cover' && updatedAssetData.shorts[asset]?.active) {
        actualQuantity = quantity * updatedAssetData.shorts[asset]!.value;
      }
    }
    
    // Process trade based on action
    switch(action) {
      case 'buy':
        // Calculate cost
        tradeValue = actualQuantity * assetPrices[asset];
        
        // Check if enough cash
        if (tradeValue > updatedPortfolio.cash) {
          addNotification('Not enough cash for this purchase!', 'error');
          return false;
        }
        
        // Update portfolio
        updatedPortfolio.cash -= tradeValue;
        updatedAssetData.quantities[asset] = (updatedAssetData.quantities[asset] || 0) + actualQuantity;
        
        // Record dollar cost average
        updatedAssetData.dollarValues[asset] = (updatedAssetData.dollarValues[asset] || 0) + tradeValue;
        
        addNotification(`Bought ${actualQuantity} ${asset} for ${formatCurrency(tradeValue)}`, 'success');
        break;
      
      case 'sell':
        // Check if enough assets
        const currentQuantity = updatedAssetData.quantities[asset] || 0;
        if (actualQuantity > currentQuantity) {
          addNotification(`Not enough ${asset} to sell!`, 'error');
          return false;
        }
        
        // Calculate return
        tradeValue = actualQuantity * assetPrices[asset];
        
        // Calculate profit/loss
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
        
        const profitText = profitLoss >= 0 
          ? `Profit: ${formatCurrency(profitLoss)}` 
          : `Loss: ${formatCurrency(Math.abs(profitLoss))}`;
        
        addNotification(`Sold ${actualQuantity} ${asset} for ${formatCurrency(tradeValue)}. ${profitText}`, 
          profitLoss >= 0 ? 'success' : 'warning');
        
        break;
      
      case 'short':
        // Short selling (betting price will go down)
        // Requires margin (we'll use 50% margin)
        const margin = actualQuantity * 0.5;
        
        if (margin > updatedPortfolio.cash) {
          addNotification('Not enough cash for margin requirement!', 'error');
          return false;
        }
        
        // Create short position
        updatedAssetData.shorts[asset] = {
          value: actualQuantity,
          price: assetPrices[asset],
          active: true
        };
        
        // Deduct margin from cash
        updatedPortfolio.cash -= margin;
        
        addNotification(`Opened short position on ${asset} for ${formatCurrency(actualQuantity)}`, 'transaction');
        break;
      
      case 'cover':
        // Close a short position
        if (!updatedAssetData.shorts[asset] || !updatedAssetData.shorts[asset]?.active) {
          addNotification('No open short position to cover!', 'error');
          return false;
        }
        
        const shortPosition = updatedAssetData.shorts[asset]!;
        const entryPrice = shortPosition.price;
        const currentPrice = assetPrices[asset];
        const positionSize = typeof actualQuantity === 'number' && actualQuantity <= 1 
          ? shortPosition.value * actualQuantity 
          : shortPosition.value;
        
        // Calculate profit/loss (shorts profit when price goes down)
        const priceDifference = entryPrice - currentPrice;
        profitLoss = (priceDifference / entryPrice) * positionSize;
        
        // Add margin back to cash plus profit or minus loss
        const marginReturned = positionValue * 0.5;
        updatedPortfolio.cash += marginReturned + profitLoss;
        
        // Close position
        if (typeof actualQuantity === 'number' && actualQuantity < 1) {
          // Partial close
          updatedAssetData.shorts[asset] = {
            ...shortPosition,
            value: shortPosition.value - positionSize
          };
          
          if (updatedAssetData.shorts[asset]!.value <= 0) {
            updatedAssetData.shorts[asset]!.active = false;
          }
        } else {
          // Full close
          updatedAssetData.shorts[asset] = {
            value: 0,
            price: 0,
            active: false
          };
        }
        
        const resultText = profitLoss >= 0 
          ? `Profit: ${formatCurrency(profitLoss)}` 
          : `Loss: ${formatCurrency(Math.abs(profitLoss))}`;
        
        addNotification(`Closed short position on ${asset}. ${resultText}`, 
          profitLoss >= 0 ? 'success' : 'warning');
        
        // Check short master achievement
        if (profitLoss > 0 && !achievements.shortMaster.unlocked) {
          const updatedAchievements = { ...achievements };
          updatedAchievements.shortMaster.unlocked = true;
          setAchievements(updatedAchievements);
          addNotification('Achievement Unlocked: Short Master', 'achievement');
        }
        
        break;
    }
    
    // Update portfolio
    setPortfolio(updatedPortfolio);
    setAssetData(updatedAssetData);
    
    // Update game stats
    setGameStats(prev => {
      const updatedStats = { ...prev };
      updatedStats.tradesExecuted += 1;
      updatedStats.tradesPerRound = (prev.tradesPerRound + 1);
      
      if (profitLoss > 0) {
        updatedStats.profitableTrades += 1;
        
        // First profit achievement
        if (!achievements.firstProfit.unlocked) {
          const updatedAchievements = { ...achievements };
          updatedAchievements.firstProfit.unlocked = true;
          setAchievements(updatedAchievements);
          addNotification('Achievement Unlocked: First Profit', 'achievement');
        }
      }
      
      if (profitLoss > prev.biggestGain) {
        updatedStats.biggestGain = profitLoss;
      }
      
      if (profitLoss < 0 && Math.abs(profitLoss) > Math.abs(prev.biggestLoss)) {
        updatedStats.biggestLoss = profitLoss;
      }
      
      return updatedStats;
    });
    
    // Check achievements after trade
    checkAchievements();
    
    return true;
  }, [portfolio, assetData, assetPrices, formatCurrency, addNotification, achievements, checkAchievements]);
  
  // Handle special market opportunity
  const handleOpportunity = useCallback((opportunity: MarketOpportunity) => {
    // Each opportunity type can have different effects
    switch(opportunity.type) {
      case 'double':
        // Double or nothing - 50% chance to double investment, 50% to lose it
        const investmentAmount = Math.min(portfolio.cash * 0.25, 1000); // Limit to 25% of cash or $1000
        const success = Math.random() >= 0.5;
        
        if (success) {
          // Double the investment
          setPortfolio(prev => ({
            ...prev,
            cash: prev.cash + investmentAmount
          }));
          addNotification(`Double or Nothing: You won ${formatCurrency(investmentAmount)}!`, 'success');
        } else {
          // Lose the investment
          setPortfolio(prev => ({
            ...prev,
            cash: prev.cash - investmentAmount
          }));
          addNotification(`Double or Nothing: You lost ${formatCurrency(investmentAmount)}`, 'error');
        }
        break;
      
      case 'insider':
        // Insider tip - buy the asset with a guaranteed profit
        handleTrade(opportunity.asset, 'buy', portfolio.cash * 0.3);
        
        // Force a price increase on this asset in the next update
        setTimeout(() => {
          setAssetPrices(prev => {
            const newPrices = { ...prev };
            newPrices[opportunity.asset] = Math.round(newPrices[opportunity.asset] * 1.2); // 20% gain
            
            // Update price history
            setPriceHistory(prevHistory => ({
              ...prevHistory,
              [opportunity.asset]: [...(prevHistory[opportunity.asset] || []), newPrices[opportunity.asset]]
            }));
            
            return newPrices;
          });
          
          addNotification(`${opportunity.asset.charAt(0).toUpperCase() + opportunity.asset.slice(1)} prices surged 20%!`, 'success');
        }, 5000);
        break;
      
      case 'hedge':
        // Automatically buy some gold as a hedge
        handleTrade('gold', 'buy', portfolio.cash * 0.2);
        break;
      
      case 'leverage':
        // Leverage play - higher risk, higher reward
        // Implementation depends on your game mechanics
        addNotification('Leverage opportunity accepted', 'info');
        break;
      
      case 'short':
        // Open a short position on the specified asset
        const shortAmount = portfolio.cash * 1.5; // Can short more than cash due to leverage
        handleTrade(opportunity.asset, 'short', shortAmount);
        
        // Force a price decrease on this asset in the next update
        setTimeout(() => {
          setAssetPrices(prev => {
            const newPrices = { ...prev };
            newPrices[opportunity.asset] = Math.round(newPrices[opportunity.asset] * 0.85); // 15% drop
            
            // Update price history
            setPriceHistory(prevHistory => ({
              ...prevHistory,
              [opportunity.asset]: [...(prevHistory[opportunity.asset] || []), newPrices[opportunity.asset]]
            }));
            
            return newPrices;
          });
          
          addNotification(`${opportunity.asset.charAt(0).toUpperCase() + opportunity.asset.slice(1)} prices dropped 15%!`, 'warning');
        }, 5000);
        break;
      
      default:
        // Generic handling for other opportunity types
        addNotification(`${opportunity.title} opportunity accepted`, 'info');
        break;
    }
    
    // Clear the opportunity
    setMarketOpportunity(null);
    
    return true;
  }, [portfolio, handleTrade, addNotification, formatCurrency]);
  
  // Handle end game
  const handleEndGame = useCallback(() => {
    // Clear all timers
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    
    if (marketUpdateRef.current) {
      clearInterval(marketUpdateRef.current);
      marketUpdateRef.current = null;
    }
    
    // Calculate final portfolio value
    const finalValue = calculatePortfolioValue();
    const initialCash = 10000;
    const returnPercentage = ((finalValue - initialCash) / initialCash) * 100;
    
    // Calculate best and worst performing assets
    let bestAsset = '';
    let worstAsset = '';
    let bestReturn = -Infinity;
    let worstReturn = Infinity;
    
    Object.keys(assetPrices).forEach(asset => {
      const assetKey = asset as AssetType;
      const history = priceHistory[assetKey] || [];
      
      if (history.length >= 2) {
        const initialPrice = history[0];
        const finalPrice = history[history.length - 1];
        const returnPct = ((finalPrice - initialPrice) / initialPrice) * 100;
        
        if (returnPct > bestReturn) {
          bestReturn = returnPct;
          bestAsset = asset.charAt(0).toUpperCase() + asset.slice(1);
        }
        
        if (returnPct < worstReturn) {
          worstReturn = returnPct;
          worstAsset = asset.charAt(0).toUpperCase() + asset.slice(1);
        }
      }
    });
    
    // Set final results
    setGameResult({
      finalValue,
      returnPercentage,
      bestAsset,
      worstAsset,
      bestReturn,
      worstReturn
    });
    
    // Check for crash survivor achievement if applicable
    if (gameStats.marketCrashesWeathered > 0 && returnPercentage > 0 && !achievements.marketCrash.unlocked) {
      const updatedAchievements = { ...achievements };
      updatedAchievements.marketCrash.unlocked = true;
      setAchievements(updatedAchievements);
      addNotification('Achievement Unlocked: Crash Survivor', 'achievement');
    }
    
    // Set paused state
    setPaused(true);
    
    // Show end game notification
    addNotification('Game over! Check your results.', 'info');
    
    return true;
  }, [calculatePortfolioValue, priceHistory, assetPrices, gameStats, achievements, addNotification]);
  
  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
      
      if (marketUpdateRef.current) {
        clearInterval(marketUpdateRef.current);
      }
      
      notificationTimeoutRef.current.forEach(id => clearTimeout(id));
    };
  }, []);
  
  // Calculate portfolio value whenever relevant state changes
  useEffect(() => {
    const currentValue = calculatePortfolioValue();
    setPortfolio(prev => ({ ...prev, netWorth: currentValue }));
  }, [assetPrices, assetData, calculatePortfolioValue]);
  
  // Create the context value
  const contextValue: GameContextProps = {
    // Game state
    gameMode,
    setGameMode,
    difficulty,
    setDifficulty,
    round,
    totalRounds,
    timer,
    paused,
    
    // Portfolio data
    portfolio,
    assetPrices,
    assetData,
    
    // Market data
    assetTrends,
    priceHistory,
    currentNews,
    newsHistory,
    marketOpportunity,
    
    // UI state
    notifications,
    showNewsPopup,
    setShowNewsPopup,
    newsPopup,
    showMarketAlert,
    setShowMarketAlert,
    marketAlert,
    settings,
    
    // Game functions
    startGame,
    togglePause,
    handleTrade,
    handleOpportunity,
    handleEndGame,
    calculatePortfolioValue,
    
    // Utility functions
    formatCurrency,
    formatTime,
    
    // Results and stats
    gameStats,
    gameResult,
    achievements
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};
