import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronRight, Info, TrendingDown, TrendingUp, AlertCircle, AlertTriangle, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Badge } from '@/components/ui/badge';

// Helper function to generate asset-specific badges
const getAssetBadge = (assetTag?: string) => {
  if (!assetTag) return null;
  
  let color;
  switch(assetTag) {
    case 'stocks':
      color = 'bg-[#A2AAAD]/20 text-[#A2AAAD]';
      break;
    case 'oil':
      color = 'bg-[#444]/20 text-gray-400';
      break;
    case 'gold':
      color = 'bg-[#FFD700]/20 text-[#D4AF37]';
      break;
    case 'crypto':
      color = 'bg-[#F7931A]/20 text-[#F7931A]';
      break;
    default:
      color = 'bg-[#A3B1C6]/20 text-[#A3B1C6]';
  }
  
  const symbol = assetTag.charAt(0).toUpperCase() + assetTag.slice(1);
  
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${color}`}>
      {symbol}
    </span>
  );
};

// Helper function to determine overall impact type
function getImpactType(impact: any): 'positive' | 'negative' | 'neutral' {
  if (!impact) return 'neutral';
  
  // Calculate average impact
  const values = Object.values(impact) as number[]; // Added type assertion
  if (values.length === 0) return 'neutral';
  
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length; // Fixed reduce type
  
  if (avg > 1.02) return 'positive';
  if (avg < 0.98) return 'negative';
  return 'neutral';
}

const MarketNews = () => {
  const { newsHistory, assetPrices } = useGame();
  const [expanded, setExpanded] = useState(false);
  
  // Get the latest news items from history, sorted by most recent first
  const sortedNewsItems = [...newsHistory].sort((a, b) => b.timestamp - a.timestamp);
  
  // Display only a limited number of news items unless expanded
  const displayItems = expanded ? sortedNewsItems : sortedNewsItems.slice(0, 4);

  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden h-full">
      <CardHeader className="p-6 pb-0">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Market News</h2>
          <Button variant="ghost" size="sm" className="text-[#A3B1C6] text-sm hover:text-white p-0">
            <span>More</span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {displayItems.length > 0 ? (
            displayItems.map((news) => (
              <NewsItem key={news.id} news={news} />
            ))
          ) : (
            <div className="text-dashboard-text-secondary text-sm text-center py-4">
              No market news yet. Stay tuned for updates.
            </div>
          )}
          
          {sortedNewsItems.length > 4 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-[#A3B1C6] hover:text-white border border-[#1A2B45] text-xs mt-2"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show Less' : `Show ${sortedNewsItems.length - 4} More`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const NewsItem = ({ news }: { 
  news: { 
    id: number;
    title: string;
    message: string;
    impact: Record<string, number>;
    timestamp: number;
    isCrash?: boolean;
    assetTag?: string;
  }
}) => {
  // Calculate how long ago the news was posted
  const getTimeAgo = () => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - news.timestamp) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const impact = getImpactType(news.impact);
  
  const getImpactIcon = () => {
    switch (impact) {
      case 'positive':
        return <TrendingUp size={16} className="text-dashboard-positive" />;
      case 'negative':
        return <TrendingDown size={16} className="text-dashboard-negative" />;
      default:
        return <Info size={16} className="text-[#A3B1C6]" />;
    }
  };
  
  const getImpactColor = () => {
    switch (impact) {
      case 'positive':
        return 'bg-dashboard-positive/10';
      case 'negative':
        return 'bg-dashboard-negative/10';
      default:
        return 'bg-[#3A7BFF]/10';
    }
  };

  return (
    <div className="flex items-start gap-3 hover:bg-[#1A2B45] p-2 rounded-lg transition-colors duration-200 cursor-pointer group">
      <div className={`mt-1 p-1 rounded-full ${getImpactColor()} group-hover:bg-opacity-20`}>
        {getImpactIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-start gap-2">
          {news.isCrash && (
            <span className="bg-dashboard-negative px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase">
              Breaking
            </span>
          )}
          {news.assetTag && getAssetBadge(news.assetTag)}
        </div>
        <p className="text-white text-sm font-medium">{news.message}</p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-[#A3B1C6] text-xs">{getTimeAgo()}</p>
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark size={14} className="text-[#A3B1C6]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarketNews;
