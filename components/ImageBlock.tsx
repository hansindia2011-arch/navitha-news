
import React, { useState, useEffect } from 'react';
import { ImageBlockProps, BlockLayoutProps } from '../types';
import { Button } from './Button';
import { BLOCK_SIZE_OPTIONS } from '../constants';

interface Props extends ImageBlockProps {
  onUpdateBlockDetails: (updates: Partial<ImageBlockProps>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirstBlock: boolean;
  isLastBlock: boolean;
  onGenerateImage: (prompt: string) => Promise<void>;
  onCaptureCameraImage: (width: number, height: number, text: string) => string; // Simulated camera
  onCompressImage: (file: File, maxWidth: number, quality: number) => Promise<string>;
  loading: boolean;
}

export const ImageBlock: React.FC<Props> = ({
  imageUrl,
  caption,
  width = 'w-1/2',
  height = 'h-48',
  rotation = 0,
  onUpdateBlockDetails,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirstBlock,
  isLastBlock,
  onGenerateImage,
  onCaptureCameraImage,
  onCompressImage,
  loading,
}) => {
  const [editingCaption, setEditingCaption] = useState(caption);
  const [imageGenerationPrompt, setImageGenerationPrompt] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  useEffect(() => {
    setEditingCaption(caption);
    setCurrentImageUrl(imageUrl);
  }, [caption, imageUrl]);

  const handleUpdate = (field: keyof ImageBlockProps, value: any) => {
    onUpdateBlockDetails({ [field]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedBase64 = await onCompressImage(file, 1000, 0.9); // Max width 1000px, 90% quality
        setCurrentImageUrl(compressedBase64);
        handleUpdate('imageUrl', compressedBase64);
      } catch (err) {
        console.error("Image compression failed:", err);
        alert("Failed to compress image.");
      }
    }
  };

  const handleCaptureCamera = () => {
    // Simulate camera capture
    const capturedImage = onCaptureCameraImage(640, 480, 'Captured Image'); // Placeholder image
    setCurrentImageUrl(capturedImage);
    handleUpdate('imageUrl', capturedImage);
    alert('Simulated camera capture!');
  };

  // Fix: Define handleGenerateImageClick to use the onGenerateImage prop
  const handleGenerateImageClick = () => {
    onGenerateImage(imageGenerationPrompt);
  };

  const imageBlockStyles: React.CSSProperties = {
    transform: `rotate(${rotation}deg)`,
    width: width === 'w-auto' ? 'auto' : width,
    height: height === 'h-auto' ? 'auto' : height,
  };


  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-5 shadow-sm relative group ${width} ${height}`} style={imageBlockStyles}>
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button onClick={onRemove} variant="danger" small aria-label="Remove image" disabled={loading}>
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

      <div className="mb-4">
        {currentImageUrl && (
          <img
            src={currentImageUrl}
            alt={editingCaption || 'E-Paper Image'}
            className="w-full h-auto object-cover rounded-md mb-3 border border-gray-200"
          />
        )}
        <input
          type="text"
          value={editingCaption}
          onChange={(e) => { setEditingCaption(e.target.value); handleUpdate('caption', e.target.value); }}
          placeholder="Image Caption"
          className="w-full text-sm text-gray-700 focus:outline-none focus:border-blue-500 transition-colors p-1 rounded-sm border border-gray-200"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <label className="block text-sm font-medium text-gray-700">Upload Image</label>
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
        <Button onClick={handleCaptureCamera} variant="outline" small disabled={loading}>
          Capture from Camera (Simulated)
        </Button>
      </div>

      {/* Layout Controls */}
      <div className="mb-4 flex flex-wrap gap-2 items-center p-2 bg-gray-50 rounded-md border border-gray-200">
        <label htmlFor={`size-${imageUrl}`} className="sr-only">Block Size</label>
        <select
          id={`size-${imageUrl}`}
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

        <label htmlFor={`rotation-${imageUrl}`} className="sr-only">Rotation</label>
        <input
          type="number"
          id={`rotation-${imageUrl}`}
          value={rotation}
          onChange={(e) => handleUpdate('rotation', parseFloat(e.target.value) || 0)}
          placeholder="Rot (deg)"
          className="w-20 p-1 rounded-md text-xs bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={imageGenerationPrompt}
          onChange={(e) => setImageGenerationPrompt(e.target.value)}
          placeholder="AI Image prompt (e.g., 'a cat reading a newspaper')"
          className="flex-1 p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <Button onClick={handleGenerateImageClick} variant="primary" small disabled={loading || !imageGenerationPrompt.trim()}>
          Generate AI Image
        </Button>
      </div>
    </div>
  );
};