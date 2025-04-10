// Initial asset prices for the game
export const INITIAL_ASSET_PRICES = {
  stocks: 240,
  oil: 65,
  gold: 1850,
  crypto: 29200
};

// Asset volatility configuration
export const ASSET_VOLATILITY = {
  stocks: 0.15,  // Moderate volatility
  oil: 0.18,     // High volatility
  gold: 0.12,    // Low volatility (more stable)
  crypto: 0.25   // Very high volatility
};

// News events with their impacts on different assets
export const NEWS_EVENTS = [
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
  },
  {
    title: "RISING INFLATION",
    message: "Central banks warn of increasing inflation across major economies.",
    impact: { stocks: 0.96, oil: 1.04, gold: 1.09, crypto: 1.03 },
    tip: "Gold and other hard assets are traditional inflation hedges."
  },
  {
    title: "TECH BUBBLE BURSTING",
    message: "Analysts warn tech valuations are unsustainable as selling accelerates.",
    impact: { stocks: 0.88, oil: 0.96, gold: 1.03, crypto: 0.90 },
    tip: "Sector rotation can provide opportunities during tech corrections."
  },
  {
    title: "CRYPTO ADOPTION SURGE",
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
    title: "GOLD RESERVE DISCOVERY",
    message: "Major new gold reserve discovered in South America.",
    impact: { stocks: 1.01, oil: 0.99, gold: 0.88, crypto: 1.02 },
    tip: "Supply increases can temporarily depress commodity prices."
  },
  {
    title: "CRYPTO MINING BAN",
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
    title: "RATE HIKE SHOCK",
    message: "Federal Reserve announces unexpected interest rate increase.",
    impact: { stocks: 0.93, oil: 0.96, gold: 1.05, crypto: 0.92 },
    tip: "Higher interest rates typically pressure growth assets but support yield-sensitive investments."
  },
  {
    title: "GEOPOLITICAL TENSIONS",
    message: "Conflict escalates in key oil-producing region.",
    impact: { stocks: 0.95, oil: 1.10, gold: 1.07, crypto: 0.98 },
    tip: "Geopolitical instability often benefits 'safe haven' assets."
  },
  {
    title: "INSTITUTIONAL CRYPTO",
    message: "Major investment banks announce Bitcoin treasury holdings.",
    impact: { stocks: 1.02, oil: 0.99, gold: 0.96, crypto: 1.15 },
    tip: "Institutional adoption signals longer-term cryptocurrency legitimacy."
  },
  {
    title: "GLOBAL ECONOMIC SLUMP",
    message: "IMF revises global growth projections downward.",
    impact: { stocks: 0.94, oil: 0.91, gold: 1.04, crypto: 0.95 },
    tip: "Economic slowdowns often lead to more accommodative monetary policy."
  },
  {
    title: "AI BREAKTHROUGH",
    message: "Revolutionary AI technology announcement drives tech sector.",
    impact: { stocks: 1.12, oil: 0.99, gold: 0.97, crypto: 1.08 },
    tip: "Technology breakthroughs can create new investment trends."
  },
  {
    title: "SUPPLY CHAIN CRISIS",
    message: "Global logistics issues worsen, impacting manufacturing output.",
    impact: { stocks: 0.95, oil: 1.06, gold: 1.03, crypto: 0.98 },
    tip: "Supply constraints often lead to inflation and higher commodity prices."
  },
  {
    title: "MARKET MANIPULATION",
    message: "Regulatory investigation into market manipulation announced.",
    impact: { stocks: 0.97, oil: 0.98, gold: 1.02, crypto: 0.89 },
    tip: "Regulatory scrutiny can lead to short-term volatility."
  },
  {
    title: "GREEN ENERGY PUSH",
    message: "Major economies announce massive green energy investment plan.",
    impact: { stocks: 1.05, oil: 0.93, gold: 0.99, crypto: 1.04 },
    tip: "Policy shifts can create both winners and losers in the market."
  },
  {
    title: "QUANTUM COMPUTING",
    message: "Breakthrough in quantum computing threatens encryption protocols.",
    impact: { stocks: 1.03, oil: 0.99, gold: 1.02, crypto: 0.85 },
    tip: "Technology disruptions can impact established systems."
  }
];

// Market opportunities with different risk profiles
export const MARKET_OPPORTUNITIES = [
  {
    type: 'double',
    title: 'Double or Nothing!',
    description: 'Take a chance for big gains, but beware of potential losses...',
    actionText: 'DOUBLE OR NOTHING',
    asset: 'crypto',
    risk: 'high'
  },
  {
    type: 'insider',
    title: 'Insider Tip',
    description: 'You\'ve heard a reliable tip about an upcoming price movement.',
    actionText: 'ACT ON TIP',
    asset: 'stocks',
    risk: 'medium'
  },
  {
    type: 'hedge',
    title: 'Hedging Opportunity',
    description: 'A perfect chance to protect against market downturns.',
    actionText: 'HEDGE NOW',
    asset: 'gold',
    risk: 'low'
  },
  {
    type: 'leverage',
    title: 'Leverage Play',
    description: 'Use leverage to multiply your potential returns, but be careful!',
    actionText: 'LEVERAGE UP',
    asset: 'oil',
    risk: 'high'
  },
  {
    type: 'short',
    title: 'Strategic Short',
    description: 'Market indicators suggest this asset is overvalued and due for correction.',
    actionText: 'SHORT POSITION',
    asset: 'stocks',
    risk: 'high'
  },
  {
    type: 'arbitrage',
    title: 'Arbitrage Opportunity',
    description: 'Temporary market inefficiency detected. Act fast!',
    actionText: 'EXECUTE ARBITRAGE',
    asset: 'crypto',
    risk: 'low'
  },
  {
    type: 'momentum',
    title: 'Momentum Trade',
    description: 'This asset is gaining momentum. Ride the trend!',
    actionText: 'FOLLOW MOMENTUM',
    asset: 'oil',
    risk: 'medium'
  },
  {
    type: 'contrarian',
    title: 'Contrarian Play',
    description: 'Market sentiment is extremely negative, suggesting a buying opportunity.',
    actionText: 'BUY THE DIP',
    asset: 'gold',
    risk: 'medium'
  }
];

// Achievement definitions
export const ACHIEVEMENTS = {
  firstProfit: { 
    unlocked: false, 
    title: "First Profit", 
    description: "Make your first profitable trade" 
  },
  riskTaker: { 
    unlocked: false, 
    title: "Risk Taker", 
    description: "Invest over 50% in crypto" 
  },
  diversified: { 
    unlocked: false, 
    title: "Diversified Portfolio", 
    description: "Own all available assets" 
  },
  goldHoarder: { 
    unlocked: false, 
    title: "Gold Hoarder", 
    description: "Accumulate 5 units of gold" 
  },
  marketCrash: { 
    unlocked: false, 
    title: "Crash Survivor", 
    description: "End with profit despite a market crash" 
  },
  tenPercent: { 
    unlocked: false, 
    title: "Double Digits", 
    description: "Achieve a 10% return" 
  },
  wealthyInvestor: { 
    unlocked: false, 
    title: "Wealthy Investor", 
    description: "Reach a portfolio value of $15,000" 
  },
  shortMaster: { 
    unlocked: false, 
    title: "Short Master", 
    description: "Make profit from a short position" 
  },
  perfectTiming: {
    unlocked: false,
    title: "Perfect Timing",
    description: "Buy an asset just before it increases 20% in value"
  },
  dayTrader: {
    unlocked: false, 
    title: "Day Trader", 
    description: "Execute 10 trades in a single round"
  },
  contrarian: {
    unlocked: false,
    title: "Contrarian",
    description: "Make profit by buying during a market crash"
  },
  opportunist: {
    unlocked: false,
    title: "Opportunist",
    description: "Successfully capitalize on 3 different market opportunities"
  }
};

// Game difficulty settings
export const DIFFICULTY_SETTINGS = {
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
