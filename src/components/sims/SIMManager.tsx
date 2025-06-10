import React, { useState } from 'react';
import { Smartphone, Plus, ShoppingCart, Signal, Battery, Wifi, MessageSquare } from 'lucide-react';
import SIMCard from './SIMCard';
import SIMMarketplace from './SIMMarketplace';

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

export default function SIMManager() {
  const [activeSims, setActiveSims] = useState<SIM[]>([
    {
      id: 'SIM-001',
      number: '+1-555-0123',
      country: 'United States',
      provider: 'AT&T',
      status: 'active',
      monthlyFee: 25.00,
      dataUsed: 1.2,
      dataLimit: 5.0,
      messagesUsed: 450,
      messagesLimit: 1000,
      purchaseDate: new Date('2024-01-15'),
      expiryDate: new Date('2024-12-15'),
      signal: 85
    },
    {
      id: 'SIM-002',
      number: '+44-20-7946-0958',
      country: 'United Kingdom',
      provider: 'Vodafone',
      status: 'active',
      monthlyFee: 30.00,
      dataUsed: 0.8,
      dataLimit: 3.0,
      messagesUsed: 120,
      messagesLimit: 500,
      purchaseDate: new Date('2024-02-01'),
      expiryDate: new Date('2024-12-01'),
      signal: 92
    },
    {
      id: 'SIM-003',
      number: '+49-30-12345678',
      country: 'Germany',
      provider: 'Deutsche Telekom',
      status: 'inactive',
      monthlyFee: 28.00,
      dataUsed: 0,
      dataLimit: 4.0,
      messagesUsed: 0,
      messagesLimit: 750,
      purchaseDate: new Date('2024-01-20'),
      expiryDate: new Date('2024-11-20'),
      signal: 0
    }
  ]);

  const [showMarketplace, setShowMarketplace] = useState(false);

  const handlePurchaseSIM = (sim: any) => {
    const newSIM: SIM = {
      id: `SIM-${String(activeSims.length + 1).padStart(3, '0')}`,
      number: sim.number,
      country: sim.country,
      provider: sim.provider,
      status: 'active',
      monthlyFee: sim.price,
      dataUsed: 0,
      dataLimit: sim.dataLimit,
      messagesUsed: 0,
      messagesLimit: sim.messagesLimit,
      purchaseDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      signal: 100
    };

    setActiveSims(prev => [...prev, newSIM]);
    setShowMarketplace(false);
  };

  const toggleSIMStatus = (id: string) => {
    setActiveSims(prev => prev.map(sim => 
      sim.id === id 
        ? { ...sim, status: sim.status === 'active' ? 'inactive' : 'active' }
        : sim
    ));
  };

  const stats = {
    totalSims: activeSims.length,
    activeSims: activeSims.filter(sim => sim.status === 'active').length,
    totalDataUsed: activeSims.reduce((sum, sim) => sum + sim.dataUsed, 0),
    totalMessagesUsed: activeSims.reduce((sum, sim) => sum + sim.messagesUsed, 0),
    monthlyCost: activeSims.reduce((sum, sim) => sum + sim.monthlyFee, 0)
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total SIMs</p>
              <p className="text-2xl font-bold text-white">{stats.totalSims}</p>
            </div>
            <Smartphone className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active SIMs</p>
              <p className="text-2xl font-bold text-white">{stats.activeSims}</p>
            </div>
            <Signal className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Data Used</p>
              <p className="text-2xl font-bold text-white">{stats.totalDataUsed.toFixed(1)}GB</p>
            </div>
            <Wifi className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Messages</p>
              <p className="text-2xl font-bold text-white">{stats.totalMessagesUsed}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Monthly Cost</p>
              <p className="text-2xl font-bold text-white">${stats.monthlyCost.toFixed(2)}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your SIM Cards</h2>
        <button
          onClick={() => setShowMarketplace(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Buy SIM Card</span>
        </button>
      </div>

      {/* SIM Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeSims.map((sim) => (
          <SIMCard
            key={sim.id}
            sim={sim}
            onToggleStatus={toggleSIMStatus}
          />
        ))}
      </div>

      {/* Marketplace Modal */}
      {showMarketplace && (
        <SIMMarketplace
          onClose={() => setShowMarketplace(false)}
          onPurchase={handlePurchaseSIM}
        />
      )}
    </div>
  );
}