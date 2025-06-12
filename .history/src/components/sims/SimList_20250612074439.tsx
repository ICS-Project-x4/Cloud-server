import React, { useState, useEffect } from 'react';
import { sims } from '../../services/api';
import { Plus, Trash2, Power, PowerOff, Edit } from 'lucide-react';

interface Sim {
  id: number;
  iccid: string;
  phone_number: string;
  data_plan: string;
  status: string;
  is_active: boolean;
  expiry_date: string;
}

interface SimListProps {
  onSimsChange?: () => void;
}

export default function SimList({ onSimsChange }: SimListProps) {
  const [simList, setSimList] = useState<Sim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSim, setNewSim] = useState({
    iccid: '',
    phone_number: '',
    data_plan: '',
    expiry_date: ''
  });

  const fetchSims = async () => {
    try {
      const data = await sims.list();
      setSimList(data);
      onSimsChange?.();
    } catch (err) {
      setError('Failed to fetch SIMs');
      console.error('Error fetching SIMs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSims();
  }, []);

  const handleAddSim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sims.create(newSim);
      setShowAddModal(false);
      setNewSim({ iccid: '', phone_number: '', data_plan: '', expiry_date: '' });
      fetchSims();
    } catch (err) {
      setError('Failed to add SIM');
      console.error('Error adding SIM:', err);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await sims.activate(id);
      fetchSims();
    } catch (err) {
      setError('Failed to activate SIM');
      console.error('Error activating SIM:', err);
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await sims.deactivate(id);
      fetchSims();
    } catch (err) {
      setError('Failed to deactivate SIM');
      console.error('Error deactivating SIM:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this SIM?')) {
      try {
        await sims.delete(id);
        fetchSims();
      } catch (err) {
        setError('Failed to delete SIM');
        console.error('Error deleting SIM:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">SIM Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add SIM</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {simList.map((sim) => (
          <div
            key={sim.id}
            className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {sim.phone_number}
                </h2>
                <p className="text-gray-400">ICCID: {sim.iccid}</p>
              </div>
              <div className="flex space-x-2">
                {sim.is_active ? (
                  <button
                    onClick={() => handleDeactivate(sim.id)}
                    className="text-yellow-500 hover:text-yellow-400"
                    title="Deactivate"
                  >
                    <PowerOff className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(sim.id)}
                    className="text-green-500 hover:text-green-400"
                    title="Activate"
                  >
                    <Power className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(sim.id)}
                  className="text-red-500 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="text-gray-400">Plan:</span> {sim.data_plan}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-400">Status:</span>{' '}
                <span
                  className={`${
                    sim.is_active ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {sim.status}
                </span>
              </p>
              <p className="text-gray-300">
                <span className="text-gray-400">Expires:</span>{' '}
                {new Date(sim.expiry_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add New SIM</h2>
            <form onSubmit={handleAddSim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ICCID
                </label>
                <input
                  type="text"
                  value={newSim.iccid}
                  onChange={(e) =>
                    setNewSim({ ...newSim, iccid: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newSim.phone_number}
                  onChange={(e) =>
                    setNewSim({ ...newSim, phone_number: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Data Plan
                </label>
                <input
                  type="text"
                  value={newSim.data_plan}
                  onChange={(e) =>
                    setNewSim({ ...newSim, data_plan: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={newSim.expiry_date}
                  onChange={(e) =>
                    setNewSim({ ...newSim, expiry_date: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add SIM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 