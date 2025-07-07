import React from 'react';

interface AuthErrorDisplayProps {
  error: string;
}

const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({ error }) => {
  const isNetworkError = error.includes('network') || error.includes('fetch');
  const isInvalidCredentials = error.includes('email') || error.includes('password');
  
  return (
    <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded">
      <div className="text-red-600 font-medium">{error}</div>
      {isInvalidCredentials && (
        <div className="mt-2 text-sm text-red-500">
          Forgot password? <a href="/reset-password" className="underline">Reset it here</a>
        </div>
      )}
      {isNetworkError && (
        <div className="mt-2 text-sm text-red-500">
          Please check your internet connection and try again
        </div>
      )}
    </div>
  );
};

export default AuthErrorDisplay;