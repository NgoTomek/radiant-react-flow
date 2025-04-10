
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, DollarSign, TrendingUp, ChevronRight, Info } from 'lucide-react';

const Instructions = () => {
  return (
    <div className="min-h-screen bg-dashboard-background text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-dashboard-text-secondary hover:text-white mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back to Main Menu
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">How to Play</h1>
          <p className="text-dashboard-text-secondary">Learn the rules of Portfolio Panic</p>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-dashboard-accent/20 p-3 rounded-full">
                  <Info className="text-dashboard-accent" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Game Overview</h2>
                  <p className="text-dashboard-text-secondary">
                    Portfolio Panic is a fast-paced financial simulation game where you need to build 
                    the most valuable portfolio before time runs out. You'll buy and sell various assets,
                    react to market news, and make strategic decisions to maximize your returns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#0A1629] p-3 rounded-full">
                    <Clock className="text-dashboard-text-secondary" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold mb-2">Timed Rounds</h2>
                    <p className="text-dashboard-text-secondary text-sm">
                      The game consists of 10 timed rounds. Each round gives you limited time to make 
                      investment decisions. When the timer runs out, the market shifts and new 
                      opportunities appear.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#0A1629] p-3 rounded-full">
                    <DollarSign className="text-dashboard-text-secondary" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold mb-2">Buying & Selling</h2>
                    <p className="text-dashboard-text-secondary text-sm">
                      Click on any asset to open the trading dialog. You can buy assets when prices are low 
                      and sell when they rise. Each transaction has an immediate effect on your portfolio.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#0A1629] p-3 rounded-full">
                    <TrendingUp className="text-dashboard-text-secondary" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold mb-2">Market Events</h2>
                    <p className="text-dashboard-text-secondary text-sm">
                      Watch for market news that can affect asset prices. React quickly to sudden market
                      changes to protect your portfolio or capitalize on new opportunities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#0A1629] p-3 rounded-full">
                    <ChevronRight className="text-dashboard-text-secondary" size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold mb-2">Winning the Game</h2>
                    <p className="text-dashboard-text-secondary text-sm">
                      The goal is to achieve the highest portfolio value by the end of round 10. 
                      Diversifying your investments and timing the market correctly will help 
                      maximize your returns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-dashboard-accent/10 border border-dashboard-accent/30 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-dashboard-accent/20 mt-0.5">
                <div className="w-3 h-3 rounded-full bg-dashboard-accent"></div>
              </div>
              <div>
                <h3 className="text-white font-medium">Pro Tip</h3>
                <p className="text-[#A3B1C6] text-sm mt-1">
                  Keep an eye on the market volatility indicator. High volatility means bigger potential
                  gains but also bigger risks!
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Link to="/game">
              <Button className="bg-dashboard-accent hover:bg-dashboard-accent-hover px-8">
                Start Playing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
