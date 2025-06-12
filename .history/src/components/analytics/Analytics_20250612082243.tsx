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
import { sms } from '../../services/api';

interface Message {
  id: number;
  recipient_number: string;
  sender_number: string;
  content: string;
  status: string;
  direction: string;
  created_at: string;
  user_id: number;
  sim_id: number;
  transaction?: {
    id: number;
    amount: number;
    status: string;
  };
}

interface AnalyticsData {
  totalMessages: number;
  deliveryRate: number;
  avgResponseTime: number;
  revenue: number;
  activeUsers: number;
  countries: number;
  messageVolume: number[];
  revenueData: {
    month: string;
    revenue: number;
    messages: number;
  }[];
  countryData: {
    country: string;
    messages: number;
    percentage: number;
  }[];
  messageStatus: {
    delivered: number;
    pending: number;
    failed: number;
  };
  peakHours: {
    period: string;
    percentage: number;
  }[];
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalMessages: 0,
    deliveryRate: 0,
    avgResponseTime: 0,
    revenue: 0,
    activeUsers: 0,
    countries: 0,
    messageVolume: [],
    revenueData: [],
    countryData: [],
    messageStatus: {
      delivered: 0,
      pending: 0,
      failed: 0
    },
    peakHours: []
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        // Fetch messages for the selected time range
        const messages = await sms.list();
        
        // Calculate analytics data
        const now = new Date();
        const timeRangeMs: Record<string, number> = {
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000,
          '90d': 90 * 24 * 60 * 60 * 1000
        };
        const selectedTimeRange = timeRangeMs[timeRange] || timeRangeMs['7d'];

        const filteredMessages = messages.filter((msg: Message) => 
          new Date(msg.created_at).getTime() > now.getTime() - selectedTimeRange
        );

        // Calculate basic stats
        const totalMessages = filteredMessages.length;
        const deliveredMessages = filteredMessages.filter((msg: Message) => msg.status === 'delivered').length;
        const pendingMessages = filteredMessages.filter((msg: Message) => msg.status === 'pending').length;
        const failedMessages = filteredMessages.filter((msg: Message) => msg.status === 'failed').length;
        
        // Calculate revenue from transactions
        const revenue = filteredMessages.reduce((sum: number, msg: Message) => 
          sum + (msg.transaction?.amount || 0), 0
        );

        // Calculate message volume per day
        const messageVolume = Array.from({ length: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90 }, (_, i) => {
          const dayStart = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
          return filteredMessages.filter((msg: Message) => {
            const msgDate = new Date(msg.created_at);
            return msgDate >= dayStart && msgDate < dayEnd;
          }).length;
        }).reverse();

        // Calculate country distribution
        const countryMap = new Map<string, number>();
        filteredMessages.forEach((msg: Message) => {
          const country = msg.recipient_number.startsWith('+1') ? 'United States' :
                         msg.recipient_number.startsWith('+44') ? 'United Kingdom' :
                         msg.recipient_number.startsWith('+49') ? 'Germany' :
                         msg.recipient_number.startsWith('+33') ? 'France' :
                         msg.recipient_number.startsWith('+1') ? 'Canada' : 'Others';
          countryMap.set(country, (countryMap.get(country) || 0) + 1);
        });

        const countryData = Array.from(countryMap.entries()).map(([country, messages]) => ({
          country,
          messages,
          percentage: (messages / totalMessages) * 100
        }));

        // Calculate peak hours
        const hourMap = new Map<number, number>();
        filteredMessages.forEach((msg: Message) => {
          const hour = new Date(msg.created_at).getHours();
          hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
        });

        const peakHours = Array.from(hourMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([hour, count]) => ({
            period: `${hour}:00 - ${hour + 3}:00`,
            percentage: (count / totalMessages) * 100
          }));

        setAnalyticsData({
          totalMessages,
          deliveryRate: (deliveredMessages / totalMessages) * 100,
          avgResponseTime: 1.2, // This would need to be calculated from actual response times
          revenue,
          activeUsers: new Set(filteredMessages.map((msg: Message) => msg.user_id)).size,
          countries: countryMap.size,
          messageVolume,
          revenueData: [], // This would need to be calculated from actual revenue data
          countryData,
          messageStatus: {
            delivered: (deliveredMessages / totalMessages) * 100,
            pending: (pendingMessages / totalMessages) * 100,
            failed: (failedMessages / totalMessages) * 100
          },
          peakHours
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className='px-6 py-8'>
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
            value={analyticsData.totalMessages.toLocaleString()}
            icon={MessageSquare}
            trend={+15.3}
            color="blue"
          />
          <StatsCard
            title="Delivery Rate"
            value={`${analyticsData.deliveryRate.toFixed(1)}%`}
            icon={Send}
            trend={+0.8}
            color="green"
          />
          <StatsCard
            title="Response Time"
            value={`${analyticsData.avgResponseTime}s`}
            icon={Clock}
            trend={-12.4}
            color="purple"
          />
          <StatsCard
            title="Revenue"
            value={`$${analyticsData.revenue.toLocaleString()}`}
            icon={DollarSign}
            trend={+23.1}
            color="yellow"
          />
          <StatsCard
            title="Active Users"
            value={analyticsData.activeUsers.toLocaleString()}
            icon={Users}
            trend={+8.7}
            color="green"
          />
          <StatsCard
            title="Countries"
            value={analyticsData.countries.toString()}
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
            <UsageChart data={analyticsData.messageVolume} />
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
            <RevenueChart data={analyticsData.revenueData} />
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
            <CountryBreakdown data={analyticsData.countryData} />
          </div>

          {/* Message Status */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Message Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Delivered</span>
                <span className="text-green-400 font-medium">{analyticsData.messageStatus.delivered.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${analyticsData.messageStatus.delivered}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Pending</span>
                <span className="text-yellow-400 font-medium">{analyticsData.messageStatus.pending.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${analyticsData.messageStatus.pending}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Failed</span>
                <span className="text-red-400 font-medium">{analyticsData.messageStatus.failed.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${analyticsData.messageStatus.failed}%` }} />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-white font-medium mb-3">Peak Hours</h4>
              <div className="space-y-2">
                {analyticsData.peakHours.map((peak, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{peak.period}</span>
                    <span className={`text-${['blue', 'purple', 'green'][index]}-400`}>
                      {peak.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}