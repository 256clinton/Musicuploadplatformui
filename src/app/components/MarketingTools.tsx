import { useState } from 'react';
import { Link, QrCode, Share2, Copy, Check, Download, ExternalLink, Calendar } from 'lucide-react';

interface MarketingToolsProps {
  trackId: string;
  trackTitle: string;
  artistName: string;
}

export function MarketingTools({ trackId, trackTitle, artistName }: MarketingToolsProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'presave' | 'share' | 'qr'>('presave');

  // Generate share link
  const shareLink = `https://adisamusic.ug/track/${trackId}`;
  const preSaveLink = `https://adisamusic.ug/presave/${trackId}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocialMedia = (platform: string) => {
    const text = `Check out "${trackTitle}" by ${artistName}!`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`,
    };
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="font-bold text-xl mb-6">Marketing & Promotion Tools</h3>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('presave')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'presave'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pre-Save Campaign
        </button>
        <button
          onClick={() => setActiveTab('share')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'share'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Share Links
        </button>
        <button
          onClick={() => setActiveTab('qr')}
          className={`px-4 py-2 font-semibold transition-all ${
            activeTab === 'qr'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          QR Code
        </button>
      </div>

      {/* Pre-Save Campaign */}
      {activeTab === 'presave' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <h4 className="font-bold text-lg">Pre-Save Campaign</h4>
                <p className="text-sm text-gray-600">Build hype before your release</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">
              Let fans save your track to their library before release day. When it goes live, 
              it's automatically added to their collection!
            </p>

            <div className="bg-white rounded-lg p-4 mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pre-Save Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={preSaveLink}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm"
                />
                <button
                  onClick={() => handleCopy(preSaveLink)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">0</p>
                <p className="text-sm text-gray-600 mt-1">Pre-Saves</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-pink-600">0</p>
                <p className="text-sm text-gray-600 mt-1">Followers Gained</p>
              </div>
            </div>
          </div>

          <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Customize Pre-Save Page
          </button>
        </div>
      )}

      {/* Share Links */}
      {activeTab === 'share' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Universal Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm"
              />
              <button
                onClick={() => handleCopy(shareLink)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              This smart link automatically directs fans to their preferred streaming platform
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Share on Social Media</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => shareOnSocialMedia('twitter')}
                className="flex items-center gap-3 px-4 py-3 bg-sky-50 border-2 border-sky-200 rounded-lg hover:bg-sky-100 transition-all"
              >
                <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                  𝕏
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Twitter / X</p>
                  <p className="text-xs text-gray-600">Post to timeline</p>
                </div>
              </button>

              <button
                onClick={() => shareOnSocialMedia('facebook')}
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-all"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  f
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Facebook</p>
                  <p className="text-xs text-gray-600">Share on feed</p>
                </div>
              </button>

              <button
                onClick={() => shareOnSocialMedia('whatsapp')}
                className="flex items-center gap-3 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-all"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                  ✓✓
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">WhatsApp</p>
                  <p className="text-xs text-gray-600">Send to contacts</p>
                </div>
              </button>

              <button
                onClick={() => shareOnSocialMedia('telegram')}
                className="flex items-center gap-3 px-4 py-3 bg-cyan-50 border-2 border-cyan-200 rounded-lg hover:bg-cyan-100 transition-all"
              >
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xl">
                  ✈
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Telegram</p>
                  <p className="text-xs text-gray-600">Share in groups</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Link className="w-5 h-5 text-yellow-600" />
              Platform-Specific Links
            </h4>
            <div className="space-y-2">
              {[
                { name: 'Spotify', url: `https://open.spotify.com/track/${trackId}` },
                { name: 'Apple Music', url: `https://music.apple.com/track/${trackId}` },
                { name: 'YouTube Music', url: `https://music.youtube.com/watch?v=${trackId}` },
              ].map((platform) => (
                <div key={platform.name} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{platform.name}</span>
                  <button
                    onClick={() => handleCopy(platform.url)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QR Code */}
      {activeTab === 'qr' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-xs mx-auto">
              <div className="aspect-square bg-gradient-to-br from-yellow-400 via-red-500 to-black rounded-lg flex items-center justify-center">
                <QrCode className="w-48 h-48 text-white" />
              </div>
              <div className="text-center mt-4">
                <p className="font-bold text-lg">{trackTitle}</p>
                <p className="text-gray-600">{artistName}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-4">
              <strong>💡 Pro Tip:</strong> Print this QR code on posters, flyers, or business cards. 
              Fans can scan it to instantly listen to your music!
            </p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download PNG
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download SVG
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-4 text-center border-2 border-gray-200">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-600 mt-1">QR Scans</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border-2 border-gray-200">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-600 mt-1">Conversions</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border-2 border-gray-200">
              <p className="text-2xl font-bold text-gray-900">0%</p>
              <p className="text-xs text-gray-600 mt-1">Scan Rate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
