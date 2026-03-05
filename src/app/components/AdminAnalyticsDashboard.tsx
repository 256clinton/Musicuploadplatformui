import { useState } from 'react';
import { TrendingUp, TrendingDown, Download, Calendar, DollarSign, Users, Music, Globe } from 'lucide-react';

interface AdminAnalyticsDashboardProps {
  stats: {
    totalTracks: number;
    pendingReviews: number;
    activeUsers: number;
    totalRevenue: number | string;
  };
  tracks: any[];
  users: any[];
}

export function AdminAnalyticsDashboard({ stats, tracks, users }: AdminAnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Calculate analytics
  const revenueByMonth = [
    { month: 'Jan', amount: 2500000 },
    { month: 'Feb', amount: 3200000 },
    { month: 'Mar', amount: 4100000 },
  ];

  const userGrowth = [
    { month: 'Jan', users: 45 },
    { month: 'Feb', users: 67 },
    { month: 'Mar', users: 89 },
  ];

  const platformDistribution = [
    { platform: 'Spotify', percentage: 35, tracks: 124, color: '#1DB954' },
    { platform: 'Apple Music', percentage: 28, tracks: 98, color: '#FA243C' },
    { platform: 'YouTube Music', percentage: 22, tracks: 77, color: '#FF0000' },
    { platform: 'Boomplay', percentage: 10, tracks: 35, color: '#FF6B00' },
    { platform: 'Others', percentage: 5, tracks: 18, color: '#6B7280' },
  ];

  const topGenres = [
    { genre: 'Afrobeat', tracks: 156, percentage: 45 },
    { genre: 'Dancehall', tracks: 89, percentage: 26 },
    { genre: 'Hip Hop', tracks: 62, percentage: 18 },
    { genre: 'Gospel', tracks: 38, percentage: 11 },
  ];

  const topArtists = users
    .filter(u => u.role === 'artist')
    .sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))
    .slice(0, 5);

  const revenueGrowth = ((revenueByMonth[2].amount - revenueByMonth[1].amount) / revenueByMonth[1].amount) * 100;
  const userGrowthRate = ((userGrowth[2].users - userGrowth[1].users) / userGrowth[1].users) * 100;

  const handleExportReport = () => {
    console.log('Exporting analytics report...');
    // In production, this would generate a PDF/CSV report
  };

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-2xl text-gray-900">Platform Analytics</h3>
          <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics with Growth Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <Music className="w-12 h-12 text-purple-500" />
            <div className={`flex items-center gap-1 text-sm font-semibold ${revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueGrowth > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(revenueGrowth).toFixed(1)}%
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Tracks</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalTracks}</p>
          <p className="text-xs text-gray-500 mt-2">+12 this month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-12 h-12 text-blue-500" />
            <div className={`flex items-center gap-1 text-sm font-semibold ${userGrowthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {userGrowthRate > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(userGrowthRate).toFixed(1)}%
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Active Artists</p>
          <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
          <p className="text-xs text-gray-500 mt-2">+{userGrowth[2].users - userGrowth[1].users} this month</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-12 h-12 text-green-500" />
            <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
              <TrendingUp className="w-4 h-4" />
              {revenueGrowth.toFixed(1)}%
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">{typeof stats.totalRevenue === 'number' ? stats.totalRevenue.toLocaleString() : stats.totalRevenue}</p>
          <p className="text-xs text-gray-500 mt-2">UGX</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <Globe className="w-12 h-12 text-orange-500" />
            <span className="text-sm font-semibold text-gray-600">9 platforms</span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Global Reach</p>
          <p className="text-3xl font-bold text-gray-900">150+</p>
          <p className="text-xs text-gray-500 mt-2">Countries</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h4 className="font-bold text-lg mb-6">Revenue Trend</h4>
          <div className="space-y-4">
            {revenueByMonth.map((data, index) => {
              const maxRevenue = Math.max(...revenueByMonth.map(m => m.amount));
              const width = (data.amount / maxRevenue) * 100;
              return (
                <div key={data.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{data.month} 2026</span>
                    <span className="text-sm font-bold text-green-600">{(data.amount / 1000).toFixed(0)}K UGX</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h4 className="font-bold text-lg mb-6">User Growth</h4>
          <div className="space-y-4">
            {userGrowth.map((data, index) => {
              const maxUsers = Math.max(...userGrowth.map(m => m.users));
              const width = (data.users / maxUsers) * 100;
              return (
                <div key={data.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{data.month} 2026</span>
                    <span className="text-sm font-bold text-blue-600">{data.users} artists</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform Distribution & Genre Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h4 className="font-bold text-lg mb-6">Platform Distribution</h4>
          <div className="space-y-4">
            {platformDistribution.map((platform) => (
              <div key={platform.platform}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="text-sm font-semibold text-gray-700">{platform.platform}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{platform.tracks} tracks</span>
                    <span className="text-sm font-bold" style={{ color: platform.color }}>
                      {platform.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${platform.percentage}%`,
                      backgroundColor: platform.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Genres */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h4 className="font-bold text-lg mb-6">Popular Genres</h4>
          <div className="space-y-4">
            {topGenres.map((genre, index) => (
              <div key={genre.genre}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-red-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-gray-700">{genre.genre}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{genre.tracks} tracks</span>
                    <span className="text-sm font-bold text-purple-600">{genre.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${genre.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Artists */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h4 className="font-bold text-lg mb-6">Top Earning Artists</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Artist</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tracks</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Earnings</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topArtists.map((artist, index) => (
                <tr key={artist.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{artist.name}</td>
                  <td className="px-6 py-4 text-gray-600">{artist.totalTracks || 0}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{(artist.totalEarnings || 0).toLocaleString()} UGX</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      {(Math.random() * 50 + 10).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Status Overview */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h4 className="font-bold text-lg mb-6">Payment Transactions</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">45</p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">12</p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-600">3</p>
            <p className="text-sm text-gray-600 mt-1">Failed</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">2.4M</p>
            <p className="text-sm text-gray-600 mt-1">Total Value (UGX)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
