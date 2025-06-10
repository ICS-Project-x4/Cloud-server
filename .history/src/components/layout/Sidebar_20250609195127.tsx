import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  BarChart3,
  Send,
  Smartphone,
  Wallet,
  Key,
  Settings,
  User
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'SMS Center', href: '/sms', icon: Send },
  { name: 'SIM Cards', href: '/sims', icon: Smartphone },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white">SMS Gateway</h1>
            <p className="text-xs text-gray-400">Pro</p>
          </div>
        </div>
      </div>

      <nav className="mt-8">
        <div className="px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}