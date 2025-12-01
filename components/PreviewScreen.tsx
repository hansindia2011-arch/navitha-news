import React from 'react';
import { EPaperEdition, EPaperPage, BlockType, ArticleBlockProps, ImageBlockProps, AdBlockProps } from '../types';
import { Button } from './Button';
import clsx from 'clsx';

interface PreviewScreenProps {
  currentEdition: EPaperEdition;
  onBackToEditor: () => void;
  onExportPdf: () => void;
  onExportImages: () => void;
}

export const PreviewScreen: React.FC<PreviewScreenProps> = ({
  currentEdition,
  onBackToEditor,
  onExportPdf,
  onExportImages,
}) => {
  if (!currentEdition) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-700">
        <h2 className="text-3xl font-bold mb-4">No Edition to Preview</h2>
        <p className="text-lg mb-6">Please select an edition from the dashboard or create a new one.</p>
        <Button onClick={onBackToEditor} variant="primary">
          Back to Editor
        </Button>
      </div>
    );
  }

  const renderBlock = (block: ArticleBlockProps | ImageBlockProps | AdBlockProps) => {
    const commonStyles: React.CSSProperties = {
      transform: `rotate(${block.rotation || 0}deg)`,
      width: block.width === 'w-auto' ? 'auto' : (block.width || '100%'),
      height: block.height === 'h-auto' ? 'auto' : (block.height || 'auto'),
    };

    if (block.type === BlockType.Article) {
      const article = block as ArticleBlockProps;
      return (
        <div key={article.id} className={clsx("bg-white p-4 shadow-sm rounded-lg border border-gray-200", article.width, article.height)} style={commonStyles}>
          {article.articleImageUrl && (
            <img src={article.articleImageUrl} alt="Article visual" className="w-full h-auto object-cover rounded-md mb-2" />
          )}
          <h3 className="text-xl font-bold mb-1 print:text-lg">{article.headline}</h3>
          <h4 className="text-md font-semibold text-gray-700 mb-2 print:text-sm">{article.subHeadline}</h4>
          <p className="text-sm text-gray-600 mb-2 print:text-xs">
            By {article.byline} | {article.location} | {article.category}
          </p>
          <p className={clsx("text-gray-800 text-base whitespace-pre-wrap", article.fontSize, article.lineSpacing, `text-${article.textAlignment || 'left'}`)} style={{ textAlign: article.textAlignment }}>
            {article.content}
          </p>
        </div>
      );
    } else if (block.type === BlockType.Image) {
      const image = block as ImageBlockProps;
      return (
        <div key={image.id} className={clsx("bg-white p-4 shadow-sm rounded-lg border border-gray-200", image.width, image.height)} style={commonStyles}>
          <img src={image.imageUrl} alt={image.caption} className="w-full h-auto object-cover rounded-md mb-2" />
          <p className="text-sm text-gray-600 print:text-xs">{image.caption}</p>
        </div>
      );
    } else if (block.type === BlockType.Ad) {
      const ad = block as AdBlockProps;
      return (
        <div key={ad.id} className={clsx("bg-white p-4 shadow-sm rounded-lg border border-yellow-400 bg-yellow-50", ad.width, ad.height)} style={commonStyles}>
          <p className="text-xs text-yellow-600 font-bold mb-2 uppercase">Advertisement</p>
          {ad.adImageUrl && (
            <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="block mb-2">
              <img src={ad.adImageUrl} alt="Advertisement" className="w-full h-auto object-cover rounded-md" />
            </a>
          )}
          <p className="text-sm text-gray-800 print:text-xs">{ad.adContent}</p>
          {ad.targetUrl && <p className="text-xs text-blue-500 break-words mt-1 print:hidden">{ad.targetUrl}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center mb-8 print:hidden">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{currentEdition.title}</h2>
        <p className="text-lg text-gray-600 mb-4">
          Language: {currentEdition.language.toUpperCase()} | Created By: {currentEdition.createdBy}
        </p>
        <div className="flex gap-4 mb-4">
          <Button onClick={onBackToEditor} variant="secondary">
            Back to Editor
          </Button>
          <Button onClick={onExportPdf} variant="primary">
            Export to PDF (Simulated)
          </Button>
          <Button onClick={onExportImages} variant="primary">
            Export to Images (Simulated)
          </Button>
        </div>
      </div>

      <div className="space-y-12">
        {currentEdition.pages.length === 0 ? (
          <p className="text-center text-gray-600 text-xl py-10">This edition has no pages to preview.</p>
        ) : (
          currentEdition.pages.map(page => (
            <div key={page.id} className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto print:block print:w-full print:p-0 print:shadow-none print:break-after-page print:min-h-screen">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-blue-600 pb-2 text-center print:text-lg print:border-b print:pb-1">
                Page {page.pageNumber}
              </h3>
              <div className="space-y-8">
                {page.sections.length === 0 ? (
                  <p className="text-gray-600 text-center py-4 print:text-sm">No sections on this page.</p>
                ) : (
                  page.sections.map(section => (
                    <section key={section.id} className="border border-gray-200 rounded-lg p-5 bg-gray-50 shadow-sm print:border-0 print:p-0 print:shadow-none">
                      <h4 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-300 print:text-base print:border-b-0 print:pb-1">
                        {section.title}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-2">
                        {section.blocks.map(renderBlock)}
                      </div>
                    </section>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};