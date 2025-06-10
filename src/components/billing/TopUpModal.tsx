import React, { useState } from 'react';
import { X, CreditCard, Building, Smartphone } from 'lucide-react';

interface TopUpModalProps {
  onClose: () => void;
  onTopUp: (amount: number) => void;
}

const presetAmounts = [10, 25, 50, 100, 250, 500];
const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
  { id: 'bank', name: 'Bank Transfer', icon: Building },
  { id: 'mobile', name: 'Mobile Payment', icon: Smartphone },
];

export default function TopUpModal({ onClose, onTopUp }: TopUpModalProps) {
  const [amount, setAmount] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onTopUp(amount);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Top Up Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Select Amount
            </label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`p-3 rounded-lg border font-medium transition-colors ${
                    amount === preset
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Custom amount"
                min="5"
                max="5000"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Payment Method
            </label>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <Icon className="h-5 w-5 text-gray-400" />
                    <span className="text-white font-medium">{method.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Amount</span>
              <span className="text-white font-medium">${amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300">Processing Fee</span>
              <span className="text-white font-medium">$0.00</span>
            </div>
            <div className="border-t border-gray-600 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-green-400 font-bold text-lg">${amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || amount < 5}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : `Top Up $${amount.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
}