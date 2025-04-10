import React from 'react';
import { useGame } from '@/context/GameContext';
import { X, Check, Info, Award } from 'lucide-react';

const NotificationSystem = () => {
  const { notifications } = useGame();
  
  if (!notifications || notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 space-y-2 max-w-xs z-20">
      {notifications.map(notification => {
        let bgColor = 'bg-[#132237]';
        let icon = <Info className="h-5 w-5 text-dashboard-neutral" />;
        
        switch (notification.type) {
          case 'success':
            bgColor = 'bg-dashboard-positive/20 border-dashboard-positive/30';
            icon = <Check className="h-5 w-5 text-dashboard-positive" />;
            break;
          case 'error':
            bgColor = 'bg-dashboard-negative/20 border-dashboard-negative/30';
            icon = <X className="h-5 w-5 text-dashboard-negative" />;
            break;
          case 'achievement':
            bgColor = 'bg-dashboard-accent/20 border-dashboard-accent/30';
            icon = <Award className="h-5 w-5 text-dashboard-accent" />;
            break;
          default:
            bgColor = 'bg-dashboard-neutral/20 border-dashboard-neutral/30';
            icon = <Info className="h-5 w-5 text-dashboard-neutral" />;
        }
        
        return (
          <div 
            key={notification.id}
            className={`${bgColor} border p-3 rounded-lg text-white shadow-lg flex items-start gap-2 animate-slide-up`}
          >
            <div className="shrink-0 mt-0.5">
              {icon}
            </div>
            <div className="flex-1">
              {notification.message}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationSystem;
