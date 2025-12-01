import React, { useState } from 'react';
import { Button } from './Button';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (email: string, role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Editor);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    // Simulate authentication
    // In a real app, you'd send these credentials to a backend API
    if (email === 'admin@example.com' && password === 'adminpass' && selectedRole === UserRole.Admin) {
      onLogin(email, UserRole.Admin);
    } else if (email === 'editor@example.com' && password === 'editorpass' && selectedRole === UserRole.Editor) {
      onLogin(email, UserRole.Editor);
    } else if (email === 'admin@example.com' && password === 'adminpass' && selectedRole === UserRole.Editor) {
      setError('Invalid role for these credentials. Try logging in as Admin.');
    } else if (email === 'editor@example.com' && password === 'editorpass' && selectedRole === UserRole.Admin) {
      setError('Invalid role for these credentials. Try logging in as Editor.');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-900 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          E-Paper Editor Login
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., editor@example.com"
              aria-label="Email address"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              aria-label="Password"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Login as
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              aria-label="Select login role"
            >
              <option value={UserRole.Editor}>Editor (editor@example.com / editorpass)</option>
              <option value={UserRole.Admin}>Admin (admin@example.com / adminpass)</option>
            </select>
          </div>
          <Button type="submit" variant="primary" className="w-full py-3">
            Login
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          For demonstration:
          <br/>
          Editor: editor@example.com / editorpass
          <br/>
          Admin: admin@example.com / adminpass
        </p>
      </div>
    </div>
  );
};