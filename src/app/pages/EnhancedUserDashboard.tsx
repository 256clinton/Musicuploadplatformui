import { useState, useEffect } from 'react';
import { 
  Music2,
  LayoutDashboard,
  Music,
  TrendingUp,
  User,
  LogOut,
  Upload,
  Play,
  DollarSign,
  Globe,
  Clock,
  BarChart3,
  Loader2,
  Bell,
  Share2,
  Users,
  HardDrive
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { projectId } from '../../../utils/supabase/info';
import { MarketingTools } from '../components/MarketingTools';
import { SplitsManager } from '../components/SplitsManager';
import { FileVault } from '../components/FileVault';
import { RoyaltyTracker } from '../components/RoyaltyTracker';
import { NotificationsPanel } from '../components/NotificationsPanel';

type Tab = 'overview' | 'tracks' | 'analytics' | 'earnings' | 'marketing' | 'splits' | 'vault' | 'notifications' | 'profile';

interface UserTrack {
  id: string;
  title: string;
  coverUrl: string;
  genre: string;
  status: 'pending' | 'approved' | 'distributed' | 'rejected';
  uploadDate: string;
  plays: number;
  earnings: string;
  platforms: string[];
}

export function EnhancedUserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [userTracks, setUserTracks] = useState<UserTrack[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedTrack, setSelectedTrack] = useState<UserTrack | null>(null);

  const userStats = {
    totalTracks: userTracks.length,
    totalPlays: userTracks.reduce((sum, t) => sum + t.plays, 0),
    totalEarnings: userProfile?.totalEarnings || 0,
    pendingTracks: userTracks.filter(t => t.status === 'pending').length,
  };

  useEffect(() => {
    checkAuth();
    fetchUserData();
  }, []);

  const checkAuth = () => {
    const accessToken = localStorage.getItem('accessToken');
    const profile = localStorage.getItem('userProfile');
    
    if (!accessToken || !profile) {
      navigate('/login');
      return;
    }

    const parsedProfile = JSON.parse(profile);
    setUserProfile(parsedProfile);
  };

  const fetchUserData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;

      const response = await fetch(`${apiUrl}/tracks/my`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setUserTracks(data.tracks || []);
        if (data.tracks && data.tracks.length > 0) {
          setSelectedTrack(data.tracks[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    navigate('/login');
  };

  const platformData = [
    { name: 'Spotify', plays: Math.floor(userStats.totalPlays * 0.4), percentage: 40 },
    { name: 'Apple Music', plays: Math.floor(userStats.totalPlays * 0.3), percentage: 30 },
    { name: 'YouTube Music', plays: Math.floor(userStats.totalPlays * 0.2), percentage: 20 },
    { name: 'Boomplay', plays: Math.floor(userStats.totalPlays * 0.1), percentage: 10 },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      distributed: 'bg-blue-100 text-blue-800',
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
      <aside className="w-64 bg-gradient-to-b from-yellow-500 via-red-600 to-black text-white p-6 flex flex-col fixed h-full overflow-y-auto">
        <div className="flex items-center gap-3 mb-8">
          <Music2 className="w-8 h-8" />
          <div>
            <h1 className="font-bold text-xl">Adisa Music</h1>
            <p className="text-xs opacity-90">Artist Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'overview' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tracks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'tracks' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Music className="w-5 h-5" />
            My Tracks
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'analytics' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'earnings' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Royalties
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'marketing' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Share2 className="w-5 h-5" />
            Marketing
          </button>
          <button
            onClick={() => setActiveTab('splits')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'splits' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            Collaborators
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'vault' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <HardDrive className="w-5 h-5" />
            File Vault
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'notifications' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Bell className="w-5 h-5" />
            Notifications
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              2
            </span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === 'profile' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <User className="w-5 h-5" />
            Profile
          </button>
        </nav>

        <div className="space-y-2 mt-6">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            <Upload className="w-5 h-5" />
            Upload New Track
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {userProfile?.name}! 👋
            </h2>
            <p className="text-gray-600">
              {activeTab === 'overview' && "Here's what's happening with your music"}
              {activeTab === 'tracks' && 'Manage your music catalog'}
              {activeTab === 'analytics' && 'Track your performance across platforms'}
              {activeTab === 'earnings' && 'Monitor and withdraw your royalties'}
              {activeTab === 'marketing' && 'Promote your music with powerful tools'}
              {activeTab === 'splits' && 'Manage revenue splits with collaborators'}
              {activeTab === 'vault' && 'Access all your files and reports'}
              {activeTab === 'notifications' && 'Stay updated on your releases'}
              {activeTab === 'profile' && 'Manage your artist profile'}
            </p>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <Music className="w-10 h-10 text-yellow-500 mb-4" />
                  <p className="text-gray-600 text-sm mb-1">Total Tracks</p>
                  <p className="text-3xl font-bold">{userStats.totalTracks}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <Play className="w-10 h-10 text-red-500 mb-4" />
                  <p className="text-gray-600 text-sm mb-1">Total Plays</p>
                  <p className="text-3xl font-bold">{userStats.totalPlays.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <DollarSign className="w-10 h-10 text-green-500 mb-4" />
                  <p className="text-gray-600 text-sm mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold">{userStats.totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">UGX</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <Clock className="w-10 h-10 text-blue-500 mb-4" />
                  <p className="text-gray-600 text-sm mb-1">Pending Review</p>
                  <p className="text-3xl font-bold">{userStats.pendingTracks}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                <h3 className="font-bold text-xl mb-4">Recent Tracks</h3>
                {userTracks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tracks uploaded yet</p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Upload Your First Track
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userTracks.slice(0, 5).map(track => (
                      <div key={track.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                        {track.coverUrl && (
                          <img src={track.coverUrl} alt={track.title} className="w-16 h-16 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{track.title}</p>
                          <p className="text-sm text-gray-600">{track.genre} • {track.plays.toLocaleString()} plays</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(track.status)}`}>
                          {track.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-bold text-xl mb-4">Distribution Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Globe className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">
                      {userTracks.filter(t => t.status === 'distributed').length}
                    </p>
                    <p className="text-sm text-gray-600">Live Tracks</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{userStats.pendingTracks}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">9</p>
                    <p className="text-sm text-gray-600">Platforms</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Music className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">100%</p>
                    <p className="text-sm text-gray-600">Royalties</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Tracks Tab */}
          {activeTab === 'tracks' && (
            <div>
              {userTracks.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                  <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No tracks yet</h3>
                  <p className="text-gray-600 mb-6">Start your music distribution journey today</p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Upload Your First Track
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userTracks.map(track => (
                    <div key={track.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                      {track.coverUrl && (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-48 object-cover" />
                      )}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-xl mb-1">{track.title}</h3>
                            <p className="text-gray-600">{track.genre}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(track.status)}`}>
                            {track.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Plays</p>
                            <p className="font-bold text-lg">{track.plays.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Earnings</p>
                            <p className="font-bold text-lg text-green-600">{track.earnings}</p>
                          </div>
                        </div>

                        {track.platforms && track.platforms.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Available on:</p>
                            <div className="flex flex-wrap gap-2">
                              {track.platforms.map(platform => (
                                <span key={platform} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                <h3 className="font-bold text-xl mb-6">Platform Performance</h3>
                {userStats.totalPlays > 0 ? (
                  <div className="space-y-4">
                    {platformData.map(platform => (
                      <div key={platform.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{platform.name}</span>
                          <span className="text-gray-600">{platform.plays.toLocaleString()} plays</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-red-600 h-full rounded-full transition-all"
                            style={{ width: `${platform.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No analytics data available yet</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="font-bold text-lg mb-4">Geographic Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>🇺🇬 Uganda</span>
                      <span className="font-semibold">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🇰🇪 Kenya</span>
                      <span className="font-semibold">25%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🇹🇿 Tanzania</span>
                      <span className="font-semibold">15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🌍 Others</span>
                      <span className="font-semibold">15%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="font-bold text-lg mb-4">Monthly Growth</h3>
                  <div className="text-center py-8">
                    <p className="text-5xl font-bold text-green-600 mb-2">+34%</p>
                    <p className="text-gray-600">Increase in plays this month</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Royalty Tracker */}
          {activeTab === 'earnings' && <RoyaltyTracker />}

          {/* Marketing Tools */}
          {activeTab === 'marketing' && selectedTrack && (
            <MarketingTools 
              trackId={selectedTrack.id}
              trackTitle={selectedTrack.title}
              artistName={userProfile?.name || 'Artist'}
            />
          )}

          {/* Splits Manager */}
          {activeTab === 'splits' && selectedTrack && (
            <SplitsManager 
              trackId={selectedTrack.id}
              trackTitle={selectedTrack.title}
            />
          )}

          {/* File Vault */}
          {activeTab === 'vault' && selectedTrack && (
            <FileVault 
              trackId={selectedTrack.id}
              trackTitle={selectedTrack.title}
            />
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && <NotificationsPanel />}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-xl mb-6">Artist Profile</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Artist Name</label>
                  <input
                    type="text"
                    defaultValue={userProfile?.name}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={userProfile?.email}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    defaultValue="Award-winning Ugandan artist specializing in Afrobeat and Dancehall music."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
