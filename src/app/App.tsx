import { useState } from "react";
import { Header } from "./components/Header";
import { UploadModal } from "./components/UploadModal";
import { TrackCard } from "./components/TrackCard";
import { MusicPlayer } from "./components/MusicPlayer";

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  coverUrl: string;
  duration: string;
  plays: number;
  uploadDate: string;
}

function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] =
    useState(false);
  const [currentView, setCurrentView] = useState<
    "home" | "upload" | "profile"
  >("home");
  const [currentPlayingId, setCurrentPlayingId] = useState<
    string | null
  >(null);
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "1",
      title: "Kampala Nights",
      artist: "Eddy Kenzo",
      genre: "Afrobeat",
      coverUrl:
        "https://images.unsplash.com/photo-1745852738000-f6b7e53f9662?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVZ2FuZGElMjBtdXNpY2lhbiUyMHBlcmZvcm1pbmd8ZW58MXx8fHwxNzcxNjE3MTUzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "3:45",
      plays: 12543,
      uploadDate: "2026-02-15",
    },
    {
      id: "2",
      title: "Pearl of Africa",
      artist: "Sheebah Karungi",
      genre: "Dancehall",
      coverUrl:
        "https://images.unsplash.com/photo-1658758158146-4f91c3b16ce5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwbXVzaWMlMjBzdHVkaW98ZW58MXx8fHwxNzcxNjE3MTUzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "4:12",
      plays: 8934,
      uploadDate: "2026-02-18",
    },
    {
      id: "3",
      title: "Nile Flow",
      artist: "Bebe Cool",
      genre: "Ragga",
      coverUrl:
        "https://images.unsplash.com/photo-1770240090780-a80f44963545?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVZ2FuZGElMjBmbGFnJTIwY29sb3JzfGVufDF8fHx8MTc3MTYxNzE1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "3:28",
      plays: 15672,
      uploadDate: "2026-02-10",
    },
    {
      id: "4",
      title: "African Queen",
      artist: "Jose Chameleone",
      genre: "Afrobeat",
      coverUrl:
        "https://images.unsplash.com/photo-1745852738000-f6b7e53f9662?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVZ2FuZGElMjBtdXNpY2lhbiUyMHBlcmZvcm1pbmd8ZW58MXx8fHwxNzcxNjE3MTUzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      duration: "4:03",
      plays: 21456,
      uploadDate: "2026-02-05",
    },
  ]);

  const handleUpload = (newTrack: {
    title: string;
    artist: string;
    genre: string;
    coverUrl: string;
    audioFile: File | null;
  }) => {
    const track: Track = {
      id: Date.now().toString(),
      title: newTrack.title,
      artist: newTrack.artist,
      genre: newTrack.genre,
      coverUrl: newTrack.coverUrl,
      duration: "3:30",
      plays: 0,
      uploadDate: new Date().toISOString().split("T")[0],
    };
    setTracks([track, ...tracks]);
  };

  const handlePlayPause = (trackId: string) => {
    setCurrentPlayingId(
      currentPlayingId === trackId ? null : trackId,
    );
  };

  const currentTrack = tracks.find(
    (t) => t.id === currentPlayingId,
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Header
        onUploadClick={() => setIsUploadModalOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative h-64 rounded-2xl overflow-hidden mb-8 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1745852738000-f6b7e53f9662?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxVZ2FuZGElMjBtdXNpY2lhbiUyMHBlcmZvcm1pbmd8ZW58MXx8fHwxNzcxNjE3MTUzfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center">
            <div className="px-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Distribute Your Music Globally
              </h2>
              <p className="text-xl text-gray-200 mb-6">
                Get your music on Spotify, Apple Music, and 150+
                platforms worldwide
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
              >
                Start Distribution
              </button>
            </div>
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Recent Uploads
            </h3>
            <select className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none">
              <option>All Genres</option>
              <option>Afrobeat</option>
              <option>Dancehall</option>
              <option>Ragga</option>
              <option>Gospel</option>
              <option>Hip Hop</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isPlaying={currentPlayingId === track.id}
                onPlayPause={() => handlePlayPause(track.id)}
              />
            ))}
          </div>
        </div>
      </main>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <MusicPlayer
        currentTrack={currentTrack || null}
        isPlaying={currentPlayingId !== null}
        onPlayPause={() =>
          currentTrack && handlePlayPause(currentTrack.id)
        }
      />
    </div>
  );
}

export default App;
