// src/utils/marketLogic.ts
// DO NOT IMPORT FROM GAMECONTEXT OR ANY FILE THAT IMPORTS GAMECONTEXT

// Define types locally to avoid circular dependencies
type AssetType = 'stocks' | 'oil' | 'gold' | 'crypto';

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

interface NewsEvent {
  title: string;
  message: string;
  impact: {
    [key in AssetType]?: number;
  };
  tip?: string;
  isCrash?: boolean;
}

// Initial asset prices - defined here to avoid imports
const INITIAL_ASSET_PRICES: AssetPrices = {
  stocks: 240,
  oil: 65,
  gold: 1850,
  crypto: 29200
};

// Asset volatility configuration
const ASSET_VOLATILITY = {
  stocks: 0.15,  // Moderate volatility
  oil: 0.18,     // High volatility
  gold: 0.12,    // Low volatility (more stable)
  crypto: 0.25   // Very high volatility
};

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    volatilityMultiplier: 0.7,
    startingCash: 12000,
    newsFrequency: 0.7,
    crashChance: 0.05,
    roundTime: 75 // seconds
  },
  normal: {
    volatilityMultiplier: 1.0,
    startingCash: 10000,
    newsFrequency: 1.0,
    crashChance: 0.1,
    roundTime: 60 // seconds
  },
  hard: {
    volatilityMultiplier: 1.5,
    startingCash: 8000,
    newsFrequency: 1.3,
    crashChance: 0.15,
    roundTime: 45 // seconds
  }
};

// Sample news events
const NEWS_EVENTS: NewsEvent[] = [
  {
    title: "TECH RALLY",
    message: "Technology sector shows strong growth after positive earnings reports.",
    impact: { stocks: 1.08, oil: 1.01, gold: 0.98, crypto: 1.03 },
    tip: "Consider investing in tech stocks to capitalize on the momentum."
  },
  {
    title: "CRYPTO REGULATION",
    message: "New regulatory framework announced for cryptocurrencies.",
    impact: { stocks: 1.0, oil: 1.0, gold: 1.04, crypto: 0.85 },
    tip: "Regulatory changes often create short-term volatility but long-term stability."
  },
  {
    title: "OIL SUPPLY CRISIS",
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
  }
];

// Market opportunities
const MARKET_OPPORTUNITIES = [
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
  }
];

/**
 * Generate a random news event
 * @param {string} difficulty - Game difficulty level
 * @param {boolean} forceCrash - Force a market crash event
 * @returns {NewsEvent} The selected news event
 */
export const generateNewsEvent = (difficulty: string = 'normal', forceCrash: boolean = false): NewsEvent => {
  // Get the crash chance based on difficulty
  const difficultySettings = DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS] || DIFFICULTY_SETTINGS.normal;
  const crashChance = difficultySettings.crashChance;
  
  // Determine if this is a crash event (or if forced)
  const isCrashEvent = forceCrash || Math.random() < crashChance;
  
  if (isCrashEvent) {
    // Filter only crash events
    const crashEvents = NEWS_EVENTS.filter(event => event.isCrash);
    if (crashEvents.length > 0) {
      return crashEvents[Math.floor(Math.random() * crashEvents.length)];
    }
  }
  
  // Select a regular event (not a crash)
  const regularEvents = NEWS_EVENTS.filter(event => !event.isCrash);
  return regularEvents[Math.floor(Math.random() * regularEvents.length)];
};

/**
 * Update market prices based on trends, volatility, and news impact
 * @param {AssetPrices} currentPrices - Current asset prices
 * @param {AssetTrends} currentTrends - Current market trends
 * @param {object} newsImpact - News impact modifiers
 * @param {string} difficulty - Game difficulty level
 * @returns {object} Updated prices and trends
 */
export const updateMarketPrices = (
  currentPrices: AssetPrices, 
  currentTrends: AssetTrends, 
  newsImpact: any = null,
  difficulty: string = 'normal'
): { prices: AssetPrices, trends: AssetTrends } => {
  // Get difficulty settings
  const difficultySettings = DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS] || DIFFICULTY_SETTINGS.normal;
  const volatilityMultiplier = difficultySettings.volatilityMultiplier;
  
  // Clone the current prices and trends to avoid mutations
  const updatedPrices = { ...currentPrices };
  const updatedTrends = { ...currentTrends };
  
  // Update each asset
  Object.keys(updatedPrices).forEach(assetKey => {
    const asset = assetKey as AssetType;
    const currentTrend = updatedTrends[asset];
    
    // Base volatility adjusted by difficulty
    const baseVolatility = ASSET_VOLATILITY[asset] * volatilityMultiplier;
    
    // Random change between -10% and +10%
    const changePercent = (Math.random() * 0.2) - 0.1;
    
    // Apply news impact if present
    const impactMultiplier = newsImpact && newsImpact[asset] ? newsImpact[asset] - 1 : 0;
    const totalChange = changePercent + impactMultiplier;
    
    // Set minimum price floors
    let minPrice: number;
    switch(asset) {
      case 'crypto': minPrice = 1000; break;
      case 'gold': minPrice = 500; break;
      case 'oil': minPrice = 10; break;
      case 'stocks': minPrice = 50; break;
      default: minPrice = 1;
    }
    
    // Update price with rounding
    updatedPrices[asset] = Math.max(minPrice, Math.round(updatedPrices[asset] * (1 + totalChange)));
    
    // Occasionally change trends (15% chance)
    if (Math.random() < 0.15) {
      updatedTrends[asset] = {
        direction: Math.random() > 0.5 ? 'up' : 'down',
        strength: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3
      };
    }
  });
  
  return { prices: updatedPrices, trends: updatedTrends };
};

/**
 * Generate a market opportunity
 * @returns {object} Market opportunity
 */
export const generateMarketOpportunity = () => {
  // Simplified version to avoid dependencies
  return MARKET_OPPORTUNITIES[Math.floor(Math.random() * MARKET_OPPORTUNITIES.length)];
};

// Export constants for use elsewhere
export { INITIAL_ASSET_PRICES, ASSET_VOLATILITY, NEWS_EVENTS, MARKET_OPPORTUNITIES, DIFFICULTY_SETTINGS };
