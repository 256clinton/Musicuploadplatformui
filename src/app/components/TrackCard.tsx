import { Play, Pause, Download, Share2, MoreVertical, Clock } from 'lucide-react';

interface TrackCardProps {
  track: {
    id: string;
    title: string;
    artist: string;
    genre: string;
    coverUrl: string;
    duration: string;
    plays: number;
    uploadDate: string;
  };
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function TrackCard({ track, isPlaying, onPlayPause }: TrackCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onPlayPause}
            className="absolute bottom-4 right-4 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white fill-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            )}
          </button>
        </div>
        <div className="absolute top-3 right-3">
          <button className="bg-black/50 backdrop-blur-sm p-2 rounded-lg hover:bg-black/70 transition-all">
            <MoreVertical className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate">{track.title}</h3>
        <p className="text-gray-600 mb-3 truncate">{track.artist}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {track.genre}
          </span>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>{track.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">{track.plays.toLocaleString()} plays</span>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Share">
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all" title="Download">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
