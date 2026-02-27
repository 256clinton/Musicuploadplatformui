import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ExternalLink, Eye, EyeOff, Loader2, BarChart3 } from 'lucide-react';
import { projectId } from '../../../utils/supabase/info';

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  clicks: number;
  impressions: number;
  createdAt: string;
}

export function AdsManagement() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
      const response = await fetch(`${apiUrl}/ads`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
      
      if (editingAd) {
        // Update existing ad
        const response = await fetch(`${apiUrl}/ads/${editingAd.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const data = await response.json();
          setAds(ads.map(ad => ad.id === editingAd.id ? data.ad : ad));
        }
      } else {
        // Create new ad
        const response = await fetch(`${apiUrl}/ads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const data = await response.json();
          setAds([data.ad, ...ads]);
        }
      }

      // Reset form and close modal
      setFormData({ title: '', description: '', imageUrl: '', linkUrl: '', isActive: true });
      setEditingAd(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving ad:', error);
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      isActive: ad.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
      const response = await fetch(`${apiUrl}/ads/${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        setAds(ads.filter(ad => ad.id !== adId));
      }
    } catch (error) {
      console.error('Error deleting ad:', error);
    }
  };

  const toggleAdStatus = async (ad: Ad) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
      const response = await fetch(`${apiUrl}/ads/${ad.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ isActive: !ad.isActive })
      });

      if (response.ok) {
        const data = await response.json();
        setAds(ads.map(a => a.id === ad.id ? data.ad : a));
      }
    } catch (error) {
      console.error('Error toggling ad status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Advertisements</h3>
          <p className="text-gray-600 text-sm">Manage platform advertisements</p>
        </div>
        <button
          onClick={() => {
            setEditingAd(null);
            setFormData({ title: '', description: '', imageUrl: '', linkUrl: '', isActive: true });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Ad
        </button>
      </div>

      {ads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No ads created yet</p>
          <p className="text-gray-400 text-sm mb-6">Create your first advertisement to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Create First Ad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {ads.map(ad => (
            <div key={ad.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex">
                {/* Ad Preview */}
                <div className="w-64 h-48 bg-gray-100 flex-shrink-0">
                  {ad.imageUrl ? (
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Ad Details */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900">{ad.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ad.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{ad.description}</p>
                      {ad.linkUrl && (
                        <a 
                          href={ad.linkUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {ad.linkUrl}
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAdStatus(ad)}
                        className={`p-2 rounded-lg ${
                          ad.isActive ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-green-100 text-green-600'
                        }`}
                        title={ad.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {ad.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleEdit(ad)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Ad Stats */}
                  <div className="flex gap-6 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Impressions</p>
                      <p className="text-lg font-bold text-gray-900">{ad.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Clicks</p>
                      <p className="text-lg font-bold text-gray-900">{ad.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CTR</p>
                      <p className="text-lg font-bold text-gray-900">
                        {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0'}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Ad Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold">
                {editingAd ? 'Edit Advertisement' : 'Create Advertisement'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ad Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter ad title"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter ad description"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  required
                />
                {formData.imageUrl && (
                  <div className="mt-3">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).alt = 'Invalid image URL';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link URL
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                  Active (show on platform)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  {editingAd ? 'Update Ad' : 'Create Ad'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingAd(null);
                    setFormData({ title: '', description: '', imageUrl: '', linkUrl: '', isActive: true });
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}