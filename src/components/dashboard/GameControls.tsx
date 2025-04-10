
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PauseIcon, PlayIcon, StopCircle } from 'lucide-react';

interface GameControlsProps {
  onEndGame?: () => void;
}

const GameControls = ({ onEndGame }: GameControlsProps) => {
  const [isPaused, setIsPaused] = React.useState(false);

  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="bg-[#0A1629] rounded-lg p-4">
            <h3 className="text-[#A3B1C6] text-sm mb-1">Game Progress</h3>
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Round 1 of 10</span>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-dashboard-accent"></div>
                <div className="w-2 h-2 rounded-full bg-[#1A2B45]"></div>
                <div className="w-2 h-2 rounded-full bg-[#1A2B45]"></div>
                <div className="w-2 h-2 rounded-full bg-[#1A2B45]"></div>
                <div className="w-2 h-2 rounded-full bg-[#1A2B45]"></div>
              </div>
            </div>
            <div className="w-full bg-[#1A2B45] h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-dashboard-accent h-full rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="bg-[#0A1629] border-[#1A2B45] text-white hover:bg-[#1A2B45] hover:text-white"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <><PlayIcon size={16} className="mr-2" /> Resume</>
              ) : (
                <><PauseIcon size={16} className="mr-2" /> Pause</>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="bg-[#0A1629] border-[#1A2B45] text-dashboard-negative hover:bg-dashboard-negative hover:text-white hover:border-dashboard-negative"
              onClick={onEndGame}
            >
              <StopCircle size={16} className="mr-2" /> End Game
            </Button>
          </div>
          
          <div className="bg-dashboard-accent/10 border border-dashboard-accent/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-dashboard-accent/20 mt-0.5">
                <div className="w-3 h-3 rounded-full bg-dashboard-accent"></div>
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Market volatility increasing</h3>
                <p className="text-[#A3B1C6] text-xs mt-1">
                  Be prepared for potential price swings in the next round!
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameControls;
