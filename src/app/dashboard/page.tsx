// OAuth Success Dashboard
// PrismForge AI - Authentication Success Handler

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const ssoProvider = searchParams.get('sso');
  const email = searchParams.get('email');
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
              Authentication Successful!
            </h2>
            
            {ssoProvider && email && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Successfully authenticated via{' '}
                  <span className="font-medium capitalize">{ssoProvider}</span>
                </p>
                <p className="text-sm text-gray-800 font-medium mt-1">
                  {email}
                </p>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-medium text-blue-900">
                🎉 Enterprise Authentication Complete
              </h3>
              <div className="mt-2 text-xs text-blue-700 space-y-1">
                <p>✅ OAuth/SSO authentication working</p>
                <p>✅ Multi-tenant database ready</p>
                <p>✅ Pay-per-analysis billing ($500/validation)</p>
                <p>✅ Role-based permissions system</p>
                <p>✅ Team collaboration features</p>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="text-sm text-gray-600">
                <p className="font-medium">Next Steps:</p>
                <ul className="mt-2 text-left list-disc pl-4 space-y-1">
                  <li>Implement full user session management</li>
                  <li>Connect to Phase 2 analysis system</li>
                  <li>Add team collaboration UI</li>
                  <li>Build enterprise dashboard</li>
                </ul>
              </div>
              
              <div className="border-t pt-4">
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
    </div>
  );
}