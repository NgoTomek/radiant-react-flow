import React from 'react';
import { useGame } from '@/context/GameContext';
import { X, Check, Info, AlertTriangle, TrendingUp, TrendingDown, Award, DollarSign } from 'lucide-react';

const NotificationSystem = () => {
  const { notifications, settings } = useGame();
  
  // If notifications are disabled in settings, don't show any
  if (!settings.notifications) {
    return null;
  }
  
  // Filter to only show critical notifications
  const criticalNotifications = notifications.filter(notification => {
    // Only show specific notification types
    return (
      // Show errors
      notification.type === 'error' || 
      // Show achievements
      notification.type === 'achievement' || 
      // Only show warnings for significant events (market crashes or large losses)
      (notification.type === 'warning' && 
       (notification.message.includes('crash') || 
        notification.message.includes('Crash') || 
        notification.message.includes('dropped') ||
        notification.message.includes('Lost'))) ||
      // For success notifications, only show very significant gains
      (notification.type === 'success' && 
       (notification.message.includes('Profit:') && notification.message.includes('$1,000')))
    );
  });
  
  // Limit to maximum 3 notifications at a time to reduce clutter
  const limitedNotifications = criticalNotifications.slice(0, 3);
  
  if (!limitedNotifications || limitedNotifications.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 space-y-2 max-w-xs z-20">
      {limitedNotifications.map(notification => {
        let bgColor = 'bg-[#132237] border border-[#1A2B45]';
        let icon = <Info className="h-5 w-5 text-dashboard-neutral" />;
        
        switch (notification.type) {
          case 'success':
            bgColor = 'bg-dashboard-positive/20 border border-dashboard-positive/30';
            icon = <Check className="h-5 w-5 text-dashboard-positive" />;
            break;
          case 'error':
            bgColor = 'bg-dashboard-negative/20 border border-dashboard-negative/30';
            icon = <X className="h-5 w-5 text-dashboard-negative" />;
            break;
          case 'achievement':
            bgColor = 'bg-dashboard-accent/20 border border-dashboard-accent/30';
            icon = <Award className="h-5 w-5 text-dashboard-accent" />;
            break;
          case 'warning':
            bgColor = 'bg-[#FFD700]/20 border border-[#FFD700]/30';
            icon = <AlertTriangle className="h-5 w-5 text-[#FFD700]" />;
            break;
          case 'transaction':
            bgColor = 'bg-dashboard-neutral/20 border border-dashboard-neutral/30';
            icon = <DollarSign className="h-5 w-5 text-dashboard-neutral" />;
            break;
          default:
            bgColor = 'bg-dashboard-neutral/20 border border-dashboard-neutral/30';
            icon = <Info className="h-5 w-5 text-dashboard-neutral" />;
        }
        
        // Extract and highlight asset names in notifications
        const highlightedMessage = highlightAssets(notification.message);
        
        return (
          <div 
            key={notification.id}
            className={`${bgColor} p-3 rounded-lg text-white shadow-lg flex items-start gap-2 animate-slide-up`}
            style={{
              animation: 'slideUp 0.3s ease-out forwards',
              transformOrigin: 'bottom right'
            }}
          >
            <div className="shrink-0 mt-0.5">
              {icon}
            </div>
            <div className="flex-1 pr-6">
              {highlightedMessage}
            </div>
          </div>
        );
      })}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `
      }} />
    </div>
  );
};

// Function to highlight asset names in notification text
const highlightAssets = (text: string) => {
  const assetNames = ['stocks', 'oil', 'gold', 'crypto', 'bitcoin'];
  let parts: React.ReactNode[] = [text];
  
  assetNames.forEach(asset => {
    const newParts: React.ReactNode[] = [];
    
    parts.forEach(part => {
      if (typeof part !== 'string') {
        newParts.push(part);
        return;
      }
      
      const assetRegex = new RegExp(`\\b${asset}\\b`, 'gi');
      const splitParts = part.split(assetRegex);
      
      if (splitParts.length > 1) {
        for (let i = 0; i < splitParts.length; i++) {
          if (i > 0) {
            // Determine asset color
            let color;
            switch(asset.toLowerCase()) {
              case 'stocks':
                color = 'text-[#A2AAAD]';
                break;
              case 'oil':
                color = 'text-gray-300';
                break;
              case 'gold':
                color = 'text-[#FFD700]';
                break;
              case 'crypto':
              case 'bitcoin':
                color = 'text-[#F7931A]';
                break;
              default:
                color = 'text-dashboard-accent';
            }
            
            newParts.push(
              <span key={`${asset}-${i}`} className={`font-bold ${color}`}>
                {asset.charAt(0).toUpperCase() + asset.slice(1)}
              </span>
            );
          }
          
          if (splitParts[i]) {
            newParts.push(splitParts[i]);
          }
        }
      } else {
        newParts.push(part);
      }
    });
    
    parts = newParts;
  });
  
  // Also highlight currency values
  const newParts: React.ReactNode[] = [];
  parts.forEach(part => {
    if (typeof part !== 'string') {
      newParts.push(part);
      return;
    }
    
    const currencyRegex = /\$[\d,]+(\.\d+)?/g;
    const splitParts = part.split(currencyRegex);
    const matches = part.match(currencyRegex) || [];
    
    if (matches.length > 0) {
      for (let i = 0; i < splitParts.length; i++) {
        if (splitParts[i]) {
          newParts.push(splitParts[i]);
        }
        
        if (i < matches.length) {
          newParts.push(
            <span key={`currency-${i}`} className="font-bold text-white">
              {matches[i]}
            </span>
          );
        }
      }
    } else {
      newParts.push(part);
    }
  });
  
  return newParts;
};

export default NotificationSystem;
