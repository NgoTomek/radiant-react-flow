import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { useGame } from '@/context/GameContext';
import NotificationSystem from '@/components/dashboard/NotificationSystem';

const Game = () => {
  const navigate = useNavigate();
  const { startGame, handleEndGame, round, totalRounds, timer } = useGame();
  const [gameInitialized, setGameInitialized] = useState(false);
  
  // Start the game when component mounts
  useEffect(() => {
    // Create a small delay to ensure the context is fully initialized
    // This helps prevent the "getAssetBadge is not defined" error
    const timer = setTimeout(() => {
      startGame();
      setGameInitialized(true);
    }, 50);
    
    // Clean up function
    return () => {
      clearTimeout(timer);
      // Context handles other cleanups
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
  
  // Show a loading indicator until game is initialized
  if (!gameInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-dashboard-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dashboard-accent border-t-transparent rounded-full mx-auto animate-spin"></div>
          <p className="mt-4 text-white text-lg">Loading game...</p>
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
