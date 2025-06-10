import React, { useState } from 'react';
import { CreditCard, Plus, History, TrendingUp, DollarSign, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import TopUpModal from './TopUpModal';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

export default function Wallet() {
  const { user, updateWalletBalance } = useAuth();
  const [showTopUp, setShowTopUp] = useState(false);
  const [transactions] = useState<Transaction[]>([
    {
      id: 'TXN-001',
      type: 'credit',
      amount: 100.00,
      description: 'Wallet top-up via Credit Card',
      timestamp: new Date(Date.now() - 86400000),
      status: 'completed'
    },
    {
      id: 'TXN-002',
      type: 'debit',
      amount: 5.25,
      description: 'SMS charges - 105 messages sent',
      timestamp: new Date(Date.now() - 172800000),
      status: 'completed'
    },
    {
      id: 'TXN-003',
      type: 'debit',
      amount: 25.00,
      description: 'SIM card monthly fee - SIM-001',
      timestamp: new Date(Date.now() - 259200000),
      status: 'completed'
    },
    {
      id: 'TXN-004',
      type: 'credit',
      amount: 50.00,
      description: 'Wallet top-up via Bank Transfer',
      timestamp: new Date(Date.now() - 345600000),
      status: 'completed'
    },
    {
      id: 'TXN-005',
      type: 'debit',
      amount: 2.50,
      description: 'SMS charges - 50 messages sent',
      timestamp: new Date(Date.now() - 432000000),
      status: 'pending'
    }
  ]);

  const stats = {
    totalSpent: transactions
      .filter(t => t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalTopUps: transactions
      .filter(t => t.type === 'credit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    monthlySpend: 32.75,
    pendingTransactions: transactions.filter(t => t.status === 'pending').length
  };

  const handleTopUp = (amount: number) => {
    updateWalletBalance(amount);
    setShowTopUp(false);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">Wallet Balance</h2>
            <p className="text-blue-100 text-4xl font-bold">${user?.walletBalance?.toFixed(2) || '0.00'}</p>
            <p className="text-blue-200 mt-2">Available for SMS and SIM purchases</p>
          </div>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => setShowTopUp(true)}
              className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Top Up</span>
            </button>
            <CreditCard className="h-12 w-12 text-blue-200 mx-auto" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-white">${stats.totalSpent.toFixed(2)}</p>
            </div>
            <Receipt className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Top-ups</p>
              <p className="text-2xl font-bold text-white">${stats.totalTopUps.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Monthly Spend</p>
              <p className="text-2xl font-bold text-white">${stats.monthlySpend.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">{stats.pendingTransactions}</p>
            </div>
            <History className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Transaction History</h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-750 rounded-lg border border-gray-600"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'credit' 
                    ? 'bg-green-400/10 text-green-400' 
                    : 'bg-red-400/10 text-red-400'
                }`}>
                  {transaction.type === 'credit' ? (
                    <ArrowDownRight className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{transaction.description}</p>
                  <p className="text-gray-400 text-sm">
                    {transaction.timestamp.toLocaleDateString()} • ID: {transaction.id}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
                <p className={`text-xs ${
                  transaction.status === 'completed' 
                    ? 'text-green-400' 
                    : transaction.status === 'pending' 
                    ? 'text-yellow-400' 
                    : 'text-red-400'
                }`}>
                  {transaction.status.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <TopUpModal
          onClose={() => setShowTopUp(false)}
          onTopUp={handleTopUp}
        />
      )}
    </div>
  );
}