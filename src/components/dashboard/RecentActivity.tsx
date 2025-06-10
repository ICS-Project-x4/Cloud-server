import React from 'react';
import { MessageSquare, Send, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'sms_sent',
    message: 'SMS sent to +1234567890',
    time: '2 minutes ago',
    status: 'delivered',
    icon: Send,
  },
  {
    id: 2,
    type: 'sms_received',
    message: 'SMS received from +0987654321',
    time: '5 minutes ago',
    status: 'received',
    icon: MessageSquare,
  },
  {
    id: 3,
    type: 'sim_activated',
    message: 'SIM card SIM-001 activated',
    time: '12 minutes ago',
    status: 'success',
    icon: Smartphone,
  },
  {
    id: 4,
    type: 'delivery_failed',
    message: 'SMS delivery failed to +5555555555',
    time: '18 minutes ago',
    status: 'failed',
    icon: AlertCircle,
  },
  {
    id: 5,
    type: 'webhook_success',
    message: 'Webhook delivered successfully',
    time: '25 minutes ago',
    status: 'success',
    icon: CheckCircle,
  },
];

const statusColors = {
  delivered: 'text-green-400',
  received: 'text-blue-400',
  success: 'text-green-400',
  failed: 'text-red-400',
  pending: 'text-yellow-400',
};

export default function RecentActivity() {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg">
              <div className={`p-2 rounded-lg bg-gray-700 ${statusColors[activity.status as keyof typeof statusColors]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {activity.message}
                </p>
                <p className="text-gray-400 text-xs">{activity.time}</p>
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-700 ${statusColors[activity.status as keyof typeof statusColors]}`}>
                {activity.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}