import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'TailorCV — Job-ready in 60 seconds',
  description:
    'Free ATS score checker + AI resume rewriter for Indian job seekers. Optimised for Naukri, LinkedIn, Taleo, Darwinbox, Keka.',
  keywords: ['ATS resume', 'Naukri resume', 'resume rewriter India', 'ATS score checker'],
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
