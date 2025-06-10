import React from 'react';

interface RevenueData {
  month: string;
  revenue: number;
  messages: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="h-64 w-full">
      <div className="flex items-end justify-between h-full space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm transition-all duration-300 ease-in-out w-full"
              style={{
                height: `${(item.revenue / maxRevenue) * 100}%`,
                minHeight: '4px',
              }}
            />
            <span className="text-xs text-gray-400 mt-2 text-center transform -rotate-45">
              {item.month}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-4">
        <span>Revenue: ${data[0]?.revenue.toLocaleString()}</span>
        <span>Peak: ${maxRevenue.toLocaleString()}</span>
      </div>
    </div>
  );
}