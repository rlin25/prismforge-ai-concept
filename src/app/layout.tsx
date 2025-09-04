import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PrismForge AI - Enterprise M&A Validation Platform',
  description: 'Professional multi-agent M&A validation platform for corporate development teams, boutique consulting firms, and investment professionals.',
  keywords: ['M&A', 'due diligence', 'validation', 'enterprise', 'AI', 'professional'],
  authors: [{ name: 'PrismForge AI' }],
  creator: 'PrismForge AI',
  publisher: 'PrismForge AI',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0070f3',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'PrismForge AI',
    title: 'PrismForge AI - Enterprise M&A Validation Platform',
    description: 'Professional multi-agent M&A validation platform delivering expert-quality analysis with transparent methodology.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PrismForge AI - Professional M&A Validation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrismForge AI - Enterprise M&A Validation Platform',
    description: 'Professional multi-agent M&A validation platform delivering expert-quality analysis.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-full">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}