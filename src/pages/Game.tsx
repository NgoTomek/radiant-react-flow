
import React from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus } from 'lucide-react';

const Game = () => {
  const navigate = useNavigate();
  
  // This would be replaced with actual game logic
  const handleEndGame = () => {
    navigate('/results');
  };
  
  return (
    <>
      <Dashboard onEndGame={handleEndGame} />
      
      {/* Sample Trading Modal that would be triggered from Dashboard */}
      <Dialog>
        <DialogContent className="bg-[#132237] border-[#1A2B45] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Trade Bitcoin (BTC)</DialogTitle>
            <DialogDescription className="text-dashboard-text-secondary">
              Current Price: $28,312 (−5.1%)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-[#0A1629] p-4 rounded-lg">
              <p className="text-dashboard-text-secondary text-sm mb-1">Amount</p>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="rounded-full bg-[#1A2B45] text-white">
                  <Minus size={18} />
                </Button>
                <div className="flex-1 text-center text-2xl font-bold">$500</div>
                <Button variant="ghost" size="icon" className="rounded-full bg-[#1A2B45] text-white">
                  <Plus size={18} />
                </Button>
              </div>
              <p className="text-dashboard-text-secondary text-sm mt-1">You will get: 0.0177 BTC</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button className="bg-dashboard-positive hover:bg-dashboard-positive/90">
                Buy
              </Button>
              <Button className="bg-dashboard-negative hover:bg-dashboard-negative/90">
                Sell
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Game;
