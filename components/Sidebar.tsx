import React, { useState, useContext, useEffect } from 'react';
import { EPaperConfig, UserRole, EPaperEdition, EPaperLanguage, EPaperPage } from '../types';
import { Button } from './Button';
import { SECTION_TYPES, AVAILABLE_TEXT_MODELS, AVAILABLE_IMAGE_MODELS, AVAILABLE_LANGUAGES } from '../constants';
import { UserContext } from '../App';
import clsx from 'clsx'; // For conditional class names

interface SidebarProps {
  onAddSection: (sectionType: string, title: string) => void;
  onRemoveSection: (sectionId: string) => void; // Keeping for type-safety, not directly used in current UI
  ePaperConfig: EPaperConfig;
  onConfigChange: (newConfig: EPaperConfig) => void;
  onSaveCurrentEdition: () => void;
  onPublishCurrentEdition: () => void;

  // Edition and Page Management Props
  currentEdition: EPaperEdition | null;
  currentEditingPage: EPaperPage | null;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onReorderPages: (pageId: string, direction: 'up' | 'down') => void;
  onLoadPageForEditing: (pageId: string) => void;
  onUploadPageThumbnail: (pageId: string, base64Image: string) => void;
  onUploadPdfPage: (pageId: string, pdfData: string) => void;
  updateCurrentEditionDetails: (updates: Partial<EPaperEdition>) => void;
  updateCurrentEditingPageDetails: (updates: Partial<EPaperPage>) => void;

  // E-Paper Generation Props
  onPreviewEdition: () => void;
  onExportPdf: () => void;
  onExportImages: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onAddSection,
  onRemoveSection, // Still here for type-safety, not directly used in current UI
  ePaperConfig,
  onConfigChange,
  onSaveCurrentEdition,
  onPublishCurrentEdition,

  currentEdition,
  currentEditingPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onReorderPages,
  onLoadPageForEditing,
  onUploadPageThumbnail,
  onUploadPdfPage,
  updateCurrentEditionDetails,
  updateCurrentEditingPageDetails,

  onPreviewEdition,
  onExportPdf,
  onExportImages,
}) => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error('Sidebar must be used within a UserContext.Provider');
  }

  const { currentUser, setCurrentUser } = userContext;

  const [newSectionTitle, setNewSectionTitle] = useState('New Section');
  const [selectedSectionType, setSelectedSectionType] = useState(SECTION_TYPES[0].id);

  const [editionTitle, setEditionTitle] = useState(currentEdition?.title || '');
  const [editionLanguage, setEditionLanguage] = useState(currentEdition?.language || EPaperLanguage.English);
  const [scheduledPublishDate, setScheduledPublishDate] = useState(currentEdition?.scheduledPublishDate || '');

  useEffect(() => {
    setEditionTitle(currentEdition?.title || '');
    setEditionLanguage(currentEdition?.language || EPaperLanguage.English);
    setScheduledPublishDate(currentEdition?.scheduledPublishDate || '');
  }, [currentEdition]);

  const handleUpdateEditionDetails = (field: keyof EPaperEdition, value: any) => {
    if (currentEdition) {
      updateCurrentEditionDetails({ [field]: value });
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentEditingPage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          onUploadPageThumbnail(currentEditingPage.id, event.target.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentEditingPage) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            // In a real app, you'd process the PDF (e.g., render as image, upload to storage)
            // For now, simulate with a placeholder.
            onUploadPdfPage(currentEditingPage.id, event.target.result); // Pass content, but App.tsx will simulate
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select a PDF file.');
        e.target.value = ''; // Clear input
      }
    }
  };


  const handleAddSectionClick = () => {
    onAddSection(selectedSectionType, newSectionTitle);
    setNewSectionTitle('New Section'); // Reset for next section
  };

  const handleConfigInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    onConfigChange({
      ...ePaperConfig,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: newRole,
        name: newRole === UserRole.Admin ? 'Admin User' : 'Editor User'
      });
    }
  };

  const getPublishButtonText = () => {
    if (!currentEdition) return 'Publish / Send for Approval';
    const scheduledDate = currentEdition.scheduledPublishDate ? new Date(currentEdition.scheduledPublishDate) : null;
    const now = new Date();

    if (scheduledDate && scheduledDate > now) {
      return `Schedule Publish (${scheduledDate.toLocaleDateString()})`;
    } else if (currentUser?.role === UserRole.Admin) {
      return 'Publish Edition';
    } else {
      return 'Send for Approval';
    }
  };

  // Sidebar content should only be rendered if a user is logged in
  if (!currentUser) {
    return null;
  }

  return (
    <aside className="w-80 bg-gray-900 text-gray-100 p-6 shadow-xl overflow-y-auto sticky top-0 h-screen print:hidden">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-3">
        Editor Tools
      </h2>

      {/* Role Selector */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold mb-4 text-purple-400">Current Role</h3>
        <select
          value={currentUser.role}
          onChange={handleRoleChange}
          className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-purple-500 focus:border-purple-500"
          aria-label="Select user role"
        >
          <option value={UserRole.Editor}>Editor</option>
          <option value={UserRole.Admin}>Admin</option>
        </select>
      </div>

      {/* Edition Details */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold mb-4 text-yellow-400">Edition Details</h3>
        <div className="mb-3">
          <label htmlFor="editionTitle" className="block text-sm font-medium text-gray-300 mb-1">
            Edition Title
          </label>
          <input
            type="text"
            id="editionTitle"
            value={editionTitle}
            onChange={(e) => { setEditionTitle(e.target.value); handleUpdateEditionDetails('title', e.target.value); }}
            placeholder="e.g., Daily News - Jan 1, 2024"
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-yellow-500 focus:border-yellow-500"
            aria-label="Edition title"
            disabled={!currentEdition}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="editionLanguage" className="block text-sm font-medium text-gray-300 mb-1">
            Language
          </label>
          <select
            id="editionLanguage"
            value={editionLanguage}
            onChange={(e) => { setEditionLanguage(e.target.value as EPaperLanguage); handleUpdateEditionDetails('language', e.target.value as EPaperLanguage); }}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-yellow-500 focus:border-yellow-500"
            aria-label="Edition language"
            disabled={!currentEdition}
          >
            {AVAILABLE_LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="scheduledPublishDate" className="block text-sm font-medium text-gray-300 mb-1">
            Scheduled Publish Date
          </label>
          <input
            type="datetime-local"
            id="scheduledPublishDate"
            value={scheduledPublishDate}
            onChange={(e) => { setScheduledPublishDate(e.target.value); handleUpdateEditionDetails('scheduledPublishDate', e.target.value || null); }}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-yellow-500 focus:border-yellow-500"
            aria-label="Scheduled publish date and time"
            disabled={!currentEdition}
          />
          {scheduledPublishDate && (
            <Button
              onClick={() => { setScheduledPublishDate(''); handleUpdateEditionDetails('scheduledPublishDate', null); }}
              variant="outline"
              small
              className="mt-2 text-xs border-red-400 text-red-400 hover:text-red-500 hover:border-red-500"
              disabled={!currentEdition}
            >
              Clear Schedule
            </Button>
          )}
        </div>
      </div>

      {/* Page Management */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold mb-4 text-indigo-400">Page Management</h3>
        {!currentEdition && <p className="text-gray-400 text-sm mb-4">Load or create an edition to manage pages.</p>}
        {currentEdition && (
          <>
            <div className="mb-4 space-y-2 max-h-40 overflow-y-auto pr-2">
              {currentEdition.pages.length === 0 ? (
                <p className="text-gray-400 text-sm">No pages yet. Add one!</p>
              ) : (
                currentEdition.pages.map((page, index) => (
                  <div
                    key={page.id}
                    className={clsx(
                      "flex items-center gap-2 p-2 rounded-md border text-sm",
                      currentEditingPage?.id === page.id
                        ? "bg-indigo-600 border-indigo-400 shadow-md"
                        : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                    )}
                  >
                    <span className="font-semibold w-6">{page.pageNumber}.</span>
                    {page.thumbnail ? (
                      <img src={page.thumbnail} alt={`Page ${page.pageNumber} thumbnail`} className="h-8 w-8 object-cover rounded" />
                    ) : (
                      <div className="h-8 w-8 bg-gray-500 flex items-center justify-center rounded text-xs">📄</div>
                    )}
                    <span className="flex-1">Page {page.pageNumber}</span>
                    <Button onClick={() => onLoadPageForEditing(page.id)} variant="secondary" small className="bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-400 hover:border-indigo-500">
                      Edit
                    </Button>
                    {/* Fix: Use onReorderPages prop */}
                    <Button onClick={() => onReorderPages(page.id, 'up')} variant="secondary" small disabled={index === 0}>▲</Button>
                    {/* Fix: Use onReorderPages prop */}
                    <Button onClick={() => onReorderPages(page.id, 'down')} variant="secondary" small disabled={index === currentEdition.pages.length - 1}>▼</Button>
                    {/* Fix: Use onDuplicatePage prop */}
                    <Button onClick={() => onDuplicatePage(page.id)} variant="secondary" small>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v4a1 1 0 001 1h4m-4 0h.01M12 11h7.01M12 11l3.5-3.5M12 11l3.5 3.5M4 12H3a2 2 0 00-2 2v5a2 2 0 002 2h16a2 2 0 002-2v-5a2 2 0 00-2-2h-1M4 12V7a2 2 0 012-2h8a2 2 0 012 2v5" /></svg>
                    </Button>
                    <Button onClick={() => onDeletePage(page.id)} variant="danger" small>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </Button>
                  </div>
                ))
              )}
            </div>
            <Button onClick={onAddPage} variant="primary" className="w-full mt-4" disabled={!currentEdition}>
              Add New Page
            </Button>
            {currentEditingPage && (
              <div className="mt-4 p-3 bg-gray-700 rounded-md">
                <h4 className="text-md font-semibold text-gray-200 mb-2">Page {currentEditingPage.pageNumber} Options</h4>
                <div className="mb-2">
                  <label htmlFor="pageThumbnail" className="block text-sm font-medium text-gray-300 mb-1">
                    Upload Thumbnail
                  </label>
                  <input
                    type="file"
                    id="pageThumbnail"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label htmlFor="pdfPageUpload" className="block text-sm font-medium text-gray-300 mb-1">
                    Upload PDF Page
                  </label>
                  <input
                    type="file"
                    id="pdfPageUpload"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>


      {/* Add New Section */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold mb-4 text-blue-400">Add New Section</h3>
        <div className="mb-3">
          <label htmlFor="sectionType" className="block text-sm font-medium text-gray-300 mb-1">
            Section Type
          </label>
          <select
            id="sectionType"
            value={selectedSectionType}
            onChange={(e) => setSelectedSectionType(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select section type"
            disabled={!currentEdition || !currentEditingPage}
          >
            {SECTION_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="sectionTitle" className="block text-sm font-medium text-gray-300 mb-1">
            Section Title
          </label>
          <input
            type="text"
            id="sectionTitle"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="e.g., Main Headlines"
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Section title"
            disabled={!currentEdition || !currentEditingPage}
          />
        </div>
        <Button onClick={handleAddSectionClick} variant="primary" className="w-full" disabled={!currentEdition || !currentEditingPage}>
          Add Section
        </Button>
      </div>

      {/* Gemini AI Configuration */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold mb-4 text-emerald-400">Gemini AI Settings</h3>
        <div className="mb-3">
          <label htmlFor="modelName" className="block text-sm font-medium text-gray-300 mb-1">
            Text Model
          </label>
          <select
            id="modelName"
            name="modelName"
            value={ePaperConfig.modelName}
            onChange={handleConfigInputChange}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
            aria-label="Select text model"
          >
            {AVAILABLE_TEXT_MODELS.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="imageModelName" className="block text-sm font-medium text-gray-300 mb-1">
            Image Model
          </label>
          <select
            id="imageModelName"
            name="imageModelName"
            value={ePaperConfig.imageModelName}
            onChange={handleConfigInputChange}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
            aria-label="Select image model"
          >
            {AVAILABLE_IMAGE_MODELS.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-300 mb-1">
            Temperature (Creativity)
          </label>
          <input
            type="number"
            id="temperature"
            name="temperature"
            min="0"
            max="1"
            step="0.1"
            value={ePaperConfig.temperature}
            onChange={handleConfigInputChange}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
            aria-label="AI temperature setting"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="topK" className="block text-sm font-medium text-gray-300 mb-1">
            Top K
          </label>
          <input
            type="number"
            id="topK"
            name="topK"
            min="1"
            step="1"
            value={ePaperConfig.topK}
            onChange={handleConfigInputChange}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
            aria-label="AI Top K setting"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="topP" className="block text-sm font-medium text-gray-300 mb-1">
            Top P
          </label>
          <input
            type="number"
            id="topP"
            name="topP"
            min="0"
            max="1"
            step="0.05"
            value={ePaperConfig.topP}
            onChange={handleConfigInputChange}
            className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
            aria-label="AI Top P setting"
          />
        </div>
      </div>

      {/* Publishing & Saving Actions */}
      <div className="p-4 bg-gray-800 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold mb-4 text-orange-400">Edition Actions</h3>
        <Button
          variant="secondary"
          className="w-full mb-2"
          onClick={onSaveCurrentEdition}
          disabled={!currentEdition}
        >
          Save Draft
        </Button>
        <Button
          variant="primary"
          className="w-full mb-4"
          onClick={onPublishCurrentEdition}
          disabled={!currentEdition}
        >
          {getPublishButtonText()}
        </Button>
        <hr className="border-gray-700 my-4" />
        <Button
          variant="outline"
          className="w-full mb-2 border-green-500 text-green-300 hover:bg-green-700 hover:text-white"
          onClick={onPreviewEdition}
          disabled={!currentEdition || currentEdition.pages.length === 0}
        >
          Final Preview
        </Button>
        <Button
          variant="outline"
          className="w-full mb-2 border-blue-500 text-blue-300 hover:bg-blue-700 hover:text-white"
          onClick={onExportPdf}
          disabled={!currentEdition || currentEdition.pages.length === 0}
        >
          Export to PDF (Simulated)
        </Button>
        <Button
          variant="outline"
          className="w-full border-purple-500 text-purple-300 hover:bg-purple-700 hover:text-white"
          onClick={onExportImages}
          disabled={!currentEdition || currentEdition.pages.length === 0}
        >
          Export to High-Res Images (Simulated)
        </Button>
      </div>
    </aside>
  );
};