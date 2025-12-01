
import React from 'react';
import { PageSection, ArticleBlockProps, ImageBlockProps, Block, AdBlockProps, EPaperEdition } from '../types';
import { ArticleBlock } from './ArticleBlock';
import { ImageBlock } from './ImageBlock';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { AdBlock } from './AdBlock'; // New AdBlock component

interface LayoutEditorProps {
  sections: PageSection[];
  onUpdateBlockDetails: (sectionId: string, blockId: string) => (updates: Partial<Block>) => void;
  onAddBlockToSection: (sectionId: string, blockType: 'article' | 'image' | 'ad') => void;
  onRemoveBlockFromSection: (sectionId: string, blockId: string) => void;
  onMoveBlock: (sectionId: string, blockId: string, direction: 'up' | 'down') => void;
  onGenerateHeadline: (sectionId: string, blockId: string, currentContent: string) => Promise<void>;
  onGenerateSummary: (sectionId: string, blockId: string, currentContent: string) => Promise<void>;
  onGenerateImage: (sectionId: string, blockId: string, prompt: string) => Promise<void>;
  onCaptureCameraImage: (width: number, height: number, text: string) => string; // Simulated camera
  onCompressImage: (file: File, maxWidth: number, quality: number) => Promise<string>;
  currentEdition: EPaperEdition | null; // Pass down for language context
  loading: boolean;
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  sections,
  onUpdateBlockDetails,
  onAddBlockToSection,
  onRemoveBlockFromSection,
  onMoveBlock,
  onGenerateHeadline,
  onGenerateSummary,
  onGenerateImage,
  onCaptureCameraImage,
  onCompressImage,
  currentEdition,
  loading,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto my-4">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-blue-600 pb-2">
        E-Paper Page Layout
      </h2>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
      {sections.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          No sections added yet. Use the sidebar to add new sections.
        </p>
      ) : (
        <div className="space-y-8">
          {sections.map(section => (
            <section key={section.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.blocks.map((block, index) => {
                  const onUpdateBlock = onUpdateBlockDetails(section.id, block.id);
                  const commonProps = {
                    key: block.id,
                    onRemove: () => onRemoveBlockFromSection(section.id, block.id),
                    onMoveUp: () => onMoveBlock(section.id, block.id, 'up'),
                    onMoveDown: () => onMoveBlock(section.id, block.id, 'down'),
                    isFirstBlock: index === 0,
                    isLastBlock: index === section.blocks.length - 1,
                    loading: loading,
                  };

                  if (block.type === 'article') {
                    const articleBlock = block as ArticleBlockProps;
                    return (
                      <ArticleBlock
                        {...articleBlock}
                        {...commonProps}
                        onUpdateBlockDetails={onUpdateBlock as (updates: Partial<ArticleBlockProps>) => void}
                        onGenerateHeadline={() => onGenerateHeadline(section.id, block.id, articleBlock.content)}
                        onGenerateSummary={() => onGenerateSummary(section.id, block.id, articleBlock.content)}
                        onCompressImage={onCompressImage}
                      />
                    );
                  } else if (block.type === 'image') {
                    const imageBlock = block as ImageBlockProps;
                    return (
                      <ImageBlock
                        {...imageBlock}
                        {...commonProps}
                        onUpdateBlockDetails={onUpdateBlock as (updates: Partial<ImageBlockProps>) => void}
                        onGenerateImage={(prompt) => onGenerateImage(section.id, block.id, prompt)}
                        onCaptureCameraImage={(w, h, t) => onCaptureCameraImage(w, h, t)}
                        onCompressImage={onCompressImage}
                      />
                    );
                  } else if (block.type === 'ad') {
                    const adBlock = block as AdBlockProps;
                    return (
                      <AdBlock
                        {...adBlock}
                        {...commonProps}
                        onUpdateBlockDetails={onUpdateBlock as (updates: Partial<AdBlockProps>) => void}
                        onCompressImage={onCompressImage}
                      />
                    );
                  }
                  return null;
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-4 justify-center">
                <Button onClick={() => onAddBlockToSection(section.id, 'article')} variant="primary" small>
                  Add Article
                </Button>
                <Button onClick={() => onAddBlockToSection(section.id, 'image')} variant="secondary" small>
                  Add Image
                </Button>
                <Button onClick={() => onAddBlockToSection(section.id, 'ad')} variant="outline" small>
                  Add Ad Block
                </Button>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};