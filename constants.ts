import { EPaperConfig, EPaperLanguage } from './types';

export const DEFAULT_EPAPER_CONFIG: EPaperConfig = {
  modelName: 'gemini-2.5-flash',
  imageModelName: 'gemini-2.5-flash-image',
  temperature: 0.7,
  topK: 64,
  topP: 0.95,
};

export const SECTION_TYPES = [
  { id: 'main-news', name: 'Main News' },
  { id: 'local-news', name: 'Local News' },
  { id: 'sports', name: 'Sports' },
  { id: 'editorial', name: 'Editorial' },
  { id: 'features', name: 'Features' },
  { id: 'advertisement', name: 'Advertisement' },
];

export const AVAILABLE_TEXT_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview' },
];

export const AVAILABLE_IMAGE_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image' },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image Preview' },
];

export const ARTICLE_CATEGORIES = [
  'Local News', 'National', 'International', 'Sports', 'Technology',
  'Health', 'Politics', 'Business', 'Entertainment', 'Editorial'
];

export const TEXT_ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
  { value: 'justify', label: 'Justify' },
];

export const FONT_SIZE_OPTIONS = [
  { value: 'text-sm', label: 'Small' },
  { value: 'text-base', label: 'Normal' },
  { value: 'text-lg', label: 'Large' },
  { value: 'text-xl', label: 'X-Large' },
];

export const LINE_SPACING_OPTIONS = [
  { value: 'leading-tight', label: 'Tight' },
  { value: 'leading-normal', label: 'Normal' },
  { value: 'leading-relaxed', label: 'Relaxed' },
];

export const BLOCK_SIZE_OPTIONS = [
  { width: 'w-full', height: 'h-auto', label: 'Full Width / Auto Height' },
  { width: 'w-1/2', height: 'h-48', label: 'Half Width / Medium Height' },
  { width: 'w-1/3', height: 'h-32', label: 'Third Width / Small Height' },
  { width: 'w-2/3', height: 'h-64', label: 'Two-Thirds Width / Large Height' },
];

export const AVAILABLE_LANGUAGES = [
  { id: EPaperLanguage.English, name: 'English' },
  { id: EPaperLanguage.Telugu, name: 'తెలుగు' },
  { id: EPaperLanguage.Hindi, name: 'हिन्दी' },
];

export const DEFAULT_LANGUAGE = EPaperLanguage.English;