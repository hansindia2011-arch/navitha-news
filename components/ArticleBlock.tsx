
import React, { useState, useEffect } from 'react';
import { ArticleBlockProps, TextAlignment, BlockLayoutProps } from '../types';
import { Button } from './Button';
import { ARTICLE_CATEGORIES, TEXT_ALIGNMENT_OPTIONS, FONT_SIZE_OPTIONS, LINE_SPACING_OPTIONS, BLOCK_SIZE_OPTIONS } from '../constants';

interface Props extends ArticleBlockProps {
  onUpdateBlockDetails: (updates: Partial<ArticleBlockProps>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirstBlock: boolean;
  isLastBlock: boolean;
  onGenerateHeadline: () => Promise<void>;
  onGenerateSummary: () => Promise<void>;
  onCompressImage: (file: File, maxWidth: number, quality: number) => Promise<string>;
  loading: boolean;
}

export const ArticleBlock: React.FC<Props> = ({
  headline,
  subHeadline,
  content,
  byline,
  articleImageUrl,
  category,
  location,
  textAlignment = 'left',
  fontSize = 'text-base',
  lineSpacing = 'leading-normal',
  width = 'w-full',
  height = 'h-auto',
  rotation = 0,
  onUpdateBlockDetails,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirstBlock,
  isLastBlock,
  onGenerateHeadline,
  onGenerateSummary,
  onCompressImage,
  loading,
}) => {
  const [editingContent, setEditingContent] = useState(content);
  const [editingHeadline, setEditingHeadline] = useState(headline);
  const [editingSubHeadline, setEditingSubHeadline] = useState(subHeadline);
  const [editingByline, setEditingByline] = useState(byline);
  const [editingCategory, setEditingCategory] = useState(category);
  const [editingLocation, setEditingLocation] = useState(location);
  const [currentArticleImageUrl, setCurrentArticleImageUrl] = useState(articleImageUrl);
  
  useEffect(() => {
    setEditingContent(content);
    setEditingHeadline(headline);
    setEditingSubHeadline(subHeadline);
    setEditingByline(byline);
    setEditingCategory(category);
    setEditingLocation(location);
    setCurrentArticleImageUrl(articleImageUrl);
  }, [content, headline, subHeadline, byline, category, location, articleImageUrl]);

  const handleUpdate = (field: keyof ArticleBlockProps, value: any) => {
    onUpdateBlockDetails({ [field]: value });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingContent(e.target.value);
    handleUpdate('content', e.target.value);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressedBase64 = await onCompressImage(file, 800, 0.8); // Max width 800px, 80% quality
        setCurrentArticleImageUrl(compressedBase64);
        handleUpdate('articleImageUrl', compressedBase64);
      } catch (err) {
        console.error("Image compression failed:", err);
        alert("Failed to compress image.");
      }
    }
  };

  const articleBlockStyles: React.CSSProperties = {
    transform: `rotate(${rotation}deg)`,
    width: width === 'w-auto' ? 'auto' : width, // Apply width directly
    height: height === 'h-auto' ? 'auto' : height, // Apply height directly
  };


  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-5 shadow-sm relative group ${width} ${height}`} style={articleBlockStyles}>
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button onClick={onRemove} variant="danger" small aria-label="Remove article" disabled={loading}>
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

      <div className="space-y-3 mb-4">
        <input
          type="text"
          value={editingHeadline}
          onChange={(e) => { setEditingHeadline(e.target.value); handleUpdate('headline', e.target.value); }}
          placeholder="Article Headline"
          className="w-full text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 focus:outline-none focus:border-blue-500 transition-colors"
          disabled={loading}
        />
        <input
          type="text"
          value={editingSubHeadline}
          onChange={(e) => { setEditingSubHeadline(e.target.value); handleUpdate('subHeadline', e.target.value); }}
          placeholder="Sub-Headline"
          className="w-full text-base text-gray-700 border-b border-gray-100 pb-1 focus:outline-none focus:border-blue-500 transition-colors"
          disabled={loading}
        />
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          <input
            type="text"
            value={editingByline}
            onChange={(e) => { setEditingByline(e.target.value); handleUpdate('byline', e.target.value); }}
            placeholder="Byline"
            className="flex-1 min-w-[100px] focus:outline-none focus:border-blue-500 transition-colors p-1 rounded-sm border border-gray-200"
            disabled={loading}
          />
          <input
            type="text"
            value={editingLocation}
            onChange={(e) => { setEditingLocation(e.target.value); handleUpdate('location', e.target.value); }}
            placeholder="Location"
            className="flex-1 min-w-[100px] focus:outline-none focus:border-blue-500 transition-colors p-1 rounded-sm border border-gray-200"
            disabled={loading}
          />
          <select
            value={editingCategory}
            onChange={(e) => { setEditingCategory(e.target.value); handleUpdate('category', e.target.value); }}
            className="flex-1 min-w-[100px] p-1 rounded-md bg-white border border-gray-200 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            disabled={loading}
          >
            {ARTICLE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {currentArticleImageUrl && (
        <div className="mb-4">
          <img src={currentArticleImageUrl} alt="Article visual" className="w-full h-auto object-cover rounded-md border border-gray-200" />
          <Button onClick={() => handleUpdate('articleImageUrl', undefined)} variant="danger" small className="mt-2">Remove Image</Button>
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Article Image</label>
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

      {/* Text Formatting Controls */}
      <div className="mb-4 flex flex-wrap gap-2 items-center p-2 bg-gray-50 rounded-md border border-gray-200">
        <label htmlFor={`align-${headline}`} className="sr-only">Text Alignment</label>
        <select
          id={`align-${headline}`}
          value={textAlignment}
          onChange={(e) => handleUpdate('textAlignment', e.target.value as TextAlignment)}
          className="p-1 rounded-md text-xs bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          {TEXT_ALIGNMENT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>

        <label htmlFor={`fontSize-${headline}`} className="sr-only">Font Size</label>
        <select
          id={`fontSize-${headline}`}
          value={fontSize}
          onChange={(e) => handleUpdate('fontSize', e.target.value)}
          className="p-1 rounded-md text-xs bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          {FONT_SIZE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>

        <label htmlFor={`lineSpacing-${headline}`} className="sr-only">Line Spacing</label>
        <select
          id={`lineSpacing-${headline}`}
          value={lineSpacing}
          onChange={(e) => handleUpdate('lineSpacing', e.target.value)}
          className="p-1 rounded-md text-xs bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        >
          {LINE_SPACING_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        
        {/* Basic layout controls */}
        <label htmlFor={`size-${headline}`} className="sr-only">Block Size</label>
        <select
          id={`size-${headline}`}
          value={`${width}|${height}`} // Combine for selection
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

        <label htmlFor={`rotation-${headline}`} className="sr-only">Rotation</label>
        <input
          type="number"
          id={`rotation-${headline}`}
          value={rotation}
          onChange={(e) => handleUpdate('rotation', parseFloat(e.target.value) || 0)}
          placeholder="Rot (deg)"
          className="w-20 p-1 rounded-md text-xs bg-white border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        />

      </div>

      <textarea
        value={editingContent}
        onChange={handleContentChange}
        placeholder="Write your article content here..."
        rows={8}
        className={`w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-gray-700 ${fontSize} ${lineSpacing} text-${textAlignment}`}
        disabled={loading}
        style={{ textAlign: textAlignment }} // Ensure text alignment for browsers
      />
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <Button onClick={onGenerateHeadline} variant="outline" small disabled={loading || !editingContent.trim()}>
          AI Headline
        </Button>
        <Button onClick={onGenerateSummary} variant="outline" small disabled={loading || !editingContent.trim()}>
          AI Summary
        </Button>
      </div>
    </div>
  );
};