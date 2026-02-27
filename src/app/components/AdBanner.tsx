import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

export function AdBanner() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 0 && currentAdIndex < ads.length) {
      // Track impression
      trackImpression(ads[currentAdIndex].id);
      
      // Rotate ads every 10 seconds
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [ads, currentAdIndex]);

  const fetchAds = async () => {
    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
      const response = await fetch(`${apiUrl}/ads`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      if (response.ok && data.ads && data.ads.length > 0) {
        setAds(data.ads.filter((ad: Ad) => ad.isActive));
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  const trackImpression = async (adId: string) => {
    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
      await fetch(`${apiUrl}/ads/${adId}/impression`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const trackClick = async (adId: string) => {
    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
      await fetch(`${apiUrl}/ads/${adId}/click`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleAdClick = (ad: Ad) => {
    if (ad.linkUrl) {
      trackClick(ad.id);
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isVisible || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];

  return (
    <div className="relative mb-8 rounded-2xl overflow-hidden shadow-xl">
      <div 
        className={`relative h-48 md:h-64 ${currentAd.linkUrl ? 'cursor-pointer' : ''}`}
        onClick={() => currentAd.linkUrl && handleAdClick(currentAd)}
      >
        <img
          src={currentAd.imageUrl}
          alt={currentAd.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Ad Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-gray-300 mb-1">Advertisement</p>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">{currentAd.title}</h3>
              {currentAd.description && (
                <p className="text-sm md:text-base text-gray-200">{currentAd.description}</p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
              title="Close ad"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ad Indicator Dots */}
        {ads.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentAdIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentAdIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
