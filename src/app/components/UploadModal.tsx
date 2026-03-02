import { X, Upload, Music, Image, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DistributionSteps } from './DistributionSteps';
import { PlatformSelector } from './PlatformSelector';
import { PaymentPlans } from './PaymentPlans';
import { PaymentModal } from './PaymentModal';
import { projectId } from '../../../utils/supabase/info';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (track: {
    title: string;
    artist: string;
    genre: string;
    coverUrl: string;
    audioFile: File | null;
  }) => void;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Afrobeat');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('album');
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploadEligibility, setUploadEligibility] = useState({
    freeUploadsRemaining: 2,
    requiresPayment: false,
    freeUploadsUsed: 0
  });
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

  // Check upload eligibility when modal opens
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setCoverFile(file);
    }
  };

  const handlePlatformToggle = (id: string) => {
    setPlatforms(platforms.map(p => 
      p.id === id ? { ...p, selected: !p.selected } : p
    ));
  };

  const handleNext = () => {
    if (currentStep < 4) {
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
    
    // Check if user is logged in
    if (!accessToken) {
      setError('Please log in to upload tracks');
      setIsUploading(false);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    try {
      const planAmounts = {
        single: '15,000 UGX',
        album: '45,000 UGX',
        unlimited: '120,000 UGX'
      };

      const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d629660d`;
      const selectedPlatformNames = platforms.filter(p => p.selected).map(p => p.name);

      const response = await fetch(`${apiUrl}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title,
          artist,
          genre,
          coverUrl: coverPreview || 'https://images.unsplash.com/photo-1658758158146-4f91c3b16ce5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwbXVzaWMlMjBzdHVkaW98ZW58MXx8fHwxNzcxNjE3MTUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
          duration: '3:30',
          plan: selectedPlan,
          amount: planAmounts[selectedPlan as keyof typeof planAmounts],
          platforms: selectedPlatformNames
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload track');
      }

      // Call the onUpload callback for UI update
      onUpload({
        title,
        artist,
        genre,
        coverUrl: coverPreview || 'https://images.unsplash.com/photo-1658758158146-4f91c3b16ce5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwbXVzaWMlMjBzdHVkaW98ZW58MXx8fHwxNzcxNjE3MTUzfDA&ixlib=rb-4.1.0&q=80&w=1080',
        audioFile,
      });

      // Reset form
      setTitle('');
      setArtist('');
      setGenre('Afrobeat');
      setAudioFile(null);
      setCoverPreview('');
      setCurrentStep(1);
      onClose();
    } catch (err: any) {
      console.error('Error uploading track:', err);
      setError(err.message || 'Failed to upload track');
    } finally {
      setIsUploading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return title && artist && audioFile;
    }
    if (currentStep === 2) {
      return platforms.some(p => p.selected);
    }
    if (currentStep === 3) {
      return selectedPlan !== '';
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-gradient-to-r from-yellow-500 via-red-600 to-black text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">Global Music Distribution</h2>
              <p className="text-sm opacity-90">Upload and distribute worldwide</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-lg p-2 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <DistributionSteps currentStep={currentStep} />

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8">
            {/* Step 1: Upload Track */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Track Information</h3>
                
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Track Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                    placeholder="Enter song title"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Artist Name *</label>
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
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Audio File *</label>
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
                          <p className="text-sm text-gray-500 mt-1">MP3, WAV, or M4A (Max 50MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Cover Art *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover preview" className="w-32 h-32 mx-auto rounded-lg object-cover" />
                    ) : (
                      <Image className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label htmlFor="cover-upload" className="cursor-pointer">
                      <p className="font-semibold text-gray-700">Click to upload cover</p>
                      <p className="text-sm text-gray-500 mt-1">JPG or PNG (Required: 3000x3000px minimum)</p>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Platforms */}
            {currentStep === 2 && (
              <PlatformSelector platforms={platforms} onToggle={handlePlatformToggle} />
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <PaymentPlans selectedPlan={selectedPlan} onSelectPlan={setSelectedPlan} />
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Review Your Submission</h3>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex gap-4">
                    {coverPreview && (
                      <img src={coverPreview} alt="Cover" className="w-24 h-24 rounded-lg object-cover" />
                    )}
                    <div>
                      <h4 className="font-bold text-xl">{title}</h4>
                      <p className="text-gray-600">{artist}</p>
                      <p className="text-sm text-gray-500">{genre}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold mb-2">Distribution Platforms:</p>
                    <div className="flex flex-wrap gap-2">
                      {platforms.filter(p => p.selected).map(p => (
                        <span key={p.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {p.logo} {p.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold mb-2">Selected Plan:</p>
                    <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg inline-block font-semibold">
                      {selectedPlan === 'single' && '15,000 UGX - Single Track'}
                      {selectedPlan === 'album' && '45,000 UGX - EP/Album'}
                      {selectedPlan === 'unlimited' && '120,000 UGX/year - Unlimited Plan'}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="font-semibold text-blue-900 mb-2">📋 What happens next?</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Complete payment via Mobile Money or Card</li>
                        <li>✓ Our team reviews your submission (quality check)</li>
                        <li>✓ Your music goes live on all selected platforms</li>
                        <li>✓ Start earning 100% of your royalties</li>
                        <li>✓ Track your performance in analytics dashboard</li>
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
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
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
                      Proceed to Payment
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