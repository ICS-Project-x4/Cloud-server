import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { sims } from '../../services/api';
import SIMCard from './SIMCard';
import SIMMarketplace from './SIMMarketplace';

interface BackendSIM {
  id: number;
  iccid: string;
  phone_number: string;
  status: string;
  is_active: boolean;
  expiry_date: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface SIM {
  id: number;
  iccid: string;
  phone_number: string;
  status: string;
  is_active: boolean;
  expiry_date: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  messagesUsed: number;
  messagesLimit: number;
}

interface MarketplaceSIM {
  iccid: string;
  phone_number: string;
  price: number;
  messagesLimit: number;
  rating: number;
  coverage: string;
  setup: string;
}

export default function SIMManager() {
  const [activeSims, setActiveSims] = useState<SIM[]>([]);
  const [showMarketplace, setShowMarketplace] = useState(false);

  useEffect(() => {
    fetchSims();
  }, []);

  const fetchSims = async () => {
    try {
      const response = await sims.list();
      const simsWithMessages = response.map((sim: BackendSIM) => ({
        ...sim,
        messagesUsed: 0,
        messagesLimit: 1000 // Default message limit
      }));
      setActiveSims(simsWithMessages);
    } catch (error) {
      console.error('Error fetching SIMs:', error);
    }
  };

  const handlePurchaseSIM = (sim: MarketplaceSIM) => {
    const newSim: SIM = {
      id: Date.now(), // Temporary ID until backend assigns one
      iccid: sim.iccid,
      phone_number: sim.phone_number,
      status: 'active',
      is_active: true,
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      user_id: 1, // Temporary user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messagesUsed: 0,
      messagesLimit: sim.messagesLimit
    };

    setActiveSims([...activeSims, newSim]);
    setShowMarketplace(false);
  };

  const toggleSIMStatus = async (id: number) => {
    try {
      const sim = activeSims.find(s => s.id === id);
      if (!sim) return;

      const newStatus = !sim.is_active;
      await sims.update(id, { is_active: newStatus });

      setActiveSims(activeSims.map(s => 
        s.id === id ? { ...s, is_active: newStatus } : s
      ));
    } catch (error) {
      console.error('Error toggling SIM status:', error);
    }
  };

  const stats = {
    totalSims: activeSims.length,
    activeSims: activeSims.filter(sim => sim.is_active).length,
    totalMessages: activeSims.reduce((sum, sim) => sum + sim.messagesUsed, 0),
    totalMessagesLimit: activeSims.reduce((sum, sim) => sum + sim.messagesLimit, 0),
    monthlyCost: activeSims.length * 25 // Assuming $25 per SIM per month
  };

  return (
    <div className="px-6 py-8">

    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total SIMs</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalSims}</h3>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active SIMs</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.activeSims}</h3>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Messages Used</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalMessages}</h3>
              <p className="text-gray-400 text-sm mt-1">of {stats.totalMessagesLimit}</p>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Monthly Cost</p>
              <h3 className="text-2xl font-bold text-white mt-1">${stats.monthlyCost}</h3>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
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

        {/* Add New SIM Card */}
        <button
          onClick={() => setShowMarketplace(true)}
          className="bg-gray-800 rounded-xl border-2 border-dashed border-gray-700 p-6 hover:border-blue-500 hover:bg-gray-750 transition-colors duration-200 flex flex-col items-center justify-center min-h-[300px]"
        >
          <div className="bg-blue-500/10 p-3 rounded-lg mb-4">
            <Plus className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Add New SIM</h3>
          <p className="text-gray-400 text-center">Purchase a new SIM card to start sending messages</p>
        </button>
      </div>

      {/* SIM Marketplace Modal */}
      {showMarketplace && (
        <SIMMarketplace
          onClose={() => setShowMarketplace(false)}
          onPurchase={handlePurchaseSIM}
        />
      )}
    </div>
    </div>
  );
}