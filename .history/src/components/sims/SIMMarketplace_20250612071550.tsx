import React, { useState } from 'react';
import { X, Globe, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sims } from '../../services/api';

interface SIMOption {
  iccid: string;
  phone_number: string;
  price: number;
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
    iccid: '89012345678901234567',
    phone_number: '+1-555-0199',
    price: 25.00,
    messagesLimit: 1000,
    rating: 4.8,
    coverage: '99%',
    setup: 'Instant'
  },
  {
    iccid: '89012345678901234568',
    phone_number: '+44-20-7946-0999',
    price: 32.00,
    messagesLimit: 800,
    rating: 4.7,
    coverage: '98%',
    setup: 'Instant'
  },
  {
    iccid: '89012345678901234569',
    phone_number: '+49-30-12345999',
    price: 28.00,
    messagesLimit: 1200,
    rating: 4.6,
    coverage: '97%',
    setup: 'Instant'
  },
  {
    iccid: '89012345678901234570',
    phone_number: '+33-1-23-45-67-99',
    price: 30.00,
    messagesLimit: 900,
    rating: 4.5,
    coverage: '96%',
    setup: 'Instant'
  },
  {
    iccid: '89012345678901234571',
    phone_number: '+81-3-1234-5999',
    price: 35.00,
    messagesLimit: 600,
    rating: 4.9,
    coverage: '99%',
    setup: 'Instant'
  },
  {
    iccid: '89012345678901234572',
    phone_number: '+61-2-9999-9999',
    price: 33.00,
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
    if (!user || !user.walletBalance || user.walletBalance < sim.price) {
      alert('Insufficient wallet balance!');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create a debit transaction for the SIM purchase
      await updateWalletBalance(-sim.price, `SIM Purchase: ${sim.phone_number}`);

      // Create the SIM in the database
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now

      const newSim = await sims.create({
        iccid: sim.iccid,
        phone_number: sim.phone_number,
        data_plan: `${sim.messagesLimit} SMS`, // Using messagesLimit as the data plan
        expiry_date: expiryDate.toISOString()
      });

      // Call the onPurchase callback with the marketplace SIM data
      onPurchase(sim);
    } catch (error) {
      console.error('Error purchasing SIM:', error);
      alert('Failed to purchase SIM. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                key={sim.iccid}
                className={`bg-gray-750 rounded-lg border p-6 cursor-pointer transition-all duration-200 ${
                  selectedSim === sim.iccid
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setSelectedSim(sim.iccid)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-400" />
                    <h3 className="text-white font-semibold">{sim.phone_number}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-yellow-400 text-sm">{sim.rating}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-300">ICCID: {sim.iccid}</p>
                  <p className="text-gray-300">Coverage: {sim.coverage}</p>
                  <p className="text-gray-300">Setup: {sim.setup}</p>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300 text-sm">{sim.messagesLimit} SMS</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-400">${sim.price}/mo</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(sim);
                    }}
                    disabled={isLoading || !user || !user.walletBalance || user.walletBalance < sim.price}
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