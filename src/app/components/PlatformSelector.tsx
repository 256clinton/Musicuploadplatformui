import { Check } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  logo: string;
  selected: boolean;
}

interface PlatformSelectorProps {
  platforms: Platform[];
  onToggle: (id: string) => void;
}

export function PlatformSelector({ platforms, onToggle }: PlatformSelectorProps) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4 text-lg">
        Select Distribution Platforms
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Choose where you want your music to be available worldwide
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onToggle(platform.id)}
            className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              platform.selected
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {platform.selected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="text-center">
              <div className="text-3xl mb-2">{platform.logo}</div>
              <p className="font-semibold text-sm">{platform.name}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4">
        ✨ All platforms included in every plan • Unlimited distribution
      </p>
    </div>
  );
}
