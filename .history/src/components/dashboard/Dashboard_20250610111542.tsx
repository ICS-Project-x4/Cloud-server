import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}!</h1>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Wallet Balance Card */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-2">Wallet Balance</h2>
              <p className="text-3xl font-bold text-blue-400">${user?.walletBalance.toFixed(2)}</p>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-2">Account Status</h2>
              <p className="text-green-400 font-medium">Active</p>
              <p className="text-gray-400 mt-2">Role: {user?.role}</p>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-2">Recent Activity</h2>
              <p className="text-gray-400">No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}