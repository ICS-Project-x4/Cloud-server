import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Clock, CheckCircle, XCircle, Phone } from 'lucide-react';
import SendSMS from './SendSMS';
import MessageHistory from './MessageHistory';

interface Message {
  id: string;
  type: 'sent' | 'received';
  to: string;
  from: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'delivered' | 'failed' | 'received';
  cost?: number;
}

export default function SMSCenter() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'sent',
      to: '+1234567890',
      from: 'SMS-Gateway',
      message: 'Hello! This is a test message from SMS Gateway Pro.',
      timestamp: new Date(Date.now() - 300000),
      status: 'delivered',
      cost: 0.05
    },
    {
      id: '2',
      type: 'received',
      to: 'SMS-Gateway',
      from: '+0987654321',
      message: 'Thank you for the message!',
      timestamp: new Date(Date.now() - 180000),
      status: 'received'
    },
    {
      id: '3',
      type: 'sent',
      to: '+5555555555',
      from: 'SMS-Gateway',
      message: 'Your verification code is: 123456',
      timestamp: new Date(Date.now() - 120000),
      status: 'pending',
      cost: 0.05
    }
  ]);

  const [stats, setStats] = useState({
    sentToday: 45,
    receivedToday: 23,
    pendingMessages: 3,
    deliveryRate: 98.5
  });

  useEffect(() => {
    // Simulate real-time message updates
    const interval = setInterval(() => {
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.status === 'pending' && Math.random() < 0.7) {
            return { ...msg, status: Math.random() < 0.95 ? 'delivered' : 'failed' };
          }
          return msg;
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSendSMS = (to: string, message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'sent',
      to,
      from: 'SMS-Gateway',
      message,
      timestamp: new Date(),
      status: 'pending',
      cost: 0.05
    };

    setMessages(prev => [newMessage, ...prev]);
    setStats(prev => ({ ...prev, sentToday: prev.sentToday + 1, pendingMessages: prev.pendingMessages + 1 }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className=''> </div>
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
              <p className="text-2xl font-bold text-white">{stats.deliveryRate}%</p>
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
  );
}