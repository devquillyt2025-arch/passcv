import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'FolioX — Resumes that open doors.',
  description:
    'AI-powered resume builder. Get an ATS score, Claude-rewritten resume, and DOCX ready to send — in seconds.',
  keywords: ['ATS resume', 'resume builder', 'AI resume rewriter', 'ATS score checker'],
  icons: {
    icon: '/foliox-logo.png',
    apple: '/foliox-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
<body className="font-sans antialiased text-[#e2e8f0] dark:bg-[#0A0A0F] bg-gray-50 transition-colors duration-200">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
