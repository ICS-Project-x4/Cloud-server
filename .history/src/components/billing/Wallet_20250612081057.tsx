import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, History, TrendingUp, DollarSign, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { wallet } from '../../services/api';
import TopUpModal from './TopUpModal';

interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function Wallet() {
  const { user, updateWalletBalance } = useAuth();
  const [showTopUp, setShowTopUp] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await wallet.getTransactions();
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const calculateTotal = (type: 'credit' | 'debit') => {
    return transactions
      .filter(t => t.type === type && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const calculateMonthlySpend = () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return transactions
      .filter(t => 
        t.type === 'debit' && 
        t.status === 'completed' && 
        new Date(t.created_at) > thirtyDaysAgo
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const stats = {
    totalSpent: calculateTotal('debit'),
    totalTopUps: calculateTotal('credit'),
    monthlySpend: calculateMonthlySpend(),
    pendingTransactions: transactions.filter(t => t.status === 'pending').length
  };

  const handleTopUp = async (amount: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await updateWalletBalance(amount);
      const data = await wallet.getTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error('Error during top-up:', error);
      setError('Failed to process top-up');
    } finally {
      setIsLoading(false);
      setShowTopUp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">Wallet Balance</h2>
            <p className="text-blue-100 text-4xl font-bold">
              ${Number(user?.walletBalance || 0).toFixed(2)}
            </p>
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
              <p className="text-2xl font-bold text-white">
                ${Number(stats.totalSpent).toFixed(2)}
              </p>
            </div>
            <Receipt className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Top-ups</p>
              <p className="text-2xl font-bold text-white">
                ${Number(stats.totalTopUps).toFixed(2)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Monthly Spend</p>
              <p className="text-2xl font-bold text-white">
                ${Number(stats.monthlySpend).toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">
                {stats.pendingTransactions}
              </p>
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
                    {new Date(transaction.created_at).toLocaleDateString()} • ID: {transaction.id}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}${Math.abs(Number(transaction.amount)).toFixed(2)}
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