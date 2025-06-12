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
    );
}