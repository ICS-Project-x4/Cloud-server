import React from 'react';
import { Clock, CheckCircle, XCircle, MessageSquare, DollarSign } from 'lucide-react';

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

interface MessageHistoryProps {
  messages: Message[];
  getStatusIcon: (status: string) => React.ReactNode;
}

export default function MessageHistory({ messages, getStatusIcon }: MessageHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Sort messages by date in descending order (most recent first)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Message History</h2>
      <div className="space-y-4">
        {sortedMessages.map((message) => (
          <div
            key={message.id}
            className="bg-gray-700 rounded-lg p-4 flex items-start space-x-4"
          >
            <div className="flex-shrink-0">
              {getStatusIcon(message.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">
                  {message.direction === 'outbound' ? 'To: ' : 'From: '}
                  {message.direction === 'outbound' ? message.recipient_number : message.sender_number}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(message.created_at)}
                </p>
              </div>
              <p className="mt-1 text-sm text-gray-300">{message.content}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    message.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    message.status === 'failed' ? 'bg-red-100 text-red-800' :
                    message.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                  </span>
                  {message.direction === 'outbound' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Outbound
                    </span>
                  )}
                  {message.direction === 'inbound' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Inbound
                    </span>
                  )}
                </div>
                {message.transaction && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">ID: {message.transaction.id}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {formatAmount(message.transaction.amount)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      message.transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      message.transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {message.transaction.status.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-300">No messages</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by sending a new message.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}