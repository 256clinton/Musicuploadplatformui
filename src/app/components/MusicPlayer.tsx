import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MusicPlayerProps {
  currentTrack: {
    title: string;
    artist: string;
    coverUrl: string;
    duration: string;
  } | null;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function MusicPlayer({ currentTrack, isPlaying, onPlayPause }: MusicPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [volume, setVolume] = useState(70);

  useEffect(() => {
    if (isPlaying && currentTrack) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 0.5;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const seconds = Math.floor((progress / 100) * 180);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    setCurrentTime(`${mins}:${secs.toString().padStart(2, '0')}`);
  }, [progress]);

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white border-t border-gray-800 shadow-2xl z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-14 h-14 rounded-lg object-cover shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{currentTrack.title}</p>
              <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center justify-center gap-4 mb-2">
              <button className="hover:text-yellow-500 transition-colors">
                <Shuffle className="w-5 h-5" />
              </button>
              <button className="hover:text-yellow-500 transition-colors">
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={onPlayPause}
                className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
              <button className="hover:text-yellow-500 transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>
              <button className="hover:text-yellow-500 transition-colors">
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-10 text-right">{currentTime}</span>
              <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-red-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-10">{currentTrack.duration}</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
            <Volume2 className="w-5 h-5" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #eab308 ${volume}%, #374151 ${volume}%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
