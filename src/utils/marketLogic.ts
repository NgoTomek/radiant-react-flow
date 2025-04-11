// src/utils/marketLogic.ts

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

// Initial asset prices - realistic values
const INITIAL_ASSET_PRICES: AssetPrices = {
  stocks: 240,   // Represents an index like S&P 500 at a scaled value
  oil: 65,       // Per barrel in USD
  gold: 1850,    // Per ounce in USD
  crypto: 29200  // Bitcoin in USD
};

// Asset volatility configuration - based on real-world historical volatility
const ASSET_VOLATILITY = {
  stocks: 0.015,  // Standard deviation per day ~1.5%
  oil: 0.025,     // Higher volatility ~2.5%
  gold: 0.01,     // Lower volatility ~1%
  crypto: 0.035   // Very high volatility ~3.5%
};

// Base correlations between assets (simplified)
const ASSET_CORRELATIONS = {
  stocks: { stocks: 1.0, oil: 0.4, gold: -0.2, crypto: 0.3 },
  oil: { stocks: 0.4, oil: 1.0, gold: 0.1, crypto: 0.2 },
  gold: { stocks: -0.2, oil: 0.1, gold: 1.0, crypto: -0.1 },
  crypto: { stocks: 0.3, oil: 0.2, gold: -0.1, crypto: 1.0 }
};

// Difficulty settings with more realistic parameters
const DIFFICULTY_SETTINGS = {
  easy: {
    volatilityMultiplier: 0.7,
    startingCash: 12000,
    newsFrequency: 0.7,
    crashChance: 0.03,
    roundTime: 75 // seconds
  },
  normal: {
    volatilityMultiplier: 1.0,
    startingCash: 10000,
    newsFrequency: 1.0,
    crashChance: 0.05,
    roundTime: 60 // seconds
  },
  hard: {
    volatilityMultiplier: 1.3,
    startingCash: 8000,
    newsFrequency: 1.3,
    crashChance: 0.08,
    roundTime: 45 // seconds
  }
};

// Sample news events with realistic impacts
const NEWS_EVENTS: NewsEvent[] = [
  {
    title: "FED RATE CUT",
    message: "Federal Reserve unexpectedly cuts interest rates by 25 basis points.",
    impact: { stocks: 1.02, oil: 1.01, gold: 1.03, crypto: 1.04 },
    tip: "Rate cuts often benefit stocks, precious metals, and crypto due to increased liquidity."
  },
  {
    title: "TECH EARNINGS BEAT",
    message: "Major tech companies report better than expected quarterly results.",
    impact: { stocks: 1.03, oil: 1.005, gold: 0.995, crypto: 1.02 },
    tip: "Positive tech earnings generally lift the entire stock market."
  },
  {
    title: "OIL SUPPLY DISRUPTION",
    message: "Geopolitical tensions disrupt oil supply routes in the Middle East.",
    impact: { stocks: 0.99, oil: 1.05, gold: 1.02, crypto: 0.99 },
    tip: "Oil supply constraints typically increase energy prices and boost safe havens like gold."
  },
  {
    title: "MARKET CRASH!",
    message: "Global markets plunge on liquidity concerns and economic uncertainty!",
    impact: { stocks: 0.85, oil: 0.88, gold: 1.08, crypto: 0.80 },
    tip: "During market crashes, diversification and holding cash can protect your portfolio.",
    isCrash: true
  },
  {
    title: "INFLATION REPORT",
    message: "Inflation data comes in higher than analyst expectations.",
    impact: { stocks: 0.98, oil: 1.02, gold: 1.03, crypto: 0.97 },
    tip: "Higher inflation often pressures growth stocks but benefits commodities like gold."
  },
  {
    title: "CRYPTO REGULATION",
    message: "New regulatory framework announced for cryptocurrency markets.",
    impact: { stocks: 1.0, oil: 1.0, gold: 1.01, crypto: 0.93 },
    tip: "Regulatory announcements typically create short-term volatility in crypto markets."
  },
  {
    title: "ECONOMIC STIMULUS",
    message: "Government announces major economic stimulus package.",
    impact: { stocks: 1.025, oil: 1.02, gold: 1.01, crypto: 1.03 },
    tip: "Stimulus measures often boost market sentiment across most asset classes."
  },
  {
    title: "CURRENCY CRISIS",
    message: "Emerging market currencies experience significant devaluation.",
    impact: { stocks: 0.97, oil: 0.98, gold: 1.04, crypto: 1.06 },
    tip: "Currency instability can drive investors to alternative stores of value."
  },
  {
    title: "TECH BUBBLE BURST",
    message: "Major tech stocks tumble as investor confidence craters.",
    impact: { stocks: 0.90, oil: 0.97, gold: 1.04, crypto: 0.93 },
    tip: "Tech corrections can lead to significant market rotations to value sectors.",
    isCrash: true
  },
  {
    title: "SUPPLY CHAIN CRUNCH",
    message: "Global logistics issues worsen, affecting manufacturing output.",
    impact: { stocks: 0.98, oil: 1.03, gold: 1.01, crypto: 0.99 },
    tip: "Supply constraints often lead to higher input costs and potential margin pressures."
  }
];

// Market opportunities with realistic scenarios
const MARKET_OPPORTUNITIES = [
  {
    type: 'double',
    title: 'High-Risk Investment',
    description: 'A high-risk, high-reward opportunity has emerged in the market.',
    actionText: 'INVEST',
    asset: 'crypto' as AssetType,
    risk: 'high' as const
  },
  {
    type: 'insider',
    title: 'Market Analysis Signal',
    description: 'Technical analysis suggests an imminent price movement in this asset.',
    actionText: 'FOLLOW SIGNAL',
    asset: 'stocks' as AssetType,
    risk: 'medium' as const
  },
  {
    type: 'hedge',
    title: 'Portfolio Hedge',
    description: 'Market uncertainty is rising - consider hedging your portfolio.',
    actionText: 'HEDGE NOW',
    asset: 'gold' as AssetType,
    risk: 'low' as const
  },
  {
    type: 'short',
    title: 'Bearish Opportunity',
    description: 'Technical indicators suggest this asset is overvalued.',
    actionText: 'SHORT POSITION',
    asset: 'stocks' as AssetType,
    risk: 'high' as const
  }
];

/**
 * Generate a random news event with realistic probability
 * @param {string} difficulty - Game difficulty level
 * @param {boolean} forceCrash - Force a market crash event
 * @returns {NewsEvent | null} The selected news event or null (no news)
 */
export const generateNewsEvent = (difficulty: string = 'normal', forceCrash: boolean = false): NewsEvent | null => {
  // Get the difficulty settings
  const difficultySettings = DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS] || DIFFICULTY_SETTINGS.normal;
  
  // Determine if there should be news at all (reduced frequency)
  // Most of the time there should be no news
  if (!forceCrash && Math.random() > 0.15 * difficultySettings.newsFrequency) {
    return null; // No news most of the time
  }
  
  // Determine if this is a crash event
  const crashChance = difficultySettings.crashChance;
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
 * Apply mean reversion to reduce extreme price movements over time
 * @param {number} price - Current price
 * @param {number} initialPrice - Initial/base price
 * @param {number} factor - Mean reversion strength (0-1)
 * @returns {number} Mean reversion adjustment factor
 */
const applyMeanReversion = (price: number, initialPrice: number, factor: number = 0.05): number => {
  // Calculate how far the price is from its initial value
  const deviation = price / initialPrice - 1;
  
  // Apply a small corrective force proportional to the deviation
  return -deviation * factor;
};

/**
 * Generate correlated random movements for asset prices
 * @param {AssetTrends} trends - Current market trends
 * @returns {Object} Correlated price movements
 */
const generateCorrelatedMovements = (trends: AssetTrends): Record<AssetType, number> => {
  // Base independent random movements
  const baseMovements: Record<AssetType, number> = {
    stocks: (Math.random() - 0.5) * 0.01,
    oil: (Math.random() - 0.5) * 0.015,
    gold: (Math.random() - 0.5) * 0.008,
    crypto: (Math.random() - 0.5) * 0.02
  };
  
  // Apply trend biases (subtle)
  Object.entries(trends).forEach(([asset, trend]) => {
    const assetKey = asset as AssetType;
    const trendBias = trend.direction === 'up' ? 0.001 * trend.strength : -0.001 * trend.strength;
    baseMovements[assetKey] += trendBias;
  });
  
  // Apply correlations (simplified implementation)
  const correlatedMovements: Record<AssetType, number> = { ...baseMovements };
  
  Object.keys(baseMovements).forEach(asset1 => {
    const assetKey1 = asset1 as AssetType;
    
    // For each asset, adjust its movement based on correlations with other assets
    Object.keys(baseMovements).forEach(asset2 => {
      if (asset1 === asset2) return;
      const assetKey2 = asset2 as AssetType;
      
      // Apply correlation effect
      const correlation = ASSET_CORRELATIONS[assetKey1][assetKey2];
      correlatedMovements[assetKey1] += baseMovements[assetKey2] * correlation * 0.2; // Scale down the effect
    });
  });
  
  return correlatedMovements;
};

/**
 * Update market prices with realistic movements, correlations, and mean reversion
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
  
  // Generate correlated movements
  const correlatedMovements = generateCorrelatedMovements(currentTrends);
  
  // Update each asset
  Object.keys(updatedPrices).forEach(assetKey => {
    const asset = assetKey as AssetType;
    const currentPrice = updatedPrices[asset];
    
    // 1. Apply correlated movement
    let changePercent = correlatedMovements[asset] * volatilityMultiplier;
    
    // 2. Apply mean reversion (subtle pull back toward initial price)
    const meanReversionFactor = applyMeanReversion(
      currentPrice, 
      INITIAL_ASSET_PRICES[asset],
      0.02
    );
    changePercent += meanReversionFactor;
    
    // 3. Apply news impact if present (scaled to be realistic)
    if (newsImpact && newsImpact[asset]) {
      // Convert multiplication factor to percentage change
      const impactPercentage = newsImpact[asset] - 1;
      
      // Scale down the news impact to be more realistic
      const scaledImpact = impactPercentage * 0.7; 
      changePercent += scaledImpact;
    }
    
    // 4. Apply minimum/maximum change limits for realism
    // Limit max change to a realistic amount per update
    const maxChange = asset === 'crypto' ? 0.02 : 0.015;
    changePercent = Math.max(Math.min(changePercent, maxChange), -maxChange);
    
    // 5. Update the price with the calculated change
    let newPrice = currentPrice * (1 + changePercent);
    
    // 6. Set minimum price floors based on asset type
    let minPrice: number;
    switch(asset) {
      case 'crypto': minPrice = 1000; break;
      case 'gold': minPrice = 500; break;
      case 'oil': minPrice = 10; break;
      case 'stocks': minPrice = 50; break;
      default: minPrice = 1;
    }
    
    // Apply minimum price and round appropriately
    newPrice = Math.max(minPrice, newPrice);
    
    // Round based on asset type
    switch(asset) {
      case 'stocks':
        // Round stocks to nearest 0.05
        newPrice = Math.round(newPrice * 20) / 20;
        break;
      case 'oil':
        // Round oil to nearest 0.1
        newPrice = Math.round(newPrice * 10) / 10;
        break;
      case 'gold':
        // Round gold to nearest whole number
        newPrice = Math.round(newPrice);
        break;
      case 'crypto':
        // Round crypto to nearest 10
        newPrice = Math.round(newPrice / 10) * 10;
        break;
      default:
        newPrice = Math.round(newPrice);
    }
    
    // Only update if the price actually changed
    if (newPrice !== currentPrice) {
      updatedPrices[asset] = newPrice;
    }
    
    // 7. Occasionally update trends based on consistent price movement
    // 5% chance of trend change per update
    if (Math.random() < 0.05) {
      // If price has moved consistently in one direction for several updates, 
      // that influences the new trend direction
      const trendBias = changePercent > 0 ? 0.7 : 0.3; // 70% chance to follow recent movement
      
      updatedTrends[asset] = {
        direction: Math.random() < trendBias ? 'up' : 'down',
        strength: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3
      };
    }
  });
  
  return { prices: updatedPrices, trends: updatedTrends };
};

/**
 * Generate a market opportunity with realistic probability
 * @returns {object | null} Market opportunity or null
 */
export const generateMarketOpportunity = (): any => {
  // Only 5% chance to generate an opportunity
  if (Math.random() > 0.05) {
    return null;
  }
  
  return MARKET_OPPORTUNITIES[Math.floor(Math.random() * MARKET_OPPORTUNITIES.length)];
};

/**
 * Get realistic initial cash amount based on difficulty
 * @param {string} difficulty - Game difficulty level
 * @returns {number} Starting cash amount
 */
export const getInitialCash = (difficulty: string = 'normal'): number => {
  const difficultySettings = DIFFICULTY_SETTINGS[difficulty as keyof typeof DIFFICULTY_SETTINGS] || DIFFICULTY_SETTINGS.normal;
  return difficultySettings.startingCash;
};

/**
 * Calculate market stress level (0-1) based on recent volatility
 * @param {PriceHistory} priceHistory - Historical price data
 * @returns {number} Market stress level (0-1)
 */
export const calculateMarketStress = (priceHistory: any): number => {
  // Initialize total volatility
  let totalVolatility = 0;
  let sampleCount = 0;
  
  // Calculate recent volatility across all assets
  Object.entries(priceHistory).forEach(([asset, history]) => {
    if (Array.isArray(history) && history.length >= 3) {
      // Look at last 3 price points
      const recentHistory = history.slice(-3);
      
      // Calculate average percentage change
      for (let i = 1; i < recentHistory.length; i++) {
        const percentChange = Math.abs((recentHistory[i] - recentHistory[i-1]) / recentHistory[i-1]);
        totalVolatility += percentChange;
        sampleCount++;
      }
    }
  });
  
  // Calculate average volatility across all samples
  const avgVolatility = sampleCount > 0 ? totalVolatility / sampleCount : 0;
  
  // Scale to a 0-1 market stress indicator
  // Assuming 5% average change is high stress
  return Math.min(avgVolatility * 20, 1);
};

// Export constants for use elsewhere
export { INITIAL_ASSET_PRICES, ASSET_VOLATILITY, NEWS_EVENTS, MARKET_OPPORTUNITIES, DIFFICULTY_SETTINGS };
