import React from 'react';

interface LiveChartProps {
  data: number[];
}

export default function LiveChart({ data }: LiveChartProps) {
  const maxValue = Math.max(...data, 100);
  
  return (
    <div className="h-48 w-full">
      <div className="flex items-end justify-between h-full space-x-1">
        {data.map((value, index) => (
          <div
            key={index}
            className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-300 ease-in-out"
            style={{
              height: `${(value / maxValue) * 100}%`,
              width: `${100 / Math.max(data.length, 30)}%`,
              minHeight: '2px',
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>30min ago</span>
        <span>15min ago</span>
        <span>Now</span>
      </div>
    </div>
  );
}