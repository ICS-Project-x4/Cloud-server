import React from 'react';
import { MessageSquare, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

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

interface MessageHistoryProps {
  messages: Message[];
  getStatusIcon: (status: string) => React.ReactNode;
}

export default function MessageHistory({ messages, getStatusIcon }: MessageHistoryProps) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MessageSquare className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Message History</h3>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="bg-gray-750 rounded-lg p-4 border border-gray-600">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {message.type === 'sent' ? (
                  <ArrowUpRight className="h-4 w-4 text-blue-400" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4 text-green-400" />
                )}
                <span className="text-white font-medium">
                  {message.type === 'sent' ? `To: ${message.to}` : `From: ${message.from}`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(message.status)}
                <span className="text-xs text-gray-400">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <p className="text-gray-300 mb-2">{message.message}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>ID: {message.id}</span>
              {message.cost && (
                <span className="text-green-400">Cost: ${message.cost.toFixed(2)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}