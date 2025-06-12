import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageCircle,
  Smartphone,
  DollarSign,
  Activity
} from 'lucide-react';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import { wallet, sims, sms } from '../../services/api';

interface Sim {
  id: number;
  iccid: string;
  phone_number: string;
  status: string;
  is_active: boolean;
  expiry_date: string;
  user_id: number;
  created_at: string;
  updated_at: string | null;
}

interface SMS {
  id: number;
  recipient_number: string;
  sender_number: string;
  content: string;
  status: string;
  direction: string;
  created_at: string;
  user_id: number;
  sim_id: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    messagesSent: 0,
    messagesReceived: 0,
    activeSims: 0,
    walletBalance: 0,
    deliveryRate: 0,
    activeConnections: 0
  });

  const [recentMessages, setRecentMessages] = useState<SMS[]>([]);

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
        const activeCount = simList.filter((sim: Sim) => sim.is_active).length;
        setStats(prev => ({
          ...prev,
          activeSims: activeCount
        }));
      } catch (error) {
        console.error('Error fetching active SIMs:', error);
      }
    };

    // Fetch SMS statistics
    const fetchSMSStats = async () => {
      try {
        const smsList = await sms.list();
        const sentCount = smsList.filter((msg: SMS) => msg.direction === 'outbound').length;
        const receivedCount = smsList.filter((msg: SMS) => msg.direction === 'inbound').length;
        const deliveredCount = smsList.filter((msg: SMS) => msg.status === 'delivered').length;
        const totalSent = smsList.filter((msg: SMS) => msg.direction === 'outbound').length;
        
        setStats(prev => ({
          ...prev,
          messagesSent: sentCount,
          messagesReceived: receivedCount,
          deliveryRate: totalSent > 0 ? (deliveredCount / totalSent) * 100 : 0
        }));

        // Update recent messages
        setRecentMessages(smsList.slice(0, 5));
      } catch (error) {
        console.error('Error fetching SMS stats:', error);
      }
    };

    // Initial data fetch
    fetchWalletBalance();
    fetchActiveSims();
    fetchSMSStats();

    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      fetchWalletBalance();
      fetchActiveSims();
      fetchSMSStats();
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(refreshInterval);
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
            trend={0}
            color="blue"
          />
          <StatsCard
            title="Messages Received"
            value={stats.messagesReceived.toLocaleString()}
            icon={MessageCircle}
            trend={0}
            color="green"
          />
          <StatsCard
            title="Active SIMs"
            value={stats.activeSims.toString()}
            icon={Smartphone}
            trend={0}
            color="purple"
          />
          <StatsCard
            title="Wallet Balance"
            value={`$${stats.walletBalance.toFixed(2)}`}
            icon={DollarSign}
            trend={0}
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Message Delivery Rate</h3>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">Live</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {stats.deliveryRate.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${stats.deliveryRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Messages</h3>
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex flex-col space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-300">
                        {message.direction === 'outbound' ? 'To: ' : 'From: '}
                        {message.direction === 'outbound' ? message.recipient_number : message.sender_number}
                      </span>
                      <span className={`text-sm ${
                        message.status === 'delivered' ? 'text-green-400' :
                        message.status === 'sent' ? 'text-blue-400' :
                        message.status === 'failed' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {message.status}
                      </span>
                    </div>
                    <p className="text-white text-sm truncate">{message.content}</p>
                    <span className="text-gray-500 text-xs">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}