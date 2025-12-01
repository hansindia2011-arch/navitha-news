import React, { useState, useEffect } from 'react';
import { AdBlockProps, BlockLayoutProps } from '../types';
import { Button } from './Button';
import { BLOCK_SIZE_OPTIONS } from '../constants';

interface Props extends AdBlockProps {
  onUpdateBlockDetails: (updates: Partial<AdBlockProps>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirstBlock: boolean;
  isLastBlock: boolean;
  onCompressImage: (file: File, maxWidth: number, quality: number) => Promise<string>;
  loading: boolean;
}

export const AdBlock: React.FC<Props> = ({
  adContent,
  adImageUrl,
  targetUrl,
  width = 'w-full',
  height = 'h-40',
  rotation = 0,
  onUpdateBlockDetails,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirstBlock,
  isLastBlock,
  onCompressImage,
  loading,
}) => {
  const [editingAdContent, setEditingAdContent] = useState(adContent);
  const [editingAdImageUrl, setEditingAdImageUrl] = useState(adImageUrl);
  const [editingTargetUrl, setEditingTargetUrl] = useState(targetUrl);

  useEffect(() => {
    setEditingAdContent(adContent);
    setEditingAdImageUrl(adImageUrl);
    setEditingTargetUrl(targetUrl);
  }, [adContent, adImageUrl, targetUrl]);

  const handleUpdate = (field: keyof AdBlockProps, value: any) => {
    onUpdateBlockDetails({ [field]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedBase64 = await onCompressImage(file, 600, 0.7); // Max width 600px, 70% quality
        setEditingAdImageUrl(compressedBase64);
        handleUpdate('adImageUrl', compressedBase64);
      } catch (err) {
        console.error("Image compression failed:", err);
        alert("Failed to compress image.");
      }
    }
  };

  const adBlockStyles: React.CSSProperties = {
    transform: `rotate(${rotation}deg)`,
    width: width === 'w-auto' ? 'auto' : width,
    height: height === 'h-auto' ? 'auto' : height,
  };

  return (
    <div className={`bg-white border border-yellow-400 rounded-lg p-5 shadow-sm relative group ${width} ${height}`} style={adBlockStyles}>
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button onClick={onRemove} variant="danger" small aria-label="Remove ad block" disabled={loading}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </Button>
        {!isFirstBlock && (
          <Button onClick={onMoveUp} variant="secondary" small aria-label="Move up" disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </Button>
        )}
        {!isLastBlock && (
          <Button onClick={onMoveDown} variant="secondary" small aria-label="Move down" disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </Button>
        )}
      </div>

      <p className="text-xs text-yellow-600 font-bold mb-3 uppercase">Advertisement</p>
      {editingAdImageUrl && (
        <a href={editingTargetUrl} target="_blank" rel="noopener noreferrer" className="block mb-4">
          <img src={editingAdImageUrl} alt="Advertisement" className="w-full h-auto object-cover rounded-md border border-gray-200" />
        </a>
      )}

      <div className="space-y-3">
        <textarea
          value={editingAdContent}
          onChange={(e) => { setEditingAdContent(e.target.value); handleUpdate('adContent', e.target.value); }}
          placeholder="Ad content..."
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-y text-gray-700"
          disabled={loading}
        />
        <input
          type="url"
          value={editingTargetUrl}
          onChange={(e) => { setEditingTargetUrl(e.target.value); handleUpdate('targetUrl', e.target.value); }}
          placeholder="Target URL (e.g., https://example.com)"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-700"
          disabled={loading}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad Image</label>
          <input
            type="file"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            accept="image/*"
            disabled={loading}
          />
        </div>

        {/* Layout Controls */}
        <div className="flex flex-wrap gap-2 items-center p-2 bg-gray-50 rounded-md border border-gray-200">
          <label htmlFor={`adSize-${adContent}`} className="sr-only">Block Size</label>
          <select
            id={`adSize-${adContent}`}
            value={`${width}|${height}`}
            onChange={(e) => {
              const [newWidth, newHeight] = e.target.value.split('|');
              handleUpdate('width', newWidth);
              handleUpdate('height', newHeight);
            }}
            className="p-1 rounded-md text-xs bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            {BLOCK_SIZE_OPTIONS.map(opt => (
              <option key={`${opt.width}|${opt.height}`} value={`${opt.width}|${opt.height}`}>{opt.label}</option>
            ))}
          </select>

          <label htmlFor={`adRotation-${adContent}`} className="sr-only">Rotation</label>
          <input
            type="number"
            id={`adRotation-${adContent}`}
            value={rotation}
            onChange={(e) => handleUpdate('rotation', parseFloat(e.target.value) || 0)}
            placeholder="Rot (deg)"
            className="w-20 p-1 rounded-md text-xs bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};