import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TailorCV — Job-ready in 60 seconds',
  description:
    'Free ATS score checker + AI resume rewriter for Indian job seekers. Optimised for Naukri, LinkedIn, Taleo, Darwinbox, Keka.',
  keywords: ['ATS resume', 'Naukri resume', 'resume rewriter India', 'ATS score checker'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
