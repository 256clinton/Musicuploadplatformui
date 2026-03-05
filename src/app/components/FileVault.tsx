import { Download, FileAudio, Image, FileText, File, Calendar, HardDrive } from 'lucide-react';
import { useState } from 'react';

interface VaultFile {
  id: string;
  name: string;
  type: 'audio' | 'artwork' | 'report' | 'document';
  size: string;
  uploadDate: string;
  downloadUrl: string;
}

interface FileVaultProps {
  trackId: string;
  trackTitle: string;
}

export function FileVault({ trackId, trackTitle }: FileVaultProps) {
  const [files] = useState<VaultFile[]>([
    {
      id: '1',
      name: `${trackTitle} - Master.wav`,
      type: 'audio',
      size: '42.3 MB',
      uploadDate: '2026-02-15',
      downloadUrl: '#'
    },
    {
      id: '2',
      name: `${trackTitle} - Cover Art 3000x3000.png`,
      type: 'artwork',
      size: '8.7 MB',
      uploadDate: '2026-02-15',
      downloadUrl: '#'
    },
    {
      id: '3',
      name: `${trackTitle} - Radio Edit.mp3`,
      type: 'audio',
      size: '8.2 MB',
      uploadDate: '2026-02-15',
      downloadUrl: '#'
    },
    {
      id: '4',
      name: 'Distribution Report - February 2026.pdf',
      type: 'report',
      size: '124 KB',
      uploadDate: '2026-03-01',
      downloadUrl: '#'
    },
    {
      id: '5',
      name: 'Royalty Statement - Q1 2026.pdf',
      type: 'report',
      size: '89 KB',
      uploadDate: '2026-03-05',
      downloadUrl: '#'
    },
  ]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <FileAudio className="w-8 h-8 text-purple-600" />;
      case 'artwork':
        return <Image className="w-8 h-8 text-pink-600" />;
      case 'report':
        return <FileText className="w-8 h-8 text-blue-600" />;
      default:
        return <File className="w-8 h-8 text-gray-600" />;
    }
  };

  const getFileTypeLabel = (type: string) => {
    const labels = {
      audio: 'Audio File',
      artwork: 'Artwork',
      report: 'Report',
      document: 'Document'
    };
    return labels[type as keyof typeof labels] || 'File';
  };

  const handleDownload = (file: VaultFile) => {
    // In production, this would trigger actual file download
    console.log('Downloading:', file.name);
  };

  const handleDownloadAll = () => {
    console.log('Downloading all files as ZIP');
  };

  const totalSize = files.reduce((sum, file) => {
    const size = parseFloat(file.size);
    const unit = file.size.includes('MB') ? 1 : 0.001;
    return sum + (size * unit);
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-xl flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-green-600" />
            File Vault
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Access all your original files and reports for "{trackTitle}"
          </p>
        </div>
        <button
          onClick={handleDownloadAll}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download All
        </button>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <FileAudio className="w-8 h-8 text-purple-600 mb-2" />
          <p className="text-sm text-gray-600">Audio Files</p>
          <p className="text-2xl font-bold text-purple-600">
            {files.filter(f => f.type === 'audio').length}
          </p>
        </div>
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <Image className="w-8 h-8 text-pink-600 mb-2" />
          <p className="text-sm text-gray-600">Artwork</p>
          <p className="text-2xl font-bold text-pink-600">
            {files.filter(f => f.type === 'artwork').length}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <FileText className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">Reports</p>
          <p className="text-2xl font-bold text-blue-600">
            {files.filter(f => f.type === 'report').length}
          </p>
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all group"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-white rounded-lg border-2 border-gray-200 group-hover:border-green-300 transition-all">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{file.name}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-500">{getFileTypeLabel(file.type)}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{file.size}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDownload(file)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 opacity-0 group-hover:opacity-100"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        ))}
      </div>

      {/* Storage Info */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Storage Used</h4>
          <p className="text-2xl font-bold text-green-600">{totalSize.toFixed(1)} MB</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all"
            style={{ width: `${Math.min((totalSize / 500) * 100, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {(500 - totalSize).toFixed(1)} MB remaining of 500 MB storage
        </p>
      </div>

      {/* Important Info */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-3">📦 File Retention Policy</h4>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 font-bold">•</span>
            All original files are stored securely for the lifetime of your account
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 font-bold">•</span>
            Monthly distribution reports are automatically added to your vault
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 font-bold">•</span>
            Download files anytime - no expiration or download limits
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 font-bold">•</span>
            Upgrade for additional storage space and advanced file management
          </li>
        </ul>
      </div>
    </div>
  );
}
