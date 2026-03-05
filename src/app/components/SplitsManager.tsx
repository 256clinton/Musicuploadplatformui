import { useState } from 'react';
import { Plus, Trash2, Users, DollarSign, Mail, Check, X } from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  percentage: number;
  status: 'pending' | 'accepted' | 'declined';
}

interface SplitsManagerProps {
  trackId: string;
  trackTitle: string;
}

export function SplitsManager({ trackId, trackTitle }: SplitsManagerProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'You (Primary Artist)',
      email: 'artist@example.com',
      role: 'Primary Artist',
      percentage: 100,
      status: 'accepted'
    }
  ]);
  
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState({
    name: '',
    email: '',
    role: 'Featured Artist',
    percentage: 0
  });

  const totalPercentage = collaborators.reduce((sum, c) => sum + c.percentage, 0);
  const remainingPercentage = 100 - totalPercentage;

  const handleAddCollaborator = () => {
    if (!newCollaborator.name || !newCollaborator.email || newCollaborator.percentage <= 0) {
      return;
    }

    if (totalPercentage + newCollaborator.percentage > 100) {
      alert('Total percentage cannot exceed 100%');
      return;
    }

    const collaborator: Collaborator = {
      id: Date.now().toString(),
      name: newCollaborator.name,
      email: newCollaborator.email,
      role: newCollaborator.role,
      percentage: newCollaborator.percentage,
      status: 'pending'
    };

    setCollaborators([...collaborators, collaborator]);
    
    // Adjust primary artist percentage
    const primaryArtist = collaborators[0];
    if (primaryArtist) {
      setCollaborators(prev => prev.map((c, i) => 
        i === 0 ? { ...c, percentage: c.percentage - newCollaborator.percentage } : c
      ));
    }

    setNewCollaborator({
      name: '',
      email: '',
      role: 'Featured Artist',
      percentage: 0
    });
    setIsAddingCollaborator(false);
  };

  const handleRemoveCollaborator = (id: string) => {
    const collaborator = collaborators.find(c => c.id === id);
    if (!collaborator || collaborator.id === '1') return;

    // Return percentage to primary artist
    setCollaborators(prev => prev.map((c, i) => 
      i === 0 ? { ...c, percentage: c.percentage + collaborator.percentage } : c
    ));

    setCollaborators(prev => prev.filter(c => c.id !== id));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      accepted: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      declined: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles];
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Revenue Splits
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage royalty splits for "{trackTitle}"
          </p>
        </div>
        {!isAddingCollaborator && (
          <button
            onClick={() => setIsAddingCollaborator(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Collaborator
          </button>
        )}
      </div>

      {/* Total Split Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-700">Total Split Allocation</span>
          <span className={`text-2xl font-bold ${totalPercentage === 100 ? 'text-green-600' : 'text-orange-600'}`}>
            {totalPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          {collaborators.map((c, index) => (
            <div
              key={c.id}
              className="h-full float-left transition-all"
              style={{
                width: `${c.percentage}%`,
                backgroundColor: index === 0 ? '#9333ea' : `hsl(${index * 60}, 70%, 60%)`
              }}
              title={`${c.name}: ${c.percentage}%`}
            />
          ))}
        </div>
        {totalPercentage < 100 && (
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ {remainingPercentage}% unallocated
          </p>
        )}
      </div>

      {/* Add Collaborator Form */}
      {isAddingCollaborator && (
        <div className="bg-gray-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Add New Collaborator</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newCollaborator.name}
                  onChange={(e) => setNewCollaborator({ ...newCollaborator, name: e.target.value })}
                  placeholder="Collaborator name"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newCollaborator.email}
                  onChange={(e) => setNewCollaborator({ ...newCollaborator, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newCollaborator.role}
                  onChange={(e) => setNewCollaborator({ ...newCollaborator, role: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option>Featured Artist</option>
                  <option>Producer</option>
                  <option>Songwriter</option>
                  <option>Composer</option>
                  <option>Mixer</option>
                  <option>Engineer</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Royalty Share (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max={remainingPercentage}
                  value={newCollaborator.percentage}
                  onChange={(e) => setNewCollaborator({ ...newCollaborator, percentage: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {remainingPercentage}%
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddCollaborator}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold"
              >
                Add & Send Invitation
              </button>
              <button
                onClick={() => setIsAddingCollaborator(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collaborators List */}
      <div className="space-y-3">
        {collaborators.map((collaborator, index) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all"
          >
            <div className="flex items-center gap-4 flex-1">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{
                  backgroundColor: index === 0 ? '#9333ea' : `hsl(${index * 60}, 70%, 60%)`
                }}
              >
                {collaborator.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{collaborator.name}</p>
                <p className="text-sm text-gray-600">{collaborator.role}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3" />
                  {collaborator.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{collaborator.percentage}%</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(collaborator.status)}`}>
                  {collaborator.status === 'accepted' && <Check className="w-3 h-3 inline mr-1" />}
                  {collaborator.status}
                </span>
              </div>

              {collaborator.id !== '1' && (
                <button
                  onClick={() => handleRemoveCollaborator(collaborator.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all"
                  title="Remove collaborator"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Distribution Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          How Splits Work
        </h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            Royalties are automatically split according to percentages when earnings are distributed
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            Collaborators must accept their invitation to receive payments
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            Each collaborator can track their earnings in their own dashboard
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            Splits can be modified before distribution, but require all parties to re-approve
          </li>
        </ul>
      </div>

      {totalPercentage === 100 && collaborators.every(c => c.status === 'accepted') && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold flex items-center gap-2">
            <Check className="w-5 h-5" />
            All splits configured and accepted! Payments will be distributed automatically.
          </p>
        </div>
      )}
    </div>
  );
}
