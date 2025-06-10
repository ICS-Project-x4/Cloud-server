import React from 'react';
import { Signal, Wifi, MessageSquare, Power, PowerOff, Calendar } from 'lucide-react';

interface SIM {
  id: string;
  number: string;
  country: string;
  provider: string;
  status: 'active' | 'inactive' | 'suspended';
  monthlyFee: number;
  dataUsed: number;
  dataLimit: number;
  messagesUsed: number;
  messagesLimit: number;
  purchaseDate: Date;
  expiryDate: Date;
  signal: number;
}

interface SIMCardProps {
  sim: SIM;
  onToggleStatus: (id: string) => void;
}

export default function SIMCard({ sim, onToggleStatus }: SIMCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'inactive':
        return 'text-gray-400 bg-gray-400/10';
      case 'suspended':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getSignalBars = (signal: number) => {
    const bars = Math.floor(signal / 25);
    return Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={`w-1 rounded-full ${
          i < bars ? 'bg-green-400' : 'bg-gray-600'
        }`}
        style={{ height: `${(i + 1) * 3 + 4}px` }}
      />
    ));
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:bg-gray-750 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sim.status)}`}>
            {sim.status.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {getSignalBars(sim.signal)}
        </div>
      </div>

      {/* SIM Info */}
      <div className="mb-4">
        <h3 className="text-white font-semibold text-lg">{sim.id}</h3>
        <p className="text-gray-300 text-sm">{sim.number}</p>
        <p className="text-gray-400 text-xs">{sim.country} • {sim.provider}</p>
      </div>

      {/* Usage Stats */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-purple-400" />
              <span className="text-gray-300 text-sm">Data</span>
            </div>
            <span className="text-white text-sm">{sim.dataUsed}/{sim.dataLimit}GB</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(sim.dataUsed / sim.dataLimit) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              <span className="text-gray-300 text-sm">Messages</span>
            </div>
            <span className="text-white text-sm">{sim.messagesUsed}/{sim.messagesLimit}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(sim.messagesUsed / sim.messagesLimit) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-600">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-400 text-xs">
            Expires: {sim.expiryDate.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-green-400 font-medium text-sm">${sim.monthlyFee}/mo</span>
          <button
            onClick={() => onToggleStatus(sim.id)}
            className={`p-2 rounded-lg transition-colors ${
              sim.status === 'active'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {sim.status === 'active' ? (
              <PowerOff className="h-4 w-4" />
            ) : (
              <Power className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}