import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import { MessageSquare, Send, Users, Globe, Clock, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const stats = {
    totalMessages: 145620,
    deliveryRate: 98.7,
    avgResponseTime: 1.2,
    revenue: 7842.50,
    activeUsers: 2847,
    countries: 45
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome, {user?.name}!</h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <StatsCard
            title="Total Messages"
            value={stats.totalMessages.toLocaleString()}
            icon={MessageSquare}
            trend={+15.3}
            color="blue"
          />
          <StatsCard
            title="Delivery Rate"
            value={`${stats.deliveryRate}%`}
            icon={Send}
            trend={+0.8}
            color="green"
          />
          <StatsCard
            title="Response Time"
            value={`${stats.avgResponseTime}s`}
            icon={Clock}
            trend={-12.4}
            color="purple"
          />
          <StatsCard
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={DollarSign}
            trend={+23.1}
            color="yellow"
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            icon={Users}
            trend={+8.7}
            color="green"
          />
          <StatsCard
            title="Countries"
            value={stats.countries.toString()}
            icon={Globe}
            trend={+5}
            color="blue"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}