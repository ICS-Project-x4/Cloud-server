import React, { useState } from 'react';
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Calendar, Shield } from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: Date | null;
  createdAt: Date;
  isActive: boolean;
  usage: number;
  limit: number;
}

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'sk_live_123456789abcdef123456789abcdef12',
      permissions: ['sms:send', 'sms:receive', 'sims:read', 'wallet:read'],
      lastUsed: new Date(Date.now() - 3600000),
      createdAt: new Date(Date.now() - 86400000 * 30),
      isActive: true,
      usage: 1250,
      limit: 10000
    },
    {
      id: '2',
      name: 'Development API',
      key: 'sk_test_987654321fedcba987654321fedcba98',
      permissions: ['sms:send', 'sims:read'],
      lastUsed: new Date(Date.now() - 7200000),
      createdAt: new Date(Date.now() - 86400000 * 7),
      isActive: true,
      usage: 45,
      limit: 1000
    },
    {
      id: '3',
      name: 'Webhook Handler',
      key: 'sk_live_abcdef123456789abcdef123456789ab',
      permissions: ['webhook:receive'],
      lastUsed: null,
      createdAt: new Date(Date.now() - 86400000 * 3),
      isActive: false,
      usage: 0,
      limit: 5000
    }
  ]);

  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const availablePermissions = [
    { id: 'sms:send', name: 'Send SMS', description: 'Allow sending SMS messages' },
    { id: 'sms:receive', name: 'Receive SMS', description: 'Allow receiving SMS messages' },
    { id: 'sms:read', name: 'Read SMS', description: 'Allow reading SMS history' },
    { id: 'sims:read', name: 'Read SIMs', description: 'Allow reading SIM card information' },
    { id: 'sims:manage', name: 'Manage SIMs', description: 'Allow managing SIM cards' },
    { id: 'wallet:read', name: 'Read Wallet', description: 'Allow reading wallet balance' },
    { id: 'webhook:receive', name: 'Receive Webhooks', description: 'Allow receiving webhook notifications' },
  ];

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const generateAPIKey = () => {
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: selectedPermissions,
      lastUsed: null,
      createdAt: new Date(),
      isActive: true,
      usage: 0,
      limit: 5000
    };

    setApiKeys(prev => [newKey, ...prev]);
    setShowNewKeyModal(false);
    setNewKeyName('');
    setSelectedPermissions([]);
  };

  const deleteAPIKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  };

  const toggleKeyStatus = (keyId: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === keyId ? { ...key, isActive: !key.isActive } : key
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">API Keys</h2>
          <p className="text-gray-400">Manage your API keys for programmatic access</p>
        </div>
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Generate API Key</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Keys</p>
              <p className="text-2xl font-bold text-white">{apiKeys.length}</p>
            </div>
            <Key className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Keys</p>
              <p className="text-2xl font-bold text-white">
                {apiKeys.filter(key => key.isActive).length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-white">
                {apiKeys.reduce((sum, key) => sum + key.usage, 0).toLocaleString()}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">This Month</p>
              <p className="text-2xl font-bold text-white">1.2K</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${apiKey.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                <h3 className="text-white font-semibold text-lg">{apiKey.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  apiKey.isActive ? 'bg-green-400/10 text-green-400' : 'bg-gray-400/10 text-gray-400'
                }`}>
                  {apiKey.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleKeyVisibility(apiKey.id)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {visibleKeys.has(apiKey.id) ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(apiKey.key)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleKeyStatus(apiKey.id)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Shield className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteAPIKey(apiKey.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <code className="text-green-400 font-mono text-sm">
                {visibleKeys.has(apiKey.id) 
                  ? apiKey.key 
                  : apiKey.key.substring(0, 12) + '••••••••••••••••••••••••'
                }
              </code>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Usage</p>
                <p className="text-white font-medium">{apiKey.usage.toLocaleString()} / {apiKey.limit.toLocaleString()}</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(apiKey.usage / apiKey.limit) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Created</p>
                <p className="text-white font-medium">{apiKey.createdAt.toLocaleDateString()}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Last Used</p>
                <p className="text-white font-medium">
                  {apiKey.lastUsed 
                    ? apiKey.lastUsed.toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Permissions</p>
                <p className="text-white font-medium">{apiKey.permissions.length} granted</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {apiKey.permissions.map((permission) => (
                <span
                  key={permission}
                  className="px-2 py-1 bg-blue-400/10 text-blue-400 rounded-md text-xs font-medium"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* New API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Generate API Key</h2>
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Production API, Development Key"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {availablePermissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-start space-x-3 p-3 bg-gray-750 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions(prev => [...prev, permission.id]);
                            } else {
                              setSelectedPermissions(prev => prev.filter(p => p !== permission.id));
                            }
                          }}
                          className="mt-1 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-white font-medium">{permission.name}</p>
                          <p className="text-gray-400 text-sm">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => setShowNewKeyModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateAPIKey}
                    disabled={!newKeyName || selectedPermissions.length === 0}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                  >
                    Generate API Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}