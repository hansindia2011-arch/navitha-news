import React, { useContext } from 'react';
import { UserContext } from '../App';
import { Button } from './Button';

interface HeaderProps {
  currentPage?: 'login' | 'dashboard' | 'editor' | 'preview';
}

export const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    throw new Error('Header must be used within a UserContext.Provider');
  }

  const { currentUser, handleLogout, setCurrentPage } = userContext;

  const handleGoToDashboard = () => {
    setCurrentPage('dashboard');
  };

  return (
    <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 shadow-lg sticky top-0 z-10 print:hidden">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          📰 E-Paper Editor 
          {currentUser && <span className="text-blue-200 text-lg ml-2">({currentUser.role})</span>}
        </h1>
        <nav className="flex items-center space-x-4">
          {currentUser && currentPage !== 'dashboard' && (
            <Button onClick={handleGoToDashboard} variant="secondary" small className="bg-blue-500 hover:bg-blue-600 text-white border-blue-400 hover:border-blue-500">
              Dashboard
            </Button>
          )}
          {currentUser && (
            <Button onClick={handleLogout} variant="secondary" small className="bg-blue-500 hover:bg-blue-600 text-white border-blue-400 hover:border-blue-500">
              Logout
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};