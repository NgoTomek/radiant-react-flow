
import React from 'react';
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Holding = {
  id: number;
  name: string;
  symbol: string;
  price: string;
  change: number;
  value: string;
  color: string;
};

const holdingsData: Holding[] = [
  {
    id: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    price: '$28,312',
    change: -5.1,
    value: '$1,940',
    color: '#F7931A',
  },
  {
    id: 2,
    name: 'Apple Inc.',
    symbol: 'AAPL',
    price: '$165',
    change: 1.2,
    value: '$825',
    color: '#A2AAAD',
  },
  {
    id: 3,
    name: 'Tesla, Inc.',
    symbol: 'TSLA',
    price: '$214',
    change: -2.3,
    value: '$428',
    color: '#E31937',
  },
  {
    id: 4,
    name: 'Gold',
    symbol: 'GLD',
    price: '$1,845',
    change: 0.8,
    value: '$922',
    color: '#FFD700',
  },
];

const Holdings = () => {
  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
      <CardHeader className="p-6 pb-0">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Assets</h2>
          <Button variant="ghost" size="sm" className="text-[#A3B1C6] text-sm hover:text-white p-0">
            <span>See All</span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {holdingsData.map((holding) => (
            <HoldingItem key={holding.id} holding={holding} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const HoldingItem = ({ holding }: { holding: Holding }) => {
  const isNegative = holding.change < 0;
  
  return (
    <div className="flex justify-between items-center hover:bg-[#1A2B45] p-2 rounded-lg transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${holding.color}20`, color: holding.color }}>
          <span className="font-bold text-xs">{holding.symbol}</span>
        </div>
        <div>
          <div className="text-white font-medium">{holding.name}</div>
          <div className="text-[#A3B1C6] text-sm">{holding.price}</div>
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
