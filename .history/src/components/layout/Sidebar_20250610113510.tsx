import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Smartphone,
  BarChart2,
  Key,
  Wallet
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'SMS Center', href: '/sms', icon: MessageSquare },
    { name: 'SIM Manager', href: '/sims', icon: Smartphone },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'API Keys', href: '/api-keys', icon: Key },
    { name: 'Wallet', href: '/wallet', icon: Wallet }
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">Cloud Server</h1>
      </div>
      <nav className="space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}