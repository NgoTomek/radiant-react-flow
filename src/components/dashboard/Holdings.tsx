
import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

type Holding = {
  id: number;
  name: string;
  price: string;
  change: number;
  value: string;
};

const holdingsData: Holding[] = [
  {
    id: 1,
    name: 'BTC',
    price: '$28,312',
    change: -5.1,
    value: '$150',
  },
  {
    id: 2,
    name: 'AAPL',
    price: '$165',
    change: 1.2,
    value: '$45',
  },
  {
    id: 3,
    name: 'TSLA',
    price: '$214',
    change: -2.3,
    value: '$1,940',
  },
];

const Holdings = () => {
  return (
    <div className="bg-dashboard-card rounded-xl p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-bold">Holdings</h2>
        <span className="text-dashboard-text-secondary text-sm">See All</span>
      </div>

      <div className="space-y-4">
        {holdingsData.map((holding) => (
          <HoldingItem key={holding.id} holding={holding} />
        ))}
      </div>
    </div>
  );
};

const HoldingItem = ({ holding }: { holding: Holding }) => {
  const isNegative = holding.change < 0;
  
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-dashboard-background flex items-center justify-center">
          <span className="text-white font-bold text-xs">{holding.name}</span>
        </div>
        <div>
          <div className="text-white font-medium">{holding.name}</div>
          <div className="text-dashboard-text-secondary text-sm">{holding.price}</div>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <div className="text-white font-medium">{holding.value}</div>
        <div className={`flex items-center ${isNegative ? 'text-dashboard-negative' : 'text-dashboard-positive'}`}>
          {isNegative ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
          <span className="text-xs font-medium">{Math.abs(holding.change)}%</span>
        </div>
      </div>
    </div>
  );
};

export default Holdings;
