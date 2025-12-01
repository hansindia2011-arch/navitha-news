export type TextAlignment = 'left' | 'center' | 'right' | 'justify';

export enum BlockType {
  Article = 'article',
  Image = 'image',
  Ad = 'ad',
}

export interface BlockLayoutProps {
  width?: string; // Tailwind CSS width class, e.g., 'w-full', 'w-1/2'
  height?: string; // Tailwind CSS height class, e.g., 'h-48', 'h-auto'
  rotation?: number; // Degrees for CSS transform
  x?: number; // Placeholder for future drag-and-drop
  y?: number; // Placeholder for future drag-and-drop
}

export interface ArticleBlockProps extends BlockLayoutProps {
  id: string;
  type: BlockType.Article;
  headline: string;
  subHeadline: string;
  content: string;
  byline: string;
  articleImageUrl?: string; // Image specific to the article content
  category: string;
  location: string;
  textAlignment?: TextAlignment;
  fontSize?: string; // Tailwind CSS font size class, e.g., 'text-sm', 'text-base'
  lineSpacing?: string; // Tailwind CSS line height class, e.g., 'leading-tight', 'leading-normal'
}

export interface ImageBlockProps extends BlockLayoutProps {
  id: string;
  type: BlockType.Image;
  imageUrl: string;
  caption: string;
}

export interface AdBlockProps extends BlockLayoutProps {
  id: string;
  type: BlockType.Ad;
  adContent: string;
  adImageUrl?: string;
  targetUrl?: string;
}

export type Block = ArticleBlockProps | ImageBlockProps | AdBlockProps;

export interface PageSection {
  id: string;
  type: string; // e.g., 'main-news', 'sports', 'editorial', 'advertisement-area'
  title: string;
  blocks: Block[];
}

export interface EPaperConfig {
  modelName: string;
  imageModelName: string;
  temperature: number;
  topK: number;
  topP: number;
}

export enum UserRole {
  Admin = 'Admin',
  Editor = 'Editor',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export enum EPaperStatus {
  Draft = 'Draft',
  PendingApproval = 'Pending Approval',
  Published = 'Published',
  Scheduled = 'Scheduled',
}

export enum EPaperLanguage {
  English = 'en',
  Telugu = 'te',
  Hindi = 'hi',
}

export interface EPaperPage {
  id: string;
  pageNumber: number;
  sections: PageSection[];
  thumbnail?: string; // Base64 string for a visual preview
  isUploadedPdfPage?: boolean;
}

export interface EPaperEdition {
  id: string;
  title: string;
  pages: EPaperPage[]; // An edition now contains multiple pages
  language: EPaperLanguage;
  scheduledPublishDate: string | null; // ISO string or local date/time string
  status: EPaperStatus;
  createdBy: string;
  lastModified: string;
}