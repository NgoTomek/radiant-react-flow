import React from 'react';
import Header from './Header';
import PortfolioOverview from './PortfolioOverview';
import Holdings from './Holdings';
import NetWorthChart from './NetWorthChart';
import MarketNews from './MarketNews';
import GameControls from './GameControls';
import { Separator } from '@/components/ui/separator';
import { useGame } from '@/context/GameContext';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import TradeModal from './TradeModal';

interface DashboardProps {
  onEndGame?: () => void;
}

const Dashboard = ({ onEndGame }: DashboardProps) => {
  const { 
    timer, 
    round, 
    totalRounds, 
    paused, 
    togglePause, 
    handleEndGame, 
    formatTime,
    showNewsPopup,
    setShowNewsPopup,
    newsPopup,
    showMarketAlert,
    setShowMarketAlert,
    marketAlert
  } = useGame();
  
  const [showEndGameConfirm, setShowEndGameConfirm] = React.useState(false);
  const [showTradeModal, setShowTradeModal] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<string | null>(null);

  const handleEndGameRequest = () => {
    setShowEndGameConfirm(true);
  };

  const confirmEndGame = () => {
    setShowEndGameConfirm(false);
    handleEndGame();
    if (onEndGame) onEndGame();
  };

  const openTradeModal = (asset: string) => {
    setSelectedAsset(asset);
    setShowTradeModal(true);
  };

  return (
    <div className="bg-dashboard-background min-h-screen text-white">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <Header timer={formatTime(timer)} round={round} totalRounds={totalRounds} />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          <div className="md:col-span-8 space-y-6">
            <PortfolioOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Holdings onAssetClick={openTradeModal} />
              <MarketNews />
            </div>
          </div>
          <div className="md:col-span-4 space-y-6">
            <NetWorthChart />
            <GameControls 
              onEndGame={handleEndGameRequest} 
              isPaused={paused}
              onTogglePause={togglePause}
              round={round}
              totalRounds={totalRounds}
            />
          </div>
        </div>
        <div className="mt-6 py-6">
          <Separator className="bg-[#1A2B45]" />
          <div className="flex justify-between items-center pt-4 text-dashboard-text-secondary text-sm">
            <div>© 2025 Portfolio Panic</div>
            <div>v1.0.0</div>
          </div>
        </div>
      </div>

      {/* End Game Confirmation Dialog */}
      <AlertDialog open={showEndGameConfirm} onOpenChange={setShowEndGameConfirm}>
        <AlertDialogContent className="bg-[#132237] border-[#1A2B45] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>End Current Game?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#A3B1C6]">
              Are you sure you want to end this game? Your progress will be tallied and you'll be taken to the results screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              variant="outline" 
              className="bg-[#0A1629] border-[#1A2B45] text-white hover:bg-[#1A2B45]"
              onClick={() => setShowEndGameConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-dashboard-accent hover:bg-dashboard-accent-hover text-white"
              onClick={confirmEndGame}
            >
              End Game
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* News Popup Dialog */}
      <AlertDialog open={showNewsPopup} onOpenChange={setShowNewsPopup}>
        <AlertDialogContent className="bg-[#132237] border-[#1A2B45] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{newsPopup.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#A3B1C6]">
              {newsPopup.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-[#0A1629] p-4 rounded-lg my-4">
            <p className="text-white text-sm">
              <strong>TIP:</strong> {newsPopup.tip || "Watch how this news affects different assets."}
            </p>
          </div>
          <AlertDialogFooter>
            <Button 
              className="bg-dashboard-accent hover:bg-dashboard-accent-hover text-white w-full"
              onClick={() => setShowNewsPopup(false)}
            >
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Market Alert Dialog */}
      <AlertDialog open={showMarketAlert} onOpenChange={setShowMarketAlert}>
        <AlertDialogContent className="bg-[#132237] border-[#1A2B45] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{marketAlert.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#A3B1C6]">
              {marketAlert.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button 
              className="bg-dashboard-accent hover:bg-dashboard-accent-hover text-white w-full"
              onClick={() => setShowMarketAlert(false)}
            >
              Acknowledge
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Trade Modal */}
      {showTradeModal && selectedAsset && (
        <TradeModal 
          asset={selectedAsset} 
          onClose={() => setShowTradeModal(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
