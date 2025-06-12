import React, { useState } from 'react';
import { Send, Phone, MessageSquare } from 'lucide-react';

interface SendSMSProps {
  onSendSMS: (to: string, message: string) => Promise<void>;
}

export default function SendSMS({ onSendSMS }: SendSMSProps) {
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^\d]/g, '');
    setTo(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!to || !message) {
      setError('Please fill in all fields');
      return;
    }

    // Phone number validation (at least 10 digits)
    if (to.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    setIsLoading(true);
    try {
      await onSendSMS(`+${to}`, message);
      setTo('');
      setMessage('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-lg">
    <div className="flex items-center space-x-2 mb-6">
      <Send className="h-5 w-5 text-blue-400" />
      <h2 className="text-xl font-semibold text-white">Send SMS</h2>
    </div>
  
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Phone Number Field */}
      <div>
        <label htmlFor="to" className="block text-sm font-medium text-gray-300 mb-1">
          Phone Number
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Phone className="h-5 w-5" />
          </span>
          <input
            type="tel"
            id="to"
            value={to}
            onChange={handlePhoneChange}
            placeholder="1234567890"
            className="pl-10 w-full rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2"
            disabled={isLoading}
            maxLength={15}
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">Enter numbers only (e.g., 1234567890)</p>
      </div>
  
      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
          Message
        </label>
        <div className="relative">
          <span className="absolute top-2 left-3 flex items-start text-gray-400">
            <MessageSquare className="h-5 w-5 mt-1" />
          </span>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Type your message here..."
            className="pl-10 w-full rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2"
            disabled={isLoading}
            maxLength={160}
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-400">Maximum 160 characters</p>
          <p className="text-xs text-gray-400">{message.length}/160</p>
        </div>
      </div>
  
      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg px-4 py-2 text-red-200 text-sm">
          {error}
        </div>
      )}
  
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </>
        )}
      </button>
    </form>
  </div>
   );
}