import React, { useContext, useState } from 'react';
import { UserContext } from '../App';
import { Button } from './Button';
import { EPaperEdition, EPaperStatus, UserRole } from '../types';
import { Header } from './Header';

interface DashboardProps {
  allEditions: EPaperEdition[];
  onCreateNewEdition: (title: string) => void;
  onLoadEdition: (editionId: string) => void;
  onPublishEdition: () => void; // For the currently loaded edition
  onApproveEdition: (editionId: string) => void;
  onNavigateToEditor: () => void; // Still useful for Admin's general "Go to Editor"
}

export const Dashboard: React.FC<DashboardProps> = ({
  allEditions,
  onCreateNewEdition,
  onLoadEdition,
  onPublishEdition,
  onApproveEdition,
  onNavigateToEditor,
}) => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error('Dashboard must be used within a UserContext.Provider');
  }

  const { currentUser, setCurrentPage } = userContext;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<EPaperStatus | 'All'>('All');
  const [newEditionTitle, setNewEditionTitle] = useState('');

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <p className="text-xl">Please log in to view the dashboard.</p>
      </div>
    );
  }

  const filteredEditions = allEditions
    .filter(edition =>
      edition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      edition.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(edition => filterStatus === 'All' || edition.status === filterStatus);

  const handleCreateEditionClick = () => {
    // Title is now optional, App.tsx will generate a default
    onCreateNewEdition(newEditionTitle.trim());
    setNewEditionTitle('');
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header currentPage="dashboard" />
      <div className="flex-1 flex flex-col p-6 bg-gray-50 text-gray-800">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
          Welcome, {currentUser.name} ({currentUser.role})!
        </h2>

        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-2xl font-bold text-gray-900">Your Editions</h3>
            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="New Edition Title (optional)"
                value={newEditionTitle}
                onChange={(e) => setNewEditionTitle(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full md:w-60"
                aria-label="New edition title"
              />
              <Button onClick={handleCreateEditionClick} variant="primary" className="py-2 px-4 w-full md:w-auto">
                Create New Edition
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <input
              type="text"
              placeholder="Search editions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 flex-grow"
              aria-label="Search editions"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as EPaperStatus | 'All')}
              className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white w-full sm:w-auto"
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              {Object.values(EPaperStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {filteredEditions.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No editions found matching your criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Publish
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEditions.map((edition) => (
                    <tr key={edition.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {edition.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {edition.language.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          edition.status === EPaperStatus.Published ? 'bg-green-100 text-green-800' :
                          edition.status === EPaperStatus.PendingApproval ? 'bg-yellow-100 text-yellow-800' :
                          edition.status === EPaperStatus.Scheduled ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {edition.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {edition.scheduledPublishDate ? new Date(edition.scheduledPublishDate).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {edition.createdBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {edition.lastModified}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Edit Button */}
                        {(edition.status === EPaperStatus.Draft || edition.status === EPaperStatus.Scheduled || (currentUser.role === UserRole.Admin && edition.status === EPaperStatus.PendingApproval)) && (
                          <Button
                            onClick={() => onLoadEdition(edition.id)}
                            variant="primary"
                            small
                            className="mr-2"
                          >
                            Edit
                          </Button>
                        )}
                        {/* View Button (for published) */}
                        {edition.status === EPaperStatus.Published && (
                          <Button
                            onClick={() => onLoadEdition(edition.id)} // Loads in editor (read-only not implemented yet)
                            variant="secondary"
                            small
                            className="mr-2"
                          >
                            View
                          </Button>
                        )}
                        {/* Approve Button (Admin only, for pending) */}
                        {currentUser.role === UserRole.Admin && edition.status === EPaperStatus.PendingApproval && (
                          <Button
                            onClick={() => onApproveEdition(edition.id)}
                            variant="primary"
                            small
                            className="mr-2 bg-green-600 hover:bg-green-700 focus:ring-green-500"
                          >
                            Approve
                          </Button>
                        )}
                        {/* Publish Button (Admin only, for drafts or scheduled) */}
                        {currentUser.role === UserRole.Admin && (edition.status === EPaperStatus.Draft || edition.status === EPaperStatus.Scheduled) && (
                          <Button
                            onClick={() => {
                              onLoadEdition(edition.id); // Load to ensure context is correct
                              setTimeout(() => onPublishEdition(), 0); // Then publish. Timeout to allow state update.
                            }}
                            variant="primary"
                            small
                          >
                            Publish
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};