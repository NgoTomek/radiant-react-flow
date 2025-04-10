
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 20000 },
  { name: 'Feb', value: 22000 },
  { name: 'Mar', value: 19000 },
  { name: 'Apr', value: 25000 },
  { name: 'May', value: 28000 },
  { name: 'Jun', value: 30000 },
  { name: 'Jul', value: 29000 },
  { name: 'Aug', value: 30000 },
  { name: 'Sep', value: 27000 },
];

const timeRanges = ['1D', '1W', '1M', '1Y', 'ALL'];

const NetWorthChart = () => {
  const [activeRange, setActiveRange] = useState('1M');

  return (
    <div className="bg-dashboard-card rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white font-bold">Net Worth</h2>
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                activeRange === range
                  ? 'bg-dashboard-background text-white'
                  : 'text-dashboard-text-secondary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-dashboard-text-secondary text-sm">Current</p>
          <p className="text-white text-2xl font-bold">$29,500</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-dashboard-background rounded-lg">
          <span className="text-dashboard-positive text-sm font-medium">+47.5%</span>
        </div>
      </div>

      <div className="h-60 mt-4">
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
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-dashboard-background p-4 rounded-lg">
          <p className="text-dashboard-text-secondary text-xs mb-1">Total Invested</p>
          <p className="text-white font-bold">$20,000</p>
        </div>
        <div className="bg-dashboard-background p-4 rounded-lg">
          <p className="text-dashboard-text-secondary text-xs mb-1">Total Returns</p>
          <p className="text-dashboard-positive font-bold">+$9,500</p>
        </div>
      </div>
    </div>
  );
};

export default NetWorthChart;
