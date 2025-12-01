import React, { useState, useCallback, useEffect, createContext } from 'react';
import { Header } from './components/Header';
import { LayoutEditor } from './components/LayoutEditor';
import { Sidebar } from './components/Sidebar';
import { ArticleBlockProps, ImageBlockProps, PageSection, EPaperConfig, User, UserRole, EPaperEdition, EPaperStatus, EPaperLanguage, EPaperPage, Block, AdBlockProps, BlockType } from './types';
import { GeminiService } from './services/geminiService';
import { DEFAULT_EPAPER_CONFIG, DEFAULT_LANGUAGE } from './constants';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { compressImage, generateRandomPlaceholderImage } from './utils';
import { PreviewScreen } from './components/PreviewScreen';

// Create a UserContext
export const UserContext = createContext<{
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  handleLogout: () => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<'login' | 'dashboard' | 'editor' | 'preview'>>;
  currentEdition: EPaperEdition | null;
  updateCurrentEditionDetails: (updates: Partial<EPaperEdition>) => void;
  currentEditingPage: EPaperPage | null;
  updateCurrentEditingPageDetails: (updates: Partial<EPaperPage>) => void;
  updateCurrentEditingPageSections: (newSections: PageSection[]) => void;
} | undefined>(undefined);

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ePaperConfig, setEPaperConfig] = useState<EPaperConfig>(DEFAULT_EPAPER_CONFIG);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'editor' | 'preview'>('login');

  const [allEditions, setAllEditions] = useState<EPaperEdition[]>(() => {
    const now = new Date().toLocaleString();
    const initialPage1: EPaperPage = {
      id: 'page-1-1',
      pageNumber: 1,
      sections: [
        {
          id: 'sec-1-1', type: 'main-news', title: 'Top Stories', blocks: [
            { id: 'art-1-1', type: 'article', headline: 'Local Hero Saves Cat', subHeadline: 'Feline rescued from tall tree.', content: 'A brave citizen rescued a cat from a tree...', byline: 'By Editor User', category: 'Local News', location: 'Hyderabad', textAlignment: 'left', fontSize: 'text-base', lineSpacing: 'leading-normal' } as ArticleBlockProps
          ]
        }
      ],
      thumbnail: '',
    };
    const initialPage2: EPaperPage = {
      id: 'page-1-2',
      pageNumber: 2,
      sections: [
        {
          id: 'sec-1-2', type: 'sports', title: 'Cricket Highlights', blocks: [
            { id: 'art-1-2', type: 'article', headline: 'Team Wins Championship', subHeadline: 'Historic victory in the finals.', content: 'The local team celebrated a historic victory...', byline: 'By Editor User', category: 'Sports', location: 'Chennai', textAlignment: 'left', fontSize: 'text-base', lineSpacing: 'leading-normal' } as ArticleBlockProps,
            { id: 'img-1-1', type: 'image', imageUrl: 'https://picsum.photos/400/250', caption: 'Winning moment', width: 'w-1/2', height: 'h-48', rotation: 0 } as ImageBlockProps
          ]
        }
      ],
      thumbnail: '',
    };
    return [
      {
        id: 'edition-1',
        title: 'Daily News - April 23, 2024',
        pages: [initialPage1, initialPage2],
        language: EPaperLanguage.English,
        scheduledPublishDate: null,
        status: EPaperStatus.Published,
        createdBy: 'Admin User',
        lastModified: now,
      },
      {
        id: 'edition-2',
        title: 'Sports Weekly - Draft A',
        pages: [{
          id: 'page-2-1', pageNumber: 1, sections: [
            { id: 'sec-2-1', type: 'sports', title: 'Cricket Highlights', blocks: [{ id: 'art-2-1', type: 'article', headline: 'Team Wins Championship', subHeadline: 'Historic victory.', content: 'The local team celebrated a historic victory...', byline: 'By Editor User', category: 'Sports', location: 'Hyderabad', textAlignment: 'left', fontSize: 'text-base', lineSpacing: 'leading-normal' } as ArticleBlockProps] }
          ], thumbnail: ''
        }],
        language: EPaperLanguage.Telugu,
        scheduledPublishDate: null,
        status: EPaperStatus.Draft,
        createdBy: 'Editor User',
        lastModified: now,
      },
      {
        id: 'edition-3',
        title: 'Editorial - Pending Review',
        pages: [{
          id: 'page-3-1', pageNumber: 1, sections: [
            { id: 'sec-3-1', type: 'editorial', title: 'Opinion Piece', blocks: [{ id: 'art-3-1', type: 'article', headline: 'Future of AI', subHeadline: 'Impact on daily life.', content: 'Exploring the impact of artificial intelligence...', byline: 'By Admin User', category: 'Technology', location: 'Bengaluru', textAlignment: 'left', fontSize: 'text-base', lineSpacing: 'leading-normal' } as ArticleBlockProps] }
          ], thumbnail: ''
        }],
        language: EPaperLanguage.Hindi,
        scheduledPublishDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
        status: EPaperStatus.PendingApproval,
        createdBy: 'Admin User',
        lastModified: now,
      },
    ];
  });

  const [currentEdition, setCurrentEdition] = useState<EPaperEdition | null>(null);
  const [currentEditingPage, setCurrentEditingPage] = useState<EPaperPage | null>(null);

  // Derive currentEditingPageSections from currentEditingPage
  const currentEditingPageSections = currentEditingPage?.sections || [];

  const geminiService = new GeminiService();

  useEffect(() => {
    const storedAuthToken = localStorage.getItem('authToken');
    if (storedAuthToken) {
      const userRole = storedAuthToken.includes('admin') ? UserRole.Admin : UserRole.Editor;
      setCurrentUser({
        id: 'user-123',
        name: userRole === UserRole.Admin ? 'Admin User' : 'Editor User',
        role: userRole,
      });
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (email: string, role: UserRole) => {
    const token = `mock-jwt-token-${email}-${role}`;
    localStorage.setItem('authToken', token);
    setCurrentUser({ id: 'user-123', name: role === UserRole.Admin ? 'Admin User' : 'Editor User', role: role });
    setCurrentPage('dashboard');
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setCurrentPage('login');
    setCurrentEdition(null);
    setCurrentEditingPage(null);
  }, []);

  const updateAllEditions = useCallback((updatedEdition: EPaperEdition) => {
    setAllEditions(prevEditions =>
      prevEditions.map(edition =>
        edition.id === updatedEdition.id ? updatedEdition : edition
      )
    );
  }, []);

  const updateCurrentEditionDetails = useCallback((updates: Partial<EPaperEdition>) => {
    if (currentEdition) {
      const updatedEdition = { ...currentEdition, ...updates, lastModified: new Date().toLocaleString() };
      setCurrentEdition(updatedEdition);
      updateAllEditions(updatedEdition);
    }
  }, [currentEdition, updateAllEditions]);

  const updateCurrentEditingPageDetails = useCallback((updates: Partial<EPaperPage>) => {
    if (currentEdition && currentEditingPage) {
      const updatedPage = { ...currentEditingPage, ...updates };
      setCurrentEditingPage(updatedPage);

      const updatedPages = currentEdition.pages.map(page =>
        page.id === updatedPage.id ? updatedPage : page
      );
      updateCurrentEditionDetails({ pages: updatedPages });
    }
  }, [currentEdition, currentEditingPage, updateCurrentEditionDetails]);

  const updateCurrentEditingPageSections = useCallback((newSections: PageSection[]) => {
    if (currentEditingPage) {
      updateCurrentEditingPageDetails({ sections: newSections });
    }
  }, [currentEditingPage, updateCurrentEditingPageDetails]);


  const handleCreateNewEdition = useCallback((title: string) => {
    if (!currentUser) {
      alert('Please log in to create an edition.');
      return;
    }
    const newEditionId = `edition-${Date.now()}`;
    const newPage: EPaperPage = {
      id: `page-${Date.now()}-1`,
      pageNumber: 1,
      sections: [],
      thumbnail: '',
    };
    const newEdition: EPaperEdition = {
      id: newEditionId,
      title: title || `New Edition - ${new Date().toLocaleDateString()}`,
      pages: [newPage],
      language: DEFAULT_LANGUAGE,
      scheduledPublishDate: null,
      status: EPaperStatus.Draft,
      createdBy: currentUser.name,
      lastModified: new Date().toLocaleString(),
    };
    setAllEditions(prevEditions => [...prevEditions, newEdition]);
    setCurrentEdition(newEdition);
    setCurrentEditingPage(newPage);
    setCurrentPage('editor');
  }, [currentUser]);

  const handleLoadEdition = useCallback((editionId: string) => {
    const editionToLoad = allEditions.find(edition => edition.id === editionId);
    if (editionToLoad) {
      setCurrentEdition(editionToLoad);
      const firstPage = editionToLoad.pages.length > 0 ? editionToLoad.pages[0] : null;
      setCurrentEditingPage(firstPage);
      setCurrentPage('editor');
    } else {
      alert('Edition not found.');
    }
  }, [allEditions]);

  const handleSaveCurrentEdition = useCallback(() => {
    if (!currentEdition) {
      alert('No edition is currently being edited to save.');
      return;
    }
    updateCurrentEditionDetails({}); // Trigger an update to save current state
    alert('Edition saved as draft!');
  }, [currentEdition, updateCurrentEditionDetails]);

  const handlePublishCurrentEdition = useCallback(() => {
    if (!currentEdition) {
      alert('No edition selected to publish.');
      return;
    }
    if (!currentUser) {
      alert('You must be logged in to publish an edition.');
      return;
    }

    let newStatus: EPaperStatus;
    let alertMessage: string;

    const scheduledDate = currentEdition.scheduledPublishDate ? new Date(currentEdition.scheduledPublishDate) : null;
    const now = new Date();

    if (scheduledDate && scheduledDate > now) {
      newStatus = EPaperStatus.Scheduled;
      alertMessage = `Edition "${currentEdition.title}" scheduled for publication on ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString()}.`;
    } else if (currentUser.role === UserRole.Admin) {
      newStatus = EPaperStatus.Published;
      alertMessage = `Edition "${currentEdition.title}" published!`;
    } else {
      newStatus = EPaperStatus.PendingApproval;
      alertMessage = `Edition "${currentEdition.title}" sent for approval.`;
    }

    updateCurrentEditionDetails({ status: newStatus });
    alert(alertMessage);

    setCurrentPage('dashboard');
    setCurrentEdition(null);
    setCurrentEditingPage(null);
  }, [currentEdition, currentUser, updateCurrentEditionDetails]);

  const handleApproveEdition = useCallback((editionId: string) => {
    if (currentUser?.role !== UserRole.Admin) {
      alert('Only Admins can approve editions.');
      return;
    }
    const editionToApprove = allEditions.find(edition => edition.id === editionId);
    if (editionToApprove && editionToApprove.status === EPaperStatus.PendingApproval) {
      updateAllEditions({ ...editionToApprove, status: EPaperStatus.Published, lastModified: new Date().toLocaleString() });
      alert(`Edition "${editionToApprove.title}" approved and published!`);
    } else {
      alert('Edition not found or not in pending approval status.');
    }
  }, [currentUser, allEditions, updateAllEditions]);

  // Page Management Handlers
  const addPage = useCallback(() => {
    if (!currentEdition) return;
    const newPageNumber = currentEdition.pages.length + 1;
    const newPage: EPaperPage = {
      id: `page-${Date.now()}-${newPageNumber}`,
      pageNumber: newPageNumber,
      sections: [],
      thumbnail: '',
    };
    const updatedPages = [...currentEdition.pages, newPage];
    updateCurrentEditionDetails({ pages: updatedPages });
    setCurrentEditingPage(newPage);
  }, [currentEdition, updateCurrentEditionDetails]);

  const deletePage = useCallback((pageId: string) => {
    if (!currentEdition) return;
    const updatedPages = currentEdition.pages.filter(page => page.id !== pageId).map((page, index) => ({ ...page, pageNumber: index + 1 }));
    updateCurrentEditionDetails({ pages: updatedPages });
    if (currentEditingPage?.id === pageId) {
      setCurrentEditingPage(updatedPages.length > 0 ? updatedPages[0] : null);
    }
  }, [currentEdition, currentEditingPage, updateCurrentEditionDetails]);

  const duplicatePage = useCallback((pageId: string) => {
    if (!currentEdition) return;
    const pageToDuplicate = currentEdition.pages.find(page => page.id === pageId);
    if (!pageToDuplicate) return;

    const newPageNumber = currentEdition.pages.length + 1;
    const duplicatedPage: EPaperPage = {
      ...pageToDuplicate,
      id: `page-${Date.now()}-dup`,
      pageNumber: newPageNumber,
      // Deep copy sections and blocks
      // Fix: Ensure correct BlockType is preserved when duplicating blocks
      sections: pageToDuplicate.sections.map(section => ({
        ...section,
        id: `sec-dup-${Date.now()}-${Math.random()}`,
        blocks: section.blocks.map(block => {
          switch (block.type) {
            case BlockType.Article:
              return { ...block, id: `block-dup-${Date.now()}-${Math.random()}` } as ArticleBlockProps;
            case BlockType.Image:
              return { ...block, id: `block-dup-${Date.now()}-${Math.random()}` } as ImageBlockProps;
            case BlockType.Ad:
              return { ...block, id: `block-dup-${Date.now()}-${Math.random()}` } as AdBlockProps;
            default:
              return { ...block, id: `block-dup-${Date.now()}-${Math.random()}` } as Block;
          }
        })
      }))
    };
    const updatedPages = [...currentEdition.pages, duplicatedPage].sort((a, b) => a.pageNumber - b.pageNumber); // Keep sorted
    updateCurrentEditionDetails({ pages: updatedPages.map((page, index) => ({ ...page, pageNumber: index + 1 })) });
  }, [currentEdition, updateCurrentEditionDetails]);

  const reorderPages = useCallback((pageId: string, direction: 'up' | 'down') => {
    if (!currentEdition) return;
    const pageIndex = currentEdition.pages.findIndex(page => page.id === pageId);
    if (pageIndex === -1) return;

    const newPages = [...currentEdition.pages];
    const pageToMove = newPages.splice(pageIndex, 1)[0];

    if (direction === 'up' && pageIndex > 0) {
      newPages.splice(pageIndex - 1, 0, pageToMove);
    } else if (direction === 'down' && pageIndex < newPages.length) {
      newPages.splice(pageIndex + 1, 0, pageToMove);
    } else {
      newPages.splice(pageIndex, 0, pageToMove); // Re-insert if no move happened
    }

    updateCurrentEditionDetails({ pages: newPages.map((page, index) => ({ ...page, pageNumber: index + 1 })) });
  }, [currentEdition, updateCurrentEditionDetails]);

  const loadPageForEditing = useCallback((pageId: string) => {
    if (!currentEdition) return;
    const pageToLoad = currentEdition.pages.find(page => page.id === pageId);
    if (pageToLoad) {
      setCurrentEditingPage(pageToLoad);
    }
  }, [currentEdition]);

  const handleUploadPageThumbnail = useCallback((pageId: string, base64Image: string) => {
    if (currentEdition && currentEditingPage?.id === pageId) {
      updateCurrentEditingPageDetails({ thumbnail: base64Image });
    }
  }, [currentEdition, currentEditingPage, updateCurrentEditionDetails]);

  const handleUploadPdfPage = useCallback((pageId: string, pdfData: string) => {
    if (currentEdition && currentEditingPage?.id === pageId) {
      // For demonstration, just set a generic thumbnail and flag
      updateCurrentEditingPageDetails({
        thumbnail: 'https://via.placeholder.com/150x200?text=PDF+Page',
        isUploadedPdfPage: true,
      });
      alert(`PDF for page ${currentEditingPage.pageNumber} uploaded (simulated).`);
    }
  }, [currentEdition, currentEditingPage, updateCurrentEditionDetails]);

  // Block Management Handlers
  const getBlockUpdateHandler = useCallback((sectionId: string, blockId: string) => {
    return (updates: Partial<Block>) => {
      const updatedSections = currentEditingPageSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            blocks: section.blocks.map(block =>
              block.id === blockId ? { ...block, ...updates } : block
            ),
          };
        }
        return section;
      });
      updateCurrentEditingPageSections(updatedSections);
    };
  }, [currentEditingPageSections, updateCurrentEditingPageSections]);

  const handleAddSection = useCallback((sectionType: string, title: string) => {
    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      type: sectionType,
      title: title,
      blocks: [],
    };
    updateCurrentEditingPageSections([...currentEditingPageSections, newSection]);
  }, [currentEditingPageSections, updateCurrentEditingPageSections]);

  const handleRemoveSection = useCallback((sectionId: string) => {
    updateCurrentEditingPageSections(currentEditingPageSections.filter(section => section.id !== sectionId));
  }, [currentEditingPageSections, updateCurrentEditingPageSections]);

  const handleAddBlockToSection = useCallback((sectionId: string, blockType: 'article' | 'image' | 'ad') => {
    const newBlockId = `${blockType}-${Date.now()}`;
    let newBlock: Block;

    if (blockType === 'article') {
      newBlock = {
        id: newBlockId,
        type: 'article',
        headline: 'New Article Headline',
        subHeadline: '',
        content: 'Write your article content here...',
        byline: `By ${currentUser?.name || 'Editor'}`,
        category: 'Local News',
        location: '',
        articleImageUrl: '',
        textAlignment: 'left',
        fontSize: 'text-base',
        lineSpacing: 'leading-normal',
        width: 'w-full', height: 'h-auto', rotation: 0
      } as ArticleBlockProps;
    } else if (blockType === 'image') {
      newBlock = {
        id: newBlockId,
        type: 'image',
        imageUrl: 'https://picsum.photos/400/250',
        caption: 'Image caption',
        width: 'w-1/2', height: 'h-48', rotation: 0
      } as ImageBlockProps;
    } else { // 'ad'
      newBlock = {
        id: newBlockId,
        type: 'ad',
        adContent: 'Your advertisement text here',
        adImageUrl: 'https://via.placeholder.com/300x150?text=Advertisement',
        targetUrl: '#',
        width: 'w-full', height: 'h-40', rotation: 0
      } as AdBlockProps;
    }
    const updatedSections = currentEditingPageSections.map(section =>
      section.id === sectionId
        ? { ...section, blocks: [...section.blocks, newBlock] }
        : section
    );
    updateCurrentEditingPageSections(updatedSections);
  }, [currentUser, currentEditingPageSections, updateCurrentEditingPageSections]);

  const handleRemoveBlockFromSection = useCallback((sectionId: string, blockId: string) => {
    const updatedSections = currentEditingPageSections.map(section =>
      section.id === sectionId
        ? { ...section, blocks: section.blocks.filter(block => block.id !== blockId) }
        : section
    );
    updateCurrentEditingPageSections(updatedSections);
  }, [currentEditingPageSections, updateCurrentEditingPageSections]);

  const handleMoveBlock = useCallback((sectionId: string, blockId: string, direction: 'up' | 'down') => {
    const updatedSections = currentEditingPageSections.map(section => {
      if (section.id === sectionId) {
        const blockIndex = section.blocks.findIndex(block => block.id === blockId);
        if (blockIndex === -1) return section;

        const newBlocks = [...section.blocks];
        const [movedBlock] = newBlocks.splice(blockIndex, 1);

        if (direction === 'up' && blockIndex > 0) {
          newBlocks.splice(blockIndex - 1, 0, movedBlock);
        } else if (direction === 'down' && blockIndex < newBlocks.length) {
          newBlocks.splice(blockIndex + 1, 0, movedBlock);
        } else {
          newBlocks.splice(blockIndex, 0, movedBlock); // Insert back if no valid move
        }
        return { ...section, blocks: newBlocks };
      }
      return section;
    });
    updateCurrentEditingPageSections(updatedSections);
  }, [currentEditingPageSections, updateCurrentEditingPageSections]);


  const handleGenerateHeadline = useCallback(async (sectionId: string, blockId: string, currentContent: string) => {
    setLoading(true);
    setError(null);
    try {
      const language = currentEdition?.language || EPaperLanguage.English;
      const prompt = `Generate a concise and engaging newspaper headline (max 10 words) in ${language === EPaperLanguage.Telugu ? 'Telugu' : language === EPaperLanguage.Hindi ? 'Hindi' : 'English'} for the following article content:\n\n${currentContent}`;
      const response = await geminiService.generateText(prompt, ePaperConfig);
      getBlockUpdateHandler(sectionId, blockId)({ headline: response.text || 'Generated Headline' });
    } catch (e: any) {
      setError(`Failed to generate headline: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [ePaperConfig, currentEdition, getBlockUpdateHandler]);

  const handleGenerateSummary = useCallback(async (sectionId: string, blockId: string, currentContent: string) => {
    setLoading(true);
    setError(null);
    try {
      const language = currentEdition?.language || EPaperLanguage.English;
      const prompt = `Summarize the following article content into 2-3 sentences in ${language === EPaperLanguage.Telugu ? 'Telugu' : language === EPaperLanguage.Hindi ? 'Hindi' : 'English'}:\n\n${currentContent}`;
      const response = await geminiService.generateText(prompt, ePaperConfig);
      getBlockUpdateHandler(sectionId, blockId)({ content: response.text || 'Generated Summary' });
    } catch (e: any) {
      setError(`Failed to generate summary: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [ePaperConfig, currentEdition, getBlockUpdateHandler]);

  const handleGenerateImage = useCallback(async (sectionId: string, blockId: string, prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const language = currentEdition?.language || EPaperLanguage.English;
      const fullPrompt = `Generate an image based on this description, considering the context is an e-paper in ${language === EPaperLanguage.Telugu ? 'Telugu' : language === EPaperLanguage.Hindi ? 'Hindi' : 'English'}: ${prompt}`;
      const imageUrl = await geminiService.generateImage(fullPrompt, ePaperConfig);
      if (imageUrl) {
        getBlockUpdateHandler(sectionId, blockId)({ imageUrl: imageUrl });
      }
    } catch (e: any) {
      setError(`Failed to generate image: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [ePaperConfig, currentEdition, getBlockUpdateHandler]);

  const handleConfigChange = useCallback((newConfig: EPaperConfig) => {
    setEPaperConfig(newConfig);
  }, []);

  // E-Paper Generation handlers
  const handlePreviewEdition = useCallback(() => {
    if (!currentEdition || currentEdition.pages.length === 0) {
      alert('Please create or load an edition with content to preview.');
      return;
    }
    setCurrentPage('preview');
  }, [currentEdition]);

  const handleExportPdf = useCallback(() => {
    if (!currentEdition) {
      alert('No edition selected for PDF export.');
      return;
    }
    // Simulate PDF generation by triggering browser print dialog
    alert('Initiating browser print to save as PDF. Please adjust print settings to "Save as PDF".');
    window.print();
  }, [currentEdition]);

  const handleExportImages = useCallback(() => {
    if (!currentEdition || currentEdition.pages.length === 0) {
      alert('No edition selected for image export.');
      return;
    }
    alert(`Simulating high-resolution image export for all ${currentEdition.pages.length} pages of "${currentEdition.title}". Downloads will start shortly...`);
    // Simulate downloads of placeholder images
    currentEdition.pages.forEach((page, index) => {
      const imgUrl = generateRandomPlaceholderImage(1920, 1080, `Page ${page.pageNumber}`);
      const link = document.createElement('a');
      link.href = imgUrl;
      link.download = `${currentEdition.title.replace(/\s/g, '_')}_Page_${page.pageNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }, [currentEdition]);


  const renderContent = () => {
    if (currentPage === 'login' || !currentUser) {
      return <LoginScreen onLogin={handleLogin} />;
    } else if (currentPage === 'dashboard') {
      return (
        <Dashboard
          allEditions={allEditions}
          onCreateNewEdition={handleCreateNewEdition}
          onLoadEdition={handleLoadEdition}
          onPublishEdition={handlePublishCurrentEdition}
          onApproveEdition={handleApproveEdition}
          onNavigateToEditor={() => setCurrentPage('editor')}
        />
      );
    } else if (currentPage === 'editor') {
      return (
        <div className="flex-1 flex flex-col">
          <Header currentPage={currentPage} />
          <main className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
              {currentEdition && currentEditingPage ? (
                <LayoutEditor
                  sections={currentEditingPageSections}
                  onUpdateBlockDetails={getBlockUpdateHandler}
                  onAddBlockToSection={handleAddBlockToSection}
                  onRemoveBlockFromSection={handleRemoveBlockFromSection}
                  onMoveBlock={handleMoveBlock}
                  onGenerateHeadline={handleGenerateHeadline}
                  onGenerateSummary={handleGenerateSummary}
                  onGenerateImage={handleGenerateImage}
                  onCaptureCameraImage={generateRandomPlaceholderImage} // Simulated camera capture
                  onCompressImage={compressImage}
                  currentEdition={currentEdition}
                  loading={loading}
                />
              ) : (
                <p className="text-center text-gray-600 text-xl py-10">
                  No page selected for editing. Please create a new edition or load an existing one from the Dashboard.
                </p>
              )}
              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  <p>Error: {error}</p>
                </div>
              )}
            </div>
            <Sidebar
              onAddSection={handleAddSection}
              onRemoveSection={handleRemoveSection}
              ePaperConfig={ePaperConfig}
              onConfigChange={handleConfigChange}
              onSaveCurrentEdition={handleSaveCurrentEdition}
              onPublishCurrentEdition={handlePublishCurrentEdition}
              currentEdition={currentEdition}
              currentEditingPage={currentEditingPage}
              onAddPage={addPage}
              onDeletePage={deletePage}
              onDuplicatePage={duplicatePage}
              onReorderPages={reorderPages}
              onLoadPageForEditing={loadPageForEditing}
              onUploadPageThumbnail={handleUploadPageThumbnail}
              onUploadPdfPage={handleUploadPdfPage}
              updateCurrentEditionDetails={updateCurrentEditionDetails}
              updateCurrentEditingPageDetails={updateCurrentEditingPageDetails}
              onPreviewEdition={handlePreviewEdition} // Pass preview handler
              onExportPdf={handleExportPdf} // Pass export handlers
              onExportImages={handleExportImages}
            />
          </main>
        </div>
      );
    } else { // currentPage === 'preview'
      return (
        <div className="flex-1 flex flex-col">
          <Header currentPage={currentPage} />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            {currentEdition ? (
              <PreviewScreen
                currentEdition={currentEdition}
                onBackToEditor={() => setCurrentPage('editor')}
                onExportPdf={handleExportPdf}
                onExportImages={handleExportImages}
              />
            ) : (
              <p className="text-center text-gray-600 text-xl py-10">No edition available for preview.</p>
            )}
          </main>
        </div>
      );
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      setCurrentUser,
      handleLogout,
      setCurrentPage,
      currentEdition,
      updateCurrentEditionDetails,
      currentEditingPage,
      updateCurrentEditingPageDetails,
      updateCurrentEditingPageSections,
    }}>
      <div className="flex min-h-screen bg-gray-50 text-gray-800">
        {renderContent()}
      </div>
    </UserContext.Provider>
  );
};

export default App;