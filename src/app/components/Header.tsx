import { Music2, Upload, Home, User, Menu } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
  currentView: 'home' | 'upload' | 'profile';
  onViewChange: (view: 'home' | 'upload' | 'profile') => void;
}

export function Header({ onUploadClick, currentView, onViewChange }: HeaderProps) {
  const handleLoginClick = () => {
    window.location.href = '/login';
  };
  
  return (
    <header className="bg-gradient-to-r from-yellow-500 via-red-600 to-black text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Music2 className="w-8 h-8" />
            <div>
              <h1 className="font-bold text-xl">Adisa Music</h1>
              <p className="text-xs opacity-90">Global Distribution Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onViewChange('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'home' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5" />
              Home
            </button>
            <button
              onClick={onUploadClick}
              className="flex items-center gap-2 px-6 py-2 bg-white text-red-600 rounded-lg hover:bg-yellow-50 transition-all font-semibold"
            >
              <Upload className="w-5 h-5" />
              Upload Music
            </button>
            <button
              onClick={() => onViewChange('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentView === 'profile' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <User className="w-5 h-5" />
              Profile
            </button>
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-lg hover:bg-black/30 transition-all"
            >
              Login
            </button>
          </nav>

          <button className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
