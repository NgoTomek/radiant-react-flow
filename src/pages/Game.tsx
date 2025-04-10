import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { useGame } from '@/context/GameContext';
import NotificationSystem from '@/components/dashboard/NotificationSystem';

const Game = () => {
  const navigate = useNavigate();
  const { startGame, handleEndGame } = useGame();
  
  // Start the game when component mounts
  useEffect(() => {
    startGame();
  }, [startGame]);
  
  // Handle game end
  const onEndGame = () => {
    handleEndGame();
    navigate('/results');
  };
  
  return (
    <>
      <Dashboard onEndGame={onEndGame} />
      <NotificationSystem />
    </>
  );
};

export default Game;
