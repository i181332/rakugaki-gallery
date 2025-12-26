// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Rakugaki Gallery | 落書き美術館',
  description:
    'あなたの落書きを世界的美術評論家が大真面目に評価。AIがパロディ評論と価格を生成します。',
  keywords: ['落書き', 'AI', '美術評論', 'Gemini', '面白い', 'ジェネレーター'],
  authors: [{ name: 'Yuta Matsuo' }],
  openGraph: {
    title: 'Rakugaki Gallery | 落書き美術館',
    description:
      'あなたの落書きを世界的美術評論家が大真面目に評価。AIがパロディ評論と価格を生成します。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rakugaki Gallery | 落書き美術館',
    description: 'あなたの落書きを世界的美術評論家が大真面目に評価',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
