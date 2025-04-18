import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Newspaper, ChevronRight, History, X } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const MarketNews = () => {
  const { currentNews, newsHistory } = useGame();
  const [showHistory, setShowHistory] = useState(false);
  const [displayedNews, setDisplayedNews] = useState(currentNews);
  const lastUpdateRef = useRef<number>(Date.now());
  
  // Control how frequently the displayed news is updated
  // Significantly increased delay (5 minutes) to show news much less frequently
  useEffect(() => {
    // Only update the displayed news if:
    // 1. It's been at least 5 minutes since the last update, or 
    // 2. This is the first update, or
    // 3. There's a market crash (emergency news)
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    const isMarketCrash = currentNews.title?.toLowerCase().includes('crash') || 
                          currentNews.message.toLowerCase().includes('crash');
    
    // If sufficient time has passed or this is initial data or crash news
    if (timeSinceLastUpdate > 300000 || !displayedNews.message || isMarketCrash) {
      console.log('Market news updated at', new Date().toLocaleTimeString(), 
                 isMarketCrash ? '(MARKET CRASH)' : '');
      setDisplayedNews(currentNews);
      lastUpdateRef.current = now;
    } else {
      console.log('Market news update skipped, last update was', 
                Math.floor(timeSinceLastUpdate / 1000), 'seconds ago');
    }
  }, [currentNews, displayedNews]);
  
  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Newspaper className="text-dashboard-accent mr-2" size={18} />
            <h3 className="text-white font-bold">Market News</h3>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-[#A3B1C6] hover:text-white"
            onClick={() => setShowHistory(true)}
          >
            <History size={16} className="mr-1" />
            More
          </Button>
        </div>
        
        <div className="bg-[#0A1629] rounded-lg p-4">
          <div className="text-dashboard-accent text-xs uppercase font-medium mb-1">
            {displayedNews.title || 'Market Update'}
          </div>
          <p className="text-white text-sm">
            {displayedNews.message}
          </p>
          
          {displayedNews.tip && (
            <div className="mt-3 border-t border-[#1A2B45] pt-3">
              <div className="text-[#A3B1C6] text-xs flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-dashboard-accent mr-1.5"></span>
                <span className="italic">{displayedNews.tip}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {/* News History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="bg-[#132237] border-[#1A2B45] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-white">
              <History className="mr-2" size={18} />
              Recent Market News
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 text-[#A3B1C6] hover:text-white">
              <X size={18} />
            </DialogClose>
          </DialogHeader>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {/* Current news item */}
            <div className="bg-[#0A1629] rounded-lg p-4 border border-dashboard-accent/30">
              <div className="text-dashboard-accent text-xs uppercase font-medium mb-1 flex items-center">
                <span className="bg-dashboard-accent/20 text-dashboard-accent text-[10px] px-1.5 py-0.5 rounded mr-2">CURRENT</span>
                {displayedNews.title || 'Market Update'}
              </div>
              <p className="text-white text-sm">
                {displayedNews.message}
              </p>
              
              {displayedNews.tip && (
                <div className="mt-3 border-t border-[#1A2B45] pt-3">
                  <div className="text-[#A3B1C6] text-xs flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-dashboard-accent mr-1.5"></span>
                    <span className="italic">{displayedNews.tip}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* History items */}
            {newsHistory.map((item, index) => (
              <div key={index} className="bg-[#0A1629] rounded-lg p-4">
                <div className="text-[#A3B1C6] text-xs uppercase font-medium mb-1">
                  {item.title || 'Market Update'}
                </div>
                <p className="text-white text-sm">
                  {item.message}
                </p>
                
                {item.tip && (
                  <div className="mt-3 border-t border-[#1A2B45] pt-3">
                    <div className="text-[#A3B1C6] text-xs flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A3B1C6] mr-1.5"></span>
                      <span className="italic">{item.tip}</span>
                    </div>
                  </div>
                )}
                
                {item.isCrash && (
                  <div className="mt-2 flex">
                    <span className="text-[10px] bg-dashboard-negative/20 text-dashboard-negative px-1.5 py-0.5 rounded-sm">
                      MARKET CRASH
                    </span>
                  </div>
                )}
              </div>
            ))}
            
            {newsHistory.length === 0 && (
              <div className="text-center py-6 text-[#A3B1C6]">
                No previous news yet.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MarketNews;
