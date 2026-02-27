import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Music, 
  Users, 
  DollarSign, 
  Settings,
  LogOut,
  Check,
  X,
  Eye,
  Search,
  Filter,
  Music2,
  TrendingUp,
  Clock,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

type Tab = 'dashboard' | 'tracks' | 'users' | 'payments' | 'settings';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  status: 'pending' | 'approved' | 'rejected' | 'distributed';
  uploadDate: string;
  plan: string;
  amount: string;
  userId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  totalTracks: number;
  totalEarnings: number;
  createdAt: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalTracks: 0,
    pendingReviews: 0,
    activeUsers: 0,
    totalRevenue: '0',
  });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const accessToken = localStorage.getItem('accessToken');
    const userProfile = localStorage.getItem('userProfile');
    
    if (!accessToken || !userProfile) {
      navigate('/login');
      return;
    }

    const profile = JSON.parse(userProfile);
    if (profile.role !== 'admin') {
      navigate('/dashboard');
    }
  };

  const fetchData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;

      // Fetch tracks
      const tracksResponse = await fetch(`${apiUrl}/tracks/all`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const tracksData = await tracksResponse.json();
      if (tracksResponse.ok) {
        setTracks(tracksData.tracks || []);
      }

      // Fetch users
      const usersResponse = await fetch(`${apiUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const usersData = await usersResponse.json();
      if (usersResponse.ok) {
        setUsers(usersData.users || []);
      }

      // Fetch stats
      const statsResponse = await fetch(`${apiUrl}/stats/admin`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const statsData = await statsResponse.json();
      if (statsResponse.ok) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
      const response = await fetch(`${apiUrl}/tracks/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        setTracks(tracks.map(t => t.id === id ? { ...t, status: 'approved' as const } : t));
      }
    } catch (error) {
      console.error('Error approving track:', error);
    }
  };

  const handleReject = async (id: string) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
      const response = await fetch(`${apiUrl}/tracks/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        setTracks(tracks.map(t => t.id === id ? { ...t, status: 'rejected' as const } : t));
      }
    } catch (error) {
      console.error('Error rejecting track:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      distributed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 to-black text-white p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <Music2 className="w-8 h-8" />
          <div>
            <h1 className="font-bold text-xl">Adisa Music</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'dashboard' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('tracks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'tracks' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <Music className="w-5 h-5" />
            Track Management
            {stats.pendingReviews > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.pendingReviews}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'users' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'settings' ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'tracks' && 'Track Management'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'settings' && 'Settings'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'dashboard' && 'Monitor your platform performance'}
              {activeTab === 'tracks' && 'Review and approve track submissions'}
              {activeTab === 'users' && 'Manage artist accounts'}
              {activeTab === 'settings' && 'Configure platform settings'}
            </p>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <Music className="w-12 h-12 text-yellow-500 mb-4" />
                  <p className="text-gray-600 text-sm mb-1">Total Tracks</p>
                  <p className="text-3xl font-bold">{stats.totalTracks}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <Clock className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-gray-600 text-sm mb-1">Pending Reviews</p>
                  <p className="text-3xl font-bold">{stats.pendingReviews}</p>
                  <p className="text-sm text-yellow-600 mt-2">Needs attention</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <Users className="w-12 h-12 text-blue-500 mb-4" />
                  <p className="text-gray-600 text-sm mb-1">Active Users</p>
                  <p className="text-3xl font-bold">{stats.activeUsers}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <DollarSign className="w-12 h-12 text-green-500 mb-4" />
                  <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-2">UGX</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-bold text-xl mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {tracks.slice(0, 5).map(track => (
                    <div key={track.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold">{track.title}</p>
                        <p className="text-sm text-gray-600">{track.artist} • {track.genre}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(track.status)}`}>
                        {track.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tracks Tab */}
          {activeTab === 'tracks' && (
            <div>
              <div className="bg-white rounded-xl shadow-md mb-6 p-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tracks..."
                      className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Filter className="w-5 h-5" />
                    Filter
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Track</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Artist</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plan</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tracks.map(track => (
                      <tr key={track.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">{track.title}</p>
                            <p className="text-sm text-gray-500">{track.genre}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">{track.artist}</td>
                        <td className="px-6 py-4">{track.plan}</td>
                        <td className="px-6 py-4 font-semibold">{track.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(track.status)}`}>
                            {track.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {track.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(track.id)}
                                  className="p-2 hover:bg-green-100 text-green-600 rounded-lg"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(track.id)}
                                  className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tracks</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Earnings</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{user.name}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{user.totalTracks || 0}</td>
                      <td className="px-6 py-4 font-semibold text-green-600">{user.totalEarnings || 0} UGX</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-4">Platform Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">Auto-approve tracks</p>
                        <p className="text-sm text-gray-600">Automatically approve quality submissions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}