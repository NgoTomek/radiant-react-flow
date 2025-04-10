
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Volume2, Volume1, VolumeX, MonitorSmartphone, Clock, Lightbulb, Smartphone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const Settings = () => {
  // These state variables would be saved to persistent storage in a real app
  const [soundVolume, setSoundVolume] = useState(80);
  const [musicVolume, setMusicVolume] = useState(60);
  const [difficulty, setDifficulty] = useState('medium');
  const [roundTime, setRoundTime] = useState(60);
  const [username, setUsername] = useState('Trader1');
  const [displayMode, setDisplayMode] = useState('dark');
  
  return (
    <div className="min-h-screen bg-dashboard-background text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-dashboard-text-secondary hover:text-white mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back to Main Menu
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-dashboard-text-secondary">Customize your game experience</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Volume2 className="mr-2" size={20} />
                Sound Settings
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="sound-volume" className="text-dashboard-text-secondary">Sound Effects</Label>
                    <span className="text-white">{soundVolume}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VolumeX size={16} className="text-dashboard-text-secondary" />
                    <Input
                      id="sound-volume"
                      type="range"
                      min="0"
                      max="100"
                      value={soundVolume}
                      onChange={(e) => setSoundVolume(parseInt(e.target.value))}
                      className="accent-dashboard-accent h-2 bg-[#0A1629]"
                    />
                    <Volume2 size={16} className="text-dashboard-text-secondary" />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="music-volume" className="text-dashboard-text-secondary">Music</Label>
                    <span className="text-white">{musicVolume}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VolumeX size={16} className="text-dashboard-text-secondary" />
                    <Input
                      id="music-volume"
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                      className="accent-dashboard-accent h-2 bg-[#0A1629]"
                    />
                    <Volume1 size={16} className="text-dashboard-text-secondary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <MonitorSmartphone className="mr-2" size={20} />
                Display Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="display-mode" className="text-dashboard-text-secondary block mb-2">Display Mode</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className={`bg-[#0A1629] border-[#1A2B45] ${displayMode === 'dark' ? 'border-dashboard-accent text-dashboard-accent' : 'text-white'}`}
                      onClick={() => setDisplayMode('dark')}
                    >
                      <Lightbulb className="mr-2" size={16} />
                      Dark Mode
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`bg-[#0A1629] border-[#1A2B45] ${displayMode === 'light' ? 'border-dashboard-accent text-dashboard-accent' : 'text-white'}`}
                      onClick={() => setDisplayMode('light')}
                    >
                      <Lightbulb className="mr-2" size={16} fill="currentColor" />
                      Light Mode
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="username" className="text-dashboard-text-secondary block mb-2">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-[#0A1629] border-[#1A2B45] text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Clock className="mr-2" size={20} />
                Game Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="difficulty" className="text-dashboard-text-secondary block mb-2">Difficulty</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      className={`bg-[#0A1629] border-[#1A2B45] ${difficulty === 'easy' ? 'border-dashboard-accent text-dashboard-accent' : 'text-white'}`}
                      onClick={() => setDifficulty('easy')}
                    >
                      Easy
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`bg-[#0A1629] border-[#1A2B45] ${difficulty === 'medium' ? 'border-dashboard-accent text-dashboard-accent' : 'text-white'}`}
                      onClick={() => setDifficulty('medium')}
                    >
                      Medium
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`bg-[#0A1629] border-[#1A2B45] ${difficulty === 'hard' ? 'border-dashboard-accent text-dashboard-accent' : 'text-white'}`}
                      onClick={() => setDifficulty('hard')}
                    >
                      Hard
                    </Button>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="round-time" className="text-dashboard-text-secondary">Round Time (seconds)</Label>
                    <span className="text-white">{roundTime}s</span>
                  </div>
                  <Input
                    id="round-time"
                    type="range"
                    min="30"
                    max="120"
                    step="10"
                    value={roundTime}
                    onChange={(e) => setRoundTime(parseInt(e.target.value))}
                    className="accent-dashboard-accent h-2 bg-[#0A1629]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Smartphone className="mr-2" size={20} />
                About & Support
              </h2>
              
              <div className="space-y-4">
                <div className="bg-[#0A1629] p-4 rounded-lg">
                  <p className="text-dashboard-text-secondary text-sm mb-1">Version</p>
                  <p className="font-medium">Portfolio Panic v1.0.0</p>
                </div>
                
                <div className="bg-[#0A1629] p-4 rounded-lg">
                  <p className="text-dashboard-text-secondary text-sm mb-1">Developer</p>
                  <p className="font-medium">Portfolio Panic Team</p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full bg-[#0A1629] border-[#1A2B45] text-white hover:bg-[#1A2B45]"
                >
                  Contact Support
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full bg-[#0A1629] border-[#1A2B45] text-white hover:bg-[#1A2B45]"
                >
                  Privacy Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end mt-8">
          <Link to="/">
            <Button className="bg-dashboard-accent hover:bg-dashboard-accent-hover px-8">
              Save Changes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Settings;
