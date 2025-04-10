import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_ASSET_PRICES } from '../utils/gameData';
import { generateNewsEvent, updateMarketPrices, generateMarketOpportunity } from '../utils/marketLogic';

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
  
  // Initialize game
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
  
  // Start game
  const startGame = useCallback(() => {
    initializeGame();
    startGameTimer();
    startMarketUpdates();
    generateNews();
  }, [initializeGame]);
  
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
        startMarketUpdates();
      }
      
      return newPaused;
    });
  }, []);
  
  // Start game timer
  const startGameTimer = useCallback(() => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    
    gameTimerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // End of round
          clearInterval(gameTimerRef.current!);
          
          if (round < totalRounds) {
            handleEndOfRound();
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
  
  // Start market updates
  const startMarketUpdates = useCallback(() => {
    if (marketUpdateRef.current) clearInterval(marketUpdateRef.current);
    
    const updateInterval = 10; // seconds between updates
    setMarketUpdateCountdown(updateInterval);
    
    marketUpdateRef.current = setInterval(() => {
      setMarketUpdateCountdown(prev => {
        if (prev <= 1) {
          updateMarket();
          return updateInterval;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);
  
  // Update market with increased volatility and more dynamic price changes
  const updateMarket = useCallback((newsImpact?: any) => {
    // This would use the actual updateMarketPrices function in a real implementation
    // For now, we'll just simulate price changes
    
    const updatedPrices = { ...assetPrices };
    const updatedHistory = { ...priceHistory };
    const updatedTrends = { ...assetTrends };
    
    // Update each asset price with higher volatility
    Object.keys(updatedPrices).forEach(assetKey => {
      const asset = assetKey as AssetType;
      const currentTrend = updatedTrends[asset];
      
      // Increased volatility - much higher than before
      let volatility: number;
      switch (asset) {
        case 'crypto':
          volatility = 0.25; // Extremely volatile
          break;
        case 'oil':
          volatility = 0.18; // Very volatile
          break;
        case 'stocks':
          volatility = 0.15; // Moderately volatile
          break;
        case 'gold':
          volatility = 0.12; // Somewhat stable but still moves
          break;
        default:
          volatility = 0.15;
      }
      
      // Apply difficulty modifier to volatility
      if (difficulty === 'easy') {
        volatility *= 0.7; // Lower volatility for easy mode
      } else if (difficulty === 'hard') {
        volatility *= 1.5; // Higher volatility for hard mode
      }
      
      // Calculate price change based on trend and randomness
      const trendFactor = currentTrend.direction === 'up' ? 1 : -1;
      const trendStrength = currentTrend.strength;
      
      // More extreme randomness for more exciting price movements
      const randomFactor = Math.random() * 2.5 - 1.25; // -1.25 to 1.25
      
      // Add occasional spikes for more dramatic price movements (5% chance)
      const spikeChance = Math.random();
      const spikeMultiplier = spikeChance < 0.05 ? (Math.random() * 2 + 2) : 1; // 2-4x multiplier on 5% of updates
      
      // Combine trend and randomness
      const changePercent = (trendFactor * trendStrength * 0.02 + randomFactor * volatility) * spikeMultiplier;
      
      // Apply news impact if present
      const impactMultiplier = newsImpact && newsImpact[asset] ? newsImpact[asset] - 1 : 0;
      const totalChange = changePercent + impactMultiplier;
      
      // Update price with a minimum floor to prevent negative or too-low prices
      let minPrice: number;
      switch (asset) {
        case 'crypto':
          minPrice = 1000;
          break;
        case 'gold':
          minPrice = 500;
          break;
        case 'oil':
          minPrice = 10;
          break;
        case 'stocks':
          minPrice = 50;
          break;
        default:
          minPrice = 1;
      }
      
      updatedPrices[asset] = Math.max(minPrice, Math.round(updatedPrices[asset] * (1 + totalChange)));
      
      // Update history
      updatedHistory[asset] = [...(updatedHistory[asset] || []), updatedPrices[asset]];
      
      // Change trend more frequently (15% chance instead of 10%)
      if (Math.random() < 0.15) {
        updatedTrends[asset] = {
          direction: Math.random() > 0.5 ? 'up' : 'down',
          strength: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3
        };
      }
    });
    
    // Update state
    setAssetPrices(updatedPrices);
    setPriceHistory(updatedHistory);
    setAssetTrends(updatedTrends);
    
    // Increased chance to generate market opportunity (10% instead of 5%)
    if (Math.random() < 0.1 && !marketOpportunity) {
      generateMarketOpportunity();
    }
    
    // Check achievements
    checkAchievements();
  }, [assetPrices, priceHistory, assetTrends, marketOpportunity, difficulty]);
  
  // Generate market opportunity with more varied options
  const generateMarketOpportunity = useCallback(() => {
    const opportunityTypes = [
      {
        type: 'double',
        title: 'Double or Nothing!',
        description: 'Take a chance for big gains, but beware of potential losses...',
        actionText: 'DOUBLE OR NOTHING',
        asset: 'crypto' as AssetType,
        risk: 'high' as const
      },
      {
        type: 'insider',
        title: 'Insider Tip',
        description: 'You\'ve heard a reliable tip about an upcoming price movement.',
        actionText: 'ACT ON TIP',
        asset: 'stocks' as AssetType,
        risk: 'medium' as const
      },
      {
        type: 'hedge',
        title: 'Hedging Opportunity',
        description: 'A perfect chance to protect against market downturns.',
        actionText: 'HEDGE NOW',
        asset: 'gold' as AssetType,
        risk: 'low' as const
      },
      {
        type: 'leverage',
        title: 'Leverage Play',
        description: 'Use leverage to multiply your potential returns, but be careful!',
        actionText: 'LEVERAGE UP',
        asset: 'oil' as AssetType,
        risk: 'high' as const
      }
    ];
    
    // Randomly select opportunity type
    const selectedOpportunity = opportunityTypes[Math.floor(Math.random() * opportunityTypes.length)];
    
    // Randomly select asset if not specified
    if (selectedOpportunity.type !== 'double') {
      const assets: AssetType[] = ['stocks', 'oil', 'gold', 'crypto'];
      selectedOpportunity.asset = assets[Math.floor(Math.random() * assets.length)];
    }
    
    setMarketOpportunity(selectedOpportunity);
    
    // Notify the user
    addNotification(`New opportunity: ${selectedOpportunity.title}`, 'info');
  }, [addNotification]);
  
  // Generate news with an expanded set of market events
  const generateNews = useCallback(() => {
    // Much expanded news events array with varied impacts
    const newsEvents = [
      {
        title: "TECH STOCKS RALLY!",
        message: "Technology sector shows strong growth after positive earnings reports.",
        impact: { stocks: 1.08, oil: 1.01, gold: 0.98, crypto: 1.03 },
        tip: "Consider investing in tech stocks to capitalize on the momentum."
      },
      {
        title: "CRYPTO REGULATION NEWS",
        message: "New regulatory framework announced for cryptocurrencies.",
        impact: { stocks: 1.0, oil: 1.0, gold: 1.04, crypto: 0.85 },
        tip: "Regulatory changes often create short-term volatility but long-term stability."
      },
      {
        title: "OIL PRICES SURGE",
        message: "Global supply constraints push oil prices higher.",
        impact: { stocks: 0.97, oil: 1.12, gold: 1.02, crypto: 0.99 },
        tip: "Energy price increases can affect various sectors differently."
      },
      {
        title: "MARKET CRASH!",
        message: "Major market indices plummet as investor panic spreads!",
        impact: { stocks: 0.75, oil: 0.82, gold: 1.15, crypto: 0.70 },
        tip: "During market crashes, defensive assets like gold often outperform.",
        isCrash: true
      },
      {
        title: "GLOBAL INFLATION RISING",
        message: "Central banks warn of increasing inflation across major economies.",
        impact: { stocks: 0.96, oil: 1.04, gold: 1.09, crypto: 1.03 },
        tip: "Gold and other hard assets are traditional inflation hedges."
      },
      {
        title: "TECH BUBBLE BURSTING?",
        message: "Analysts warn tech valuations are unsustainable as selling accelerates.",
        impact: { stocks: 0.88, oil: 0.96, gold: 1.03, crypto: 0.90 },
        tip: "Sector rotation can provide opportunities during tech corrections."
      },
      {
        title: "CRYPTOCURRENCY ADOPTION SURGES",
        message: "Major retailers announce acceptance of multiple cryptocurrencies.",
        impact: { stocks: 1.02, oil: 0.99, gold: 0.97, crypto: 1.18 },
        tip: "Increased adoption tends to drive cryptocurrency valuations higher."
      },
      {
        title: "OIL PRODUCTION CUTS",
        message: "OPEC+ announces significant production cuts effective immediately.",
        impact: { stocks: 0.97, oil: 1.14, gold: 1.02, crypto: 0.98 },
        tip: "Production cuts typically lead to sustained higher prices."
      },
      {
        title: "GOLD RESERVE DISCOVERIES",
        message: "Major new gold reserve discovered in South America.",
        impact: { stocks: 1.01, oil: 0.99, gold: 0.88, crypto: 1.02 },
        tip: "Supply increases can temporarily depress commodity prices."
      },
      {
        title: "CRYPTO MINING REGULATIONS",
        message: "New environmental regulations target crypto mining operations.",
        impact: { stocks: 1.0, oil: 1.02, gold: 1.01, crypto: 0.86 },
        tip: "Consider the environmental impact factors in crypto investing."
      },
      {
        title: "STOCK MARKET BULL RUN",
        message: "Major indices hit all-time highs as optimism spreads.",
        impact: { stocks: 1.09, oil: 1.04, gold: 0.96, crypto: 1.05 },
        tip: "Bull markets can extend longer than expected but watch for overheating."
      },
      {
        title: "CENTRAL BANK RATE HIKE",
        message: "Federal Reserve announces unexpected interest rate increase.",
        impact: { stocks: 0.93, oil: 0.96, gold: 1.05, crypto: 0.92 },
        tip: "Higher interest rates typically pressure growth assets but support yield-sensitive investments."
      },
      {
        title: "GEOPOLITICAL TENSIONS RISING",
        message: "Conflict escalates in key oil-producing region.",
        impact: { stocks: 0.95, oil: 1.10, gold: 1.07, crypto: 0.98 },
        tip: "Geopolitical instability often benefits 'safe haven' assets."
      },
      {
        title: "INSTITUTIONAL CRYPTO INVESTMENT",
        message: "Major investment banks announce Bitcoin treasury holdings.",
        impact: { stocks: 1.02, oil: 0.99, gold: 0.96, crypto: 1.15 },
        tip: "Institutional adoption signals longer-term cryptocurrency legitimacy."
      },
      {
        title: "GLOBAL ECONOMIC GROWTH SLOWS",
        message: "IMF revises global growth projections downward.",
        impact: { stocks: 0.94, oil: 0.91, gold: 1.04, crypto: 0.95 },
        tip: "Economic slowdowns often lead to more accommodative monetary policy."
      }
    ];
    
    // Randomly select a news event with weighted probability
    // Market crashes should be less frequent (10% chance if random < 0.1)
    let selectedNews;
    const crashChance = Math.random();
    
    if (crashChance < 0.1) {
      // Select a crash event
      selectedNews = newsEvents.find(news => news.isCrash) || newsEvents[0];
      
      // Track market crash for stats/achievements
      setGameStats(prev => ({
        ...prev,
        marketCrashesWeathered: prev.marketCrashesWeathered + 1
      }));
    } else {
      // Filter out crash events for normal selection
      const normalNews = newsEvents.filter(news => !news.isCrash);
      selectedNews = normalNews[Math.floor(Math.random() * normalNews.length)];
    }
    
    // Update news state
    setNewsPopup(selectedNews);
    setCurrentNews({
      message: selectedNews.title,
      impact: selectedNews.impact
    });
    
    // Show news popup
    setShowNewsPopup(true);
    
    // Apply market effects with a delay
    setTimeout(() => {
      updateMarket(selectedNews.impact);
    }, 4000);
  }, [updateMarket]);
  
  // Handle trade with improved calculations and feedback
  const handleTrade = useCallback((asset: AssetType, action: string, quantity: any) => {
    let updatedPortfolio = { ...portfolio };
    let updatedAssetData = { ...assetData };
    let wasProfitable = false;
    
    const price = assetPrices[asset];
    const currentQuantity = assetData.quantities[asset] || 0;
    
    // Execute trade based on action
    if (action === 'buy') {
      // Calculate cost
      let cost;
      let actualQuantity = quantity;
      
      if (typeof quantity === 'number' && quantity <= 1) {
        // Percentage of cash
        cost = updatedPortfolio.cash * quantity;
        actualQuantity = cost / price;
      } else if (quantity === 'double') {
        // Double down - double current position or 50% if none
        const currentPosition = currentQuantity * price;
        cost = currentPosition > 0 ? currentPosition : updatedPortfolio.cash * 0.5;
        actualQuantity = cost / price;
      } else {
        // Specific quantity
        cost = quantity * price;
      }
      
      // Check if enough cash
      if (cost > updatedPortfolio.cash) {
        addNotification('Not enough cash for this purchase!', 'error');
        return;
      }
      
      // Update portfolio
      updatedPortfolio.cash -= cost;
      updatedAssetData.quantities[asset] = (currentQuantity || 0) + actualQuantity;
      updatedAssetData.dollarValues[asset] = (updatedAssetData.dollarValues[asset] || 0) + cost;
      
      addNotification(`Bought ${asset === 'crypto' ? actualQuantity.toFixed(4) : actualQuantity.toFixed(2)} ${asset} for ${formatCurrency(cost)}`, 'success');
    } 
    else if (action === 'sell') {
      // Calculate quantity to sell
      let quantityToSell;
      if (quantity <= 1) {
        // Percentage of holdings
        quantityToSell = currentQuantity * quantity;
      } else {
        // Specific quantity
        quantityToSell = Math.min(quantity, currentQuantity);
      }
      
      // Check if enough assets to sell
      if (quantityToSell > currentQuantity) {
        addNotification('Not enough assets to sell!', 'error');
        return;
      }
      
      // Calculate return
      const saleReturn = quantityToSell * price;
      
      // Calculate profit/loss
      const costBasis = (updatedAssetData.dollarValues[asset] || 0) * (quantityToSell / currentQuantity);
      const profitLoss = saleReturn - costBasis;
      wasProfitable = profitLoss > 0;
      
      // Update stats for profit/loss
      if (wasProfitable) {
        setGameStats(prev => ({
          ...prev,
          profitableTrades: prev.profitableTrades + 1,
          biggestGain: Math.max(prev.biggestGain, profitLoss)
        }));
      } else {
        setGameStats(prev => ({
          ...prev,
          biggestLoss: Math.min(prev.biggestLoss, profitLoss)
        }));
      }
      
      // Update portfolio
      updatedPortfolio.cash += saleReturn;
      updatedAssetData.quantities[asset] = currentQuantity - quantityToSell;
      updatedAssetData.dollarValues[asset] = (updatedAssetData.dollarValues[asset] || 0) * (1 - (quantityToSell / currentQuantity));
      
      // Display more detailed notification
      const profitLossText = wasProfitable ? 
        `Profit: ${formatCurrency(profitLoss)}` : 
        `Loss: ${formatCurrency(Math.abs(profitLoss))}`;
      
      addNotification(`Sold ${asset === 'crypto' ? quantityToSell.toFixed(4) : quantityToSell.toFixed(2)} ${asset} for ${formatCurrency(saleReturn)}. ${profitLossText}`, wasProfitable ? 'success' : 'info');
    }
    // New feature: Short selling
    else if (action === 'short') {
      // Calculate short position size
      let positionSize;
      
      if (typeof quantity === 'number' && quantity <= 1) {
        // Percentage of cash
        positionSize = updatedPortfolio.cash * quantity;
      } else {
        // Specific value
        positionSize = Math.min(quantity, updatedPortfolio.cash);
      }
      
      // Check if enough cash for margin
      if (positionSize > updatedPortfolio.cash * 0.5) { // Require 50% margin
        addNotification('Not enough cash for margin requirement!', 'error');
        return;
      }
      
      // Update portfolio
      updatedPortfolio.cash -= positionSize * 0.5; // 50% margin requirement
      
      // Record short position
      updatedAssetData.shorts[asset] = {
        value: positionSize,
        price: price, // Entry price
        active: true
      };
      
      addNotification(`Opened short position on ${asset} worth ${formatCurrency(positionSize)}`, 'info');
    }
    // Close short position
    else if (action === 'cover') {
      const shortPosition = updatedAssetData.shorts[asset];
      
      if (!shortPosition || !shortPosition.active) {
        addNotification('No active short position to cover!', 'error');
        return;
      }
      
      // Calculate profit/loss
      const entryPrice = shortPosition.price;
      const currentPrice = price;
      const positionValue = shortPosition.value;
      
      const priceChange = (entryPrice - currentPrice) / entryPrice;
      const profitLoss = positionValue * priceChange * 2; // 2x leverage on shorts
      wasProfitable = profitLoss > 0;
      
      // Close position
      updatedPortfolio.cash += positionValue * 0.5 + profitLoss; // Return margin + profit/loss
      updatedAssetData.shorts[asset] = {
        value: 0,
        price: 0,
        active: false
      };
      
      // Update stats
      if (wasProfitable) {
        setGameStats(prev => ({
          ...prev,
          profitableTrades: prev.profitableTrades + 1,
          biggestGain: Math.max(prev.biggestGain, profitLoss)
        }));
        
        // Achievement for profitable short
        unlockAchievement('shortMaster');
      } else {
        setGameStats(prev => ({
          ...prev,
          biggestLoss: Math.min(prev.biggestLoss, profitLoss)
        }));
      }
      
      // Notification with profit/loss details
      const resultText = wasProfitable ? 
        `Profit: ${formatCurrency(profitLoss)}` : 
        `Loss: ${formatCurrency(Math.abs(profitLoss))}`;
      
      addNotification(`Closed short position on ${asset}. ${resultText}`, wasProfitable ? 'success' : 'error');
    }
    
    // Update stats
    setGameStats(prev => ({
      ...prev,
      tradesExecuted: prev.tradesExecuted + 1,
      tradesPerRound: prev.tradesPerRound + 1
    }));
    
    // Update state
    setPortfolio(updatedPortfolio);
    setAssetData(updatedAssetData);
    
    // Check achievements
    checkAchievements();
  }, [portfolio, assetData, assetPrices, addNotification, formatCurrency]);
  
  // Handle opportunity with enhanced mechanics and feedback
  const handleOpportunity = useCallback((opportunity: MarketOpportunity) => {
    if (opportunity.type === 'double') {
      // Double or nothing - 50% chance to double investment, 50% chance to lose it
      const asset = opportunity.asset;
      const outcome = Math.random() > 0.5;
      
      if (outcome) {
        // Double - buy with 50% of cash and get bonus 50%
        const cashToSpend = portfolio.cash * 0.5;
        const quantity = cashToSpend / assetPrices[asset];
        const bonusQuantity = quantity;
        
        // Update portfolio
        setPortfolio(prev => ({ ...prev, cash: prev.cash - cashToSpend }));
        setAssetData(prev => ({
          ...prev,
          quantities: {
            ...prev.quantities,
            [asset]: (prev.quantities[asset] || 0) + quantity + bonusQuantity
          },
          dollarValues: {
            ...prev.dollarValues,
            [asset]: (prev.dollarValues[asset] || 0) + cashToSpend * 2
          }
        }));
        
        addNotification(`Double Success! Doubled your ${asset} investment!`, 'success');
      } else {
        // Nothing - lose 50% of cash
        const cashLost = portfolio.cash * 0.5;
        
        setPortfolio(prev => ({ ...prev, cash: prev.cash - cashLost }));
        addNotification(`Double Fail! Lost ${formatCurrency(cashLost)}`, 'error');
      }
    } 
    else if (opportunity.type === 'insider') {
      // Insider tip - high probability of success (80%)
      const asset = opportunity.asset;
      const outcome = Math.random() < 0.8;
      
      if (outcome) {
        // Success - guarantee a 30-50% gain on this position
        const cashToSpend = portfolio.cash * 0.4;
        const quantity = cashToSpend / assetPrices[asset];
        
        // Update portfolio
        setPortfolio(prev => ({ ...prev, cash: prev.cash - cashToSpend }));
        setAssetData(prev => ({
          ...prev,
          quantities: {
            ...prev.quantities,
            [asset]: (prev.quantities[asset] || 0) + quantity
          },
          dollarValues: {
            ...prev.dollarValues,
            [asset]: (prev.dollarValues[asset] || 0) + cashToSpend
          }
        }));
        
        // Boost this asset's price on next update
        setTimeout(() => {
          const boost = Math.random() * 0.2 + 0.3; // 30-50% gain
          const impact = { [asset]: 1 + boost };
          updateMarket(impact);
          addNotification(`Insider tip paid off! ${asset} prices jumped ${Math.round(boost * 100)}%!`, 'success');
        }, 5000);
      } else {
        // Tip was wrong - guarantee a 10-20% loss
        const cashToSpend = portfolio.cash * 0.3;
        const quantity = cashToSpend / assetPrices[asset];
        
        // Update portfolio
        setPortfolio(prev => ({ ...prev, cash: prev.cash - cashToSpend }));
        setAssetData(prev => ({
          ...prev,
          quantities: {
            ...prev.quantities,
            [asset]: (prev.quantities[asset] || 0) + quantity
          },
          dollarValues: {
            ...prev.dollarValues,
            [asset]: (prev.dollarValues[asset] || 0) + cashToSpend
          }
        }));
        
        // Drop this asset's price on next update
        setTimeout(() => {
          const drop = Math.random() * 0.1 + 0.1; // 10-20% loss
          const impact = { [asset]: 1 - drop };
          updateMarket(impact);
          addNotification(`Insider tip was wrong! ${asset} prices fell ${Math.round(drop * 100)}%!`, 'error');
        }, 5000);
      }
    }
    else if (opportunity.type === 'hedge') {
      // Auto-diversify portfolio to reduce risk
      const assets: AssetType[] = ['stocks', 'oil', 'gold', 'crypto'];
      const cashToSpend = portfolio.cash * 0.5;
      const perAsset = cashToSpend / assets.length;
      
      // Update portfolio
      setPortfolio(prev => ({ ...prev, cash: prev.cash - cashToSpend }));
      
      // Buy a balanced amount of each asset
      let updatedAssetData = { ...assetData };
      assets.forEach(asset => {
        const quantity = perAsset / assetPrices[asset];
        updatedAssetData.quantities[asset] = (updatedAssetData.quantities[asset] || 0) + quantity;
        updatedAssetData.dollarValues[asset] = (updatedAssetData.dollarValues[asset] || 0) + perAsset;
      });
      
      setAssetData(updatedAssetData);
      addNotification(`Portfolio hedged! Purchased a balanced mix of all asset types.`, 'success');
      
      // Unlock diversified achievement
      unlockAchievement('diversified');
    }
    else if (opportunity.type === 'leverage') {
      // Leverage play - higher risk/reward
      const asset = opportunity.asset;
      const outcome = Math.random() < 0.4; // 40% chance of success
      
      if (outcome) {
        // Big win - 3x return
        const cashToSpend = portfolio.cash * 0.3;
        const quantity = (cashToSpend * 3) / assetPrices[asset]; // 3x leverage
        
        // Update portfolio
        setPortfolio(prev => ({ ...prev, cash: prev.cash - cashToSpend }));
        setAssetData(prev => ({
          ...prev,
          quantities: {
            ...prev.quantities,
            [asset]: (prev.quantities[asset] || 0) + quantity
          },
          dollarValues: {
            ...prev.dollarValues,
            [asset]: (prev.dollarValues[asset] || 0) + cashToSpend * 3
          }
        }));
        
        addNotification(`Leverage success! Tripled your investment in ${asset}!`, 'success');
      } else {
        // Loss - lose entire investment
        const cashLost = portfolio.cash * 0.3;
        
        setPortfolio(prev => ({ ...prev, cash: prev.cash - cashLost }));
        addNotification(`Leverage failed! Lost ${formatCurrency(cashLost)}`, 'error');
      }
    }
    else {
      // Default - buy the asset with 25% of cash
      handleTrade(opportunity.asset, 'buy', 0.25);
    }
    
    // Clear the opportunity
    setMarketOpportunity(null);
  }, [portfolio, assetPrices, assetData, handleTrade, updateMarket, addNotification, formatCurrency, unlockAchievement]);
  
  // Handle end of round
  const handleEndOfRound = useCallback(() => {
    // Increase round number
    setRound(prev => prev + 1);
    
    // Reset trades per round counter
    setGameStats(prev => ({
      ...prev,
      tradesPerRound: 0
    }));
    
    // Generate news for next round
    generateNews();
    
    // Clear market opportunity
    setMarketOpportunity(null);
    
    // Add notification
    addNotification(`Round ${round} completed. Starting round ${round + 1}!`, 'info');
    
    // Restart timers
    startGameTimer();
    startMarketUpdates();
  }, [round, generateNews, addNotification, startGameTimer, startMarketUpdates]);
  
  // Handle end game
  const handleEndGame = useCallback(() => {
    // Clear timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (marketUpdateRef.current) clearInterval(marketUpdateRef.current);
    
    const finalValue = calculatePortfolioValue();
    const startingCash = 10000;
    const returnPercentage = ((finalValue - startingCash) / startingCash) * 100;
    
    // Calculate best and worst performing assets
    let bestAsset = "";
    let worstAsset = "";
    let bestReturn = -100;
    let worstReturn = 100;
    
    Object.entries(assetData.quantities).forEach(([asset, quantity]) => {
      if (quantity && quantity > 0 && assetData.dollarValues[asset as AssetType]) {
        const currentValue = quantity * assetPrices[asset as AssetType];
        const originalValue = assetData.dollarValues[asset as AssetType]!;
        
        if (originalValue > 0) {
          const assetReturn = ((currentValue - originalValue) / originalValue) * 100;
          
          if (assetReturn > bestReturn) {
            bestReturn = assetReturn;
            bestAsset = asset;
          }
          
          if (assetReturn < worstReturn) {
            worstReturn = assetReturn;
            worstAsset = asset;
          }
        }
      }
    });
    
    setGameResult({
      finalValue,
      returnPercentage,
      bestAsset: bestAsset || "None",
      worstAsset: worstAsset || "None",
      bestReturn,
      worstReturn
    });
    
    // Final achievements check
    if (returnPercentage >= 10) {
      unlockAchievement('tenPercent');
    }
    
    if (gameStats.marketCrashesWeathered > 0 && returnPercentage > 0) {
      unlockAchievement('marketCrash');
    }
    
    if (finalValue >= 15000) {
      unlockAchievement('wealthyInvestor');
    }
  }, [assetData, assetPrices, calculatePortfolioValue, gameStats.marketCrashesWeathered, unlockAchievement]);
  
  // Check achievements
  const checkAchievements = useCallback(() => {
    const portfolioValue = calculatePortfolioValue();
    
    // Check for first profitable trade
    if (gameStats.profitableTrades > 0 && !achievements.firstProfit.unlocked) {
      unlockAchievement('firstProfit');
    }
    
    // Check for diversified portfolio
    const hasAllAssets = Object.keys(assetPrices).every(asset => 
      (assetData.quantities[asset as AssetType] || 0) > 0
    );
    if (hasAllAssets && !achievements.diversified.unlocked) {
      unlockAchievement('diversified');
    }
    
    // Check for gold hoarder
    if ((assetData.quantities.gold || 0) >= 5 && !achievements.goldHoarder.unlocked) {
      unlockAchievement('goldHoarder');
    }
    
    // Check for risk taker (>50% in crypto)
    const cryptoValue = (assetData.quantities.crypto || 0) * assetPrices.crypto;
    if (cryptoValue > portfolioValue * 0.5 && !achievements.riskTaker.unlocked) {
      unlockAchievement('riskTaker');
    }
    
    // Check for wealthy investor
    if (portfolioValue >= 15000 && !achievements.wealthyInvestor.unlocked) {
      unlockAchievement('wealthyInvestor');
    }
    
    // Check for short master
    const hasActiveProfitableShort = Object.entries(assetData.shorts).some(([asset, position]) => {
      if (position && position.active) {
        const entryPrice = position.price;
        const currentPrice = assetPrices[asset as AssetType];
        return entryPrice > currentPrice; // Profitable if price decreased
      }
      return false;
    });
    
    if (hasActiveProfitableShort && !achievements.shortMaster.unlocked) {
      unlockAchievement('shortMaster');
    }
  }, [achievements, assetData, assetPrices, calculatePortfolioValue, gameStats.profitableTrades, unlockAchievement]);
  
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
