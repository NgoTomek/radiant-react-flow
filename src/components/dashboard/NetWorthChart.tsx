
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const data = [
  { name: 'Jan', value: 20000 },
  { name: 'Feb', value: 22000 },
  { name: 'Mar', value: 19000 },
  { name: 'Apr', value: 25000 },
  { name: 'May', value: 28000 },
  { name: 'Jun', value: 30000 },
  { name: 'Jul', value: 29000 },
  { name: 'Aug', value: 30000 },
  { name: 'Sep', value: 29500 },
];

const timeRanges = ['1D', '1W', '1M', '3M', 'ALL'];

const NetWorthChart = () => {
  const [activeRange, setActiveRange] = useState('1M');

  return (
    <Card className="bg-[#132237] border-none rounded-xl overflow-hidden">
      <CardHeader className="p-6 pb-0">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Net Worth History</h2>
          <div className="flex gap-1 bg-[#0A1629] rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeRange === range
                    ? 'bg-dashboard-accent text-white'
                    : 'text-[#A3B1C6] hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <p className="text-[#A3B1C6] text-sm">Current</p>
            <p className="text-white text-2xl font-bold">$29,500</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-[#0A1629] rounded-lg">
            <span className="text-dashboard-positive text-sm font-medium">+47.5%</span>
          </div>
        </div>

        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#A3B1C6', fontSize: 10 }}
              />
              <YAxis 
                hide={true}
                domain={['dataMin - 2000', 'dataMax + 2000']} 
              />
              <CartesianGrid 
                vertical={false} 
                horizontal={true}
                strokeDasharray="3 3" 
                stroke="#1A2B45"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#132237', 
                  borderColor: '#1A2B45',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
                labelStyle={{ color: '#A3B1C6' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#FF6B00" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetWorthChart;
