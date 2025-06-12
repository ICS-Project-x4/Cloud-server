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

const menuItems = [
  {
    path: '/',
    icon: LayoutDashboard,
    label: 'Dashboard'
  },
  {
    path: '/sms',
    icon: MessageSquare,
    label: 'SMS Center'
  },
  {
    path: '/sims',
    icon: Smartphone,
    label: 'SIM Manager'
  },
  {
    path: '/analytics',
    icon: BarChart2,
    label: 'Analytics'
  },
  {
    path: '/api-keys',
    icon: Key,
    label: 'API Keys'
  },
  {
    path: '/wallets',
    icon: Wallet,
    label: 'Wallet'
  }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">Cloud Server</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
            return (
              <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                  ? 'text-white bg-blue-500/10 border-r-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
}