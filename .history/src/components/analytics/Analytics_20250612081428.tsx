import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Send,
  Users,
  Globe,
  Clock,
  DollarSign
} from 'lucide-react';
import StatsCard from '../dashboard/StatsCard';
import UsageChart from './UsageChart';
import CountryBreakdown from './CountryBreakdown';
import RevenueChart from './RevenueChart';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartData, setChartData] = useState<number[]>([]);

  useEffect(() => {
    // Generate consistent chart data based on time range
    const generateData = () => {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const baseValues = {
        '7d': [850, 920, 780, 1050, 1200, 980, 1100],
        '30d': Array.from({ length: 30 }, (_, i) => 800 + Math.sin(i * 0.2) * 200 + (i * 5)),
        '90d': Array.from({ length: 90 }, (_, i) => 750 + Math.sin(i * 0.1) * 150 + (i * 2))
      };
      return baseValues[timeRange as keyof typeof baseValues] || baseValues['7d'];
    };
    
    setChartData(generateData());
  }, [timeRange]);

  const stats = {
    totalMessages: 145620,
    deliveryRate: 98.7,
    avgResponseTime: 1.2,
    revenue: 7842.50,
    activeUsers: 2847,
    countries: 45
  };

  const countryData = [
    { country: 'United States', messages: 45230, percentage: 31.1 },
    { country: 'United Kingdom', messages: 23450, percentage: 16.1 },
    { country: 'Germany', messages: 18900, percentage: 13.0 },
    { country: 'France', messages: 15600, percentage: 10.7 },
    { country: 'Canada', messages: 12340, percentage: 8.5 },
    { country: 'Others', messages: 30100, percentage: 20.6 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 3200, messages: 25000 },
    { month: 'Feb', revenue: 3800, messages: 28500 },
    { month: 'Mar', revenue: 4200, messages: 32000 },
    { month: 'Apr', revenue: 3900, messages: 29800 },
    { month: 'May', revenue: 4600, messages: 35200 },
    { month: 'Jun', revenue: 5100, messages: 38900 },
    { month: 'Jul', revenue: 5800, messages: 42300 },
    { month: 'Aug', revenue: 6200, messages: 45100 },
    { month: 'Sep', revenue: 6800, messages: 48600 },
    { month: 'Oct', revenue: 7200, messages: 51200 },
    { month: 'Nov', revenue: 7600, messages: 53800 },
    { month: 'Dec', revenue: 7842, messages: 55400 }
  ];

  return (
    <div className=''>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics</h2>
          <p className="text-gray-400">Track your SMS gateway performance and usage</p>
        </div>
        <div className="flex items-center space-x-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Chart */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Message Volume</h3>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">Last {timeRange}</span>
            </div>
          </div>
          <UsageChart data={chartData} />
        </div>

        {/* Revenue Chart */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">Monthly</span>
            </div>
          </div>
          <RevenueChart data={revenueData} />
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Country Breakdown */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Messages by Country</h3>
            <Globe className="h-5 w-5 text-blue-400" />
          </div>
          <CountryBreakdown data={countryData} />
        </div>

        {/* Message Status */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Message Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Delivered</span>
              <span className="text-green-400 font-medium">98.7%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.7%' }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Pending</span>
              <span className="text-yellow-400 font-medium">0.8%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '0.8%' }} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Failed</span>
              <span className="text-red-400 font-medium">0.5%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: '0.5%' }} />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <h4 className="text-white font-medium mb-3">Peak Hours</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">9:00 AM - 12:00 PM</span>
                <span className="text-blue-400">34%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">2:00 PM - 5:00 PM</span>
                <span className="text-purple-400">28%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">7:00 PM - 10:00 PM</span>
                <span className="text-green-400">22%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}