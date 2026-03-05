import { useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface RoyaltyData {
  month: string;
  platform: string;
  streams: number;
  revenue: number;
  country: string;
}

export function RoyaltyTracker() {
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  const royalties: RoyaltyData[] = [
    { month: 'March 2026', platform: 'Spotify', streams: 5432, revenue: 125000, country: 'Uganda' },
    { month: 'March 2026', platform: 'Spotify', streams: 2341, revenue: 54000, country: 'Kenya' },
    { month: 'March 2026', platform: 'Spotify', streams: 1234, revenue: 28500, country: 'Tanzania' },
    { month: 'March 2026', platform: 'Apple Music', streams: 3245, revenue: 95000, country: 'Uganda' },
    { month: 'March 2026', platform: 'Apple Music', streams: 1876, revenue: 55000, country: 'Kenya' },
    { month: 'March 2026', platform: 'YouTube Music', streams: 8765, revenue: 78000, country: 'Uganda' },
    { month: 'March 2026', platform: 'Boomplay', streams: 12456, revenue: 145000, country: 'Uganda' },
    { month: 'March 2026', platform: 'Boomplay', streams: 8932, revenue: 104000, country: 'Nigeria' },
    { month: 'February 2026', platform: 'Spotify', streams: 4821, revenue: 111000, country: 'Uganda' },
    { month: 'February 2026', platform: 'Apple Music', streams: 2987, revenue: 87500, country: 'Uganda' },
  ];

  // Aggregate by platform for current month
  const currentMonthData = royalties.filter(r => r.month === selectedMonth);
  const platformTotals = currentMonthData.reduce((acc, item) => {
    if (!acc[item.platform]) {
      acc[item.platform] = { streams: 0, revenue: 0, countries: new Set() };
    }
    acc[item.platform].streams += item.streams;
    acc[item.platform].revenue += item.revenue;
    acc[item.platform].countries.add(item.country);
    return acc;
  }, {} as Record<string, { streams: number; revenue: number; countries: Set<string> }>);

  const totalRevenue = currentMonthData.reduce((sum, r) => sum + r.revenue, 0);
  const totalStreams = currentMonthData.reduce((sum, r) => sum + r.streams, 0);

  const platformColors: Record<string, string> = {
    'Spotify': '#1DB954',
    'Apple Music': '#FA243C',
    'YouTube Music': '#FF0000',
    'Boomplay': '#FF6B00',
    'Deezer': '#FF0080',
    'Tidal': '#000000',
  };

  const months = ['March 2026', 'February 2026', 'January 2026'];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-xl flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Detailed Royalty Tracker
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Track your earnings across all platforms and territories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
          <DollarSign className="w-10 h-10 text-green-600 mb-3" />
          <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
          <p className="text-3xl font-bold text-green-600">{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">UGX</p>
          <div className="mt-3 flex items-center gap-1 text-sm text-green-600 font-semibold">
            <TrendingUp className="w-4 h-4" />
            +23.5% vs last month
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <Eye className="w-10 h-10 text-purple-600 mb-3" />
          <p className="text-sm text-gray-600 mb-1">Total Streams</p>
          <p className="text-3xl font-bold text-purple-600">{totalStreams.toLocaleString()}</p>
          <div className="mt-3 flex items-center gap-1 text-sm text-purple-600 font-semibold">
            <TrendingUp className="w-4 h-4" />
            +18.2% vs last month
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
          <Calendar className="w-10 h-10 text-blue-600 mb-3" />
          <p className="text-sm text-gray-600 mb-1">Avg per Stream</p>
          <p className="text-3xl font-bold text-blue-600">
            {totalStreams > 0 ? ((totalRevenue / totalStreams)).toFixed(2) : '0'}
          </p>
          <p className="text-xs text-gray-500 mt-1">UGX</p>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 mb-4">Breakdown by Platform</h4>
        {Object.entries(platformTotals)
          .sort((a, b) => b[1].revenue - a[1].revenue)
          .map(([platform, data]) => {
            const percentage = (data.revenue / totalRevenue) * 100;
            const isExpanded = expandedPlatform === platform;
            const platformData = currentMonthData.filter(r => r.platform === platform);

            return (
              <div key={platform} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                {/* Platform Header */}
                <button
                  onClick={() => setExpandedPlatform(isExpanded ? null : platform)}
                  className="w-full p-4 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: platformColors[platform] || '#6B7280' }}
                      />
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-900">{platform}</p>
                        <p className="text-sm text-gray-600">
                          {data.streams.toLocaleString()} streams • {data.countries.size} {data.countries.size === 1 ? 'country' : 'countries'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {data.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">UGX ({percentage.toFixed(1)}%)</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: platformColors[platform] || '#6B7280'
                      }}
                    />
                  </div>
                </button>

                {/* Expanded Country Breakdown */}
                {isExpanded && (
                  <div className="bg-gray-50 p-4 border-t">
                    <h5 className="font-semibold text-gray-900 mb-3 text-sm">Country Breakdown</h5>
                    <div className="space-y-2">
                      {platformData.map((item, index) => (
                        <div
                          key={`${item.platform}-${item.country}-${index}`}
                          className="flex items-center justify-between p-3 bg-white rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{item.country}</p>
                            <p className="text-sm text-gray-600">{item.streams.toLocaleString()} streams</p>
                          </div>
                          <p className="font-bold text-green-600">{item.revenue.toLocaleString()} UGX</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Payment Schedule */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">💰 Payment Schedule</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-blue-800 mb-1">Next Payment Date</p>
            <p className="font-bold text-blue-900">April 15, 2026</p>
          </div>
          <div>
            <p className="text-sm text-blue-800 mb-1">Estimated Amount</p>
            <p className="font-bold text-blue-900">{totalRevenue.toLocaleString()} UGX</p>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-3">
          💡 Royalties are paid monthly, 30 days after the streaming month ends
        </p>
      </div>

      {/* Withdrawal Options */}
      <div className="mt-6 flex gap-3">
        <button className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
          Request Withdrawal
        </button>
        <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all">
          View Full History
        </button>
      </div>
    </div>
  );
}
