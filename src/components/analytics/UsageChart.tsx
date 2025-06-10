import React from 'react';

interface UsageChartProps {
  data: number[];
}

export default function UsageChart({ data }: UsageChartProps) {
  const maxValue = Math.max(...data);
  
  return (
    <div className="h-64 w-full">
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-300 ease-in-out w-full"
              style={{
                height: `${(value / maxValue) * 100}%`,
                minHeight: '4px',
              }}
            />
            <span className="text-xs text-gray-400 mt-2 text-center">
              {index % 2 === 0 ? `Day ${index + 1}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}