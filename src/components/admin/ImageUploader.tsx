import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Check, X, Loader2 } from 'lucide-react';
import { cmsApi } from '../../services/cmsApi';

interface ImageUploaderProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label = 'Image',
  value,
  onChange,
  helperText
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirectUrlMode, setIsDirectUrlMode] = useState(false);
  const [directUrlInput, setDirectUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Selected file must be an image.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await cmsApi.uploadImage(base64, file.name);
          onChange(res.url);
          setDirectUrlInput(res.url);
        } catch (uploadErr: any) {
          setError(uploadErr.message || 'Image upload failed.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Error reading image file.');
      setIsUploading(false);
    }
  };

  const applyDirectUrl = () => {
    if (directUrlInput.trim()) {
      onChange(directUrlInput.trim());
      setIsDirectUrlMode(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsDirectUrlMode(!isDirectUrlMode)}
          className="text-[11px] text-amber-400 hover:text-amber-300 transition"
        >
          {isDirectUrlMode ? 'Switch to Upload' : 'Enter Direct Image URL'}
        </button>
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      {isDirectUrlMode ? (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://example.com/photo.jpg or /uploads/..."
            value={directUrlInput}
            onChange={e => setDirectUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={applyDirectUrl}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Apply
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-3 bg-stone-950 border border-stone-800 rounded-2xl">
          {/* Thumbnail preview */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 shrink-0 flex items-center justify-center">
            {value ? (
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setError('Unable to load image from URL.')}
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-stone-600" />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-stone-950/80 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-stone-300 truncate font-mono">
              {value ? value.split('/').pop() : 'No image chosen'}
            </p>
            {helperText && <p className="text-[11px] text-stone-500 mt-0.5">{helperText}</p>}
            <div className="flex items-center gap-2 mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 rounded-lg transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{value ? 'Replace Image' : 'Upload Image'}</span>
              </button>

              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setDirectUrlInput('');
                  }}
                  className="p-1.5 text-stone-500 hover:text-red-400 transition"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
