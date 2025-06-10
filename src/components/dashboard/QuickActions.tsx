import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Plus, Key, CreditCard } from 'lucide-react';

export default function QuickActions() {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Link
          to="/sms"
          className="flex items-center space-x-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Send className="h-5 w-5 text-white" />
          <span className="text-white font-medium">Send SMS</span>
        </Link>
        
        <Link
          to="/sims"
          className="flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5 text-white" />
          <span className="text-white font-medium">Buy SIM Card</span>
        </Link>
        
        <Link
          to="/wallet"
          className="flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <CreditCard className="h-5 w-5 text-white" />
          <span className="text-white font-medium">Top Up Wallet</span>
        </Link>
        
        <Link
          to="/api-keys"
          className="flex items-center space-x-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Key className="h-5 w-5 text-white" />
          <span className="text-white font-medium">Generate API Key</span>
        </Link>
      </div>
    </div>
  );
}