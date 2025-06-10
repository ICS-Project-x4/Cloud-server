import React, { useState, useEffect } from 'react';
import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, DollarSign, CreditCard } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function Wallets() {
  const [balance, setBalance] = useState(245.80);
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'credit',
      amount: 100.00,
      description: 'Top-up via Credit Card',
      date: '2024-03-20',
      status: 'completed'
    },
    {
      id: '2',
      type: 'debit',
      amount: 25.50,
      description: 'SMS Credits Purchase',
      date: '2024-03-19',
      status: 'completed'
    },
    {
      id: '3',
      type: 'debit',
      amount: 15.75,
      description: 'API Usage',
      date: '2024-03-18',
      status: 'completed'
    }
  ]);

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');

  const handleTopUp = () => {
    if (!topUpAmount) return;
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    setBalance(prev => prev + amount);
    setShowTopUpModal(false);
    setTopUpAmount('');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <button
          onClick={() => setShowTopUpModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Top Up Balance</span>
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-gray-400 text-sm mb-1">Available Balance</h2>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">${balance.toFixed(2)}</span>
              <span className="text-green-400 text-sm">USD</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-6 hover:bg-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowDownLeft className="h-5 w-5 text-green-400" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-400">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 capitalize">{transaction.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Top Up Balance</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    id="amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTopUpModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTopUp}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Add Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 