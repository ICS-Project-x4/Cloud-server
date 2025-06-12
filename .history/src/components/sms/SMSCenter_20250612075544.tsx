import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import SendSMS from './SendSMS';
import MessageHistory from './MessageHistory';
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
}

export default function SMSCenter() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState({
    sentToday: 0,
    receivedToday: 0,
    pendingMessages: 0,
    deliveryRate: 0
  });

  const fetchMessages = async () => {
    try {
      const response = await sms.list();
      setMessages(response);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayMessages = response.filter((msg: Message) => 
        msg.created_at.startsWith(today)
      );
      
      const sentToday = todayMessages.filter((msg: Message) => msg.direction === 'outbound').length;
      const receivedToday = todayMessages.filter((msg: Message) => msg.direction === 'inbound').length;
      const pendingMessages = response.filter((msg: Message) => msg.status === 'pending').length;
      
      const totalSent = response.filter((msg: Message) => msg.direction === 'outbound').length;
      const deliveredCount = response.filter((msg: Message) => 
        msg.direction === 'outbound' && msg.status === 'delivered'
      ).length;
      
      setStats({
        sentToday,
        receivedToday,
        pendingMessages,
        deliveryRate: totalSent > 0 ? (deliveredCount / totalSent) * 100 : 0
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Refresh messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSendSMS = async (to: string, message: string) => {
    try {
      // For now, we'll use the first SIM. In a real app, you'd want to let users choose
      const simId = 1; // TODO: Get this from user's active SIMs
      
      await sms.send({
        sim_id: simId,
        recipient_number: to,
        content: message
      });
      
      // Refresh messages after sending
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      // TODO: Show error notification to user
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'received':
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className='px-6 py-8'> 
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Sent Today</p>
                <p className="text-2xl font-bold text-white">{stats.sentToday}</p>
              </div>
              <Send className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Received Today</p>
                <p className="text-2xl font-bold text-white">{stats.receivedToday}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pendingMessages}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Delivery Rate</p>
                <p className="text-2xl font-bold text-white">{stats.deliveryRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send SMS Form */}
          <div className="lg:col-span-1">
            <SendSMS onSendSMS={handleSendSMS} />
          </div>

          {/* Message History */}
          <div className="lg:col-span-2">
            <MessageHistory messages={messages} getStatusIcon={getStatusIcon} />
          </div>
        </div>
      </div>
    </div>
  );
}