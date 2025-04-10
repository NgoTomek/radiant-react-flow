import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronRight, Info, TrendingDown, TrendingUp, AlertCircle, AlertTriangle, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Badge } from '@/components/ui/badge';

const MarketNews = () => {
  const { currentNews, assetPrices } = useGame();
  const [expanded, setExpanded] = useState(false);
  
  // Generate sample news items based on current news
  const newsItems = [
    {
      id: 1,
      title: currentNews.message,
      impact: getImpactType(currentNews.impact),
      time: 'Just now',
      isBreaking: true
    },
    {
      id: 2,
      title: 'Bitcoin volatility increases after market speculation',
      impact: 'negative',
      time: '15m ago',
      isBreaking: false,
      assetTag: 'crypto'
    },
    {
      id: 3,
      title: 'Gold prices stabilize after recent fluctuations',
      impact: 'neutral',
      time: '32m ago',
      isBreaking: false,
      assetTag: 'gold'
    },
    {
      id: 4,
      title: 'Oil market shows signs of recovery',
      impact: 'positive',
      time: '48m ago',
      isBreaking: false,
      assetTag: 'oil'
    },
    {
      id: 5,
      title: 'Market analysts predict increased volatility for upcoming week',
      impact: 'neutral',
      time: '1h ago',
      isBreaking: false
    },
    {
      id: 6,
      title: 'Tech sector outperforming broader market amid innovation surge',
      impact: 'positive',
      time: '1.5h ago',
      isBreaking: false,
      assetTag: 'stocks'
    },
    {
      id: 7,
      title: 'Investors flee to safe-haven assets amid uncertainty',
      impact: 'negative',
      time: '2h ago',
      isBreaking: false,
      assetTag: 'gold'
    }
  ];
  
  // Display only 4 news items unless expanded
  const displayItems = expanded ? newsItems : newsItems.slice(0, 4);
  
  // Helper function to determine overall impact type
  function getImpactType(impact: any): 'positive' | 'negative' | 'neutral' {
    if (!impact) return 'neutral';
    
    // Calculate average impact
    const values = Object.values(impact);
    if (values.length === 0) return 'neutral';
    
    const avg = values.reduce((sum, val) => sum + (val as number), 0) / values.length;
    
    if (avg > 1.02) return 'positive';
    if (avg < 0.98) return 'negative';
    return 'neutral';
  }
  
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
          {displayItems.map((news) => (
            <NewsItem key={news.id} news={news} />
          ))}
          
          {newsItems.length > 4 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-[#A3B1C6] hover:text-white border border-[#1A2B45] text-xs mt-2"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show Less' : `Show ${newsItems.length - 4} More`}
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
    impact: 'positive' | 'negative' | 'neutral';
    time: string;
    isBreaking?: boolean;
    assetTag?: string;
  }
}) => {
  const getImpactIcon = () => {
    switch (news.impact) {
      case 'positive':
        return <TrendingUp size={16} className="text-dashboard-positive" />;
      case 'negative':
        return <TrendingDown size={16} className="text-dashboard-negative" />;
      default:
        return <Info size={16} className="text-[#A3B1C6]" />;
    }
  };
  
  const getImpactColor = () => {
    switch (news.impact) {
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
          {news.isBreaking && (
            <span className="bg-dashboard-negative px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase">
              Breaking
            </span>
          )}
          {news.assetTag && getAssetBadge(news.assetTag)}
        </div>
        <p className="text-white text-sm font-medium">{news.title}</p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-[#A3B1C6] text-xs">{news.time}</p>
          <Button variant="ghost" size="sm" className="p-0 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark size={14} className="text-[#A3B1C6]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarketNews;
