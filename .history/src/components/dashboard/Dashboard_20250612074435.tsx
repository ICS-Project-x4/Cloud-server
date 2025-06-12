import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageCircle,
  Smartphone,
  DollarSign,
  Activity
} from 'lucide-react';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import LiveChart from './LiveChart';
import { wallet, sims } from '../../services/api';

interface Sim {
  id: number;
  iccid: string;
  phone_number: string;
  data_plan: string;
  status: string;
  is_active: boolean;
  expiry_date: string;
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    messagesSent: 12543,
    messagesReceived: 8721,
    activeSims: 0,
    walletBalance: 0,
    deliveryRate: 99.2,
    activeConnections: 8
  });

  const [realtimeData, setRealtimeData] = useState<number[]>([
    45, 52, 48, 61, 55, 67, 59, 73, 68, 82, 76, 89, 84, 91, 87, 
    94, 89, 96, 92, 98, 95, 102, 99, 105, 101, 108, 104, 112, 109, 115
  ]);

  useEffect(() => {
    // Fetch wallet balance
    const fetchWalletBalance = async () => {
      try {
        const walletData = await wallet.get();
        setStats(prev => ({
          ...prev,
          walletBalance: Number(walletData.balance)
        }));
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };

    // Fetch active SIMs count
    const fetchActiveSims = async () => {
      try {
        const simList = await sims.list();
        console.log('Fetched SIMs:', simList);
        const activeCount = simList.filter((sim: Sim) => sim.is_active).length;
        console.log('Active SIMs count:', activeCount);
        setStats(prev => ({
          ...prev,
          activeSims: activeCount
        }));
      } catch (error) {
        console.error('Error fetching active SIMs:', error);
      }
    };

    // Initial data fetch
    fetchWalletBalance();
    fetchActiveSims();

    // Set up periodic refresh for SIMs count
    const simsInterval = setInterval(fetchActiveSims, 30000); // Refresh every 30 seconds

    // Simulate real-time data updates with realistic fluctuations
    const dataInterval = setInterval(() => {
      setRealtimeData(prev => {
        const lastValue = prev[prev.length - 1] || 85;
        const variation = (Math.random() - 0.5) * 10; // ±5 variation
        const newValue = Math.max(30, Math.min(120, lastValue + variation));
        const newData = [...prev.slice(-29), Math.round(newValue)];
        return newData;
      });
      
      // Occasionally update stats with small increments
      if (Math.random() < 0.3) {
        setStats(prev => ({
          ...prev,
          messagesSent: prev.messagesSent + Math.floor(Math.random() * 3) + 1,
          messagesReceived: prev.messagesReceived + Math.floor(Math.random() * 2),
        }));
      }
    }, 3000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(simsInterval);
    };
  }, []);

  return (
    <div className="p-6">
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Messages Sent"
          value={stats.messagesSent.toLocaleString()}
          icon={Send}
          trend={+12.5}
          color="blue"
        />
        <StatsCard
          title="Messages Received"
          value={stats.messagesReceived.toLocaleString()}
          icon={MessageCircle}
          trend={+8.2}
          color="green"
        />
        <StatsCard
          title="Active SIMs"
          value={stats.activeSims.toString()}
          icon={Smartphone}
          trend={+2}
          color="purple"
        />
        <StatsCard
          title="Wallet Balance"
          value={`$${stats.walletBalance.toFixed(2)}`}
          icon={DollarSign}
          trend={-5.4}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Real-time Message Traffic</h3>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">Live</span>
              </div>
            </div>
            <LiveChart data={realtimeData} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Delivery Rate</span>
                <span className="text-green-400 font-medium">{stats.deliveryRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Active Connections</span>
                <span className="text-blue-400 font-medium">{stats.activeConnections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">API Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">MQTT Broker</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm">Connected</span>
                </div>
              </div>
            </div>
          </div>

          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">SMS Sent</span>
              <span className="text-white font-medium">23,451</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Data Usage</span>
              <span className="text-white font-medium">1.2 GB</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">API Calls</span>
              <span className="text-white font-medium">45,832</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}