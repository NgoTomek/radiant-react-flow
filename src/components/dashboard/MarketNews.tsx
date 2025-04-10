
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronRight, Info, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

type NewsItem = {
  id: number;
  title: string;
  impact: 'positive' | 'negative' | 'neutral';
  time: string;
};

const newsData: NewsItem[] = [
  {
    id: 1,
    title: 'Tesla announces new gigafactory in Europe',
    impact: 'positive',
    time: '12m ago',
  },
  {
    id: 2,
    title: 'Bitcoin drops 5% after regulatory concerns',
    impact: 'negative',
    time: '24m ago',
  },
  {
    id: 3,
    title: 'Oil prices stabilize after OPEC+ meeting',
    impact: 'neutral',
    time: '36m ago',
  },
  {
    id: 4,
    title: 'Apple reports record quarterly profit',
    impact: 'positive',
    time: '45m ago',
  },
];

const MarketNews = () => {
  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
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
          {newsData.map((news) => (
            <NewsItem key={news.id} news={news} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const NewsItem = ({ news }: { news: NewsItem }) => {
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

  return (
    <div className="flex items-start gap-3 hover:bg-[#1A2B45] p-2 rounded-lg transition-colors duration-200 cursor-pointer">
      <div className="mt-1 p-1 rounded-full bg-[#0A1629]">
        {getImpactIcon()}
      </div>
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{news.title}</p>
        <p className="text-[#A3B1C6] text-xs">{news.time}</p>
      </div>
    </div>
  );
};

export default MarketNews;
