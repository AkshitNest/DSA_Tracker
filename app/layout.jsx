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
  description: 'The ultimate DSA revision tracker for competitive programmers and software engineers. Sync LeetCode, Codeforces, CodeChef, GFG & more. Browse 700+ company-wise interview questions.',
  keywords: ['DSA Tracker', 'LeetCode tracker', 'competitive programming', 'data structures algorithms', 'interview preparation', 'spaced repetition DSA', 'company wise leetcode questions', 'Codeforces profile tracker'],
  authors: [{ name: 'DSA Tracker' }],
  creator: 'DSA Tracker',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'DSA Tracker — Master Data Structures & Algorithms',
    description: 'Track your DSA revisions using spaced repetition. Sync your LeetCode, Codeforces, CodeChef, GFG profiles and prepare with 700+ company-wise interview questions.',
    url: 'http://localhost:3000',
    siteName: 'DSA Tracker',
    images: [{ url: '/logo.png', width: 1024, height: 1024, alt: 'DSA Tracker Logo' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DSA Tracker — Master Data Structures & Algorithms',
    description: 'Track your DSA revisions. Sync LeetCode, Codeforces, CodeChef & more. 700+ company-wise interview questions.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
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
        <meta name="theme-color" content="#000000" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': 'DSA Tracker',
          'url': 'http://localhost:3000',
          'description': 'Track and revise your Data Structures and Algorithms questions with spaced repetition. Sync multi-platform competitive programming profiles.',
          'applicationCategory': 'EducationalApplication',
          'operatingSystem': 'Web',
          'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'INR' },
        }) }} />
      </head>
      <body className="dark-mode" suppressHydrationWarning>
        <Auth0Provider>
          <div id="app">
            <SmoothScrollWrapper />
            <BackgroundWrapper />
            <Loader />
            <Navbar />
            <main>
              {children}
            </main>
          </div>
        </Auth0Provider>
      </body>
    </html>
  );
}
