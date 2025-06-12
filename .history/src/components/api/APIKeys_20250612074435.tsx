import React, { useState, useEffect } from 'react';
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Calendar, Shield, X } from 'lucide-react';
import { apiKeys } from '../../services/api';

interface APIKey {
  id: number;
  name: string;
  key: string;
  created_at: string;
  is_active: boolean;
}

export default function APIKeys() {
  const [apiKeysList, setApiKeysList] = useState<APIKey[]>([]);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set());
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const response = await apiKeys.list();
      setApiKeysList(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setError('Failed to fetch API keys. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleKeyVisibility = (keyId: number) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string, keyId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedKeyId(null);
    }, 2000);
  };

  const generateAPIKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for the API key');
      return;
    }

    try {
      setIsLoading(true);
      const newKey = await apiKeys.create({ name: newKeyName });
      setApiKeysList(prev => [newKey, ...prev]);
      setShowNewKeyModal(false);
      setNewKeyName('');
      setError(null);
    } catch (err) {
      console.error('Error creating API key:', err);
      setError('Failed to create API key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAPIKey = async (keyId: number) => {
    try {
      setIsLoading(true);
      await apiKeys.delete(keyId);
      setApiKeysList(prev => prev.filter(key => key.id !== keyId));
      setError(null);
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError('Failed to delete API key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-6 py-8">

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

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Keys</p>
              <p className="text-2xl font-bold text-white">{apiKeysList.length}</p>
            </div>
            <Key className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Keys</p>
              <p className="text-2xl font-bold text-white">
                {apiKeysList.filter(key => key.is_active).length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Last Generated</p>
              <p className="text-2xl font-bold text-white">
                {apiKeysList.length > 0 
                  ? new Date(apiKeysList[0].created_at).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {isLoading && apiKeysList.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading API keys...</p>
          </div>
        ) : apiKeysList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No API keys found. Generate your first key to get started.</p>
          </div>
        ) : (
          apiKeysList.map((apiKey) => (
            <div key={apiKey.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${apiKey.is_active ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <h3 className="text-white font-semibold text-lg">{apiKey.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    apiKey.is_active ? 'bg-green-400/10 text-green-400' : 'bg-gray-400/10 text-gray-400'
                  }`}>
                    {apiKey.is_active ? 'Active' : 'Inactive'}
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
                    onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors relative"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedKeyId === apiKey.id && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                        Copied!
                      </span>
                    )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Created</p>
                  <p className="text-white font-medium">
                    {new Date(apiKey.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
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

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                  <button
                    onClick={() => setShowNewKeyModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateAPIKey}
                    disabled={isLoading || !newKeyName.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Generating...' : 'Generate API Key'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}