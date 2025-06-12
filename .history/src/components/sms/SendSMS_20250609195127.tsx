import React, { useState } from 'react';
import { Send, Phone, MessageSquare } from 'lucide-react';

interface SendSMSProps {
  onSendSMS: (to: string, message: string) => void;
}

export default function SendSMS({ onSendSMS }: SendSMSProps) {
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !message) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSendSMS(to, message);
    setMessage('');
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Send className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Send SMS</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <input
              type="tel"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1234567890"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Message
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
              placeholder="Enter your message..."
              maxLength={160}
              required
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">SMS messages are charged at $0.05 each</span>
            <span className="text-xs text-gray-400">{message.length}/160</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !to || !message}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send SMS</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}