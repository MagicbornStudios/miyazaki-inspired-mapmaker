import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

import { SiteFooter } from '../components/site-footer';
import { SiteHeader } from '../components/site-header';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Cars and Magic',
  description: 'A ritual drag racing card game about sequencing spells and outmaneuvering rivals.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
          <SiteHeader />
          <main className="flex-1 py-10">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
