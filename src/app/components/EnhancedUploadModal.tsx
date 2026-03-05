import { X, Upload, Music, Image, Loader2, ArrowLeft, ArrowRight, Calendar, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DistributionSteps } from './DistributionSteps';
import { PlatformSelector } from './PlatformSelector';
import { PaymentPlans } from './PaymentPlans';
import { projectId } from '../../../utils/supabase/info';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (track: any) => void;
}

interface TrackInAlbum {
  id: string;
  title: string;
  audioFile: File | null;
  duration: string;
}

export function EnhancedUploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Track Info & Audio
  const [releaseType, setReleaseType] = useState<'single' | 'album' | 'ep'>('single');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Afrobeat');
  const [language, setLanguage] = useState('English');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [albumTracks, setAlbumTracks] = useState<TrackInAlbum[]>([
    { id: '1', title: '', audioFile: null, duration: '0:00' }
  ]);
  
  // Step 2: Platforms
  const [platforms, setPlatforms] = useState([
    { id: 'spotify', name: 'Spotify', logo: '🎵', selected: true },
    { id: 'apple', name: 'Apple Music', logo: '🍎', selected: true },
    { id: 'youtube', name: 'YouTube Music', logo: '▶️', selected: true },
    { id: 'amazon', name: 'Amazon Music', logo: '📦', selected: true },
    { id: 'deezer', name: 'Deezer', logo: '🎧', selected: true },
    { id: 'tidal', name: 'Tidal', logo: '🌊', selected: true },
    { id: 'boomplay', name: 'Boomplay', logo: '💥', selected: true },
    { id: 'audiomack', name: 'Audiomack', logo: '🎤', selected: true },
    { id: 'pandora', name: 'Pandora', logo: '📻', selected: false },
  ]);
  
  // Step 3: Metadata & Assets
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [songwriters, setSongwriters] = useState(['']);
  const [producers, setProducers] = useState(['']);
  const [lyrics, setLyrics] = useState('');
  const [isExplicit, setIsExplicit] = useState(false);
  const [isrc, setIsrc] = useState('');
  const [upc, setUpc] = useState('');
  const [copyrightHolder, setCopyrightHolder] = useState('');
  const [publishingRights, setPublishingRights] = useState('');
  
  // Step 4: Payment Plan
  const [selectedPlan, setSelectedPlan] = useState('single');
  
  // UI State
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadEligibility, setUploadEligibility] = useState({
    freeUploadsRemaining: 2,
    requiresPayment: false,
    freeUploadsUsed: 0
  });

  // Check upload eligibility
  useEffect(() => {
    const checkEligibility = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      try {
        const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
        const response = await fetch(`${apiUrl}/upload/check`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          setUploadEligibility({
            freeUploadsRemaining: data.freeUploadsRemaining,
            requiresPayment: data.requiresPayment,
            freeUploadsUsed: data.freeUploadsUsed
          });
        }
      } catch (error) {
        console.error('Error checking upload eligibility:', error);
      }
    };

    if (isOpen) {
      checkEligibility();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image dimensions
      const img = new window.Image();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        img.src = result;
        img.onload = () => {
          if (img.width < 3000 || img.height < 3000) {
            setError('Cover art must be at least 3000x3000 pixels for optimal quality');
          } else {
            setError('');
          }
          setCoverPreview(result);
        };
      };
      reader.readAsDataURL(file);
      setCoverFile(file);
    }
  };

  const handleAlbumTrackChange = (id: string, field: 'title' | 'audioFile', value: any) => {
    setAlbumTracks(albumTracks.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const addAlbumTrack = () => {
    setAlbumTracks([...albumTracks, { 
      id: Date.now().toString(), 
      title: '', 
      audioFile: null, 
      duration: '0:00' 
    }]);
  };

  const removeAlbumTrack = (id: string) => {
    if (albumTracks.length > 1) {
      setAlbumTracks(albumTracks.filter(t => t.id !== id));
    }
  };

  const addSongwriter = () => setSongwriters([...songwriters, '']);
  const removeSongwriter = (index: number) => {
    if (songwriters.length > 1) {
      setSongwriters(songwriters.filter((_, i) => i !== index));
    }
  };
  const updateSongwriter = (index: number, value: string) => {
    const updated = [...songwriters];
    updated[index] = value;
    setSongwriters(updated);
  };

  const addProducer = () => setProducers([...producers, '']);
  const removeProducer = (index: number) => {
    if (producers.length > 1) {
      setProducers(producers.filter((_, i) => i !== index));
    }
  };
  const updateProducer = (index: number, value: string) => {
    const updated = [...producers];
    updated[index] = value;
    setProducers(updated);
  };

  const handlePlatformToggle = (id: string) => {
    setPlatforms(platforms.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');

    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      setError('Please log in to upload tracks');
      setIsUploading(false);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    try {
      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
      const selectedPlatformNames = platforms.filter(p => p.selected).map(p => p.name);

      const trackData = {
        title,
        artist,
        genre,
        language,
        coverUrl: coverPreview || 'https://images.unsplash.com/photo-1658758158146-4f91c3b16ce5',
        releaseType,
        releaseDate,
        songwriters: songwriters.filter(s => s.trim()),
        producers: producers.filter(p => p.trim()),
        lyrics,
        isExplicit,
        isrc,
        upc,
        copyrightHolder,
        publishingRights,
        platforms: selectedPlatformNames,
        plan: selectedPlan,
        albumTracks: releaseType !== 'single' ? albumTracks : undefined,
      };

      const response = await fetch(`${apiUrl}/tracks/enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(trackData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload track');
      }

      onUpload({
        title,
        artist,
        genre,
        coverUrl: coverPreview,
        audioFile,
      });

      // Reset form
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Error uploading track:', err);
      setError(err.message || 'Failed to upload track');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setTitle('');
    setArtist('');
    setGenre('Afrobeat');
    setAudioFile(null);
    setCoverPreview('');
    setSongwriters(['']);
    setProducers(['']);
    setLyrics('');
    setReleaseDate('');
  };

  const canProceed = () => {
    if (currentStep === 1) {
      if (releaseType === 'single') {
        return title && artist && audioFile;
      } else {
        return title && artist && albumTracks.every(t => t.title && t.audioFile);
      }
    }
    if (currentStep === 2) {
      return platforms.some(p => p.selected);
    }
    if (currentStep === 3) {
      return coverFile && releaseDate;
    }
    if (currentStep === 4) {
      return selectedPlan !== '';
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-8">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500 via-red-600 to-black text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">Professional Music Distribution</h2>
              <p className="text-sm opacity-90">Complete workflow • Global reach • 100% royalties</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-2 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <DistributionSteps currentStep={currentStep} />

          {/* Free uploads indicator */}
          {uploadEligibility.freeUploadsRemaining > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              🎉 You have {uploadEligibility.freeUploadsRemaining} free upload{uploadEligibility.freeUploadsRemaining > 1 ? 's' : ''} remaining!
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8">
            {/* Step 1: Track Information & Upload */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Release Information</h3>
                
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Release Type *</label>
                  <div className="flex gap-4">
                    {(['single', 'ep', 'album'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setReleaseType(type)}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          releaseType === type
                            ? 'bg-gradient-to-r from-yellow-500 to-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'single' ? 'Single Track' : type === 'ep' ? 'EP (2-6 tracks)' : 'Album (7+ tracks)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    {releaseType === 'single' ? 'Track Title' : 'Album/EP Title'} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                    placeholder={releaseType === 'single' ? 'Enter song title' : 'Enter album/EP title'}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Primary Artist *</label>
                    <input
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                      placeholder="Your artist name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Genre *</label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                      required
                    >
                      <option>Afrobeat</option>
                      <option>Dancehall</option>
                      <option>Ragga</option>
                      <option>Gospel</option>
                      <option>Hip Hop</option>
                      <option>RnB</option>
                      <option>Traditional</option>
                      <option>Kadongo Kamu</option>
                      <option>Pop</option>
                      <option>Jazz</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                  >
                    <option>English</option>
                    <option>Luganda</option>
                    <option>Swahili</option>
                    <option>Runyankole</option>
                    <option>Acholi</option>
                    <option>Ateso</option>
                    <option>Lusoga</option>
                    <option>Other</option>
                  </select>
                </div>

                {releaseType === 'single' ? (
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Audio File (WAV recommended) *</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                      <Music className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioChange}
                        className="hidden"
                        id="audio-upload"
                        required
                      />
                      <label htmlFor="audio-upload" className="cursor-pointer">
                        {audioFile ? (
                          <p className="text-green-600 font-semibold">{audioFile.name}</p>
                        ) : (
                          <>
                            <p className="font-semibold text-gray-700">Click to upload audio</p>
                            <p className="text-sm text-gray-500 mt-1">WAV, MP3, or M4A (Max 50MB)</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block font-semibold text-gray-700">Track Listing *</label>
                      <button
                        type="button"
                        onClick={addAlbumTrack}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Add Track
                      </button>
                    </div>
                    <div className="space-y-4">
                      {albumTracks.map((track, index) => (
                        <div key={track.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                          <span className="font-bold text-gray-500 mt-3">{index + 1}.</span>
                          <div className="flex-1 space-y-3">
                            <input
                              type="text"
                              value={track.title}
                              onChange={(e) => handleAlbumTrackChange(track.id, 'title', e.target.value)}
                              placeholder="Track title"
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                              required
                            />
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAlbumTrackChange(track.id, 'audioFile', file);
                              }}
                              className="w-full text-sm"
                              required
                            />
                          </div>
                          {albumTracks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAlbumTrack(track.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Platform Selection */}
            {currentStep === 2 && (
              <PlatformSelector platforms={platforms} onToggle={handlePlatformToggle} />
            )}

            {/* Step 3: Metadata & Assets */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Metadata & Assets</h3>
                
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Cover Artwork (3000x3000px minimum) *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                    {coverPreview ? (
                      <div>
                        <img src={coverPreview} alt="Cover preview" className="w-48 h-48 mx-auto rounded-lg object-cover mb-3" />
                        <p className="text-sm text-gray-600">Click to change</p>
                      </div>
                    ) : (
                      <Image className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                      id="cover-upload"
                      required
                    />
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      <p className="font-semibold text-gray-700">Upload Cover Art</p>
                      <p className="text-sm text-gray-500 mt-1">JPG or PNG • 3000x3000px required</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Release Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    💡 Tip: Submit at least 4 weeks before release date for playlist consideration
                  </p>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Songwriters</label>
                  <div className="space-y-2">
                    {songwriters.map((writer, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={writer}
                          onChange={(e) => updateSongwriter(index, e.target.value)}
                          placeholder="Songwriter name"
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                        />
                        {songwriters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSongwriter(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSongwriter}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Songwriter
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Producers</label>
                  <div className="space-y-2">
                    {producers.map((producer, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={producer}
                          onChange={(e) => updateProducer(index, e.target.value)}
                          placeholder="Producer name"
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                        />
                        {producers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProducer(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addProducer}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Producer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Lyrics (Optional)</label>
                  <textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none resize-none"
                    placeholder="Paste your lyrics here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Copyright Holder</label>
                    <input
                      type="text"
                      value={copyrightHolder}
                      onChange={(e) => setCopyrightHolder(e.target.value)}
                      placeholder="© 2026 Artist Name"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">Publishing Rights</label>
                    <input
                      type="text"
                      value={publishingRights}
                      onChange={(e) => setPublishingRights(e.target.value)}
                      placeholder="℗ 2026 Label Name"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">ISRC Code (if available)</label>
                    <input
                      type="text"
                      value={isrc}
                      onChange={(e) => setIsrc(e.target.value)}
                      placeholder="US-XXX-XX-XXXXX"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">UPC/EAN (if available)</label>
                    <input
                      type="text"
                      value={upc}
                      onChange={(e) => setUpc(e.target.value)}
                      placeholder="123456789012"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="explicit"
                    checked={isExplicit}
                    onChange={(e) => setIsExplicit(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <label htmlFor="explicit" className="font-semibold text-gray-700">
                    This track contains explicit content
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Payment Plan */}
            {currentStep === 4 && (
              <PaymentPlans selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Review Your Submission</h3>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                  {/* Release Info */}
                  <div className="flex gap-4">
                    {coverPreview && (
                      <img src={coverPreview} alt="Cover" className="w-32 h-32 rounded-lg object-cover shadow-lg" />
                    )}
                    <div className="flex-1">
                      <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-2">
                        {releaseType.toUpperCase()}
                      </div>
                      <h4 className="font-bold text-2xl mb-1">{title}</h4>
                      <p className="text-gray-600 text-lg">{artist}</p>
                      <p className="text-sm text-gray-500 mt-1">{genre} • {language}</p>
                      {isExplicit && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                          EXPLICIT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Track Listing for Albums/EPs */}
                  {releaseType !== 'single' && (
                    <div className="border-t pt-4">
                      <p className="font-semibold mb-3">Track Listing ({albumTracks.length} tracks):</p>
                      <div className="space-y-2">
                        {albumTracks.map((track, index) => (
                          <div key={track.id} className="flex items-center gap-3 text-sm">
                            <span className="text-gray-500 font-mono">{index + 1}.</span>
                            <span className="flex-1">{track.title || 'Untitled'}</span>
                            <span className="text-gray-500">{track.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Credits */}
                  {(songwriters.some(s => s) || producers.some(p => p)) && (
                    <div className="border-t pt-4">
                      <p className="font-semibold mb-2">Credits:</p>
                      {songwriters.some(s => s) && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Songwriters:</span> {songwriters.filter(s => s).join(', ')}
                        </p>
                      )}
                      {producers.some(p => p) && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Producers:</span> {producers.filter(p => p).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Distribution Info */}
                  <div className="border-t pt-4">
                    <p className="font-semibold mb-2">Release Date:</p>
                    <p className="text-gray-700">{new Date(releaseDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold mb-3">Distribution Platforms ({platforms.filter(p => p.selected).length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {platforms.filter(p => p.selected).map(p => (
                        <span key={p.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {p.logo} {p.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold mb-2">Plan:</p>
                    <div className="px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg inline-block font-semibold">
                      {selectedPlan === 'single' && '15,000 UGX - Single Track'}
                      {selectedPlan === 'album' && '45,000 UGX - EP/Album'}
                      {selectedPlan === 'unlimited' && '120,000 UGX/year - Unlimited'}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="font-semibold text-blue-900 mb-3">📋 What happens next?</p>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          Complete payment via Mobile Money (MTN/Airtel) or Card
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          Our quality control team reviews your submission (1-2 business days)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          Your music goes live on all selected platforms on release date
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          Track performance and earnings in your dashboard
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 font-bold">✓</span>
                          Receive 100% of your streaming royalties
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 mt-6 border-t">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit & Proceed to Payment
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
