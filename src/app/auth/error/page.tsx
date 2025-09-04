// OAuth Error Page
// PrismForge AI - Authentication Error Handler

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'missing_parameters':
        return 'Missing required authentication parameters. Please try signing in again.';
      case 'invalid_state':
        return 'Invalid authentication state. This may be due to an expired session or security issue.';
      case 'oauth_init_failed':
        return 'Failed to initialize OAuth authentication. Please check your configuration.';
      case 'oauth_callback_failed':
        return 'OAuth authentication callback failed. Please try again.';
      case 'microsoft_callback_failed':
        return 'Microsoft SSO authentication failed. Please try again.';
      case 'microsoft_init_failed':
        return 'Failed to initialize Microsoft SSO. Please check your configuration.';
      default:
        return 'An authentication error occurred. Please try signing in again.';
    }
  };
  
  const getErrorTitle = (errorCode: string | null) => {
    switch (errorCode) {
      case 'missing_parameters':
      case 'invalid_state':
        return 'Authentication Error';
      case 'oauth_init_failed':
      case 'oauth_callback_failed':
        return 'OAuth Error';
      case 'microsoft_callback_failed':
      case 'microsoft_init_failed':
        return 'Microsoft SSO Error';
      default:
        return 'Authentication Failed';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
              {getErrorTitle(error)}
            </h2>
            
            <p className="mt-4 text-sm text-gray-600">
              {getErrorMessage(error)}
            </p>
            
            {error && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <p className="text-xs text-gray-500">
                  Error Code: <code className="font-mono">{error}</code>
                </p>
              </div>
            )}
            
            <div className="mt-8 space-y-4">
              <Link
                href="/api/auth/google"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Google OAuth Again
              </Link>
              
              <Link
                href="/api/auth/microsoft"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Try Microsoft SSO Again
              </Link>
              
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}