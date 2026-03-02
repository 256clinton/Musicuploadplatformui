import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface MusicPlayerProps {
  currentTrack: {
    title: string;
    artist: string;
    coverUrl: string;
    duration: string;
    audioUrl?: string;
  } | null;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function MusicPlayer({ currentTrack, isPlaying, onPlayPause }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [volume, setVolume] = useState(70);
  const [duration, setDuration] = useState(0);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        const mins = Math.floor(audio.currentTime / 60);
        const secs = Math.floor(audio.currentTime % 60);
        setCurrentTime(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      onPlayPause();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onPlayPause]);

  // Handle track changes
  useEffect(() => {
    if (audioRef.current && currentTrack?.audioUrl) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load(); // Ensure the audio is loaded
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          // Audio playback might be blocked by browser, will play when user interacts
        });
      }
    }
  }, [currentTrack]);

  // Handle play/pause changes
  useEffect(() => {
    if (audioRef.current && currentTrack?.audioUrl) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          // Audio playback might be blocked by browser
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack?.audioUrl]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.current.currentTime = percentage * duration;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) {
    return null;
  }

  // Show a message if the track doesn't have an audio URL
  const hasAudio = !!currentTrack.audioUrl;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white border-t border-gray-800 shadow-2xl z-40">
      {!hasAudio && (
        <div className="bg-yellow-600 text-white text-center py-1 px-4 text-sm">
          ⚠️ This track doesn't have an audio file yet
        </div>
      )}
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
              <div 
                className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-red-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-10">
                {duration ? formatDuration(duration) : currentTrack.duration}
              </span>
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