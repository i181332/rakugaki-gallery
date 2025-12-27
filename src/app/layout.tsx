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
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;800&family=Noto+Serif+JP:wght@400;700&display=swap"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
