import { 
  INITIAL_ASSET_PRICES, 
  ASSET_VOLATILITY, 
  NEWS_EVENTS, 
  MARKET_OPPORTUNITIES,
  DIFFICULTY_SETTINGS
} from './gameData';

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
    
    // Add random volatility fluctuation (±20% of base)
    const volatilityVariance = baseVolatility * 0.2 * (Math.random() * 2 - 1);
    const volatility = baseVolatility + volatilityVariance;
    
    // Calculate price change based on trend
    const trendFactor = currentTrend.direction === 'up' ? 1 : -1;
    const trendStrength = currentTrend.strength;
    
    // Add more dynamic randomness for exciting price movements
    const randomFactor = Math.random() * 2.5 - 1.25; // -1.25 to 1.25
    
    // Occasionally add price spikes (5% chance)
    const spikeChance = Math.random();
    const spikeMultiplier = spikeChance < 0.05 ? (Math.random() * 2 + 2) : 1; // 2-4x spike on 5% of updates
    
    // Combine trend and randomness
    const changePercent = (trendFactor * trendStrength * 0.02 + randomFactor * volatility) * spikeMultiplier;
    
    // Apply news impact if present
    const impactMultiplier = newsImpact && newsImpact[asset] ? newsImpact[asset] - 1 : 0;
    const totalChange = changePercent + impactMultiplier;
    
    // Set minimum price floors to prevent negative or too-low prices
    let minPrice: number;
    switch(asset) {
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
    
    // Update price with rounding to make it readable
    updatedPrices[asset] = Math.max(minPrice, Math.round(updatedPrices[asset] * (1 + totalChange)));
    
    // Occasionally change trends (15% chance)
    if (Math.random() < 0.15) {
      // 60% chance to follow news impact direction if significant
      if (impactMultiplier !== 0 && Math.random() < 0.6) {
        updatedTrends[asset] = {
          direction: impactMultiplier > 0 ? 'up' : 'down',
          strength: Math.max(1, Math.min(3, Math.ceil(Math.abs(impactMultiplier) * 10))) as 1 | 2 | 3
        };
      } else {
        // Random trend change
        updatedTrends[asset] = {
          direction: Math.random() > 0.5 ? 'up' : 'down',
          strength: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3
        };
      }
    }
  });
  
  return { prices: updatedPrices, trends: updatedTrends };
};

/**
 * Generate a market opportunity
 * @param {AssetPrices} currentPrices - Current asset prices
 * @param {AssetTrends} currentTrends - Current market trends
 * @returns {object} Market opportunity
 */
export const generateMarketOpportunity = (
  currentPrices: AssetPrices,
  currentTrends: AssetTrends
) => {
  // Select opportunity type
  const selectedOpportunity = { ...MARKET_OPPORTUNITIES[Math.floor(Math.random() * MARKET_OPPORTUNITIES.length)] };
  
  // If not a fixed asset type (like 'double'), pick an appropriate asset based on current trends
  if (selectedOpportunity.type !== 'double') {
    // For contrarian plays, pick assets trending down
    if (selectedOpportunity.type === 'contrarian') {
      const downTrendingAssets = Object.entries(currentTrends)
        .filter(([_, trend]) => trend.direction === 'down')
        .map(([asset, _]) => asset as AssetType);
      
      if (downTrendingAssets.length > 0) {
        selectedOpportunity.asset = downTrendingAssets[Math.floor(Math.random() * downTrendingAssets.length)];
      }
    }
    // For momentum plays, pick assets trending up strongly
    else if (selectedOpportunity.type === 'momentum') {
      const strongUpTrendingAssets = Object.entries(currentTrends)
        .filter(([_, trend]) => trend.direction === 'up' && trend.strength > 1)
        .map(([asset, _]) => asset as AssetType);
      
      if (strongUpTrendingAssets.length > 0) {
        selectedOpportunity.asset = strongUpTrendingAssets[Math.floor(Math.random() * strongUpTrendingAssets.length)];
      }
    }
    // For short opportunities, pick assets likely to decline
    else if (selectedOpportunity.type === 'short') {
      // Look for assets at high prices relative to their initial prices
      const highValuedAssets = Object.entries(currentPrices)
        .filter(([asset, price]) => {
          const initialPrice = INITIAL_ASSET_PRICES[asset as AssetType];
          return price > initialPrice * 1.3; // 30% above initial
        })
        .map(([asset, _]) => asset as AssetType);
      
      if (highValuedAssets.length > 0) {
        selectedOpportunity.asset = highValuedAssets[Math.floor(Math.random() * highValuedAssets.length)];
      }
    }
    // Default: select random asset
    else if (!selectedOpportunity.asset) {
      const assets: AssetType[] = ['stocks', 'oil', 'gold', 'crypto'];
      selectedOpportunity.asset = assets[Math.floor(Math.random() * assets.length)];
    }
  }
  
  return selectedOpportunity;
};

/**
 * Check if a perfect timing achievement should be unlocked
 * @param {AssetPrices} oldPrices - Previous asset prices
 * @param {AssetPrices} newPrices - Current asset prices
 * @param {object} recentTrades - Recent trades made by player
 * @returns {boolean} Whether perfect timing was achieved
 */
export const checkPerfectTiming = (
  oldPrices: AssetPrices,
  newPrices: AssetPrices,
  recentTrades: any
): boolean => {
  // Look for assets with large price increases (>= 20%)
  const significantIncreases = Object.entries(newPrices).filter(([asset, price]) => {
    const oldPrice = oldPrices[asset as AssetType];
    return price >= oldPrice * 1.2; // 20% or more increase
  });
  
  // Check if player bought any of these assets recently (before the price jump)
  if (significantIncreases.length > 0 && recentTrades) {
    for (const [asset, _] of significantIncreases) {
      if (recentTrades[asset] && recentTrades[asset].action === 'buy') {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Apply news event effects with some randomness
 * @param {NewsEvent} newsEvent - The news event
 * @returns {object} Modified impact values with some randomness
 */
export const applyNewsEffects = (newsEvent: NewsEvent): { [key in AssetType]?: number } => {
  const modifiedImpact: { [key in AssetType]?: number } = {};
  
  // Add some randomness to the impact (±10%)
  Object.entries(newsEvent.impact).forEach(([asset, impact]) => {
    const randomVariance = impact! * 0.1 * (Math.random() * 2 - 1);
    modifiedImpact[asset as AssetType] = impact! + randomVariance;
  });
  
  return modifiedImpact;
};

/**
 * Generate relevant market tips based on current conditions
 * @param {AssetPrices} prices - Current prices
 * @param {AssetTrends} trends - Current trends
 * @returns {string} Market tip
 */
export const generateMarketTip = (
  prices: AssetPrices,
  trends: AssetTrends
): string => {
  const tips = [
    "Watch for counter-trend opportunities when prices move extreme in one direction.",
    "Diversification can help manage risk during volatile markets.",
    "Consider taking profits on assets that have seen significant gains.",
    "Market volatility creates both risk and opportunity.",
    "Long-term trends often overcome short-term volatility.",
    "Sometimes, the best action is to wait and observe.",
    "Look for correlations between different asset classes.",
    "When one asset class falls dramatically, another may rise as a 'safe haven'."
  ];
  
  // Look for strongly trending assets to give specific tips
  const strongTrends = Object.entries(trends).filter(([_, trend]) => trend.strength > 1);
  
  if (strongTrends.length > 0) {
    const [asset, trend] = strongTrends[Math.floor(Math.random() * strongTrends.length)];
    
    if (trend.direction === 'up') {
      tips.push(`${asset.charAt(0).toUpperCase() + asset.slice(1)} is showing strong upward momentum.`);
    } else {
      tips.push(`${asset.charAt(0).toUpperCase() + asset.slice(1)} is trending downward with significant momentum.`);
    }
  }
  
  // Find assets at extreme values
  const extremeValues = Object.entries(prices).filter(([asset, price]) => {
    const initialPrice = INITIAL_ASSET_PRICES[asset as AssetType];
    return price > initialPrice * 1.5 || price < initialPrice * 0.7;
  });
  
  if (extremeValues.length > 0) {
    const [asset, price] = extremeValues[Math.floor(Math.random() * extremeValues.length)];
    const initialPrice = INITIAL_ASSET_PRICES[asset as AssetType];
    
    if (price > initialPrice * 1.5) {
      tips.push(`${asset.charAt(0).toUpperCase() + asset.slice(1)} may be overextended. Consider taking profits.`);
    } else {
      tips.push(`${asset.charAt(0).toUpperCase() + asset.slice(1)} has dropped significantly and may present a buying opportunity.`);
    }
  }
  
  // Return a random tip from the collection
  return tips[Math.floor(Math.random() * tips.length)];
};
