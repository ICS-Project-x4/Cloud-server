import React, { useState } from 'react';
import { X, Globe, Signal, MessageSquare, Wifi, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SIMOption {
  id: string;
  country: string;
  provider: string;
  number: string;
  price: number;
  dataLimit: number;
  messagesLimit: number;
  rating: number;
  coverage: string;
  setup: string;
}

interface SIMMarketplaceProps {
  onClose: () => void;
  onPurchase: (sim: SIMOption) => void;
}

const availableSims: SIMOption[] = [
  {
    id: 'US-001',
    country: 'United States',
    provider: 'T-Mobile',
    number: '+1-555-0199',
    price: 25.00,
    dataLimit: 5.0,
    messagesLimit: 1000,
    rating: 4.8,
    coverage: '99%',
    setup: 'Instant'
  },
  {
    id: 'UK-001',
    country: 'United Kingdom',
    provider: 'EE',
    number: '+44-20-7946-0999',
    price: 32.00,
    dataLimit: 4.0,
    messagesLimit: 800,
    rating: 4.7,
    coverage: '98%',
    setup: 'Instant'
  },
  {
    id: 'DE-001',
    country: 'Germany',
    provider: 'O2',
    number: '+49-30-12345999',
    price: 28.00,
    dataLimit: 6.0,
    messagesLimit: 1200,
    rating: 4.6,
    coverage: '97%',
    setup: 'Instant'
  },
  {
    id: 'FR-001',
    country: 'France',
    provider: 'Orange',
    number: '+33-1-23-45-67-99',
    price: 30.00,
    dataLimit: 4.5,
    messagesLimit: 900,
    rating: 4.5,
    coverage: '96%',
    setup: 'Instant'
  },
  {
    id: 'JP-001',
    country: 'Japan',
    provider: 'SoftBank',
    number: '+81-3-1234-5999',
    price: 35.00,
    dataLimit: 3.0,
    messagesLimit: 600,
    rating: 4.9,
    coverage: '99%',
    setup: 'Instant'
  },
  {
    id: 'AU-001',
    country: 'Australia',
    provider: 'Telstra',
    number: '+61-2-9999-9999',
    price: 33.00,
    dataLimit: 5.5,
    messagesLimit: 1100,
    rating: 4.4,
    coverage: '95%',
    setup: 'Instant'
  }
];

export default function SIMMarketplace({ onClose, onPurchase }: SIMMarketplaceProps) {
  const [selectedSim, setSelectedSim] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateWalletBalance } = useAuth();

  const handlePurchase = async (sim: SIMOption) => {
    if (!user || user.walletBalance < sim.price) {
      alert('Insufficient wallet balance!');
      return;
    }

    setIsLoading(true);
    
    // Simulate purchase process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    updateWalletBalance(-sim.price);
    onPurchase(sim);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">SIM Card Marketplace</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableSims.map((sim) => (
              <div
                key={sim.id}
                className={`bg-gray-750 rounded-lg border p-6 cursor-pointer transition-all duration-200 ${
                  selectedSim === sim.id
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setSelectedSim(sim.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-400" />
                    <h3 className="text-white font-semibold">{sim.country}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-yellow-400 text-sm">{sim.rating}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-300">Provider: {sim.provider}</p>
                  <p className="text-gray-300">Number: {sim.number}</p>
                  <p className="text-gray-300">Coverage: {sim.coverage}</p>
                  <p className="text-gray-300">Setup: {sim.setup}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-300 text-sm">{sim.dataLimit}GB Data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">{sim.messagesLimit} SMS</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-400">${sim.price}/mo</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(sim);
                    }}
                    disabled={isLoading || !user || user.walletBalance < sim.price}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Purchase'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}