// src/context/GameContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Move direct imports of utility functions to avoid circular dependencies
// Import only the constant values directly
const INITIAL_ASSET_PRICES = {
  stocks: 240,
  oil: 65,
  gold: 1850,
  crypto: 29200
};

type AssetType = 'stocks' | 'oil' | 'gold' | 'crypto';

interface Portfolio {
  cash: number;
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

// Minimal required interfaces
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
  type: 'success' | 'error' | 'info' | 'achievement';
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
  };
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

// Default values for the context
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
  const [totalRounds, setTotalRounds] = useState(5);
  const [marketUpdateCountdown, setMarketUpdateCountdown] = useState(10);
  
  // News system
  const [currentNews, setCurrentNews] = useState({
    message: "Market news will appear here...",
    impact: {}
  });
  
  const [showNewsPopup, setShowNewsPopup] = useState(false);
  const [newsPopup, setNewsPopup] = useState<NewsItem>({
    title: '',
    message: '',
    impact: {}
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
  
  // Format currency display
  const formatCurrency = (value: number): string => {
    return '$' + Math.round(value).toLocaleString();
  };
  
  // Format time display (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate portfolio value
  const calculatePortfolioValue = useCallback((): number => {
    let total = portfolio.cash;
    
    // Add value of all owned assets
    Object.entries(assetData.quantities).forEach(([asset, quantity]) => {
      if (quantity && quantity > 0 && assetPrices[asset as AssetType]) {
        total += quantity * assetPrices[asset as AssetType];
      }
    });
    
    // Add value of short positions (including potential profit/loss)
    Object.entries(assetData.shorts).forEach(([asset, position]) => {
      if (position && position.active && assetPrices[asset as AssetType]) {
        const entryPrice = position.price;
        const currentPrice = assetPrices[asset as AssetType];
        const value = position.value;
        
        // Calculate profit/loss
        const priceChange = (entryPrice - currentPrice) / entryPrice;
        const profitLoss = value * priceChange * 2; // 2x leverage on shorts
        
        total += value + profitLoss;
      }
    });
    
    return total;
  }, [portfolio, assetData, assetPrices]);
  
  // Add notification
  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' | 'achievement' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);
  
  // Initialize game - SIMPLIFIED VERSION TO BREAK CIRCULAR DEPS
  const initializeGame = useCallback(() => {
    // Set starting cash
    setPortfolio({ cash: 10000 });
    
    // Reset asset quantities
    setAssetData({
      quantities: {},
      dollarValues: {},
      shorts: {}
    });
    
    // Initialize asset prices
    setAssetPrices(defaultAssetPrices);
    
    // Initialize price history
    setPriceHistory({
      stocks: [defaultAssetPrices.stocks],
      oil: [defaultAssetPrices.oil],
      gold: [defaultAssetPrices.gold],
      crypto: [defaultAssetPrices.crypto]
    });
    
    // Set rounds
    setTotalRounds(5);
    setRound(1);
    
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
    
    // Reset timer
    setTimer(60);
    setPaused(false);
  }, []);
  
  // Simply load our own dummy implementations to avoid circular dependencies
  
  // Start game
  const startGame = useCallback(() => {
    initializeGame();
    // Simplified versions to break circular deps
    startGameTimer();
    
    // Add a welcome notification to test if working
    addNotification("Game started! This is a demo version.", 'info');
  }, [initializeGame, addNotification]);
  
  // Toggle pause
  const togglePause = useCallback(() => {
    setPaused(prev => {
      const newPaused = !prev;
      
      if (newPaused) {
        // Pause timers
        if (gameTimerRef.current) clearInterval(gameTimerRef.current);
        if (marketUpdateRef.current) clearInterval(marketUpdateRef.current);
      } else {
        // Resume timers
        startGameTimer();
      }
      
      return newPaused;
    });
  }, []);
  
  // Start game timer (simplified)
  const startGameTimer = useCallback(() => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    
    gameTimerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // End of round
          clearInterval(gameTimerRef.current!);
          
          if (round < totalRounds) {
            // Just increment round for now
            setRound(r => r + 1);
            return 60; // Reset timer for next round
          } else {
            // End game
            handleEndGame();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
  }, [round, totalRounds]);
  
  // Update market with simple random changes
  const updateMarket = useCallback(() => {
    // Simplified to just make random price changes
    
    // Clone the current prices
    const updatedPrices = { ...assetPrices };
    const updatedHistory = { ...priceHistory };
    
    // Update each asset price with random changes
    Object.keys(updatedPrices).forEach(assetKey => {
      const asset = assetKey as AssetType;
      
      // Random -5% to +5% change
      const changePercent = (Math.random() * 0.1) - 0.05;
      
      // Update price with rounding to make it readable
      updatedPrices[asset] = Math.max(
        asset === 'crypto' ? 1000 : 10, 
        Math.round(updatedPrices[asset] * (1 + changePercent))
      );
      
      // Update history
      updatedHistory[asset] = [...(updatedHistory[asset] || []), updatedPrices[asset]];
    });
    
    // Update state
    setAssetPrices(updatedPrices);
    setPriceHistory(updatedHistory);
    
    // Add notification to test
    addNotification("Market prices updated", 'info');
  }, [assetPrices, priceHistory, addNotification]);
  
  // Simplified trade handling
  const handleTrade = useCallback((asset: AssetType, action: string, quantity: any) => {
    let updatedPortfolio = { ...portfolio };
    let updatedAssetData = { ...assetData };
    
    // Just handle basic buy/sell for now to avoid complexity
    if (action === 'buy') {
      // Calculate cost, assuming quantity is number of units
      const cost = quantity * assetPrices[asset];
      
      // Check if enough cash
      if (cost > updatedPortfolio.cash) {
        addNotification('Not enough cash for this purchase!', 'error');
        return;
      }
      
      // Update portfolio
      updatedPortfolio.cash -= cost;
      updatedAssetData.quantities[asset] = (updatedAssetData.quantities[asset] || 0) + quantity;
      
      addNotification(`Bought ${quantity} ${asset} for ${formatCurrency(cost)}`, 'success');
    } 
    else if (action === 'sell') {
      const currentQuantity = updatedAssetData.quantities[asset] || 0;
      
      // Check if enough assets to sell
      if (quantity > currentQuantity) {
        addNotification('Not enough assets to sell!', 'error');
        return;
      }
      
      // Calculate return
      const saleReturn = quantity * assetPrices[asset];
      
      // Update portfolio
      updatedPortfolio.cash += saleReturn;
      updatedAssetData.quantities[asset] = currentQuantity - quantity;
      
      addNotification(`Sold ${quantity} ${asset} for ${formatCurrency(saleReturn)}`, 'success');
    }
    
    // Update state
    setPortfolio(updatedPortfolio);
    setAssetData(updatedAssetData);
  }, [portfolio, assetData, assetPrices, addNotification, formatCurrency]);
  
  // Simplified opportunity handler
  const handleOpportunity = useCallback((opportunity: MarketOpportunity) => {
    // Just simulate buying the asset for now
    handleTrade(opportunity.asset, 'buy', 1);
    setMarketOpportunity(null);
  }, [handleTrade]);
  
  // Handle end game
  const handleEndGame = useCallback(() => {
    // Clear timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (marketUpdateRef.current) clearInterval(marketUpdateRef.current);
    
    const finalValue = calculatePortfolioValue();
    const startingCash = 10000;
    const returnPercentage = ((finalValue - startingCash) / startingCash) * 100;
    
    setGameResult({
      finalValue,
      returnPercentage,
      bestAsset: "None",
      worstAsset: "None",
      bestReturn: 0,
      worstReturn: 0
    });
    
    addNotification("Game over! Check your results.", 'info');
  }, [calculatePortfolioValue, addNotification]);
  
  // Unlock achievement
  const unlockAchievement = useCallback((id: string) => {
    if (achievements[id] && !achievements[id].unlocked) {
      setAchievements(prev => ({
        ...prev,
        [id]: { ...prev[id], unlocked: true }
      }));
      
      const achTitle = achievements[id].title;
      addNotification(`Achievement Unlocked: ${achTitle}!`, 'achievement');
    }
  }, [achievements, addNotification]);
  
  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (marketUpdateRef.current) clearInterval(marketUpdateRef.current);
    };
  }, []);
  
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
    
    // Portfolio
    portfolio,
    assetPrices,
    assetData,
    
    // Market
    assetTrends,
    priceHistory,
    currentNews,
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
