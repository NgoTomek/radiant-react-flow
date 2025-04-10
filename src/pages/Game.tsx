import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { useGame } from '@/context/GameContext';
import NotificationSystem from '@/components/dashboard/NotificationSystem';

const Game = () => {
  const navigate = useNavigate();
  const { startGame, handleEndGame, round, totalRounds, timer } = useGame();
  
  // Start the game when component mounts
  useEffect(() => {
    // Initialize and start the game
    startGame();
    
    // Clean up function
    return () => {
      // Nothing to clean up here as the context handles timers
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
  
  return (
    <>
      <Dashboard onEndGame={onEndGame} />
      <NotificationSystem />
    </>
  );
};

export default Game;
