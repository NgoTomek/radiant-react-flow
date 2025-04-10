import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { useGame } from '@/context/GameContext';
import NotificationSystem from '@/components/dashboard/NotificationSystem';

const Game = () => {
  const navigate = useNavigate();
  const { startGame, handleEndGame, round, totalRounds, timer } = useGame();
  const [isReady, setIsReady] = useState(false);
  
  // Start the game when component mounts
  useEffect(() => {
    // Use a timeout to ensure all components are fully mounted
    // This prevents the "getAssetBadge is not defined" error
    const initTimeout = setTimeout(() => {
      startGame();
      // Add a small delay before showing the dashboard to ensure
      // all subcomponents are properly initialized
      setTimeout(() => {
        setIsReady(true);
      }, 200);
    }, 200);
    
    return () => {
      clearTimeout(initTimeout);
    };
  }, [startGame]);
  
  // Handle end game and navigation to results
  const onEndGame = () => {
    handleEndGame();
    navigate('/results');
  };
  
  // Automatically navigate to results when game completes
  useEffect(() => {
    if (round > totalRounds || (round === totalRounds && timer === 0)) {
      navigate('/results');
    }
  }, [round, totalRounds, timer, navigate]);
  
  // Show loading state until ready
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-dashboard-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dashboard-accent border-t-transparent rounded-full mx-auto animate-spin"></div>
          <p className="mt-4 text-white text-lg">Initializing Portfolio Panic...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Dashboard onEndGame={onEndGame} />
      <NotificationSystem />
    </>
  );
};

export default Game;
