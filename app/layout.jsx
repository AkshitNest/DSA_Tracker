import { Suspense } from 'react';
import { Auth0Provider } from '@auth0/nextjs-auth0';
import Navbar from '../components/Navbar';
import BackgroundWrapper from '../components/BackgroundWrapper';
import Loader from '../components/Loader';
import SmoothScrollWrapper from '../components/SmoothScrollWrapper';
import './globals.css';

export const metadata = {
  title: {
    default: 'DSA Tracker — Master Data Structures & Algorithms',
    template: '%s | DSA Tracker',
  },
    description: 'The ultimate DSA revision tracker for competitive programmers and software engineers. Sync LeetCode, CodeChef, GFG & more. Browse 700+ company-wise interview questions.',
    keywords: ['DSA Tracker', 'LeetCode tracker', 'competitive programming', 'data structures algorithms', 'interview preparation', 'spaced repetition DSA', 'company wise leetcode questions'],
    authors: [{ name: 'DSA Tracker' }],
    creator: 'DSA Tracker',
    metadataBase: new URL('https://dsa-tracker-five-wine.vercel.app'),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'DSA Tracker — Master Data Structures & Algorithms',
      description: 'Track your DSA revisions using spaced repetition. Sync your LeetCode, CodeChef, and GFG profiles. Prepare with 700+ company-wise interview questions.',
      url: 'https://dsa-tracker-five-wine.vercel.app',
      siteName: 'DSA Tracker',
      images: [{ url: '/logo.png', width: 1024, height: 1024, alt: 'DSA Tracker Logo' }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'DSA Tracker — Master Data Structures & Algorithms',
      description: 'Track your DSA revisions. Sync multi-platform profiles. 700+ company-wise interview questions.',
      images: ['/logo.png'],
    },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': 'DSA Tracker',
          'url': 'https://dsa-tracker-five-wine.vercel.app',
          'description': 'The ultimate DSA revision tracker with multi-platform sync (LeetCode, CodeChef, GFG). Master algorithms with spaced repetition.',
          'applicationCategory': 'EducationalApplication',
          'operatingSystem': 'Web',
          'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'INR' },
          'featureList': [
            'LeetCode Profile Sync',
            'Spaced Repetition Tracking',
            'Company-wise DSA Questions',
            'Global Leaderboard',
            'Interactive Heatmap'
          ]
        }) }} />
      </head>
      <body className="dark-mode" suppressHydrationWarning>
        <Auth0Provider>
          <div id="app">
            <Suspense fallback={null}>
              <SmoothScrollWrapper />
              <BackgroundWrapper />
              <Loader />
              <Navbar />
            </Suspense>
            <main>
              <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>}>
                {children}
              </Suspense>
            </main>
          </div>
        </Auth0Provider>
      </body>
    </html>
  );
}
