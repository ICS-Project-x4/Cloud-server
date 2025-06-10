import React from 'react';
import { Globe } from 'lucide-react';

interface CountryData {
  country: string;
  messages: number;
  percentage: number;
}

interface CountryBreakdownProps {
  data: CountryData[];
}

const countryColors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-gray-500'
];

export default function CountryBreakdown({ data }: CountryBreakdownProps) {
  return (
    <div className="space-y-4">
      {data.map((country, index) => (
        <div key={country.country} className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            <div className={`w-3 h-3 rounded-full ${countryColors[index]}`} />
            <span className="text-gray-300 text-sm">{country.country}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white font-medium text-sm">
              {country.messages.toLocaleString()}
            </span>
            <span className="text-gray-400 text-sm w-12 text-right">
              {country.percentage}%
            </span>
          </div>
        </div>
      ))}
      
      <div className="mt-6">
        <div className="flex h-3 rounded-full overflow-hidden">
          {data.map((country, index) => (
            <div
              key={country.country}
              className={countryColors[index]}
              style={{ width: `${country.percentage}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}